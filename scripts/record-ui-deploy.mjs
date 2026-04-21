import fs from "node:fs/promises";
import path from "node:path";

import { computeUiFingerprint, uiDeployEvidencePath } from "./ui-policy-lib.mjs";

function parseArg(name) {
  const raw = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!raw) return "";
  return raw.slice(name.length + 3).trim();
}

function parseJsonWithFallback(rawText) {
  try {
    return JSON.parse(rawText);
  } catch {
    const lines = rawText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i -= 1) {
      try {
        return JSON.parse(lines[i]);
      } catch {
        continue;
      }
    }
    throw new Error("Could not parse deploy summary JSON.");
  }
}

async function readSummary(summaryPath) {
  if (!summaryPath) return {};
  if (summaryPath === "-") {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString("utf8").trim();
    if (!raw) return {};
    return parseJsonWithFallback(raw);
  }

  const absolute = path.resolve(process.cwd(), summaryPath);
  const raw = await fs.readFile(absolute, "utf8");
  return parseJsonWithFallback(raw);
}

function requireField(value, fieldName) {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    throw new Error(`Missing required ${fieldName}.`);
  }
  return trimmed;
}

function buildCardLine({
  url,
  manifestId,
  archiveUrl,
  archiveId,
  title,
  description
}) {
  const card = {
    url,
    manifestId,
    archiveUrl,
    archiveId
  };
  if (title) card.title = title;
  if (description) card.description = description;
  return `PERMAWEB_APP ${JSON.stringify(card)}`;
}

async function main() {
  const summaryPath = requireField(parseArg("summary"), "--summary");
  const summary = await readSummary(summaryPath);

  const appUrl = requireField(summary.appUrl, "summary.appUrl");
  const manifestId = requireField(summary.manifestId, "summary.manifestId");
  const archiveUrl = requireField(summary.archiveUrl, "summary.archiveUrl");
  const archiveId = requireField(summary.archiveId, "summary.archiveId");

  const title = (parseArg("title") || summary.title || "").trim();
  const description = (parseArg("description") || summary.description || "").trim();
  const { sourceHash, fileCount, trackedRoots } = await computeUiFingerprint();

  if (!fileCount) {
    console.error(
      "No tracked UI files were found from data/ui-policy.json sourceRoots. Update policy or sourceRoots first."
    );
    process.exit(1);
  }

  const cardLine = buildCardLine({
    url: appUrl,
    manifestId,
    archiveUrl,
    archiveId,
    title,
    description
  });

  const evidence = {
    timestamp: new Date().toISOString(),
    appUrl,
    manifestId,
    archiveUrl,
    archiveId,
    title,
    description,
    sourceHash,
    sourceFileCount: fileCount,
    trackedRoots,
    cardLine
  };

  await fs.mkdir(path.dirname(uiDeployEvidencePath), { recursive: true });
  await fs.writeFile(uiDeployEvidencePath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");

  console.log(`Recorded UI deploy evidence: ${uiDeployEvidencePath}`);
  console.log(`Tracked UI files: ${fileCount}`);
  console.log(cardLine);
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});

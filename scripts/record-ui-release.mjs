import fs from "node:fs/promises";
import path from "node:path";

import { computeUiFingerprint, uiReleaseEvidencePath } from "./ui-policy-lib.mjs";

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
    throw new Error("Could not parse release summary JSON.");
  }
}

async function readSummary(summaryPath) {
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

function requireString(value, fieldName) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    throw new Error(`Missing required ${fieldName}.`);
  }
  return trimmed;
}

function optionalString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

async function main() {
  const summaryPath = requireString(parseArg("summary"), "--summary");
  const summary = await readSummary(summaryPath);
  const appUrl = requireString(summary.appUrl, "summary.appUrl");
  const manifestId = requireString(summary.manifestId, "summary.manifestId");
  const { sourceHash, fileCount, trackedRoots } = await computeUiFingerprint();

  if (!fileCount) {
    throw new Error(
      "No tracked UI files were found from data/ui-policy.json sourceRoots. Update the policy or source roots first."
    );
  }

  const evidence = {
    timestamp: new Date().toISOString(),
    appUrl,
    manifestId,
    sourceHash,
    sourceFileCount: fileCount,
    trackedRoots
  };

  const optionalFields = {
    title: optionalString(parseArg("title") || summary.title),
    description: optionalString(parseArg("description") || summary.description),
    name: optionalString(summary.name),
    referenceId: optionalString(summary.referenceId),
    uploader: optionalString(summary.uploader)
  };

  for (const [key, value] of Object.entries(optionalFields)) {
    if (value) evidence[key] = value;
  }

  if (Array.isArray(summary.transactionIds)) {
    const transactionIds = summary.transactionIds
      .map(optionalString)
      .filter(Boolean);
    if (transactionIds.length) evidence.transactionIds = transactionIds;
  }

  await fs.mkdir(path.dirname(uiReleaseEvidencePath), { recursive: true });
  await fs.writeFile(
    uiReleaseEvidencePath,
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8"
  );

  console.log(`Recorded UI release evidence: ${uiReleaseEvidencePath}`);
  console.log(JSON.stringify(evidence));
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});

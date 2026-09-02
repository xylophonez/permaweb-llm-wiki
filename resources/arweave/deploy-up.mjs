import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import process from "node:process";

import { createData } from "arbundles";

const GATEWAY_URL = process.env.GATEWAY_URL || "https://arweave.net";
const UPLOADER_URL = process.env.UPLOADER_URL || "https://up.arweave.net";
const APP_DIST = resolve(process.env.APP_DIST || "./dist");
const APP_NAME = process.env.APP_NAME || "example-app";
const APP_VERSION = process.env.APP_VERSION || "0.1.0";

function parseArgs() {
  const out = { walletPath: "", distPath: APP_DIST };
  const args = process.argv.slice(2);

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--wallet" && args[i + 1]) {
      out.walletPath = resolve(args[i + 1]);
      i += 1;
      continue;
    }
    if (args[i] === "--dist" && args[i + 1]) {
      out.distPath = resolve(args[i + 1]);
      i += 1;
    }
  }

  if (!out.walletPath && process.env.ARWEAVE_WALLET) {
    out.walletPath = resolve(process.env.ARWEAVE_WALLET);
  }

  if (!out.walletPath) {
    throw new Error("Select a signer with --wallet or ARWEAVE_WALLET.");
  }

  return out;
}

function contentTypeFor(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".html")) return "text/html";
  if (lower.endsWith(".js")) return "application/javascript";
  if (lower.endsWith(".css")) return "text/css";
  if (lower.endsWith(".json")) return "application/json";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".woff2")) return "font/woff2";
  if (lower.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

async function collectFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files.sort();
}

async function uploadDataItem(buffer, jwk, tags) {
  const dataItem = createData(buffer, jwk, { tags });
  await dataItem.sign(jwk);

  const response = await fetch(UPLOADER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: Buffer.from(dataItem.getRaw())
  });

  if (!response.ok) {
    throw new Error(`upload failed: ${response.status} ${await response.text()}`);
  }

  const bodyText = (await response.text()).trim();

  try {
    const parsed = JSON.parse(bodyText);
    return parsed.id || parsed.Id || bodyText;
  } catch {
    return bodyText;
  }
}

function sharedTags(extra = []) {
  return [
    { name: "App-Name", value: APP_NAME },
    { name: "App-Version", value: APP_VERSION },
    ...extra
  ];
}

async function main() {
  const { walletPath, distPath } = parseArgs();
  const jwk = JSON.parse(await readFile(walletPath, "utf8"));
  const files = await collectFiles(distPath);

  if (!files.length) {
    throw new Error(`No static files found in ${distPath}.`);
  }

  const manifest = {
    manifest: "arweave/paths",
    version: "0.2.0",
    index: { path: "index.html" },
    paths: {}
  };

  for (const fullPath of files) {
    const relPath = relative(distPath, fullPath).replaceAll("\\", "/");
    const id = await uploadDataItem(
      await readFile(fullPath),
      jwk,
      sharedTags([
        { name: "Content-Type", value: contentTypeFor(fullPath) },
        { name: "Type", value: "asset" }
      ])
    );

    manifest.paths[relPath] = { id };
  }

  if (!manifest.paths["index.html"]) {
    throw new Error("Static output must contain index.html.");
  }

  if (manifest.paths["404.html"]) {
    manifest.fallback = { id: manifest.paths["404.html"].id };
  }

  const manifestId = await uploadDataItem(
    Buffer.from(JSON.stringify(manifest, null, 2)),
    jwk,
    sharedTags([
      { name: "Content-Type", value: "application/x.arweave-manifest+json" },
      { name: "Type", value: "manifest" }
    ])
  );

  console.log(
    JSON.stringify(
      {
        manifestId,
        appUrl: `${GATEWAY_URL}/${manifestId}`,
        uploader: UPLOADER_URL
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

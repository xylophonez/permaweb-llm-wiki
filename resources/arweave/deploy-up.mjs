import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

import Arweave from "arweave";
import { createData } from "arbundles";

const GATEWAY_URL = process.env.GATEWAY_URL || "https://arweave.net";
const UPLOADER_URL = process.env.UPLOADER_URL || "https://up.arweave.net";
const APP_DIST = resolve(process.env.APP_DIST || "./dist");
const APP_ROOT = resolve(process.env.APP_ROOT || ".");
const APP_NAME = process.env.APP_NAME || "example-app";
const APP_VERSION = process.env.APP_VERSION || "0.1.0";
const FORKED_FROM = process.env.FORKED_FROM || "";

function parseArgs() {
  const out = { walletPath: "", distPath: APP_DIST, appRoot: APP_ROOT };
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
      continue;
    }
    if (args[i] === "--app-root" && args[i + 1]) {
      out.appRoot = resolve(args[i + 1]);
      i += 1;
    }
  }

  if (!out.walletPath && process.env.ARWEAVE_WALLET) {
    out.walletPath = resolve(process.env.ARWEAVE_WALLET);
  }

  if (!out.walletPath) {
    out.walletPath = resolve(out.appRoot, "wallet.json");
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
  const out = [];

  for (const entry of entries) {
    const fullPath = join(root, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(fullPath)));
    } else if (entry.isFile()) {
      out.push(fullPath);
    }
  }

  return out.sort();
}

function createArchive(appRoot, destinationPath) {
  const result = spawnSync(
    "tar",
    [
      "-czf",
      destinationPath,
      "--exclude",
      "wallet.json",
      "--exclude",
      "node_modules",
      "-C",
      appRoot,
      "."
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    throw new Error("failed to create source archive");
  }
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
  const tags = [
    { name: "App-Name", value: APP_NAME },
    { name: "App-Version", value: APP_VERSION }
  ];

  if (FORKED_FROM) {
    tags.push({ name: "forked-from", value: FORKED_FROM });
  }

  return [...tags, ...extra];
}

async function main() {
  const { walletPath, distPath, appRoot } = parseArgs();
  const jwk = JSON.parse(await readFile(walletPath, "utf8"));
  const arweave = Arweave.init({ host: "arweave.net", port: 443, protocol: "https" });
  const walletAddress = await arweave.wallets.jwkToAddress(jwk);
  const tmpPath = await mkdtemp(join(tmpdir(), "permaweb-deploy-up-"));
  const archivePath = join(tmpPath, "code.tar.gz");

  try {
    createArchive(appRoot, archivePath);

    const archiveId = await uploadDataItem(
      await readFile(archivePath),
      jwk,
      sharedTags([
        { name: "Content-Type", value: "application/gzip" },
        { name: "Type", value: "code" },
        { name: "Code-Archive", value: "true" }
      ])
    );

    const files = await collectFiles(distPath);
    const manifest = {
      manifest: "arweave/paths",
      version: "0.1.0",
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
          { name: "Type", value: "asset" },
          { name: "code", value: archiveId }
        ])
      );

      manifest.paths[relPath] = { id };
    }

    const manifestId = await uploadDataItem(
      Buffer.from(JSON.stringify(manifest, null, 2)),
      jwk,
      sharedTags([
        { name: "Content-Type", value: "application/x.arweave-manifest+json" },
        { name: "Type", value: "manifest" },
        { name: "Code-Archive", value: archiveId }
      ])
    );

    console.log(
      JSON.stringify(
        {
          owner: walletAddress,
          archiveId,
          manifestId,
          appUrl: `${GATEWAY_URL}/${manifestId}`,
          archiveUrl: `${GATEWAY_URL}/${archiveId}`
        },
        null,
        2
      )
    );
  } finally {
    await rm(tmpPath, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});

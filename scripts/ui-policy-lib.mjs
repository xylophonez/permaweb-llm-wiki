import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

export const root = process.cwd();
export const uiPolicyPath = path.join(root, "data", "ui-policy.json");
export const uiReleaseEvidencePath = path.join(root, "data", "last-ui-release.json");

const DEFAULT_SOURCE_ROOTS = [
  "ui",
  "web",
  "frontend",
  "client",
  "site",
  "app",
  "src",
  "public",
  "index.html",
  "styles.css"
];

const DEFAULT_EXCLUDED_DIRS = ["node_modules", "dist", ".git", "runs"];
const DEFAULT_EXCLUDED_FILES = [
  "wallet.json",
  ".agents-ack.json",
  "data/last-ui-release.json"
];

function normalizeRelative(inputPath) {
  return inputPath.replaceAll("\\", "/");
}

export async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function sha256(bufferOrText) {
  return createHash("sha256").update(bufferOrText).digest("hex");
}

function normalizeStringList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

export async function loadUiPolicy() {
  const base = {
    sourceRoots: DEFAULT_SOURCE_ROOTS,
    excludeDirs: DEFAULT_EXCLUDED_DIRS,
    excludeFiles: DEFAULT_EXCLUDED_FILES
  };

  if (!(await pathExists(uiPolicyPath))) {
    return base;
  }

  const raw = await fs.readFile(uiPolicyPath, "utf8");
  const parsed = JSON.parse(raw);

  const sourceRoots = normalizeStringList(parsed?.sourceRoots);
  const excludeDirs = normalizeStringList(parsed?.excludeDirs);
  const excludeFiles = normalizeStringList(parsed?.excludeFiles);

  return {
    sourceRoots: sourceRoots.length ? sourceRoots : base.sourceRoots,
    excludeDirs: excludeDirs.length ? excludeDirs : base.excludeDirs,
    excludeFiles: excludeFiles.length ? excludeFiles : base.excludeFiles
  };
}

function shouldIncludeFile(relativePath, policy) {
  const normalized = normalizeRelative(relativePath);

  if (policy.excludeFiles.includes(normalized)) {
    return false;
  }

  const segments = normalized.split("/").filter(Boolean);
  if (segments.some((segment) => policy.excludeDirs.includes(segment))) {
    return false;
  }

  return true;
}

async function collectFilesFromPath(absolutePath, policy, filesOut) {
  const stats = await fs.stat(absolutePath);
  const relativePath = normalizeRelative(path.relative(root, absolutePath));

  if (stats.isFile()) {
    if (shouldIncludeFile(relativePath, policy)) {
      filesOut.push({ absolutePath, relativePath });
    }
    return;
  }

  if (!stats.isDirectory()) {
    return;
  }

  const entries = await fs.readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && policy.excludeDirs.includes(entry.name)) {
      continue;
    }
    await collectFilesFromPath(path.join(absolutePath, entry.name), policy, filesOut);
  }
}

export async function listTrackedUiFiles(policy) {
  const files = [];
  const trackedRoots = [];

  for (const sourceRoot of policy.sourceRoots) {
    const absolute = path.resolve(root, sourceRoot);
    if (!(await pathExists(absolute))) {
      continue;
    }
    trackedRoots.push(sourceRoot);
    await collectFilesFromPath(absolute, policy, files);
  }

  files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  return {
    trackedRoots,
    files
  };
}

export async function computeUiFingerprint() {
  const policy = await loadUiPolicy();
  const { trackedRoots, files } = await listTrackedUiFiles(policy);
  const digest = createHash("sha256");
  let latestMtimeMs = 0;

  for (const file of files) {
    const [content, stats] = await Promise.all([
      fs.readFile(file.absolutePath),
      fs.stat(file.absolutePath)
    ]);
    const fileHash = sha256(content);
    digest.update(file.relativePath);
    digest.update("\n");
    digest.update(fileHash);
    digest.update("\n");
    if (stats.mtimeMs > latestMtimeMs) {
      latestMtimeMs = stats.mtimeMs;
    }
  }

  return {
    sourceHash: files.length ? digest.digest("hex") : "",
    fileCount: files.length,
    latestMtimeMs,
    trackedRoots,
    policy
  };
}

export async function readUiReleaseEvidence() {
  const raw = await fs.readFile(uiReleaseEvidencePath, "utf8");
  return JSON.parse(raw);
}

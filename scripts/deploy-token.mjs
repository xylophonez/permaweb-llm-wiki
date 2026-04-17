import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const DEFAULT_AO_URLS = [
  "https://push-1.forward.computer",
  "https://push-2.forward.computer"
];
const DEFAULT_AO_SCHEDULER = "n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo";
const DEFAULT_AO_MODULE_ID = "ISShJH1ij-hPPt9St5UFFr_8Ys3Kj5cyg7zrMGt7H9s";
const DEFAULT_WALLET_PATH = "./wallet.json";

const runLog = {
  startedAt: new Date().toISOString(),
  env: {},
  preflight: { endpoints: [] },
  attempts: [],
  steps: [],
  status: "running"
};

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { outPath: "./runs/token-latest.json" };

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    const next = args[i + 1];

    if (current === "--out" && next) {
      out.outPath = next;
      i += 1;
    }
  }

  return out;
}

function parseCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function unique(values) {
  const seen = new Set();
  const out = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

function nowIso() {
  return new Date().toISOString();
}

function cleanEnv(value, fallback) {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  const lower = raw.toLowerCase();
  if (lower === "undefined" || lower === "null") return fallback;
  return raw;
}

function assertOrThrow(condition, message) {
  if (!condition) throw new Error(message);
}

function firstMessage(result) {
  return result?.Messages?.[0] || null;
}

function readTagValue(message, key) {
  const tags = message?.Tags || [];
  const needle = String(key).toLowerCase();
  for (const tag of tags) {
    if (String(tag?.name || "").toLowerCase() === needle) return String(tag?.value ?? "");
  }
  return "";
}

function parseBalance(result) {
  const msg = firstMessage(result);
  const fromData = msg?.Data ? String(msg.Data).trim() : "";
  const fromBalance = msg?.Balance ? String(msg.Balance).trim() : "";
  const fromTag = readTagValue(msg, "Balance").trim();
  const raw = fromBalance || fromData || fromTag;
  if (!raw) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function parseInfo(result) {
  const msg = firstMessage(result) || {};
  let parsedData = null;

  if (typeof msg.Data === "string" && msg.Data.trim()) {
    try {
      parsedData = JSON.parse(msg.Data);
    } catch {
      parsedData = null;
    }
  }

  return {
    name: String(msg.name || msg.Name || parsedData?.name || parsedData?.Name || "").trim(),
    ticker: String(msg.ticker || msg.Ticker || parsedData?.ticker || parsedData?.Ticker || "").trim(),
    logo: String(msg.logo || msg.Logo || parsedData?.logo || parsedData?.Logo || "").trim(),
    denomination: String(
      msg.denomination || msg.Denomination || parsedData?.denomination || parsedData?.Denomination || ""
    ).trim(),
    supply: String(msg.supply || msg.Supply || parsedData?.supply || parsedData?.Supply || "").trim()
  };
}

function padBase64(value) {
  const missing = value.length % 4;
  if (missing === 0) return value;
  return `${value}${"=".repeat(4 - missing)}`;
}

function base64UrlToBuffer(value) {
  const normalized = padBase64(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Buffer.from(normalized, "base64");
}

function bufferToBase64Url(value) {
  return value.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function deriveAddressFromJwk(jwk) {
  if (!jwk || typeof jwk.n !== "string") {
    throw new Error("Invalid JWK: missing 'n' field");
  }
  const ownerBytes = base64UrlToBuffer(jwk.n);
  const digest = createHash("sha256").update(ownerBytes).digest();
  return bufferToBase64Url(digest);
}

async function recordStep(step) {
  runLog.steps.push({ at: nowIso(), ...step });
}

async function sleep(ms) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function probeEndpoint(url) {
  const startedAt = nowIso();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: controller.signal
    });

    return {
      url,
      startedAt,
      endedAt: nowIso(),
      ok: true,
      status: response.status
    };
  } catch (error) {
    return {
      url,
      startedAt,
      endedAt: nowIso(),
      ok: false,
      error: error?.message || String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function sendAndWait(ao, params) {
  const {
    processId,
    signer,
    action,
    tags = [],
    data = "",
    maxWaitMs = 20000,
    pollMs = 1000
  } = params;

  let messageId = "";
  let lastSendError = null;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      messageId = await ao.message({
        process: processId,
        signer,
        tags: [{ name: "Action", value: action }, ...tags],
        data
      });
      lastSendError = null;
      break;
    } catch (error) {
      lastSendError = error;
      if (attempt === 0) {
        await sleep(900);
      }
    }
  }

  if (lastSendError || !messageId) {
    throw lastSendError || new Error(`Failed to send action ${action}`);
  }

  const started = Date.now();
  let lastResult = null;

  while (Date.now() - started <= maxWaitMs) {
    lastResult = await ao.result({ process: processId, message: messageId });
    if (lastResult?.Messages?.length || lastResult?.Output) {
      return { messageId, result: lastResult };
    }
    await sleep(pollMs);
  }

  return { messageId, result: lastResult };
}

function resolveUrls() {
  const single = cleanEnv(process.env.AO_URL, "");
  const fallbackEnv = parseCsv(cleanEnv(process.env.AO_FALLBACK_URLS, ""));
  const all = single ? [single, ...fallbackEnv] : [...DEFAULT_AO_URLS, ...fallbackEnv];
  return unique(all);
}

async function runAttempt(input) {
  const { aoUrl, scheduler, moduleId, authority, walletPath, connect, createSigner } = input;

  const attempt = {
    aoUrl,
    startedAt: nowIso(),
    steps: []
  };

  function attemptStep(step, detail = null) {
    attempt.steps.push({ at: nowIso(), step, detail });
  }

  attemptStep("load-wallet", walletPath);
  const jwk = JSON.parse(await readFile(walletPath, "utf8"));
  const walletAddress = deriveAddressFromJwk(jwk);
  const signer = createSigner(jwk);
  const ao = connect({ MODE: "mainnet", URL: aoUrl, SCHEDULER: scheduler, signer });

  attemptStep("spawn", { moduleId, scheduler, authority });
  const processId = await ao.spawn({
    module: moduleId,
    scheduler,
    authority,
    signer,
    tags: [{ name: "App-Name", value: "permaweb-llm-wiki" }],
    data: `wiki-token:${Date.now()}`
  });

  const luaPath = resolve("./ao/token.lua");
  const blueprint = await readFile(luaPath, "utf8");

  attemptStep("eval-blueprint", luaPath);
  const evalResponse = await sendAndWait(ao, {
    processId,
    signer,
    action: "Eval",
    data: blueprint,
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("info");
  const infoResponse = await sendAndWait(ao, {
    processId,
    signer,
    action: "Info",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("balance-before");
  const balanceBeforeResponse = await sendAndWait(ao, {
    processId,
    signer,
    action: "Balance",
    tags: [{ name: "Recipient", value: walletAddress }],
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("claim");
  const claimResponse = await sendAndWait(ao, {
    processId,
    signer,
    action: "Claim",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("balance-after");
  const balanceAfterResponse = await sendAndWait(ao, {
    processId,
    signer,
    action: "Balance",
    tags: [{ name: "Recipient", value: walletAddress }],
    maxWaitMs: 30000,
    pollMs: 1200
  });

  const info = parseInfo(infoResponse.result);
  const beforeBalance = parseBalance(balanceBeforeResponse.result);
  const afterBalance = parseBalance(balanceAfterResponse.result);
  const denomination = Number.parseInt(info.denomination || "12", 10);
  const claimDelta = 10n ** BigInt(Number.isFinite(denomination) ? denomination : 12);

  assertOrThrow(beforeBalance !== null, "Failed to parse pre-claim balance");
  assertOrThrow(afterBalance !== null, "Failed to parse post-claim balance");
  assertOrThrow(
    afterBalance - beforeBalance === claimDelta,
    `Claim delta mismatch: expected ${claimDelta}, got ${afterBalance - beforeBalance}`
  );

  attempt.status = "ok";
  attempt.endedAt = nowIso();
  attempt.processId = processId;
  attempt.walletAddress = walletAddress;
  attempt.info = info;
  attempt.ids = {
    evalMessageId: evalResponse.messageId,
    infoMessageId: infoResponse.messageId,
    balanceBeforeMessageId: balanceBeforeResponse.messageId,
    claimMessageId: claimResponse.messageId,
    balanceAfterMessageId: balanceAfterResponse.messageId
  };
  attempt.proof = {
    beforeBalance: String(beforeBalance),
    afterBalance: String(afterBalance),
    observedDelta: String(afterBalance - beforeBalance),
    expectedDelta: String(claimDelta),
    claimNotice: firstMessage(claimResponse.result) || null
  };

  return attempt;
}

async function main() {
  const args = parseArgs();
  const scheduler = cleanEnv(process.env.AO_SCHEDULER, DEFAULT_AO_SCHEDULER);
  const moduleId = cleanEnv(process.env.AO_MODULE, DEFAULT_AO_MODULE_ID);
  const authority = cleanEnv(process.env.AO_AUTHORITY, scheduler);
  const walletPath = cleanEnv(process.env.AO_WALLET_PATH || process.env.ARWEAVE_JWK, DEFAULT_WALLET_PATH);
  const aoUrls = resolveUrls();
  const { connect, createSigner } = await import("@permaweb/aoconnect");

  runLog.env = {
    aoUrls,
    scheduler,
    moduleId,
    authority,
    walletPath,
    luaPath: "./ao/token.lua"
  };

  for (const aoUrl of aoUrls) {
    runLog.preflight.endpoints.push(await probeEndpoint(aoUrl));
  }

  let lastError = null;
  for (const aoUrl of aoUrls) {
    await recordStep({ step: "attempt-start", detail: { aoUrl } });
    try {
      const attempt = await runAttempt({
        aoUrl,
        scheduler,
        moduleId,
        authority,
        walletPath,
        connect,
        createSigner
      });
      runLog.attempts.push(attempt);
      runLog.status = "ok";
      runLog.selectedUrl = aoUrl;
      runLog.processId = attempt.processId;
      runLog.walletAddress = attempt.walletAddress;
      runLog.info = attempt.info;
      runLog.ids = attempt.ids;
      runLog.proof = attempt.proof;
      return;
    } catch (error) {
      const failedAttempt = {
        aoUrl,
        startedAt: nowIso(),
        endedAt: nowIso(),
        status: "error",
        error: {
          message: error?.message || String(error),
          stack: error?.stack || ""
        }
      };
      runLog.attempts.push(failedAttempt);
      lastError = error;
      await recordStep({ step: "attempt-failed", detail: { aoUrl, error: failedAttempt.error.message } });
    }
  }

  throw lastError || new Error("All AO URL attempts failed");
}

async function flushRunLog(outPath) {
  const absolutePath = resolve(outPath);
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, `${JSON.stringify(runLog, null, 2)}\n`, "utf8");
  return absolutePath;
}

const args = parseArgs();
main()
  .catch(async (error) => {
    runLog.status = "error";
    runLog.error = {
      message: error?.message || String(error),
      stack: error?.stack || ""
    };
    await recordStep({ step: "failed", detail: runLog.error.message });
  })
  .finally(async () => {
    const outPath = await flushRunLog(args.outPath);
    const summary = {
      status: runLog.status,
      selectedUrl: runLog.selectedUrl || null,
      processId: runLog.processId || null,
      walletAddress: runLog.walletAddress || null,
      attempts: runLog.attempts.length,
      logPath: outPath
    };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(runLog.status === "ok" ? 0 : 1);
  });

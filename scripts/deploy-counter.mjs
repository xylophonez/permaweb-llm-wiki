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
  const out = { outPath: "./runs/latest.json", processName: null };

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    const next = args[i + 1];

    if (current === "--out" && next) {
      out.outPath = next;
      i += 1;
      continue;
    }

    if (current === "--name" && next) {
      out.processName = next;
      i += 1;
      continue;
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

function tagValue(tags, name) {
  const needle = String(name || "").toLowerCase();
  for (const tag of tags || []) {
    const tagName = String(tag?.name ?? tag?.Name ?? "").toLowerCase();
    if (tagName === needle) return String(tag?.value ?? tag?.Value ?? "");
  }
  return "";
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

async function sendAndExpect(ao, params) {
  const {
    processId,
    signer,
    action,
    tags = [],
    data = "",
    expectAction = "",
    maxWaitMs = 20000,
    pollMs = 1000
  } = params;

  const messageId = await ao.message({
    process: processId,
    signer,
    tags: [{ name: "Action", value: action }, ...tags],
    data
  });

  const started = Date.now();
  let lastResult = null;
  let actionSeen = "";

  while (Date.now() - started <= maxWaitMs) {
    lastResult = await ao.result({ process: processId, message: messageId });
    actionSeen = tagValue(lastResult?.Messages?.[0]?.Tags, "Action");

    if (!expectAction) {
      return { messageId, result: lastResult, actionSeen };
    }

    if (actionSeen === expectAction) {
      return { messageId, result: lastResult, actionSeen };
    }

    await sleep(pollMs);
  }

  throw new Error(
    `Expected ${expectAction} after ${action}, got ${actionSeen || "<empty>"} (message ${messageId})`
  );
}

function resolveUrls() {
  const single = cleanEnv(process.env.AO_URL, "");
  const fallbackEnv = parseCsv(cleanEnv(process.env.AO_FALLBACK_URLS, ""));
  const all = single
    ? [single, ...fallbackEnv]
    : [...DEFAULT_AO_URLS, ...fallbackEnv];

  return unique(all);
}

async function runAttempt(input) {
  const { aoUrl, scheduler, moduleId, authority, walletPath, processName, connect, createSigner } = input;
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
  const signer = createSigner(jwk);
  const ao = connect({ MODE: "mainnet", URL: aoUrl, SCHEDULER: scheduler, signer });

  attemptStep("spawn", { moduleId, scheduler, authority });
  const processId = await ao.spawn({
    module: moduleId,
    scheduler,
    authority,
    signer,
    data: "ao-process-lab:counter-v2"
  });

  const luaPath = resolve("./ao/counter.lua");
  attemptStep("read-blueprint", luaPath);
  const blueprint = await readFile(luaPath, "utf8");

  attemptStep("eval-blueprint");
  const evalResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Eval",
    data: blueprint,
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("init-process", processName);
  const initResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Init",
    tags: [{ name: "Name", value: processName }],
    expectAction: "Init-OK",
    maxWaitMs: 40000,
    pollMs: 1200
  });

  attemptStep("increment-1", 3);
  const incrementOneResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Increment",
    tags: [{ name: "Amount", value: "3" }],
    expectAction: "Increment-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("increment-2", 2);
  const incrementTwoResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Increment",
    tags: [{ name: "Amount", value: "2" }],
    expectAction: "Increment-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("get");
  const getResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Get",
    expectAction: "Get-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  attemptStep("info");
  const infoResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Info",
    expectAction: "Info-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  const countTag = tagValue(getResponse.result?.Messages?.[0]?.Tags, "Count");
  const ownerTag = tagValue(infoResponse.result?.Messages?.[0]?.Tags, "Owner");
  const configuredTag = tagValue(infoResponse.result?.Messages?.[0]?.Tags, "Configured");

  assertOrThrow(countTag === "5", `Expected Count=5, got ${countTag || "<empty>"}`);
  assertOrThrow(configuredTag === "true", `Expected Configured=true, got ${configuredTag || "<empty>"}`);
  assertOrThrow(Boolean(ownerTag), "Expected non-empty Owner in Info result");

  attempt.status = "ok";
  attempt.endedAt = nowIso();
  attempt.processId = processId;
  attempt.ids = {
    evalMessageId: evalResponse.messageId,
    initMessageId: initResponse.messageId,
    incrementOneMessageId: incrementOneResponse.messageId,
    incrementTwoMessageId: incrementTwoResponse.messageId,
    getMessageId: getResponse.messageId,
    infoMessageId: infoResponse.messageId
  };
  attempt.validation = {
    evalAction: evalResponse.actionSeen || "",
    initAction: initResponse.actionSeen || "",
    incrementOneAction: incrementOneResponse.actionSeen || "",
    incrementTwoAction: incrementTwoResponse.actionSeen || "",
    getAction: getResponse.actionSeen || "",
    infoAction: infoResponse.actionSeen || "",
    finalCount: countTag,
    owner: ownerTag,
    configured: configuredTag
  };

  return attempt;
}

async function main() {
  const args = parseArgs();
  const scheduler = cleanEnv(process.env.AO_SCHEDULER, DEFAULT_AO_SCHEDULER);
  const moduleId = cleanEnv(process.env.AO_MODULE, DEFAULT_AO_MODULE_ID);
  const authority = cleanEnv(process.env.AO_AUTHORITY, scheduler);
  const walletPath = cleanEnv(process.env.AO_WALLET_PATH || process.env.ARWEAVE_JWK, DEFAULT_WALLET_PATH);
  const processName = cleanEnv(args.processName || process.env.AO_PROCESS_NAME, "ao-counter-lab");
  const aoUrls = resolveUrls();
  const { connect, createSigner } = await import("@permaweb/aoconnect");

  runLog.env = { aoUrls, scheduler, moduleId, authority, walletPath, processName };

  for (const aoUrl of aoUrls) {
    runLog.preflight.endpoints.push(await probeEndpoint(aoUrl));
  }

  let lastError = null;
  for (const aoUrl of aoUrls) {
    await recordStep({ step: "attempt-start", detail: { aoUrl } });
    try {
      const attempt = await runAttempt({ aoUrl, scheduler, moduleId, authority, walletPath, processName, connect, createSigner });
      runLog.attempts.push(attempt);
      runLog.status = "ok";
      runLog.selectedUrl = aoUrl;
      runLog.processId = attempt.processId;
      runLog.ids = attempt.ids;
      runLog.validation = attempt.validation;
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
      attempts: runLog.attempts.length,
      logPath: outPath
    };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(runLog.status === "ok" ? 0 : 1);
  });

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import process from "node:process";

const DEFAULT_AO_URLS = [
  "https://push-1.forward.computer",
  "https://push-2.forward.computer"
];
const DEFAULT_AO_SCHEDULER = "n_XZJhUnmldNFo4dhajoPZWhBXuJk-OcQr5JQ49c4Zo";
const DEFAULT_WALLET_PATH = "./wallet.json";

const runLog = {
  startedAt: new Date().toISOString(),
  env: {},
  preflight: { endpoints: [] },
  attempts: [],
  steps: [],
  status: "running",
  state: null
};

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

function nowIso() {
  return new Date().toISOString();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    processId: "",
    outPath: `./runs/state/task-board-state-${nowStamp()}.json`
  };

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];
    const next = args[i + 1];

    if (current === "--process" && next) {
      out.processId = next;
      i += 1;
      continue;
    }

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

function tagValue(tags, name) {
  const needle = String(name || "").toLowerCase();
  for (const tag of tags || []) {
    const tagName = String(tag?.name ?? tag?.Name ?? "").toLowerCase();
    if (tagName === needle) return String(tag?.value ?? tag?.Value ?? "");
  }
  return "";
}

function firstMessage(result) {
  return result?.Messages?.[0] || null;
}

function parseMessageData(result) {
  const raw = firstMessage(result)?.Data;
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function resolveUrls() {
  const single = cleanEnv(process.env.AO_URL, "");
  const fallbackEnv = parseCsv(cleanEnv(process.env.AO_FALLBACK_URLS, ""));
  const all = single ? [single, ...fallbackEnv] : [...DEFAULT_AO_URLS, ...fallbackEnv];
  return unique(all);
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

async function sendAndRead(ao, params) {
  const {
    processId,
    signer,
    action,
    tags = [],
    data = "",
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
    const message = firstMessage(lastResult);
    actionSeen = tagValue(message?.Tags, "Action");

    if (actionSeen || message?.Data) {
      return { messageId, result: lastResult, actionSeen };
    }

    await sleep(pollMs);
  }

  throw new Error(`Timed out waiting for ${action} result (message ${messageId})`);
}

async function sendAndExpect(ao, params) {
  const response = await sendAndRead(ao, params);
  if (response.actionSeen !== params.expectAction) {
    const messageTags = firstMessage(response.result)?.Tags;
    const errorMessage = tagValue(messageTags, "Error");
    throw new Error(errorMessage || `Expected ${params.expectAction}, got ${response.actionSeen || "<empty>"}`);
  }
  return response;
}

function parseStateFromInfo(result) {
  const tags = firstMessage(result)?.Tags;
  const infoPayload = parseMessageData(result) || {};

  return {
    Name: infoPayload.Name ?? tagValue(tags, "Name"),
    Owner: infoPayload.Owner ?? tagValue(tags, "Owner"),
    Configured:
      infoPayload.Configured ??
      (tagValue(tags, "Configured") === "true"),
    NextTaskId:
      infoPayload.NextTaskId ??
      Number(tagValue(tags, "Next-Task-Id") || "0"),
    UpdatedAt: infoPayload.UpdatedAt ?? tagValue(tags, "UpdatedAt"),
    Stats: infoPayload.Stats ?? null
  };
}

async function runAttempt(input) {
  const { aoUrl, scheduler, walletPath, processId, connect, createSigner } = input;
  const attempt = {
    aoUrl,
    processId,
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

  let stateResponse = null;
  let state = null;
  let usedFallback = false;

  attemptStep("get-state");
  try {
    stateResponse = await sendAndRead(ao, {
      processId,
      signer,
      action: "Get-State",
      maxWaitMs: 12000,
      pollMs: 1200
    });

    if (stateResponse.actionSeen === "Get-State-Result") {
      state = parseMessageData(stateResponse.result);
      attempt.ids = {
        stateMessageId: stateResponse.messageId
      };
    } else {
      throw new Error(`Expected Get-State-Result, got ${stateResponse.actionSeen || "<empty>"}`);
    }
  } catch (error) {
    usedFallback = true;
    attemptStep("get-state-fallback", error?.message || String(error));

    const infoResponse = await sendAndExpect(ao, {
      processId,
      signer,
      action: "Info",
      expectAction: "Info-Result",
      maxWaitMs: 30000,
      pollMs: 1200
    });

    const infoState = parseStateFromInfo(infoResponse.result);
    let stats = infoState.Stats;
    let tasks = [];
    const ids = {
      infoMessageId: infoResponse.messageId
    };

    if (infoState.Configured) {
      const boardStatsResponse = await sendAndExpect(ao, {
        processId,
        signer,
        action: "Board-Stats",
        expectAction: "Board-Stats-Result",
        maxWaitMs: 30000,
        pollMs: 1200
      });
      const listTasksResponse = await sendAndExpect(ao, {
        processId,
        signer,
        action: "List-Tasks",
        expectAction: "List-Tasks-Result",
        maxWaitMs: 30000,
        pollMs: 1200
      });

      stats = parseMessageData(boardStatsResponse.result) || {
        Total: Number(tagValue(firstMessage(boardStatsResponse.result)?.Tags, "Total") || "0"),
        Open: Number(tagValue(firstMessage(boardStatsResponse.result)?.Tags, "Open") || "0"),
        InProgress: Number(tagValue(firstMessage(boardStatsResponse.result)?.Tags, "In-Progress") || "0"),
        Done: Number(tagValue(firstMessage(boardStatsResponse.result)?.Tags, "Done") || "0")
      };
      tasks = parseMessageData(listTasksResponse.result) || [];

      ids.boardStatsMessageId = boardStatsResponse.messageId;
      ids.listTasksMessageId = listTasksResponse.messageId;
    } else {
      stats = stats || {
        Total: 0,
        Open: 0,
        InProgress: 0,
        Done: 0
      };
    }

    attempt.ids = ids;
    state = {
      Name: infoState.Name || "",
      Owner: infoState.Owner || "",
      Configured: Boolean(infoState.Configured),
      NextTaskId: Number(infoState.NextTaskId || 0),
      UpdatedAt: infoState.UpdatedAt || "",
      Stats: stats,
      Tasks: tasks
    };
  }

  assertOrThrow(Boolean(state), "Expected state payload");
  assertOrThrow(Array.isArray(state.Tasks), "Expected state.Tasks array");
  assertOrThrow(typeof state.Stats === "object" && state.Stats !== null, "Expected state.Stats object");

  attempt.status = "ok";
  attempt.endedAt = nowIso();
  if (!attempt.ids) {
    attempt.ids = {
      stateMessageId: stateResponse?.messageId || null
    };
  }
  attempt.validation = {
    getStateAction: stateResponse?.actionSeen || "",
    usedFallback,
    taskCount: String(state.Tasks.length),
    configured: String(Boolean(state.Configured)),
    owner: String(state.Owner || "")
  };
  attempt.state = state;

  return attempt;
}

async function main() {
  const args = parseArgs();
  assertOrThrow(Boolean(args.processId), "Missing required --process <PROCESS_ID>");

  const scheduler = cleanEnv(process.env.AO_SCHEDULER, DEFAULT_AO_SCHEDULER);
  const walletPath = cleanEnv(process.env.AO_WALLET_PATH || process.env.ARWEAVE_JWK, DEFAULT_WALLET_PATH);
  const aoUrls = resolveUrls();
  const { connect, createSigner } = await import("@permaweb/aoconnect");

  runLog.env = {
    processId: args.processId,
    aoUrls,
    scheduler,
    walletPath
  };

  for (const aoUrl of aoUrls) {
    runLog.preflight.endpoints.push(await probeEndpoint(aoUrl));
  }

  let lastError = null;
  for (const aoUrl of aoUrls) {
    await recordStep({ step: "attempt-start", detail: { aoUrl, processId: args.processId } });
    try {
      const attempt = await runAttempt({
        aoUrl,
        scheduler,
        walletPath,
        processId: args.processId,
        connect,
        createSigner
      });
      runLog.attempts.push(attempt);
      runLog.status = "ok";
      runLog.selectedUrl = aoUrl;
      runLog.processId = args.processId;
      runLog.ids = attempt.ids;
      runLog.validation = attempt.validation;
      runLog.state = attempt.state;
      return;
    } catch (error) {
      const failedAttempt = {
        aoUrl,
        processId: args.processId,
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
    if (runLog.status === "ok") {
      console.log(JSON.stringify(runLog.state, null, 2));
      process.exit(0);
    }

    console.error(
      JSON.stringify(
        {
          status: runLog.status,
          selectedUrl: runLog.selectedUrl || null,
          processId: runLog.processId || null,
          attempts: runLog.attempts.length,
          logPath: outPath,
          error: runLog.error?.message || null
        },
        null,
        2
      )
    );
    process.exit(1);
  });

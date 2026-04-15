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
  status: "running"
};

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    processId: "",
    outPath: `./runs/interactions/task-board-${nowStamp()}.json`,
    processName: null,
    assignee: null,
    title: null,
    description: null,
    priority: null
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
      continue;
    }

    if (current === "--name" && next) {
      out.processName = next;
      i += 1;
      continue;
    }

    if (current === "--assignee" && next) {
      out.assignee = next;
      i += 1;
      continue;
    }

    if (current === "--title" && next) {
      out.title = next;
      i += 1;
      continue;
    }

    if (current === "--description" && next) {
      out.description = next;
      i += 1;
      continue;
    }

    if (current === "--priority" && next) {
      out.priority = next;
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
    actionSeen = tagValue(firstMessage(lastResult)?.Tags, "Action");

    if (!expectAction || actionSeen === expectAction) {
      return { messageId, result: lastResult, actionSeen };
    }

    await sleep(pollMs);
  }

  throw new Error(
    `Expected ${expectAction} after ${action}, got ${actionSeen || "<empty>"} (message ${messageId})`
  );
}

function parseInfo(result) {
  const tags = firstMessage(result)?.Tags;
  return {
    configured: tagValue(tags, "Configured") === "true",
    owner: tagValue(tags, "Owner"),
    taskCount: Number(tagValue(tags, "Task-Count") || "0")
  };
}

function parseStats(result) {
  const tags = firstMessage(result)?.Tags;
  return {
    total: Number(tagValue(tags, "Total") || "0"),
    open: Number(tagValue(tags, "Open") || "0"),
    inProgress: Number(tagValue(tags, "In-Progress") || "0"),
    done: Number(tagValue(tags, "Done") || "0")
  };
}

async function runAttempt(input) {
  const {
    aoUrl,
    scheduler,
    walletPath,
    processId,
    processName,
    title,
    description,
    priority,
    requestedAssignee,
    connect,
    createSigner
  } = input;

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

  attemptStep("info-before");
  const infoBeforeResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Info",
    expectAction: "Info-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });

  const infoBefore = parseInfo(infoBeforeResponse.result);
  let baseStats = { total: 0, open: 0, inProgress: 0, done: 0 };

  if (infoBefore.configured) {
    attemptStep("board-stats-before");
    const boardStatsBeforeResponse = await sendAndExpect(ao, {
      processId,
      signer,
      action: "Board-Stats",
      expectAction: "Board-Stats-Result",
      maxWaitMs: 30000,
      pollMs: 1200
    });
    baseStats = parseStats(boardStatsBeforeResponse.result);
    attempt.ids = {
      infoBeforeMessageId: infoBeforeResponse.messageId,
      boardStatsBeforeMessageId: boardStatsBeforeResponse.messageId
    };
  } else {
    attempt.ids = {
      infoBeforeMessageId: infoBeforeResponse.messageId
    };
  }

  let initializedNow = false;
  let owner = infoBefore.owner;
  let initResponse = null;

  if (!infoBefore.configured) {
    attemptStep("init-process", processName);
    initResponse = await sendAndExpect(ao, {
      processId,
      signer,
      action: "Init",
      tags: [{ name: "Name", value: processName }],
      expectAction: "Init-OK",
      maxWaitMs: 40000,
      pollMs: 1200
    });
    initializedNow = true;
    owner = tagValue(firstMessage(initResponse.result)?.Tags, "Owner");
    attempt.ids.initMessageId = initResponse.messageId;
  }

  assertOrThrow(Boolean(owner), "Expected non-empty owner before mutating interactions");
  const assignee = requestedAssignee || owner;

  attemptStep("create-task");
  const createTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Create-Task",
    tags: [
      { name: "Title", value: title },
      { name: "Description", value: description },
      { name: "Priority", value: priority }
    ],
    expectAction: "Create-Task-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.createTaskMessageId = createTaskResponse.messageId;

  const taskId = tagValue(firstMessage(createTaskResponse.result)?.Tags, "Task-Id");
  assertOrThrow(Boolean(taskId), "Expected Task-Id from Create-Task");

  attemptStep("assign-task", { taskId, assignee });
  const assignTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Assign-Task",
    tags: [
      { name: "Task-Id", value: taskId },
      { name: "Assignee", value: assignee }
    ],
    expectAction: "Assign-Task-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.assignTaskMessageId = assignTaskResponse.messageId;

  attemptStep("start-task", taskId);
  const startTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Start-Task",
    tags: [{ name: "Task-Id", value: taskId }],
    expectAction: "Start-Task-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.startTaskMessageId = startTaskResponse.messageId;

  attemptStep("complete-task", taskId);
  const completeTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Complete-Task",
    tags: [{ name: "Task-Id", value: taskId }],
    expectAction: "Complete-Task-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.completeTaskMessageId = completeTaskResponse.messageId;

  attemptStep("reopen-task", taskId);
  const reopenTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Reopen-Task",
    tags: [{ name: "Task-Id", value: taskId }],
    expectAction: "Reopen-Task-OK",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.reopenTaskMessageId = reopenTaskResponse.messageId;

  attemptStep("get-task", taskId);
  const getTaskResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Get-Task",
    tags: [{ name: "Task-Id", value: taskId }],
    expectAction: "Get-Task-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.getTaskMessageId = getTaskResponse.messageId;

  attemptStep("list-tasks", { assignee });
  const listTasksResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "List-Tasks",
    tags: [
      { name: "Status", value: "open" },
      { name: "Assignee", value: assignee }
    ],
    expectAction: "List-Tasks-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.listTasksMessageId = listTasksResponse.messageId;

  attemptStep("board-stats-after");
  const boardStatsResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Board-Stats",
    expectAction: "Board-Stats-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.boardStatsMessageId = boardStatsResponse.messageId;

  attemptStep("info-after");
  const infoAfterResponse = await sendAndExpect(ao, {
    processId,
    signer,
    action: "Info",
    expectAction: "Info-Result",
    maxWaitMs: 30000,
    pollMs: 1200
  });
  attempt.ids.infoAfterMessageId = infoAfterResponse.messageId;

  const getTaskTags = firstMessage(getTaskResponse.result)?.Tags;
  const getTaskPayload = parseMessageData(getTaskResponse.result);
  const listTasksPayload = parseMessageData(listTasksResponse.result);
  const boardStats = parseStats(boardStatsResponse.result);
  const infoAfter = parseInfo(infoAfterResponse.result);

  assertOrThrow(tagValue(getTaskTags, "Status") === "open", `Expected task status=open, got ${tagValue(getTaskTags, "Status") || "<empty>"}`);
  assertOrThrow(tagValue(getTaskTags, "Assignee") === assignee, `Expected assignee=${assignee}, got ${tagValue(getTaskTags, "Assignee") || "<empty>"}`);
  assertOrThrow(getTaskPayload?.Id === taskId, `Expected Get-Task payload Id=${taskId}`);
  assertOrThrow(getTaskPayload?.Status === "open", `Expected Get-Task payload status=open, got ${getTaskPayload?.Status || "<empty>"}`);
  assertOrThrow(Array.isArray(listTasksPayload), "Expected List-Tasks payload array");
  assertOrThrow(listTasksPayload.some((task) => task?.Id === taskId), `Expected created task ${taskId} in filtered list`);
  assertOrThrow(infoAfter.configured === true, "Expected board to be configured after interactions");
  assertOrThrow(infoAfter.owner === owner, `Expected owner=${owner}, got ${infoAfter.owner || "<empty>"}`);
  assertOrThrow(infoAfter.taskCount === infoBefore.taskCount + 1, `Expected task count to increase by 1 from ${infoBefore.taskCount} to ${infoBefore.taskCount + 1}, got ${infoAfter.taskCount}`);
  assertOrThrow(boardStats.total === baseStats.total + 1, `Expected total tasks to increase by 1 from ${baseStats.total} to ${baseStats.total + 1}, got ${boardStats.total}`);
  assertOrThrow(boardStats.open === baseStats.open + 1, `Expected open tasks to increase by 1 from ${baseStats.open} to ${baseStats.open + 1}, got ${boardStats.open}`);
  assertOrThrow(boardStats.inProgress === baseStats.inProgress, `Expected in_progress tasks to remain ${baseStats.inProgress}, got ${boardStats.inProgress}`);
  assertOrThrow(boardStats.done === baseStats.done, `Expected done tasks to remain ${baseStats.done}, got ${boardStats.done}`);

  attempt.status = "ok";
  attempt.endedAt = nowIso();
  attempt.validation = {
    initializedNow,
    infoBeforeAction: infoBeforeResponse.actionSeen || "",
    initAction: initResponse?.actionSeen || "",
    createTaskAction: createTaskResponse.actionSeen || "",
    assignTaskAction: assignTaskResponse.actionSeen || "",
    startTaskAction: startTaskResponse.actionSeen || "",
    completeTaskAction: completeTaskResponse.actionSeen || "",
    reopenTaskAction: reopenTaskResponse.actionSeen || "",
    getTaskAction: getTaskResponse.actionSeen || "",
    listTasksAction: listTasksResponse.actionSeen || "",
    boardStatsAction: boardStatsResponse.actionSeen || "",
    infoAfterAction: infoAfterResponse.actionSeen || "",
    owner,
    assignee,
    taskId,
    baseTaskCount: infoBefore.taskCount,
    finalTaskCount: infoAfter.taskCount,
    baseStats,
    finalStats: boardStats
  };

  return attempt;
}

async function main() {
  const args = parseArgs();
  assertOrThrow(Boolean(args.processId), "Missing required --process <PROCESS_ID>");

  const scheduler = cleanEnv(process.env.AO_SCHEDULER, DEFAULT_AO_SCHEDULER);
  const walletPath = cleanEnv(process.env.AO_WALLET_PATH || process.env.ARWEAVE_JWK, DEFAULT_WALLET_PATH);
  const processName = cleanEnv(args.processName || process.env.AO_PROCESS_NAME, "ao-task-board-lab");
  const title = cleanEnv(args.title || process.env.AO_TASK_TITLE, `task-board-demo-${nowStamp()}`);
  const description = cleanEnv(
    args.description || process.env.AO_TASK_DESCRIPTION,
    "interaction script validation task"
  );
  const priority = cleanEnv(args.priority || process.env.AO_TASK_PRIORITY, "high");
  const requestedAssignee = cleanEnv(args.assignee || process.env.AO_TASK_ASSIGNEE, "");
  const aoUrls = resolveUrls();
  const { connect, createSigner } = await import("@permaweb/aoconnect");

  runLog.env = {
    processId: args.processId,
    aoUrls,
    scheduler,
    walletPath,
    processName,
    title,
    description,
    priority,
    requestedAssignee
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
        processName,
        title,
        description,
        priority,
        requestedAssignee,
        connect,
        createSigner
      });
      runLog.attempts.push(attempt);
      runLog.status = "ok";
      runLog.selectedUrl = aoUrl;
      runLog.processId = args.processId;
      runLog.ids = attempt.ids;
      runLog.validation = attempt.validation;
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
    const summary = {
      status: runLog.status,
      selectedUrl: runLog.selectedUrl || null,
      processId: runLog.processId || null,
      attempts: runLog.attempts.length,
      taskId: runLog.validation?.taskId || null,
      logPath: outPath
    };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(runLog.status === "ok" ? 0 : 1);
  });

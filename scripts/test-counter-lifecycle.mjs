import { execFile } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`;
}

function assertOrThrow(condition, message) {
  if (!condition) throw new Error(message);
}

async function sleep(ms) {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
}

async function runCommand(cmd, args, env = process.env) {
  return execFileAsync(cmd, args, {
    cwd: resolve("."),
    env,
    maxBuffer: 1024 * 1024 * 10
  });
}

async function runDeployOnce(testName, envOverrides = {}) {
  const outPath = resolve(`./runs/tests/${testName}-${nowStamp()}.json`);
  await mkdir(resolve("./runs/tests"), { recursive: true });

  const env = { ...process.env, ...envOverrides };
  const { stdout } = await runCommand("node", ["./scripts/deploy-counter.mjs", "--out", outPath], env);
  const summary = JSON.parse(stdout.trim());
  const log = JSON.parse(await readFile(outPath, "utf8"));

  assertOrThrow(summary.status === "ok", `${testName}: summary status not ok`);
  assertOrThrow(log.status === "ok", `${testName}: log status not ok`);
  assertOrThrow(log.validation?.finalCount === "5", `${testName}: expected finalCount=5`);
  assertOrThrow(log.validation?.initAction === "Init-OK", `${testName}: initAction mismatch`);
  assertOrThrow(log.validation?.getAction === "Get-Result", `${testName}: getAction mismatch`);

  return {
    testName,
    summary,
    outPath,
    processId: log.processId,
    selectedUrl: log.selectedUrl,
    attempts: log.attempts?.length || 0
  };
}

async function runDeployWithRetries(testName, envOverrides, maxAttempts = 3) {
  let lastError = null;

  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      const result = await runDeployOnce(testName, envOverrides);
      return { ...result, runnerAttempt: i };
    } catch (error) {
      lastError = error;
      if (i < maxAttempts) await sleep(2000);
    }
  }

  throw lastError;
}

async function main() {
  await runCommand("luac", ["-p", "./ao/counter.lua"]);

  const defaultDeploy = await runDeployWithRetries(
    "default-route",
    { AO_PROCESS_NAME: `ao-counter-lab-default-${nowStamp()}` },
    3
  );

  const fallbackDeploy = await runDeployWithRetries(
    "forced-fallback",
    {
      AO_URL: "https://push-2.forward.computer",
      AO_FALLBACK_URLS: "https://push-1.forward.computer",
      AO_PROCESS_NAME: `ao-counter-lab-fallback-${nowStamp()}`
    },
    3
  );

  assertOrThrow(
    fallbackDeploy.attempts >= 2,
    "forced-fallback: expected at least two deploy attempts (push-2 then push-1)"
  );
  assertOrThrow(
    fallbackDeploy.selectedUrl === "https://push-1.forward.computer",
    `forced-fallback: expected selectedUrl push-1, got ${fallbackDeploy.selectedUrl}`
  );

  console.log(
    JSON.stringify(
      {
        status: "ok",
        tests: [defaultDeploy, fallbackDeploy]
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

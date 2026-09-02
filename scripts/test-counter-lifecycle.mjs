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

async function main() {
  await runCommand("luac", ["-p", "./ao/counter.lua"]);

  const defaultDeploy = await runDeployOnce(
    "default-route",
    { AO_PROCESS_NAME: `ao-counter-lab-default-${nowStamp()}` }
  );

  assertOrThrow(defaultDeploy.attempts === 1, "default-route: expected exactly one signed write attempt");

  console.log(
    JSON.stringify(
      {
        status: "ok",
        tests: [defaultDeploy]
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

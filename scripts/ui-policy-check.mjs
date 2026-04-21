import {
  pathExists,
  uiDeployEvidencePath,
  computeUiFingerprint,
  readUiDeployEvidence
} from "./ui-policy-lib.mjs";

function parseArg(name) {
  const raw = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!raw) return "";
  return raw.slice(name.length + 3).trim();
}

function failWithActions(messages, actions) {
  for (const message of messages) {
    console.error(message);
  }
  if (actions.length) {
    console.error("");
    console.error("Remediation:");
    for (const action of actions) {
      console.error(`- ${action}`);
    }
  }
  process.exit(1);
}

function validateEvidenceShape(payload) {
  const requiredFields = [
    "timestamp",
    "appUrl",
    "manifestId",
    "archiveUrl",
    "archiveId",
    "sourceHash",
    "cardLine"
  ];
  return requiredFields.filter((field) => {
    const value = payload?.[field];
    return typeof value !== "string" || !value.trim();
  });
}

async function main() {
  const context = parseArg("context") || "policy-check";
  const allowUndeployedUi = process.env.ALLOW_UNDEPLOYED_UI === "1";
  const allowNoUiRoots = process.env.ALLOW_NO_UI_ROOTS === "1";
  const fingerprint = await computeUiFingerprint();

  if (!fingerprint.fileCount) {
    if (allowNoUiRoots) {
      console.log("UI policy check: no tracked UI files found; allowed by ALLOW_NO_UI_ROOTS=1.");
      return;
    }

    failWithActions(
      [
        "UI policy check failed: no tracked UI files were found from data/ui-policy.json sourceRoots.",
        "This usually means source roots are misconfigured, missing, or the command is running in the wrong workspace."
      ],
      [
        "Update data/ui-policy.json sourceRoots to existing UI paths.",
        "Run from the correct project root.",
        "Only for intentional non-UI runs, set ALLOW_NO_UI_ROOTS=1."
      ]
    );
  }

  if (!(await pathExists(uiDeployEvidencePath))) {
    if (context === "predeploy" || allowUndeployedUi) {
      console.log("UI policy check: deploy evidence missing, continuing because deploy is running.");
      return;
    }

    failWithActions(
      [
        `UI policy check failed: missing deploy evidence at ${uiDeployEvidencePath}.`,
        "Tracked UI files exist and must be represented by a fresh deploy."
      ],
      [
        "Run the UI deploy script.",
        "Run npm run deploy:record-ui -- --summary=<deploy-summary.json> ...",
        "Re-run npm run policy:ui-check"
      ]
    );
  }

  let evidence;
  try {
    evidence = await readUiDeployEvidence();
  } catch {
    failWithActions(
      ["UI policy check failed: deploy evidence file exists but is not valid JSON."],
      ["Re-run npm run deploy:record-ui with a valid deploy summary."]
    );
  }

  const missing = validateEvidenceShape(evidence);
  if (missing.length) {
    failWithActions(
      [
        "UI policy check failed: deploy evidence is missing required fields.",
        `Missing: ${missing.join(", ")}`
      ],
      ["Re-run npm run deploy:record-ui after a successful deploy."]
    );
  }

  if (!evidence.cardLine.startsWith("PERMAWEB_APP ")) {
    failWithActions(
      ['UI policy check failed: "cardLine" must start with "PERMAWEB_APP ".'],
      ["Re-run npm run deploy:record-ui to regenerate the structured card line."]
    );
  }

  if (evidence.sourceHash !== fingerprint.sourceHash) {
    if (context === "predeploy" || allowUndeployedUi) {
      console.log("UI policy check: tracked UI changes detected since last deploy, continuing predeploy.");
      return;
    }

    failWithActions(
      [
        "UI policy check failed: tracked UI source changed after the last recorded deploy.",
        `Last manifest: ${evidence.manifestId}`,
        `Last deploy timestamp: ${evidence.timestamp}`
      ],
      [
        "Run the UI deploy script.",
        "Run npm run deploy:record-ui -- --summary=<deploy-summary.json> ...",
        "Re-run npm run policy:ui-check"
      ]
    );
  }

  console.log("UI policy check passed: tracked UI source hash matches deploy evidence.");
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});

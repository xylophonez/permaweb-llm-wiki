import {
  pathExists,
  uiReleaseEvidencePath,
  computeUiFingerprint,
  readUiReleaseEvidence
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

function reportLocalState(messages) {
  for (const message of messages) {
    console.log(message);
  }
}

function validateEvidenceShape(payload) {
  const requiredFields = [
    "timestamp",
    "appUrl",
    "manifestId",
    "sourceHash"
  ];
  return requiredFields.filter((field) => {
    const value = payload?.[field];
    return typeof value !== "string" || !value.trim();
  });
}

async function main() {
  const context = parseArg("context") || "policy-check";
  const isReleaseCheck = context === "release";
  const fingerprint = await computeUiFingerprint();

  if (!fingerprint.fileCount) {
    if (!isReleaseCheck) {
      console.log("UI policy check: no tracked UI files found; no release evidence is required for this local check.");
      return;
    }

    failWithActions(
      [
        "UI policy check failed: no tracked UI files were found from data/ui-policy.json sourceRoots.",
        "This usually means source roots are misconfigured, missing, or the command is running in the wrong workspace."
      ],
      [
        "Update data/ui-policy.json sourceRoots to existing UI paths.",
        "Run the release check from the intended app root."
      ]
    );
  }

  if (!(await pathExists(uiReleaseEvidencePath))) {
    if (!isReleaseCheck) {
      reportLocalState([
        "UI policy check: tracked UI files have no release evidence.",
        "Local work may continue. Publishing requires explicit user authorization and a successful release record."
      ]);
      return;
    }

    failWithActions(
      [
        `UI policy check failed: missing release evidence at ${uiReleaseEvidencePath}.`,
        "This release has not been represented by successful release evidence."
      ],
      [
        "Obtain explicit authorization for the permanent write.",
        "Complete the authorized deploy with the selected signer.",
        "Run npm run release:record-ui -- --summary=<deploy-summary.json> ...",
        "Re-run npm run policy:ui-check:release"
      ]
    );
  }

  let evidence;
  try {
    evidence = await readUiReleaseEvidence();
  } catch {
    if (!isReleaseCheck) {
      reportLocalState([
        "UI policy check: release evidence exists but is not valid JSON.",
        "Local work may continue, but the evidence must be repaired before an authorized release is reported as complete."
      ]);
      return;
    }

    failWithActions(
      ["UI policy check failed: release evidence file exists but is not valid JSON."],
      ["Re-run npm run release:record-ui with a valid deploy summary."]
    );
  }

  const missing = validateEvidenceShape(evidence);
  if (missing.length) {
    if (!isReleaseCheck) {
      reportLocalState([
        `UI policy check: release evidence is missing required fields: ${missing.join(", ")}.`,
        "Local work may continue, but this evidence is not sufficient for a release."
      ]);
      return;
    }

    failWithActions(
      [
        "UI policy check failed: release evidence is missing required fields.",
        `Missing: ${missing.join(", ")}`
      ],
      ["Re-run npm run release:record-ui after a successful deploy."]
    );
  }

  if (evidence.sourceHash !== fingerprint.sourceHash) {
    if (!isReleaseCheck) {
      reportLocalState([
        "UI policy check: tracked UI source is newer than the last release evidence.",
        "Local work may continue. Do not describe this source state as published."
      ]);
      return;
    }

    failWithActions(
      [
        "UI policy check failed: tracked UI source changed after the last recorded release.",
        `Last manifest: ${evidence.manifestId}`,
        `Last release timestamp: ${evidence.timestamp}`
      ],
      [
        "Obtain explicit authorization for the permanent write.",
        "Complete the authorized deploy with the selected signer.",
        "Run npm run release:record-ui -- --summary=<deploy-summary.json> ...",
        "Re-run npm run policy:ui-check:release"
      ]
    );
  }

  console.log(
    isReleaseCheck
      ? "UI release check passed: tracked UI source hash matches release evidence."
      : "UI policy check: tracked UI source hash matches release evidence."
  );
}

main().catch((error) => {
  console.error(error?.message || String(error));
  process.exit(1);
});

import fs from "node:fs";

function fail(message) {
  console.error(`Result validation failed: ${message}`);
  process.exit(1);
}

const resultPath = process.argv[2];
if (!resultPath) fail("pass a result JSON path");

let result;
try {
  result = JSON.parse(fs.readFileSync(resultPath, "utf8"));
} catch (error) {
  fail(`invalid JSON: ${error.message}`);
}

const allowedKeys = new Set([
  "status", "summary", "files_changed", "validation", "risks", "next_action",
]);
for (const key of Object.keys(result)) {
  if (!allowedKeys.has(key)) fail(`unexpected property: ${key}`);
}

if (!["READY FOR PM REVIEW", "BLOCKED"].includes(result.status)) fail("invalid status");
if (typeof result.summary !== "string" || !result.summary.trim()) fail("summary is required");
if (!Array.isArray(result.files_changed)) fail("files_changed must be an array");
if (new Set(result.files_changed).size !== result.files_changed.length) {
  fail("files_changed must not contain duplicate entries");
}
if (!Array.isArray(result.validation)) fail("validation must be an array");
if (!Array.isArray(result.risks)) fail("risks must be an array");
if (typeof result.next_action !== "string" || !result.next_action.trim()) fail("next_action is required");

const validationStatuses = new Set(["PASS", "FAIL", "BLOCKED", "NOT RUN"]);
for (const item of result.validation) {
  if (!item || typeof item.command !== "string" || !item.command.trim()) {
    fail("each validation item needs a command");
  }
  if (!validationStatuses.has(item.status)) fail(`invalid validation status: ${item.status}`);
  if (typeof item.details !== "string") fail("each validation item needs details");
}

console.log(`Valid pipeline result: ${result.status}`);

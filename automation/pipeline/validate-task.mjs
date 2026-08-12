import fs from "node:fs";

const requiredHeadings = [
  "## TASK",
  "## STATUS",
  "## CONTEXT",
  "## ACCEPTANCE CRITERIA",
  "## FILES TO INSPECT",
  "## FILES TO TOUCH",
  "## IN SCOPE",
  "## OUT OF SCOPE",
  "## VALIDATION",
  "## STOP CONDITIONS",
  "## NOTES FOR CODEX",
];

function fail(message) {
  console.error(`Task validation failed: ${message}`);
  process.exit(1);
}

const taskPath = process.argv[2];
if (!taskPath) fail("pass a task Markdown path");

const body = fs.readFileSync(taskPath, "utf8").replace(/\r\n/g, "\n");
if (body.includes("<!--")) fail("HTML comments are not allowed in pipeline tasks");
let cursor = -1;
for (const heading of requiredHeadings) {
  const next = body.indexOf(heading, cursor + 1);
  if (next < 0) fail(`missing heading: ${heading}`);
  if (next < cursor) fail(`heading is out of order: ${heading}`);
  cursor = next;
}

const statusMatch = body.match(/## STATUS\s+`?([^`\n]+)`?/);
if (!statusMatch || statusMatch[1].trim() !== "READY FOR CODEX") {
  fail("STATUS must be READY FOR CODEX");
}

const taskMatch = body.match(/## TASK\s+`?([^`\n]+)`?/);
if (!taskMatch || !taskMatch[1].trim()) fail("TASK must not be empty");
if (/\[(Task ID|한 문장 작업명)\]/.test(taskMatch[1])) {
  fail("TASK still contains template placeholders");
}

console.log(JSON.stringify({
  task: taskMatch[1].trim(),
  status: "READY FOR CODEX",
}));

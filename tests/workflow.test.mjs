import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
test("Pages deployment packages before publishing in separate jobs", () => {
  const build = workflow.indexOf("\n  build:");
  const deploy = workflow.indexOf("\n  deploy:");
  assert.ok(build > 0 && deploy > build, "Expected separate build and deploy jobs");
  assert.match(workflow.slice(build, deploy), /actions\/upload-pages-artifact@v4/);
  assert.match(workflow.slice(deploy), /needs: build/);
  assert.doesNotMatch(workflow.slice(deploy), /actions\/upload-pages-artifact/);
  assert.match(workflow.slice(deploy), /actions\/deploy-pages@v4/);
});
test("Deploy waits for one visible Pages artifact with read permission", () => {
  const deploy = workflow.slice(workflow.indexOf("\n  deploy:"));
  assert.match(deploy, /actions: read/);
  assert.match(deploy, /Pages artifact visibility/);
  assert.ok(deploy.includes('if [ "$count" = "1" ]; then'), "Expected a literal one-artifact guard");
});

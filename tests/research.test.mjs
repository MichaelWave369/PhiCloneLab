import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("site/data/research.json","utf8"));
const html = readFileSync("site/atlas.html","utf8");
const main = readFileSync("site/index.html","utf8");
const js = readFileSync("site/atlas.js","utf8");
const unique = list => new Set(list).size === list.length;
const sourceIds = new Set(data.sources.map(s => s.id));
const claimIds = new Set(data.claims.map(c => c.id));
const allowed = new Set(["demonstrated","documented","guidance","unverified"]);
test("registry has unique and nonempty keys", () => {
  assert.equal(data.schemaVersion,"0.2.0");
  assert.ok(data.sources.length >= 6);
  assert.ok(data.claims.length >= 6);
  assert.ok(unique(data.sources.map(x=>x.id)));
  assert.ok(unique(data.claims.map(x=>x.id)));
});
test("each source is an auditable HTTPS reference", () => {
  for (const s of data.sources) {
    assert.ok(s.id && s.title && s.publisher && s.kind && s.summary,s.id);
    assert.equal(new URL(s.url).protocol,"https:",s.id);
  }
});
test("claim status and source references are coherent", () => {
  for(const c of data.claims) {
    assert.ok(allowed.has(c.level),c.id);
    assert.ok(c.title && c.short && c.interpretation,c.id);
    assert.ok(Array.isArray(c.limitations) && c.limitations.length>0,c.id);
    assert.ok(Array.isArray(c.sources),c.id);
    assert.ok(unique(c.sources),c.id);
    c.sources.forEach(id=>assert.ok(sourceIds.has(id),c.id+" → "+id));
    if(c.level==="unverified") assert.equal(c.sources.length,0,c.id);
    else assert.ok(c.sources.length>0,c.id+" has no sources");
  }
});
test("timeline references real claims and sources", () => {
  const years = data.timeline.map(x=>x.year);
  assert.deepEqual(years,[...years].sort((a,b)=>a-b));
  for(const t of data.timeline) {
    assert.ok(t.claimIds.length>0 && t.sourceIds.length>0,t.id);
    t.claimIds.forEach(id=>assert.ok(claimIds.has(id),t.id+" → "+id));
    t.sourceIds.forEach(id=>assert.ok(sourceIds.has(id),t.id+" → "+id));
  }
});
test("main page links to a standalone accessible atlas", () => {
  assert.match(main,/href="\.\/atlas\.html"/);
  assert.match(html,/src="\.\/atlas\.js"/);
  assert.match(html,/id="detail"/);
  assert.match(html,/id="compare-left"/);
  assert.match(html,/id="download"/);
  assert.ok(!js.includes(".innerHTML"),"DOM text must be inserted without raw HTML");
});

"use strict";
(() => {
  const $ = id => document.getElementById(id);
  const el = (tag, cls, value) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const state = {registry:null, selected:"C006", level:"all", query:"", compareA:"C001", compareB:"C006"};
  const labels = {demonstrated:"Demonstrated", documented:"Documented proposal", guidance:"Ethics guidance", unverified:"Unverified outcome"};
  const categoryLabels = {"animal-science":"Animal research", "cell-biology":"Cell biology", "bishop-investigation":"Bishop investigation", ethics:"Ethics", concepts:"Core concepts"};
  const getClaim = id => state.registry.claims.find(x => x.id === id);
  const getSource = id => state.registry.sources.find(x => x.id === id);
  const notify = message => {
    const node = $("toast");
    node.textContent = message;
    node.classList.add("show");
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => node.classList.remove("show"), 2500);
  };
  const link = (url, label, cls) => {
    const a = el("a", cls, label);
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  };
  const status = level => el("span", "status " + level, labels[level] || level);
  function renderList() {
    const wrap = $("claims");
    wrap.replaceChildren();
    const visible = state.registry.claims.filter(claim => {
      const searchable = [claim.title,claim.short,claim.id,claim.category,claim.level].join(" ").toLowerCase();
      return (state.level === "all" || state.level === claim.level) && searchable.includes(state.query.toLowerCase());
    });
    $("result-count").textContent = visible.length + " / " + state.registry.claims.length;
    if (!visible.length) {
      wrap.append(el("div", "empty", "No claims match your search. Try another evidence level."));
      return;
    }
    visible.forEach(claim => {
      const btn = el("button", "claim");
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(state.selected === claim.id));
      const top = el("div", "claim-top");
      top.append(el("span", "claim-id", claim.id), status(claim.level));
      btn.append(top, el("strong", "", claim.title), el("small", "", categoryLabels[claim.category] || claim.category));
      btn.addEventListener("click", () => selectClaim(claim.id));
      wrap.append(btn);
    });
  }
  function addDetailSection(parent, heading, node) {
    const section = el("section", "detail-section");
    section.append(el("h4", "", heading), node);
    parent.append(section);
  }
  function renderDetail() {
    const claim = getClaim(state.selected);
    const wrap = $("detail");
    wrap.replaceChildren();
    if (!claim) {
      wrap.append(el("p", "", "Select a claim to inspect the underlying sources."));
      return;
    }
    const head = el("div", "detail-kicker", claim.id + " / " + (categoryLabels[claim.category] || claim.category).toUpperCase());
    wrap.append(head,el("h3", "", claim.title),status(claim.level),el("p", "",claim.short));
    addDetailSection(wrap, "WHAT THIS DOES AND DOESN'T MEAN", el("p", "",claim.interpretation));
    const limits = el("ul");
    claim.limitations.forEach(item => limits.append(el("li", "",item)));
    addDetailSection(wrap, "SCIENTIFIC LIMITATIONS", limits);
    const refs = el("div");
    if (!claim.sources.length) {
      refs.append(el("div", "no-evidence", "NO VALIDATING RESULT IN THIS DATASET. This record documents a gap, not a finding that a claimed experiment occurred."));
    } else {
      claim.sources.forEach(id => {
        const source = getSource(id);
        if (!source) return;
        const sourceLink = link(source.url, source.title + " ↗", "source-ref");
        sourceLink.prepend(el("small", "", source.id));
        refs.append(sourceLink);
      });
    }
    addDetailSection(wrap, "TRACEABLE SOURCE LINKS", refs);
  }
  function selectClaim(id, scroll=false) {
    if (!getClaim(id)) return;
    state.selected = id;
    state.level = "all";
    $("level").value = "all";
    state.query = "";
    $("search").value = "";
    renderList();
    renderDetail();
    if (scroll) $("explore").scrollIntoView({behavior:"smooth",block:"start"});
  }
  function renderTimeline() {
    const wrap = $("milestones");
    wrap.replaceChildren();
    state.registry.timeline.forEach(t => {
      const button = el("button", "milestone");
      button.type="button";
      button.append(el("span","year",String(t.year)),el("strong","",t.label),el("small","",t.details));
      button.title = "Inspect " + t.claimIds[0];
      button.addEventListener("click",() => selectClaim(t.claimIds[0],true));
      wrap.append(button);
    });
  }
  function makeCompareCard(id, targetId) {
    const claim = getClaim(id), container = $(targetId);
    container.replaceChildren();
    if (!claim) return;
    container.append(el("div","detail-kicker",claim.id),el("h3","",claim.title),status(claim.level),el("p","",claim.short));
    const line = el("div","detail-section");
    line.append(el("h4","","RELEVANT LIMITATIONS"),el("p","",claim.limitations.join(" ")));
    container.append(line);
    const foot = el("div","detail-section");
    foot.append(el("h4","","SOURCE COVERAGE"),el("p","",claim.sources.length ? claim.sources.map(id => {
      const source = getSource(id);
      return source ? source.publisher : id;
    }).join(" · ") : "No verifying source in registry"));
    container.append(foot);
  }
  function renderCompare() {
    makeCompareCard(state.compareA,"compare-a");
    makeCompareCard(state.compareB,"compare-b");
  }
  function populateComparators() {
    for (const [id,field] of [["compare-left","compareA"],["compare-right","compareB"]]) {
      const select = $(id);
      select.replaceChildren();
      state.registry.claims.forEach(c => {
        const opt = el("option","",c.id+" · "+c.title);
        opt.value = c.id;
        select.append(opt);
      });
      select.value = state[field];
      select.addEventListener("change",e=>{state[field]=e.target.value;renderCompare();});
    }
    renderCompare();
  }
  function renderSources() {
    const wrap = $("source-list");
    wrap.replaceChildren();
    state.registry.sources.forEach(s => {
      const card = el("article","source-card");
      const yr = s.year === null ? "DATE NOT SPECIFIED" : String(s.year);
      card.append(el("div","source-meta",s.id+" / "+s.kind.replaceAll("-"," ").toUpperCase()+" / "+yr),el("h3","",s.title),el("p","",s.summary));
      card.append(link(s.url,"VIEW SOURCE ↗"));
      wrap.append(card);
    });
  }
  function exportJson() {
    if (!state.registry) return;
    const current = getClaim(state.selected);
    const payload = {
      schemaVersion:"0.2.0",
      createdAt:new Date().toISOString(),
      type:"PhiCloneLab atlas research export",
      selectedClaim:current,
      linkedSources:current.sources.map(getSource).filter(Boolean),
      comparativeClaims:[getClaim(state.compareA),getClaim(state.compareB)],
      currentFilters:{level:state.level,search:state.query},
      disclaimer:state.registry.notice
    };
    const b = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href=url;a.download="phiclonelab-evidence-"+current.id+".json";a.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    notify("Evidence export prepared");
  }
  async function start() {
    try {
      const response = await fetch("./data/research.json", {cache:"no-cache"});
      if (!response.ok) throw new Error("Dataset HTTP "+response.status);
      const registry = await response.json();
      if (!Array.isArray(registry.claims) || !Array.isArray(registry.sources) || !Array.isArray(registry.timeline)) throw new Error("Invalid evidence registry");
      state.registry = registry;
      $("curated-at").textContent = registry.curatedAt;
      $("source-count").textContent = String(registry.sources.length).padStart(2,"0");
      $("claim-count").textContent = String(registry.claims.length).padStart(2,"0");
      renderList();renderDetail();renderTimeline();populateComparators();renderSources();
      $("search").addEventListener("input", e => {state.query=e.target.value.trim();renderList();});
      $("level").addEventListener("change", e => {state.level=e.target.value;renderList();});
      $("download").addEventListener("click",exportJson);
    } catch(err) {
      $("claims").replaceChildren(el("div","empty","Could not load the evidence registry. Open this page through GitHub Pages or a local HTTP server (not file://)."));
      $("detail").replaceChildren(el("p","",String(err.message || err)));
      $("download").disabled = true;
    }
  }
  start();
})();

"use strict";
/* ══════════════════════════════════════════════════════════════════
   ICT & IT (0417) — Spreadsheet formulas · Database queries ·
                     Validation & test data
══════════════════════════════════════════════════════════════════ */

/* ───────────── SPREADSHEET ───────────── */
Lab.register({
  id:"spreadsheet", subject:"ict", topic:"Spreadsheets", icon:"📊",
  title:"Spreadsheet formulas & replication",
  summary:"Build formulas, replicate them, and use SUM, AVERAGE, IF, COUNTIF and absolute references.",
  aim:"Use formulas and functions in a spreadsheet model, replicating them correctly with relative and absolute cell references.",
  variables:null,
  layout:"wide", stageTitle:"Tuck shop model", controlsTitle:"Tasks",
  questions:[
    { q:"What is the difference between a formula and a function?",
      a:"A formula is any calculation starting with = (e.g. =B2*C2). A function is a predefined named formula such as SUM, AVERAGE or IF that is used inside a formula." },
    { q:"Why does the VAT formula need $B$12 rather than B12?",
      a:"When the formula is replicated down, relative references change (B12 → B13 → B14…). An absolute reference ($B$12) always points to the same cell, so every row uses the VAT rate." },
    { q:"What does =COUNTIF(F2:F8,\"Yes\") do?",
      a:"It counts how many cells in the range F2 to F8 contain the text Yes." },
    { q:"Why should you print or show the formulas view of a spreadsheet?",
      a:"To show evidence of the formulas used (not just the results), so that they can be checked. Make sure columns are wide enough to show each formula in full." }
  ],
  setup(ctx){
    const COLS = ["A","B","C","D","E","F","G"], NROWS = 13;
    const START = {
      A1:"Item",B1:"Price ($)",C1:"Qty sold",D1:"Revenue ($)",E1:"Stock",F1:"Reorder?",G1:"Revenue + VAT",
      A2:"Crisps",B2:"0.8",C2:"45",E2:"30", A3:"Water",B3:"1",C3:"60",E3:"12", A4:"Juice",B4:"1.5",C4:"32",E4:"8",
      A5:"Cookie",B5:"0.9",C5:"50",E5:"25", A6:"Apple",B6:"0.5",C6:"28",E6:"40", A7:"Sandwich",B7:"2.5",C7:"18",E7:"5",
      A8:"Muffin",B8:"1.2",C8:"22",E8:"14",
      A10:"Total revenue", A11:"Average price", A12:"VAT rate", B12:"0.2", A13:"Items to reorder"
    };
    const KEY = "vlab-sheet";
    let cells; try{ cells = JSON.parse(localStorage.getItem(KEY)) || null; }catch(e){ cells = null; }
    if(!cells) cells = Object.assign({}, START);
    const persist = () => { try{ localStorage.setItem(KEY, JSON.stringify(cells)); }catch(e){} };
    let sel = "D2", showF = false;

    /* ── formula engine ── */
    class Err{ constructor(code){ this.code = code; } }
    const isErr = v => v instanceof Err;
    function tokenize(src){
      const re = /\s*(?:(\d+(?:\.\d+)?)|"((?:[^"]|"")*)"|(\$?[A-Za-z]{1,2}\$?\d+)(?![A-Za-z(])|([A-Za-z_][A-Za-z0-9_.]*)|(<=|>=|<>|[-+*/^&=<>(),:%]))/y;
      const out = []; let m; re.lastIndex = 0;
      while(re.lastIndex < src.length){
        const at = re.lastIndex;
        if(/^\s*$/.test(src.slice(at))) break;
        m = re.exec(src);
        if(!m) throw new Err("#ERROR!");
        if(m[1] !== undefined) out.push({ t:"num", v:+m[1] });
        else if(m[2] !== undefined) out.push({ t:"str", v:m[2].replace(/""/g,'"') });
        else if(m[3] !== undefined) out.push({ t:"ref", v:m[3].toUpperCase() });
        else if(m[4] !== undefined) out.push({ t:"id", v:m[4].toUpperCase() });
        else out.push({ t:"op", v:m[5] });
      }
      return out;
    }
    function parse(src){
      const tk = tokenize(src); let p = 0;
      const peek = () => tk[p], isOp = v => tk[p] && tk[p].t === "op" && tk[p].v === v;
      const eat = v => { if(!isOp(v)) throw new Err("#ERROR!"); p++; };
      const cmp = () => { let l = cat(); while(tk[p] && tk[p].t === "op" && ["=","<>","<",">","<=",">="].includes(tk[p].v)){ const op = tk[p++].v; l = { k:"bin", op, l, r:cat() }; } return l; };
      const cat = () => { let l = add(); while(isOp("&")){ p++; l = { k:"bin", op:"&", l, r:add() }; } return l; };
      const add = () => { let l = mul(); while(isOp("+") || isOp("-")){ const op = tk[p++].v; l = { k:"bin", op, l, r:mul() }; } return l; };
      const mul = () => { let l = pow(); while(isOp("*") || isOp("/")){ const op = tk[p++].v; l = { k:"bin", op, l, r:pow() }; } return l; };
      const pow = () => { let l = un(); while(isOp("^")){ p++; l = { k:"bin", op:"^", l, r:un() }; } return l; };
      const un = () => { if(isOp("-")){ p++; return { k:"neg", e:un() }; } if(isOp("+")){ p++; return un(); } let e = prim(); if(isOp("%")){ p++; e = { k:"bin", op:"/", l:e, r:{ k:"num", v:100 } }; } return e; };
      function prim(){
        const t = peek(); if(!t) throw new Err("#ERROR!");
        if(t.t === "num"){ p++; return { k:"num", v:t.v }; }
        if(t.t === "str"){ p++; return { k:"str", v:t.v }; }
        if(t.t === "ref"){ p++; const a = t.v.replace(/\$/g,""); if(isOp(":")){ p++; const b = peek(); if(!b || b.t !== "ref") throw new Err("#ERROR!"); p++; return { k:"range", a, b:b.v.replace(/\$/g,"") }; } return { k:"ref", v:a }; }
        if(t.t === "id"){
          p++;
          if(t.v === "TRUE" || t.v === "FALSE") return { k:"bool", v:t.v === "TRUE" };
          if(!isOp("(")) throw new Err("#NAME?");
          p++; const args = [];
          if(!isOp(")")){ args.push(cmp()); while(isOp(",")){ p++; args.push(cmp()); } }
          eat(")"); return { k:"fn", name:t.v, args };
        }
        if(isOp("(")){ p++; const e = cmp(); eat(")"); return e; }
        throw new Err("#ERROR!");
      }
      const ast = cmp(); if(p < tk.length) throw new Err("#ERROR!");
      return ast;
    }
    const splitRef = r => { const m = /^([A-Z]+)(\d+)$/.exec(r); return m ? [m[1], +m[2]] : null; };
    const colIdx = c => c.split("").reduce((n,ch) => n*26 + ch.charCodeAt(0) - 64, 0) - 1;
    const colName = i => String.fromCharCode(65 + i);

    let memo = {}, visiting = {};
    function rawValue(raw){
      if(raw === undefined || raw === "") return null;
      if(raw[0] === "=") return null;
      const n = Number(raw);
      return raw.trim() !== "" && isFinite(n) ? n : raw;
    }
    function cellValue(ref){
      if(ref in memo) return memo[ref];
      const raw = cells[ref];
      if(!raw || raw[0] !== "="){ return memo[ref] = rawValue(raw); }
      if(visiting[ref]) return new Err("#CIRC!");
      visiting[ref] = true;
      let v;
      try{ v = ev(parse(raw.slice(1))); if(v && v.range) v = new Err("#VALUE!"); }
      catch(e){ v = isErr(e) ? e : new Err("#ERROR!"); }
      visiting[ref] = false;
      return memo[ref] = v;
    }
    function rangeVals(a, b){
      const A = splitRef(a), B = splitRef(b); if(!A || !B) return new Err("#REF!");
      const c0 = Math.min(colIdx(A[0]), colIdx(B[0])), c1 = Math.max(colIdx(A[0]), colIdx(B[0]));
      const r0 = Math.min(A[1], B[1]), r1 = Math.max(A[1], B[1]);
      const out = [];
      for(let r=r0;r<=r1;r++){ const row = []; for(let c=c0;c<=c1;c++) row.push(cellValue(colName(c) + r)); out.push(row); }
      return { range:out };
    }
    const toNum = v => { if(isErr(v)) throw v; if(v === null) return 0; if(typeof v === "boolean") return v ? 1 : 0; if(typeof v === "number") return v; const n = Number(v); if(v.trim() !== "" && isFinite(n)) return n; throw new Err("#VALUE!"); };
    const toStr = v => { if(isErr(v)) throw v; if(v === null) return ""; if(typeof v === "boolean") return v ? "TRUE" : "FALSE"; if(typeof v === "number") return String(Number(v.toPrecision(12))); return v; };
    const flat = args => [].concat(...args.map(a => a && a.range ? [].concat(...a.range) : [a]));
    function compare(a, b, op){
      let x = a === null ? (typeof b === "number" ? 0 : "") : a, y = b === null ? (typeof a === "number" ? 0 : "") : b;
      let c;
      if(typeof x === "number" && typeof y === "number") c = x - y;
      else{ x = toStr(x).toLowerCase(); y = toStr(y).toLowerCase(); c = x < y ? -1 : x > y ? 1 : 0; }
      return { "=":c === 0, "<>":c !== 0, "<":c < 0, ">":c > 0, "<=":c <= 0, ">=":c >= 0 }[op];
    }
    function critMatch(v, crit){
      if(typeof crit === "number") return typeof v === "number" && v === crit;
      const m = /^(<=|>=|<>|<|>|=)?(.*)$/.exec(String(crit));
      const op = m[1] || "=", rhsRaw = m[2], n = Number(rhsRaw);
      const rhs = rhsRaw.trim() !== "" && isFinite(n) ? n : rhsRaw;
      if(typeof rhs === "number" && typeof v !== "number") return op === "<>";
      return compare(v, rhs, op);
    }
    const FN = {
      SUM: a => flat(a).filter(v => typeof v === "number").reduce((s,v) => s + v, 0),
      AVERAGE: a => { const n = flat(a).filter(v => typeof v === "number"); if(!n.length) throw new Err("#DIV/0!"); return n.reduce((s,v) => s + v, 0)/n.length; },
      MIN: a => { const n = flat(a).filter(v => typeof v === "number"); return n.length ? Math.min(...n) : 0; },
      MAX: a => { const n = flat(a).filter(v => typeof v === "number"); return n.length ? Math.max(...n) : 0; },
      COUNT: a => flat(a).filter(v => typeof v === "number").length,
      COUNTA: a => flat(a).filter(v => v !== null && v !== "").length,
      COUNTIF: a => { if(!a[0] || !a[0].range) throw new Err("#VALUE!"); return flat([a[0]]).filter(v => !isErr(v) && critMatch(v, a[1])).length; },
      SUMIF: a => { if(!a[0] || !a[0].range) throw new Err("#VALUE!"); const k = flat([a[0]]), s = a[2] && a[2].range ? flat([a[2]]) : k; return k.reduce((t,v,i) => t + (critMatch(v, a[1]) && typeof s[i] === "number" ? s[i] : 0), 0); },
      ROUND: a => { const f = Math.pow(10, toNum(a[1] === undefined ? 0 : a[1])); return Math.round(toNum(a[0])*f)/f; },
      AND: a => flat(a).every(v => !!toNum(v)),
      OR: a => flat(a).some(v => !!toNum(v)),
      NOT: a => !toNum(a[0]),
      VLOOKUP: a => {
        const rng = a[1]; if(!rng || !rng.range) throw new Err("#VALUE!");
        const col = toNum(a[2]) - 1, exact = a[3] !== undefined && !toNum(a[3]);
        if(col < 0 || col >= rng.range[0].length) throw new Err("#REF!");
        let hit = -1;
        rng.range.forEach((row, i) => { if(exact ? compare(row[0], a[0], "=") : compare(row[0], a[0], "<=")) if(exact ? hit < 0 : true) hit = i; });
        if(hit < 0) throw new Err("#N/A");
        return rng.range[hit][col];
      }
    };
    function ev(n){
      switch(n.k){
        case "num": case "str": case "bool": return n.v;
        case "ref": { const v = cellValue(n.v); if(isErr(v)) throw v; return v; }
        case "range": return rangeVals(n.a, n.b);
        case "neg": return -toNum(ev(n.e));
        case "fn": {
          if(n.name === "IF"){ const c = ev(n.args[0]); return toNum(c) ? (n.args[1] ? ev(n.args[1]) : true) : (n.args[2] ? ev(n.args[2]) : false); }
          const f = FN[n.name]; if(!f) throw new Err("#NAME?");
          const args = n.args.map(ev);
          args.forEach(v => { if(isErr(v)) throw v; });
          return f(args);
        }
        case "bin": {
          const l = ev(n.l), r = ev(n.r);
          if(["=","<>","<",">","<=",">="].includes(n.op)) return compare(l, r, n.op);
          if(n.op === "&") return toStr(l) + toStr(r);
          const a = toNum(l), b = toNum(r);
          if(n.op === "+") return a + b; if(n.op === "-") return a - b; if(n.op === "*") return a*b;
          if(n.op === "/"){ if(b === 0) throw new Err("#DIV/0!"); return a/b; }
          return Math.pow(a, b);
        }
      }
      throw new Err("#ERROR!");
    }
    function recalc(){ memo = {}; visiting = {}; }

    /* shift relative row references when replicating down (outside "strings") */
    function shiftRows(formula, d){
      return formula.split('"').map((part, i) => i % 2 ? part
        : part.replace(/(\$?)([A-Za-z]{1,2})(\$?)(\d+)(?![A-Za-z(])/g, (m, ca, c, ra, r) => ca + c.toUpperCase() + ra + (ra ? r : Math.max(1, +r + d)))).join('"');
    }

    /* ── UI ── */
    ctx.stage.innerHTML = `
      <div class="fbar"><span class="ref" id="ss-ref">D2</span><input class="inp" id="ss-in" aria-label="Formula bar" autocomplete="off" spellcheck="false"></div>
      <div style="overflow:auto"><table class="sheet" id="ss-grid"></table></div>
      <div class="btns" style="margin-top:.7rem;align-items:center">
        <span style="font-size:.8rem;color:var(--txt2)">Replicate selected cell down to row</span>
        <input class="inp" id="ss-to" type="number" min="2" max="${NROWS}" value="8" style="width:4.5rem">
        <button class="btn small primary" type="button" id="ss-fill">Fill down ↓</button>
        <button class="btn small" type="button" id="ss-showf">Show formulas</button>
        <button class="btn small" type="button" id="ss-reset">Reset sheet</button>
      </div>`;
    const $ = s => ctx.stage.querySelector(s);
    const grid = $("#ss-grid"), fin = $("#ss-in");

    function display(ref){
      if(showF) return cells[ref] || "";
      const v = cellValue(ref);
      if(v === null) return "";
      if(isErr(v)) return v.code;
      if(typeof v === "boolean") return v ? "TRUE" : "FALSE";
      if(typeof v === "number"){
        const [c, r] = splitRef(ref);
        return ["B","D","G"].includes(c) && r >= 2 && r <= 11 ? v.toFixed(2) : String(Number(v.toFixed(6)));
      }
      return v;
    }
    function renderGrid(){
      recalc();
      let h = `<thead><tr><th></th>${COLS.map(c => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`;
      for(let r=1;r<=NROWS;r++){
        h += `<tr><th scope="row">${r}</th>`;
        COLS.forEach(c => {
          const ref = c + r, v = cellValue(ref);
          const cls = [ref === sel ? "sel" : "", typeof v === "number" && !showF ? "num" : "", isErr(v) && !showF ? "err" : ""].join(" ");
          h += `<td class="${cls}" data-ref="${ref}"><div${r === 1 ? ' style="font-weight:600"' : ""}>${ctx.esc(display(ref))}</div></td>`;
        });
        h += `</tr>`;
      }
      grid.innerHTML = h + "</tbody>";
      checkTasks();
      const v = cellValue(sel);
      ctx.readout([["Cell", sel], ["Contains", cells[sel] && cells[sel][0] === "=" ? "formula" : cells[sel] ? "data" : "empty"],
        ["Value", v === null ? "—" : isErr(v) ? v.code : String(typeof v === "number" ? Number(v.toFixed(6)) : v), isErr(v) ? "warn" : ""]]);
    }
    function select(ref, focus){
      sel = ref; $("#ss-ref").textContent = ref; fin.value = cells[ref] || "";
      renderGrid(); if(focus !== false) fin.focus();
    }
    function commit(){
      const v = fin.value;
      if(v === "") delete cells[sel]; else cells[sel] = v;
      persist();
    }
    function move(dc, dr){
      const [c, r] = splitRef(sel);
      const ci = Math.max(0, Math.min(COLS.length - 1, colIdx(c) + dc)), ri = Math.max(1, Math.min(NROWS, r + dr));
      select(colName(ci) + ri);
    }
    grid.addEventListener("click", e => { const td = e.target.closest("td[data-ref]"); if(td){ commit(); select(td.dataset.ref); } });
    fin.addEventListener("keydown", e => {
      if(e.key === "Enter"){ e.preventDefault(); commit(); move(0, e.shiftKey ? -1 : 1); }
      else if(e.key === "Tab"){ e.preventDefault(); commit(); move(e.shiftKey ? -1 : 1, 0); }
      else if(e.key === "Escape"){ fin.value = cells[sel] || ""; }
      else if((e.key === "ArrowUp" || e.key === "ArrowDown") && fin.value === (cells[sel] || "")){ e.preventDefault(); move(0, e.key === "ArrowUp" ? -1 : 1); }
    });
    fin.addEventListener("blur", () => { if(fin.value !== (cells[sel] || "")){ commit(); renderGrid(); } });
    $("#ss-fill").onclick = () => {
      commit();
      const src = cells[sel], [c, r] = splitRef(sel), to = Math.min(NROWS, Math.max(1, +$("#ss-to").value || r));
      if(!src){ ctx.toast("Select a cell with a formula first"); return; }
      if(to <= r){ ctx.toast("Choose a row below " + sel); return; }
      for(let k = r + 1; k <= to; k++) cells[c + k] = src[0] === "=" ? "=" + shiftRows(src.slice(1), k - r) : src;
      persist(); renderGrid(); ctx.toast(`Replicated ${sel} to ${c}${r + 1}:${c}${to}`);
    };
    $("#ss-showf").onclick = e => { showF = !showF; e.target.textContent = showF ? "Show values" : "Show formulas"; renderGrid(); };
    $("#ss-reset").onclick = () => { if(!confirm("Reset the spreadsheet to its starting data?")) return; cells = Object.assign({}, START); persist(); select("D2", false); };

    /* ── tasks ── */
    const num = ref => { const v = cellValue(ref); return typeof v === "number" ? v : NaN; };
    const isF = ref => !!cells[ref] && cells[ref][0] === "=";
    const near = (a, b) => isFinite(a) && Math.abs(a - b) < 1e-6;
    const R = [2,3,4,5,6,7,8];
    const TASKS = [
      ["In <b>D2</b>, enter a formula to calculate the revenue (Price × Qty sold).",
        () => isF("D2") && /B2/i.test(cells.D2) && /C2/i.test(cells.D2) && near(num("D2"), num("B2")*num("C2"))],
      ["Replicate the D2 formula down to <b>D8</b>.",
        () => R.every(r => isF("D" + r) && near(num("D" + r), num("B" + r)*num("C" + r)))],
      ["In <b>D10</b>, use a function to total the revenue in D2:D8.",
        () => isF("D10") && /SUM\(/i.test(cells.D10) && near(num("D10"), R.reduce((s,r) => s + num("D" + r), 0))],
      ["In <b>B11</b>, use a function to find the average price.",
        () => isF("B11") && /AVERAGE\(/i.test(cells.B11) && near(num("B11"), R.reduce((s,r) => s + num("B" + r), 0)/7)],
      ["In <b>F2:F8</b>, use IF to show <span class=\"mono\">Yes</span> when Stock is below 10, otherwise <span class=\"mono\">No</span>.",
        () => R.every(r => isF("F" + r) && /IF\(/i.test(cells["F" + r]) && cellValue("F" + r) === (num("E" + r) < 10 ? "Yes" : "No"))],
      ["In <b>B13</b>, use COUNTIF to count the items that need reordering.",
        () => isF("B13") && /COUNTIF\(/i.test(cells.B13) && num("B13") === R.filter(r => num("E" + r) < 10).length],
      ["In <b>G2:G8</b>, calculate revenue + VAT using the rate in B12 as an <b>absolute</b> reference ($B$12).",
        () => R.every(r => isF("G" + r) && /\$B\$12/i.test(cells["G" + r]) && near(num("G" + r), num("D" + r)*(1 + num("B12"))))]
    ];
    const list = ctx.html(`<ul class="task-list"></ul>`);
    list.innerHTML = TASKS.map(([t], i) => `<li id="ss-t${i}"><span class="tick" aria-hidden="true"></span><span class="t">${t}</span></li>`).join("");
    const done = ctx.html(`<p class="note" style="margin-top:.6rem"></p>`);
    function checkTasks(){
      let n = 0;
      TASKS.forEach(([, ok], i) => {
        let pass = false; try{ pass = !!ok(); }catch(e){}
        const li = list.querySelector("#ss-t" + i); li.classList.toggle("done", pass); li.querySelector(".tick").textContent = pass ? "✓" : "";
        n += pass;
      });
      done.className = "note" + (n === TASKS.length ? " ok" : "");
      done.innerHTML = n === TASKS.length ? "All tasks complete — now press <b>Show formulas</b> to check your evidence." : `${n} of ${TASKS.length} tasks complete. Functions: SUM, AVERAGE, MIN, MAX, COUNT, COUNTA, COUNTIF, SUMIF, IF, ROUND, VLOOKUP.`;
    }
    select(sel, false);
  }
});

/* ───────────── DATABASE QUERIES ───────────── */
Lab.register({
  id:"database", subject:"ict", topic:"Databases", icon:"🗄️",
  title:"Database search queries",
  summary:"Use a query grid with criteria, AND/OR, wildcards and sorting to find records in a car sales database.",
  aim:"Search a database using a query grid: choose the fields to show, set criteria (including AND, OR, wildcards and ranges) and sort the results.",
  variables:null,
  layout:"wide", stageTitle:"Query design · Cars table", controlsTitle:"Tasks",
  questions:[
    { q:"What is the difference between an AND query and an OR query?",
      a:"AND: a record must meet every criterion (criteria on the same row of the grid). OR: a record is shown if it meets any one of them (criteria on different rows)." },
    { q:"What does the criterion Like \"C*\" in the Model field find?",
      a:"All records whose Model starts with C. * is a wildcard for any number of characters; ? stands for exactly one character." },
    { q:"Which data type should the Electric field have, and why?",
      a:"Boolean (Yes/No), because there are only two possible values. It uses less storage and makes searches simpler." },
    { q:"Why is Reg a suitable primary key?",
      a:"Each car has a unique registration, so it identifies each record uniquely and is never blank." }
  ],
  setup(ctx){
    const FIELDS = [["Reg","text"],["Make","text"],["Model","text"],["Colour","text"],["Year","num"],["Price","num"],["Mileage","num"],["Electric","bool"]];
    const DATA = [
      ["KX19 ABC","Ford","Fiesta","Red",2019,8500,42000,false],["LM21 DEF","Tesla","Model 3","White",2021,32000,18000,true],
      ["AB15 GHI","Toyota","Corolla","Silver",2015,6200,88000,false],["CD20 JKL","Nissan","Leaf","Blue",2020,14500,26000,true],
      ["EF18 MNO","Ford","Focus","Blue",2018,9800,51000,false],["GH22 PQR","Kia","Niro","Grey",2022,24500,9000,true],
      ["IJ17 STU","Honda","Civic","Black",2017,8900,63000,false],["KL16 VWX","Vauxhall","Corsa","Red",2016,4900,71000,false],
      ["MN21 YZA","Renault","Zoe","White",2021,15800,21000,true],["OP19 BCD","Volkswagen","Golf","Grey",2019,13200,39000,false],
      ["QR14 EFG","Ford","Ka","Silver",2014,3200,95000,false],["ST22 HIJ","BMW","i3","Blue",2022,27500,12000,true],
      ["UV20 KLM","Toyota","Yaris","Red",2020,11900,30000,false],["WX18 NOP","Citroen","C3","White",2018,7400,47000,false],
      ["YZ21 QRS","Hyundai","Kona","Red",2021,19900,24000,true],["BC17 TUV","Skoda","Fabia","Blue",2017,6900,58000,false],
      ["DE19 WXY","Ford","Puma","Black",2019,15400,35000,false],["FG22 ZAB","MG","ZS","Grey",2022,21000,15000,true],
      ["HJ15 CDE","Peugeot","208","Silver",2015,5600,76000,false],["JK20 FGH","Kia","Ceed","White",2020,12800,33000,false]
    ].map((r, id) => ({ id, v:r }));
    const fresh = () => FIELDS.map(() => ({ show:true, sort:"", crit:"", or:"" }));
    let q = fresh();

    /* ── criteria parser (Access-style) ── */
    function lit(s, type){
      s = s.trim();
      const m = /^"(.*)"$/.exec(s); if(m) s = m[1];
      if(type === "num"){ const n = Number(s); if(s === "" || !isFinite(n)) throw new Error("expects a number"); return n; }
      if(type === "bool"){ const t = s.toLowerCase(); if(["yes","true","-1"].includes(t)) return true; if(["no","false","0"].includes(t)) return false; throw new Error("expects Yes or No"); }
      return s.toLowerCase();
    }
    function compile(text, type){
      let s = text.trim(); if(!s) return null;
      let neg = false;
      const nm = /^not\s+(.*)$/i.exec(s); if(nm){ neg = true; s = nm[1]; }
      let f;
      const bt = /^between\s+(.+?)\s+and\s+(.+)$/i.exec(s);
      const lk = /^like\s+(.+)$/i.exec(s);
      if(bt){ const a = lit(bt[1], type), b = lit(bt[2], type); f = v => (type === "text" ? v.toLowerCase() : v) >= a && (type === "text" ? v.toLowerCase() : v) <= b; }
      else if(lk){
        if(type !== "text") throw new Error("Like works on text fields");
        const pat = lit(lk[1], "text").replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".").replace(/#/g, "\\d");
        const re = new RegExp("^" + pat + "$", "i"); f = v => re.test(v);
      }else{
        const m = /^(<=|>=|<>|<|>|=)?\s*(.*)$/.exec(s), op = m[1] || "=", b = lit(m[2], type);
        if(type === "bool" && !["=","<>"].includes(op)) throw new Error("use = or <> with Yes/No");
        f = v => { const a = type === "text" ? v.toLowerCase() : v;
          return { "=":a === b, "<>":a !== b, "<":a < b, ">":a > b, "<=":a <= b, ">=":a >= b }[op]; };
      }
      return neg ? v => !f(v) : f;
    }

    function run(){
      const errs = {};
      const rowsOf = key => FIELDS.map(([name, type], i) => { try{ return compile(q[i][key], type); }catch(e){ errs[key + i] = name + " " + e.message; return null; } });
      const c1 = rowsOf("crit"), c2 = rowsOf("or");
      const has2 = q.some(f => f.or.trim());
      const match = (cr, r) => cr.every((f, i) => !f || f(r.v[i]));
      let res = DATA.filter(r => match(c1, r) || (has2 && match(c2, r)));
      const sorts = q.map((f, i) => [f.sort, i]).filter(([s]) => s);
      if(sorts.length) res = res.slice().sort((a, b) => {
        for(const [dir, i] of sorts){ const x = a.v[i], y = b.v[i]; if(x < y) return dir === "asc" ? -1 : 1; if(x > y) return dir === "asc" ? 1 : -1; }
        return 0;
      });
      return { res, errs, shown:FIELDS.map((f, i) => i).filter(i => q[i].show) };
    }

    ctx.stage.innerHTML = `
      <div style="overflow:auto"><table class="qgrid" id="db-grid"></table></div>
      <div class="btns" style="margin:.6rem 0 .9rem;align-items:center">
        <button class="btn small" type="button" id="db-clear">Clear grid</button>
        <span style="font-size:.78rem;color:var(--txt3)">Examples: <span class="mono">Ford</span> · <span class="mono">&gt;10000</span> · <span class="mono">Like "C*"</span> · <span class="mono">Between 2018 And 2020</span> · <span class="mono">Not Red</span> · <span class="mono">Yes</span></span>
      </div>
      <div id="db-err"></div>
      <div style="overflow:auto;max-height:380px"><table class="rt" id="db-res"></table></div>`;
    const $ = s => ctx.stage.querySelector(s);
    const grid = $("#db-grid");
    grid.innerHTML = `
      <thead><tr><th></th>${FIELDS.map(([n]) => `<th>${n}</th>`).join("")}</tr></thead>
      <tbody>
        <tr><td>Show</td>${FIELDS.map((f, i) => `<td style="text-align:center"><input type="checkbox" data-i="${i}" data-k="show" aria-label="Show ${f[0]}"></td>`).join("")}</tr>
        <tr><td>Sort</td>${FIELDS.map((f, i) => `<td><select data-i="${i}" data-k="sort" aria-label="Sort ${f[0]}"><option value=""></option><option value="asc">Ascending</option><option value="desc">Descending</option></select></td>`).join("")}</tr>
        <tr><td>Criteria</td>${FIELDS.map((f, i) => `<td><input type="text" data-i="${i}" data-k="crit" aria-label="Criteria for ${f[0]}"></td>`).join("")}</tr>
        <tr><td>or</td>${FIELDS.map((f, i) => `<td><input type="text" data-i="${i}" data-k="or" aria-label="Or criteria for ${f[0]}"></td>`).join("")}</tr>
      </tbody>`;
    function syncGrid(){
      grid.querySelectorAll("[data-k]").forEach(e => { const f = q[+e.dataset.i]; if(e.type === "checkbox") e.checked = f.show; else e.value = f[e.dataset.k]; });
    }
    grid.addEventListener("input", e => {
      const t = e.target; if(!t.dataset.k) return;
      q[+t.dataset.i][t.dataset.k] = t.type === "checkbox" ? t.checked : t.value; refresh();
    });
    grid.addEventListener("change", e => { const t = e.target; if(t.tagName === "SELECT"){ q[+t.dataset.i].sort = t.value; refresh(); } });
    $("#db-clear").onclick = () => { q = fresh(); syncGrid(); refresh(); };

    const show = (v, type, name) => type === "bool" ? (v ? "Yes" : "No") : type === "num" && name !== "Year" ? v.toLocaleString("en-GB") : String(v);
    function refresh(){
      const { res, errs, shown } = run();
      grid.querySelectorAll("input[type=text]").forEach(e => { e.style.borderColor = errs[e.dataset.k + e.dataset.i] ? "var(--hi)" : ""; });
      $("#db-err").innerHTML = Object.values(errs).map(m => `<p class="note bad" style="margin-bottom:.5rem">Criteria ignored: ${ctx.esc(m)}</p>`).join("");
      $("#db-res").innerHTML = !shown.length ? `<tbody><tr><td class="empty">Tick at least one field to show.</td></tr></tbody>`
        : `<thead><tr>${shown.map(i => `<th>${FIELDS[i][0]}</th>`).join("")}</tr></thead><tbody>${res.length
          ? res.map(r => `<tr>${shown.map(i => `<td>${ctx.esc(show(r.v[i], FIELDS[i][1], FIELDS[i][0]))}</td>`).join("")}</tr>`).join("")
          : `<tr><td colspan="${shown.length}" class="empty">No records match.</td></tr>`}</tbody>`;
      ctx.readout([["Records found", res.length + " of " + DATA.length], ["Fields shown", String(shown.length)]]);
      checkTasks(res, shown);
    }

    /* ── tasks: compare against the expected set of records (and order / fields when it matters) ── */
    const F = n => FIELDS.findIndex(f => f[0] === n);
    const TASKS = [
      { t:"Show only the <b>Make, Model and Price</b> of all <b>Ford</b> cars.", want:r => r.v[F("Make")] === "Ford", fields:["Make","Model","Price"] },
      { t:"Find cars with a <b>Price under 10000</b>, sorted by Price ascending.", want:r => r.v[F("Price")] < 10000, sort:[F("Price"),"asc"] },
      { t:"Find <b>electric</b> cars made in <b>2021 or later</b>.", want:r => r.v[F("Electric")] && r.v[F("Year")] >= 2021 },
      { t:"Find all cars that are <b>Red or Blue</b> (use the <i>or</i> row).", want:r => ["Red","Blue"].includes(r.v[F("Colour")]) },
      { t:"Find every car whose <b>Model starts with C</b> (use a wildcard).", want:r => /^c/i.test(r.v[F("Model")]) },
      { t:"Find cars with <b>Mileage between 20000 and 50000</b>, highest mileage first.", want:r => r.v[F("Mileage")] >= 20000 && r.v[F("Mileage")] <= 50000, sort:[F("Mileage"),"desc"] }
    ];
    const list = ctx.html(`<ul class="task-list"></ul>`);
    list.innerHTML = TASKS.map((k, i) => `<li id="db-t${i}"><span class="tick" aria-hidden="true"></span><span class="t">${k.t}</span></li>`).join("");
    const solved = new Set(load());
    function load(){ try{ return JSON.parse(localStorage.getItem("vlab-db-done")) || []; }catch(e){ return []; } }
    function checkTasks(res, shown){
      TASKS.forEach((k, i) => {
        const exp = DATA.filter(k.want);
        let ok = res.length === exp.length && exp.every(r => res.includes(r));
        if(ok && k.fields) ok = shown.length === k.fields.length && k.fields.every(n => shown.includes(F(n)));
        if(ok && k.sort){ const [fi, dir] = k.sort; ok = res.every((r, j) => !j || (dir === "asc" ? res[j-1].v[fi] <= r.v[fi] : res[j-1].v[fi] >= r.v[fi])); }
        if(ok && !solved.has(i)){ solved.add(i); try{ localStorage.setItem("vlab-db-done", JSON.stringify([...solved])); }catch(e){} ctx.toast("Task " + (i + 1) + " complete!"); }
        const li = list.querySelector("#db-t" + i), d = solved.has(i);
        li.classList.toggle("done", d); li.querySelector(".tick").textContent = d ? "✓" : "";
        li.style.fontWeight = ok ? "600" : "";
      });
    }
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3);margin-top:.5rem">Criteria on the same row are joined with AND. Tasks tick off as soon as your query produces the right records.</p>`);
    ctx.buttons([{ label:"Reset task ticks", onClick(){ solved.clear(); try{ localStorage.removeItem("vlab-db-done"); }catch(e){} refresh(); } }]);
    syncGrid(); refresh();
  }
});

/* ───────────── VALIDATION & TEST DATA ───────────── */
Lab.register({
  id:"validation", subject:"ict", topic:"Validation & verification", icon:"✅",
  title:"Validation checks & test data",
  summary:"Try normal, extreme and abnormal data against range, length, type, format, presence and check-digit rules.",
  aim:"Test validation rules with normal, extreme and abnormal data and record the results in a test plan.",
  variables:null,
  columns:[{key:"rule",label:"Validation check"},{key:"data",label:"Test data"},{key:"mine",label:"Your type"},{key:"exp",label:"Correct type"},{key:"out",label:"Outcome"}],
  questions:[
    { q:"What is the difference between validation and verification?",
      a:"Validation is an automatic check by the computer that data is sensible/reasonable (meets rules). Verification checks that data has been copied or entered accurately, e.g. by double entry or a visual check. Neither guarantees the data is correct." },
    { q:"Give examples of normal, extreme and abnormal test data for a range check of 11 to 18.",
      a:"Normal: 14 (accepted). Extreme: 11 and 18 (the boundaries — should be accepted). Abnormal: 25, -3 or 'twelve' (should be rejected)." },
    { q:"An age of 15 is entered as 51. Which check would catch this, and which would not?",
      a:"A range check (11–18) would reject 51. A type check would not, because 51 is still a whole number." },
    { q:"How does a check digit detect errors?",
      a:"A calculation is done on the other digits to produce the check digit, which is stored with the number. When the number is entered, the calculation is repeated; if the result doesn’t match the check digit, an error (e.g. a transposition) has been made." }
  ],
  setup(ctx){
    const isInt = s => /^-?\d+$/.test(s.trim());
    function isbn13(s){
      const d = s.replace(/[-\s]/g, "");
      if(!/^\d{13}$/.test(d)) return { ok:false, why:"an ISBN-13 must be 13 digits", steps:null };
      let sum = 0; const parts = [];
      for(let i=0;i<12;i++){ const w = i % 2 ? 3 : 1; sum += +d[i]*w; parts.push(`${d[i]}×${w}`); }
      const cd = (10 - sum % 10) % 10;
      return { ok: cd === +d[12], why: cd === +d[12] ? "check digit matches" : `check digit should be ${cd}, not ${d[12]}`,
        steps:`${parts.join(" + ")} = ${sum}<br>${sum} mod 10 = ${sum % 10} → check digit = (10 − ${sum % 10}) mod 10 = <b>${cd}</b>` };
    }
    const RULES = {
      range:{ name:"Range check", field:"Age", desc:"Age must be a whole number from 11 to 18.", ph:"e.g. 14",
        test(s){ if(!isInt(s)) return [false,"not a whole number"]; const n = +s; return n >= 11 && n <= 18 ? [true,"within 11–18"] : [false,"outside 11–18"]; },
        kind(s){ if(!isInt(s)) return "Abnormal"; const n = +s; return n === 11 || n === 18 ? "Extreme" : n > 11 && n < 18 ? "Normal" : "Abnormal"; } },
      length:{ name:"Length check", field:"Password", desc:"Password must be 8 to 12 characters long.", ph:"e.g. Secret123",
        test(s){ return s.length >= 8 && s.length <= 12 ? [true, s.length + " characters"] : [false, s.length + " characters (needs 8–12)"]; },
        kind(s){ return s.length === 8 || s.length === 12 ? "Extreme" : s.length > 8 && s.length < 12 ? "Normal" : "Abnormal"; } },
      type:{ name:"Type check", field:"Quantity", desc:"Quantity must be a whole number (integer).", ph:"e.g. 5",
        test(s){ return isInt(s) ? [true,"is an integer"] : [false,"not an integer"]; },
        kind(s){ return isInt(s) ? "Normal" : "Abnormal"; } },
      format:{ name:"Format check", field:"Student ID", desc:"Student ID must be two capital letters then four digits, e.g. AB1234.", ph:"e.g. AB1234",
        test(s){ return /^[A-Z]{2}\d{4}$/.test(s) ? [true,"matches LL9999"] : [false,"does not match LL9999"]; },
        kind(s){ return /^[A-Z]{2}\d{4}$/.test(s) ? "Normal" : "Abnormal"; } },
      presence:{ name:"Presence check", field:"Surname", desc:"Surname must not be left blank.", ph:"leave blank to test",
        test(s){ return s.trim() ? [true,"data present"] : [false,"field is empty"]; },
        kind(s){ return s.trim() ? "Normal" : "Abnormal"; } },
      check:{ name:"Check digit (ISBN-13)", field:"ISBN", desc:"The last digit of an ISBN-13 is calculated from the first twelve.", ph:"e.g. 978-0-306-40615-7",
        test(s){ const r = isbn13(s); return [r.ok, r.why]; },
        kind(s){ return isbn13(s).ok ? "Normal" : "Abnormal"; } }
    };
    let rule = "range", mine = "Normal";

    ctx.stage.innerHTML = `
      <div style="width:100%;max-width:440px;padding:1.2rem">
        <div style="background:var(--bg-card);border:1px solid var(--brd);border-radius:14px;padding:1.1rem 1.2rem;box-shadow:var(--sh-md)">
          <div style="font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--txt3);font-weight:600">Data entry form</div>
          <label for="va-in" id="va-lbl" style="display:block;font-weight:600;margin:.6rem 0 .3rem"></label>
          <input class="inp" id="va-in" autocomplete="off" spellcheck="false">
          <p id="va-desc" style="font-size:.8rem;color:var(--txt3);margin-top:.35rem"></p>
          <div id="va-msg" style="margin-top:.8rem"></div>
          <div id="va-steps" style="margin-top:.6rem;font-size:.8rem;color:var(--txt2)" class="mono"></div>
        </div>
      </div>`;
    const $ = s => ctx.stage.querySelector(s);
    const inp = $("#va-in");
    function show(){
      const R = RULES[rule];
      $("#va-lbl").textContent = R.field; $("#va-desc").textContent = "Rule: " + R.desc; inp.placeholder = R.ph;
      $("#va-msg").innerHTML = ""; $("#va-steps").innerHTML = "";
      ctx.readout([["Check", R.name], ["Field", R.field]]);
    }
    function submit(){
      const R = RULES[rule], s = inp.value, [ok, why] = R.test(s), exp = R.kind(s);
      $("#va-msg").innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${ok ? "✓ Accepted" : "✗ Rejected"} — ${ctx.esc(why)}</div>`;
      $("#va-steps").innerHTML = rule === "check" && isbn13(s).steps ? isbn13(s).steps : "";
      const right = mine === exp;
      ctx.readout([["Check", R.name], ["Outcome", ok ? "accepted" : "rejected", ok ? "good" : "warn"],
        ["Your test-data type", mine + (right ? " ✓" : " ✗ — it’s " + exp.toLowerCase()), right ? "good" : "warn"]]);
      ctx.record({ rule:R.name, data:s === "" ? "(blank)" : s, mine, exp, out:ok ? "Accepted" : "Rejected" }, true);
    }
    inp.addEventListener("keydown", e => { if(e.key === "Enter"){ e.preventDefault(); submit(); } });

    ctx.select({ label:"Validation check", value:rule, options:Object.entries(RULES).map(([k, r]) => [k, r.name]), onChange(v){ rule = v; inp.value = ""; show(); } });
    ctx.seg({ label:"I think this test data is…", value:mine, options:[["Normal","Normal"],["Extreme","Extreme"],["Abnormal","Abnormal"]], onChange(v){ mine = v; },
      hint:"Normal: valid, should be accepted. Extreme: on the boundary, should be accepted. Abnormal: invalid, should be rejected." });
    ctx.buttons([{ label:"Submit data", primary:true, block:true, onClick:submit }]);
    ctx.html(`<p class="hint" style="font-size:.78rem;color:var(--txt3)">Build a test plan: for each check, try at least one normal, one extreme (where it applies) and one abnormal value.</p>`);
    show();
  }
});

"use strict";
/* ══════════════════════════════════════════════════════════════════
   KIT — shared building blocks for hands-on benches
   Kit.DEFS        gradients for glass, metal, wood, liquid (put inside <defs>)
   Kit.style(ctx)  common SVG text/hover styles for a bench
   Kit.tweens(ctx) tiny animation helper: add(obj, {prop:target}, secs, done)
   Kit.stopwatch   an SVG stopwatch the student starts and stops
   Kit.answer      an answer box that checks a typed value
   Kit.mean / halfRange / round / clamp / snap
══════════════════════════════════════════════════════════════════ */
const Kit = (function(){
  const DEFS = `
    <linearGradient id="k-glass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".24"/><stop offset=".28" stop-color="#fff" stop-opacity=".05"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".16"/></linearGradient>
    <linearGradient id="k-metal" x1="0" x2="1"><stop offset="0" stop-color="#6B7486"/><stop offset=".5" stop-color="#B4BCCB"/><stop offset="1" stop-color="#5A6272"/></linearGradient>
    <linearGradient id="k-metalv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B4BCCB"/><stop offset="1" stop-color="#5A6272"/></linearGradient>
    <linearGradient id="k-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9B07A"/><stop offset="1" stop-color="#A97B47"/></linearGradient>
    <linearGradient id="k-water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8EC5F5" stop-opacity=".55"/><stop offset="1" stop-color="#4C86C6" stop-opacity=".7"/></linearGradient>
    <linearGradient id="k-brass" x1="0" x2="1"><stop offset="0" stop-color="#9C7A2B"/><stop offset=".5" stop-color="#E8C76A"/><stop offset="1" stop-color="#8A6A22"/></linearGradient>
    <radialGradient id="k-glow"><stop offset="0" stop-color="#FFF4B8"/><stop offset=".45" stop-color="#FFD24A" stop-opacity=".7"/><stop offset="1" stop-color="#FFD24A" stop-opacity="0"/></radialGradient>
    <filter id="k-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity=".35"/></filter>`;
  const CSS = `
    .kb{touch-action:none}
    .kb .k-num{font:500 10px 'JetBrains Mono',monospace;fill:var(--txt2)}
    .kb .k-numb{font:600 12px 'JetBrains Mono',monospace;fill:var(--txt)}
    .kb .k-lbl{font:500 11px Inter,sans-serif;fill:var(--txt3)}
    .kb .k-tag{font:600 11px Inter,sans-serif;fill:var(--txt2)}
    .kb .k-hint{font:600 11px Inter,sans-serif;fill:var(--accent)}
    .kb .k-status{font:600 15px 'Space Grotesk',sans-serif;fill:var(--txt)}
    .kb .k-read{font:600 13px 'JetBrains Mono',monospace;fill:var(--accent);paint-order:stroke;stroke:var(--bg2);stroke-width:4px}
    .kb .k-lcd{font:600 20px 'JetBrains Mono',monospace;fill:#7CFFB2}
    .kb .k-btn{cursor:pointer}
    .kb .k-btn:hover rect{stroke:var(--accent)}
    .kb .k-drag{cursor:grab}
    .kb .k-drag:hover{filter:drop-shadow(0 0 6px color-mix(in srgb,var(--accent) 65%,transparent))}
    .kb .k-bench{fill:color-mix(in srgb,var(--bg-card) 85%,#5a4630 15%)}`;
  function style(ctx){ const s = document.createElement("style"); s.textContent = CSS; ctx.stage.appendChild(s); }
  const bench = (w, y) => `<rect x="0" y="${y}" width="${w}" height="60" class="k-bench"/><line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="var(--brd2)"/>`;

  function tweens(ctx){
    const list = [];
    ctx.frame(dt => {
      for(let i = list.length - 1; i >= 0; i--){
        const t = list[i]; t.t += dt; const f = Math.min(1, t.t/t.dur), e = t.ease ? t.ease(f) : 1 - Math.pow(1 - f, 3);
        for(const k in t.to) t.obj[k] = t.from[k] + (t.to[k] - t.from[k])*e;
        if(f >= 1){ list.splice(i, 1); t.done && t.done(); }
      }
      if(list.length && api.onFrame) api.onFrame();
    });
    const api = {
      add(obj, to, dur, done, ease){
        for(let i = list.length - 1; i >= 0; i--) if(list[i].obj === obj) list.splice(i, 1);
        const from = {}; for(const k in to) from[k] = obj[k];
        list.push({ obj, from, to, dur:dur || .35, t:0, done, ease });
      },
      busy: obj => list.some(t => t.obj === obj),
      onFrame:null
    };
    return api;
  }

  /* student-operated stopwatch: call sw.tick(dt) every frame; reads to 0.01 s */
  function stopwatch(id, x, y){
    const sw = {
      t:0, running:false, laps:[],
      svg:`<g id="${id}" transform="translate(${x} ${y})">
        <rect width="168" height="96" rx="14" fill="#1F2937" stroke="#4B5563" stroke-width="1.5"/>
        <rect x="12" y="10" width="144" height="40" rx="6" fill="#132A1F"/>
        <text x="146" y="39" text-anchor="end" class="k-lcd" id="${id}-t">0.00</text>
        <text x="20" y="25" style="font:600 8px Inter;fill:#5FBF8A">s</text>
        <g class="k-btn" id="${id}-ss"><rect x="12" y="58" width="68" height="28" rx="8" fill="#0F172A" stroke="#334155"/><text x="46" y="77" text-anchor="middle" style="font:700 11px Inter;fill:#E5E7EB" id="${id}-ssl">START</text></g>
        <g class="k-btn" id="${id}-rs"><rect x="88" y="58" width="68" height="28" rx="8" fill="#0F172A" stroke="#334155"/><text x="122" y="77" text-anchor="middle" style="font:700 11px Inter;fill:#E5E7EB">RESET</text></g>
      </g>`,
      bind(root, onChange){
        const q = s => root.querySelector("#" + id + s);
        q("-ss").addEventListener("pointerdown", e => { e.stopPropagation(); sw.running = !sw.running; q("-ssl").textContent = sw.running ? "STOP" : "START"; onChange && onChange(sw); });
        q("-rs").addEventListener("pointerdown", e => { e.stopPropagation(); if(sw.running) return; sw.t = 0; onChange && onChange(sw); });
        sw._q = q;
      },
      tick(dt){ if(sw.running) sw.t += dt; if(sw._q) sw._q("-t").textContent = sw.t.toFixed(2); },
      stop(){ sw.running = false; if(sw._q) sw._q("-ssl").textContent = "START"; },
      reset(){ sw.running = false; sw.t = 0; if(sw._q){ sw._q("-ssl").textContent = "START"; sw._q("-t").textContent = "0.00"; } }
    };
    return sw;
  }

  /* liquid-in-glass thermometer, scale min..max over length h (bulb at the bottom) */
  function thermometer(id, x, y, h, min, max, step){
    step = step || 10;
    let ticks = "";
    for(let v = min; v <= max + 1e-9; v += step/5){
      const yy = y + h - (v - min)/(max - min)*h, major = Math.abs(v/step - Math.round(v/step)) < 1e-6;
      ticks += `<line x1="${x + 6}" y1="${yy}" x2="${x + (major ? 14 : 10)}" y2="${yy}" stroke="#334155" stroke-width="${major ? 1.1 : .6}"/>`;
      if(major) ticks += `<text x="${x + 17}" y="${yy + 3.5}" style="font:500 9px 'JetBrains Mono',monospace;fill:#334155">${Math.round(v)}</text>`;
    }
    return {
      svg:`<g id="${id}"><rect x="${x - 9}" y="${y - 14}" width="50" height="${h + 40}" rx="9" fill="#F4F6FA" stroke="#9AA3B2"/>
        <rect x="${x - 3}" y="${y - 6}" width="6" height="${h + 10}" rx="3" fill="#fff" stroke="#9AA3B2" stroke-width=".8"/>
        <rect id="${id}-col" x="${x - 1.6}" width="3.2" fill="#E0334A"/><circle cx="${x}" cy="${y + h + 12}" r="7" fill="#E0334A"/>${ticks}</g>`,
      set(root, T){ const c = root.querySelector("#" + id + "-col"), yy = y + h - (Math.max(min, Math.min(max, T)) - min)/(max - min)*h; c.setAttribute("y", yy); c.setAttribute("height", y + h + 8 - yy); }
    };
  }

  function answer(ctx, label, placeholder, check, parent){
    const box = ctx.html(`<div class="ctl"><label><span>${label}</span></label>
      <div style="display:flex;gap:6px"><input class="inp" type="number" step="any" placeholder="${placeholder}"><button class="btn small" type="button">Check</button></div>
      <div style="margin-top:8px"></div></div>`, parent);
    const input = box.querySelector("input"), fb = box.querySelector("div:last-child");
    const run = () => {
      const v = parseFloat(input.value);
      if(!isFinite(v)){ fb.innerHTML = `<div class="note bad">Enter a number.</div>`; return; }
      const [ok, msg] = check(v);
      fb.innerHTML = `<div class="note ${ok ? "ok" : "bad"}">${msg}</div>`;
    };
    box.querySelector("button").onclick = run;
    input.addEventListener("keydown", e => { if(e.key === "Enter") run(); });
    return { box, input, clear(){ fb.innerHTML = ""; input.value = ""; } };
  }

  /* typed reading checked against the true value (for scales the student must read) */
  function reading(ctx, label, placeholder, getTrue, tol, onOk, parent){
    const box = ctx.html(`<div class="ctl"><label><span>${label}</span></label>
      <div style="display:flex;gap:6px"><input class="inp" type="number" step="any" placeholder="${placeholder}"><button class="btn small" type="button">Enter</button></div>
      <div style="margin-top:6px"></div></div>`, parent);
    const input = box.querySelector("input"), fb = box.querySelector("div:last-child");
    const go = () => {
      const v = parseFloat(input.value), t = getTrue();
      if(t === null || t === undefined){ fb.innerHTML = `<div class="note bad">Nothing to read yet.</div>`; return; }
      if(!isFinite(v) || Math.abs(v - t) > tol + 1e-9){ fb.innerHTML = `<div class="note bad">Look again — that doesn’t match the scale.</div>`; return; }
      fb.innerHTML = ""; onOk(v, t);
    };
    box.querySelector("button").onclick = go;
    input.addEventListener("keydown", e => { if(e.key === "Enter") go(); });
    return { box, input, clear(){ fb.innerHTML = ""; input.value = ""; } };
  }

  /* SVG-level drag manager — survives the dragged part being redrawn.
     h.hit(target, p) returns a handle (or null); h.move(handle, p, p0); h.end(handle, p, moved) */
  function dragger(ctx, svg, h){
    let d = null;
    svg.addEventListener("pointerdown", e => {
      if(e.button) return;
      const p = ctx.svgPoint(svg, e), handle = h.hit(e.target, p, e);
      if(handle === null || handle === undefined) return;
      e.preventDefault(); svg.setPointerCapture(e.pointerId);
      d = { handle, p0:p, moved:false };
      h.start && h.start(handle, p);
    });
    svg.addEventListener("pointermove", e => {
      const p = ctx.svgPoint(svg, e);
      if(!d){ h.hover && h.hover(p); return; }
      if(Math.hypot(p.x - d.p0.x, p.y - d.p0.y) > 4) d.moved = true;
      h.move && h.move(d.handle, p, d.p0);
    });
    const up = e => { if(!d) return; const x = d; d = null; h.end && h.end(x.handle, ctx.svgPoint(svg, e), x.moved); };
    svg.addEventListener("pointerup", up); svg.addEventListener("pointercancel", up);
    return { active: () => !!d, handle: () => d && d.handle };
  }

  const mean = a => a.reduce((s, v) => s + v, 0)/a.length;
  const halfRange = a => (Math.max(...a) - Math.min(...a))/2;
  const round = (v, dp) => { const f = Math.pow(10, dp); return Math.round(v*f)/f; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const snap = (v, s) => Math.round(v/s)*s;
  return { DEFS, style, bench, tweens, dragger, stopwatch, thermometer, answer, reading, mean, halfRange, round, clamp, snap };
})();

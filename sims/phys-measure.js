"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · MEASUREMENT — Vernier calipers & micrometer (IGCSE + AS)
   Drag the sliding jaw / thimble to close on an object, then read
   the scales yourself. Optional zero errors for AS.
══════════════════════════════════════════════════════════════════ */
Lab.register({
  id:"instruments", subject:"physics", level:["igcse","as"], topic:"Measurement", interactive:true,
  title:"Vernier calipers & micrometer",
  summary:"Close the jaws on real objects and read vernier calipers to 0.1 mm and a micrometer to 0.01 mm — including zero errors.",
  aim:"Use vernier calipers and a micrometer screw gauge correctly, read their scales, and correct for zero error.",
  stageTitle:"Measuring instruments", controlsTitle:"Your reading",
  thumb:`<svg viewBox="0 0 300 140"><rect x="30" y="40" width="250" height="18" rx="3" fill="#C7CDD6"/>${Array.from({length:24},(_,i)=>`<line x1="${50+i*9}" y1="58" x2="${50+i*9}" y2="${i%5?50:46}" stroke="#334155"/>`).join("")}
    <path d="M30 40h18v80h-18z" fill="#9AA3B2"/><g><rect x="140" y="56" width="90" height="22" fill="#B4BCCB"/><path d="M140 56h16v64h-16z" fill="#8A93A6"/></g><rect x="48" y="84" width="92" height="30" rx="4" fill="#4DA3FF" opacity=".75"/></svg>`,
  challenges:[
    { id:"vern5", title:"Five vernier readings", text:"Record 5 correct vernier calipers measurements." },
    { id:"mic5",  title:"Five micrometer readings", text:"Record 5 correct micrometer measurements." },
    { id:"zero",  title:"Correct a zero error", text:"Turn on zero errors, find the zero error and record a corrected measurement." }
  ],
  columns:[{key:"instr",label:"Instrument"},{key:"obj",label:"Object"},{key:"reading",label:"Reading / mm"},{key:"zero",label:"Zero error / mm"},{key:"size",label:"Corrected / mm"},{key:"ok",label:"Check"}],
  questions:[
    { q:"What is the precision of vernier calipers and of a micrometer screw gauge?",
      a:"Vernier calipers: 0.1 mm (some read 0.02 mm). Micrometer: 0.01 mm. A metre rule only reads to 1 mm." },
    { q:"How do you read vernier calipers?",
      a:"Read the main scale just before the vernier zero (e.g. 23 mm), then find the vernier mark that lines up exactly with a main-scale mark (e.g. the 4th) and add 0.4 mm → 23.4 mm." },
    { q:"How do you read a micrometer?",
      a:"Read the sleeve: whole and half millimetres visible (e.g. 5.5 mm). Add the thimble division on the reading line × 0.01 mm (e.g. 28 → 0.28 mm). Total 5.78 mm." },
    { q:"What is a zero error and how do you correct it?",
      a:"A non-zero reading when the jaws are fully closed. Measured value = reading − zero error. E.g. zero reading +0.02 mm, reading 1.37 mm → 1.35 mm. A negative zero error is added." },
    { q:"Why measure a wire’s diameter at several places and in different directions?",
      a:"The wire may not be perfectly uniform or circular. Taking several readings and averaging reduces random error." }
  ],
  setup(ctx){
    const VOBJ = [["Steel block",15,45,"block"],["Glass marble",14,22,"ball"],["Brass washer",18,26,"washer"],["Wooden dowel",8,20,"rod"],["Coin (diameter)",16,26,"coin"],["Rubber stopper",20,34,"stopper"]];
    const MOBJ = [["Copper wire",.2,1.2,"wire"],["Ball bearing",2,6,"ball"],["Coin (thickness)",1.5,2.5,"plate"],["Card (thickness)",.25,.8,"plate"],["Pencil lead",.5,2,"wire"],["Glass slide",.9,1.3,"plate"]];
    let mode = "vernier", withZero = false, obj, hasObj = true, gap = 0, z = 0, zeroKnown = null;
    const pick = a => a[Math.floor(Math.random()*a.length)];
    const res = () => mode === "vernier" ? 0.1 : 0.01;
    const SCALE = () => mode === "vernier" ? 10 : 40;
    function newObj(){
      const [name, mn, mx, shape] = pick(mode === "vernier" ? VOBJ : MOBJ);
      obj = { name, shape, size:Kit.round(mn + Math.random()*(mx - mn), mode === "vernier" ? 1 : 2) };
      z = withZero ? pick(mode === "vernier" ? [-0.3,-0.2,-0.1,0.1,0.2,0.3] : [-0.03,-0.02,-0.01,0.01,0.02,0.03]) : 0;
      zeroKnown = null; hasObj = true;
      gap = mode === "vernier" ? Math.min(70, obj.size + 10 + Math.random()*10) : Math.min(8.5, obj.size + 1 + Math.random()*1.5);
      readBox && readBox.clear(); zeroBox && zeroBox.clear();
      draw();
    }
    const minGap = () => hasObj ? obj.size : 0;
    const closed = () => Math.abs(gap - minGap()) < 1e-6;
    const scaleReading = () => Kit.round(gap + z, mode === "vernier" ? 1 : 2);

    ctx.stage.innerHTML = `<svg viewBox="0 0 980 520" class="kb" id="ms-svg"><defs>${Kit.DEFS}</defs><g id="ms-g"></g>
      <text x="24" y="34" class="k-status" id="ms-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ms-svg"), $ = s => svg.querySelector(s);

    function objSvg(x0, w, cy, hgt){
      const s = obj.shape, col = { block:"#8A93A6", ball:"#9AD0F5", washer:"url(#k-brass)", rod:"#C08A55", coin:"url(#k-brass)", stopper:"#C2410C", wire:"#D97706", plate:"#CBD5E1" }[s];
      if(s === "ball" || s === "coin" || s === "washer") return `<circle cx="${x0 + w/2}" cy="${cy}" r="${w/2}" fill="${col}" stroke="#1F2937" stroke-width="1.2"/>${s === "washer" ? `<circle cx="${x0 + w/2}" cy="${cy}" r="${w/5}" fill="var(--bg2)" stroke="#1F2937"/>` : ""}`;
      if(s === "wire") return `<rect x="${x0}" y="${cy - hgt/2}" width="${w}" height="${hgt}" fill="${col}" stroke="#7C2D12" stroke-width=".8"/>`;
      return `<rect x="${x0}" y="${cy - hgt/2}" width="${w}" height="${hgt}" rx="${s === "stopper" ? 6 : 2}" fill="${col}" stroke="#1F2937" stroke-width="1.2"/>`;
    }

    function drawVernier(){
      const O = 120, S = 10, X = O + gap*S, xv0 = X + z*S, CY = 330;
      let h = `<rect x="70" y="150" width="870" height="42" rx="4" fill="#D7DCE3" stroke="#8A93A6"/>`;
      for(let m = 0; m <= 80; m++){
        const x = O + m*S, L = m % 10 === 0 ? 20 : m % 5 === 0 ? 14 : 9;
        h += `<line x1="${x}" y1="192" x2="${x}" y2="${192 - L}" stroke="#1F2937" stroke-width="${m % 10 ? 1 : 1.5}"/>`;
        if(m % 10 === 0) h += `<text x="${x + (m ? 0 : 6)}" y="166" text-anchor="middle" style="font:600 12px 'JetBrains Mono';fill:#1F2937">${m/10}</text>`;
      }
      h += `<text x="905" y="166" style="font:600 10px Inter;fill:#475569">cm</text>`;
      h += `<path d="M88 150 H120 V452 Q120 464 108 464 H100 Q88 464 88 452 Z" fill="url(#k-metal)" stroke="#475569"/>`;
      if(hasObj) h += objSvg(O, obj.size*S, CY, obj.shape === "rod" ? Math.min(220, obj.size*S*.9) : 100);
      h += `<g id="ms-slide" class="k-drag"><rect x="${X - 14}" y="190" width="200" height="50" rx="4" fill="#C7CDD6" stroke="#64748B"/>
        <path d="M${X} 238 H${X + 32} V452 Q${X + 32} 464 ${X + 20} 464 H${X + 12} Q${X} 464 ${X} 452 Z" fill="url(#k-metal)" stroke="#475569"/>
        <rect x="${X + 120}" y="240" width="40" height="18" rx="9" fill="#64748B"/>`;
      for(let k = 0; k <= 10; k++){
        const x = xv0 + k*9, L = k % 5 === 0 ? 16 : 10;
        h += `<line x1="${x}" y1="192" x2="${x}" y2="${192 + L}" stroke="#1F2937" stroke-width="1"/>`;
        if(k % 5 === 0) h += `<text x="${x}" y="${223}" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#1F2937">${k}</text>`;
      }
      h += `<rect x="${X - 14}" y="150" width="200" height="314" fill="transparent"/></g>`;
      h += `<text x="${O}" y="500" class="k-lbl">Drag the sliding jaw until it closes on the object. Read the main scale, then the vernier line that lines up exactly.</text>`;
      return h;
    }
    function drawMicrometer(){
      const S = 40, Xf = 110 + gap*S, Xt = 320 + gap*S, val = gap + z, phi = ((val*100) % 50 + 50) % 50, CY = 210, SP = 11;
      let h = `<path d="M96 170 V330 Q96 390 156 390 H250 Q300 390 300 340 V250" fill="none" stroke="url(#k-metalv)" stroke-width="26" stroke-linecap="round"/>
        <rect x="70" y="182" width="40" height="56" rx="3" fill="url(#k-metal)" stroke="#475569"/>`;
      if(hasObj){ const w = obj.size*S; h += obj.shape === "ball" ? `<circle cx="${110 + w/2}" cy="${CY}" r="${w/2}" fill="#9AD0F5" stroke="#1F2937"/>` : objSvg(110, w, CY, obj.shape === "wire" ? 80 : 110); }
      h += `<rect x="${Xf}" y="196" width="${Xt - Xf}" height="28" fill="url(#k-metalv)" stroke="#475569"/>
        <rect x="290" y="176" width="${Xt - 290}" height="68" fill="#E2E6EC" stroke="#8A93A6"/>
        <line x1="320" y1="${CY}" x2="${Xt}" y2="${CY}" stroke="#1F2937" stroke-width="1.4"/>`;
      for(let m = 0; m <= 12; m++){
        const x = 320 + m*S; if(x <= Xt + .5){ h += `<line x1="${x}" y1="${CY}" x2="${x}" y2="${CY - (m % 5 ? 13 : 19)}" stroke="#1F2937" stroke-width="1.2"/>`; if(m % 5 === 0) h += `<text x="${x}" y="${CY - 23}" text-anchor="middle" style="font:600 12px 'JetBrains Mono';fill:#1F2937">${m}</text>`; }
        const xh = x + S/2; if(xh <= Xt + .5 && m < 12) h += `<line x1="${xh}" y1="${CY}" x2="${xh}" y2="${CY + 12}" stroke="#1F2937" stroke-width="1.2"/>`;
      }
      h += `<g id="ms-thimble" class="k-drag"><rect x="${Xt}" y="150" width="170" height="120" rx="8" fill="url(#k-metalv)" stroke="#475569"/>
        <rect x="${Xt}" y="150" width="30" height="120" fill="#D5DBE3" stroke="#475569"/>`;
      for(let k = Math.floor(phi) - 6; k <= Math.ceil(phi) + 6; k++){
        const y = CY - (k - phi)*SP; if(y < 154 || y > 266) continue;
        const d = ((k % 50) + 50) % 50;
        h += `<line x1="${Xt}" y1="${y}" x2="${Xt + (d % 5 ? 12 : 20)}" y2="${y}" stroke="#1F2937" stroke-width="${d % 5 ? 1 : 1.5}"/>`;
        if(d % 5 === 0) h += `<text x="${Xt + 36}" y="${y + 4}" style="font:600 12px 'JetBrains Mono';fill:#1F2937">${d}</text>`;
      }
      for(let k = 0; k < 9; k++) h += `<line x1="${Xt + 66 + k*11}" y1="154" x2="${Xt + 66 + k*11}" y2="266" stroke="#64748B" opacity=".55"/>`;
      h += `<rect x="${Xt + 170}" y="184" width="40" height="52" rx="6" fill="#64748B" stroke="#475569"/></g>`;
      h += `<text x="70" y="440" class="k-lbl">Drag the thimble left to close the gap (drag up/down for fine turns). Read the sleeve (whole and half mm), then the thimble line on the reading line.</text>`;
      return h;
    }
    function draw(){
      $("#ms-g").innerHTML = mode === "vernier" ? drawVernier() : drawMicrometer();
      svg.setAttribute("viewBox", mode === "vernier" ? "0 0 980 520" : "30 110 840 360");
      $("#ms-status").setAttribute("x", mode === "vernier" ? 24 : 54); $("#ms-status").setAttribute("y", mode === "vernier" ? 34 : 140);
      $("#ms-status").textContent = (hasObj ? obj.name : "No object — jaws closing on nothing") + (withZero ? " · zero error ON" : "");
      ctx.readout([["Instrument", mode === "vernier" ? "Vernier calipers (0.1 mm)" : "Micrometer (0.01 mm)"], ["Object", hasObj ? obj.name : "none"],
        ["Jaws", closed() ? "closed — read the scale" : "open", closed() ? "good" : ""]]);
    }
    /* drag handled on the <svg> itself, because the parts are redrawn while dragging */
    let drag = null, raf = 0;
    const redraw = () => { if(!raf) raf = requestAnimationFrame(() => { raf = 0; draw(); }); };
    svg.addEventListener("pointerdown", e => {
      if(!e.target.closest("#ms-slide,#ms-thimble")) return;
      e.preventDefault(); svg.setPointerCapture(e.pointerId);
      drag = { p0:ctx.svgPoint(svg, e), g0:gap };
    });
    svg.addEventListener("pointermove", e => {
      if(!drag) return;
      const p = ctx.svgPoint(svg, e);
      let g = drag.g0 + (p.x - drag.p0.x)/SCALE() - (mode === "micro" ? (p.y - drag.p0.y)*0.004 : 0);
      g = Kit.clamp(g, minGap(), mode === "vernier" ? 72 : 8.5);
      if(Math.abs(g - minGap()) < (mode === "vernier" ? .05 : .004)) g = minGap();
      gap = g; redraw();
    });
    const end = () => { drag = null; };
    svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);

    ctx.seg({ label:"Instrument", value:"vernier", options:[["vernier","Vernier calipers"],["micro","Micrometer"]], onChange(v){ mode = v; newObj(); } });
    ctx.seg({ label:"Zero error (AS)", value:false, options:[[false,"Off"],[true,"On"]], onChange(v){ withZero = v; newObj(); } });
    ctx.buttons([{ label:"New object", onClick:newObj }, { label:"Remove / replace object", onClick(){ hasObj = !hasObj; gap = Math.max(gap, minGap()); draw(); } }]);
    ctx.buttons([{ label:"◀ close a little", onClick(){ gap = Math.max(minGap(), gap - res()); draw(); } }, { label:"open a little ▶", onClick(){ gap = Math.min(mode === "vernier" ? 72 : 8.5, gap + res()); draw(); } }]);
    let readBox, zeroBox;
    zeroBox = Kit.reading(ctx, "Zero error / mm (close with no object)", "e.g. 0.02", () => (!hasObj && closed()) ? z : null, 1e-6, v => { zeroKnown = v; ctx.toast("Zero error noted: " + v.toFixed(mode === "vernier" ? 1 : 2) + " mm"); });
    readBox = Kit.reading(ctx, "Scale reading / mm", mode === "vernier" ? "e.g. 23.4" : "e.g. 5.78", () => hasObj && closed() ? scaleReading() : null, 0.004, v => {
      const zero = withZero ? (zeroKnown === null ? 0 : zeroKnown) : 0, corr = Kit.round(v - zero, mode === "vernier" ? 1 : 2);
      const ok = Math.abs(corr - obj.size) < 1e-6;
      ctx.record({ instr: mode === "vernier" ? "Vernier" : "Micrometer", obj:obj.name, reading:v.toFixed(mode === "vernier" ? 1 : 2), zero: zero ? zero.toFixed(mode === "vernier" ? 1 : 2) : "0", size:corr.toFixed(mode === "vernier" ? 1 : 2),
        ok: ok ? "✓ correct" : withZero && zeroKnown === null ? "✗ check the zero error" : "✗" });
      ctx.toast(ok ? "Correct!" : "Recorded — but the corrected value is wrong");
      const rows = ctx.rows();
      if(rows.filter(r => r.instr === "Vernier" && r.ok === "✓ correct").length >= 5) ctx.complete("vern5");
      if(rows.filter(r => r.instr === "Micrometer" && r.ok === "✓ correct").length >= 5) ctx.complete("mic5");
      if(rows.some(r => r.zero !== "0" && r.ok === "✓ correct")) ctx.complete("zero");
      newObj();
    });
    ctx.html(`<p class="hint">Tip: with zero error on, click <b>Remove object</b>, close the jaws fully and read the zero error first.</p>`);
    newObj();
  }
});

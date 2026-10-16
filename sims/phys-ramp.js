"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · MOTION ON A RAMP (IGCSE + AS) — trolley + light gates
   Drag the raised end to set the angle, drag the light gates along
   the ramp, release the trolley and read the timer.
══════════════════════════════════════════════════════════════════ */
Lab.register({
  id:"ramp", subject:"physics", level:["igcse","as"], topic:"Motion · Acceleration", interactive:true,
  title:"Trolley on a ramp with light gates",
  summary:"Set the slope, position two light gates, release the trolley and measure time, speed and acceleration. Find g from a against sin θ.",
  aim:"Investigate how distance travelled depends on time for a trolley accelerating down a slope, and how its acceleration depends on the angle of the slope.",
  variables:{ iv:"Distance to the light gate, or angle of the ramp", dv:"Time from release (s) and speed at the gate (m/s)", cv:["Same trolley and card (5.0 cm)","Released from rest at the same point","Same ramp surface"] },
  stageTitle:"Ramp and light gates", controlsTitle:"Run",
  thumb:`<svg viewBox="0 0 300 140"><path d="M30 40 L270 118" stroke="#D9B07A" stroke-width="8"/><rect x="18" y="40" width="26" height="80" fill="#A97B47"/>
    <g transform="translate(110 68) rotate(18)"><rect x="-26" y="-14" width="40" height="14" rx="3" fill="#4DA3FF"/><rect x="-6" y="-30" width="20" height="16" fill="#FBBF24"/></g>
    <g transform="translate(200 97) rotate(18)"><path d="M0 0V-46H8V0" fill="none" stroke="#A2ACBD" stroke-width="3"/><circle cx="4" cy="-28" r="3" fill="#FF5C7A"/></g></svg>`,
  challenges:[
    { id:"dist",  title:"Distance–time data", text:"At one angle, record 5 or more different gate distances. Plot d against t²." },
    { id:"angle", title:"Changing the slope", text:"Record 5 or more different angles at the same gate distance." },
    { id:"g",     title:"Find g", text:"Use the gradient of a against sin θ to estimate g." }
  ],
  columns:[{key:"theta",label:"θ / °",dp:1},{key:"sin",label:"sin θ",dp:3},{key:"h",label:"h / cm",dp:1},{key:"d",label:"d / m",dp:2},{key:"t",label:"t / s",dp:3},
    {key:"t2",label:"t² / s²",dp:4},{key:"v",label:"v / m s⁻¹",dp:3},{key:"v2",label:"v² / m² s⁻²",dp:4},{key:"a",label:"a = 2d/t² / m s⁻²",dp:3}],
  graph:{ x:["t2","d","sin","h","t"], y:["d","a","v","v2","t"], fit:"linear" },
  questions:[
    { q:"How does a light gate measure speed?",
      a:"A card of known length breaks the light beam. The timer records how long the beam is blocked. Speed = card length ÷ time blocked." },
    { q:"Why is a graph of d against t² a straight line through the origin?",
      a:"From rest with constant acceleration, d = ½at². So d ∝ t², and the gradient is a/2." },
    { q:"Why does a plot of a against sin θ have a gradient close to g?",
      a:"Down a slope the component of weight along the slope gives a = g sin θ (ignoring friction). Friction makes a slightly smaller, giving a negative intercept." },
    { q:"Give one advantage of light gates over a stopwatch.",
      a:"No human reaction time, so the timing is far more precise (to 0.001 s) and more accurate." },
    { q:"The card is 5.0 cm long and blocks the gate for 0.042 s. What is the speed?",
      a:"v = 0.050 ÷ 0.042 = 1.19 m/s." }
  ],
  setup(ctx){
    const B = [900, 430], LEN = 1.20, PX = 600, S0 = 0.10, CARD = 0.05, MU = 0.011, G = 9.81, END = 1.13;
    let theta = 10, g1 = .40, g2 = .90, run = null, speed = 1;
    const T = () => { const r = theta*Math.PI/180; return [B[0] - LEN*PX*Math.cos(r), B[1] - LEN*PX*Math.sin(r)]; };
    const pt = s => { const t = T(); return [t[0] + (B[0] - t[0])*s/LEN, t[1] + (B[1] - t[1])*s/LEN]; };
    const acc = () => { const r = theta*Math.PI/180; return Math.max(0, G*(Math.sin(r) - MU*Math.cos(r))); };
    const tAt = s => Math.sqrt(2*(s - S0)/acc());
    function gateTimes(g){ const a = acc(); if(a <= 0) return null; const t = tAt(g), tb = tAt(g + CARD); return { t, dt:tb - t }; }

    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="rp-svg"><defs>${Kit.DEFS}</defs>
      ${Kit.bench(960, 444)}
      <g id="rp-blocks"></g><g id="rp-ramp"></g><g id="rp-gates"></g><g id="rp-trolley"></g>
      <g id="rp-timer" transform="translate(24 60)"><rect width="250" height="128" rx="12" fill="#1F2937" stroke="#4B5563"/>
        <text x="14" y="22" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.08em">LIGHT-GATE TIMER</text>
        <text x="14" y="50" style="font:600 12px Inter;fill:#E5E7EB">Gate 1</text><text x="236" y="50" text-anchor="end" class="k-lcd" style="font-size:15px" id="rp-t1">—</text>
        <text x="14" y="76" style="font:600 12px Inter;fill:#E5E7EB">Gate 2</text><text x="236" y="76" text-anchor="end" class="k-lcd" style="font-size:15px" id="rp-t2">—</text>
        <text x="14" y="104" style="font:600 12px Inter;fill:#E5E7EB">Gate 2 blocked</text><text x="236" y="104" text-anchor="end" class="k-lcd" style="font-size:15px" id="rp-b2">—</text></g>
      <text x="24" y="34" class="k-status" id="rp-status"></text>
    </svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#rp-svg"), $ = s => svg.querySelector(s);

    function draw(){
      const t = T(), deg = theta, r = theta*Math.PI/180;
      // supports under the raised end
      let bl = ""; for(let y = 444; y > t[1] + 18; y -= 26) bl += `<rect x="${t[0] - 26}" y="${Math.max(t[1] + 16, y - 26)}" width="52" height="${Math.min(26, y - t[1] - 16)}" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      $("#rp-blocks").innerHTML = bl;
      let ramp = `<g transform="translate(${t[0]} ${t[1]}) rotate(${deg})"><rect x="0" y="0" width="${LEN*PX}" height="16" rx="3" fill="url(#k-wood)" stroke="#7B4F2C"/>`;
      for(let c = 0; c <= 120; c += 10) ramp += `<line x1="${c*PX/100}" y1="16" x2="${c*PX/100}" y2="${c % 50 ? 22 : 26}" stroke="var(--txt2)"/>${c % 20 === 0 ? `<text x="${c*PX/100}" y="36" text-anchor="middle" class="k-num">${c}</text>` : ""}`;
      ramp += `<line x1="${S0*PX}" y1="-6" x2="${S0*PX}" y2="16" stroke="var(--hi)" stroke-width="2"/><text x="${S0*PX}" y="-10" text-anchor="middle" class="k-lbl" style="fill:var(--hi)">release</text></g>`;
      ramp += `<circle cx="${t[0]}" cy="${t[1] - 2}" r="11" fill="var(--accent)" stroke="#fff" stroke-width="2" class="k-drag" id="rp-handle"/><text x="${t[0] + 16}" y="${t[1] - 14}" class="k-hint">drag ↕</text>`;
      ramp += `<text x="${B[0] - 120}" y="${B[1] - 20}" class="k-tag">θ = ${theta.toFixed(1)}°</text>`;
      $("#rp-ramp").innerHTML = ramp;
      // gates
      const sF = run ? run.s : S0, blocked = g => sF >= g && sF - CARD < g;
      $("#rp-gates").innerHTML = [g1, g2].map((g, i) => { const [x, y] = pt(g); return `<g data-g="${i}" class="k-drag" transform="translate(${x} ${y}) rotate(${deg})">
        <path d="M-5 0 V-78 H5 V0" fill="#334155" stroke="#1F2937"/><rect x="-9" y="-56" width="18" height="16" rx="3" fill="#0F172A"/>
        <circle cx="0" cy="-48" r="4" fill="${blocked(g) ? "#FF5C7A" : "#34D399"}"/><line x1="-30" y1="-48" x2="30" y2="-48" stroke="${blocked(g) ? "transparent" : "rgba(255,92,122,.4)"}" stroke-dasharray="2 3"/>
        <text x="0" y="-86" text-anchor="middle" class="k-tag" transform="rotate(${-deg} 0 -86)">G${i + 1}: ${Math.round((g - S0)*100)} cm</text>
        <rect x="-22" y="-100" width="44" height="100" fill="transparent"/></g>`; }).join("");
      // trolley (front of the card at sF)
      const [x, y] = pt(sF);
      $("#rp-trolley").innerHTML = `<g transform="translate(${x} ${y}) rotate(${deg})"><rect x="-72" y="-22" width="72" height="18" rx="4" fill="#4DA3FF" stroke="#1D4ED8"/>
        <circle cx="-58" cy="-3" r="5" fill="#111827"/><circle cx="-14" cy="-3" r="5" fill="#111827"/><rect x="-30" y="-54" width="30" height="32" fill="#FBBF24" stroke="#B45309"/></g>`;
      const a = acc();
      $("#rp-status").textContent = a <= 0 ? "Too shallow — friction stops the trolley. Raise the ramp." : run && run.done ? "Run finished — record the result" : run ? "Rolling…" : "Set the angle and gates, then release";
      ctx.readout([["Angle", theta.toFixed(1) + "°"], ["Height of raised end", (LEN*100*Math.sin(r)).toFixed(1) + " cm"], ["Gate 2 distance", ((g2 - S0)*100).toFixed(0) + " cm"], ["Speed", speed === 1 ? "real time" : "slow motion ×0.25"]]);
    }
    function showTimer(){
      const tt = run ? run.t : 0, e1 = run && run.e1, e2 = run && run.e2;
      $("#rp-t1").textContent = e1 ? e1.t.toFixed(3) + " s" : run ? Math.min(tt, 99).toFixed(3) + " s" : "—";
      $("#rp-t2").textContent = e2 ? e2.t.toFixed(3) + " s" : run ? Math.min(tt, 99).toFixed(3) + " s" : "—";
      $("#rp-b2").textContent = e2 && run.b2 ? e2.dt.toFixed(3) + " s" : "—";
    }
    ctx.frame(dt => {
      if(!run || run.done) return;
      run.t += dt*speed; const a = acc();
      run.s = Math.min(END, S0 + .5*a*run.t*run.t);
      if(!run.e1 && run.s >= g1) run.e1 = gateTimes(g1);
      if(!run.e2 && run.s >= g2) run.e2 = gateTimes(g2);
      if(run.e2 && run.s >= g2 + CARD) run.b2 = true;
      if(run.s >= END){ run.done = true; if(!run.b2 && run.e2) run.b2 = true; }
      draw(); showTimer();
    });

    Kit.dragger(ctx, svg, {
      hit(t){ if(run && !run.done) return null; if(t.closest("#rp-handle")) return { k:"h" }; const g = t.closest("[data-g]"); return g ? { k:"g", i:+g.dataset.g } : null; },
      move(h, p){
        run = null;
        if(h.k === "h"){ const s = Kit.clamp((B[1] - p.y)/(LEN*PX), Math.sin(3*Math.PI/180), Math.sin(30*Math.PI/180)); theta = Kit.round(Math.asin(s)*180/Math.PI, 1); angSl.set(theta); }
        else{
          const t = T(), ux = (B[0] - t[0])/(LEN*PX), uy = (B[1] - t[1])/(LEN*PX);
          let s = Kit.snap(((p.x - t[0])*ux + (p.y - t[1])*uy)/PX, .01);
          if(h.i === 0) g1 = Kit.clamp(s, .2, g2 - .1); else g2 = Kit.clamp(s, g1 + .1, 1.08);
        }
        draw(); showTimer();
      }
    });

    ctx.buttons([{ label:"Release trolley", primary:true, onClick(){ if(acc() <= 0){ ctx.toast("The trolley won’t move — increase the angle"); return; } run = { t:0, s:S0 }; } }, { label:"Reset", onClick(){ run = null; draw(); showTimer(); } }]);
    ctx.seg({ label:"Playback", value:1, options:[[1,"Real time"],[.25,"Slow motion"]], onChange(v){ speed = v; draw(); } });
    const angSl = ctx.slider({ label:"Angle (or drag the raised end)", min:3, max:30, step:.5, value:theta, unit:"°", onInput(v){ theta = v; run = null; draw(); showTimer(); } });
    ctx.buttons([{ label:"Record gate 2 result", block:true, onClick(){
      if(!run || !run.e2 || !run.b2){ ctx.toast("Release the trolley and let it pass gate 2 first"); return; }
      const r = theta*Math.PI/180, d = Kit.round(g2 - S0, 2), t = Kit.round(run.e2.t, 3), v = Kit.round(CARD/run.e2.dt, 3);
      ctx.record({ theta, sin:Kit.round(Math.sin(r), 3), h:Kit.round(LEN*100*Math.sin(r), 1), d, t, t2:Kit.round(t*t, 4), v, v2:Kit.round(v*v, 4), a:Kit.round(2*d/(t*t), 3) });
      const rows = ctx.rows();
      const byTheta = {}; rows.forEach(x => (byTheta[x.theta] = byTheta[x.theta] || new Set()).add(x.d));
      if(Object.values(byTheta).some(st => st.size >= 5)) ctx.complete("dist");
      const byD = {}; rows.forEach(x => (byD[x.d] = byD[x.d] || new Set()).add(x.theta));
      if(Object.values(byD).some(st => st.size >= 5)) ctx.complete("angle");
    } }]);
    Kit.answer(ctx, "g from your a–sin θ graph / m s⁻²", "e.g. 9.7", v => {
      const rows = ctx.rows(); const pts = rows.map(r => [r.sin, r.a]);
      if(new Set(rows.map(r => r.theta)).size < 4) return [false, "Record at least four different angles first."];
      const f = ctx.linFit(pts);
      if(Math.abs(v - f.m)/f.m <= .03){ ctx.complete("g"); return [true, `Correct — your gradient is ${f.m.toFixed(2)} m s⁻². (The accepted value is 9.81; friction lowers the line slightly.)`]; }
      return [false, "Plot a (y) against sin θ (x) with a straight line of best fit — g is the gradient."];
    });
    draw(); showTimer();
  }
});

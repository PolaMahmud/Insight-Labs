"use strict";
/* ══════════════════════════════════════════════════════════════════
   PHYSICS · WAVES — Ripple tank · Speed of sound
══════════════════════════════════════════════════════════════════ */

/* ───────────── RIPPLE TANK ───────────── */
Lab.register({
  id:"ripple", subject:"physics", level:["igcse"], topic:"Waves · Water waves", interactive:true,
  title:"Ripple tank",
  summary:"Make plane waves, freeze them with a strobe, measure the wavelength with a ruler, then explore reflection, refraction and diffraction.",
  aim:"Measure the wavelength and speed of water waves, and observe reflection, refraction and diffraction.",
  variables:{ iv:"Frequency of the dipper (Hz) / depth of water", dv:"Wavelength (cm) → speed v = fλ", cv:["Same depth of water (for v vs f)","Ruler held perpendicular to the wavefronts"] },
  stageTitle:"Ripple tank (view from above)", controlsTitle:"Tank",
  thumb:`<svg viewBox="0 0 300 140"><rect x="20" y="10" width="260" height="120" rx="8" fill="#0B2A4A"/>${[30,52,74,96,118].map(y => `<line x1="30" y1="${y}" x2="270" y2="${y}" stroke="#9BD3FF" stroke-width="5" opacity=".7"/>`).join("")}</svg>`,
  challenges:[
    { id:"vfl",     title:"v = fλ", text:"Measure λ in deep water at four or more frequencies." },
    { id:"shallow", title:"Waves slow down", text:"Measure λ in the shallow region (refraction mode)." },
    { id:"diff",    title:"Spreading out", text:"Make the gap about the same width as the wavelength (diffraction mode)." }
  ],
  columns:[{key:"region",label:"Region"},{key:"f",label:"f / Hz",dp:1},{key:"lam",label:"λ / cm",dp:2},{key:"v",label:"v = fλ / cm s⁻¹",dp:1},{key:"inv",label:"1/f / s",dp:3}],
  series:"region",
  graph:{ x:["inv","f"], y:["lam","v"], fit:"linear" },
  questions:[
    { q:"How can you measure the wavelength more accurately?",
      a:"Freeze the waves with a stroboscope (or a photo), measure across several wavelengths (e.g. 10) with a ruler and divide by the number of wavelengths." },
    { q:"What happens to the speed, wavelength and frequency when water waves enter shallower water?",
      a:"Speed and wavelength decrease; frequency stays the same (set by the dipper). If they meet the boundary at an angle, they change direction (refraction)." },
    { q:"When is diffraction through a gap most noticeable?",
      a:"When the gap width is similar to (or smaller than) the wavelength — the waves spread out in curved wavefronts." },
    { q:"Frequency 6 Hz, wavelength 5.0 cm. Find the wave speed.",
      a:"v = fλ = 6 × 5.0 = 30 cm/s = 0.30 m/s." }
  ],
  setup(ctx){
    const W = 900, H = 520, CW = 450, CH = 260, PPC = 15, V_DEEP = 30, V_SH = 18, Y0 = 48;   // px per cm (svg)
    let mode = "plane", f = 6, frozen = false, t = 0, region = "deep";
    let barrierAng = 25, refrAng = 30, gap = 4.0, ruler = { x:120, y:120 };
    ctx.stage.innerHTML = `<div style="position:relative;width:100%;max-width:1100px;aspect-ratio:${W}/${H}">
      <canvas id="rt-c" width="${CW}" height="${CH}" style="position:absolute;inset:0;width:100%;height:100%;border-radius:10px"></canvas>
      <svg viewBox="0 0 ${W} ${H}" class="kb" id="rt-svg" style="position:absolute;inset:0;width:100%;height:100%"><defs>${Kit.DEFS}</defs><g id="rt-over"></g></svg></div>`;
    Kit.style(ctx);
    const cv = ctx.stage.querySelector("#rt-c"), c2 = cv.getContext("2d"), img = c2.createImageData(CW, CH), svg = ctx.stage.querySelector("#rt-svg"), $ = s => svg.querySelector(s);
    const COS = new Float32Array(4096); for(let i = 0; i < 4096; i++) COS[i] = Math.cos(i/4096*2*Math.PI);
    const cosf = a => COS[((Math.floor(a/(2*Math.PI)*4096) % 4096) + 4096) % 4096];
    const lam = v => v/f;                                         // cm
    const rad = d => d*Math.PI/180;

    function field(){
      const k1 = 2*Math.PI/(lam(V_DEEP)*PPC*.5), w = 2*Math.PI*f*t, d = img.data;   // canvas px = svg/2
      const y0 = Y0/2;
      // geometry in canvas px
      const C = [CW/2, CH*.62];
      const nb = [Math.sin(rad(barrierAng)), -Math.cos(rad(barrierAng))];          // barrier normal (towards dipper)
      const kR = [0 - 2*(0*nb[0] + k1*nb[1])*nb[0], k1 - 2*(0*nb[0] + k1*nb[1])*nb[1]];
      const nr = [Math.sin(rad(refrAng)), -Math.cos(rad(refrAng))];                 // refraction boundary normal (up)
      const k2m = k1*V_DEEP/V_SH, sin1 = Math.sin(rad(refrAng)), sin2 = sin1*V_SH/V_DEEP, th2 = Math.asin(sin2);
      // transmitted direction: rotate the boundary's inward normal (-nr) by th2 towards the tangent of the incident wave
      const tng = [-nr[1], nr[0]], inN = [-nr[0], -nr[1]];
      const dir2 = [inN[0]*Math.cos(th2) + tng[0]*Math.sin(th2), inN[1]*Math.cos(th2) + tng[1]*Math.sin(th2)];
      const gy = CH*.45, ga = gap*PPC*.5/2;
      for(let y = 0; y < CH; y++){
        for(let x = 0; x < CW; x++){
          let b = 0, A = 1;
          if(y < y0){ b = 0; A = 0; }
          else if(mode === "plane"){ b = cosf(k1*(y - y0) - w); }
          else if(mode === "reflect"){
            const side = (x - C[0])*nb[0] + (y - C[1])*nb[1];
            if(side > 0){ const pc = k1*(C[1] - y0); b = .6*cosf(k1*(y - y0) - w) + .6*cosf(kR[0]*(x - C[0]) + kR[1]*(y - C[1]) + pc - w); } else { A = .15; b = 0; }
          }else if(mode === "refract"){
            const side = (x - C[0])*nr[0] + (y - C[1])*nr[1];
            if(side > 0) b = cosf(k1*(y - y0) - w);
            else b = cosf(k2m*(dir2[0]*(x - C[0]) + dir2[1]*(y - C[1])) + k1*(C[1] - y0) - w);
          }else{
            if(y < gy) b = cosf(k1*(y - y0) - w);
            else if(y < gy + 2 && Math.abs(x - CW/2) > ga){ A = 0; }
            else{
              const dx = x - CW/2, dy = y - gy, r = Math.sqrt(dx*dx + dy*dy) + 1e-6, s = dx/r;
              const u = Math.PI*(2*ga)*s/(lam(V_DEEP)*PPC*.5), env = Math.abs(u) < 1e-4 ? 1 : Math.abs(Math.sin(u)/u);
              A = Math.min(1, env*(1.1 - Math.min(.6, r/CH))); b = cosf(k1*(gy - y0) + k1*r - w);
            }
          }
          const v = .5 + .5*b*A, i = (y*CW + x)*4;
          const shallow = mode === "refract" && ((x - C[0])*nr[0] + (y - C[1])*nr[1]) <= 0;
          d[i] = 14 + v*130; d[i + 1] = 50 + v*160 + (shallow ? 12 : 0); d[i + 2] = 90 + v*165 - (shallow ? 20 : 0); d[i + 3] = 255;
        }
      }
      c2.putImageData(img, 0, 0);
    }
    function overlay(){
      let s = `<rect x="20" y="10" width="${W - 40}" height="${Y0 - 14}" rx="6" fill="url(#k-metal)"/><text x="${W/2}" y="34" text-anchor="middle" style="font:700 11px Inter;fill:#1F2937">vibrating dipper · ${f.toFixed(1)} Hz</text>`;
      if(mode === "reflect"){ const C = [W/2, H*.62], L = 520, t1 = [Math.cos(rad(barrierAng)), Math.sin(rad(barrierAng))];
        s += `<line x1="${C[0] - t1[0]*L/2}" y1="${C[1] - t1[1]*L/2}" x2="${C[0] + t1[0]*L/2}" y2="${C[1] + t1[1]*L/2}" stroke="#E5E7EB" stroke-width="8" stroke-linecap="round"/>
          <circle id="rt-rot" class="k-drag" cx="${C[0] + t1[0]*L/2}" cy="${C[1] + t1[1]*L/2}" r="12" fill="var(--accent)" stroke="#fff" stroke-width="2"/>`; }
      if(mode === "refract"){ const C = [W/2, H*.62], L = 900, t1 = [Math.cos(rad(refrAng)), Math.sin(rad(refrAng))];
        s += `<line x1="${C[0] - t1[0]*L/2}" y1="${C[1] - t1[1]*L/2}" x2="${C[0] + t1[0]*L/2}" y2="${C[1] + t1[1]*L/2}" stroke="#FDE68A" stroke-width="2" stroke-dasharray="8 6"/>
          <text x="${C[0] + 160}" y="${C[1] + 120}" style="font:700 12px Inter;fill:#FDE68A">shallow (glass plate)</text>
          <circle id="rt-rot" class="k-drag" cx="${C[0] + t1[0]*300}" cy="${C[1] + t1[1]*300}" r="12" fill="var(--accent)" stroke="#fff" stroke-width="2"/>`; }
      if(mode === "diffract"){ const gy = H*.45, ga = gap*PPC/2;
        s += `<rect x="0" y="${gy - 3}" width="${W/2 - ga}" height="8" fill="#E5E7EB"/><rect x="${W/2 + ga}" y="${gy - 3}" width="${W/2 - ga}" height="8" fill="#E5E7EB"/>
          <circle id="rt-gap" class="k-drag" cx="${W/2 + ga + 10}" cy="${gy + 1}" r="11" fill="var(--accent)" stroke="#fff" stroke-width="2"/><text x="${W/2 + ga + 28}" y="${gy - 10}" style="font:700 12px Inter;fill:#E5E7EB">gap ${gap.toFixed(1)} cm</text>`; }
      // ruler
      let rt = "";
      for(let c = 0; c <= 20; c++){ const y = c*PPC, L = c % 5 === 0 ? 14 : 8; rt += `<line x1="0" y1="${y}" x2="${L}" y2="${y}" stroke="#111827"/>`; for(let m = 1; m < 10 && c < 20; m++) rt += `<line x1="0" y1="${y + m*PPC/10}" x2="${m === 5 ? 6 : 3}" y2="${y + m*PPC/10}" stroke="#111827" stroke-width=".5"/>`; if(c % 5 === 0) rt += `<text x="18" y="${y + 4}" style="font:600 10px 'JetBrains Mono';fill:#111827">${c}</text>`; }
      s += `<g id="rt-ruler" class="k-drag" transform="translate(${ruler.x} ${ruler.y})"><rect x="-2" y="-8" width="42" height="${20*PPC + 16}" rx="3" fill="rgba(248,250,252,.88)" stroke="#64748B"/>${rt}<text x="30" y="${20*PPC + 2}" style="font:600 8px Inter;fill:#475569">cm</text></g>`;
      $("#rt-over").innerHTML = s;
      ctx.readout([["Frequency", f.toFixed(1) + " Hz"], ["Mode", { plane:"plane waves", reflect:"reflection", refract:"refraction", diffract:"diffraction" }[mode]], ["Strobe", frozen ? "frozen" : "off", frozen ? "good" : ""]]);
    }
    let acc = 0;
    ctx.frame(dt => { if(!frozen) t += dt; acc += dt; if(acc > 1/30){ acc = 0; field(); } });
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(tg.closest("#rt-ruler")){ ruler.ox = ruler.x - p.x; ruler.oy = ruler.y - p.y; return "ruler"; } if(tg.closest("#rt-rot")) return "rot"; if(tg.closest("#rt-gap")) return "gap"; return null; },
      move(k, p){
        if(k === "ruler"){ ruler.x = Kit.clamp(p.x + ruler.ox, 10, W - 50); ruler.y = Kit.clamp(p.y + ruler.oy, Y0, H - 60); }
        else if(k === "rot"){ const a = Math.atan2(p.y - H*.62, p.x - W/2)*180/Math.PI; if(mode === "reflect") barrierAng = Kit.clamp(Math.round(a), -50, 50); else refrAng = Kit.clamp(Math.round(a), -55, 55); }
        else { gap = Kit.clamp(Kit.round((p.x - W/2 - 10)*2/PPC, 1), .5, 20); const r = gap/lam(V_DEEP); if(r < 1.3) ctx.complete("diff"); }
        overlay(); field();
      }
    });
    ctx.seg({ label:"Mode", value:"plane", options:[["plane","Plane waves"],["reflect","Reflection"],["refract","Refraction"],["diffract","Diffraction"]], onChange(v){ mode = v; overlay(); field(); } });
    ctx.slider({ label:"Dipper frequency", min:3, max:15, step:.5, value:f, unit:"Hz", fmt:v => v.toFixed(1), onInput(v){ f = v; overlay(); } });
    ctx.buttons([{ label:"Strobe: freeze / unfreeze", primary:true, onClick(){ frozen = !frozen; overlay(); } }]);
    ctx.seg({ label:"Measuring in", value:"deep", options:[["deep","Deep water"],["shallow","Shallow region"]], onChange(v){ region = v; } });
    const lb = ctx.html(`<div class="ctl"><label><span>Wavelength λ / cm (use the ruler)</span></label><div style="display:flex;gap:6px"><input class="inp" type="number" step="0.1" placeholder="e.g. 5.0"><button class="btn small" type="button">Record</button></div><div style="margin-top:6px"></div></div>`);
    lb.querySelector("button").onclick = () => {
      const val = parseFloat(lb.querySelector("input").value), fb = lb.querySelector("div:last-child");
      if(region === "shallow" && mode !== "refract"){ fb.innerHTML = `<div class="note bad">Switch to refraction mode to see a shallow region.</div>`; return; }
      const truth = lam(region === "deep" ? V_DEEP : V_SH);
      if(!isFinite(val) || Math.abs(val - truth)/truth > .06){ fb.innerHTML = `<div class="note bad">That doesn’t match — freeze the waves and measure across several wavelengths.</div>`; return; }
      fb.innerHTML = "";
      ctx.record({ region: region === "deep" ? "Deep" : "Shallow", f, lam:Kit.round(val, 2), v:Kit.round(f*val, 1), inv:Kit.round(1/f, 3) });
      if(region === "shallow") ctx.complete("shallow");
      if(new Set(ctx.rows().filter(r => r.region === "Deep").map(r => r.f)).size >= 4) ctx.complete("vfl");
    };
    ctx.html(`<p class="hint">Drag the ruler onto the waves. In reflection and refraction modes, drag the blue handle to change the angle; in diffraction mode, drag it to change the gap.</p>`);
    overlay(); field();
  }
});

/* ───────────── SPEED OF SOUND ───────────── */
Lab.register({
  id:"sound", subject:"physics", level:["igcse"], topic:"Waves · Sound", interactive:true,
  title:"Speed of sound",
  summary:"Time a starting pistol’s flash and bang yourself, then use two microphones and a fast timer — and see why the second method is better.",
  aim:"Measure the speed of sound in air by two methods and compare their accuracy.",
  variables:{ iv:"Distance (m)", dv:"Time for the sound to travel (s)", cv:["Same air temperature","Distance measured accurately (trundle wheel / metre rule)"] },
  stageTitle:"Sound bench", controlsTitle:"Method",
  thumb:`<svg viewBox="0 0 300 140"><circle cx="50" cy="70" r="10" fill="#FBBF24"/>${[40,70,100].map(r => `<path d="M${50 + r} 30 q20 40 0 80" fill="none" stroke="#A2ACBD" stroke-width="2"/>`).join("")}<rect x="230" y="50" width="20" height="40" rx="6" fill="#64748B"/></svg>`,
  challenges:[
    { id:"flash", title:"Flash and bang", text:"Time the pistol three times with your own stopwatch." },
    { id:"mics",  title:"Two microphones", text:"Record five or more microphone separations." },
    { id:"v",     title:"Speed of sound", text:"Find v from the gradient of d against t." }
  ],
  columns:[{key:"method",label:"Method"},{key:"d",label:"d / m",dp:2},{key:"t",label:"t / s",dp:5},{key:"v",label:"v = d/t / m s⁻¹",dp:0},{key:"T",label:"Air / °C",dp:0}],
  series:"method",
  graph:{ x:["t"], y:["d"], fit:"linear" },
  questions:[
    { q:"Why does the flash-and-bang method give a less accurate result?",
      a:"Human reaction time (about 0.1–0.3 s) is large compared with the time being measured (about 1 s), and reaction times on starting and stopping may not cancel." },
    { q:"How could the flash-and-bang method be improved?",
      a:"Use a larger distance, repeat many times and average, and have several timers. Electronic timing (microphones) removes reaction time altogether." },
    { q:"Why is the time measured with microphones so short?",
      a:"Sound travels about 340 m/s, so 1 m takes only about 3 ms — far too short for a stopwatch, but easy for an electronic timer." },
    { q:"Does sound travel faster in warm or cold air?",
      a:"Warm air — the speed of sound increases by about 0.6 m/s for each 1 °C rise." }
  ],
  setup(ctx){
    let mode = "flash", d = 300, T = 20, dm = .80, shot = null, strike = null, audio = null, speed = 1;
    const v = () => 331.3 + .606*T;
    const sw = Kit.stopwatch("sd-sw", 760, 300);
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="sd-svg"><defs>${Kit.DEFS}<linearGradient id="sd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E3A5F"/><stop offset="1" stop-color="#3B6EA5"/></linearGradient></defs>
      <g id="sd-scene"></g>${sw.svg}<text x="24" y="34" class="k-status" id="sd-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sd-svg"), $ = s => svg.querySelector(s);
    sw.bind(svg);
    const XA = 110, XB = () => 110 + d*1.25;          // field: 1.25 px per metre (up to 500 m)
    function bang(){
      try{ audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        const n = audio.createBufferSource(), buf = audio.createBuffer(1, audio.sampleRate*.25, audio.sampleRate), ch = buf.getChannelData(0);
        for(let i = 0; i < ch.length; i++) ch[i] = (Math.random()*2 - 1)*Math.exp(-i/(audio.sampleRate*.03));
        n.buffer = buf; const g = audio.createGain(); g.gain.value = .5; n.connect(g).connect(audio.destination); n.start();
      }catch(e){}
    }
    function drawFlash(now){
      let s = `<rect x="0" y="0" width="960" height="330" fill="url(#sd-sky)"/><rect x="0" y="330" width="960" height="190" fill="#2F5D3A"/>`;
      for(let m = 0; m <= 500; m += 50){ const x = 110 + m*1.25; s += `<line x1="${x}" y1="430" x2="${x}" y2="${m % 100 ? 438 : 444}" stroke="#D1FAE5"/>${m % 100 === 0 ? `<text x="${x}" y="458" text-anchor="middle" style="font:600 10px 'JetBrains Mono';fill:#D1FAE5">${m}</text>` : ""}`; }
      s += `<text x="${110 + 250*1.25}" y="478" text-anchor="middle" style="font:500 11px Inter;fill:#D1FAE5">distance / m (measured with a trundle wheel)</text>`;
      const flash = shot && now >= shot.at && now < shot.at + .12;
      s += `<g transform="translate(${XA} 330)"><circle cy="-70" r="12" fill="#FDE68A"/><rect x="-8" y="-58" width="16" height="44" rx="6" fill="#DC2626"/><line x1="0" y1="-14" x2="-6" y2="0" stroke="#111827" stroke-width="4"/><line x1="0" y1="-14" x2="6" y2="0" stroke="#111827" stroke-width="4"/>
        <line x1="6" y1="-48" x2="24" y2="-74" stroke="#111827" stroke-width="4"/>${flash ? `<circle cx="28" cy="-80" r="26" fill="#FFF3B0" opacity=".95"/><circle cx="28" cy="-80" r="50" fill="#FDE68A" opacity=".35"/>` : ""}<text y="22" text-anchor="middle" style="font:600 11px Inter;fill:#fff">starter</text></g>`;
      if(shot && now >= shot.at){ const r = (now - shot.at)*v()*1.25; if(r < d*1.25 + 60) s += `<circle cx="${XA + 24}" cy="250" r="${r}" fill="none" stroke="#fff" stroke-opacity="${Math.max(0, .5 - r/1500)}" stroke-width="3"/>`; }
      s += `<g id="sd-B" class="k-drag" transform="translate(${XB()} 330)"><circle cy="-70" r="12" fill="#FDE68A"/><rect x="-8" y="-58" width="16" height="44" rx="6" fill="#2563EB"/><line x1="0" y1="-14" x2="-6" y2="0" stroke="#111827" stroke-width="4"/><line x1="0" y1="-14" x2="6" y2="0" stroke="#111827" stroke-width="4"/>
        <text y="22" text-anchor="middle" style="font:600 11px Inter;fill:#fff">you (${d} m)</text><rect x="-24" y="-90" width="48" height="120" fill="transparent"/></g>`;
      return s;
    }
    function drawMics(now){
      let s = `${Kit.bench(960, 400)}<rect x="60" y="370" width="840" height="14" rx="3" fill="url(#k-wood)"/>`;
      for(let c = 0; c <= 200; c += 10){ const x = 200 + c*3.3; s += `<line x1="${x}" y1="370" x2="${x}" y2="${c % 50 ? 377 : 382}" stroke="#4B3621"/>${c % 50 === 0 ? `<text x="${x}" y="396" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${(c/100).toFixed(1)}</text>` : ""}`; }
      const hit = strike && now - strike.at < .15;
      s += `<g transform="translate(110 370)"><rect x="-6" y="-120" width="12" height="120" fill="url(#k-metal)"/><rect x="-30" y="-150" width="60" height="30" rx="4" fill="url(#k-metal)" stroke="#475569"/>
        <g transform="rotate(${hit ? -5 : -35} 40 -170)"><rect x="30" y="-176" width="70" height="10" rx="3" fill="url(#k-wood)"/><rect x="18" y="-186" width="22" height="30" rx="4" fill="#475569"/></g><text y="20" text-anchor="middle" class="k-tag">hammer & plate</text></g>`;
      if(strike){ const r = (now - strike.at)*1200; if(r < 900) s += `<path d="M${140 + r} 230 q30 90 0 180" fill="none" stroke="var(--accent)" stroke-width="2" opacity="${Math.max(0, .8 - r/1000)}"/>`; }
      [[200, "mic 1", false], [200 + dm*330, `mic 2 (${dm.toFixed(2)} m)`, true]].forEach(([x, lbl, drag]) => {
        s += `<g ${drag ? 'id="sd-m2" class="k-drag"' : ""} transform="translate(${x} 370)"><rect x="-3" y="-90" width="6" height="90" fill="url(#k-metal)"/><rect x="-10" y="-130" width="20" height="44" rx="10" fill="#334155" stroke="#111827"/>
          <text y="-140" text-anchor="middle" class="k-tag">${lbl}</text>${drag ? `<rect x="-24" y="-150" width="48" height="160" fill="transparent"/>` : ""}</g>`;
      });
      s += `<g transform="translate(600 60)"><rect width="300" height="90" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="14" y="22" style="font:700 9px Inter;fill:#9CA3AF">TIMER (starts at mic 1, stops at mic 2)</text>
        <text x="286" y="66" text-anchor="end" class="k-lcd">${strike && strike.done ? (strike.dt*1000).toFixed(3) + " ms" : "0.000 ms"}</text></g>
        <text x="600" y="176" class="k-tag">air temperature ${T} °C</text>`;
      return s;
    }
    function draw(){
      const now = performance.now()/1000;
      $("#sd-scene").innerHTML = mode === "flash" ? drawFlash(now) : drawMics(now);
      svg.querySelector("#sd-sw").style.display = mode === "flash" ? "" : "none";
      $("#sd-status").textContent = mode === "flash" ? (shot && !shot.heard ? (now < shot.at ? "Get ready… start your stopwatch at the FLASH" : "Stop it when you HEAR the bang") : "Press Fire, start the stopwatch at the flash, stop it at the bang") : "Drag mic 2, then strike the plate";
      ctx.readout(mode === "flash" ? [["Distance", d + " m"], ["Stopwatch", sw.t.toFixed(2) + " s"]] : [["Mic separation", dm.toFixed(2) + " m"], ["Air", T + " °C"]]);
    }
    ctx.frame(dt => {
      sw.tick(dt);
      const now = performance.now()/1000;
      if(shot && !shot.heard && now >= shot.at + d/v()){ shot.heard = true; bang(); }
      if(strike && !strike.done && now - strike.at > .4){ strike.done = true; strike.dt = dm/v() + (Math.random() - .5)*2e-6; }
      draw();
    });
    Kit.dragger(ctx, svg, {
      hit(t){ if(t.closest("#sd-B")) return "B"; if(t.closest("#sd-m2")) return "m2"; return null; },
      move(k, p){ if(k === "B") d = Kit.clamp(Math.round((p.x - 110)/1.25/10)*10, 100, 500); else dm = Kit.clamp(Kit.round((p.x - 200)/330, 2), .2, 2.0); strike = null; draw(); }
    });
    const flashCtl = [], micCtl = [];
    ctx.seg({ label:"Method", value:"flash", options:[["flash","Flash & bang (stopwatch)"],["mics","Two microphones"]], onChange(m){ mode = m; flashCtl.forEach(e => e.style.display = m === "flash" ? "" : "none"); micCtl.forEach(e => e.style.display = m === "flash" ? "none" : ""); draw(); } });
    flashCtl.push(ctx.buttons([{ label:"Fire the pistol", primary:true, onClick(){ sw.reset(); shot = { at: performance.now()/1000 + 1.2 + Math.random()*2, heard:false }; try{ audio = audio || new (window.AudioContext || window.webkitAudioContext)(); audio.resume && audio.resume(); }catch(e){} } },
      { label:"Record stopwatch time", onClick(){
        if(sw.running || sw.t <= 0) return ctx.toast("Start and stop the stopwatch first");
        ctx.record({ method:"Flash & bang", d, t:Kit.round(sw.t, 2), v:Kit.round(d/sw.t, 0), T });
        if(ctx.rows().filter(r => r.method === "Flash & bang").length >= 3) ctx.complete("flash");
      } }]).node);
    micCtl.push(ctx.buttons([{ label:"Strike the plate", primary:true, onClick(){ strike = { at:performance.now()/1000, done:false }; } },
      { label:"Record timer", onClick(){
        if(!strike || !strike.done) return ctx.toast("Strike the plate first");
        ctx.record({ method:"Microphones", d:dm, t:Kit.round(strike.dt, 6), v:Kit.round(dm/strike.dt, 0), T });
        if(new Set(ctx.rows().filter(r => r.method === "Microphones").map(r => r.d)).size >= 5) ctx.complete("mics");
      } }]).node);
    micCtl.push(ctx.slider({ label:"Air temperature", min:0, max:40, step:5, value:T, unit:"°C", onInput(x){ T = x; strike = null; } }).node);
    micCtl.forEach(e => e.style.display = "none");
    Kit.answer(ctx, "Speed of sound from your d–t graph / m s⁻¹", "e.g. 343", val => {
      const pts = ctx.rows().filter(r => r.method === "Microphones").map(r => [r.t, r.d]);
      if(new Set(pts.map(p => p[1])).size < 3) return [false, "Record at least three microphone separations."];
      const f = ctx.linFit(pts);
      if(Math.abs(val - f.m)/f.m <= .03){ ctx.complete("v"); return [true, `Correct — your gradient gives ${f.m.toFixed(0)} m/s (expected ${v().toFixed(0)} m/s at ${T} °C).`]; }
      return [false, "Plot d (y) against t (x) for the microphone results — the gradient is the speed."];
    });
    draw();
  }
});

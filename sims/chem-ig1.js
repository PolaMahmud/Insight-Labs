"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMISTRY · IGCSE (0620) — part 1
   Separating mixtures & purity (filtration · evaporation ·
   crystallisation · simple and fractional distillation · melting point) ·
   Paper chromatography (Rf, locating agent, common mistakes) ·
   Solubility curve and cooling curves
══════════════════════════════════════════════════════════════════ */
(function(){
  const mmss = t => `${Math.floor(t/60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
  const rgba = ChemKit.rgba;
  const TUBE = (d, w) => `<path d="${d}" fill="none" stroke="var(--txt2)" stroke-width="${w + 3}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="var(--bg2)" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

  /* Bunsen burner: barrel top at by-50, flame of length fl */
  function bunsen(x, by, on, fl){
    fl = fl || 34;
    let s = "";
    if(on) s += `<path d="M${x - 7} ${by - 50} Q${x - 10} ${by - 50 - fl*.55} ${x} ${by - 50 - fl} Q${x + 10} ${by - 50 - fl*.55} ${x + 7} ${by - 50} Z" fill="rgba(80,140,255,.55)"/>
      <path d="M${x - 4} ${by - 50} Q${x - 5} ${by - 50 - fl*.35} ${x} ${by - 50 - fl*.6} Q${x + 5} ${by - 50 - fl*.35} ${x + 4} ${by - 50} Z" fill="rgba(150,210,255,.85)"/>`;
    s += `<rect x="${x - 26}" y="${by - 8}" width="52" height="8" rx="3" fill="url(#k-metal)"/><rect x="${x - 6}" y="${by - 50}" width="12" height="42" rx="2" fill="url(#k-metal)"/><rect x="${x - 8}" y="${by - 26}" width="16" height="6" rx="2" fill="#5A6272"/>`;
    return s;
  }
  function tripod(x, top, by, w){
    w = w || 74;
    return `<path d="M${x - w + 6} ${by} L${x - w + 16} ${top + 5} M${x + w - 6} ${by} L${x + w - 16} ${top + 5}" stroke="#7A8394" stroke-width="5" stroke-linecap="round"/>
      <rect x="${x - w}" y="${top}" width="${w*2}" height="6" rx="2" fill="#9AA3B2" stroke="#6B7486" stroke-width=".6"/>
      <line x1="${x - w + 4}" y1="${top + 3}" x2="${x + w - 4}" y2="${top + 3}" stroke="#6B7486" stroke-dasharray="2 3"/>`;
  }
  function mantle(x, cy, r, on){
    return `<path d="M${x - r - 16} ${cy - 6} Q${x - r - 16} ${cy + r + 24} ${x} ${cy + r + 24} Q${x + r + 16} ${cy + r + 24} ${x + r + 16} ${cy - 6} Z" fill="#3B4252" stroke="#1F2430"/>
      <rect x="${x - r - 20}" y="${cy + r + 22}" width="${2*r + 40}" height="${480 - cy - r - 22}" rx="4" fill="#2B3240"/>
      <circle cx="${x + r}" cy="${cy + r + 40}" r="4" fill="${on ? "#FF6B3D" : "#555"}"/><text x="${x - r - 10}" y="${cy + r + 44}" style="font:600 8px Inter;fill:#9CA3AF">heating mantle</text>`;
  }
  /* thin thermometer stem with a bulb at (x, yb) */
  function stem(x, y1, yb, T){
    const col = Math.max(4, Math.min(yb - y1 - 4, (T/150)*(yb - y1)));
    return `<rect x="${x - 3}" y="${y1}" width="6" height="${yb - y1}" rx="3" fill="#fff" stroke="#9AA3B2" stroke-width=".8"/>
      <rect x="${x - 1.3}" y="${yb - col}" width="2.6" height="${col}" fill="#E0334A"/><circle cx="${x}" cy="${yb}" r="4.5" fill="#E0334A"/>`;
  }
  const thermLens = (id, cx, cy, r, T, label) => ChemKit.lens({ id, cx, cy, r, S:11, value:T, minor:1, major:5, down:false, tube:6, flat:true, liquid:"#E0334A", label });
  /* temperature of a solid that melts between m1 and m2, from its heat content H (°C-units) */
  const phT = (H, m1, m2, L) => H < m1 ? H : H < m1 + L ? m1 + (m2 - m1)*(H - m1)/L : m2 + (H - m1 - L);
  const phF = (H, m1, L) => Math.max(0, Math.min(1, (H - m1)/L));
  /* H for a given T when fully liquid */
  const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="var(--bg-card)" stroke="var(--brd2)"/>`;
  const clock = (x, y, t, run) => `<g transform="translate(${x} ${y})"><rect width="190" height="70" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="12" y="20" style="font:700 9px Inter;fill:#9CA3AF">STOP-CLOCK  min:s ${run ? "▶" : "❚❚"}</text><text x="176" y="56" text-anchor="end" class="k-lcd" style="font-size:26px">${mmss(t)}</text></g>`;

  /* ═════════════════════ 1 · SEPARATING MIXTURES & PURITY ═════════════════════ */
  const SEP = "ig-separation";
  const METH = { filt:"Filtration", evap:"Evaporation", cryst:"Crystallisation", dist:"Simple distillation", frac:"Fractional distillation" };
  const NACL = { n:"sodium chloride", col:[215,228,240,.3], solid:"white crystals of sodium chloride", crys:"#F4F6FA" };
  const MIX = {
    sandsalt:{ name:"Sand + salt water", short:"sand + salt water", goal:"Obtain the sand", best:["filt"], sand:true, sol:NACL, liq:[["water",100,100]],
      fb:{ filt:"Sand is insoluble, so it stays on the filter paper as the residue. The salt solution passes through as the filtrate.",
        evap:"Sand and salt are left mixed together. Filter first to remove the insoluble sand.",
        cryst:"Salt crystals form among the sand, so neither is pure. Filter first, then crystallise the filtrate.",
        dist:"Pure water distils over, but sand and salt stay mixed in the flask. Filtration separates an insoluble solid from a liquid.",
        frac:"Pure water distils over, but sand and salt stay mixed in the flask. Filtration separates an insoluble solid from a liquid." } },
    salt:{ name:"Salt (sodium chloride) solution", short:"salt solution", goal:"Obtain solid salt", best:["evap","cryst"], sol:NACL, liq:[["water",100,100]],
      fb:{ filt:"Nothing is left on the filter paper: dissolved salt passes through. Filtration only removes an insoluble solid.",
        evap:"The water evaporates and white sodium chloride is left. It has no water of crystallisation, so evaporating to dryness works. Suitable.",
        cryst:"Crystallisation gives well-formed, purer crystals of sodium chloride. Suitable.",
        dist:"The salt stays in the flask, but to get it you would have to boil the flask dry, which is unsafe. Evaporate or crystallise instead.",
        frac:"The salt stays in the flask, but to get it you would have to boil the flask dry. Evaporate or crystallise instead." } },
    cuso4:{ name:"Copper(II) sulfate solution", short:"CuSO₄(aq)", goal:"Obtain hydrated crystals", best:["cryst"],
      sol:{ n:"copper(II) sulfate", col:[40,120,220,.62], solid:"blue crystals of hydrated copper(II) sulfate", crys:"#2F7FE0", hyd:true }, liq:[["water",100,100]],
      fb:{ filt:"Nothing is left on the filter paper: the dissolved copper(II) sulfate passes through. The filtrate is still blue.",
        evap:"Heating to dryness drives off the water of crystallisation: the blue solid turns into white anhydrous copper(II) sulfate. Crystallise instead.",
        cryst:"Blue crystals of hydrated copper(II) sulfate, CuSO₄·5H₂O, form on cooling. Suitable.",
        dist:"Water is collected and copper(II) sulfate stays in the flask, but you do not get crystals. Crystallise instead.",
        frac:"Water is collected and copper(II) sulfate stays in the flask, but you do not get crystals. Crystallise instead." } },
    sea:{ name:"Sea water", short:"sea water", goal:"Obtain pure water", best:["dist"], sol:{ n:"salts", col:[205,225,235,.35], solid:"white salts (mostly sodium chloride)", crys:"#F4F6FA" }, liq:[["water",100,100]],
      fb:{ filt:"Dissolved salts pass straight through the filter paper: the filtrate is still sea water.",
        evap:"The water escapes into the air, so you get salt, not water.",
        cryst:"The water escapes into the air, so you get salt crystals, not water.",
        dist:"Water boils at 100 °C, condenses and is collected as pure water (the distillate). The salts stay in the flask. Suitable.",
        frac:"Pure water is collected, but a fractionating column is not needed: only one substance is volatile. Simple distillation is the right choice." } },
    ink:{ name:"Black ink", short:"ink", goal:"Obtain the solvent (water)", best:["dist"], sol:{ n:"dyes", col:[35,30,70,.85], solid:"a dark solid of the dyes", crys:"#2A2440", nocrys:true }, liq:[["water",100,100]],
      fb:{ filt:"The dyes are dissolved, so they pass through the filter paper with the water.",
        evap:"The water escapes into the air; a dark solid of dyes is left. You did not collect the solvent.",
        cryst:"The water escapes into the air; a dark sticky residue of dyes is left. You did not collect the solvent.",
        dist:"Water distils over at 100 °C and is colourless; the dyes stay in the flask. Suitable. (Chromatography would separate the dyes.)",
        frac:"Water is collected, but a fractionating column is not needed: only the water is volatile. Simple distillation is the right choice." } },
    ethw:{ name:"Ethanol + water", short:"ethanol + water", goal:"Obtain ethanol", best:["frac"], flam:true, liq:[["ethanol",78,40],["water",100,60]],
      fb:{ filt:"Ethanol and water are miscible: both pass straight through the filter paper.",
        evap:"Both liquids evaporate and are lost. Ethanol vapour is flammable.",
        cryst:"There is no dissolved solid to crystallise; both liquids just evaporate.",
        dist:"The boiling points (78 °C and 100 °C) are close: the temperature rises steadily and the distillate is a mixture of ethanol and water. Use a fractionating column.",
        frac:"Ethanol distils first at a steady 78 °C; the temperature then rises to 100 °C as water distils. Changing the receiver collects separate fractions. Suitable." } },
    alk:{ name:"Hexane + heptane + octane (crude-oil model)", short:"alkane mixture", goal:"Separate the three liquids", best:["frac"], flam:true, liq:[["hexane",69,30],["heptane",98,30],["octane",126,40]],
      fb:{ filt:"The liquids are miscible: they all pass through the filter paper.",
        evap:"All three liquids evaporate and are lost. The vapour is highly flammable.",
        cryst:"There is no dissolved solid to crystallise; the liquids just evaporate.",
        dist:"The temperature rises steadily and every distillate is a mixture. Liquids with close boiling points need a fractionating column.",
        frac:"Hexane (69 °C), heptane (98 °C) and octane (126 °C) distil one after another at steady temperatures. This is how crude oil is separated into fractions. Suitable." } }
  };

  Lab.register({
    id:SEP, subject:"chemistry", level:["igcse"], topic:"Experimental techniques · Separation & purity", interactive:true,
    title:"Separating mixtures and purity",
    summary:"Choose and run the right separation for seven mixtures: filtration, evaporation, crystallisation, simple and fractional distillation. Then check purity from a heating curve that you read yourself.",
    aim:"Choose a suitable method to separate each mixture, carry it out correctly, and use melting and boiling points to judge whether a substance is pure.",
    variables:{ iv:"Separation method (or sample heated)", dv:"Product obtained; temperature read on the thermometer (°C)", cv:["Same volume of mixture (100 cm³)","Thermometer bulb level with the side arm","Same water-bath temperature for every sample"] },
    stageTitle:"Separation bench", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><circle cx="70" cy="96" r="26" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M52 104 a26 26 0 0 0 36 0z" fill="#3B82F6" fill-opacity=".5"/><path d="M70 70 V30 M70 44 L130 64" stroke="#A2ACBD" stroke-width="3"/><path d="M130 64 L230 104" stroke="#A2ACBD" stroke-width="12" opacity=".5"/><path d="M130 64 L230 104" stroke="#A2ACBD" stroke-width="3"/><path d="M236 108 l-12 26 h28z" fill="none" stroke="#A2ACBD" stroke-width="2"/><path d="M228 128 h20 l3 6 h-26z" fill="#9EC5F5"/></svg>`,
    challenges:[
      { id:"methods", title:"The right method", text:"Separate four different mixtures with a suitable method." },
      { id:"cryst",   title:"Crystallisation point", text:"Test with a glass rod before cooling, then grow and dry blue crystals of hydrated copper(II) sulfate." },
      { id:"still",   title:"Distil correctly", text:"Water in at the bottom of the condenser, bulb at the side arm: collect pure water and read its boiling point." },
      { id:"frac",    title:"Fractions", text:"In fractional distillation change the receiver and read the boiling point of two different fractions." },
      { id:"pure",    title:"Pure or impure?", text:"Heat at least two samples, then pick the pure one from its heating curve." },
      { id:"mp",      title:"Melting point", text:"Read the melting point of the pure sample from your results." }
    ],
    columns:[{key:"run",label:"Run / sample"},{key:"method",label:"Method"},{key:"result",label:"Product / appearance"},{key:"t",label:"t / s",dp:0},{key:"V",label:"Distillate / cm³",dp:1},{key:"T",label:"T / °C",dp:1}],
    series:"run",
    graph:{ x:["t","V"], y:["T"], fit:"none" },
    questions:[
      { q:"Why does the cooling water enter the condenser at the bottom and leave at the top?",
        a:"So the water jacket fills completely and the coldest water meets the vapour just before it leaves. If the water entered at the top, the jacket would not fill and some vapour would escape uncondensed." },
      { q:"Why is the thermometer bulb placed level with the side arm in a distillation?",
        a:"It measures the temperature of the vapour that is passing into the condenser, i.e. the boiling point of the substance being collected. In the liquid it would read the (higher) temperature of the boiling mixture." },
      { q:"Why is copper(II) sulfate crystallised rather than evaporated to dryness?",
        a:"Heating to dryness drives off the water of crystallisation, leaving white anhydrous copper(II) sulfate. Crystallisation keeps the water in the crystals (CuSO₄·5H₂O) and gives bigger, purer crystals." },
      { q:"How do you know the crystallisation point has been reached?",
        a:"Dip a glass rod into the solution and lift it out: if small crystals form on the rod as it cools, the solution is saturated. Then stop heating and leave it to cool." },
      { q:"Why does fractional distillation separate ethanol and water but simple distillation does not?",
        a:"Their boiling points are close (78 °C and 100 °C). In the fractionating column the vapour condenses and re-boils many times; the less volatile water condenses and runs back, so almost pure ethanol reaches the top at 78 °C." },
      { q:"How does a melting point show whether a substance is pure?",
        a:"A pure substance melts at a sharp, fixed temperature (a flat section on the heating curve). An impurity lowers the melting point and makes it melt over a range of temperatures. Impurities also raise the boiling point." },
      { q:"Suggest two safety precautions when distilling ethanol or hydrocarbons.",
        a:"They are flammable: heat with an electric heating mantle or water bath, not a naked flame. Add anti-bumping granules for smooth boiling, and never heat the flask to dryness." },
      { q:"The thermometer is graduated in 1 °C. What is the uncertainty in one reading, and why do purity checks matter for foods and drugs?",
        a:"±0.5 °C (half the smallest division). Impurities in food and medicines could be harmful, so their purity is checked by melting point, boiling point or chromatography." }
    ],
    setup(ctx){
      const S0 = SEP;
      let part = "sep", mixK = "sandsalt", meth = "filt", speed = 5, condIn = "bottom", bulb = "arm", run = 0, S = null;
      const okSet = new Set(ctx.rows().filter(r => r.ok).map(r => r.mk));
      /* purity samples of octadecanoic (stearic) acid */
      const pureI = Math.floor(Math.random()*3);
      const SAMP = [0, 1, 2].map(i => i === pureI ? { m1:69.3, m2:69.3 } : { m1:Kit.round(58 + Math.random()*4, 1), m2:Kit.round(64 + Math.random()*2.5, 1) });
      const PZ = SAMP.map(() => ({ H:20, t:0, on:false, nextAuto:0 }));
      let sIdx = 0, auto = false, wasAuto = false;
      const KH = .012, TB = 90, LH = 25;
      const pT = () => phT(PZ[sIdx].H, SAMP[sIdx].m1, SAMP[sIdx].m2, LH);

      function newRun(){
        run++;
        const m = MIX[mixK];
        S = { label:`Run ${run} · ${m.short}`, mk:mixK, meth, p:0, pouring:false, f:0, heat:false, white:0, phase:"heat", rodT:0, rodOK:false, g:0, fCool:null,
          done:false, verdict:null, ok:false, pot:m.liq.map(([n, bp, v]) => ({ n, bp, v })), Tpot:20, Ttop:20, rec:[{}], lost:0, tt:0, warned:{} };
      }
      newRun();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="${S0}-svg"><defs>${Kit.DEFS}
        <clipPath id="${S0}-bowl"><path d="M220 360 Q300 436 380 360 Z"/></clipPath>
        <clipPath id="${S0}-fl"><circle cx="180" cy="352" r="45"/></clipPath>
        <clipPath id="${S0}-rc"><path d="${ChemKit.FLASK(545, 478, .6)} Z"/></clipPath>
        <clipPath id="${S0}-cone"><path d="M242 214 L358 214 L300 296 Z"/></clipPath>
        <clipPath id="${S0}-bk"><path d="${ChemKit.BEAKER(240, 478, 120, 118)} Z"/></clipPath>
        <clipPath id="${S0}-bt"><path d="M246 150 V366 A14 14 0 0 0 274 366 V150 Z"/></clipPath>
      </defs>${Kit.bench(960, 480)}<g id="${S0}-scene"></g><text x="24" y="30" class="k-status" id="${S0}-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${S0}-svg`), $ = s => svg.querySelector(s);

      /* ── distillation model ── */
      function vapour(N){
        const live = S.pot.filter(c => c.v > 1e-6); if(!live.length) return null;
        const tot = live.reduce((a, c) => a + c.v, 0), bmin = Math.min(...live.map(c => c.bp));
        const w = S.pot.map(c => c.v > 1e-6 ? c.v/tot*Math.pow(Math.exp(-(c.bp - bmin)/20), N) : 0), sw = w.reduce((a, b) => a + b, 0);
        return w.map(x => x/sw);
      }
      const potVol = () => S.pot.reduce((a, c) => a + c.v, 0);
      const Tof = y => y.reduce((a, yi, i) => a + yi*S.pot[i].bp, 0);
      function elev(){ const m = MIX[S.mk]; return m.sol ? Math.min(6, .6*100/Math.max(5, potVol())) : 0; }
      const thermT = () => bulb === "arm" ? S.Ttop : S.Tpot;
      const collected = () => S.rec.reduce((a, r) => a + Object.values(r).reduce((x, y) => x + y, 0), 0);
      function recDesc(r){
        const e = Object.entries(r).filter(([, v]) => v > .05).sort((a, b) => b[1] - a[1]), tot = e.reduce((a, [, v]) => a + v, 0);
        if(!e.length) return "empty";
        if(e.length === 1 || e[0][1]/tot > .995) return `${tot.toFixed(0)} cm³ pure ${e[0][0]}`;
        return `${tot.toFixed(0)} cm³, ${Math.round(e[0][1]/tot*100)}% ${e[0][0]}`;
      }
      let distilling = false;
      function distTick(dt){
        const m = MIX[S.mk], N = S.meth === "frac" ? 5 : 1, y1 = vapour(1), yN = vapour(N);
        distilling = false;
        if(S.heat && y1){
          const Tb = Tof(y1) + elev();
          if(S.Tpot < Tb - .8) S.Tpot = Math.min(Tb, S.Tpot + 2*dt);
          else{
            S.Tpot = Math.min(Tb, Math.max(S.Tpot, Tb - .8) + .5*dt);
            const target = Tof(yN);
            S.Ttop += (target - S.Ttop)*Math.min(1, dt/(S.meth === "frac" ? 2.2 : 1.2));
            if(S.Ttop > target - 2){
              distilling = true;
              const dv = .45*dt, eff = condIn === "bottom" ? 1 : .55;
              yN.forEach((yi, i) => { const take = Math.min(S.pot[i].v, yi*dv); S.pot[i].v -= take; const r = S.rec[S.rec.length - 1]; r[S.pot[i].n] = (r[S.pot[i].n] || 0) + take*eff; });
              S.lost += dv*(1 - eff);
              if(eff < 1 && !S.warned.cond){ S.warned.cond = true; ctx.toast("The condenser jacket is not full — vapour is escaping uncondensed"); }
            }
          }
          if(potVol() < 6){ S.heat = false; ctx.toast("Heating stopped — never let the flask boil dry"); syncActs(); finishDist(); }
        }else{
          S.Tpot += (20 - S.Tpot)*Math.min(1, dt/40);
          S.Ttop += (20 - S.Ttop)*Math.min(1, dt/12);
        }
        if(S.heat && m.flam && !S.warned.flam){ S.warned.flam = true; ctx.toast("Flammable liquid — it is heated with an electric heating mantle, not a flame"); }
      }
      function finishDist(){
        if(S.done) return;
        if(collected() < 3){ ctx.toast("Collect some distillate first"); return; }
        const m = MIX[S.mk];
        let prod = S.rec.map((r, i) => `R${i + 1}: ${recDesc(r)}`).join("; ");
        if(m.sol) prod += `; ${m.sol.n} left in flask`;
        if(m.sand) prod += " with the sand";
        verdict(prod);
      }

      function verdict(prod){
        const m = MIX[S.mk], ok = m.best.includes(S.meth);
        S.done = true; S.ok = ok; S.verdict = (ok ? "✓ " : "✗ ") + m.fb[S.meth];
        S.product = prod;
        ctx.record({ run:S.label, method:METH[S.meth], result:prod, t:"", V:"", T:"", ok, mk:S.mk });
        if(ok){ okSet.add(S.mk); if(okSet.size >= 4) ctx.complete("methods"); }
        if(S.meth === "cryst" && S.mk === "cuso4" && S.rodOK && S.fCool >= .55 && S.fCool <= .92) ctx.complete("cryst");
        syncActs();
      }

      /* ── per-frame physics ── */
      ctx.frame(dt => {
        const d = dt*speed;
        S.tt += dt;
        if(part === "sep"){
          const m = MIX[S.mk];
          if(S.meth === "filt" && S.pouring){ S.p = Math.min(1, S.p + d/8); if(S.p >= 1){ S.pouring = false;
            verdict(`residue: ${m.sand ? "sand" : "none"}; filtrate: ${m.sol ? (m.sol.hyd || m.sol.nocrys ? "coloured " : "colourless ") + m.sol.n + " solution" : "the liquid mixture"}`); } }
          if(S.meth === "evap" && S.heat && !S.done){
            S.f = Math.min(1, S.f + (m.flam ? .05 : .02)*d);
            if(m.flam && !S.warned.flam){ S.warned.flam = true; ctx.toast("Flammable vapour near a naked flame! Never evaporate ethanol or alkanes over a Bunsen"); }
            if(S.f >= 1){
              if(m.sol && m.sol.hyd){ S.white = Math.min(1, S.white + d/6); if(S.white >= 1) verdict("white powder (anhydrous copper(II) sulfate)"); }
              else verdict(m.sol ? m.sol.solid.replace("crystals of ", "") + (m.sand ? " mixed with sand" : "") : "nothing — the liquids evaporated");
            }
          }
          if(S.meth === "cryst"){
            if(S.heat && S.phase === "heat"){ S.f = Math.min(1, S.f + .015*d);
              if(!m.sol && S.f >= 1 && !S.done){ S.heat = false; verdict("nothing — no dissolved solid"); }
              if(m.flam && !S.warned.flam){ S.warned.flam = true; ctx.toast("Flammable vapour near a naked flame!"); } }
            if(S.phase === "cool" && S.g < 1){ S.g = Math.min(1, S.g + d/8);
              if(S.g >= 1){ if(S.fCool < .55 && m.sol && !m.sol.nocrys){ ctx.toast("No crystals formed — the solution was not saturated. Heat it more."); S.phase = "heat"; S.g = 0; } syncActs(); } }
          }
          if(S.meth === "dist" || S.meth === "frac") distTick(d);
        }else{
          const P = PZ[sIdx];
          if(P.on){
            const n = Math.ceil(d/.5), h = d/n;
            for(let i = 0; i < n; i++){ P.H += KH*(TB - phT(P.H, SAMP[sIdx].m1, SAMP[sIdx].m2, LH))*h; P.t += h;
              if(auto && P.t >= P.nextAuto){ recP(Kit.round(Math.round(pT()*2)/2, 1), P.nextAuto, true); P.nextAuto += 30; } }
            if(P.t > 600){ P.on = false; syncActs(); }
          }
        }
        draw();
      });

      /* ── drawing ── */
      function drawFilt(m){
        let s = `<rect x="50" y="470" width="150" height="10" rx="3" fill="url(#k-metal)"/><rect x="86" y="110" width="8" height="362" rx="3" fill="url(#k-metal)"/><rect x="86" y="214" width="150" height="6" rx="2" fill="url(#k-metal)"/>`;
        const ff = S.p < .7 ? Math.min(1, S.p*3) : Math.max(0, (1 - S.p)/.3);
        const solC = m.sol ? rgba(m.sol.col) : "rgba(210,225,240,.35)";
        s += `<path d="M232 208 L368 208 L308 300 V352 H292 V300 Z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <path d="M242 214 L358 214 L300 296 Z" fill="#F5F2EA" opacity=".9"/>`;
        if(S.p > 0 && ff > 0) s += `<rect x="240" y="${296 - ff*70}" width="120" height="${ff*70}" fill="${m.sand && S.p < .7 ? "rgba(185,160,110,.6)" : solC}" clip-path="url(#${S0}-cone)"/>`;
        if(m.sand && S.p > 0){ const h = 26*Math.min(1, S.p*1.4); s += `<rect x="240" y="${296 - h}" width="120" height="${h}" fill="#C9A66B" clip-path="url(#${S0}-cone)"/>`;
          for(let i = 0; i < 18*Math.min(1, S.p*1.4); i++) s += `<circle cx="${292 + (i*7) % 16}" cy="${293 - (i*5) % Math.max(2, h - 2)}" r="1.4" fill="#8E6A3A" clip-path="url(#${S0}-cone)"/>`; }
        s += `<path d="${ChemKit.BEAKER(240, 478, 120, 118)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
        if(S.p > 0) s += `<rect x="240" y="${478 - 80*S.p}" width="120" height="${80*S.p}" fill="${solC}" clip-path="url(#${S0}-bk)"/>`;
        if(S.pouring){
          s += `<g transform="translate(170 150) rotate(58)"><path d="${ChemKit.BEAKER(-40, 40, 80, 80)}" fill="${m.sand ? "rgba(185,160,110,.5)" : solC}" stroke="var(--txt2)" stroke-width="1.5"/></g>
            <path d="M206 168 Q236 176 262 214" stroke="${m.sand ? "rgba(185,160,110,.8)" : "rgba(120,170,230,.7)"}" stroke-width="4" fill="none"/>`;
          const k = (S.tt*2) % 1; s += `<ellipse cx="300" cy="${355 + k*(478 - 80*S.p - 355)}" rx="2.2" ry="3.2" fill="${solC}" stroke="rgba(80,120,180,.6)" stroke-width=".6"/>`;
        }
        s += `<text x="376" y="226" class="k-lbl">filter funnel + filter paper</text>
          ${S.p > .05 ? `<text x="376" y="270" class="k-tag">residue: ${m.sand ? "sand" : "none"}</text><text x="366" y="440" class="k-tag">filtrate</text>` : ""}`;
        return s;
      }
      function drawBasin(m){
        let s = bunsen(300, 480, S.heat, 34) + tripod(300, 400, 480);
        const surf = 362 + Math.min(1, S.f)*32;
        const solC = m.sol ? rgba(m.sol.col, Math.min(.95, m.sol.col[3] + S.f*.3)) : "rgba(210,225,240,.35)";
        s += `<g clip-path="url(#${S0}-bowl)">`;
        if(S.f < 1) s += `<rect x="215" y="${surf}" width="170" height="${440 - surf}" fill="${solC}"/>`;
        if(m.sand) for(let i = 0; i < 40; i++) s += `<circle cx="${262 + (i*37) % 76}" cy="${394 - (i % 4)*2.5}" r="2" fill="#B8925A"/>`;
        if(m.sol && S.f >= 1 && S.meth === "evap"){
          const c = m.sol.hyd ? ChemKit.mix([47,127,224],[245,245,245], S.white) : null;
          s += `<rect x="240" y="388" width="120" height="12" fill="${c ? `rgb(${c})` : m.sol.crys}"/>`;
        }
        if(S.meth === "cryst" && m.sol && S.g > 0 && S.phase === "cool"){
          const n = Math.floor((m.sol.nocrys ? 0 : 16)*S.g), small = S.fCool > .92;
          for(let i = 0; i < n; i++){ const x = 258 + (i*41) % 86, y = 392 - (i*13) % 12, r = small ? 3 : 5 + (i % 3)*2;
            s += `<path d="M${x} ${y - r} L${x + r*.8} ${y} L${x} ${y + r*.7} L${x - r*.8} ${y} Z" fill="${S.fCool >= 1 && m.sol.hyd ? "#EEE" : m.sol.crys}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`; }
          if(m.sol.nocrys) s += `<rect x="250" y="390" width="100" height="8" rx="3" fill="${m.sol.crys}"/>`;
        }
        s += `</g><path d="M216 358 Q300 440 384 358" fill="none" stroke="var(--txt2)" stroke-width="2"/><path d="M216 358 H384" stroke="var(--txt2)" stroke-width="1" opacity=".4"/>
          <text x="300" y="350" text-anchor="middle" class="k-lbl">evaporating basin</text>`;
        if(S.heat && S.f < 1) for(let i = 0; i < 3; i++){ const k = (S.tt*.6 + i/3) % 1;
          s += `<path d="M${270 + i*28} ${352 - k*90} q-8 -12 0 -24 q8 -12 0 -24" fill="none" stroke="var(--txt3)" stroke-width="3" stroke-linecap="round" opacity="${.6*(1 - k)}"/>`; }
        if(S.rodT > 0){ const sat = S.rodSat;
          s += `<line x1="430" y1="150" x2="355" y2="300" stroke="rgba(200,220,240,.9)" stroke-width="5" stroke-linecap="round"/><line x1="430" y1="150" x2="355" y2="300" stroke="var(--txt2)" stroke-width="1"/>`;
          if(sat) for(let i = 0; i < 7; i++) s += `<rect x="${352 + (i*5) % 12}" y="${288 + (i*7) % 14}" width="4" height="4" fill="${m.sol.crys}" stroke="rgba(0,0,0,.3)" stroke-width=".5" transform="rotate(45 ${354 + (i*5) % 12} ${290 + (i*7) % 14})"/>`;
          s += `<text x="436" y="150" class="k-tag">glass rod: ${sat ? "crystals on the rod" : "no crystals"}</text>`;
        }
        if(S.phase === "filtered" || S.phase === "done"){
          s += `<ellipse cx="520" cy="470" rx="70" ry="9" fill="url(#k-glass)" stroke="var(--txt2)"/><circle cx="520" cy="462" r="0" />`;
          if(m.sol) for(let i = 0; i < (m.sol.nocrys ? 0 : 12); i++){ const x = 470 + (i*17) % 100, r = S.fCool > .92 ? 3 : 6;
            s += `<path d="M${x} ${464 - r} L${x + r*.8} 464 L${x} ${464 + r*.6} L${x - r*.8} 464 Z" fill="${S.fCool >= 1 && m.sol.hyd ? "#EEE" : m.sol.crys}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`; }
          s += `<text x="520" y="440" text-anchor="middle" class="k-lbl">${S.phase === "done" ? "dried between filter papers" : "crystals filtered off (still wet)"}</text>`;
        }
        return s;
      }
      function drawDist(m){
        const fr = S.meth === "frac", yA = fr ? 104 : 186, top = fr ? 82 : 160, fx = 180;
        let s = "";
        s += m.flam ? mantle(fx, 352, 46, S.heat) : bunsen(fx, 480, S.heat, 34) + tripod(fx, 400, 480, 64);
        /* flask and contents */
        const vol = potVol(), lvl = 396 - Math.min(1, vol/100)*60;
        const col = m.sol ? rgba(m.sol.col, Math.min(.95, m.sol.col[3]*(100/Math.max(20, vol))**.5)) : "rgba(215,228,242,.4)";
        s += `<g clip-path="url(#${S0}-fl)"><rect x="130" y="${lvl}" width="100" height="${400 - lvl}" fill="${col}"/>`;
        if(m.sand) for(let i = 0; i < 26; i++) s += `<circle cx="${160 + (i*29) % 42}" cy="${394 - (i % 3)*3}" r="2" fill="#B8925A"/>`;
        if(distilling) for(let i = 0; i < 6; i++){ const k = (S.tt*1.4 + i/6) % 1; s += `<circle cx="${160 + (i*11) % 40}" cy="${394 - k*(394 - lvl)}" r="2" fill="none" stroke="var(--txt2)" stroke-width=".8"/>`; }
        s += `<circle cx="168" cy="392" r="2.5" fill="#9AA3B2"/><circle cx="190" cy="394" r="2.5" fill="#9AA3B2"/></g>
          <path d="M171 268 V306 A46 46 0 1 0 189 306 V268" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>`;
        /* column / still head */
        s += `<rect x="171" y="${top}" width="18" height="${270 - top}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>`;
        if(fr){ for(let y = 128; y < 262; y += 7) for(let x = 175; x < 188; x += 6) s += `<circle cx="${x + (y % 2)*2}" cy="${y}" r="2.6" fill="#E8EEF5" stroke="#9AA3B2" stroke-width=".5"/>`;
          s += `<text x="${fx - 18}" y="190" text-anchor="end" class="k-lbl">fractionating</text><text x="${fx - 18}" y="204" text-anchor="end" class="k-lbl">column (glass beads)</text>`; }
        /* condenser */
        const C0 = [214, yA + 10], C1 = [520, 340], L = Math.hypot(C1[0] - C0[0], C1[1] - C0[1]), ang = Math.atan2(C1[1] - C0[1], C1[0] - C0[0]);
        const P = (x, y) => [C0[0] + x*Math.cos(ang) - y*Math.sin(ang), C0[1] + x*Math.sin(ang) + y*Math.cos(ang)];
        s += TUBE(`M189 ${yA} L${C0[0]} ${C0[1]}`, 8);
        s += `<g transform="translate(${C0[0]} ${C0[1]}) rotate(${ang*180/Math.PI})">
          <rect x="24" y="-16" width="${L - 48}" height="32" rx="8" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/>
          ${condIn === "bottom" ? `<rect x="26" y="-14" width="${L - 52}" height="28" rx="6" fill="rgba(90,160,230,.5)"/>` : `<rect x="26" y="7" width="${L - 52}" height="7" rx="3" fill="rgba(90,160,230,.5)"/>`}
          <rect x="0" y="-4.5" width="${L}" height="9" fill="var(--bg2)" stroke="var(--txt2)" stroke-width="1.1"/>
          ${distilling ? [0, 1, 2].map(i => `<circle cx="${((S.tt*.5 + i/3) % 1)*L}" cy="0" r="2.4" fill="rgba(120,170,230,.9)"/>`).join("") : ""}
          <rect x="44" y="-30" width="9" height="15" fill="url(#k-glass)" stroke="var(--txt2)"/><rect x="${L - 54}" y="15" width="9" height="15" fill="url(#k-glass)" stroke="var(--txt2)"/></g>`;
        const lo = P(L - 50, 34), hi = P(48, -34);
        s += `<path d="M${lo[0]} ${lo[1]} q-6 28 -46 36" fill="none" stroke="#5A8BC8" stroke-width="5"/><path d="M${hi[0]} ${hi[1]} q20 -26 70 -30" fill="none" stroke="#5A8BC8" stroke-width="5"/>
          <text x="${lo[0] - 52}" y="${lo[1] + 40}" text-anchor="end" class="k-tag">${condIn === "bottom" ? "water in ↑" : "water out"}</text><text x="${hi[0] + 74}" y="${hi[1] - 26}" class="k-tag">${condIn === "bottom" ? "water out" : "water in ↓"}</text>
          <text x="${P(L*.6, -40)[0] + 12}" y="${P(L*.6, -40)[1]}" class="k-lbl">Liebig condenser</text>`;
        s += TUBE(`M${C1[0]} ${C1[1]} L545 412`, 8);
        /* receiver */
        const cur = S.rec[S.rec.length - 1], cv = Object.values(cur).reduce((a, b) => a + b, 0);
        s += `<rect x="485" y="${470 - cv*.55}" width="120" height="${cv*.55 + 10}" fill="rgba(200,222,245,.5)" clip-path="url(#${S0}-rc)"/>
          <path d="${ChemKit.FLASK(545, 478, .6)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <text x="545" y="496" text-anchor="middle" class="k-lbl">receiver ${S.rec.length} (distillate)</text>`;
        if(distilling){ const k = (S.tt*2.5) % 1; s += `<ellipse cx="545" cy="${414 + k*(466 - cv*.55 - 414)}" rx="2" ry="3" fill="rgba(120,170,230,.9)"/>`; }
        if(distilling && condIn !== "bottom") for(let i = 0; i < 3; i++) s += `<path d="M${536 + i*9} 410 q-7 -14 0 -26 q7 -12 0 -24" fill="none" stroke="var(--txt3)" stroke-width="4" stroke-linecap="round" opacity=".55"><animate attributeName="opacity" values=".1;.7;.1" dur="${1.4 + i*.3}s" repeatCount="indefinite"/></path>`;
        /* thermometer */
        const yb = bulb === "arm" ? yA : 372;
        s += `<rect x="168" y="${top - 12}" width="24" height="12" rx="3" fill="#3B4252"/>${stem(fx, top - 30, yb, thermT())}
          <text x="${fx + 12}" y="${top - 18}" class="k-lbl">thermometer${bulb === "arm" ? " (bulb at side arm)" : " (bulb in liquid)"}</text>`;
        /* lens */
        s += thermLens(`${S0}-dl`, 830, 400, 72, thermT(), "magnifier on the thermometer") + `<line x1="${fx + 4}" y1="${top - 22}" x2="758" y2="400" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".7"/>`;
        return s;
      }
      function sepCard(m){
        let s = card(630, 40, 310, 270) + `<text x="644" y="64" class="k-tag">${ctx.esc(m.name)}</text>
          <text x="644" y="84" class="k-lbl">Goal: ${ctx.esc(m.goal)}</text><text x="644" y="102" class="k-lbl">Method: ${METH[S.meth]}</text>`;
        let y = 124;
        if(S.meth === "dist" || S.meth === "frac"){
          s += `<text x="644" y="${y}" class="k-lbl">collected: ${collected().toFixed(1)} cm³${S.lost > .5 ? ` · lost as vapour: ${S.lost.toFixed(1)} cm³` : ""}</text>`; y += 18;
          S.rec.slice(-3).forEach((r, i) => { s += `<text x="644" y="${y}" class="k-lbl">R${S.rec.length - Math.min(3, S.rec.length) + i + 1}: ${recDesc(r)}</text>`; y += 16; });
        }
        if(S.meth === "cryst" || S.meth === "evap"){ s += `<text x="644" y="${y}" class="k-lbl">water evaporated: ${Math.round(S.f*100)}%</text>`; y += 18; }
        if(S.verdict){ y += 4; s += `<text x="644" y="${y}" class="k-tag" style="fill:${S.ok ? "var(--sec)" : "#E0334A"}">${S.ok ? "Suitable method" : "Not a suitable method"}</text>`; y += 18;
          s += ChemKit.lines(S.verdict.slice(2), 46, 644, y, 15); }
        return s;
      }
      function drawPur(){
        const P = PZ[sIdx], sp = SAMP[sIdx], T = pT(), fr = phF(P.H, sp.m1, LH);
        let s = bunsen(260, 480, true, 34) + tripod(260, 400, 480, 90);
        s += `<path d="${ChemKit.BEAKER(180, 398, 160, 140)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="181" y="282" width="158" height="114" fill="url(#k-water)"/>
          <text x="350" y="300" class="k-lbl">water bath (≈${TB} °C)</text>`;
        s += `<g clip-path="url(#${S0}-bt)"><rect x="240" y="${380 - 40*(1 - fr)}" width="40" height="${40*(1 - fr) + 4}" fill="#F2EFE6"/>
          <rect x="240" y="${340}" width="40" height="${40*fr}" fill="rgba(250,238,190,.6)"/>
          ${fr > 0 && fr < 1 ? `<path d="M246 ${380 - 40*(1 - fr)} l6 -4 l6 3 l6 -5 l6 4 l4 -2" stroke="#E0DAC8" fill="none"/>` : ""}</g>
          <path d="M246 150 V366 A14 14 0 0 0 274 366 V150" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>
          <rect x="190" y="160" width="56" height="8" rx="3" fill="url(#k-metal)"/>${stem(260, 70, 368, T)}
          <text x="282" y="140" class="k-lbl">boiling tube: sample ${sIdx + 1}</text>`;
        s += clock(400, 40, P.t, P.on);
        s += card(400, 130, 270, 150) + `<text x="414" y="154" class="k-tag">Octadecanoic (stearic) acid · sample ${sIdx + 1}</text>
          <text x="414" y="178" class="k-lbl">appearance: ${fr <= 0 ? "white solid" : fr >= 1 ? "clear colourless liquid" : "melting (solid + liquid)"}</text>
          <text x="414" y="198" class="k-lbl">readings this sample: ${ctx.rows().filter(r => r.run === "Sample " + (sIdx + 1)).length}</text>
          ${ChemKit.lines("Data: pure octadecanoic acid melts at 69 °C. Read the thermometer every 30 s.", 42, 414, 222, 16)}
          <text x="414" y="264" class="k-lbl">clock speed ×${speed}${auto ? " · auto every 30 s" : ""}</text>`;
        s += thermLens(`${S0}-pl`, 820, 330, 95, T, "magnifier on the thermometer (1 °C divisions)") + `<line x1="263" y1="${368 - Math.max(4, T/150*298)}" x2="725" y2="330" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".7"/>`;
        return s;
      }
      function draw(){
        let s;
        if(part === "pur"){ s = drawPur(); $(`#${S0}-status`).textContent = PZ[sIdx].on ? "Read the thermometer every 30 s (pause the clock if you need to)" : "Start the clock to heat the sample in the water bath"; }
        else{
          const m = MIX[S.mk];
          s = S.meth === "filt" ? drawFilt(m) : S.meth === "evap" || S.meth === "cryst" ? drawBasin(m) : drawDist(m);
          s += sepCard(m);
          $(`#${S0}-status`).textContent = S.done ? "Done — try another mixture or method" : prompt();
        }
        $(`#${S0}-scene`).innerHTML = s;
        if(part === "sep") ctx.readout([["Mixture", MIX[S.mk].short], ["Method", METH[S.meth]], ["Status", S.done ? (S.ok ? "suitable ✓" : "not suitable") : "in progress"]]);
        else ctx.readout([["Sample", String(sIdx + 1)], ["Clock", mmss(PZ[sIdx].t)], ["Readings", String(ctx.rows().filter(r => r.run === "Sample " + (sIdx + 1)).length)]]);
      }
      function prompt(){
        switch(S.meth){
          case "filt": return S.pouring ? "Pouring through the filter paper…" : "Pour the mixture into the filter funnel";
          case "evap": return S.heat ? "Heating — the water is evaporating" : "Heat the basin to evaporate the water";
          case "cryst": return S.phase === "heat" ? (S.heat ? "Heat to the crystallisation point; test with a glass rod" : "Heat the solution gently") : S.phase === "cool" ? "Leaving to cool — crystals grow" : S.phase === "filtered" ? "Dry the crystals between filter papers" : "";
          default: return !S.heat ? "Check the set-up, then switch on the heat" : distilling ? "Distilling — read the thermometer; change receiver when the temperature rises" : "Heating the flask…";
        }
      }

      /* ── controls ── */
      ctx.seg({ label:"Part", value:part, options:[["sep","Separate a mixture"],["pur","Purity: heating curve"]], onChange(v){ part = v; gSep.style.display = v === "sep" ? "" : "none"; gPur.style.display = v === "pur" ? "" : "none"; draw(); } });
      ctx.seg({ label:"Clock speed", value:speed, options:[[1,"×1"],[5,"×5"],[10,"×10"]], onChange(v){ speed = v; } });
      const gSep = ctx.html(`<div></div>`), gPur = ctx.html(`<div style="display:none"></div>`);
      ctx.select({ label:"Mixture", value:mixK, parent:gSep, options:Object.keys(MIX).map(k => [k, `${MIX[k].name} — ${MIX[k].goal.toLowerCase()}`]), onChange(v){ mixK = v; newRun(); syncActs(); } });
      ctx.select({ label:"Method", value:meth, parent:gSep, options:Object.keys(METH).map(k => [k, METH[k]]), onChange(v){ meth = v; newRun(); syncActs(); } });
      const gDist = ctx.html(`<div></div>`, gSep);
      ctx.seg({ label:"Condenser cooling water", value:condIn, parent:gDist, options:[["bottom","In at the bottom"],["top","In at the top"]], onChange(v){ condIn = v; } });
      ctx.seg({ label:"Thermometer bulb", value:bulb, parent:gDist, options:[["arm","Level with side arm"],["liquid","In the liquid"]], onChange(v){ bulb = v; } });
      const acts = ctx.html(`<div></div>`, gSep);
      const rdBox = ctx.html(`<div></div>`, gSep);
      Kit.reading(ctx, "Thermometer reading / °C (to 0.5 °C)", "e.g. 78.0", () => S.meth === "dist" || S.meth === "frac" ? thermT() : null, .5, v => {
        ctx.record({ run:S.label, method:METH[S.meth], result:`receiver ${S.rec.length}${bulb === "arm" ? "" : " (bulb in liquid)"}`, t:"", V:Kit.round(collected(), 1), T:v });
        const m = MIX[S.mk];
        if(S.meth === "dist" && (S.mk === "sea" || S.mk === "ink") && condIn === "bottom" && bulb === "arm" && distilling && Math.abs(v - 100) <= .5) ctx.complete("still");
        if(S.meth === "frac" && m.liq.length > 1 && bulb === "arm"){
          const hits = new Set(ctx.rows().filter(r => r.run === S.label && typeof r.T === "number" && !/liquid/.test(r.result)).map(r => { const c = m.liq.find(([, bp]) => Math.abs(r.T - bp) <= 1); return c ? c[0] + "|" + r.result : null; }).filter(Boolean));
          const liqs = new Set([...hits].map(h => h.split("|")[0])), recs = new Set([...hits].map(h => h.split("|")[1]));
          if(liqs.size >= 2 && recs.size >= 2) ctx.complete("frac");
        }
      }, rdBox);

      function syncActs(){
        acts.innerHTML = "";
        const isD = S.meth === "dist" || S.meth === "frac";
        gDist.style.display = isD ? "" : "none"; rdBox.style.display = isD ? "" : "none";
        const L = [];
        if(S.meth === "filt") L.push({ label:"Pour mixture into the funnel", primary:true, onClick(){ if(S.done || S.pouring) return; S.pouring = true; } });
        if(S.meth === "evap") L.push({ label:S.heat ? "Stop heating" : "Heat", primary:true, onClick(){ if(S.done) return; S.heat = !S.heat; syncActs(); } });
        if(S.meth === "cryst"){
          if(S.phase === "heat"){
            L.push({ label:S.heat ? "Stop heating" : "Heat gently", primary:true, onClick(){ S.heat = !S.heat; syncActs(); } });
            L.push({ label:"Test with a glass rod", onClick(){
              const m = MIX[S.mk]; if(!m.sol || m.sol.nocrys){ S.rodSat = false; S.rodT = 1; ctx.toast(m.sol ? "A dark smear on the rod — dyes do not crystallise" : "Nothing on the rod — there is no dissolved solid"); return; }
              S.rodT = 1; S.rodSat = S.f >= .55;
              if(S.rodSat){ S.rodOK = true; ctx.toast(S.f > .92 ? "Crystals at once — you heated too far; it is spitting" : "Crystals form on the cool rod — crystallisation point reached"); }
              else ctx.toast("No crystals on the rod — not saturated yet; keep heating"); } });
            L.push({ label:"Stop heating and leave to cool", onClick(){ if(!MIX[S.mk].sol){ ctx.toast("There is nothing dissolved to crystallise"); return; } S.heat = false; S.phase = "cool"; S.fCool = S.f; S.g = 0; S.rodT = 0; syncActs(); } });
          }else if(S.phase === "cool") L.push({ label:"Filter off the crystals", primary:true, onClick(){ if(S.g < 1) return ctx.toast("Wait for the crystals to finish growing"); S.phase = "filtered"; syncActs(); } });
          else if(S.phase === "filtered") L.push({ label:"Dry between filter papers", primary:true, onClick(){ const m = MIX[S.mk]; S.phase = "done";
            verdict(m.sol.nocrys ? "dark sticky residue of dyes (no crystals)" : (S.fCool >= 1 && m.sol.hyd ? "white anhydrous powder" : (S.fCool > .92 ? "small crystals: " : "large crystals: ") + m.sol.solid) + (m.sand ? ", mixed with sand" : "")); } });
        }
        if(isD){
          L.push({ label:S.heat ? "Switch off heat" : "Switch on heat", primary:true, onClick(){ if(S.done) return; if(potVol() < 6) return; S.heat = !S.heat; syncActs(); } });
          L.push({ label:"Change receiver", onClick(){ if(S.done) return; if(collected() < .5) return ctx.toast("Nothing collected in this receiver yet"); S.rec.push({}); } });
          L.push({ label:"Finish & assess", onClick(){ S.heat = false; finishDist(); syncActs(); } });
        }
        L.push({ label:"Start again", onClick(){ newRun(); syncActs(); } });
        ctx.buttons(L, acts);
      }
      ctx.frame(dt => { if(S.rodT > 0 && part === "sep"){ S.rodT -= dt/3; if(S.rodT < 0) S.rodT = 0; } });

      /* purity controls */
      ctx.seg({ label:"Sample of octadecanoic acid", value:0, parent:gPur, options:[[0,"Sample 1"],[1,"Sample 2"],[2,"Sample 3"]], onChange(v){ PZ[sIdx].on = false; sIdx = v; syncActs(); } });
      ctx.seg({ label:"Readings", value:false, parent:gPur, options:[[false,"I read the thermometer"],[true,"Auto every 30 s"]], onChange(v){ auto = v; const P = PZ[sIdx]; P.nextAuto = Math.ceil(P.t/30)*30; } });
      const pActs = ctx.html(`<div></div>`, gPur);
      const _sa = syncActs;
      syncActs = function(){ _sa(); pActs.innerHTML = "";
        ctx.buttons([{ label:PZ[sIdx].on ? "Pause clock" : (PZ[sIdx].t > 0 ? "Resume clock" : "Start clock"), primary:true, onClick(){ PZ[sIdx].on = !PZ[sIdx].on; syncActs(); } },
          { label:"Fresh tube", onClick(){ PZ[sIdx] = { H:20, t:0, on:false, nextAuto:0 }; syncActs(); } }], pActs); };
      function recP(T, t, quiet){
        const P = PZ[sIdx], fr = phF(P.H, SAMP[sIdx].m1, LH);
        ctx.record({ run:"Sample " + (sIdx + 1), method:"heating curve", result:fr <= 0 ? "solid" : fr >= 1 ? "liquid" : "melting", t:Math.round(t), V:"", T }, quiet);
      }
      Kit.reading(ctx, "Thermometer reading / °C (to 0.5 °C)", "e.g. 45.5", () => pT(), .5, v => recP(v, PZ[sIdx].t), gPur);
      ctx.html(`<div class="hint">Pure octadecanoic acid melts at a sharp 69 °C. An impure sample melts lower and over a range.</div>`, gPur);
      const pureSeg = ctx.seg({ label:"Which sample is pure?", value:0, parent:gPur, options:[[0,"1"],[1,"2"],[2,"3"]] });
      const pfb = ctx.html(`<div></div>`, gPur);
      ctx.buttons([{ label:"Check my choice", onClick(){
        const heated = [0, 1, 2].filter(i => { const T = ctx.rows().filter(r => r.run === "Sample " + (i + 1)).map(r => r.T); return T.length >= 5 && Math.max(...T) >= 72; });
        if(heated.length < 2){ pfb.innerHTML = `<div class="note bad">Record heating curves (at least 5 readings, up to above 72 °C) for at least two samples first.</div>`; return; }
        const c = pureSeg.get();
        if(c === pureI){ pfb.innerHTML = `<div class="note ok">Correct: sample ${c + 1} stays at one temperature while it melts (flat section), so it is pure.</div>`; ctx.complete("pure"); }
        else pfb.innerHTML = `<div class="note bad">Sample ${c + 1} ${heated.includes(c) ? "melts over a range of temperatures below 69 °C, so it is impure" : "has not been heated yet"}. Look for the flat section on the graph.</div>`;
      } }], gPur);
      Kit.answer(ctx, "Melting point of the pure sample / °C", "from your results", v => {
        const T = ctx.rows().filter(r => r.run === "Sample " + (pureI + 1) && typeof r.T === "number").map(r => r.T);
        if(T.length < 5 || Math.max(...T) < 72) return [false, "Record a full heating curve of the pure sample first."];
        if(Math.abs(v - SAMP[pureI].m1) <= 1){ ctx.complete("mp"); return [true, `Yes — the flat section is at about ${SAMP[pureI].m1.toFixed(0)} °C (±0.5 °C from the thermometer).`]; }
        return [false, "Read the temperature of the flat section of the pure sample's heating curve."];
      }, gPur);

      syncActs(); draw();
    }
  });

  /* ═════════════════════ 2 · PAPER CHROMATOGRAPHY ═════════════════════ */
  const CH = "ig-chromatography";
  const DYES = { A:{ n:"red", c:[220,40,55] }, B:{ n:"yellow", c:[240,195,20] }, C:{ n:"blue", c:[35,90,215] }, D:{ n:"brown", c:[120,70,35] } };
  const AMINO = { Gly:{ n:"glycine" }, Ala:{ n:"alanine" }, Val:{ n:"valine" }, Leu:{ n:"leucine" } };
  const PX = 30, PB = 440;                               // 30 px per cm; bottom of the paper

  Lab.register({
    id:CH, subject:"chemistry", level:["igcse"], topic:"Experimental techniques · Chromatography", interactive:true,
    title:"Paper chromatography",
    summary:"Draw a baseline, spot known dyes, a food colouring and a colourless amino-acid sample, run the chromatogram and measure Rf values with a ruler. See what happens with an ink baseline or the solvent too deep.",
    aim:"Use paper chromatography to find which dyes are in a food colouring, show whether a substance is pure, and calculate Rf values from your own measurements.",
    variables:{ iv:"Sample spotted on the baseline", dv:"Distance moved by each spot and by the solvent front (cm)", cv:["Same solvent and same paper","Baseline above the solvent level","Lid on the tank","Same temperature"] },
    stageTitle:"Chromatography tank", controlsTitle:"Chromatogram",
    thumb:`<svg viewBox="0 0 300 140"><rect x="100" y="10" width="100" height="124" fill="#FBFAF5" stroke="#A2ACBD"/><line x1="104" y1="118" x2="196" y2="118" stroke="#888"/><line x1="104" y1="30" x2="196" y2="30" stroke="#888" stroke-dasharray="3 3"/><circle cx="120" cy="64" r="5" fill="#DC2837"/><circle cx="145" cy="44" r="5" fill="#F0C314"/><circle cx="170" cy="86" r="5" fill="#235AD7"/><circle cx="185" cy="64" r="5" fill="#DC2837"/><circle cx="185" cy="86" r="5" fill="#235AD7"/><rect x="100" y="124" width="100" height="10" fill="#9EC5F5" opacity=".6"/></svg>`,
    challenges:[
      { id:"good",     title:"A good chromatogram", text:"Pencil baseline, solvent below the baseline, lid on, front marked before drying." },
      { id:"mistake",  title:"Learn from a mistake", text:"Run one with an ink baseline or with the solvent above the baseline and see what goes wrong." },
      { id:"front",    title:"Solvent front", text:"Measure how far the solvent front travelled from the baseline." },
      { id:"rf",       title:"Rf values", text:"Calculate the Rf value of three spots from your measurements." },
      { id:"identify", title:"What's in it?", text:"Identify which of the dyes A–D are in food colouring U." },
      { id:"pure",     title:"Pure substance", text:"Show that colouring V is pure and say which dye it is." },
      { id:"locate",   title:"Locating agent", text:"Spray the amino-acid chromatogram and identify the amino acid(s) in X." }
    ],
    columns:[{key:"run",label:"Chromatogram"},{key:"lane",label:"Sample"},{key:"spot",label:"Spot"},{key:"d",label:"Spot distance / cm",dp:1},{key:"front",label:"Solvent front / cm",dp:1},{key:"rf",label:"Rf",dp:2}],
    questions:[
      { q:"Why is the baseline drawn in pencil and not in ink?",
        a:"Pencil (graphite) is insoluble in the solvent, so it does not move. Ink would dissolve, run up the paper and mix with the spots." },
      { q:"Why must the solvent level be below the baseline?",
        a:"Otherwise the spots dissolve into the solvent in the tank instead of being carried up the paper." },
      { q:"Why is a lid put on the tank?",
        a:"So the air inside is saturated with solvent vapour: the solvent does not evaporate from the paper and the front rises evenly." },
      { q:"How is an Rf value calculated, and why is it always less than 1?",
        a:"Rf = distance moved by the spot ÷ distance moved by the solvent front, both measured from the baseline. A spot cannot travel further than the solvent carrying it, so Rf < 1." },
      { q:"How does a chromatogram show that a substance is pure?",
        a:"A pure substance gives only one spot. A mixture gives two or more spots; a substance is identified when its spot has the same Rf as a known substance in the same solvent." },
      { q:"Why is a locating agent needed for amino acids? Give one safety precaution.",
        a:"Amino acids are colourless, so the spots are invisible. The dried paper is sprayed with a locating agent, which reacts to give coloured spots. Spray in a fume cupboard and wear gloves — the locating agent is toxic." },
      { q:"A spot stays on the baseline. What does this show?",
        a:"That substance is insoluble in the solvent. A different solvent is needed to separate it." },
      { q:"A ruler is graduated in mm. What is the uncertainty in a distance, and how could the Rf be made more precise?",
        a:"±0.05 cm per reading (half of 1 mm). Let the solvent travel further (a longer run) so the distances are larger and the percentage uncertainty smaller; use small, concentrated spots so their centres are easy to find." }
    ],
    setup(ctx){
      const RF = { A:Kit.round(.55 + (Math.random() - .5)*.04, 3), B:Kit.round(.80 + (Math.random() - .5)*.04, 3), C:Kit.round(.32 + (Math.random() - .5)*.04, 3), D:Kit.round(.14 + (Math.random() - .5)*.03, 3),
        Gly:Kit.round(.26 + (Math.random() - .5)*.03, 3), Ala:Kit.round(.38 + (Math.random() - .5)*.03, 3), Val:Kit.round(.60 + (Math.random() - .5)*.03, 3), Leu:Kit.round(.73 + (Math.random() - .5)*.03, 3) };
      const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
      const U = shuffle(Object.keys(DYES)).slice(0, 2 + Math.floor(Math.random()*2)).sort();
      const Vd = Object.keys(DYES)[Math.floor(Math.random()*4)];
      const X = shuffle(Object.keys(AMINO)).slice(0, 1 + Math.floor(Math.random()*2)).sort();
      let exp = "dye", pen = "pencil", base = 1.5, depth = 1.0, lid = true, speed = 5, runN = Math.max(0, ...ctx.rows().map(r => +String(r.run).replace(/\D/g, "") || 0)), R = null;
      const lanes = () => exp === "dye" ? [["A",["A"]],["B",["B"]],["C",["C"]],["D",["D"]],["U",U],["V",[Vd]]] : [["Gly",["Gly"]],["Ala",["Ala"]],["Val",["Val"]],["Leu",["Leu"]],["X",X]];
      const laneX = i => { const n = lanes().length; return 130 + 240*(i + 1)/(n + 1); };
      const colOf = k => exp === "dye" ? DYES[k].c : [130,50,150];
      function newPaper(){ runN++; R = { label:`Run ${runN} (${exp === "dye" ? "dyes" : "amino acids"})`, exp, stage:"blank", pen:null, base, frontH:0, front:null, washed:false, ink:false, lidOff:false, overrun:false, frontLost:false, dried:false, sprayed:false, t:0, warned:{} }; sel = null; frontRead = null; spotRead = null; }
      let sel = null, frontRead = null, spotRead = null;
      newPaper();

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="${CH}-svg"><defs>${Kit.DEFS}<clipPath id="${CH}-pp"><rect x="130" y="80" width="240" height="360"/></clipPath>
        <clipPath id="${CH}-tk"><path d="${ChemKit.BEAKER(90, 470, 320, 400)} Z"/></clipPath>
        <linearGradient id="${CH}-ink" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1C2A6B" stop-opacity=".75"/><stop offset=".5" stop-color="#6A2C9B" stop-opacity=".45"/><stop offset="1" stop-color="#2E8BC0" stop-opacity=".25"/></linearGradient></defs>
        ${Kit.bench(960, 470)}<g id="${CH}-scene"></g><text x="24" y="30" class="k-status" id="${CH}-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${CH}-svg`), $ = s => svg.querySelector(s);
      const fD = () => Math.max(0, (R.front === null ? R.frontH : R.front) - R.base);       // front distance above baseline (cm)
      const spoiled = () => R.washed ? "the spots washed off into the solvent" : R.ink ? "the ink baseline ran and smeared over the spots" : R.overrun ? "the solvent front ran off the top of the paper" : R.frontLost ? "the solvent front was not marked before it dried" : null;
      const visible = () => R.stage !== "blank" && R.stage !== "based" && !R.washed && (R.exp === "dye" || R.sprayed);
      function spots(){
        const out = [];
        lanes().forEach(([name, ks], i) => ks.map(k => ({ k, rf:RF[k] })).sort((a, b) => b.rf - a.rf).forEach((o, j) => out.push({ lane:name, i, j:j + 1, k:o.k, rf:o.rf, d:o.rf*fD() })));
        return out;
      }

      ctx.frame(dt => {
        const d = dt*speed;
        if(R.stage === "running"){
          R.t += d;
          if(!lid) R.lidOff = true;
          const h = R.frontH - depth + .3;
          R.frontH += .9/h*d*(lid ? 1 : .7);
          if(R.washed && !R.warned.w){ R.warned.w = true; ctx.toast("The solvent is above the baseline — the spots are dissolving into the solvent!"); ctx.complete("mistake"); }
          if(R.pen === "ink" && fD() > .4 && !R.ink){ R.ink = true; ctx.toast("The ink baseline is dissolving and running up the paper"); ctx.complete("mistake"); }
          if(R.frontH >= 11.6){ R.frontH = 11.6; if(!R.overrun){ R.overrun = true; ctx.toast("The solvent front reached the top of the paper — you can no longer tell how far it moved"); } }
        }
        draw();
      });

      function draw(){
        const ln = lanes(), by = PB - R.base*PX, inTank = R.stage === "running" || R.stage === "spotted" && false;
        const out = ["removed","marked","dried"].includes(R.stage);
        let s = "";
        /* tank */
        const sl = PB - depth*PX;
        s += `<g opacity="${out ? .35 : 1}"><rect x="92" y="${sl}" width="316" height="${470 - sl}" fill="${R.washed ? "rgba(150,110,140,.45)" : "rgba(140,185,235,.4)"}" clip-path="url(#${CH}-tk)"/>
          <path d="${ChemKit.BEAKER(90, 470, 320, 400)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.6"/>
          <text x="250" y="${Math.min(462, sl + 18)}" text-anchor="middle" class="k-lbl">solvent (${exp === "dye" ? "water" : "organic solvent"}) · ${depth.toFixed(1)} cm deep</text></g>`;
        s += lid ? `<rect x="84" y="58" width="332" height="9" rx="2" fill="rgba(200,220,240,.55)" stroke="var(--txt2)"/><text x="424" y="66" class="k-lbl">lid</text>`
          : `<rect x="440" y="462" width="150" height="7" rx="2" fill="rgba(200,220,240,.55)" stroke="var(--txt2)"/><text x="515" y="456" text-anchor="middle" class="k-lbl">lid (off)</text>`;
        /* paper */
        if(R.stage !== "running") s += `<line x1="100" y1="76" x2="400" y2="76" stroke="url(#k-metal)" stroke-width="4"/>`;
        s += `<g clip-path="url(#${CH}-pp)"><rect x="130" y="80" width="240" height="360" fill="#FBFAF5" stroke="#C9C3B0"/>`;
        if(!R.dried && R.stage !== "blank" && R.frontH > 0){
          const fy = PB - R.frontH*PX;
          s += R.lidOff ? `<path d="M130 ${fy} ${Array.from({ length:13 }, (_, i) => `L${130 + i*20} ${fy + Math.sin(i*1.3 + R.t*.2)*6}`).join(" ")} L370 440 L130 440 Z" fill="rgba(140,185,235,.22)"/>`
            : `<rect x="130" y="${fy}" width="240" height="${PB - fy}" fill="rgba(140,185,235,.22)"/>`;
        }
        if(R.stage === "running" && R.frontH > depth) s += `<rect x="130" y="${sl}" width="240" height="${PB - sl}" fill="rgba(140,185,235,.35)"/>`;
        /* baseline */
        if(R.stage !== "blank"){
          const inkCol = R.ink ? "rgba(30,40,110,.35)" : "#1C2A6B";
          s += `<line x1="140" y1="${by}" x2="360" y2="${by}" stroke="${R.pen === "ink" ? inkCol : "#8A8A8A"}" stroke-width="${R.pen === "ink" ? 2 : 1}"/>`;
          if(R.ink) s += `<rect x="134" y="${by - fD()*.6*PX}" width="232" height="${fD()*.6*PX + 3}" fill="url(#${CH}-ink)"/>`;
          ln.forEach(([name], i) => s += `<text x="${laneX(i)}" y="${by + 16}" text-anchor="middle" style="font:500 10px Inter;fill:#7A7A7A">${name}</text>`);
        }
        /* spots */
        if(R.stage !== "blank" && R.stage !== "based"){
          const moving = fD() > 0;
          if(R.washed){ const fade = Math.max(0, 1 - R.t/8);
            ln.forEach(([, ks], i) => { const c = ChemKit.mix(colOf(ks[0]), ks[1] ? colOf(ks[1]) : colOf(ks[0]), .5); if(exp === "dye" && fade > 0) s += `<circle cx="${laneX(i)}" cy="${by}" r="6" fill="rgba(${c},${fade})"/>`; }); }
          else if(visible()){
            if(!moving) ln.forEach(([, ks], i) => { let c = colOf(ks[0]); ks.slice(1).forEach((k, j) => c = ChemKit.mix(c, colOf(k), 1/(j + 2))); s += `<circle cx="${laneX(i)}" cy="${by}" r="6" fill="rgb(${c})"/>`; });
            else spots().forEach(o => { const ry = 5 + o.d*.9, a = Math.max(.45, .95 - o.d*.03);
              s += `<ellipse cx="${laneX(o.i) + (R.lidOff ? Math.sin(o.i) * 2 : 0)}" cy="${by - o.d*PX}" rx="${6.5 + o.d*.15}" ry="${ry}" fill="rgba(${colOf(o.k)},${a})"/>`; });
          }else if(R.exp === "amino" && !R.washed) ln.forEach((_, i) => s += `<circle cx="${laneX(i)}" cy="${by}" r="1.5" fill="#8A8A8A"/>`);
        }
        if(R.front !== null && !R.frontLost) s += `<line x1="134" y1="${PB - R.front*PX}" x2="366" y2="${PB - R.front*PX}" stroke="#7A7A7A" stroke-dasharray="5 3"/><text x="140" y="${PB - R.front*PX - 4}" style="font:500 9px Inter;fill:#7A7A7A">solvent front</text>`;
        s += `</g><rect x="130" y="80" width="240" height="360" fill="none" stroke="#B8B2A0"/>`;
        if(R.exp === "amino" && R.sprayed) s += `<text x="250" y="100" text-anchor="middle" class="k-lbl">sprayed with locating agent</text>`;
        /* ruler */
        if(R.dried){
          s += `<rect x="374" y="80" width="30" height="${by - 80 + 14}" fill="#F7F0D8" stroke="#B8A774"/>`;
          for(let mm = 0; mm <= (by - 86)/PX*10; mm++){ const y = by - mm*PX/10; s += `<line x1="374" y1="${y}" x2="${374 + (mm % 10 ? (mm % 5 ? 5 : 8) : 12)}" y2="${y}" stroke="#5A4E2A" stroke-width=".7"/>${mm % 10 ? "" : `<text x="390" y="${y + 3}" style="font:500 8px 'JetBrains Mono';fill:#5A4E2A">${mm/10}</text>`}`; }
          s += `<text x="389" y="${by + 22}" text-anchor="middle" class="k-lbl">cm</text>`;
        }
        /* lens */
        const tgt = target();
        if(tgt){
          s += ChemKit.lens({ id:`${CH}-l`, cx:740, cy:170, r:100, S:60, value:tgt.d, minor:.1, major:1, half:.5, down:false, tube:70, label:"magnifier on the ruler (mm)" });
          s += `<g transform="translate(740 170)">${tgt.front ? `<line x1="-10" y1="0" x2="95" y2="0" stroke="#7A7A7A" stroke-width="2" stroke-dasharray="7 4"/>` : `<ellipse cx="38" cy="0" rx="${(6.5 + tgt.d*.15)*2}" ry="${(5 + tgt.d*.9)*2}" fill="rgba(${colOf(tgt.k)},.7)"/><line x1="10" y1="0" x2="70" y2="0" stroke="rgba(0,0,0,.35)" stroke-dasharray="2 2"/>`}</g>
            <line x1="404" y1="${tgt.front ? PB - R.front*PX : by - tgt.d*PX}" x2="640" y2="170" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".7"/>`;
        }else s += `<g transform="translate(740 170)"><circle r="100" fill="var(--bg-card)" stroke="var(--brd2)" stroke-dasharray="5 4"/>${ChemKit.lines(R.dried ? "choose what to measure" : "dry the paper, then measure with the ruler", 22, -80, 0, 16)}</g>`;
        /* card */
        const sp = spoiled();
        s += card(560, 300, 380, 160) + `<text x="574" y="324" class="k-tag">${ctx.esc(R.label)}</text>
          <text x="574" y="344" class="k-lbl">baseline: ${R.pen ? R.pen + ", " + R.base.toFixed(1) + " cm above the bottom" : "not drawn"} · lid ${lid ? "on" : "off"}</text>
          <text x="574" y="362" class="k-lbl">solvent front: ${R.frontH > 0 ? (fD()).toFixed(1) + " cm above the baseline" : "—"}${R.front !== null ? " (marked)" : ""}</text>
          <text x="574" y="380" class="k-lbl">front read: ${frontRead === null ? "—" : frontRead.toFixed(1) + " cm"} · last spot read: ${spotRead === null ? "—" : spotRead.d.toFixed(1) + " cm"}</text>
          ${sp ? `<text x="574" y="402" class="k-tag" style="fill:#E0334A">Spoiled: </text>${ChemKit.lines(sp + ". Start a new paper.", 46, 574, 420, 15)}` : R.lidOff ? ChemKit.lines("Lid was off: solvent evaporated from the paper, so the front is uneven and slower.", 52, 574, 404, 15) : ""}`;
        $(`#${CH}-scene`).innerHTML = s;
        $(`#${CH}-status`).textContent = ({ blank:"Draw a baseline on the chromatography paper", based:"Spot the samples on the baseline", spotted:"Put the paper in the tank", running:"Solvent rising… remove the paper before the front reaches the top", removed:"Mark the solvent front straight away", marked:"Dry the paper", dried:R.exp === "amino" && !R.sprayed ? "Spray with locating agent (fume cupboard)" : "Measure the front and the spots with the ruler" })[R.stage];
        ctx.readout([["Stage", R.stage], ["Front above baseline", R.frontH > 0 ? fD().toFixed(1) + " cm" : "—"], ["Lid", lid ? "on" : "off"]]);
      }
      function target(){
        if(!R.dried || !sel || spoiled()) return null;
        if(sel === "front") return R.front === null ? null : { front:true, d:R.front - R.base };
        const o = spots().find(o => o.lane + "|" + o.j === sel); return o && visible() ? o : null;
      }

      /* controls */
      ctx.seg({ label:"Experiment", value:exp, options:[["dye","Food dyes (water)"],["amino","Amino acids (locating agent)"]], onChange(v){ exp = v; newPaper(); sync(); } });
      ctx.seg({ label:"Draw the baseline with", value:pen, options:[["pencil","Pencil"],["ink","Ink pen"]], onChange(v){ pen = v; } });
      ctx.slider({ label:"Baseline height above bottom of paper", min:1, max:2.5, step:.5, value:base, unit:"cm", fmt:v => v.toFixed(1), onInput(v){ base = v; } });
      ctx.slider({ label:"Depth of solvent in tank", min:.5, max:3, step:.5, value:depth, unit:"cm", fmt:v => v.toFixed(1), onInput(v){ if(R.stage === "running") return; depth = v; } });
      ctx.seg({ label:"Lid", value:lid, options:[[true,"On"],[false,"Off"]], onChange(v){ lid = v; } });
      ctx.seg({ label:"Speed", value:speed, options:[[1,"×1"],[5,"×5"],[10,"×10"]], onChange(v){ speed = v; } });
      const actBox = ctx.html(`<div></div>`);
      const measBox = ctx.html(`<div></div>`);
      function sync(){
        actBox.innerHTML = "";
        const st = R.stage, L = [];
        if(st === "blank") L.push({ label:`Draw baseline (${pen})`, primary:true, onClick(){ R.pen = pen; R.base = base; R.stage = "based"; sync(); } });
        if(st === "based") L.push({ label:"Spot the samples", primary:true, onClick(){ R.stage = "spotted"; sync(); } });
        if(st === "spotted") L.push({ label:"Hang the paper in the tank", primary:true, onClick(){ R.stage = "running"; R.frontH = depth; R.washed = depth >= R.base; R.lidOff = !lid; sync(); } });
        if(st === "running") L.push({ label:"Remove the paper", primary:true, onClick(){ R.stage = "removed"; if(fD() < 4 && !R.washed) ctx.toast(`The solvent only moved ${fD().toFixed(1)} cm — the spots are not well separated`); sync(); } });
        if(st === "removed") L.push({ label:"Mark the solvent front (pencil)", primary:true, onClick(){ R.front = R.frontH; R.stage = "marked"; sync(); } });
        if(st === "removed" || st === "marked") L.push({ label:"Dry the paper", onClick(){
          if(R.front === null){ R.frontLost = true; ctx.toast("The solvent evaporated before you marked the front — its position is lost"); }
          R.stage = "dried"; R.dried = true;
          if(!spoiled() && R.pen === "pencil" && !R.lidOff) ctx.complete("good");
          sync(); } });
        if(st === "dried" && R.exp === "amino" && !R.sprayed) L.push({ label:"Spray locating agent (fume cupboard, gloves)", primary:true, onClick(){ R.sprayed = true; ctx.toast("Purple spots appear where the amino acids are"); sync(); } });
        L.push({ label:"New paper", onClick(){ newPaper(); sync(); } });
        ctx.buttons(L, actBox);
        measBox.style.display = st === "dried" ? "" : "none";
        const opts = [["", "— choose —"]];
        if(R.front !== null) opts.push(["front", "Solvent front"]);
        if(visible() && !spoiled()) spots().forEach(o => opts.push([o.lane + "|" + o.j, `Sample ${o.lane} · spot ${o.j} (${exp === "dye" ? DYES[o.k].n : "purple"})`]));
        measSel.input.innerHTML = opts.map(([v, l]) => `<option value="${v}">${ctx.esc(l)}</option>`).join("");
        measSel.input.value = sel && opts.some(o => o[0] === sel) ? sel : "";
        sel = measSel.input.value || null;
        idDye.style.display = exp === "dye" ? "" : "none"; idAm.style.display = exp === "amino" ? "" : "none";
      }
      const measSel = ctx.select({ label:"Measure with the ruler", value:"", parent:measBox, options:[["", "— choose —"]], onChange(v){ sel = v || null; rd.clear(); } });
      const rd = Kit.reading(ctx, "Distance from the baseline / cm (to 0.1 cm)", "e.g. 6.4", () => { const t = target(); return t ? t.d : null; }, .1, v => {
        const t = target();
        if(t.front){ frontRead = v; ctx.complete("front"); ctx.toast("Solvent front distance noted"); }
        else{ spotRead = { d:v, lane:t.lane, spot:t.j, k:t.k }; ctx.toast("Now calculate its Rf"); }
        rd.clear();
      }, measBox);
      const rfBox = Kit.answer(ctx, "Rf of the spot you just measured (2 d.p.)", "e.g. 0.54", v => {
        if(frontRead === null) return [false, "Measure the solvent front first."];
        if(spotRead === null) return [false, "Measure a spot first."];
        const want = spotRead.d/frontRead;
        if(Math.abs(v - want) > .015) return [false, "Rf = distance moved by the spot ÷ distance moved by the solvent front (both from the baseline)."];
        ctx.record({ run:R.label, lane:spotRead.lane, spot:`${spotRead.spot} (${exp === "dye" ? DYES[spotRead.k].n : "purple"})`, d:spotRead.d, front:frontRead, rf:Kit.round(want, 2) });
        spotRead = null;
        if(ctx.rows().filter(r => typeof r.rf === "number").length >= 3) ctx.complete("rf");
        return [true, `Rf = ${want.toFixed(2)} ✓ recorded`];
      }, measBox);
      const ready = () => R.dried && !spoiled() && R.front !== null;
      const idDye = ctx.html(`<div><div class="ctl"><label><span>Dyes present in food colouring U</span></label><div style="display:flex;gap:12px;flex-wrap:wrap">${Object.keys(DYES).map(k => `<label style="display:flex;gap:4px;align-items:center"><input type="checkbox" data-k="${k}">${k} (${DYES[k].n})</label>`).join("")}</div><div class="fb" style="margin-top:6px"></div></div></div>`, measBox);
      ctx.buttons([{ label:"Check U", onClick(){
        const fb = idDye.querySelector(".fb"), got = [...idDye.querySelectorAll("input:checked")].map(i => i.dataset.k).sort();
        if(!ready()) return void (fb.innerHTML = `<div class="note bad">Run, mark and dry a good chromatogram first.</div>`);
        if(got.join() === U.join()){ fb.innerHTML = `<div class="note ok">Correct: U gives ${U.length} spots, at the same heights (same Rf) as ${U.join(" and ")}. U is a mixture.</div>`; ctx.complete("identify"); }
        else fb.innerHTML = `<div class="note bad">Compare the Rf of each U spot with the single spots of A–D.</div>`;
      } }], idDye);
      const vSel = ctx.select({ label:"Colouring V is…", value:"", parent:idDye, options:[["", "— choose —"], ["mix", "a mixture"]].concat(Object.keys(DYES).map(k => [k, `pure: the same as dye ${k}`])) });
      const vfb = ctx.html(`<div></div>`, idDye);
      ctx.buttons([{ label:"Check V", onClick(){
        if(!ready()) return void (vfb.innerHTML = `<div class="note bad">Run, mark and dry a good chromatogram first.</div>`);
        const v = vSel.get();
        if(v === Vd){ vfb.innerHTML = `<div class="note ok">Correct: V gives a single spot, so it is a pure substance, with the same Rf as dye ${Vd}.</div>`; ctx.complete("pure"); }
        else vfb.innerHTML = `<div class="note bad">${v === "mix" ? "How many spots does V give?" : "Count V's spots and compare its Rf with A–D."}</div>`;
      } }], idDye);
      const idAm = ctx.html(`<div style="display:none"><div class="ctl"><label><span>Amino acids present in X</span></label><div style="display:flex;gap:12px;flex-wrap:wrap">${Object.keys(AMINO).map(k => `<label style="display:flex;gap:4px;align-items:center"><input type="checkbox" data-k="${k}">${AMINO[k].n}</label>`).join("")}</div><div class="fb" style="margin-top:6px"></div></div></div>`, measBox);
      ctx.buttons([{ label:"Check X", onClick(){
        const fb = idAm.querySelector(".fb"), got = [...idAm.querySelectorAll("input:checked")].map(i => i.dataset.k).sort();
        if(!ready() || !R.sprayed) return void (fb.innerHTML = `<div class="note bad">Run, mark, dry and spray a good chromatogram first.</div>`);
        if(got.join() === X.join()){ fb.innerHTML = `<div class="note ok">Correct: X contains ${X.map(k => AMINO[k].n).join(" and ")} — matching Rf values.</div>`; ctx.complete("locate"); }
        else fb.innerHTML = `<div class="note bad">Compare the Rf of each purple X spot with the standards.</div>`;
      } }], idAm);
      ctx.html(`<div class="hint">Rf = distance moved by spot ÷ distance moved by solvent front. Measure each to the centre of the spot.</div>`);
      sync(); draw();
    }
  });

  /* ═════════════════════ 3 · SOLUBILITY & COOLING CURVES ═════════════════════ */
  const SL = "ig-solubility";
  /* solubility of KNO₃ / g per 100 g water */
  const KNO3 = [[0,13.3],[10,20.9],[20,31.6],[30,45.8],[40,63.9],[50,85.5],[60,110],[70,138],[80,169]];
  const solAt = T => { for(let i = 1; i < KNO3.length; i++) if(T <= KNO3[i][0]){ const [a, sa] = KNO3[i - 1], [b, sb] = KNO3[i], f = (T - a)/(b - a); return Math.exp(Math.log(sa) + f*(Math.log(sb) - Math.log(sa))); } return 169; };
  const TofS = s => { let lo = 0, hi = 80; for(let k = 0; k < 40; k++){ const m = (lo + hi)/2; if(solAt(m) < s) lo = m; else hi = m; } return (lo + hi)/2; };

  Lab.register({
    id:SL, subject:"chemistry", level:["igcse"], topic:"Experimental techniques · Solubility & cooling curves", interactive:true,
    title:"Solubility and cooling curves",
    summary:"Dissolve potassium nitrate in hot water, cool it and catch the temperature at which crystals first appear; add water and repeat to plot a solubility curve. Then record cooling curves of two samples and find which is pure.",
    aim:"Measure the solubility of potassium nitrate at different temperatures and plot a solubility curve; use cooling curves to find a freezing point and to distinguish a pure substance from an impure one.",
    variables:{ iv:"Volume of water (cm³) — and so concentration; or time (s) when cooling", dv:"Temperature at which crystals first appear (°C); temperature while cooling (°C)", cv:["Same mass of potassium nitrate","Stir continuously with the thermometer","Cool in the same way each time"] },
    stageTitle:"Solubility bench", controlsTitle:"Experiment",
    thumb:`<svg viewBox="0 0 300 140"><path d="M40 120 H260 M40 120 V20" stroke="#A2ACBD" stroke-width="2"/><path d="M45 110 Q140 100 180 70 T250 22" fill="none" stroke="#FF8A3D" stroke-width="3"/><circle cx="110" cy="102" r="4" fill="#3B82F6"/><circle cx="160" cy="84" r="4" fill="#3B82F6"/><circle cx="200" cy="58" r="4" fill="#3B82F6"/></svg>`,
    challenges:[
      { id:"first",  title:"First crystals", text:"Stop within 1.5 °C of the temperature at which crystals first appear." },
      { id:"sol",    title:"Calculate solubility", text:"Calculate the solubility in g per 100 g of water for a reading." },
      { id:"curve",  title:"Solubility curve", text:"Record five points (5, 6, 7, 8, 9 cm³ of water) and plot the curve." },
      { id:"readoff",title:"Read the graph", text:"Read the solubility at a given temperature from your curve." },
      { id:"fp",     title:"Freezing point", text:"Find the freezing point of the pure sample from its cooling curve." },
      { id:"impure", title:"Spot the impure sample", text:"Record both cooling curves and identify the impure sample." }
    ],
    columns:[{key:"run",label:"Run"},{key:"Vw",label:"Water / cm³",dp:1},{key:"t",label:"t / s",dp:0},{key:"T",label:"T / °C",dp:1},{key:"S",label:"Solubility / g per 100 g water",dp:1},{key:"result",label:"Appearance"}],
    series:"run",
    graph:{ x:["T","t"], y:["S","T"], fit:"curve" },
    questions:[
      { q:"Why is the solution stirred with the thermometer while it cools?",
        a:"So the whole solution is at the same temperature as the thermometer bulb, and the first crystals are seen as soon as they form (stirring also stops supersaturation)." },
      { q:"Why is the temperature at which crystals first appear the saturation temperature?",
        a:"At that temperature the solution is saturated: the mass of KNO₃ in the tube is exactly the maximum that dissolves in that mass of water. Below it the excess crystallises out." },
      { q:"How is solubility in g per 100 g water calculated? (density of water 1.00 g cm⁻³)",
        a:"Solubility = mass of solute ÷ mass of water × 100. For 4.00 g in 8.0 cm³ (8.0 g) water: 4.00 ÷ 8.0 × 100 = 50 g per 100 g water." },
      { q:"Why does the temperature of a pure substance stay constant while it freezes?",
        a:"As the liquid turns to solid, bonds/forces between particles form and energy is released; this balances the heat lost to the surroundings, so the temperature stays at the freezing point until all of it is solid." },
      { q:"How does a cooling curve show that a sample is impure?",
        a:"The impure sample starts to freeze at a lower temperature and freezes over a range: the curve slopes instead of having a flat section." },
      { q:"Suggest two sources of error in the solubility experiment and an improvement.",
        a:"Crystals noticed late (reading too low); water evaporating while heating (volume less than recorded); thermometer reads to ±0.5 °C. Improve: watch carefully against a dark background, repeat each reading and take the mean, heat only until dissolved." },
      { q:"State the independent, dependent and controlled variables in the solubility experiment.",
        a:"Independent: the volume (mass) of water. Dependent: the temperature at which crystals first appear. Controlled: the mass of KNO₃; stirring; cooling in air." },
      { q:"Why is the stearic acid melted in a water bath rather than over a direct flame?",
        a:"A water bath heats gently and evenly to no more than 100 °C, avoiding local overheating and decomposition; the acid is flammable, so a naked flame is avoided near it." }
    ],
    setup(ctx){
      const mass = Kit.round(3.6 + Math.random()*.8, 2), Tq = [30, 35, 40][Math.floor(Math.random()*3)];
      let part = "sol", speed = 2, V = 5.0, T = 20, mode = "cold", hold = false, heldTc = null, pending = null, done5 = new Set();
      const Tc = () => TofS(mass/V*100);
      const und = Tt => Math.max(0, 1 - solAt(Tt)*V/100/mass);
      /* cooling-curve samples */
      const pureI = Math.random() < .5 ? 0 : 1, NM = ["P", "Q"];
      const CS = [0, 1].map(i => i === pureI ? { m1:69.3, m2:69.3 } : { m1:Kit.round(56 + Math.random()*3, 1), m2:Kit.round(63 + Math.random()*2.5, 1) });
      const CZ = [0, 1].map(() => ({ H:20, t:0, on:false, melted:false, nextAuto:0 }));
      let cI = 0, auto = false;
      const KC = .008, LC = 40, cT = () => phT(CZ[cI].H, CS[cI].m1, CS[cI].m2, LC), cF = () => phF(CZ[cI].H, CS[cI].m1, LC);

      ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="${SL}-svg"><defs>${Kit.DEFS}<clipPath id="${SL}-bt"><path d="M266 120 V376 A14 14 0 0 0 294 376 V120 Z"/></clipPath></defs>
        ${Kit.bench(960, 480)}<g id="${SL}-scene"></g><text x="24" y="30" class="k-status" id="${SL}-status"></text></svg>`;
      Kit.style(ctx);
      const svg = ctx.stage.querySelector(`#${SL}-svg`), $ = s => svg.querySelector(s);

      ctx.frame((dt, el) => {
        const d = dt*speed;
        if(part === "sol" && !hold){
          if(mode === "heat") T += .06*(75 - T)*d;
          else if(mode === "cool") T += .025*(20 - T)*d;
          if(mode === "heat" && und(T) === 0 && T > Tc() + 8){ mode = "hot"; ctx.toast("All the potassium nitrate has dissolved — remove the tube and let it cool"); sync(); }
        }
        if(part === "cool"){
          const P = CZ[cI];
          if(P.on){ const n = Math.ceil(d/.5), h = d/n;
            for(let i = 0; i < n; i++){ P.H += KC*(20 - phT(P.H, CS[cI].m1, CS[cI].m2, LC))*h; P.t += h;
              if(auto && P.t >= P.nextAuto){ recC(Math.round(cT()*2)/2, P.nextAuto, true); P.nextAuto += 30; } }
            if(P.t > 900){ P.on = false; sync(); } }
        }
        draw(el);
      });

      function drawSol(el){
        const u = und(T), wob = hold ? 0 : Math.sin(el*5)*3;
        let s = "";
        if(mode === "heat") s += bunsen(280, 480, true, 34) + tripod(280, 400, 480, 90) + `<path d="${ChemKit.BEAKER(200, 398, 160, 150)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/><rect x="201" y="276" width="158" height="120" fill="url(#k-water)"/><text x="368" y="300" class="k-lbl">hot water bath</text>`;
        else s += `<rect x="150" y="470" width="120" height="10" rx="3" fill="url(#k-metal)"/><rect x="186" y="100" width="8" height="372" rx="3" fill="url(#k-metal)"/><rect x="190" y="150" width="78" height="8" rx="3" fill="url(#k-metal)"/>`;
        const lvl = 376 - V*9;
        s += `<g clip-path="url(#${SL}-bt)"><rect x="262" y="${lvl}" width="36" height="${400 - lvl}" fill="rgba(215,228,242,.45)"/>`;
        const n = Math.min(80, Math.ceil(u*240));
        for(let i = 0; i < n; i++){ const x = 270 + (i*13) % 20, y = mode === "cold" || mode === "heat" ? 386 - (i*7) % 22 : lvl + 8 + (i*37) % (386 - lvl - 8);
          s += `<line x1="${x}" y1="${y}" x2="${x + 3 + i % 3}" y2="${y - 4 - i % 4}" stroke="#F8FAFC" stroke-width="1.6"/><line x1="${x}" y1="${y}" x2="${x + 3 + i % 3}" y2="${y - 4 - i % 4}" stroke="rgba(0,0,0,.35)" stroke-width=".5"/>`; }
        s += `</g><path d="M266 120 V376 A14 14 0 0 0 294 376 V120" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>${stem(280 + wob, 60, 380, T)}
          <text x="262" y="66" text-anchor="end" class="k-lbl">boiling tube:</text><text x="262" y="82" text-anchor="end" class="k-lbl">${mass.toFixed(2)} g KNO₃ + ${V.toFixed(1)} cm³ water</text>`;
        s += card(430, 50, 290, 170) + `<text x="444" y="74" class="k-tag">Potassium nitrate solubility</text>
          <text x="444" y="96" class="k-lbl">mass of KNO₃ = ${mass.toFixed(2)} g (weighed)</text>
          <text x="444" y="114" class="k-lbl">water added so far = ${V.toFixed(1)} cm³ (= ${V.toFixed(1)} g)</text>
          <text x="444" y="134" class="k-lbl">in the tube: ${u > 0 ? (mode === "cool" ? "crystals forming" : "undissolved solid") : "clear solution"}</text>
          ${ChemKit.lines(hold ? "Clock stopped: read the thermometer now." : mode === "cool" ? "Stir with the thermometer and watch for the very first crystals." : "Heat in the water bath until all the solid dissolves.", 40, 444, 158, 16)}
          <text x="444" y="206" class="k-lbl">speed ×${speed}</text>`;
        s += thermLens(`${SL}-l1`, 820, 330, 95, T, "magnifier on the thermometer (1 °C divisions)") + `<line x1="${283 + wob}" y1="${380 - Math.max(4, T/150*320)}" x2="725" y2="330" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".7"/>`;
        return s;
      }
      function drawCool(){
        const P = CZ[cI], Tn = cT(), fr = cF();
        let s = `<rect x="150" y="470" width="120" height="10" rx="3" fill="url(#k-metal)"/><rect x="186" y="100" width="8" height="372" rx="3" fill="url(#k-metal)"/><rect x="190" y="150" width="78" height="8" rx="3" fill="url(#k-metal)"/>`;
        s += `<path d="${ChemKit.BEAKER(230, 470, 100, 120)}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/><text x="340" y="460" class="k-lbl">empty beaker (still air)</text>`;
        s += `<g clip-path="url(#${SL}-bt)"><rect x="262" y="330" width="36" height="${70}" fill="rgba(250,238,190,.55)"/><rect x="262" y="${390 - 60*(1 - fr)}" width="36" height="${60*(1 - fr) + 10}" fill="#F2EFE6"/>
          ${fr > 0 && fr < 1 ? `<path d="M266 ${390 - 60*(1 - fr)} l6 -4 l6 3 l6 -5 l6 4 l4 -2" stroke="#E0DAC8" fill="none"/>` : ""}</g>
          <path d="M266 120 V376 A14 14 0 0 0 294 376 V120" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>${stem(280, 60, 380, Tn)}
          <text x="262" y="66" text-anchor="end" class="k-lbl">sample ${NM[cI]}</text><text x="262" y="82" text-anchor="end" class="k-lbl">(octadecanoic acid)</text>`;
        s += clock(430, 40, P.t, P.on);
        s += card(430, 124, 290, 130) + `<text x="444" y="148" class="k-tag">Cooling curve · sample ${NM[cI]}</text>
          <text x="444" y="170" class="k-lbl">appearance: ${!P.melted ? "white solid (not melted yet)" : fr >= 1 ? "clear liquid" : fr <= 0 ? "white solid" : "freezing (liquid + solid)"}</text>
          <text x="444" y="190" class="k-lbl">readings this sample: ${ctx.rows().filter(r => r.run === "Sample " + NM[cI]).length}</text>
          ${ChemKit.lines("Read the thermometer every 30 s until it is well below 55 °C.", 40, 444, 212, 16)}`;
        s += thermLens(`${SL}-l2`, 820, 330, 95, Tn, "magnifier on the thermometer (1 °C divisions)") + `<line x1="283" y1="${380 - Math.max(4, Tn/150*320)}" x2="725" y2="330" stroke="var(--accent)" stroke-dasharray="3 3" opacity=".7"/>`;
        return s;
      }
      function draw(el){
        $(`#${SL}-scene`).innerHTML = part === "sol" ? drawSol(el || 0) : drawCool();
        $(`#${SL}-status`).textContent = part === "sol" ? (hold ? "Read the thermometer" : mode === "cool" ? "Cooling… press the button as soon as crystals appear" : mode === "hot" ? "Remove from the water bath and cool while stirring" : mode === "heat" ? "Heating in the water bath…" : "Heat the tube in the water bath to dissolve the solid")
          : (CZ[cI].on ? "Read the thermometer every 30 s" : CZ[cI].melted ? "Start the clock as the liquid begins to cool" : "Melt the sample in a hot water bath first");
        if(part === "sol") ctx.readout([["Water", V.toFixed(1) + " cm³"], ["Points", String(ctx.rows().filter(r => typeof r.S === "number").length)], ["State", hold ? "stopped" : mode]]);
        else ctx.readout([["Sample", NM[cI]], ["Clock", mmss(CZ[cI].t)], ["Readings", String(ctx.rows().filter(r => r.run === "Sample " + NM[cI]).length)]]);
      }

      ctx.seg({ label:"Part", value:part, options:[["sol","Solubility curve"],["cool","Cooling curves"]], onChange(v){ part = v; gS.style.display = v === "sol" ? "" : "none"; gC.style.display = v === "cool" ? "" : "none"; draw(0); } });
      ctx.seg({ label:"Clock speed", value:speed, options:[[1,"×1"],[2,"×2"],[5,"×5"]], onChange(v){ speed = v; } });
      const gS = ctx.html(`<div></div>`), gC = ctx.html(`<div style="display:none"></div>`);
      const sActs = ctx.html(`<div></div>`, gS), cActs = ctx.html(`<div></div>`, gC);
      function sync(){
        sActs.innerHTML = ""; cActs.innerHTML = "";
        const L = [];
        if(mode === "cold" || mode === "cool" && !hold) L.push({ label:"Heat in water bath", primary:mode === "cold", onClick(){ hold = false; pending = null; mode = "heat"; sync(); } });
        if(mode === "hot") L.push({ label:"Remove and cool, stirring", primary:true, onClick(){ mode = "cool"; heldTc = Tc(); sync(); } });
        if(mode === "cool" && !hold) L.push({ label:"Crystals appear! Stop", primary:true, onClick(){
          if(und(T) <= 0) return ctx.toast("No crystals yet — keep watching");
          hold = true; if(T < Tc() - 3) ctx.toast("Late — lots of crystals have already formed, so your reading will be too low");
          else if(T >= Tc() - 1.5) ctx.complete("first");
          sync(); } });
        if(hold) L.push({ label:"Add 1.0 cm³ water", primary:!!pending && pending.done, onClick(){
          if(!pending || !pending.done) return ctx.toast("Read the thermometer and work out the solubility first");
          if(V >= 12) return ctx.toast("That is enough points");
          V = Kit.round(V + 1, 1); hold = false; pending = null; mode = "cold"; T = Math.max(T, 20); sync(); } });
        L.push({ label:"New tube", onClick(){ V = 5; T = 20; mode = "cold"; hold = false; pending = null; sync(); } });
        ctx.buttons(L, sActs);
        const P = CZ[cI];
        ctx.buttons([
          { label:"Melt in hot water bath", onClick(){ if(P.on) return; CZ[cI] = { H:CS[cI].m1 + LC + (85 - CS[cI].m2), t:0, on:false, melted:true, nextAuto:0 }; sync(); } },
          { label:P.on ? "Pause clock" : P.t > 0 ? "Resume clock" : "Start clock", primary:true, onClick(){ if(!CZ[cI].melted) return ctx.toast("Melt the sample first"); CZ[cI].on = !CZ[cI].on; sync(); } }
        ], cActs);
      }
      const rdS = Kit.reading(ctx, "Temperature when crystals first appear / °C", "e.g. 42.5", () => hold && !pending ? T : null, .5, v => { pending = { T:v, done:false }; ctx.toast("Now calculate the solubility"); rdS.clear(); }, gS);
      Kit.answer(ctx, "Solubility at this temperature / g per 100 g water", "mass ÷ water × 100", v => {
        if(!pending) return [false, "Stop at the first crystals and read the thermometer first."];
        if(pending.done) return [false, "Already recorded — add more water for the next point."];
        const want = mass/V*100;
        if(Math.abs(v - want)/want > .01) return [false, `Solubility = mass of KNO₃ ÷ mass of water × 100 (1 cm³ of water has a mass of 1 g).`];
        pending.done = true;
        ctx.record({ run:`KNO₃ ${mass.toFixed(2)} g`, Vw:V, t:"", T:pending.T, S:Kit.round(want, 1), result:"first crystals" });
        ctx.complete("sol"); done5.add(V);
        if(ctx.rows().filter(r => typeof r.S === "number").length >= 5) ctx.complete("curve");
        sync();
        return [true, `${want.toFixed(1)} g per 100 g water ✓ recorded — plot solubility against T.`];
      }, gS);
      Kit.answer(ctx, `From your graph: solubility at ${Tq} °C / g per 100 g water`, "read off the curve", v => {
        const pts = ctx.rows().filter(r => typeof r.S === "number");
        if(pts.length < 4) return [false, "Plot at least four points first."];
        const Ts = pts.map(r => r.T);
        if(Tq < Math.min(...Ts) - 3 || Tq > Math.max(...Ts) + 3) return [false, "Your points do not cover this temperature — add more water to get lower temperatures."];
        const want = solAt(Tq);
        if(Math.abs(v - want)/want <= .1){ ctx.complete("readoff"); return [true, `Good — the accepted value is about ${want.toFixed(0)} g per 100 g water.`]; }
        return [false, "Draw a smooth curve through your points, go up from the temperature to the curve, then across to the solubility axis."];
      }, gS);
      ctx.html(`<div class="hint">Set the graph to “Curve of best fit” (x = T, y = solubility).</div>`, gS);

      /* cooling-curve controls */
      ctx.seg({ label:"Sample", value:0, parent:gC, options:[[0,"Sample P"],[1,"Sample Q"]], onChange(v){ CZ[cI].on = false; cI = v; sync(); } });
      ctx.seg({ label:"Readings", value:false, parent:gC, options:[[false,"I read the thermometer"],[true,"Auto every 30 s"]], onChange(v){ auto = v; const P = CZ[cI]; P.nextAuto = Math.ceil(P.t/30)*30; } });
      gC.appendChild(cActs);
      function recC(Tr, t, quiet){
        const fr = cF();
        ctx.record({ run:"Sample " + NM[cI], Vw:"", t:Math.round(t), T:Tr, S:"", result:fr >= 1 ? "liquid" : fr <= 0 ? "solid" : "freezing" }, quiet);
      }
      Kit.reading(ctx, "Thermometer reading / °C (to 0.5 °C)", "e.g. 71.5", () => CZ[cI].melted ? cT() : null, .5, v => recC(v, CZ[cI].t), gC);
      Kit.answer(ctx, "Freezing point of the pure sample / °C", "from the flat section", v => {
        const T = ctx.rows().filter(r => r.run === "Sample " + NM[pureI] && typeof r.T === "number").map(r => r.T);
        if(T.length < 6 || Math.min(...T) > 66) return [false, "Record a full cooling curve of the pure sample first (down below about 65 °C)."];
        if(Math.abs(v - 69.3) <= 1){ ctx.complete("fp"); return [true, "Yes — the flat section shows the freezing point, about 69 °C."]; }
        return [false, "Read the temperature of the flat (horizontal) section of the pure sample's curve."];
      }, gC);
      const impSeg = ctx.seg({ label:"Which sample is impure?", value:0, parent:gC, options:[[0,"P"],[1,"Q"]] });
      const ifb = ctx.html(`<div></div>`, gC);
      ctx.buttons([{ label:"Check", onClick(){
        const okBoth = [0, 1].every(i => { const T = ctx.rows().filter(r => r.run === "Sample " + NM[i] && typeof r.T === "number").map(r => r.T); return T.length >= 6 && Math.min(...T) <= 58; });
        if(!okBoth){ ifb.innerHTML = `<div class="note bad">Record cooling curves of both samples down to about 55 °C first.</div>`; return; }
        if(impSeg.get() !== pureI){ ifb.innerHTML = `<div class="note ok">Correct: sample ${NM[1 - pureI]} starts to freeze below 69 °C and freezes over a range (no flat section), so it is impure.</div>`; ctx.complete("impure"); }
        else ifb.innerHTML = `<div class="note bad">That sample has a flat section at one temperature — that is what a pure substance does.</div>`;
      } }], gC);
      sync(); draw(0);
    }
  });
})();

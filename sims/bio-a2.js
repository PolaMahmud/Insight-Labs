"use strict";
/* ══════════════════════════════════════════════════════════════════
   BIOLOGY · A LEVEL (9700 Paper 5) — planning, analysis & evaluation
   Chi-squared (corn cobs) · t-test (leaves / limpets) ·
   Ecological sampling: quadrats + Simpson's index, belt transect +
   Spearman / Pearson, mark–release–recapture + Lincoln index ·
   Gel electrophoresis · Glucose test strips & biosensors
══════════════════════════════════════════════════════════════════ */
(function(){
  /* ── shared helpers (kept inside this closure) ── */
  const rnd = (a, b) => a + Math.random()*(b - a);
  const rint = (a, b) => Math.floor(a + Math.random()*(b - a + 1));
  const gN = () => { let u = 0, v = 0; while(!u) u = Math.random(); while(!v) v = Math.random(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  function pois(l, R){ R = R || Math.random; if(l <= 0) return 0; if(l > 50) return Math.max(0, Math.round(l + Math.sqrt(l)*gN())); const L = Math.exp(-l); let k = 0, p = 1; do{ k++; p *= R(); } while(p > L); return k - 1; }
  function mulberry(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0)/4294967296; }; }
  const sd = a => { const m = Kit.mean(a); return Math.sqrt(a.reduce((s, v) => s + (v - m)*(v - m), 0)/(a.length - 1)); };
  function ranks(a){
    const idx = a.map((v, i) => [v, i]).sort((p, q) => q[0] - p[0]), r = new Array(a.length);
    for(let i = 0; i < idx.length;){ let j = i; while(j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++; const av = (i + j)/2 + 1; for(let k = i; k <= j; k++) r[idx[k][1]] = av; i = j + 1; }
    return r;
  }
  function spearman(x, y){ const rx = ranks(x), ry = ranks(y), n = x.length; const d2 = rx.reduce((s, v, i) => s + (v - ry[i])*(v - ry[i]), 0); return 1 - 6*d2/(n*(n*n - 1)); }
  function pearson(x, y){ const mx = Kit.mean(x), my = Kit.mean(y); let sxy = 0, sxx = 0, syy = 0; x.forEach((v, i) => { sxy += (v - mx)*(y[i] - my); sxx += (v - mx)*(v - mx); syy += (y[i] - my)*(y[i] - my); }); return sxy/Math.sqrt(sxx*syy); }
  const CHI = { 1:3.84, 2:5.99, 3:7.82, 4:9.49, 5:11.07 };
  const T05 = { 8:2.31, 9:2.26, 10:2.23, 11:2.20, 12:2.18, 13:2.16, 14:2.14, 15:2.13, 16:2.12, 17:2.11, 18:2.10, 19:2.09, 20:2.09, 21:2.08, 22:2.07 };
  const RS05 = { 5:1.00, 6:0.89, 7:0.79, 8:0.74, 9:0.70, 10:0.65 };          // Spearman, by number of pairs n
  const R05 = { 3:0.88, 4:0.81, 5:0.75, 6:0.71, 7:0.67, 8:0.63 };           // Pearson, by degrees of freedom n − 2
  /* a small critical-value table drawn in SVG */
  function critTable(x, y, title, rowA, rowB, keys, vals, cw){
    let s = `<text x="${x}" y="${y}" class="k-tag">${title}</text><text x="${x}" y="${y + 22}" class="k-lbl">${rowA}</text><text x="${x}" y="${y + 42}" class="k-lbl">${rowB}</text>`;
    keys.forEach((k, i) => { const xx = x + 70 + i*cw; s += `<text x="${xx}" y="${y + 22}" text-anchor="middle" class="k-num">${k}</text><text x="${xx}" y="${y + 42}" text-anchor="middle" class="k-numb">${vals[i]}</text>`; });
    return s + `<line x1="${x}" y1="${y + 28}" x2="${x + 70 + (keys.length - .5)*cw}" y2="${y + 28}" stroke="var(--brd2)"/>`;
  }
  const msgBox = (ctx, id) => ctx.html(`<div class="ctl" id="${id}"></div>`);
  const say = (node, ok, text) => { node.innerHTML = text ? `<div class="note ${ok ? "ok" : "bad"}">${text}</div>` : ""; };

/* ───────────── CHI-SQUARED: CORN COB GENETICS ───────────── */
Lab.register({
  id:"chisquared", subject:"biology", level:["a"], topic:"Inheritance · Chi-squared test", interactive:true,
  title:"Chi-squared test: corn cob genetics",
  summary:"Count the kernels on a corn cob from a monohybrid or dihybrid cross, work out the expected numbers, calculate χ² and compare it with the critical value to decide whether the results fit a 3 : 1 or 9 : 3 : 3 : 1 ratio.",
  aim:"Use the chi-squared test to find out whether the differences between the observed and expected results of a genetic cross are significant.",
  variables:{ iv:"Phenotype class of kernel", dv:"Observed number of kernels in each class", cv:["Every kernel on one face of the cob counted once","Expected ratio from the stated cross","Significance level p = 0.05"] },
  stageTitle:"Corn cob & tally", controlsTitle:"Count & test",
  thumb:`<svg viewBox="0 0 300 140"><ellipse cx="140" cy="70" rx="120" ry="50" fill="#D9C28A"/>${[...Array(40)].map((_, i) => { const c = i % 10, r = Math.floor(i/10); return `<rect x="${44 + c*20 + (r % 2)*10}" y="${36 + r*18}" width="16" height="15" rx="5" fill="${[0,3,7,12,18,22,27,33,38].includes(i) ? "#E8B93A" : "#6B2C91"}"/>`; }).join("")}<path d="M255 70l35-30M255 70l38 0M255 70l35 30" stroke="#9BB26A" stroke-width="7" stroke-linecap="round"/></svg>`,
  challenges:[
    { id:"count", title:"Count a cob", text:"Count every kernel on a cob yourself by clicking." },
    { id:"mono",  title:"Monohybrid test", text:"Calculate χ² for a 3 : 1 cross and reach the correct conclusion." },
    { id:"di",    title:"Dihybrid test", text:"Calculate χ² for a 9 : 3 : 3 : 1 cross and reach the correct conclusion." },
    { id:"sig",   title:"Not what was expected", text:"Find a cob where the difference from the expected ratio is significant." }
  ],
  columns:[{key:"cross",label:"Cross"},{key:"cob",label:"Cob"},{key:"obs",label:"Observed"},{key:"exp",label:"Expected"},{key:"chi",label:"χ²",dp:2},{key:"df",label:"v",dp:0},{key:"crit",label:"Critical value (p = 0.05)",dp:2},{key:"concl",label:"Conclusion"}],
  questions:[
    { q:"State a suitable null hypothesis for the dihybrid cross.",
      a:"There is no significant difference between the observed numbers and the numbers expected from a 9 : 3 : 3 : 1 ratio; any difference is due to chance." },
    { q:"Why is the χ² test used here and not the t-test?",
      a:"The data are counts in categories (discontinuous, qualitative phenotypes), and we are comparing observed with expected frequencies. The t-test compares the means of two samples of continuous data." },
    { q:"How do you find the degrees of freedom and use the table?",
      a:"v = number of classes − 1 (4 − 1 = 3 for a dihybrid cross; 2 − 1 = 1 for a monohybrid). Look up the critical value at p = 0.05 (7.82 for v = 3). If χ² is greater than the critical value, the probability that the difference is due to chance is less than 0.05, so it is significant and the null hypothesis is rejected." },
    { q:"A dihybrid cob gives χ² = 24. Suggest a biological explanation.",
      a:"The two genes may be linked (on the same chromosome), so parental combinations are more common and recombinants less common than 9 : 3 : 3 : 1 predicts. Other possibilities: epistasis, or one genotype having lower survival (e.g. reduced viability of wrinkled kernels)." },
    { q:"Why should you count the whole cob rather than a small part of it?",
      a:"χ² depends on sample size: small samples give small differences that may hide real deviations, and expected values below about 5 make the test unreliable. A larger count gives a more reliable test. Count each kernel once only — mark them as you go." },
    { q:"Suggest a limitation of using corn cobs bought for practical work.",
      a:"You don’t know how the cross was carried out or whether the parents were truly pure-breeding; some kernels may be damaged or hard to classify (pale purple, partly wrinkled); and only one face of the cob is visible, so it is a sample." }
  ],
  setup(ctx){
    const CATS = {
      di:[{ name:"Purple smooth", r:9, col:"#6B2C91", w:false }, { name:"Purple wrinkled", r:3, col:"#6B2C91", w:true }, { name:"Yellow smooth", r:3, col:"#E8B93A", w:false }, { name:"Yellow wrinkled", r:1, col:"#E8B93A", w:true }],
      mono:[{ name:"Purple", r:3, col:"#6B2C91", w:false }, { name:"Yellow", r:1, col:"#E8B93A", w:false }]
    };
    const SKEW = { di:[.60, .15, .15, .10], mono:[.68, .32] };
    const POS = [];
    for(let r = 0; r < 11; r++) for(let c = 0; c < 20; c++){
      const x = 52 + c*24 + (r % 2)*12, y = 100 + r*25, dx = (x - 290)/250, dy = (y - 225)/150;
      if(Math.pow(Math.abs(dx), 2.4) + dy*dy <= 1) POS.push({ x, y });
    }
    let cross = "di", cob = null, cobNo = 0, chiOK = false, dfOK = false, decided = false, hand = 0;
    const cats = () => CATS[cross], ratioSum = () => cats().reduce((s, c) => s + c.r, 0);
    const obs = () => cats().map((_, i) => cob.k.filter(k => k.n && k.c === i).length);
    const allDone = () => cob.k.every(k => k.n);
    const expd = () => cats().map(c => cob.k.length*c.r/ratioSum());
    const chi = () => { const o = obs(), e = expd(); return o.reduce((s, v, i) => s + (v - e[i])*(v - e[i])/e[i], 0); };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="cq-svg"><defs>${Kit.DEFS}</defs>
      <ellipse cx="290" cy="225" rx="262" ry="160" fill="#D9C28A" stroke="#B99A55" stroke-width="2"/>
      <path d="M545 225c12-25 22-40 34-52M545 225h36M545 225c12 25 22 40 34 52" stroke="#9BB26A" stroke-width="10" stroke-linecap="round" fill="none"/>
      <g id="cq-k"></g><g id="cq-panel"></g><text x="24" y="34" class="k-status" id="cq-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#cq-svg"), $ = s => svg.querySelector(s);
    function kernel(c, x, y, small){
      const s = small ? .7 : 1, w = (c.w ? 19 : 21)*s, h = (c.w ? 19 : 22)*s, dk = c.col === "#6B2C91" ? "#3D1258" : "#A57C14";
      let g = `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="${7*s}" fill="${c.col}" stroke="${dk}" stroke-width="1"/>`;
      g += c.w ? `<path d="M${x - 6*s} ${y - 3*s}q${3*s} ${-3*s} ${6*s} 0t${6*s} 0M${x - 6*s} ${y + 3*s}q${3*s} ${3*s} ${6*s} 0t${6*s} 0" fill="none" stroke="${dk}" stroke-width="1.4"/>`
        : `<ellipse cx="${x - 3*s}" cy="${y - 4*s}" rx="${4.5*s}" ry="${3*s}" fill="#fff" opacity=".4"/>`;
      return g;
    }
    function newCob(){
      cobNo++; const p = Math.random() < .6 ? cats().map(c => c.r/ratioSum()) : SKEW[cross];
      cob = { no:cobNo, k:POS.map(() => { let u = Math.random(), i = 0; while(i < p.length - 1 && u > p[i]){ u -= p[i]; i++; } return { c:i, n:false }; }) };
      chiOK = dfOK = decided = false; hand = 0; aChi.clear(); aDf.clear(); say(msg, true, "");
      draw();
    }
    function draw(){
      const cs = cats();
      $("#cq-k").innerHTML = cob.k.map((K, i) => `<g data-k="${i}" style="cursor:pointer">${kernel(cs[K.c], POS[i].x, POS[i].y)}${K.n ? `<circle cx="${POS[i].x + 6}" cy="${POS[i].y + 6}" r="3.6" fill="#fff" stroke="#111" stroke-width="1.4"/>` : ""}</g>`).join("");
      const o = obs(), e = expd(), done = allDone(), counted = o.reduce((s, v) => s + v, 0);
      let s = `<rect x="590" y="50" width="356" height="${cs.length*30 + 150}" rx="10" fill="var(--bg-card)" stroke="var(--brd2)"/>
        <text x="604" y="74" class="k-tag">Phenotype</text><text x="780" y="74" text-anchor="end" class="k-tag">O</text><text x="856" y="74" text-anchor="end" class="k-tag">E</text><text x="936" y="74" text-anchor="end" class="k-tag">(O − E)²/E</text>`;
      cs.forEach((c, i) => { const y = 102 + i*30;
        s += `${kernel(c, 612, y - 4, true)}<text x="628" y="${y}" class="k-lbl">${c.name}</text><text x="780" y="${y}" text-anchor="end" class="k-numb">${o[i]}</text>
          <text x="856" y="${y}" text-anchor="end" class="k-numb">${chiOK ? e[i].toFixed(1) : "?"}</text><text x="936" y="${y}" text-anchor="end" class="k-numb">${chiOK ? ((o[i] - e[i])*(o[i] - e[i])/e[i]).toFixed(2) : "?"}</text>`; });
      const yT = 102 + cs.length*30;
      s += `<line x1="604" y1="${yT - 16}" x2="936" y2="${yT - 16}" stroke="var(--brd2)"/><text x="628" y="${yT}" class="k-tag">Total</text><text x="780" y="${yT}" text-anchor="end" class="k-numb">${counted}</text>
        <text x="604" y="${yT + 30}" class="k-lbl">Expected ratio ${cs.map(c => c.r).join(" : ")}</text>
        <text x="936" y="${yT + 30}" text-anchor="end" class="k-read">χ² = ${chiOK ? chi().toFixed(2) : "?"}</text>
        <text x="604" y="${yT + 54}" class="k-lbl">${done ? "All " + cob.k.length + " kernels counted" : counted + " of the kernels counted so far"}</text>`;
      s += critTable(604, 400, "Critical values of χ² at p = 0.05", "v", "χ²", [1, 2, 3, 4, 5], [1, 2, 3, 4, 5].map(k => CHI[k].toFixed(2)), 54);
      $("#cq-panel").innerHTML = s;
      $("#cq-status").textContent = done ? (decided ? "Concluded — start a new cob" : "Cob counted — now calculate χ²") : "Click each kernel to count it (white dot = counted)";
      ctx.readout([["Cross", cross === "di" ? "dihybrid (Pp Ss × Pp Ss)" : "monohybrid (Pp × Pp)"], ["Cob", "No. " + cob.no], ["Counted", counted + (done ? " (all)" : "")]]);
    }
    svg.addEventListener("pointerdown", e => {
      const g = e.target.closest("[data-k]"); if(!g) return;
      const K = cob.k[+g.dataset.k]; if(K.n) return ctx.toast("Already counted");
      K.n = true; hand++;
      if(allDone()){ if(hand === cob.k.length) ctx.complete("count"); ctx.toast("Whole cob counted"); }
      draw();
    });
    ctx.seg({ label:"Cross", value:"di", options:[["di","Dihybrid (9 : 3 : 3 : 1)"],["mono","Monohybrid (3 : 1)"]], hint:"Dihybrid: purple/yellow and smooth/wrinkled. Monohybrid: purple/yellow only.", onChange(v){ cross = v; newCob(); } });
    ctx.buttons([{ label:"New cob", primary:true, onClick: newCob }, { label:"Count the rest for me", onClick(){
      if(allDone()) return ctx.toast("Already counted");
      if(hand < 30) return ctx.toast("Count at least 30 kernels yourself first");
      cob.k.forEach(k => k.n = true); draw(); ctx.toast("Rest of the cob counted by your partner");
    } }]);
    const aChi = Kit.answer(ctx, "χ² = Σ (O − E)² ÷ E", "e.g. 2.41", v => {
      if(!allDone()) return [false, "Count every kernel first."];
      const c = chi();
      if(Math.abs(v - c) <= Math.max(.05, c*.03)){ chiOK = true; draw(); return [true, `Correct: χ² = ${c.toFixed(2)}. The expected values are now shown on the tally.`]; }
      return [false, `First find each expected number: E = total × (ratio share ÷ ${ratioSum()}). Then add up (O − E)² ÷ E for every class.`];
    });
    const aDf = Kit.answer(ctx, "Degrees of freedom, v = c − 1", "e.g. 1", v => {
      const df = cats().length - 1;
      if(v === df){ dfOK = true; return [true, `Correct: ${cats().length} classes, so v = ${df}. Critical value at p = 0.05 is ${CHI[df]}.`]; }
      return [false, "c is the number of phenotype classes."];
    });
    ctx.buttons([{ label:"Not significant — accept H₀", onClick(){ decide(false); } }, { label:"Significant — reject H₀", onClick(){ decide(true); } }]);
    const msg = msgBox(ctx, "cq-msg");
    function decide(sig){
      if(!chiOK || !dfOK) return ctx.toast("Calculate χ² and the degrees of freedom first");
      if(decided) return ctx.toast("Already concluded — start a new cob");
      const c = chi(), df = cats().length - 1, crit = CHI[df], isSig = c > crit;
      if(sig !== isSig){ say(msg, false, `Compare χ² (${c.toFixed(2)}) with the critical value for v = ${df} at p = 0.05.`); return; }
      decided = true;
      ctx.record({ cross: cross === "di" ? "Dihybrid 9:3:3:1" : "Monohybrid 3:1", cob:"Cob " + cob.no, obs:obs().join(" : "), exp:expd().map(v => v.toFixed(1)).join(" : "), chi:c, df, crit, concl: isSig ? "Significant — reject H₀" : "Not significant — accept H₀" });
      ctx.complete(cross); if(isSig) ctx.complete("sig");
      say(msg, true, isSig ? `χ² = ${c.toFixed(2)} > ${crit}, so p < 0.05. The difference is significant: the results do not fit a ${cats().map(c => c.r).join(" : ")} ratio. Suggest why (e.g. linkage, lethal or less viable genotypes).`
        : `χ² = ${c.toFixed(2)} < ${crit}, so p > 0.05. The difference is not significant and is likely to be due to chance: the results fit a ${cats().map(c => c.r).join(" : ")} ratio.`);
      draw();
    }
    newCob();
  }
});

/* ───────────── t-TEST: COMPARING TWO MEANS ───────────── */
Lab.register({
  id:"ttest", subject:"biology", level:["a"], topic:"Variation · t-test", interactive:true,
  title:"t-test: sun and shade leaves",
  summary:"Measure ten ivy leaves from the sun and ten from the shade (or limpet shells from the upper and lower shore) with a ruler, then calculate the means, standard deviations and t to decide whether the difference is significant.",
  aim:"Use the t-test to find out whether there is a significant difference between the means of two samples.",
  variables:{ iv:"Where the specimens grew (sun or shade; upper or lower shore)", dv:"Length of leaf lamina / limpet shell (mm)", cv:["Same species, same plant or shore","Specimens chosen at random","Same measurement (lamina only, not the petiole; longest length of shell)"] },
  stageTitle:"Specimen & ruler", controlsTitle:"Measure & analyse",
  thumb:`<svg viewBox="0 0 300 140"><path d="M40 60C70 25 150 30 180 60C150 90 70 95 40 60Z" fill="#7FBF5A" stroke="#3F7A2E" stroke-width="2"/><path d="M20 60H180" stroke="#3F7A2E" stroke-width="2"/><path d="M150 60C170 30 250 30 280 60C250 90 170 92 150 60Z" fill="#2F6B3A" stroke="#1F4A27" stroke-width="2" opacity=".9"/><rect x="20" y="108" width="260" height="22" fill="#F2E6C2" stroke="#B8962E"/>${[...Array(27)].map((_, i) => `<line x1="${24 + i*10}" y1="108" x2="${24 + i*10}" y2="${i % 5 ? 114 : 118}" stroke="#4B3621"/>`).join("")}</svg>`,
  challenges:[
    { id:"measure", title:"Measure", text:"Measure at least five specimens from each sample yourself." },
    { id:"stats",   title:"Mean & standard deviation", text:"Calculate the mean and the standard deviation of one sample correctly." },
    { id:"tval",    title:"Calculate t", text:"Calculate t for the two samples." },
    { id:"concl",   title:"Conclude", text:"Use v and the critical value to reach the correct conclusion." }
  ],
  columns:[{key:"set",label:"Specimens"},{key:"sample",label:"Sample"},{key:"n",label:"Specimen",dp:0},{key:"L",label:"Length / mm",dp:0},{key:"note",label:"Analysis"}],
  questions:[
    { q:"State a null hypothesis for the ivy investigation.",
      a:"There is no significant difference between the mean lamina length of ivy leaves growing in the sun and in the shade." },
    { q:"Why is the t-test suitable for these data?",
      a:"The data are continuous measurements, from two independent samples, assumed to be normally distributed with similar variances, and we want to compare the two means. Each sample should have fewer than about 30 values (for larger samples another test is usually used)." },
    { q:"Explain how the critical value is used.",
      a:"Calculate v = n₁ + n₂ − 2 (18 here) and look up t at p = 0.05 (2.10). If the calculated t is greater than this, there is less than a 5% probability that the difference in means is due to chance, so the difference is significant and the null hypothesis is rejected." },
    { q:"Suggest how you would choose the leaves to avoid bias.",
      a:"Use random sampling, e.g. random numbers to choose which shoot and which leaf (say the 5th leaf from the tip) to collect, rather than picking leaves that look typical. Take leaves of the same age from the same plant or plants of the same species." },
    { q:"What does the standard deviation tell you?",
      a:"How spread out the values are around the mean. A large standard deviation means the specimens vary a lot, so a larger difference between the means is needed before it is significant. It is used in the t-test and to draw error bars (± 1 s.d. or 95% confidence intervals)." },
    { q:"Suggest two limitations of the limpet investigation and how to reduce them.",
      a:"Limpets of different ages are mixed, so size reflects age as well as position — record and compare similar-aged animals or increase the sample size. Only one shore and one day are sampled — repeat on other shores. Measuring a curved shell with a ruler is imprecise — use calipers to the nearest 0.1 mm. Don’t remove limpets from the rock; measure in place." }
  ],
  setup(ctx){
    const PX = 4, X0 = 110, YC = 170;
    const SETS = {
      ivy:{ name:"Ivy leaves", A:"Sun", B:"Shade", sA:6, sB:8 },
      limpet:{ name:"Limpet shells", A:"Upper shore", B:"Lower shore", sA:4.5, sB:4.5 }
    };
    let set = "ivy", D = null, samp = "A", rx = 60, ry = 300, statSamp = "A", tOK = false, decided = false;
    function initSet(){
      const S = SETS[set], mA = set === "ivy" ? rnd(46, 54) : rnd(31, 37), mB = set === "ivy" ? mA + rnd(7, 14) : mA + rnd(-3, 3);
      const gen = (m, s) => [...Array(10)].map(() => Kit.round(Kit.clamp(m + s*gN(), m - 2.4*s, m + 2.4*s), 1));
      D = { A:{ tr:gen(mA, S.sA), rd:[], hand:0 }, B:{ tr:gen(mB, S.sB), rd:[], hand:0 } };
      tOK = decided = false; [rdL, aM, aS, aT, aV].forEach(b => b && b.clear()); say(msg, true, "");
    }
    const cur = () => D[samp].rd.length < 10 ? D[samp].tr[D[samp].rd.length] : null;
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 480" class="kb" id="tt-svg"><defs>${Kit.DEFS}</defs>
      <rect x="20" y="56" width="620" height="230" rx="10" fill="#F4F1E8" stroke="var(--brd2)"/><g id="tt-spec"></g><g id="tt-panel"></g>
      <g id="tt-ruler" class="k-drag"></g><text x="24" y="34" class="k-status" id="tt-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#tt-svg"), $ = s => svg.querySelector(s);
    function draw(){
      const S = SETS[set], L = cur();
      let s = `<text x="36" y="80" style="font:600 12px Inter;fill:#475569">${S.name} · ${samp === "A" ? S.A : S.B} · specimen ${Math.min(10, D[samp].rd.length + 1)} of 10</text>`;
      if(L === null) s += `<text x="330" y="180" text-anchor="middle" style="font:600 14px Inter;fill:#475569">All ten specimens in this sample are measured</text>`;
      else if(set === "ivy"){
        const l = L*PX, w = l*.48, col = samp === "A" ? "#7FBF5A" : "#2F7A3E", dk = samp === "A" ? "#3F7A2E" : "#1F4A27";
        s += `<path d="M${X0 - 60} ${YC + 4}L${X0} ${YC}" stroke="${dk}" stroke-width="4" stroke-linecap="round"/>
          <path d="M${X0} ${YC}C${X0 + l*.15} ${YC - w*.8} ${X0 + l*.7} ${YC - w*.62} ${X0 + l} ${YC}C${X0 + l*.7} ${YC + w*.62} ${X0 + l*.15} ${YC + w*.8} ${X0} ${YC}Z" fill="${col}" stroke="${dk}" stroke-width="2"/>
          <path d="M${X0} ${YC}L${X0 + l} ${YC}" stroke="${dk}" stroke-width="1.6"/>${[.25, .45, .65].map(f => `<path d="M${X0 + l*f} ${YC}l${l*.12} ${-w*.3}M${X0 + l*f} ${YC}l${l*.12} ${w*.3}" stroke="${dk}" stroke-width="1"/>`).join("")}
          <text x="${X0 - 60}" y="${YC + 24}" style="font:500 10px Inter;fill:#64748B">petiole</text>`;
      }else{
        const l = L*PX, cx = X0 + l/2;
        s += `<ellipse cx="${cx}" cy="${YC}" rx="${l/2}" ry="${l*.4}" fill="#B9A88A" stroke="#6B5B43" stroke-width="2"/>${[...Array(16)].map((_, k) => { const a = k/16*2*Math.PI; return `<line x1="${cx - l*.06}" y1="${YC - l*.03}" x2="${cx + Math.cos(a)*l/2}" y2="${YC + Math.sin(a)*l*.4}" stroke="#8C7A5C" stroke-width="1.2"/>`; }).join("")}
          <circle cx="${cx - l*.06}" cy="${YC - l*.03}" r="${l*.05}" fill="#8C7A5C"/>`;
      }
      s += `<text x="36" y="274" style="font:500 11px Inter;fill:#64748B">${set === "ivy" ? "Measure the lamina (blade) from its base to the tip — not the petiole" : "Measure the longest length of the shell"}</text>`;
      $("#tt-spec").innerHTML = s;
      const S2 = SETS[set], list = k => D[k].rd.length ? D[k].rd.map(v => Math.round(v)).join("  ") : "—";
      let p = `<text x="660" y="74" class="k-tag">A: ${S2.A} (n = ${D.A.rd.length})</text><text x="660" y="94" class="k-num">${list("A").slice(0, 40)}</text>
        <text x="660" y="130" class="k-tag">B: ${S2.B} (n = ${D.B.rd.length})</text><text x="660" y="150" class="k-num">${list("B").slice(0, 40)}</text>
        <text x="660" y="192" class="k-lbl">t = |x̄₁ − x̄₂| ÷ √(s₁²/n₁ + s₂²/n₂)</text>
        <text x="660" y="212" class="k-lbl">s = √(Σ(x − x̄)² ÷ (n − 1))</text>
        <text x="660" y="232" class="k-lbl">v = n₁ + n₂ − 2</text>`;
      p += critTable(660, 268, "Critical values of t at p = 0.05", "v", "t", [16, 17, 18, 19, 20], [16, 17, 18, 19, 20].map(k => T05[k].toFixed(2)), 44);
      $("#tt-panel").innerHTML = p;
      let r = `<rect x="${rx}" y="${ry}" width="${150*PX + 20}" height="44" rx="4" fill="#F2E6C2" stroke="#B8962E" opacity=".93"/>`;
      for(let mm = 0; mm <= 150; mm++){ const x = rx + 10 + mm*PX, h = mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 6; r += `<line x1="${x}" y1="${ry}" x2="${x}" y2="${ry + h}" stroke="#4B3621" stroke-width=".9"/>`; if(mm % 10 === 0) r += `<text x="${x}" y="${ry + 30}" text-anchor="middle" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
      r += `<text x="${rx + 150*PX + 8}" y="${ry + 41}" text-anchor="end" style="font:500 9px Inter;fill:#4B3621">mm · drag me</text>`;
      $("#tt-ruler").innerHTML = r;
      $("#tt-status").textContent = L === null ? (D.A.rd.length + D.B.rd.length >= 20 ? "Both samples measured — calculate the statistics" : "Switch to the other sample") : "Drag the ruler to the specimen and read its length to the nearest mm";
      ctx.readout([["Sample A", D.A.rd.length + "/10"], ["Sample B", D.B.rd.length + "/10"], ["Ruler", "1 mm divisions"]]);
    }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ return tg.closest("#tt-ruler") ? { x:rx, y:ry, p0:p } : null; },
      move(h, p){ rx = Kit.clamp(h.x + p.x - h.p0.x, -500, 900); ry = Kit.clamp(h.y + p.y - h.p0.y, 50, 430); draw(); }
    });
    ctx.seg({ label:"Specimens", value:"ivy", options:[["ivy","Ivy: sun vs shade"],["limpet","Limpets: upper vs lower shore"]], onChange(v){ set = v; initSet(); draw(); } });
    ctx.seg({ label:"Sample being measured", value:"A", options:[["A","Sample A"],["B","Sample B"]], hint:"A = sun leaves / upper shore. B = shade leaves / lower shore.", onChange(v){ samp = v; rdL.clear(); draw(); } });
    var rdL = Kit.reading(ctx, "Length / mm", "e.g. 52", cur, 1, v => {
      const S = SETS[set], d = D[samp]; d.rd.push(Math.round(v)); d.hand++;
      ctx.record({ set:S.name, sample: samp === "A" ? S.A : S.B, n:d.rd.length, L:Math.round(v) }, true);
      if(D.A.hand >= 5 && D.B.hand >= 5) ctx.complete("measure");
      rdL.clear(); ctx.toast(d.rd.length === 10 ? "Sample complete" : "Recorded — next specimen"); draw();
    });
    ctx.buttons([{ label:"Fill in the rest from class data", onClick(){
      if(D.A.hand < 3 || D.B.hand < 3) return ctx.toast("Measure at least three from each sample yourself first");
      const S = SETS[set];
      ["A", "B"].forEach(k => { const d = D[k]; while(d.rd.length < 10){ d.rd.push(Math.round(d.tr[d.rd.length])); ctx.record({ set:S.name, sample: k === "A" ? S.A : S.B, n:d.rd.length, L:d.rd[d.rd.length - 1] }, true); } });
      ctx.toast("Class data added"); draw();
    } }]);
    const full = k => D[k].rd.length === 10;
    ctx.seg({ label:"Mean and s.d. of", value:"A", options:[["A","Sample A"],["B","Sample B"]], onChange(v){ statSamp = v; aM.clear(); aS.clear(); } });
    var aM = Kit.answer(ctx, "Mean, x̄ / mm", "e.g. 51.3", v => {
      if(!full(statSamp)) return [false, "Measure all ten specimens in this sample first."];
      const m = Kit.mean(D[statSamp].rd); if(Math.abs(v - m) <= .06){ D[statSamp].mOK = true; check(); return [true, `Correct: x̄ = ${m.toFixed(2)} mm.`]; }
      return [false, "Add the ten lengths and divide by 10."];
    });
    var aS = Kit.answer(ctx, "Standard deviation, s / mm", "e.g. 6.2", v => {
      if(!full(statSamp)) return [false, "Measure all ten specimens in this sample first."];
      const a = D[statSamp].rd, s = sd(a), sp = s*Math.sqrt(9/10);
      if(Math.abs(v - s) <= Math.max(.05, s*.02)){ D[statSamp].sOK = true; check(); return [true, `Correct: s = ${s.toFixed(2)} mm.`]; }
      return [false, Math.abs(v - sp) <= Math.max(.05, sp*.02) ? "Close — divide by n − 1 (9), not n." : "s = √(Σ(x − x̄)² ÷ (n − 1)). Find each deviation from the mean, square, add, divide by 9, then square root."];
    });
    function check(){ if((D.A.mOK && D.A.sOK) || (D.B.mOK && D.B.sOK)) ctx.complete("stats"); }
    const tval = () => { const a = D.A.rd, b = D.B.rd; return Math.abs(Kit.mean(a) - Kit.mean(b))/Math.sqrt(sd(a)*sd(a)/a.length + sd(b)*sd(b)/b.length); };
    var aT = Kit.answer(ctx, "Calculated value of t", "e.g. 3.15", v => {
      if(!full("A") || !full("B")) return [false, "Measure all ten specimens in both samples first."];
      const t = tval(); if(Math.abs(v - t) <= Math.max(.03, t*.03)){ tOK = true; ctx.complete("tval"); return [true, `Correct: t = ${t.toFixed(2)}.`]; }
      return [false, "Use the means and standard deviations of both samples in t = |x̄₁ − x̄₂| ÷ √(s₁²/n₁ + s₂²/n₂)."];
    });
    var aV = Kit.answer(ctx, "Degrees of freedom, v", "e.g. 18", v => v === 18 ? [true, "Correct: v = 10 + 10 − 2 = 18. Critical t at p = 0.05 is 2.10."] : [false, "v = n₁ + n₂ − 2."]);
    ctx.buttons([{ label:"Significant difference", onClick(){ decide(true); } }, { label:"No significant difference", onClick(){ decide(false); } }]);
    var msg = msgBox(ctx, "tt-msg");
    function decide(sig){
      if(!tOK) return ctx.toast("Calculate t first");
      if(decided) return ctx.toast("Already concluded — choose a set of specimens to start again");
      const t = tval(), isSig = t > T05[18];
      if(sig !== isSig) return say(msg, false, `Compare t = ${t.toFixed(2)} with the critical value for v = 18 at p = 0.05.`);
      decided = true; ctx.complete("concl");
      const S = SETS[set];
      ctx.record({ set:S.name, sample:"t-test", n:null, L:null, note:`t = ${t.toFixed(2)}, v = 18, critical 2.10: ${isSig ? "significant" : "not significant"}` });
      say(msg, true, isSig ? `t = ${t.toFixed(2)} > 2.10, so p < 0.05: reject the null hypothesis. The difference between the means is significant (${S.A.toLowerCase()} ${Kit.mean(D.A.rd).toFixed(1)} mm, ${S.B.toLowerCase()} ${Kit.mean(D.B.rd).toFixed(1)} mm).`
        : `t = ${t.toFixed(2)} < 2.10, so p > 0.05: accept the null hypothesis. The difference between the means is not significant and could be due to chance.`);
    }
    initSet(); draw();
  }
});

/* ───────────── ECOLOGICAL SAMPLING ───────────── */
Lab.register({
  id:"sampling", subject:"biology", level:["a"], topic:"Ecology · Sampling & statistics", interactive:true,
  title:"Sampling: quadrats, transects & mark–release–recapture",
  summary:"Place frame quadrats at random coordinates to compare the diversity of two sites with Simpson’s index, run a belt transect away from a tree and test for correlation between light and daisies, and estimate a woodlouse population with the Lincoln index.",
  aim:"Use random sampling, a belt transect and mark–release–recapture to estimate abundance and diversity, and use Simpson’s index of diversity and correlation coefficients to analyse the results.",
  variables:{ iv:"Site; distance from the tree (light intensity)", dv:"Number of each species per quadrat; number of daisies; population estimate", cv:["Same quadrat size (1 m × 1 m)","Random coordinates for random sampling","Same day and time; same counting rule"] },
  stageTitle:"Field site", controlsTitle:"Sampling method",
  thumb:`<svg viewBox="0 0 300 140"><rect x="10" y="10" width="120" height="120" fill="#8DBA5C"/>${[...Array(5)].map((_, i) => `<line x1="${10 + i*24}" y1="10" x2="${10 + i*24}" y2="130" stroke="#fff" opacity=".4"/>`).join("")}<rect x="58" y="58" width="24" height="24" fill="none" stroke="#fff" stroke-width="3"/><circle cx="160" cy="40" r="26" fill="#2F6B3A"/><rect x="155" y="40" width="10" height="90" fill="#6B4A2B"/>${[...Array(5)].map((_, i) => `<rect x="${175 + i*24}" y="100" width="24" height="24" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="3 2"/>`).join("")}${[[185,108],[210,115],[236,105],[250,118],[262,108],[278,114],[284,104]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("")}</svg>`,
  challenges:[
    { id:"quadrats", title:"Random quadrats", text:"Count five quadrats placed at random coordinates at one site." },
    { id:"simpson",  title:"Simpson’s index", text:"Calculate Simpson’s index of diversity, D, for both sites." },
    { id:"corr",     title:"Correlation", text:"Record at least seven transect stations, calculate a correlation coefficient and conclude correctly." },
    { id:"lincoln",  title:"Lincoln index", text:"Estimate a woodlouse population by mark–release–recapture." }
  ],
  columns:[{key:"mode",label:"Method"},{key:"where",label:"Where"},{key:"data",label:"Data"},{key:"x",label:"Light intensity / lux",dp:0},{key:"y",label:"Number counted / estimate",dp:0}],
  graph:{ x:["x"], y:["y"], fit:"none" },
  questions:[
    { q:"Why are quadrats placed at random coordinates rather than where the student chooses?",
      a:"To avoid bias: people tend to place quadrats where there is something interesting (or avoid muddy, trampled patches). Random coordinates from a random number generator, along two tapes laid at right angles, give every part of the site an equal chance of being sampled, so the sample is representative." },
    { q:"Calculate Simpson’s index for 10 daisies, 6 clover and 4 plantain. What does it mean?",
      a:"N = 20. Σ(n/N)² = 0.5² + 0.3² + 0.2² = 0.25 + 0.09 + 0.04 = 0.38. D = 1 − 0.38 = 0.62. D ranges from 0 (no diversity) to almost 1 (high diversity); a higher D means more species and/or the individuals are spread more evenly among the species." },
    { q:"Why is a belt transect used rather than random quadrats near the tree?",
      a:"The abiotic factor (light) changes gradually with distance from the trunk. A transect samples systematically along the gradient, so changes in distribution can be related to the abiotic factor. Random sampling would miss the pattern." },
    { q:"When should Spearman’s rank be used instead of Pearson’s correlation coefficient?",
      a:"Pearson’s needs both variables to be continuous, interval data that are normally distributed with an approximately linear relationship (check with a scatter graph). Spearman’s rank works with ranked data, any monotonic relationship and data that are not normally distributed — e.g. counts or abundance scales. Both need at least 5–10 pairs." },
    { q:"A significant correlation is found between light and daisies. Does light cause the change?",
      a:"Not necessarily — correlation does not prove causation. Other factors also change with distance from the tree (soil moisture, leaf litter, competition from tree roots, trampling). An experiment controlling other variables would be needed to test cause." },
    { q:"State the assumptions of the Lincoln index and explain how a large bright mark affects the estimate.",
      a:"Marked individuals mix fully with the population, marking does not affect survival or behaviour, no births, deaths, immigration or emigration between samples, and marks are not lost. A bright mark makes marked woodlice easier for predators to see, so fewer marked animals are recaptured; m₂ is too small and N = n₁n₂/m₂ is an overestimate. Recapturing after only 1 hour gives too little mixing, m₂ is too large and N is underestimated." }
  ],
  setup(ctx){
    const SEED = rint(1, 1e9);
    const SP = [{ k:"Da", name:"Daisy" }, { k:"Cl", name:"Clover" }, { k:"Pl", name:"Plantain" }, { k:"Dn", name:"Dandelion" }, { k:"Bu", name:"Buttercup" }];
    const DENS = { A:[9, 3, 1.2, .6, .4], B:[3, 3.5, 2.5, 2, 3] };
    const SITE = { A:"Site A (mown lawn)", B:"Site B (meadow)" };
    let mode = "quad";
    function glyph(sp, x, y, rot, counted){
      let g = "";
      if(sp === 0) g = [...Array(8)].map((_, k) => `<ellipse cx="${x + 6*Math.cos(k*.785)}" cy="${y + 6*Math.sin(k*.785)}" rx="4.2" ry="2" transform="rotate(${k*45} ${x + 6*Math.cos(k*.785)} ${y + 6*Math.sin(k*.785)})" fill="#fff" stroke="#9CA3AF" stroke-width=".5"/>`).join("") + `<circle cx="${x}" cy="${y}" r="3.4" fill="#F2B705"/>`;
      if(sp === 1) g = [0, 120, 240].map(a => `<circle cx="${x + 5*Math.cos((a + rot)*Math.PI/180)}" cy="${y + 5*Math.sin((a + rot)*Math.PI/180)}" r="5.2" fill="#4E9A3F" stroke="#2E6B24" stroke-width=".8"/>`).join("") + `<circle cx="${x}" cy="${y}" r="1.6" fill="#D7F0C8"/>`;
      if(sp === 2) g = [0, 72, 144, 216, 288].map(a => `<ellipse cx="${x + 8*Math.cos((a + rot)*Math.PI/180)}" cy="${y + 8*Math.sin((a + rot)*Math.PI/180)}" rx="9" ry="3.6" transform="rotate(${a + rot} ${x + 8*Math.cos((a + rot)*Math.PI/180)} ${y + 8*Math.sin((a + rot)*Math.PI/180)})" fill="#2F6B3A" stroke="#1C4425" stroke-width=".6"/>`).join("");
      if(sp === 3) g = [...Array(14)].map((_, k) => { const a = k/14*2*Math.PI; return `<line x1="${x}" y1="${y}" x2="${x + 10*Math.cos(a)}" y2="${y + 10*Math.sin(a)}" stroke="#F5B800" stroke-width="2.6" stroke-linecap="round"/>`; }).join("") + `<circle cx="${x}" cy="${y}" r="3.5" fill="#E08A00"/>`;
      if(sp === 4) g = [...Array(5)].map((_, k) => { const a = k/5*2*Math.PI + rot/57; return `<circle cx="${x + 4.4*Math.cos(a)}" cy="${y + 4.4*Math.sin(a)}" r="3.8" fill="#FFE000" stroke="#C99A00" stroke-width=".8"/>`; }).join("") + `<circle cx="${x}" cy="${y}" r="1.8" fill="#6B8E23"/>`;
      return `<g opacity="${counted ? .45 : 1}">${g}</g>` + (counted ? `<circle cx="${x + 8}" cy="${y - 8}" r="4.5" fill="#111" stroke="#fff" stroke-width="1.2"/>` : "");
    }
    function scatter(n, R, minD){
      const pts = [];
      for(let tries = 0; pts.length < n && tries < 4000; tries++){ const x = .06 + R()*.88, y = .06 + R()*.88; if(pts.some(p => Math.hypot(p.x - x, p.y - y) < (tries > 2000 ? minD/2 : minD))) continue; pts.push({ x, y, rot:R()*360 }); }
      return pts;
    }
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="sa-svg"><defs>${Kit.DEFS}
      <linearGradient id="sa-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset=".45" stop-color="#000" stop-opacity=".15"/><stop offset=".7" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
      <g id="sa-q"></g><g id="sa-t"></g><g id="sa-m"></g><text x="24" y="32" class="k-status" id="sa-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#sa-svg"), $ = s => svg.querySelector(s);
    const status = t => $("#sa-status").textContent = t;

    /* ===== random quadrats ===== */
    const Q = { site:"A", target:null, qx:0, qy:0, placed:false, plants:[], n:{ A:0, B:0 }, hand:{ A:0, B:0 }, tot:{ A:[0, 0, 0, 0, 0], B:[0, 0, 0, 0, 0] }, used:new Set(), dOK:new Set() };
    const MX = 40, MY = 70, S = 40, ZX = 490, ZY = 70, ZS = 360;
    const tex = {}; ["A", "B"].forEach(k => { const R = mulberry(SEED + (k === "A" ? 7 : 13)); let s = ""; for(let i = 0; i < 260; i++) s += `<circle cx="${(MX + R()*400).toFixed(1)}" cy="${(MY + R()*400).toFixed(1)}" r="${(1 + R()*1.6).toFixed(1)}" fill="${k === "A" ? "#5E8F3A" : ["#E8E3A0", "#B17ACB", "#F7F7F7", "#5E8F3A"][i % 4]}" opacity=".7"/>`; tex[k] = s; });
    function quadPlants(){
      const R = mulberry(SEED + (Q.site === "A" ? 1000 : 2000) + Q.qx*31 + Q.qy*977), counts = DENS[Q.site].map(d => pois(d*Math.exp(.55*(R() + R() + R() - 1.5)), R));
      const pts = scatter(counts.reduce((s, v) => s + v, 0), R, .1); let i = 0;
      Q.plants = []; counts.forEach((c, sp) => { for(let k = 0; k < c && i < pts.length; k++, i++) Q.plants.push(Object.assign({ sp, n:false }, pts[i])); });
    }
    function drawQ(){
      let s = `<rect x="${MX}" y="${MY}" width="400" height="400" fill="${Q.site === "A" ? "#7FB24E" : "#9CBF5E"}"/>${tex[Q.site]}`;
      for(let i = 0; i <= 10; i++) s += `<line x1="${MX + i*S}" y1="${MY}" x2="${MX + i*S}" y2="${MY + 400}" stroke="#fff" stroke-opacity="${i % 10 ? .25 : .7}"/><line x1="${MX}" y1="${MY + i*S}" x2="${MX + 400}" y2="${MY + i*S}" stroke="#fff" stroke-opacity="${i % 10 ? .25 : .7}"/>
        <text x="${MX + i*S}" y="${MY + 416}" text-anchor="middle" class="k-num">${i}</text><text x="${MX - 6}" y="${MY + 400 - i*S + 4}" text-anchor="end" class="k-num">${i}</text>`;
      s += `<text x="${MX + 200}" y="${MY + 436}" text-anchor="middle" class="k-lbl">x / m (tape along the bottom edge)</text><text x="${MX}" y="${MY - 8}" class="k-lbl">y / m · ${SITE[Q.site]}</text>`;
      Q.used.forEach(u => { const [st, x, y] = u.split(":"); if(st === Q.site) s += `<rect x="${MX + x*S + 4}" y="${MY + (9 - y)*S + 4}" width="${S - 8}" height="${S - 8}" fill="#fff" opacity=".25"/>`; });
      if(Q.target) s += `<rect x="${MX + Q.target[0]*S}" y="${MY + (9 - Q.target[1])*S}" width="${S}" height="${S}" fill="none" stroke="#E0334A" stroke-width="2" stroke-dasharray="5 3"/>`;
      s += `<g id="sa-frame" class="k-drag"><rect x="${MX + Q.qx*S - 6}" y="${MY + (9 - Q.qy)*S - 6}" width="${S + 12}" height="${S + 12}" fill="#000" opacity=".001"/><rect x="${MX + Q.qx*S}" y="${MY + (9 - Q.qy)*S}" width="${S}" height="${S}" fill="none" stroke="#FFF7D6" stroke-width="3.5"/><circle cx="${MX + Q.qx*S}" cy="${MY + (9 - Q.qy + 1)*S}" r="4" fill="#E0334A"/></g>`;
      s += `<rect x="${ZX}" y="${ZY}" width="${ZS}" height="${ZS}" fill="${Q.site === "A" ? "#7FB24E" : "#9CBF5E"}" stroke="#FFF7D6" stroke-width="5"/>`;
      if(Q.placed){
        const R = mulberry(SEED + 5); for(let i = 0; i < 90; i++){ const x = ZX + 8 + R()*(ZS - 16), y = ZY + 14 + R()*(ZS - 20); s += `<path d="M${x} ${y}q${R()*6 - 3} -8 ${R()*8 - 4} -14" stroke="#4E7F2C" stroke-width="1.4" fill="none"/>`; }
        s += Q.plants.map((p, i) => `<g data-p="${i}" style="cursor:pointer"><circle cx="${ZX + p.x*ZS}" cy="${ZY + p.y*ZS}" r="13" fill="#000" opacity=".001"/>${glyph(p.sp, ZX + p.x*ZS, ZY + p.y*ZS, p.rot, p.n)}</g>`).join("");
        s += `<text x="${ZX}" y="${ZY - 8}" class="k-tag">Quadrat at (${Q.qx}, ${Q.qy}) — click every plant to count it</text>`;
      }else s += `<text x="${ZX + ZS/2}" y="${ZY + ZS/2}" text-anchor="middle" style="font:600 13px Inter;fill:#1F3A12">${Q.target ? `Drag the quadrat so its red corner is at (${Q.target[0]}, ${Q.target[1]})` : "Generate random coordinates first"}</text>`;
      SP.forEach((p, i) => { s += `${glyph(i, ZX + 12 + i*92, 462, 0, false)}<text x="${ZX + 28 + i*92}" y="466" class="k-lbl">${p.name}</text>`; });
      $("#sa-q").innerHTML = s;
      const here = SP.map((_, i) => Q.plants.filter(p => p.sp === i && p.n).length), T = Q.tot[Q.site];
      ctx.readout([["This quadrat", Q.placed ? SP.map((p, i) => p.k + " " + here[i]).join(" · ") : "—"], [`${Q.site} totals (${Q.n[Q.site]} quadrats)`, SP.map((p, i) => p.k + " " + T[i]).join(" · ")]]);
      status(!Q.target ? "Random sampling: generate coordinates, place the quadrat, count" : !Q.placed ? `Place the quadrat with its corner at (${Q.target[0]}, ${Q.target[1]})` : Q.plants.every(p => p.n) ? "All counted — record this quadrat" : "Count every plant in the quadrat");
    }
    /* ===== belt transect ===== */
    const T = { st:[], sel:null, mx:520, my:420, mval:null, mst:null, data:[], decided:false };
    for(let i = 0; i < 10; i++){
      const lux = Math.round((500 + 9200*(1 - Math.exp(-(i + .5)/3)))*rnd(.9, 1.1)/10)*10, R = mulberry(SEED + 300 + i);
      const nd = pois(.6 + lux/750, R), nc = pois(3, R), np = pois(Math.max(.5, 4 - lux/2500), R);
      const pts = scatter(nd + nc + np, R, .13);
      T.st.push({ lux, plants:pts.map((p, k) => Object.assign({ sp: k < nd ? 0 : k < nd + nc ? 1 : 2, n:false }, p)), light:null, rec:false, hand:false });
    }
    const TZX = 40, TZY = 272, TZS = 222;
    function drawT(){
      let s = `<rect x="0" y="44" width="960" height="196" fill="#8DBA5C"/><rect x="0" y="44" width="960" height="196" fill="url(#sa-shade)"/>
        <ellipse cx="80" cy="40" rx="250" ry="70" fill="#2F6B3A" opacity=".85"/><rect x="40" y="60" width="40" height="178" fill="#6B4A2B"/><text x="60" y="222" text-anchor="middle" style="font:600 10px Inter;fill:#F3E7D3" transform="rotate(-90 60 222)">tree trunk</text>
        <line x1="100" y1="236" x2="900" y2="236" stroke="#FDE68A" stroke-width="3"/>`;
      for(let i = 0; i <= 10; i++) s += `<line x1="${100 + i*80}" y1="230" x2="${100 + i*80}" y2="242" stroke="#FDE68A" stroke-width="2"/><text x="${100 + i*80}" y="256" text-anchor="middle" class="k-num">${i} m</text>`;
      T.st.forEach((st, i) => {
        const x = 100 + i*80;
        s += `<g data-st="${i}" style="cursor:pointer"><rect x="${x + 2}" y="150" width="76" height="78" fill="#fff" fill-opacity=".06" stroke="${T.sel === i ? "#FDE68A" : "#fff"}" stroke-width="${T.sel === i ? 3 : 1.2}" stroke-dasharray="${T.sel === i ? "" : "4 3"}"/>`;
        st.plants.forEach(p => s += `<circle cx="${x + 4 + p.x*72}" cy="${152 + p.y*74}" r="${p.sp === 0 ? 2.2 : 2.6}" fill="${p.sp === 0 ? "#fff" : p.sp === 1 ? "#4E9A3F" : "#1F4A27"}"/>`);
        s += (st.rec ? `<text x="${x + 72}" y="166" text-anchor="end" style="font:700 13px Inter;fill:#FDE68A">✓</text>` : "") + `</g>`;
      });
      s += `<text x="110" y="142" style="font:600 11px Inter;fill:#F8FAFC">belt transect: contiguous 1 m quadrats — click one to look closely</text>`;
      s += `<rect x="${TZX}" y="${TZY}" width="${TZS}" height="${TZS}" fill="#8DBA5C" stroke="#FFF7D6" stroke-width="4"/>`;
      if(T.sel !== null){ const st = T.st[T.sel]; s += st.plants.map((p, i) => `<g data-tp="${i}" style="cursor:pointer"><circle cx="${TZX + p.x*TZS}" cy="${TZY + p.y*TZS}" r="12" fill="#000" opacity=".001"/>${glyph(p.sp, TZX + p.x*TZS, TZY + p.y*TZS, p.rot, p.n)}</g>`).join(""); }
      else s += `<text x="${TZX + TZS/2}" y="${TZY + TZS/2}" text-anchor="middle" style="font:600 12px Inter;fill:#1F3A12">choose a station</text>`;
      const st = T.sel !== null ? T.st[T.sel] : null, nd = st ? st.plants.filter(p => p.sp === 0 && p.n).length : 0;
      s += `<text x="285" y="290" class="k-tag">${st ? `Station ${T.sel + 1} (${T.sel}–${T.sel + 1} m from the trunk)` : "No station selected"}</text>
        <text x="285" y="312" class="k-lbl">Daisies counted: ${nd}</text>
        <text x="285" y="332" class="k-lbl">Light reading: ${st && st.light !== null ? st.light + " lux ✓" : "not entered yet"}</text>
        <text x="285" y="356" class="k-lbl">1 Drag the light meter onto the station</text><text x="285" y="374" class="k-lbl">2 Click every daisy (ignore clover, plantain)</text><text x="285" y="392" class="k-lbl">3 Record the station</text>`;
      s += critTable(640, 290, "Spearman’s rank, rₛ at p = 0.05", "n", "rₛ", [6, 7, 8, 9, 10], [6, 7, 8, 9, 10].map(k => RS05[k].toFixed(2)), 44);
      s += critTable(640, 372, "Pearson’s r at p = 0.05", "v = n − 2", "r", [5, 6, 7, 8], [5, 6, 7, 8].map(k => R05[k].toFixed(2)), 50);
      s += `<text x="640" y="450" class="k-lbl">rₛ = 1 − 6Σd² ÷ (n(n² − 1))</text><text x="640" y="470" class="k-lbl">r = (Σxy − n x̄ ȳ) ÷ ((n − 1) × s(x) × s(y))</text>`;
      const lcd = T.mval === null ? "----" : String(T.mval);
      s += `<g id="sa-meter" class="k-drag"><rect x="${T.mx - 52}" y="${T.my}" width="104" height="62" rx="9" fill="#1F2937" stroke="#4B5563"/><rect x="${T.mx - 42}" y="${T.my + 8}" width="84" height="28" rx="4" fill="#132A1F"/>
        <text x="${T.mx + 36}" y="${T.my + 29}" text-anchor="end" style="font:600 16px 'JetBrains Mono';fill:#7CFFB2">${lcd}</text><text x="${T.mx}" y="${T.my + 52}" text-anchor="middle" style="font:600 9px Inter;fill:#E5E7EB">LIGHT METER · lux</text>
        <line x1="${T.mx}" y1="${T.my}" x2="${T.mx}" y2="${T.my - 14}" stroke="#4B5563" stroke-width="3"/><circle cx="${T.mx}" cy="${T.my - 16}" r="7" fill="#F8FAFC" stroke="#4B5563" stroke-width="2"/></g>`;
      $("#sa-t").innerHTML = s;
      ctx.readout([["Stations recorded", T.data.length + "/10"], ["Meter", T.mst === null ? "not on a station" : "station " + (T.mst + 1)]]);
      status(T.data.length >= 7 ? "Enough stations for a correlation test (more is better)" : "Belt transect from the trunk into the open");
    }
    /* ===== mark–release–recapture ===== */
    const M = { phase:"idle", N:0, an:[], n1:0, n2:0, m2:0, mark:"small", wait:"24", got:{}, done:false };
    function place(n){
      const pts = []; for(let tries = 0; pts.length < n && tries < 6000; tries++){ const x = rnd(85, 565), y = rnd(95, 470); if(pts.some(p => Math.hypot(p.x - x, p.y - y) < (tries > 3000 ? 22 : 34))) continue; pts.push({ x, y, a:rnd(0, 360), m:false, t:false }); }
      return pts;
    }
    const leaves = (() => { let s = ""; for(let i = 0; i < 40; i++){ const x = rnd(0, 960), y = rnd(44, 520); s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${rnd(14, 26).toFixed(0)}" ry="${rnd(6, 10).toFixed(0)}" transform="rotate(${rnd(0, 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="${["#8A5A2B", "#A0692F", "#6E4A25"][i % 3]}" opacity=".6"/>`; } return s; })();
    function louse(a){
      const blob = M.mark === "blob";
      return `<g data-w="${a.i}" style="cursor:pointer" transform="rotate(${a.a.toFixed(0)} ${a.x.toFixed(1)} ${a.y.toFixed(1)})"><ellipse cx="${a.x}" cy="${a.y}" rx="14" ry="9" fill="#6B6F76" stroke="#3F4248" stroke-width="1.2"/>
        ${[-8, -4, 0, 4, 8].map(d => `<line x1="${a.x + d}" y1="${a.y - 8}" x2="${a.x + d}" y2="${a.y + 8}" stroke="#4A4D53" stroke-width="1"/>`).join("")}
        <path d="M${a.x + 13} ${a.y - 3}l9 -6M${a.x + 13} ${a.y + 3}l9 6" stroke="#3F4248" stroke-width="1.3"/>
        ${a.m ? (blob ? `<circle cx="${a.x - 2}" cy="${a.y}" r="7" fill="#FF3EA5" stroke="#B0006A"/>` : `<circle cx="${a.x - 2}" cy="${a.y}" r="2.6" fill="#FDE047" stroke="#A16207" stroke-width=".8"/>`) : ""}
        ${a.t ? `<circle cx="${a.x}" cy="${a.y}" r="17" fill="none" stroke="#16A34A" stroke-width="2.5"/>` : ""}</g>`;
    }
    function drawM(){
      let s = `<rect x="0" y="44" width="960" height="476" fill="#5A3B1E"/>${leaves}<rect x="50" y="62" width="550" height="440" rx="16" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>`;
      s += M.an.map((a, i) => louse(Object.assign(a, { i }))).join("");
      if(!M.an.length) s += `<text x="325" y="280" text-anchor="middle" style="font:600 13px Inter;fill:#64748B">${M.phase === "wait" ? "Marked woodlice released where they were found…" : "Empty tray — collect sample 1 from under the logs"}</text>`;
      const marked = M.an.filter(a => a.m).length, ticked = M.an.filter(a => a.t).length;
      s += `<rect x="620" y="62" width="320" height="440" rx="12" fill="#1F2937" opacity=".92"/>
        <text x="640" y="92" style="font:700 12px Inter;fill:#F8FAFC">Mark–release–recapture</text>
        <text x="640" y="122" style="font:500 12px Inter;fill:#CBD5E1">Sample 1: click each woodlouse to mark it.</text>
        <text x="640" y="142" style="font:500 12px Inter;fill:#CBD5E1">Marked so far: ${M.phase === "s1" ? marked : M.n1 || 0}  (this is n₁)</text>
        <text x="640" y="176" style="font:500 12px Inter;fill:#CBD5E1">Sample 2: click each animal as you count it;</text>
        <text x="640" y="196" style="font:500 12px Inter;fill:#CBD5E1">count the marked ones too.</text>
        <text x="640" y="216" style="font:500 12px Inter;fill:#CBD5E1">Ticked: ${M.phase === "s2" || M.phase === "done" ? ticked : 0}</text>
        <text x="640" y="256" style="font:600 13px Inter;fill:#FDE68A">N = n₁ × n₂ ÷ m₂</text>
        <text x="640" y="284" style="font:500 11px Inter;fill:#9CA3AF">n₁ marked and released</text>
        <text x="640" y="302" style="font:500 11px Inter;fill:#9CA3AF">n₂ caught in the second sample</text>
        <text x="640" y="320" style="font:500 11px Inter;fill:#9CA3AF">m₂ marked animals in the second sample</text>
        <text x="640" y="356" style="font:600 11px Inter;fill:#E5E7EB">Mark: ${M.mark === "blob" ? "large bright blob" : "small dot, non-toxic paint"}</text>
        <text x="640" y="376" style="font:600 11px Inter;fill:#E5E7EB">Recapture after: ${M.wait} h</text>
        ${M.done ? `<text x="640" y="416" style="font:600 12px Inter;fill:#7CFFB2">Actual population: ${M.N}</text>` : ""}`;
      $("#sa-m").innerHTML = s;
      ctx.readout([["Phase", { idle:"ready", s1:"marking sample 1", wait:"released", s2:"counting sample 2", done:"estimate made" }[M.phase]], ["n₁", M.n1 ? String(M.n1) : "—"]]);
      status({ idle:"Collect sample 1", s1:"Mark every woodlouse in the tray", wait:"Collect sample 2 from the same area", s2:"Count n₂ and m₂", done:"Compare your estimate with the actual population" }[M.phase]);
    }
    function draw(){ $("#sa-q").style.display = mode === "quad" ? "" : "none"; $("#sa-t").style.display = mode === "tran" ? "" : "none"; $("#sa-m").style.display = mode === "mrr" ? "" : "none";
      if(mode === "quad") drawQ(); else if(mode === "tran") drawT(); else drawM(); }

    Kit.dragger(ctx, svg, {
      hit(tg, p){
        if(mode === "quad" && tg.closest("#sa-frame")) return { k:"q", qx:Q.qx, qy:Q.qy, p0:p };
        if(mode === "tran" && tg.closest("#sa-meter")) return { k:"m", x:T.mx, y:T.my, p0:p };
        return null;
      },
      move(h, p){
        if(h.k === "q"){ Q.qx = Kit.clamp(h.qx + (p.x - h.p0.x)/S, -.5, 9.5); Q.qy = Kit.clamp(h.qy - (p.y - h.p0.y)/S, -.5, 9.5); Q.placed = false; drawQ(); }
        else { T.mx = Kit.clamp(h.x + p.x - h.p0.x, 60, 900); T.my = Kit.clamp(h.y + p.y - h.p0.y, 160, 450); T.mval = null; T.mst = null; drawT(); }
      },
      end(h){
        if(h.k === "q"){
          Q.qx = Kit.clamp(Math.round(Q.qx), 0, 9); Q.qy = Kit.clamp(Math.round(Q.qy), 0, 9);
          if(!Q.target) ctx.toast("Generate random coordinates first — choosing a spot by eye is biased");
          else if(Q.qx === Q.target[0] && Q.qy === Q.target[1]){ Q.placed = true; quadPlants(); }
          else ctx.toast(`Not there yet: the red corner must be at x = ${Q.target[0]}, y = ${Q.target[1]}`);
          drawQ();
        }else{
          const sy = T.my - 16;
          if(sy >= 150 && sy <= 230 && T.mx >= 100 && T.mx < 900){ const i = Math.floor((T.mx - 100)/80); T.mst = i; T.sel = i; T.mval = Math.round(T.st[i].lux*(1 + .015*gN())/10)*10; rdLux.clear(); }
          drawT();
        }
      }
    });
    svg.addEventListener("pointerdown", e => {
      if(mode === "quad"){ const g = e.target.closest("[data-p]"); if(!g || !Q.placed) return; const p = Q.plants[+g.dataset.p]; if(p.n) return ctx.toast("Already counted"); p.n = true; drawQ(); }
      else if(mode === "tran"){
        const tp = e.target.closest("[data-tp]");
        if(tp){ const st = T.st[T.sel], p = st.plants[+tp.dataset.tp]; if(st.rec) return ctx.toast("Already recorded"); if(p.sp !== 0) return ctx.toast(`That’s ${p.sp === 1 ? "clover" : "a plantain"}, not a daisy`); if(p.n) return ctx.toast("Already counted"); p.n = true; st.hand = true; drawT(); return; }
        const g = e.target.closest("[data-st]"); if(g){ T.sel = +g.dataset.st; rdLux.clear(); drawT(); }
      }else{
        const g = e.target.closest("[data-w]"); if(!g) return; const a = M.an[+g.dataset.w];
        if(M.phase === "s1"){ if(a.m) return ctx.toast("Already marked"); a.m = true; drawM(); }
        else if(M.phase === "s2"){ a.t = !a.t; drawM(); }
      }
    });

    ctx.seg({ label:"Method", value:"quad", options:[["quad","Random quadrats"],["tran","Belt transect"],["mrr","Mark–recapture"]], onChange(v){ mode = v; panels(); draw(); } });
    const pQ = ctx.html(`<div></div>`), pT = ctx.html(`<div></div>`), pM = ctx.html(`<div></div>`);
    function panels(){ pQ.style.display = mode === "quad" ? "" : "none"; pT.style.display = mode === "tran" ? "" : "none"; pM.style.display = mode === "mrr" ? "" : "none"; }
    /* quadrat controls */
    ctx.seg({ label:"Site", value:"A", parent:pQ, options:[["A","A: mown lawn"],["B","B: meadow"]], onChange(v){ Q.site = v; Q.target = null; Q.placed = false; aD.clear(); drawQ(); } });
    ctx.buttons([{ label:"Generate random coordinates", primary:true, onClick(){
      if(Q.placed && !Q.plants.every(p => p.n)) return ctx.toast("Finish counting this quadrat first");
      let x, y, k = 0; do{ x = rint(0, 9); y = rint(0, 9); k++; } while(Q.used.has(Q.site + ":" + x + ":" + y) && k < 200);
      Q.target = [x, y]; Q.placed = false; drawQ(); ctx.toast(`Random numbers: x = ${x}, y = ${y}`);
    } }], pQ);
    ctx.buttons([{ label:"Record quadrat", onClick(){
      if(!Q.placed) return ctx.toast("Place the quadrat at the random coordinates first");
      if(!Q.plants.every(p => p.n)) return ctx.toast("Some plants have not been counted yet");
      const c = SP.map((_, i) => Q.plants.filter(p => p.sp === i).length);
      c.forEach((v, i) => Q.tot[Q.site][i] += v); Q.n[Q.site]++; Q.used.add(Q.site + ":" + Q.qx + ":" + Q.qy);
      ctx.record({ mode:"Quadrat", where:`${Q.site} (${Q.qx}, ${Q.qy})`, data:SP.map((p, i) => p.k + " " + c[i]).join(" · "), x:null, y:c.reduce((s, v) => s + v, 0) });
      if(Q.n[Q.site] >= 5) ctx.complete("quadrats");
      Q.target = null; Q.placed = false; Q.plants = []; drawQ();
    } }, { label:"Count the rest for me", onClick(){
      if(!Q.placed) return ctx.toast("Place the quadrat first");
      if(Q.n[Q.site] < 1) return ctx.toast("Count your first quadrat at this site by hand");
      Q.plants.forEach(p => p.n = true); drawQ();
    } }], pQ);
    const simpD = k => { const T0 = Q.tot[k], N = T0.reduce((s, v) => s + v, 0); return 1 - T0.reduce((s, n) => s + (n/N)*(n/N), 0); };
    const aD = Kit.answer(ctx, "Simpson’s index for this site, D = 1 − Σ(n/N)²", "e.g. 0.72", v => {
      if(Q.n[Q.site] < 5) return [false, "Record at least five random quadrats at this site first."];
      const D = simpD(Q.site);
      if(Math.abs(v - D) <= .01){ Q.dOK.add(Q.site); if(Q.dOK.size === 2) ctx.complete("simpson");
        return [true, `Correct: D = ${D.toFixed(2)} for ${SITE[Q.site]}.` + (Q.dOK.size === 2 ? ` ${simpD("B") > simpD("A") ? "The meadow (B)" : "The lawn (A)"} is more diverse: more species with more even numbers of each.` : " Now do the other site.")]; }
      return [false, "Use the site totals in the readout: N = total of all species; add (n/N)² for each species; D = 1 − that sum."];
    }, pQ);
    /* transect controls */
    const rdLux = Kit.reading(ctx, "Light intensity at this station / lux", "e.g. 4200", () => (T.mst !== null && T.mst === T.sel) ? T.mval : null, 1, v => { T.st[T.sel].light = Math.round(v); ctx.toast("Light reading noted"); drawT(); }, pT);
    ctx.buttons([{ label:"Record station", primary:true, onClick(){
      if(T.sel === null) return ctx.toast("Choose a station");
      const st = T.st[T.sel]; if(st.rec) return ctx.toast("Already recorded");
      if(st.light === null) return ctx.toast("Read the light meter at this station first");
      if(st.plants.some(p => p.sp === 0 && !p.n)) return ctx.toast("You’ve missed some daisies — look again");
      st.rec = true; const n = st.plants.filter(p => p.sp === 0).length; T.data.push([st.light, n, T.sel]);
      ctx.record({ mode:"Transect", where:`Station ${T.sel + 1} (${T.sel}–${T.sel + 1} m)`, data:`${n} daisies`, x:st.light, y:n });
      drawT();
    } }, { label:"Count daisies for me", onClick(){
      if(T.data.length < 2) return ctx.toast("Count the daisies at two stations yourself first");
      if(T.sel === null) return ctx.toast("Choose a station"); T.st[T.sel].plants.forEach(p => { if(p.sp === 0) p.n = true; }); drawT();
    } }], pT);
    let test = "s";
    ctx.seg({ label:"Correlation test", value:"s", parent:pT, options:[["s","Spearman’s rank"],["p","Pearson’s"]], onChange(v){ test = v; aR.clear(); T.rOK = false; } });
    const coef = () => { const x = T.data.map(d => d[0]), y = T.data.map(d => d[1]); return test === "s" ? spearman(x, y) : pearson(x, y); };
    const aR = Kit.answer(ctx, "Correlation coefficient (rₛ or r)", "e.g. 0.85", v => {
      if(T.data.length < 7) return [false, "Record at least seven stations first."];
      const r = coef(); if(Math.abs(v - r) <= .03){ T.rOK = true; return [true, `Correct: ${test === "s" ? "rₛ" : "r"} = ${r.toFixed(2)} for n = ${T.data.length}.`]; }
      return [false, test === "s" ? "Rank light (highest = 1) and daisies separately (tied values share the mean rank), find d for each pair, then rₛ = 1 − 6Σd² ÷ (n(n² − 1))." : "r = (Σxy − n x̄ ȳ) ÷ ((n − 1) × s(x) × s(y)), using the light values as x and daisies as y."];
    }, pT);
    ctx.buttons([{ label:"Significant +", onClick(){ concl(1); } }, { label:"Significant −", onClick(){ concl(-1); } }, { label:"Not significant", onClick(){ concl(0); } }], pT);
    const msgT = ctx.html(`<div class="ctl"></div>`, pT);
    function concl(c){
      if(!T.rOK) return ctx.toast("Calculate the correlation coefficient first");
      const r = coef(), n = T.data.length, crit = test === "s" ? RS05[n] : R05[n - 2], truth = Math.abs(r) > crit ? Math.sign(r) : 0;
      if(c !== truth) return say(msgT, false, `Compare |${r.toFixed(2)}| with the critical value for ${test === "s" ? "n = " + n : "v = " + (n - 2)} (${crit.toFixed(2)}). The sign shows the direction.`);
      say(msgT, true, truth ? `|${r.toFixed(2)}| > ${crit.toFixed(2)}, so p < 0.05: a significant ${truth > 0 ? "positive" : "negative"} correlation between light intensity and the number of daisies. This does not show that light causes the change.` : `|${r.toFixed(2)}| < ${crit.toFixed(2)}: no significant correlation (p > 0.05).`);
      if(!T.decided){ T.decided = true; ctx.record({ mode:"Transect", where: test === "s" ? "Spearman’s rank" : "Pearson’s", data:`${test === "s" ? "rₛ" : "r"} = ${r.toFixed(2)}, n = ${n}, critical ${crit.toFixed(2)}: ${truth ? "significant" : "not significant"}`, x:null, y:null }); }
      ctx.complete("corr");
    }
    /* MRR controls */
    ctx.seg({ label:"Mark", value:"small", parent:pM, options:[["small","Small dot of non-toxic paint"],["blob","Large bright blob"]], onChange(v){ if(M.phase === "idle" || M.phase === "done"){ M.mark = v; drawM(); } else ctx.toast("Change this before collecting sample 1"); } });
    ctx.seg({ label:"Time before recapture", value:"24", parent:pM, options:[["24","24 hours"],["1","1 hour"]], onChange(v){ if(M.phase === "idle" || M.phase === "done"){ M.wait = v; drawM(); } else ctx.toast("Change this before collecting sample 1"); } });
    ctx.buttons([{ label:"Collect sample 1", primary:true, onClick(){
      if(M.phase !== "idle" && M.phase !== "done") return ctx.toast("Finish this estimate first");
      M.N = rint(150, 240); M.an = place(Math.round(M.N*rnd(.16, .24))); M.phase = "s1"; M.n1 = 0; M.done = false; M.got = {}; rdN2.clear(); rdM2.clear(); aL.clear(); drawM();
    } }, { label:"Release", onClick(){
      if(M.phase !== "s1") return ctx.toast("Collect and mark sample 1 first");
      if(M.an.some(a => !a.m)) return ctx.toast("Mark every woodlouse first");
      M.n1 = M.an.length; M.an = []; M.phase = "wait"; drawM(); ctx.toast(`Released. Waiting ${M.wait} h…`);
    } }, { label:"Collect sample 2", onClick(){
      if(M.phase !== "wait") return ctx.toast("Release sample 1 first");
      let p = M.n1/M.N; if(M.wait === "1") p = Math.min(.85, p*2.4); if(M.mark === "blob") p *= .5;
      const n2 = Math.round(M.N*rnd(.16, .25)); let m2; do{ m2 = 0; for(let i = 0; i < n2; i++) if(Math.random() < p) m2++; } while(m2 < 2);
      M.an = place(n2); M.n2 = M.an.length; M.m2 = Math.min(m2, M.n2); M.an.slice(0, M.m2).forEach(a => a.m = true); M.an.sort(() => Math.random() - .5);
      M.phase = "s2"; drawM();
    } }], pM);
    const rdN2 = Kit.reading(ctx, "n₂ — total caught in sample 2", "e.g. 41", () => M.phase === "s2" || M.phase === "done" ? M.n2 : null, 0, v => { M.got.n2 = v; ctx.toast("n₂ noted"); }, pM);
    const rdM2 = Kit.reading(ctx, "m₂ — marked animals in sample 2", "e.g. 8", () => M.phase === "s2" || M.phase === "done" ? M.m2 : null, 0, v => { M.got.m2 = v; ctx.toast("m₂ noted"); }, pM);
    const aL = Kit.answer(ctx, "Estimated population, N", "e.g. 190", v => {
      if(!M.got.n2 || !M.got.m2) return [false, "Count n₂ and m₂ in the tray first."];
      const N = M.n1*M.n2/M.m2;
      if(Math.abs(v - N)/N > .02) return [false, "N = n₁ × n₂ ÷ m₂."];
      if(!M.done){ M.done = true; M.phase = "done"; ctx.complete("lincoln");
        ctx.record({ mode:"Mark–recapture", where:`${M.wait} h · ${M.mark === "blob" ? "bright blob" : "small dot"}`, data:`n₁ = ${M.n1}, n₂ = ${M.n2}, m₂ = ${M.m2}; actual ${M.N}`, x:null, y:Math.round(N) }); drawM(); }
      const err = (N - M.N)/M.N*100;
      return [true, `N = ${M.n1} × ${M.n2} ÷ ${M.m2} = ${Math.round(N)}. Actual population ${M.N} (${err > 0 ? "+" : ""}${err.toFixed(0)}%). ${M.mark === "blob" ? "Bright marks made marked woodlice easier for predators to find, so fewer were recaptured — an overestimate is likely. " : ""}${M.wait === "1" ? "One hour is not long enough for marked animals to mix with the population, so too many were recaptured — an underestimate is likely." : ""}`];
    }, pM);
    panels(); draw();
  }
});

/* ───────────── GEL ELECTROPHORESIS ───────────── */
Lab.register({
  id:"electrophoresis", subject:"biology", level:["a"], topic:"Genetic technology · Gel electrophoresis", interactive:true,
  title:"Gel electrophoresis: DNA profiling",
  summary:"Load a DNA ladder and restriction digests of crime-scene and suspect DNA into an agarose gel, run it, stain it and measure the bands. Plot a standard curve of log(size) against distance to estimate fragment lengths and find the match.",
  aim:"Use gel electrophoresis to separate DNA fragments of different lengths, estimate fragment sizes from a standard curve, and compare DNA profiles.",
  variables:{ iv:"Length of DNA fragment (base pairs)", dv:"Distance moved from the well (mm)", cv:["Same gel (agarose concentration) and buffer for every lane","Same voltage and running time for every lane","Same restriction enzyme for every sample"] },
  stageTitle:"Gel tank", controlsTitle:"Load, run & analyse",
  thumb:`<svg viewBox="0 0 300 140"><rect x="20" y="8" width="260" height="124" rx="6" fill="#CFE3F3"/><rect x="34" y="18" width="232" height="108" fill="#EEF4F8" stroke="#94A3B8"/>${[0,1,2,3,4].map(i => `<rect x="${48 + i*44}" y="24" width="28" height="6" fill="#64748B"/>`).join("")}${[[0,40],[0,58],[0,70],[0,82],[0,100],[1,52],[1,76],[1,94],[2,46],[2,66],[2,104],[3,52],[3,76],[3,94]].map(([l, y]) => `<rect x="${48 + l*44}" y="${y}" width="28" height="4" fill="#1E3A8A"/>`).join("")}</svg>`,
  steps:[
    { id:"ladder",  text:"Load the DNA ladder into a well" },
    { id:"samples", text:"Load the crime-scene and suspect samples" },
    { id:"run",     text:"Run the gel until the dye front is near the far end" },
    { id:"stain",   text:"Stain the gel to show the DNA bands" },
    { id:"measure", text:"Measure at least four ladder bands" },
    { id:"size",    text:"Estimate the size of a crime-scene fragment" }
  ],
  challenges:[
    { id:"curve",  title:"Standard curve", text:"Measure at least four ladder bands on one gel and plot log(size) against distance." },
    { id:"size",   title:"Size a fragment", text:"Use your standard curve to estimate the length of a crime-scene fragment." },
    { id:"match",  title:"Find the match", text:"Decide which suspect’s DNA profile matches the crime-scene DNA." },
    { id:"faults", title:"What went wrong?", text:"Run a gel with the wells at the anode end, and one that runs for too long." }
  ],
  columns:[{key:"lane",label:"Lane"},{key:"band",label:"Band"},{key:"size",label:"Size / bp",dp:0},{key:"d",label:"Distance from well / mm",dp:0},{key:"logs",label:"log₁₀(size / bp)",dp:3}],
  series:"lane",
  graph:{ x:["d"], y:["logs"], fit:"linear" },
  questions:[
    { q:"Explain why DNA fragments move through the gel and why they separate.",
      a:"DNA is negatively charged because of the phosphate groups in its sugar–phosphate backbone, so it moves towards the anode (+). The agarose gel is a mesh of fibres; shorter fragments move through the pores more easily, so they travel further in a given time. Fragments are separated by length." },
    { q:"Why must the wells be at the cathode end?",
      a:"DNA moves towards the anode. If the wells are next to the anode, the DNA moves out of the wells straight into the buffer and is lost — no bands are seen." },
    { q:"What is the DNA ladder for?",
      a:"It contains fragments of known lengths. Measuring their distances lets you plot a standard (calibration) curve of log(fragment length) against distance, from which the lengths of unknown fragments run on the same gel can be read." },
    { q:"Why is log(size) plotted rather than size?",
      a:"Distance moved is approximately proportional to the logarithm of fragment length, so log(size) against distance gives a straight line over most of the range, which is easier to use for interpolation." },
    { q:"What does the loading dye do, and why is the run stopped before the dye reaches the end?",
      a:"The dense loading dye makes the sample sink into the well and lets you watch progress, as it moves just ahead of the smallest fragments. If the run continues after the dye reaches the end, the smallest fragments run off the gel into the buffer and are lost." },
    { q:"Assess the risks of this procedure.",
      a:"Electrical hazard from the power pack and buffer — keep the lid on while running and switch off before touching the tank. Some DNA stains (e.g. ethidium bromide) are mutagens and need UV light, which damages eyes and skin — use a safer stain such as methylene blue or Azure A, wear gloves and eye protection. Hot molten agarose can scald." }
  ],
  setup(ctx){
    const PX = 5, WY = 100, GL = 72, LX = i => 122 + i*68, f = bp => (4.45 - Math.log10(bp))/1.75, DYE = f(300);
    const LADDER = [10000, 6000, 4000, 3000, 2000, 1000, 500];
    function frag3(){ for(;;){ const a = [0, 1, 2].map(() => Math.round(Math.pow(10, rnd(2.85, 3.85))/10)*10).sort((p, q) => q - p); if(a[0]/a[1] > 1.35 && a[1]/a[2] > 1.35) return a; } }
    const CS = frag3(), MATCH = rint(1, 3);
    const far = (b, list) => list.every(x => Math.abs(Math.log10(b/x)) > .1);
    const SUS = [1, 2, 3].map(k => { if(k === MATCH) return CS.slice(); for(;;){ const keep = CS[rint(0, 2)], a = [keep]; while(a.length < 3){ const b = Math.round(Math.pow(10, rnd(2.85, 3.85))/10)*10; if(far(b, CS) && far(b, a)) a.push(b); } return a.sort((p, q) => q - p); } });
    const TUBES = [{ k:"L", name:"Ladder", frags:LADDER }, { k:"CS", name:"Crime scene", frags:CS }, { k:"S1", name:"Suspect 1", frags:SUS[0] }, { k:"S2", name:"Suspect 2", frags:SUS[1] }, { k:"S3", name:"Suspect 3", frags:SUS[2] }];
    const tubeByK = k => TUBES.find(t => t.k === k), TX = i => 650 + i*62;
    let orient = "cathode", lanes = Array(6).fill(null), P = 0, Tm = 0, V = 100, running = false, stained = false, meas = {}, pip = { x:870, y:375, load:null }, rx = 525, ry = 86, seen = { anode:false, runoff:false };
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 520" class="kb" id="ge-svg"><defs>${Kit.DEFS}</defs>
      <g id="ge-fixed"></g><g id="ge-gel"></g><g id="ge-ruler" class="k-drag"></g><g id="ge-pip" class="k-drag"></g><text x="24" y="28" class="k-status" id="ge-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#ge-svg"), $ = s => svg.querySelector(s);
    function drawFixed(){
      let s = `<rect x="620" y="44" width="300" height="118" rx="12" fill="#1F2937" stroke="#4B5563"/><text x="640" y="66" style="font:700 10px Inter;fill:#9CA3AF;letter-spacing:.06em">POWER PACK</text>
        <rect x="640" y="76" width="120" height="40" rx="5" fill="#132A1F"/><text x="750" y="104" text-anchor="end" class="k-lcd" id="ge-v"></text>
        <rect x="780" y="76" width="120" height="40" rx="5" fill="#132A1F"/><text x="890" y="104" text-anchor="end" class="k-lcd" id="ge-t"></text>
        <text x="700" y="134" text-anchor="middle" style="font:600 9px Inter;fill:#9CA3AF">volts</text><text x="840" y="134" text-anchor="middle" style="font:600 9px Inter;fill:#9CA3AF">minutes</text>
        <circle cx="650" cy="148" r="6" fill="#111"/><circle cx="676" cy="148" r="6" fill="#DC2626"/>`;
      s += `<rect x="610" y="398" width="300" height="76" rx="8" fill="#CBD5E1" opacity=".55"/>`;
      TUBES.forEach((t, i) => { const x = TX(i);
        s += `<path d="M${x - 13} 404h26v44a13 13 0 0 1 -26 0z" fill="#EEF2FF" stroke="#94A3B8" stroke-width="1.5"/><path d="M${x - 11} 440h22v8a11 11 0 0 1 -22 0z" fill="#3B5BDB" opacity=".75"/>
          <text x="${x}" y="490" text-anchor="middle" class="k-tag">${t.k === "L" ? "Ladder" : t.k}</text>`; });
      s += `<text x="760" y="512" text-anchor="middle" class="k-lbl">DNA samples with loading dye · CS = crime scene, S = suspect</text>`;
      s += `<g transform="translate(620 180)"><rect width="150" height="${LADDER.length*17 + 30}" rx="8" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="12" y="20" class="k-tag">Ladder fragments</text>${LADDER.map((b, i) => `<text x="12" y="${40 + i*17}" class="k-num">${b.toLocaleString()} bp</text>`).join("")}</g>`;
      $("#ge-fixed").innerHTML = s;
    }
    function drawGel(){
      const top = orient === "cathode" ? ["−", "cathode", "#111"] : ["+", "anode", "#DC2626"], bot = orient === "cathode" ? ["+", "anode", "#DC2626"] : ["−", "cathode", "#111"];
      let s = `<rect x="70" y="56" width="440" height="438" rx="10" fill="#BFD8EE" opacity=".8" stroke="#7FA6C9"/>
        <rect x="80" y="64" width="420" height="5" fill="${top[2]}"/><rect x="80" y="482" width="420" height="5" fill="${bot[2]}"/>
        <circle cx="40" cy="66" r="12" fill="${top[2]}"/><text x="40" y="71" text-anchor="middle" style="font:700 15px Inter;fill:#fff">${top[0]}</text><text x="40" y="94" text-anchor="middle" class="k-lbl">${top[1]}</text>
        <circle cx="40" cy="484" r="12" fill="${bot[2]}"/><text x="40" y="489" text-anchor="middle" style="font:700 15px Inter;fill:#fff">${bot[0]}</text><text x="40" y="512" text-anchor="middle" class="k-lbl">${bot[1]}</text>
        <path d="M650 154C610 200 560 60 506 66" stroke="#111" stroke-width="2" fill="none" opacity=".7"/><path d="M676 154C676 176 594 166 594 200V460C594 478 560 484 506 484" stroke="#DC2626" stroke-width="2" fill="none" opacity=".7"/>
        <rect x="85" y="84" width="410" height="${GL*PX + 22}" fill="${stained ? "#E6EEF5" : "#EEF4F8"}" opacity=".95" stroke="#94A3B8"/>`;
      for(let i = 0; i < 6; i++){
        const x = LX(i), ln = lanes[i];
        s += `<rect x="${x - 16}" y="${WY - 8}" width="32" height="8" fill="${ln && P === 0 ? "#3B5BDB" : "#94A3B8"}" opacity="${ln && P === 0 ? .8 : .6}"/>`;
        if(ln) s += `<text x="${x}" y="82" text-anchor="middle" style="font:700 9px Inter;fill:#1E293B">${ln === "L" ? "Ladder" : ln}</text>`;
        else s += `<text x="${x}" y="82" text-anchor="middle" style="font:500 9px Inter;fill:#64748B">${i + 1}</text>`;
        if(!ln || P === 0) continue;
        if(orient === "anode"){ const y = WY - 8 - P*DYE*PX; if(y > 60) s += `<rect x="${x - 15}" y="${y}" width="30" height="5" fill="#3B5BDB" opacity="${Math.max(0, .7 - P/20)}"/>`; continue; }
        if(!stained){ const dd = P*DYE; if(dd <= GL) s += `<rect x="${x - 15}" y="${WY + dd*PX - 3}" width="30" height="6" rx="2" fill="#3B5BDB" opacity=".7"/>`; }
        else tubeByK(ln).frags.forEach(b => { const dd = P*f(b); if(dd <= GL) s += `<rect x="${x - 14}" y="${WY + dd*PX - 2.2}" width="28" height="4.4" rx="1.5" fill="#1E3A8A" opacity=".85"/>`; });
      }
      $("#ge-gel").innerHTML = s;
      $("#ge-v").textContent = String(V); $("#ge-t").textContent = Tm.toFixed(1);
      const dye = P*DYE;
      $("#ge-status").textContent = running ? (orient === "anode" ? "Running… watch which way the dye moves" : dye > GL ? "The dye front has run off the end!" : "Running… stop when the dye front is about 85% of the way down") : stained ? "Drag the ruler: measure from the bottom of the well to the middle of a band" : P > 0 ? "Stopped — stain the gel" : "Drag the micropipette: take up a sample, then release it into a well";
      ctx.readout([["Wells at", orient === "cathode" ? "cathode (−)" : "anode (+)"], ["Dye front", orient === "anode" && P > 0 ? "left the gel" : (Math.min(dye, 99)).toFixed(0) + " mm of " + GL], ["Gel", stained ? "stained" : P > 0 ? "run" : "loading"]]);
    }
    function drawPip(){
      const { x, y, load } = pip;
      $("#ge-pip").innerHTML = `<rect x="${x - 22}" y="${y - 150}" width="44" height="150" fill="#000" opacity=".001"/><rect x="${x - 6}" y="${y - 146}" width="12" height="18" rx="3" fill="#94A3B8"/>
        <rect x="${x - 11}" y="${y - 128}" width="22" height="78" rx="7" fill="#E2E8F0" stroke="#64748B"/><rect x="${x - 7}" y="${y - 116}" width="14" height="10" rx="2" fill="#0EA5E9"/>
        <path d="M${x - 6} ${y - 50}L${x + 6} ${y - 50}L${x + 1.3} ${y}L${x - 1.3} ${y}Z" fill="${load ? "#3B5BDB" : "#F8FAFC"}" stroke="#64748B"/>
        ${load ? `<text x="${x + 14}" y="${y - 60}" style="font:700 10px Inter;fill:#3B5BDB">${load === "L" ? "ladder" : load}</text>` : ""}`;
    }
    function drawRuler(){
      let r = `<rect x="${rx}" y="${ry}" width="36" height="${80*PX + 16}" rx="4" fill="#F2E6C2" stroke="#B8962E" opacity=".9"/>`;
      for(let mm = 0; mm <= 80; mm++){ const y = ry + 8 + mm*PX, L = mm % 10 === 0 ? 14 : mm % 5 === 0 ? 10 : 5; r += `<line x1="${rx}" y1="${y}" x2="${rx + L}" y2="${y}" stroke="#4B3621" stroke-width=".9"/>`; if(mm % 10 === 0) r += `<text x="${rx + 30}" y="${y + 3.5}" text-anchor="end" style="font:600 9px 'JetBrains Mono';fill:#4B3621">${mm}</text>`; }
      r += `<text x="${rx + 18}" y="${ry + 80*PX + 30}" text-anchor="middle" style="font:500 9px Inter;fill:var(--txt3)">mm</text>`;
      $("#ge-ruler").innerHTML = r;
    }
    function draw(){ drawGel(); drawPip(); drawRuler(); }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ if(tg.closest("#ge-pip")) return { k:"p", x:pip.x, y:pip.y, p0:p }; if(tg.closest("#ge-ruler")) return { k:"r", x:rx, y:ry, p0:p }; return null; },
      move(h, p){
        if(h.k === "p"){ pip.x = Kit.clamp(h.x + p.x - h.p0.x, 30, 940); pip.y = Kit.clamp(h.y + p.y - h.p0.y, 70, 500); drawPip(); }
        else { rx = Kit.clamp(h.x + p.x - h.p0.x, 80, 900); ry = Kit.clamp(h.y + p.y - h.p0.y, 40, 120); drawRuler(); }
      },
      end(h){
        if(h.k !== "p") return;
        const ti = TUBES.findIndex((t, i) => Math.abs(pip.x - TX(i)) < 16 && pip.y > 396 && pip.y < 465);
        if(ti >= 0){ pip.load = TUBES[ti].k; ctx.toast("Took up " + TUBES[ti].name + " DNA (fresh tip)"); drawPip(); return; }
        const wi = [0, 1, 2, 3, 4, 5].findIndex(i => Math.abs(pip.x - LX(i)) < 18 && pip.y > WY - 30 && pip.y < WY + 12);
        if(wi >= 0){
          if(!pip.load) return ctx.toast("The tip is empty — take up a sample first");
          if(P > 0) return ctx.toast("This gel has been run — start a new gel");
          if(lanes[wi]) return ctx.toast("That well is already loaded");
          lanes[wi] = pip.load; pip.load = null;
          if(lanes.includes("L")) ctx.step("ladder");
          if(["CS", "S1", "S2", "S3"].every(k => lanes.includes(k))) ctx.step("samples");
          pip.x = 870; pip.y = 375; draw(); return;
        }
        if(pip.load && pip.x > 85 && pip.x < 495 && pip.y > 84 && pip.y < 470) ctx.toast("Release the sample into a well, not onto the gel");
      }
    });
    ctx.frame(dt => {
      if(!running) return;
      const sim = dt*5; Tm += sim; P += V/100*1.2*sim;
      if(orient === "anode" && P > 3 && lanes.some(Boolean) && !seen.anode){ seen.anode = true; ctx.toast("The DNA and dye moved towards the anode — out of the wells and into the buffer"); }
      drawGel();
    });
    const oSeg = ctx.seg({ label:"Gel orientation", value:"cathode", options:[["cathode","Wells at the cathode (−)"],["anode","Wells at the anode (+)"]], onChange(v){ if(P > 0){ oSeg.set(orient); return ctx.toast("Start a new gel to change this"); } orient = v; drawGel(); } });
    ctx.slider({ label:"Voltage", min:50, max:150, step:10, value:100, unit:"V", onInput(v){ V = v; drawGel(); } });
    const runBtns = ctx.buttons([{ label:"Run", primary:true, onClick(){
      if(stained) return ctx.toast("Already stained — start a new gel");
      if(!running && !lanes.some(Boolean)) return ctx.toast("Load some wells first");
      running = !running; runBtns[0].textContent = running ? "Stop" : "Run";
      if(!running && P > 0 && orient === "cathode") ctx.step("run");
      drawGel();
    } }, { label:"Stain", onClick(){
      if(running) return ctx.toast("Switch off the power pack first");
      if(P === 0) return ctx.toast("Run the gel first");
      if(stained) return ctx.toast("Already stained");
      stained = true; ctx.step("stain");
      if(orient === "anode"){ seen.anode = true; ctx.toast("No bands — the DNA moved towards the anode and left through the top of the wells"); }
      else if(P*DYE > GL){ seen.runoff = true; ctx.toast("The dye front and the smallest fragments ran off the end of the gel"); }
      if(seen.anode && seen.runoff) ctx.complete("faults");
      fillBands(); drawGel();
    } }, { label:"New gel", onClick(){
      running = false; runBtns[0].textContent = "Run"; lanes = Array(6).fill(null); P = 0; Tm = 0; stained = false; meas = {}; ctx.resetSteps(); fillBands(); rd.clear(); aSize.clear(); draw();
    } }]);
    const bandSel = ctx.select({ label:"Band to measure", value:"", options:[["", "— stain the gel first —"]], onChange(){ rd.clear(); aSize.clear(); } });
    function bands(){
      if(!stained || orient === "anode") return [];
      const out = [];
      if(lanes.includes("L")) LADDER.forEach(b => { if(P*f(b) <= GL) out.push(["L:" + b, "Ladder " + b.toLocaleString() + " bp"]); });
      if(lanes.includes("CS")) CS.forEach((b, i) => { if(P*f(b) <= GL) out.push(["CS:" + i, "Crime scene band " + (i + 1) + (i === 0 ? " (top)" : "")]); });
      return out;
    }
    function fillBands(){ const b = bands(); bandSel.input.innerHTML = (b.length ? b : [["", stained ? "— no bands to measure —" : "— stain the gel first —"]]).map(([v, l]) => `<option value="${v}">${l}</option>`).join(""); }
    const trueD = key => { if(!key) return null; const [k, v] = key.split(":"); return P*f(k === "L" ? +v : CS[+v]); };
    const rd = Kit.reading(ctx, "Distance from the well / mm", "e.g. 34", () => trueD(bandSel.get()), 1, v => {
      const key = bandSel.get(), [k, b] = key.split(":");
      if(meas[key] !== undefined) return ctx.toast("Already measured");
      meas[key] = v;
      if(k === "L") ctx.record({ lane:"Ladder", band:b + " bp", size:+b, d:v, logs:Math.log10(+b) });
      else ctx.record({ lane:"Crime scene", band:"Band " + (+b + 1), size:null, d:v, logs:null });
      const nL = Object.keys(meas).filter(x => x.startsWith("L:")).length;
      if(nL >= 4){ ctx.step("measure"); ctx.complete("curve"); }
      rd.clear();
    });
    const aSize = Kit.answer(ctx, "Size of the selected crime-scene band / bp (from your curve)", "e.g. 2500", v => {
      const key = bandSel.get(); if(!key || !key.startsWith("CS:")) return [false, "Choose a crime-scene band in the list above."];
      if(meas[key] === undefined) return [false, "Measure this band’s distance first."];
      const pts = Object.keys(meas).filter(x => x.startsWith("L:")).map(x => [meas[x], Math.log10(+x.split(":")[1])]);
      if(pts.length < 4) return [false, "Measure at least four ladder bands to draw the standard curve."];
      const fit = ctx.linFit(pts), pred = Math.pow(10, fit.m*meas[key] + fit.c);
      if(Math.abs(v - pred)/pred <= .1){
        ctx.record({ lane:"Crime scene (estimate)", band:"Band " + (+key.split(":")[1] + 1), size:v, d:meas[key], logs:Math.log10(v) });
        ctx.step("size"); ctx.complete("size");
        return [true, `Good: the curve gives about ${Math.round(pred/10)*10} bp (log size ${(fit.m*meas[key] + fit.c).toFixed(2)}). Actual length ${CS[+key.split(":")[1]].toLocaleString()} bp.`];
      }
      return [false, "On the graph, read log₁₀(size) at this band’s distance from the best-fit line, then size = 10^(log size)."];
    });
    ctx.html(`<div class="ctl"><div class="lbl"><span>Which suspect matches the crime scene?</span></div></div>`);
    ctx.buttons([1, 2, 3].map(k => ({ label:"Suspect " + k, onClick(){ match(k); } })).concat([{ label:"None", onClick(){ match(0); } }]));
    const msg = msgBox(ctx, "ge-msg");
    function match(k){
      if(!stained || orient === "anode") return ctx.toast("Run and stain a gel first");
      if(!["CS", "S1", "S2", "S3"].every(x => lanes.includes(x))) return ctx.toast("Load the crime-scene sample and all three suspects");
      if(CS.some(b => P*f(b) > GL)) return ctx.toast("Some bands ran off the gel — run a new gel");
      if(k === MATCH){ ctx.complete("match"); say(msg, true, `Suspect ${k}: every band lines up with a crime-scene band at the same distance, so the fragments are the same lengths. ${[1, 2, 3].filter(x => x !== k).map(x => "Suspect " + x).join(" and ")} share at most one band, which is not enough for a match.`); }
      else say(msg, false, k === 0 ? "Look again — compare every band across the lanes." : `Suspect ${k} shares at most one band with the crime-scene DNA. A match needs all the bands to line up.`);
    }
    drawFixed(); fillBands(); draw();
  }
});

/* ───────────── GLUCOSE TEST STRIPS & BIOSENSORS ───────────── */
Lab.register({
  id:"glucosestrip", subject:"biology", level:["a"], topic:"Homeostasis · Testing for glucose", interactive:true,
  title:"Glucose test strips & biosensors",
  summary:"Dip test strips containing glucose oxidase and peroxidase into standard glucose solutions to make your own colour chart, then estimate the glucose concentration of urine samples and compare with a biosensor.",
  aim:"Use test strips containing glucose oxidase and peroxidase to make a colour chart from standard glucose solutions and estimate the glucose concentration of urine samples, and compare this with a biosensor.",
  variables:{ iv:"Glucose concentration of the standard solution (mmol dm⁻³)", dv:"Colour of the test pad after 30 s", cv:["Read every strip at the same time after dipping (30 s)","Same brand and batch of strips","Same temperature and lighting"] },
  stageTitle:"Bench", controlsTitle:"Test & estimate",
  thumb:`<svg viewBox="0 0 300 140">${["#5EC4C9","#86C45A","#A3A23A","#94702C","#6B3E1E"].map((c, i) => `<rect x="${30 + i*50}" y="20" width="36" height="36" rx="5" fill="${c}"/>`).join("")}<rect x="140" y="66" width="14" height="70" fill="#F8FAFC" stroke="#94A3B8"/><rect x="140" y="120" width="14" height="14" fill="#A3A23A"/></svg>`,
  challenges:[
    { id:"chart",  title:"Colour chart", text:"Read strips for all six standards at 30 s to complete your colour chart." },
    { id:"unknown", title:"Estimate", text:"Estimate the glucose concentration of a urine sample from your chart." },
    { id:"bio",    title:"Biosensor", text:"Measure a urine sample with the biosensor and compare." },
    { id:"timing", title:"Timing matters", text:"Read a strip much too early or too late and see the effect." }
  ],
  columns:[{key:"sample",label:"Sample"},{key:"method",label:"Method"},{key:"t",label:"Time read / s",dp:0},{key:"colour",label:"Pad colour"},{key:"est",label:"Glucose / mmol dm⁻³"}],
  questions:[
    { q:"Explain how the test pad produces a colour.",
      a:"Glucose oxidase catalyses the oxidation of glucose by oxygen to gluconolactone (gluconic acid) and hydrogen peroxide. Peroxidase then catalyses the reaction of hydrogen peroxide with a colourless chromogen (hydrogen donor), which is oxidised to a coloured compound. More glucose gives more hydrogen peroxide and a darker colour." },
    { q:"Why must every strip be read at the same time after dipping?",
      a:"The colour develops over time as the enzyme reactions continue. Reading too early gives a paler colour (underestimate); reading too late gives a darker colour (overestimate). Reading every strip at the stated time makes them comparable with the chart." },
    { q:"Why is this method described as semi-quantitative?",
      a:"The colour is matched by eye to a limited number of standards, so the result is a range (e.g. between 5 and 10 mmol dm⁻³) rather than an exact value. Judging colour is subjective and depends on lighting and colour vision." },
    { q:"Why is glucose in the urine a sign of diabetes?",
      a:"Normally all glucose filtered in the kidney is reabsorbed in the proximal convoluted tubule. When blood glucose is very high (untreated diabetes), the carrier proteins are saturated, so some glucose stays in the filtrate and appears in the urine." },
    { q:"How does a glucose biosensor work and why is it better?",
      a:"Glucose oxidase is immobilised on an electrode. The reaction produces hydrogen peroxide (or transfers electrons), giving a small electric current proportional to the glucose concentration, shown as a digital reading. It is quick, quantitative, objective, needs only a drop of blood, and the reading is continuous and precise." },
    { q:"Suggest how the colour chart could be made more precise.",
      a:"Use more standards with smaller intervals in the range of interest; use a colorimeter or a phone camera app to measure colour instead of judging by eye; read in standard white light; repeat each standard and use fresh strips from one batch." }
  ],
  setup(ctx){
    const STD = [0, 2, 5, 10, 20, 40], UR = { A:Kit.round(rnd(3, 9), 1), B:Kit.round(rnd(12, 32), 1), C:0 };
    const SAMPLES = STD.map((c, i) => ({ k:"s" + c, name:c + " mmol dm⁻³", conc:c, std:true, x:50 + i*60 })).concat(["A", "B", "C"].map((k, i) => ({ k, name:"Urine " + k, conc:UR[k], std:false, x:430 + i*60 })));
    const sat = c => Math.min(1, c/(c + 11)*1.27);
    const STOPS = [[0, [94, 196, 201]], [.25, [134, 196, 90]], [.5, [163, 162, 58]], [.75, [148, 112, 44]], [1, [107, 62, 30]]];
    function colour(i){ i = Kit.clamp(i, 0, 1); for(let k = 1; k < STOPS.length; k++) if(i <= STOPS[k][0]){ const [a, ca] = STOPS[k - 1], [b, cb] = STOPS[k], f = (i - a)/(b - a); return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v)*f)).join(",")})`; } return "rgb(107,62,30)"; }
    const cname = i => i < .08 ? "turquoise (negative)" : i < .3 ? "green" : i < .55 ? "olive green" : i < .8 ? "olive brown" : "brown";
    const idxAt = (c, t) => { const base = sat(c), dev = Math.pow(Math.min(t, 30)/30, .8); return Math.min(1, base*dev*(t > 30 ? 1 + (t - 30)/80 : 1)); };
    let strip = { x:860, y:322, st:"pot", s:null, t:0 }, chart = {}, last = null, bioS = "A", bioVal = null, seenTiming = false, estOK = new Set();
    ctx.stage.innerHTML = `<svg viewBox="0 0 960 500" class="kb" id="gs-svg"><defs>${Kit.DEFS}</defs>${Kit.bench(960, 470)}
      <g id="gs-fixed"></g><g id="gs-chart"></g><g id="gs-bio"></g><g id="gs-strip"></g><g id="gs-pot"></g><text x="24" y="30" class="k-status" id="gs-status"></text></svg>`;
    Kit.style(ctx);
    const svg = ctx.stage.querySelector("#gs-svg"), $ = s => svg.querySelector(s);
    let fx = `<g transform="translate(24 52)"><rect width="570" height="116" rx="10" fill="var(--bg-card)" stroke="var(--brd2)"/>
      <text x="16" y="24" class="k-tag">On the test pad</text>
      <text x="16" y="50" class="k-lbl">glucose + oxygen</text><text x="222" y="50" class="k-hint">— glucose oxidase →</text><text x="372" y="50" class="k-lbl">gluconic acid + hydrogen peroxide</text>
      <text x="16" y="80" class="k-lbl">hydrogen peroxide + chromogen</text><text x="222" y="80" class="k-hint">— peroxidase →</text><text x="372" y="80" class="k-lbl">coloured compound + water</text>
      <text x="16" y="104" class="k-lbl">More glucose → more H₂O₂ → darker colour. Read at 30 s.</text></g>`;
    fx += `<text x="200" y="318" text-anchor="middle" class="k-tag">Glucose standards / mmol dm⁻³</text><text x="490" y="318" text-anchor="middle" class="k-tag">Urine samples</text>`;
    SAMPLES.forEach(s => { fx += `<path d="M${s.x - 17} 330h34v110a17 17 0 0 1 -34 0z" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.4"/><path d="M${s.x - 15} 372h30v68a15 15 0 0 1 -30 0z" fill="${s.std ? "#DCEBF7" : "#F2D45C"}" opacity="${s.std ? .7 : .8}"/>
      <text x="${s.x}" y="${s.std ? 488 : 488}" text-anchor="middle" class="k-numb">${s.std ? s.conc : s.k}</text>`; });
    fx += `<text x="660" y="402" class="k-lbl">reading position</text><rect x="640" y="210" width="110" height="170" rx="8" fill="none" stroke="var(--brd2)" stroke-dasharray="4 3"/>`;
    $("#gs-fixed").innerHTML = fx;
    $("#gs-pot").innerHTML = `<rect x="830" y="250" width="60" height="100" rx="8" fill="#334155" stroke="#1E293B"/><text x="860" y="300" text-anchor="middle" style="font:700 9px Inter;fill:#E5E7EB">TEST</text><text x="860" y="312" text-anchor="middle" style="font:700 9px Inter;fill:#E5E7EB">STRIPS</text>`;
    function drawChart(){
      let s = `<rect x="620" y="44" width="320" height="140" rx="10" fill="var(--bg-card)" stroke="var(--brd2)"/><text x="634" y="64" class="k-tag">Your colour chart (read at 30 s)</text>`;
      STD.forEach((c, i) => { const x = 640 + i*48, d = chart[c]; s += `<rect x="${x}" y="76" width="34" height="34" rx="5" fill="${d !== undefined ? colour(d) : "none"}" stroke="var(--brd2)" stroke-dasharray="${d !== undefined ? "" : "3 3"}"/><text x="${x + 17}" y="126" text-anchor="middle" class="k-num">${c}</text>`; });
      s += `<text x="634" y="152" class="k-lbl">Last urine strip:</text>${last ? `<rect x="740" y="138" width="34" height="34" rx="5" fill="${colour(last.idx)}" stroke="var(--brd2)"/><text x="784" y="160" class="k-lbl">Urine ${last.k} at ${last.t} s</text>` : `<text x="740" y="152" class="k-lbl">—</text>`}`;
      $("#gs-chart").innerHTML = s;
    }
    function drawBio(){
      $("#gs-bio").innerHTML = `<rect x="770" y="380" width="170" height="80" rx="12" fill="#1F2937" stroke="#4B5563"/><rect x="782" y="392" width="146" height="36" rx="5" fill="#132A1F"/>
        <text x="918" y="418" text-anchor="end" class="k-lcd">${bioVal === null ? "---" : bioVal.toFixed(1)}</text><text x="855" y="448" text-anchor="middle" style="font:600 9px Inter;fill:#E5E7EB">GLUCOSE BIOSENSOR · mmol dm⁻³</text>`;
    }
    function drawStrip(){
      const { x, y } = strip, smp = strip.s ? SAMPLES.find(s => s.k === strip.s) : null, idx = smp ? idxAt(smp.conc, strip.t) : 0;
      let s = `<rect x="${x - 7}" y="${y - 128}" width="14" height="128" rx="2" fill="#F8FAFC" stroke="#94A3B8"/><rect x="${x - 6}" y="${y - 14}" width="12" height="12" rx="1.5" fill="${colour(idx)}" stroke="#64748B" stroke-width=".6"/>`;
      if(strip.st === "wet") s += `<text x="${x + 22}" y="${y - 70}" class="k-read">${Math.floor(strip.t)} s</text><text x="${x + 22}" y="${y - 52}" class="k-lbl">${smp.std ? smp.conc + " std" : "urine " + smp.k}</text>`;
      $("#gs-strip").innerHTML = s;
      $("#gs-status").textContent = strip.st === "wet" ? "Timing… read the strip at 30 s" : "Drag a test strip from the pot and dip its pad into a solution";
      ctx.readout([["Strip", strip.st === "wet" ? "developing" : "new strip ready"], ["Chart", Object.keys(chart).length + "/6 standards"]]);
    }
    function draw(){ drawChart(); drawBio(); drawStrip(); }
    Kit.dragger(ctx, svg, {
      hit(tg, p){ return tg.closest("#gs-strip") && strip.st !== "wet" ? { x:strip.x, y:strip.y, p0:p } : null; },
      move(h, p){ strip.x = Kit.clamp(h.x + p.x - h.p0.x, 20, 940); strip.y = Kit.clamp(h.y + p.y - h.p0.y, 140, 470); strip.st = "held"; drawStrip(); },
      end(){
        const smp = SAMPLES.find(s => Math.abs(strip.x - s.x) < 16 && strip.y > 380 && strip.y < 460);
        if(smp){ strip.st = "wet"; strip.s = smp.k; strip.t = 0; strip.x = 695; strip.y = 360; ctx.toast("Dipped briefly in " + (smp.std ? smp.conc + " mmol dm⁻³ standard" : "urine " + smp.k) + " — timing started"); }
        else { if(Math.hypot(strip.x - 860, strip.y - 322) > 30) ctx.toast("Dip the pad into the liquid in a tube"); strip.st = "pot"; strip.x = 860; strip.y = 322; }
        drawStrip();
      }
    });
    ctx.frame(dt => { if(strip.st !== "wet") return; strip.t += dt*3; if(strip.t > 150) strip.t = 150; drawStrip(); });
    ctx.html(`<div class="ctl"><div class="hint">The bench clock runs 3× faster than real time.</div></div>`);
    ctx.buttons([{ label:"Read the strip now", primary:true, block:true, onClick(){
      if(strip.st !== "wet") return ctx.toast("Dip a strip first");
      const smp = SAMPLES.find(s => s.k === strip.s), t = Math.floor(strip.t), idx = idxAt(smp.conc, strip.t), ok = t >= 25 && t <= 35;
      ctx.record({ sample:smp.std ? "Standard " + smp.conc : "Urine " + smp.k, method:"Test strip", t, colour:cname(idx), est:smp.std ? String(smp.conc) : "?" });
      if(!ok){ seenTiming = true; ctx.complete("timing"); ctx.toast(t < 25 ? "Read too early — the colour has not finished developing" : "Read too late — the colour has kept darkening"); }
      if(smp.std && ok){ chart[smp.conc] = idx; if(STD.every(c => chart[c] !== undefined)) ctx.complete("chart"); }
      if(!smp.std){ last = { k:smp.k, idx, t, ok }; }
      strip = { x:860, y:322, st:"pot", s:null, t:0 }; draw();
    } }]);
    const uSel = ctx.seg({ label:"Urine sample", value:"A", options:[["A","A"],["B","B"],["C","C"]], onChange(v){ bioS = v; aEst.clear(); bioVal = null; rdB.clear(); drawBio(); } });
    const aEst = Kit.answer(ctx, "Estimated glucose concentration / mmol dm⁻³", "e.g. 7", v => {
      if(!STD.every(c => chart[c] !== undefined)) return [false, "Complete your colour chart first (all six standards read at 30 s)."];
      if(!last || last.k !== bioS || !last.ok) return [false, `Read a strip for urine ${bioS} at 30 s, so it is the last urine strip on the chart.`];
      const c = UR[bioS]; let lo = 0, hi = 0; for(let i = 0; i < STD.length - 1; i++) if(c >= STD[i] && c <= STD[i + 1]){ lo = STD[i]; hi = STD[i + 1]; }
      const ok = c === 0 ? v <= .5 : v >= lo*.9 && v <= hi*1.1;
      if(ok){ estOK.add(bioS); ctx.complete("unknown"); return [true, c === 0 ? "Correct: negative — no glucose detected, as in normal urine." : `Good: the pad lies between the ${lo} and ${hi} mmol dm⁻³ standards, so ${v} is a fair estimate. This is only semi-quantitative: the answer is a range.`]; }
      return [false, "Compare the urine pad with your chart: which two standards does it fall between?"];
    });
    ctx.buttons([{ label:"Test this sample with the biosensor", onClick(){ bioVal = Math.max(0, UR[bioS]*(1 + .015*gN())); bioVal = Kit.round(bioVal, 1); rdB.clear(); drawBio(); } }]);
    const rdB = Kit.reading(ctx, "Biosensor reading / mmol dm⁻³", "e.g. 6.8", () => bioVal, .05, v => {
      ctx.record({ sample:"Urine " + bioS, method:"Biosensor", t:null, colour:"—", est:v.toFixed(1) });
      ctx.complete("bio"); ctx.toast("Biosensor: quantitative, one reading to 0.1 mmol dm⁻³");
    });
    draw();
  }
});
})();

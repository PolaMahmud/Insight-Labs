"use strict";
/* ══════════════════════════════════════════════════════════════════
   CHEMKIT — shared pieces for the AS Chemistry (9701 Paper 3) benches
   ChemKit.lens(o)     magnifier on a vertical scale (burette, thermometer,
                       measuring cylinder) the student must read
   ChemKit.balance()   two-decimal-place top-pan balance
   ChemKit.tube(o)     test tube showing a solution, precipitate, bubbles,
                       an organic layer, a silver mirror or fumes
   ChemKit.flask / beaker paths, colour helpers, uncertainty helpers
══════════════════════════════════════════════════════════════════ */
const ChemKit = (function(){
  const rgba = (c, a) => c ? `rgba(${c[0]},${c[1]},${c[2]},${a === undefined ? (c[3] === undefined ? .7 : c[3]) : a})` : "rgba(210,225,240,.28)";
  const mix = (a, b, f) => { f = Math.max(0, Math.min(1, f)); return a.map((x, i) => Math.round(x + ((b[i] === undefined ? x : b[i]) - x)*f)); };

  /* A circular magnifier centred on `value` of a vertical scale.
     down:true  → values increase downwards (burette); false → upwards (thermometer, cylinder)
     liquid sits below the reading line; tube is the half-width of the glass */
  function lens(o){
    const r = o.r || 70, S = o.S, minor = o.minor, major = o.major, down = o.down !== false;
    const tube = o.tube || 26, dir = down ? 1 : -1, value = o.value;
    const span = r/S + minor, k0 = Math.ceil((value - span)/minor - 1e-9), k1 = Math.floor((value + span)/minor + 1e-9);
    const per = Math.round(major/minor), half = o.half ? Math.round(o.half/minor) : 0;
    let s = `<defs><clipPath id="${o.id}-c"><circle r="${r}"/></clipPath></defs><g transform="translate(${o.cx} ${o.cy})">
      <circle r="${r}" fill="#F4F7FB"/><g clip-path="url(#${o.id}-c)">`;
    if(o.liquid){
      s += o.flat ? `<rect x="${-tube}" y="0" width="${tube*2}" height="${r}" fill="${o.liquid}"/>`
        : `<path d="M${-tube} -9 Q0 9 ${tube} -9 V${r} H${-tube} Z" fill="${o.liquid}"/>`;
    }
    s += `<line x1="${-tube}" y1="${-r}" x2="${-tube}" y2="${r}" stroke="#9AA3B2" stroke-width="2"/><line x1="${tube}" y1="${-r}" x2="${tube}" y2="${r}" stroke="#9AA3B2" stroke-width="2"/>`;
    for(let k = k0; k <= k1; k++){
      const v = k*minor, y = dir*(v - value)*S, big = k % per === 0, mid = half && k % half === 0;
      s += `<line x1="${-tube}" y1="${y}" x2="${-tube + (big ? 30 : mid ? 21 : 13)}" y2="${y}" stroke="#334155" stroke-width="${big ? 1.6 : 1}"/>`;
      if(big) s += `<text x="${-tube + 34}" y="${y + 4.5}" style="font:600 13px 'JetBrains Mono',monospace;fill:#334155">${o.fmt ? o.fmt(v) : Math.round(v)}</text>`;
    }
    s += `</g><circle r="${r}" fill="none" stroke="var(--accent)" stroke-width="3"/>${o.label ? `<text y="${r + 18}" text-anchor="middle" class="k-lbl">${o.label}</text>` : ""}</g>`;
    return s;
  }

  function balance(x, y, mass, label){
    return `<g transform="translate(${x} ${y})"><rect x="0" y="30" width="170" height="44" rx="8" fill="#2B3240" stroke="#4B5563"/>
      <rect x="22" y="18" width="126" height="14" rx="3" fill="url(#k-metal)"/>
      <rect x="40" y="42" width="90" height="24" rx="4" fill="#132A1F"/><text x="124" y="60" text-anchor="end" class="k-lcd" style="font-size:16px">${mass === null ? "—" : mass.toFixed(2)}</text>
      <text x="136" y="60" style="font:600 9px Inter;fill:#5FBF8A">g</text>${label ? `<text x="85" y="92" text-anchor="middle" class="k-lbl">${label}</text>` : ""}</g>`;
  }

  const FLASK = (cx, by, s) => { s = s || 1; const n = 14*s, w = 62*s, h = 96*s;
    return `M${cx - n} ${by - h} V${by - h*.68} L${cx - w} ${by - 8*s} Q${cx - w - 3*s} ${by} ${cx - w + 7*s} ${by} H${cx + w - 7*s} Q${cx + w + 3*s} ${by} ${cx + w} ${by - 8*s} L${cx + n} ${by - h*.68} V${by - h}`; };
  const BEAKER = (x, by, w, h) => `M${x - 3} ${by - h - 3} L${x} ${by - h} V${by - 6} Q${x} ${by} ${x + 6} ${by} H${x + w - 6} Q${x + w} ${by} ${x + w} ${by - 6} V${by - h} L${x + w + 3} ${by - h - 3}`;

  /* test tube with what the student should see */
  function tube(o){
    const x = o.x, y = o.y, w = 34, h = 150, id = o.id;
    const path = `M${x} ${y} V${y + h} A${w/2} ${w/2} 0 0 0 ${x + w} ${y + h} V${y}`;
    const top = y + h*(1 - (o.fill || .55));
    let s = `<defs><clipPath id="${id}-c"><path d="${path} Z"/></clipPath></defs><g clip-path="url(#${id}-c)">`;
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h + w}" fill="${rgba(o.sol, o.solA === undefined ? .62 : o.solA)}"/>`;
    if(o.layer) s += `<rect x="${x}" y="${top - 22}" width="${w}" height="22" fill="${rgba(o.layer, .75)}"/><line x1="${x}" y1="${top}" x2="${x + w}" y2="${top}" stroke="rgba(0,0,0,.25)"/>`;
    if(o.ppt){
      const n = o.pptAmount === undefined ? 60 : Math.round(60*o.pptAmount);
      for(let i = 0; i < n; i++){ const r = ((i*73) % 97)/97, q = ((i*41) % 89)/89;
        s += `<circle cx="${x + 4 + q*(w - 8)}" cy="${y + h + w/2 - 6 - Math.pow(r, 1.8)*(o.suspend ? (y + h - top) : 34)}" r="${1.3 + r*1.9}" fill="${rgba(o.ppt, 1)}" stroke="rgba(0,0,0,.18)" stroke-width=".4"/>`; }
    }
    if(o.mirror) s += `<rect x="${x}" y="${top}" width="5" height="${h + w}" fill="url(#k-metal)"/><rect x="${x + w - 5}" y="${top}" width="5" height="${h + w}" fill="url(#k-metal)"/>`;
    if(o.bubbles) for(let i = 0; i < 14; i++){ const r = ((i*53) % 71)/71, q = ((i*29) % 61)/61;
      s += `<circle cx="${x + 5 + q*(w - 10)}" cy="${top + 8 + r*(y + h - top)}" r="${1.5 + r*2.2}" fill="none" stroke="var(--txt2)" stroke-width=".9"><animate attributeName="cy" from="${top + 8 + r*(y + h - top)}" to="${top + 2}" dur="${1 + r}s" repeatCount="indefinite"/></circle>`; }
    s += `</g><path d="${path}" fill="url(#k-glass)" stroke="var(--txt2)" stroke-width="1.5"/>`;
    if(o.fumes) for(let i = 0; i < 3; i++) s += `<path d="M${x + 8 + i*9} ${y - 4} q-8 -16 0 -30 q8 -14 0 -28" fill="none" stroke="${rgba(o.fumes, .65)}" stroke-width="5" stroke-linecap="round" opacity=".8"><animate attributeName="opacity" values=".2;.9;.2" dur="${1.6 + i*.3}s" repeatCount="indefinite"/></path>`;
    if(o.label) s += `<text x="${x + w/2}" y="${y + h + w/2 + 22}" text-anchor="middle" class="k-tag">${o.label}</text>`;
    return s;
  }

  /* split text into lines of at most n characters, at spaces */
  function wrap(text, n){
    const out = [""]; String(text).split(" ").forEach(w => { const l = out[out.length - 1]; if(l && (l + " " + w).length > n) out.push(w); else out[out.length - 1] = l ? l + " " + w : w; });
    return out;
  }
  /* <text> lines for an info card */
  const lines = (text, n, x, y, dy, cls) => wrap(text, n).map((l, i) => `<text x="${x}" y="${y + i*dy}" class="${cls || "k-lbl"}">${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</text>`).join("");

  /* half the smallest division per reading; difference of two readings doubles it */
  const pct = (abs, val) => Math.abs(abs/val*100);

  return { rgba, mix, wrap, lines, lens, balance, FLASK, BEAKER, tube, pct };
})();

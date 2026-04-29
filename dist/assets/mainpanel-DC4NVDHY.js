import"./modulepreload-polyfill-B5Qt9EMX.js";import{G as u,b as h,p as v,S as y,c as q,d as w}from"./catalog-BootiB2w.js";const $=y;let n=null;const E=new URLSearchParams(window.location.search).get("creator")==="1";function C(){let e=document.getElementById("grudge-equipment-overlay");return e||(e=document.createElement("div"),e.id="grudge-equipment-overlay",document.body.appendChild(e),S()),e}function S(){if(document.getElementById("grudge-equipment-overlay-style"))return;const e=`
    #grudge-equipment-overlay {
      position: fixed;
      top: 12px;
      right: 12px;
      width: 320px;
      max-height: calc(100vh - 24px);
      overflow-y: auto;
      background: linear-gradient(180deg, rgba(26,18,12,.96), rgba(10,7,5,.96));
      border: 1.5px solid #c9950a;
      border-radius: 10px;
      padding: 12px 14px;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      color: #f5e2c1;
      z-index: 50;
      box-shadow: 0 12px 36px rgba(0,0,0,.7);
    }
    #grudge-equipment-overlay h2 {
      font-family: "Cinzel", serif;
      font-size: 12px;
      letter-spacing: 1.6px;
      text-transform: uppercase;
      color: #d4a400;
      border-bottom: 1px solid #3a2a1a;
      padding-bottom: 4px;
      margin: 0 0 8px;
    }
    #grudge-equipment-overlay h3 {
      font-family: "Cinzel", serif;
      font-size: 10px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #c9950a;
      margin: 10px 0 4px;
    }
    .geo-slot-row {
      display: flex;
      align-items: center;
      gap: 4px;
      margin: 2px 0;
    }
    .geo-slot-name {
      width: 70px;
      color: #9b7d52;
      text-transform: uppercase;
      font-size: 10px;
    }
    .geo-btn {
      background: #0a0705;
      color: #f5e2c1;
      border: 1px solid #3a2a1a;
      border-radius: 3px;
      padding: 2px 7px;
      font-family: "JetBrains Mono", monospace;
      font-size: 10px;
      cursor: pointer;
    }
    .geo-btn:hover { border-color: #c9950a; }
    .geo-btn.equipped {
      background: #c9950a;
      color: #0a0705;
      border-color: #d4a400;
      font-weight: 700;
    }
    #grudge-equipment-overlay .geo-status {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed #3a2a1a;
      color: #6b5535;
      font-size: 10px;
      text-align: center;
    }
  `,r=document.createElement("style");r.id="grudge-equipment-overlay-style",r.textContent=e,document.head.appendChild(r)}function l(){const e=C(),r=n?.equipped??{},c={armor:[],weapons:[],shields:[],utility:[]};for(const t of $)c[t.group]?.push(t);const i=[],f=E?"Equip · Creator":"Equip · Mainpanel",m=n?`${n.raceId} · ${n.classId} · ${n.skinVariant}`:"Waiting for build…";i.push(`<h2>${f}</h2>`),i.push(`<div class="geo-status">${m}</div>`);for(const t of["armor","weapons","shields","utility"]){const a=c[t];if(!(!a||a.length===0)){i.push(`<h3>${w[t]}</h3>`);for(const o of a){const s=r[o.slot]??null,d=[];for(const p of o.variants){const x=s===p,b=o.noVariant?"✓":p;d.push(`<button class="geo-btn${x?" equipped":""}" data-slot="${o.slot}" data-variant="${p}">${b}</button>`)}d.push(`<button class="geo-btn" data-slot="${o.slot}" data-variant="">×</button>`),i.push(`<div class="geo-slot-row"><span class="geo-slot-name">${o.slot}</span>${d.join("")}</div>`)}}}e.innerHTML=i.join("");for(const t of Array.from(e.querySelectorAll(".geo-btn")))t.addEventListener("click",()=>{const a=t.dataset.slot,o=t.dataset.variant??"",s=o===""?null:o;n&&(s==null?delete n.equipped[a]:n.equipped[a]=s),q(a,s),l()})}function g(){window.parent&&window.parent!==window?u.initEmbedded():u.init(),h(e=>{n=e,l()}),l(),v()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>g()):g();
//# sourceMappingURL=mainpanel-DC4NVDHY.js.map

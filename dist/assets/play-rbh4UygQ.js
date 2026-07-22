const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/sdk-bootstrap-BgXdIwut.js","assets/catalog-CutVeamL.js","assets/three.core-CIfcZ10y.js","assets/three.module-wtWwtx49.js","assets/SkeletonUtils-BsEBkbV3.js","assets/GLTFLoader-BgOfuyaz.js","assets/FBXLoader-6TyEAAlZ.js","assets/DRACOLoader-D2apF66B.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{T as z}from"./three.module-wtWwtx49.js";import{au as de,av as H,aw as ee,M as W,ax as V,ay as ue,a7 as te,v as ge,az as ae,aj as pe,$ as fe,aA as me}from"./three.core-CIfcZ10y.js";import"./sdk-bootstrap-BgXdIwut.js";import"./catalog-CutVeamL.js";const he="modulepreload",be=function(a){return"/"+a},oe={},N=function(d,c,e){let t=Promise.resolve();if(c&&c.length>0){let S=function(k){return Promise.all(k.map(v=>Promise.resolve(v).then(L=>({status:"fulfilled",value:L}),L=>({status:"rejected",reason:L}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),g=o?.nonce||o?.getAttribute("nonce");t=S(c.map(k=>{if(k=be(k),k in oe)return;oe[k]=!0;const v=k.endsWith(".css"),L=v?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${k}"]${L}`))return;const f=document.createElement("link");if(f.rel=v?"stylesheet":he,v||(f.as="script"),f.crossOrigin="",f.href=k,g&&f.setAttribute("nonce",g),document.head.appendChild(f),v)return new Promise((E,i)=>{f.addEventListener("load",E),f.addEventListener("error",()=>i(new Error(`Unable to preload CSS for ${k}`)))})}))}function l(o){const g=new Event("vite:preloadError",{cancelable:!0});if(g.payload=o,window.dispatchEvent(g),!g.defaultPrevented)throw o}return t.then(o=>{for(const g of o||[])g.status==="rejected"&&l(g.reason);return d().catch(l)})};(function(a){const d=[{slot:"body",re:/^Units_Body_([A-Z])$/i,group:"armor"},{slot:"arms",re:/^Units_Arms_([A-Z])$/i,group:"armor"},{slot:"legs",re:/^Units_Legs_([A-Z])$/i,group:"armor"},{slot:"head",re:/^Units_head_([A-Z])$/i,group:"armor"},{slot:"shoulders",re:/^Units_shoulderpads_([A-Z])$/i,group:"armor"},{slot:"axe",re:/(?:Units_|weapon_)axe_([A-Z])$/i,group:"weapon_r"},{slot:"hammer",re:/(?:Units_|weapon_)hammer_([A-Z])$/i,group:"weapon_r"},{slot:"sword",re:/(?:Units_|weapon_)[Ss]word_([A-Z])$/i,group:"weapon_r"},{slot:"pick",re:/(?:Units_|weapon_)pick$/i,group:"weapon_r",noVariant:!0},{slot:"spear",re:/(?:Units_|weapon_)[Ss]pear$/i,group:"weapon_r",noVariant:!0},{slot:"bow",re:/(?:Units_|weapon_)[Bb]ow$/i,group:"weapon_l",noVariant:!0},{slot:"staff",re:/(?:Units_|weapon_)staff_([A-Z])$/i,group:"weapon_l"},{slot:"shield",re:/(?:Units_|)[Ss]hield_([A-Z])$/i,group:"shield"},{slot:"bag",re:/(?:Xtra_|Units_)bag$/i,group:"utility",noVariant:!0},{slot:"wood",re:/(?:Xtra_|Units_)wood$/i,group:"utility",noVariant:!0},{slot:"quiver",re:/(?:Xtra_|Units_)quiver$/i,group:"utility",noVariant:!0}];function c(e){this.prefix=e||"",this.slots={},this.equipped={},this._allMeshes=[],this._parts={},this.bones={}}c.prototype.catalog=function(e){this.root=e,this.slots={},this._allMeshes=[],this._parts={},this.bones.rightHand=e.getObjectByName("R_hand_container")||null,this.bones.leftHand=e.getObjectByName("L_hand_container")||null,this.bones.leftShield=e.getObjectByName("L_shield_container")||null,this.bones.bag=e.getObjectByName("Bone_bag")||null,this.bones.wood=e.getObjectByName("Bone_wood")||null,this.bones.quiver=e.getObjectByName("Quiver_container")||null;const t=this;return e.traverse(function(l){if(!l.isMesh&&!l.isSkinnedMesh)return;const o=l.name||"",g=o.indexOf(t.prefix)===0?o.slice(t.prefix.length):o;let S=!1;for(let k=0;k<d.length;k++){const v=d[k],L=g.match(v.re);if(!L)continue;const f=v.noVariant?"_default":(L[1]||L[2]||"_default").toUpperCase();t.slots[v.slot]||(t.slots[v.slot]={}),t.slots[v.slot][f]=l,l.userData.equipSlot=v.slot,l.userData.equipVariant=f,l.userData.equipGroup=v.group,t._allMeshes.push(l),l.visible=!1,S=!0;break}!S&&o&&(t._parts[o]=l,l.userData.equipPart=o)}),this._autoEquipDefaults(),this.getSlotSummary()},c.prototype._autoEquipDefaults=function(){const e=["body","arms","legs","head"];for(let t=0;t<e.length;t++){const l=this.slots[e[t]];if(!l)continue;const o=Object.keys(l).sort();o[0]&&this.equip(e[t],o[0])}},c.prototype.equip=function(e,t){const l=this.slots[e];if(!l)return!1;const o=Object.entries(l);for(let g=0;g<o.length;g++){const S=o[g][0],k=o[g][1];k.visible=S===t}return this.equipped[e]=t,!0},c.prototype.unequip=function(e){const t=this.slots[e];if(!t)return;const l=Object.values(t);for(let o=0;o<l.length;o++)l[o].visible=!1;delete this.equipped[e]},c.prototype.toggle=function(e,t){this.equipped[e]===t?this.unequip(e):this.equip(e,t)},c.prototype.unequipAllWeapons=function(){for(let t=0;t<this._allMeshes.length;t++){const l=this._allMeshes[t],o=l.userData.equipGroup;(o==="weapon_r"||o==="weapon_l"||o==="shield")&&(l.visible=!1)}const e=["axe","hammer","sword","pick","spear","bow","staff","shield"];for(let t=0;t<e.length;t++)delete this.equipped[e[t]]},c.prototype.equipWeapon=function(e,t){typeof t>"u"&&(t="_default");let l=null;for(let o=0;o<d.length;o++)if(d[o].slot===e){l=d[o];break}if(!l)return!1;for(let o=0;o<this._allMeshes.length;o++){const g=this._allMeshes[o];g.userData.equipGroup===l.group&&(g.visible=!1,delete this.equipped[g.userData.equipSlot])}return this.equip(e,t)},c.prototype.getSlotSummary=function(){const e={},t=Object.entries(this.slots);for(let l=0;l<t.length;l++)e[t[l][0]]=Object.keys(t[l][1]).sort();return e},c.prototype.getGroupedSlots=function(){const e={armor:{},weapons:{},shields:{},utility:{}},t=Object.entries(this.slots);for(let l=0;l<t.length;l++){const o=t[l][0],g=t[l][1];let S=null;for(let v=0;v<d.length;v++)if(d[v].slot===o){S=d[v];break}if(!S)continue;const k=S.group==="weapon_r"||S.group==="weapon_l"?"weapons":S.group==="shield"?"shields":S.group;e[k][o]={variants:Object.keys(g).sort(),equipped:this.equipped[o]||null}}return e},c.prototype.showAll=function(){for(let e=0;e<this._allMeshes.length;e++)this._allMeshes[e].visible=!0},c.prototype.hideAll=function(){for(let e=0;e<this._allMeshes.length;e++)this._allMeshes[e].visible=!1},c.prototype.applyLoadout=function(e){if(!e||typeof e!="object")return[];const t=["axe","hammer","sword","pick","spear","bow","staff","shield"],l=[];this.unequipAllWeapons();const o=Object.keys(e);for(let g=0;g<o.length;g++){const S=o[g],k=e[S],v=this.slots[S];if(!v||!v[k])continue;(t.indexOf(S)>=0?this.equipWeapon(S,k):this.equip(S,k))&&l.push(S)}return l},c.prototype.getParts=function(){const e={},t=Object.keys(this._parts);for(let l=0;l<t.length;l++){const o=this._parts[t[l]];e[t[l]]={visible:!!o.visible,mesh:o}}return e},c.prototype.togglePart=function(e,t){const l=this._parts[e];return l?(l.visible=typeof t=="boolean"?t:!l.visible,l.visible):!1},c.prototype.hasParts=function(){return Object.keys(this._parts).length>0},Object.defineProperty(c.prototype,"meshCount",{get:function(){return this._allMeshes.length}}),Object.defineProperty(c.prototype,"partCount",{get:function(){return Object.keys(this._parts).length}}),a.GrudgeEquipmentManager=c})(typeof window<"u"?window:globalThis);(function(a){const d="/character/races/",c="/Character-Animator-Mapper/Character-Animator-Mapper/attached_assets/extracted/",e={locomotion:c+"locomotion/",action:c+"action/",sword:c+"sword_shield/",longbow:c+"longbow/",magic:c+"magic/",pistol:c+"pistol/",rifle:c+"rifle/",unarmed:c+"unarmed/"};function t(s){return{url:s,rig:"mixamo"}}function l(s){return{url:s,rig:"bip001"}}const o="/character/races/textures/",g=[{id:"human",label:"Human (WK)",file:"WK_Characters.glb",prefix:"WK_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"human/default.png",meta:{color:"#94a3b8",faction:"crusade",trait:"Adaptable",emoji:"🧑",description:"Versatile and adaptable — masters of none, capable of all.",passive:"+1 to all attributes"}},{id:"barbarian",label:"Barbarian (BRB)",file:"BRB_Characters.glb",prefix:"BRB_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"barbarian/default.png",meta:{color:"#f43f5e",faction:"crusade",trait:"Berserker Rage",emoji:"🪓",description:"Untamed fury given form — raw power and relentless aggression.",passive:"+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC"}},{id:"elf",label:"Elf (ELF)",file:"ELF_Characters.glb",prefix:"ELF_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"elf/highelves.png",meta:{color:"#22d3ee",faction:"fabled",trait:"Arcane Affinity",emoji:"🧝",description:"Ancient and graceful — wielders of arcane arts and deadly precision.",passive:"+3 INT, +2 DEX, +2 AGI, +1 WIS"}},{id:"dwarf",label:"Dwarf (DWF)",file:"DWF_Characters.glb",prefix:"DWF_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"dwarf/default.png",meta:{color:"#f59e0b",faction:"fabled",trait:"Stoneborn",emoji:"⛏",description:"Stout mountain folk — unyielding defense and masterful craftsmanship.",passive:"+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS"}},{id:"orc",label:"Orc (ORC)",file:"ORC_Characters.glb",prefix:"ORC_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"orc/default.png",meta:{color:"#65a30d",faction:"legion",trait:"Bloodrage",emoji:"👹",description:"Savage brutes bred for war — crushing power and iron will.",passive:"+4 STR, +2 VIT, +2 END"}},{id:"undead",label:"Undead (UD)",file:"UD_Characters.glb",prefix:"UD_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"undead/default.png",meta:{color:"#a78bfa",faction:"legion",trait:"Undying Will",emoji:"💀",description:"Death-touched revenants fueled by dark energy and grudges unresolved.",passive:"+3 VIT, +2 END, +2 WIS, +1 STR"}}].map(function(s){return Object.assign({},s,{url:d+s.file})}),S="human";function k(){let s=null,n=null;var A=null,B=null;try{window.GrudgeBuild&&window.GrudgeBuild.raceId&&(A=window.GrudgeBuild)}catch{}try{const M=sessionStorage.getItem("grudge_active_build");M&&(B=JSON.parse(M))}catch{}A&&A.source==="railway"?n=A:B&&B.source==="railway"?n=B:A?n=A:B&&(n=B);try{s=new URLSearchParams(window.location.search).get("char")}catch{}if(!s&&n&&n.raceId&&(s=n.raceId),s){const M=g.find(function(G){return G.id===s});if(M){var q=M.texture;n&&(n.textureUrl?q=n.textureUrl:n.skinVariant&&(q=o+M.id+"/"+n.skinVariant+".png"));var x=Object.assign({},M,{texture:q,build:n});return n&&typeof n.worldScale=="number"&&(x.scale=n.worldScale),n&&typeof n.targetHeight=="number"&&(x.targetHeight=n.targetHeight),x}}return g.find(function(M){return M.id===S})||g[0]}const v=["Idle","Walk","Run","Jump","Fall","Block","RollLeft","RollRight"],L="/character/races/anims/",f={idle:l(L+"idle.glb"),walk:l(L+"walk.glb"),run:l(L+"run.glb"),attack:l(L+"attack.glb"),attackSpear:l(L+"attack-spear.glb"),cast:l(L+"cast.glb"),death:l(L+"death.glb")},E={unarmed:{Attack:[f.attack],Skill1:[f.attack],Skill2:[f.attack]},sword_shield:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attack],Skill1:[f.attack],Skill2:[f.attack],Death:[f.death]},spear_melee:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attackSpear],Skill1:[f.attackSpear],Skill2:[f.attackSpear],Death:[f.death]},magic:{Idle:[f.idle],Cast:[f.cast],Skill3:[f.cast],Skill4:[f.cast],Skill9:[f.cast],Death:[f.death]},longbow:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attack],Skill7:[f.attack],Death:[f.death]},rifle:{Attack:[f.attack],Skill8:[f.attack]},pistol:{Attack:[f.attack],Skill8:[f.attack]}},i={Idle:[t(e.locomotion+"idle.fbx")],Walk:[t(e.locomotion+"walking.fbx")],Run:[t(e.locomotion+"running.fbx")],Jump:[t(e.locomotion+"jump.fbx")],Fall:[t(e.action+"falling idle.fbx")],StrafeL:[t(e.locomotion+"left strafe walking.fbx")],StrafeR:[t(e.locomotion+"right strafe walking.fbx")],TurnL:[t(e.locomotion+"left turn 90.fbx")],TurnR:[t(e.locomotion+"right turn 90.fbx")],Attack:[t(e.sword+"sword and shield attack.fbx")],Attack2:[t(e.sword+"sword and shield attack (2).fbx")],Attack3:[t(e.sword+"sword and shield attack (3).fbx")],Attack4:[t(e.sword+"sword and shield attack (4).fbx")],Block:[t(e.sword+"sword and shield block.fbx")],DrawSword:[t(e.sword+"draw sword 1.fbx")],SheathSword:[t(e.sword+"sheath sword 1.fbx")],Roll:[t(e.action+"falling to roll.fbx")],RollLeft:[t(e.locomotion+"left strafe.fbx")],RollRight:[t(e.locomotion+"right strafe.fbx")],Dodge:[t(e.action+"falling to roll.fbx")],Dash:[t(e.locomotion+"running.fbx")],Climb:[t(e.action+"stand to cover.fbx")],Sneak:[t(e.action+"crouched sneaking left.fbx")],SneakL:[t(e.action+"left cover sneak.fbx")],SneakR:[t(e.action+"right cover sneak.fbx")],Swim:[t(e.locomotion+"walking.fbx")],Kick:[t(e.unarmed+"lead_jab.fbx")],Punch:[t(e.unarmed+"lead_jab.fbx")],Cast:[t(e.magic+"Standing 1H Magic Attack 01.fbx")],Cast2H:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Teleport:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Channel:[t(e.magic+"standing idle.fbx")],Death:[t(e.magic+"Standing React Death Backward.fbx")],HitLarge:[t(e.magic+"Standing React Large From Front.fbx")],HitSmall:[t(e.magic+"Standing React Small From Front.fbx")],BowIdle:[t(e.longbow+"standing idle 01.fbx")],BowRunF:[t(e.longbow+"standing run forward.fbx")],BowRunB:[t(e.longbow+"standing run back.fbx")],BowRunL:[t(e.longbow+"standing run left.fbx")],BowRunR:[t(e.longbow+"standing run right.fbx")],PistolIdle:[t(e.pistol+"pistol idle.fbx")],PistolRun:[t(e.pistol+"pistol run.fbx")],PistolJump:[t(e.pistol+"pistol jump.fbx")],RifleIdle:[t(e.rifle+"idle aiming.fbx")],RifleRun:[t(e.rifle+"run forward.fbx")],Skill1:[t(e.sword+"sword and shield attack.fbx")],Skill2:[t(e.sword+"sword and shield attack (2).fbx")],Skill3:[t(e.magic+"Standing 1H Magic Attack 01.fbx")],Skill4:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Skill5:[t(e.action+"falling to roll.fbx")],Skill6:[t(e.unarmed+"lead_jab.fbx")],Skill7:[t(e.longbow+"standing run forward.fbx")],Skill8:[t(e.rifle+"idle aiming.fbx")],Skill9:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")]};function u(s){const n=(s||"").toLowerCase();return n?n==="sword_shield"||n==="1h-shield"?"sword_shield":n==="2h-melee"?"spear_melee":n==="longbow"?"longbow":n==="magic"?"magic":n==="rifle"?"rifle":n==="pistol"?"pistol":n==="unarmed"?"unarmed":"":""}function C(s){const n=s&&s.equipped?s.equipped:null;if(!n)return"";const A=["staff","bow","spear","sword","axe","hammer","pick"];for(let B=0;B<A.length;B++){const q=A[B];if(n[q])return q}return""}function p(s){const n=s&&s.build?s.build:null,A=u(n&&n.animationPack);if(A)return A;const B=C(n);return B==="staff"?"magic":B==="bow"?"longbow":B==="spear"?"spear_melee":B?"sword_shield":"unarmed"}const b={Cast:{kind:"spell-bolt",color:"#9ab8ff",duration:.6,sound:"cast"},Cast2H:{kind:"spell-aoe",color:"#a78bfa",duration:1.2,sound:"cast-aoe"},Teleport:{kind:"teleport",color:"#22d3ee",duration:.45,sound:"teleport"},Channel:{kind:"channel-aura",color:"#7dd3fc",duration:1.5,sound:"channel"},Roll:{kind:"dust-puff",color:"#d4a373",duration:.35,sound:"roll"},Dash:{kind:"dash-trail",color:"#f5e2c1",duration:.3,sound:"dash"},Skill3:{kind:"spell-bolt",color:"#9ab8ff",duration:.6,sound:"cast"},Skill4:{kind:"spell-aoe",color:"#a78bfa",duration:1.2,sound:"cast-aoe"},Skill9:{kind:"spell-aoe",color:"#f43f5e",duration:1.5,sound:"ult"}};function w(s){const n=p(s),A=E[n]||{},B={};return v.concat(P.filter(function(x){return v.indexOf(x)===-1})).forEach(function(x){const T=x.toLowerCase().replace("rollleft","roll-left").replace("rollright","roll-right"),M=i[x]||[],G={url:L+s.id+"."+T+".fbx",rig:"bip001"},le={url:L+T+".fbx",rig:"bip001"},ce=A[x]||[];B[x]=[G,le].concat(ce,M)}),B}const h={"mixamorig:Hips":"Bip001 Pelvis","mixamorig:Spine":"Bip001 Spine","mixamorig:Spine1":"Bip001 Spine","mixamorig:Spine2":"Bip001 Spine","mixamorig:Neck":"Bip001 Neck","mixamorig:Head":"Bip001 Head","mixamorig:LeftShoulder":"Bip001 L Clavicle","mixamorig:LeftArm":"Bip001 L UpperArm","mixamorig:LeftForeArm":"Bip001 L Forearm","mixamorig:LeftHand":"Bip001 L Hand","mixamorig:RightShoulder":"Bip001 R Clavicle","mixamorig:RightArm":"Bip001 R UpperArm","mixamorig:RightForeArm":"Bip001 R Forearm","mixamorig:RightHand":"Bip001 R Hand","mixamorig:LeftUpLeg":"Bip001 L Thigh","mixamorig:LeftLeg":"Bip001 L Calf","mixamorig:LeftFoot":"Bip001 L Foot","mixamorig:LeftToeBase":"Bip001 L Toe0","mixamorig:RightUpLeg":"Bip001 R Thigh","mixamorig:RightLeg":"Bip001 R Calf","mixamorig:RightFoot":"Bip001 R Foot","mixamorig:RightToeBase":"Bip001 R Toe0"},_={urls:["https://threejs.org/examples/models/gltf/Soldier.glb"],rigType:"mixamo",clips:{Idle:[/idle/i],Walk:[/walk/i],Run:[/run/i],Jump:[/jump/i,/walk/i],Fall:[/fall/i,/idle/i],Block:[/block/i,/idle/i],RollLeft:[/roll.*left|left.*roll|dodge.*left/i,/run/i],RollRight:[/roll.*right|right.*roll|dodge.*right/i,/run/i]}},y={move:{forward:"KeyW",back:"KeyS",left:"KeyA",right:"KeyD"},sprint:"ShiftLeft",jump:"Space",block:"ShiftRight",rollLeft:"KeyQ",rollRight:"KeyE",interact:"KeyF",hotbar:{1:"Digit1",2:"Digit2",3:"Digit3",4:"Digit4",5:"Digit5",6:"Digit6",7:"Digit7",8:"Digit8"}},R={},P=["Idle","Walk","Run","Jump","Fall","StrafeL","StrafeR","TurnL","TurnR","Attack","Attack2","Attack3","Attack4","Block","DrawSword","SheathSword","Roll","RollLeft","RollRight","Dodge","Dash","Climb","Sneak","SneakL","SneakR","Swim","Kick","Punch","Cast","Cast2H","Teleport","Channel","Death","HitLarge","HitSmall","BowIdle","BowRunF","BowRunB","BowRunL","BowRunR","PistolIdle","PistolRun","PistolJump","RifleIdle","RifleRun","Skill1","Skill2","Skill3","Skill4","Skill5","Skill6","Skill7","Skill8","Skill9"],D=[{id:"knight",label:"Knight",description:"Heavy plate, sword & shield.",icon:"⚔",loadout:{body:"C",arms:"C",legs:"C",head:"D",shoulders:"B",sword:"A",shield:"A"}},{id:"berserker",label:"Berserker",description:"Light armor, dual axes.",icon:"⛏",loadout:{body:"B",arms:"B",legs:"B",head:"B",axe:"A"}},{id:"archer",label:"Archer",description:"Cloth + leather, bow & quiver.",icon:"🏹",loadout:{body:"A",arms:"A",legs:"A",head:"A",bow:"_default",quiver:"_default"}},{id:"mage",label:"Mage",description:"Robes and a staff.",icon:"🔮",loadout:{body:"D",arms:"D",legs:"C",head:"E",staff:"A"}},{id:"tank",label:"Tank",description:"Maximum plate, hammer & tower shield.",icon:"🛡",loadout:{body:"E",arms:"D",legs:"C",head:"F",shoulders:"B",hammer:"A",shield:"B"}},{id:"spearman",label:"Spearman",description:"Mid armor, spear & shield.",icon:"🎯",loadout:{body:"B",arms:"B",legs:"B",head:"C",spear:"_default",shield:"A"}},{id:"miner",label:"Miner",description:"Civilian outfit, pick & bag.",icon:"⛏",loadout:{body:"A",arms:"A",legs:"A",head:"A",pick:"_default",bag:"_default"}},{id:"lumberjack",label:"Lumberjack",description:"Civilian outfit, hand-axe & log.",icon:"🪵",loadout:{body:"A",arms:"A",legs:"A",head:"B",axe:"B",wood:"_default"}}];function I(s){return D.find(function(n){return n.id===s})||null}const r=g.map(function(s){return{id:"spawn_"+s.id,kind:"character",label:s.label,characterId:s.id,defaultPreset:null}}),m=g.map(function(s){return{id:s.id,label:s.label,url:s.url,objectStore:s.objectStore,prefix:s.prefix,scale:s.scale,rigType:s.rigType,texture:s.texture,color:s.meta&&s.meta.color||"#c9950a",faction:s.meta&&s.meta.faction||"neutral",trait:s.meta&&s.meta.trait||"",emoji:s.meta&&s.meta.emoji||"",description:s.meta&&s.meta.description||"",passive:s.meta&&s.meta.passive||""}});a.GrudgePlayerConfig={CHARACTERS:g,RACES:m,DEFAULT_CHARACTER_ID:S,ANIMATION_STATES:v,ANIMATION_STATES_BIP001:P,CC_BONE_MAP:R,BIP001_BONE_MAP:h,FALLBACK_BUNDLE:_,CONTROLLER_BINDINGS:y,LOADOUT_PRESETS:D,SPAWN_CATALOG:r,SPELL_VFX:b,SHARED_ANIMS:i,UNITY_DIR:c,UNITY:e,TEXTURE_DIR:o,resolveCharacter:k,animationSourcesFor:w,getLoadoutPreset:I,getSpellVfx:function(s){return b[s]||null},getCharacter:function(s){return g.find(function(n){return n.id===s})||null},getRaceById:function(s){return m.find(function(n){return n.id===s})||null}}})(typeof window<"u"?window:globalThis);(function(a){const d="grudge_active_build",c={human:["default"],barbarian:["default"],elf:["highelves","default"],dwarf:["default"],orc:["default"],undead:["default"]},e=[{id:"sword_shield",label:"Sword & Shield"},{id:"longbow",label:"Longbow"},{id:"magic",label:"Magic"},{id:"spear_melee",label:"Spear"},{id:"unarmed",label:"Unarmed"}];function t(){try{return new URLSearchParams(a.location.search)}catch{return new URLSearchParams}}function l(){const r=t();return!!(r.get("lobby")==="1"||r.get("enter")==="1"||r.get("char"))}function o(){try{const r=sessionStorage.getItem(d);return r?JSON.parse(r):null}catch{return null}}function g(r){try{sessionStorage.setItem(d,JSON.stringify(r))}catch{}}function S(){const r=a.GrudgePlayerConfig;return r&&r.RACES&&r.RACES.length?r.RACES:[{id:"human",label:"Human",emoji:"🧑",color:"#94a3b8",trait:"Adaptable",faction:"crusade"},{id:"barbarian",label:"Barbarian",emoji:"🪓",color:"#f43f5e",trait:"Berserker",faction:"crusade"},{id:"elf",label:"Elf",emoji:"🧝",color:"#22d3ee",trait:"Arcane",faction:"fabled"},{id:"dwarf",label:"Dwarf",emoji:"⛏",color:"#f59e0b",trait:"Stoneborn",faction:"fabled"},{id:"orc",label:"Orc",emoji:"👹",color:"#65a30d",trait:"Bloodrage",faction:"legion"},{id:"undead",label:"Undead",emoji:"💀",color:"#a78bfa",trait:"Undying",faction:"legion"}]}function k(){const r=a.GrudgePlayerConfig;return r&&r.LOADOUT_PRESETS||[{id:"knight",label:"Knight",description:"Sword & shield",loadout:{body:"C",arms:"C",legs:"C",head:"D",shoulders:"B",sword:"A",shield:"A"}},{id:"berserker",label:"Berserker",description:"Axe",loadout:{body:"B",arms:"B",legs:"B",head:"B",axe:"A"}},{id:"archer",label:"Archer",description:"Bow",loadout:{body:"A",arms:"A",legs:"A",head:"A",bow:"_default",quiver:"_default"}},{id:"mage",label:"Mage",description:"Staff",loadout:{body:"D",arms:"D",legs:"C",head:"E",staff:"A"}}]}function v(r){return(c[r]||["default"])[0]}function L(r,m){return"/character/races/textures/"+r+"/"+(m||"default")+".png"}function f(){if(document.getElementById("cdg-styles"))return;const r=document.createElement("style");r.id="cdg-styles",r.textContent=`
#char-design-gate {
  position: fixed; inset: 0; z-index: 100;
  display: flex; align-items: center; justify-content: center;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(40,70,100,.55), transparent 55%),
    linear-gradient(165deg, #0a1628 0%, #1a120c 45%, #0c1a14 100%);
  font-family: "Cinzel", serif;
  color: #f5e2c1;
  overflow: auto;
  transition: opacity .45s ease, visibility .45s ease;
}
#char-design-gate.hidden {
  opacity: 0; visibility: hidden; pointer-events: none;
}
#char-design-gate .cdg-shell {
  width: min(920px, 94vw);
  margin: 24px auto;
  background: linear-gradient(180deg, rgba(26,18,12,.96), rgba(10,7,5,.96));
  border: 2px solid #c9950a;
  border-radius: 14px;
  box-shadow: 0 20px 60px rgba(0,0,0,.7), inset 0 0 40px rgba(0,0,0,.35);
  padding: 22px 24px 18px;
}
#char-design-gate .cdg-brand {
  display: flex; align-items: center; gap: 12px; margin-bottom: 6px;
}
#char-design-gate .cdg-brand .mark {
  width: 42px; height: 42px; border-radius: 8px;
  background: linear-gradient(135deg, #c9950a, #7a5a08);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; color: #0a0705; font-weight: 900;
}
#char-design-gate h1 {
  margin: 0; font-size: 22px; letter-spacing: 2px; color: #d4a400;
  text-transform: uppercase;
}
#char-design-gate .cdg-sub {
  margin: 0 0 16px; font-family: "JetBrains Mono", monospace;
  font-size: 11px; color: #9b7d52; letter-spacing: .5px;
}
#char-design-gate .cdg-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 18px;
}
@media (max-width: 720px) {
  #char-design-gate .cdg-grid { grid-template-columns: 1fr; }
}
#char-design-gate .cdg-label {
  font-size: 10px; letter-spacing: 1.6px; text-transform: uppercase;
  color: #c9950a; margin: 0 0 8px;
}
#char-design-gate .cdg-races {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
}
#char-design-gate .cdg-race {
  background: #0a0705; border: 1.5px solid #3a2a1a; border-radius: 8px;
  padding: 10px 8px; cursor: pointer; text-align: center;
  transition: border-color .15s, transform .12s, box-shadow .15s;
}
#char-design-gate .cdg-race:hover { border-color: #c9950a; transform: translateY(-2px); }
#char-design-gate .cdg-race.active {
  border-color: var(--rc, #c9950a);
  box-shadow: 0 0 16px color-mix(in srgb, var(--rc, #c9950a) 40%, transparent);
}
#char-design-gate .cdg-race .em { font-size: 26px; line-height: 1; }
#char-design-gate .cdg-race .nm {
  font-size: 11px; letter-spacing: 1px; color: #d4a400; margin-top: 4px;
  text-transform: uppercase;
}
#char-design-gate .cdg-race .tr {
  font-family: "JetBrains Mono", monospace; font-size: 9px; color: #9b7d52; margin-top: 2px;
}
#char-design-gate .cdg-field { margin-bottom: 12px; }
#char-design-gate input[type="text"],
#char-design-gate select {
  width: 100%; box-sizing: border-box;
  background: #0a0705; color: #f5e2c1;
  border: 1px solid #3a2a1a; border-radius: 4px;
  padding: 8px 10px; font-family: "JetBrains Mono", monospace; font-size: 13px;
}
#char-design-gate input:focus, #char-design-gate select:focus {
  outline: none; border-color: #c9950a;
}
#char-design-gate .cdg-presets {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
#char-design-gate .cdg-preset {
  background: #0a0705; border: 1px solid #3a2a1a; border-radius: 6px;
  padding: 8px; cursor: pointer; text-align: left;
  font-family: "JetBrains Mono", monospace; font-size: 11px; color: #f5e2c1;
}
#char-design-gate .cdg-preset:hover { border-color: #c9950a; }
#char-design-gate .cdg-preset.active {
  background: rgba(201,149,10,.18); border-color: #c9950a; color: #d4a400;
}
#char-design-gate .cdg-preset small {
  display: block; color: #9b7d52; font-size: 9px; margin-top: 2px;
}
#char-design-gate .cdg-summary {
  margin-top: 8px; padding: 10px 12px;
  background: rgba(0,0,0,.35); border: 1px dashed #3a2a1a; border-radius: 6px;
  font-family: "JetBrains Mono", monospace; font-size: 11px; line-height: 1.55;
  color: #9b7d52;
}
#char-design-gate .cdg-summary b { color: #d4a400; }
#char-design-gate .cdg-actions {
  display: flex; gap: 10px; margin-top: 18px; align-items: center;
}
#char-design-gate .cdg-play {
  flex: 1; padding: 14px 18px;
  background: linear-gradient(180deg, #d4a400, #c9950a);
  color: #0a0705; border: none; border-radius: 8px;
  font-family: "Cinzel", serif; font-size: 16px; font-weight: 900;
  letter-spacing: 2px; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 6px 20px rgba(201,149,10,.35);
}
#char-design-gate .cdg-play:hover {
  background: linear-gradient(180deg, #e8b820, #d4a400);
}
#char-design-gate .cdg-skip {
  background: transparent; color: #9b7d52; border: 1px solid #3a2a1a;
  border-radius: 6px; padding: 12px 14px; cursor: pointer;
  font-family: "JetBrains Mono", monospace; font-size: 11px;
}
#char-design-gate .cdg-skip:hover { color: #f5e2c1; border-color: #c9950a; }
#char-design-gate .cdg-hint {
  margin-top: 12px; text-align: center;
  font-family: "JetBrains Mono", monospace; font-size: 10px; color: #6a5540;
}
#char-design-gate .cdg-account {
  margin: 0 0 14px; padding: 10px 12px;
  background: rgba(0,0,0,.4); border: 1px solid #3a2a1a; border-radius: 8px;
  font-family: "JetBrains Mono", monospace; font-size: 11px; line-height: 1.5;
  color: #9b7d52;
  display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between;
}
#char-design-gate .cdg-account b { color: #d4a400; }
#char-design-gate .cdg-account .ok { color: #3dcf7a; }
#char-design-gate .cdg-account .warn { color: #e8a040; }
#char-design-gate .cdg-account a {
  color: #4a9eff; text-decoration: none; border-bottom: 1px dashed #3a2a1a;
}
#char-design-gate .cdg-account button {
  background: linear-gradient(180deg, #d4a400, #c9950a);
  color: #0a0705; border: none; border-radius: 5px;
  padding: 8px 12px; font-family: "Cinzel", serif; font-size: 11px;
  font-weight: 700; letter-spacing: 1px; cursor: pointer;
}
#char-design-gate .cdg-account button.ghost {
  background: transparent; color: #9b7d52; border: 1px solid #3a2a1a;
}
body.cdg-designing #hud,
body.cdg-designing #main-panel,
body.cdg-designing #info {
  opacity: 0 !important; pointer-events: none !important;
  visibility: hidden !important;
}
body.cdg-designing canvas {
  filter: blur(2px) brightness(0.55);
}
`,document.head.appendChild(r)}function E(){let r=document.getElementById("char-design-gate");return r||(r=document.createElement("div"),r.id="char-design-gate",r.setAttribute("role","dialog"),r.setAttribute("aria-label","Character design"),r.innerHTML=`
      <div class="cdg-shell">
        <div class="cdg-brand">
          <div class="mark">⚓</div>
          <div>
            <h1>Design your pirate</h1>
            <p class="cdg-sub">Grudge Warlords · Open-world lobby on three-layer grass hills</p>
          </div>
        </div>
        <div class="cdg-account" id="cdg-account">
          <span>Checking Railway account…</span>
        </div>
        <div class="cdg-grid">
          <div>
            <div class="cdg-label">Race</div>
            <div class="cdg-races" id="cdg-races"></div>
          </div>
          <div>
            <div class="cdg-field">
              <div class="cdg-label">Captain name</div>
              <input type="text" id="cdg-name" maxlength="24" placeholder="e.g. Blackwake" autocomplete="off" />
            </div>
            <div class="cdg-field">
              <div class="cdg-label">Skin</div>
              <select id="cdg-skin"></select>
            </div>
            <div class="cdg-field">
              <div class="cdg-label">Combat pack</div>
              <select id="cdg-pack"></select>
            </div>
            <div class="cdg-label">Loadout</div>
            <div class="cdg-presets" id="cdg-presets"></div>
            <div class="cdg-summary" id="cdg-summary"></div>
          </div>
        </div>
        <div class="cdg-actions">
          <button type="button" class="cdg-play" id="cdg-play">Play → Enter Lobby</button>
          <button type="button" class="cdg-skip" id="cdg-skip" title="Skip with default Human knight">Skip</button>
        </div>
        <p class="cdg-hint">Mesh · texture · scale locked to grudge6 SI (1.8 × world scale 4.2) · grass L0/L1/L2 hills</p>
      </div>
    `,document.body.appendChild(r),r)}function i(r){document.body.classList.toggle("cdg-designing",!r),document.body.classList.toggle("cdg-lobby",!!r),document.body.dataset.grudgeMode=r?"lobby":"design";const m=document.getElementById("char-design-gate");if(m&&m.classList.toggle("hidden",!!r),r&&a.world&&a.world.scene)try{u(a.world.scene)}catch{}}function u(r){!r||r.userData._pirateLobby||(r.userData._pirateLobby=!0,r.background&&r.background.isColor&&r.background.setHex(8893908),r.fog&&r.fog.isFog&&(r.fog.color.setHex(10405080),r.fog.near=80,r.fog.far=280))}function C(){const r=p.raceId||"human",m=p.skin||v(r),s=k().find(q=>q.id===p.presetId)||k()[0],n=p.pack||"sword_shield",A=(document.getElementById("cdg-name")?.value||"").trim()||"Captain",B=Object.assign({},s&&s.loadout||{body:"A",arms:"A",legs:"A",head:"A",sword:"A"});return{schemaVersion:1,name:A,raceId:r,classId:s&&s.id||"knight",skinVariant:m,textureUrl:L(r,m),animationPack:n,gearPresetId:s&&s.id||"knight",equipped:B,lobby:"pirate_open_world",targetHeight:1.8*4.2,worldScale:4.2}}const p={raceId:"barbarian",skin:"default",pack:"sword_shield",presetId:"berserker"};function b(){const r=document.getElementById("cdg-summary");if(!r)return;const m=C(),s=S().find(n=>n.id===m.raceId);r.innerHTML="<b>"+m.name+"</b> · "+(s?s.label:m.raceId)+"<br>Skin <b>"+m.skinVariant+"</b> · Pack <b>"+m.animationPack+"</b><br>Loadout <b>"+m.gearPresetId+"</b> · Scale <b>4.2</b> (fit 1.8×)<br>Lobby: <b>Pirate open world</b> · 3-layer grass hills"}function w(){f();const r=E(),m=document.getElementById("cdg-races");m.innerHTML="",S().forEach(x=>{const T=document.createElement("button");T.type="button",T.className="cdg-race"+(x.id===p.raceId?" active":""),T.style.setProperty("--rc",x.color||"#c9950a"),T.innerHTML='<div class="em">'+(x.emoji||"⚔")+'</div><div class="nm">'+(x.label||x.id).replace(/\s*\(.*\)$/,"")+'</div><div class="tr">'+(x.trait||"")+"</div>",T.addEventListener("click",()=>{p.raceId=x.id,p.skin=v(x.id),A(),s(),b()}),m.appendChild(T)});function s(){m.querySelectorAll(".cdg-race").forEach((x,T)=>{const M=S()[T];x.classList.toggle("active",M&&M.id===p.raceId)})}const n=document.getElementById("cdg-pack");n.innerHTML="",e.forEach(x=>{const T=document.createElement("option");T.value=x.id,T.textContent=x.label,x.id===p.pack&&(T.selected=!0),n.appendChild(T)}),n.onchange=()=>{p.pack=n.value,b()};function A(){const x=document.getElementById("cdg-skin"),T=c[p.raceId]||["default"];x.innerHTML="",T.forEach(M=>{const G=document.createElement("option");G.value=M,G.textContent=M,M===p.skin&&(G.selected=!0),x.appendChild(G)}),x.onchange=()=>{p.skin=x.value,b()}}A();const B=document.getElementById("cdg-presets");B.innerHTML="",k().forEach(x=>{const T=document.createElement("button");T.type="button",T.className="cdg-preset"+(x.id===p.presetId?" active":""),T.innerHTML=(x.icon?x.icon+" ":"")+x.label+"<small>"+(x.description||"")+"</small>",T.addEventListener("click",()=>{if(p.presetId=x.id,x.loadout){x.loadout.bow?p.pack="longbow":x.loadout.staff?p.pack="magic":x.loadout.spear?p.pack="spear_melee":(x.loadout.sword||x.loadout.axe||x.loadout.hammer)&&(p.pack="sword_shield");const M=document.getElementById("cdg-pack");M&&(M.value=p.pack)}B.querySelectorAll(".cdg-preset").forEach(M=>M.classList.remove("active")),T.classList.add("active"),b()}),B.appendChild(T)});const q=o();if(q&&q.name){const x=document.getElementById("cdg-name");x&&(x.value=q.name),q.raceId&&(p.raceId=q.raceId),q.skinVariant&&(p.skin=q.skinVariant),q.animationPack&&(p.pack=q.animationPack),q.gearPresetId&&(p.presetId=q.gearPresetId),A(),s();const T=document.getElementById("cdg-pack");T&&(T.value=p.pack)}return document.getElementById("cdg-play").onclick=h,document.getElementById("cdg-skip").onclick=()=>{p.raceId="human",p.presetId="knight",p.pack="sword_shield",p.skin="default",h()},document.getElementById("cdg-name").oninput=b,b(),r}function h(r){r=r||{};let m;if(r.railwayBuild)m=r.railwayBuild;else{m=C(),m.source=m.source||"gate";try{const n=a.GrudgeBoot;n&&n.characterId&&(m.characterId=n.characterId,m.source="gate")}catch{}}g(m);try{const n=m.characterId,A=a.GrudgeAccountSDK;n&&A&&A.getToken&&A.getToken()&&A.saveBuild&&A.saveBuild(n,m)}catch{}const s=new URL(a.location.href);s.searchParams.set("char",m.raceId),s.searchParams.set("lobby","1"),m.characterId&&s.searchParams.set("characterId",m.characterId),s.searchParams.delete("enter"),a.location.href=s.pathname+"?"+s.searchParams.toString()+s.hash}function _(){try{return(a.import_meta_env&&a.import_meta_env.VITE_GRUDGE_ID_URL||"https://id.grudge-studio.com")+"/?returnTo="+encodeURIComponent(a.location.href)}catch{return"https://id.grudge-studio.com/?returnTo="+encodeURIComponent(a.location.href)}}function y(){const r=document.getElementById("cdg-account");if(!r)return;const m=a.GrudgeBoot,s=a.GrudgeAccountSDK;if(!m){r.innerHTML="<span>Account: resolving…</span>";return}if(m.source==="railway"&&m.characterId){r.innerHTML='<div><span class="ok">Railway</span> · <b>'+R(m.characterName||"Hero")+"</b> · "+R(m.raceId)+(m.username?" · @"+R(m.username):"")+"</div>";const A=document.createElement("button");A.type="button",A.textContent="Play Railway hero →",A.addEventListener("click",()=>{const B=o();B&&B.source==="railway"?h({railwayBuild:B}):h()}),r.appendChild(A);return}if(m.signedIn){r.innerHTML='<div><span class="warn">Signed in</span> · no Railway characters yet · design below or open Foundry</div>';const A=document.createElement("div");A.style.display="flex",A.style.gap="6px";const B=document.createElement("button");B.type="button",B.className="ghost",B.textContent="Refresh",B.addEventListener("click",()=>{s&&s.syncFromBackend?s.syncFromBackend().then(()=>{a.GrudgeRailwayBoot&&a.location.reload()}):a.location.reload()}),A.appendChild(B),r.appendChild(A);return}r.innerHTML='<div><span class="warn">Guest</span> · session only (not Railway SSOT)</div>';const n=document.createElement("a");n.href=_(),n.textContent="Sign in with Grudge ID →",r.appendChild(n)}function R(r){return String(r||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function P(){document.body.classList.add("cdg-designing"),w(),i(!1),y(),a.addEventListener("grudge:railway-boot",y),a.GrudgeBoot?y():a.GrudgeRailwayBoot&&a.GrudgeRailwayBoot.then(y).catch(function(){y()})}function D(){f();const r=document.getElementById("char-design-gate");r&&r.classList.add("hidden"),i(!0);const m=()=>a.world&&a.world.scene?(u(a.world.scene),!0):!1;if(!m()){let s=0;const n=setInterval(()=>{(m()||++s>40)&&clearInterval(n)},250)}}function I(){const r=()=>{if(l()){const s=t().get("char");let n=o();if(a.GrudgeBuild&&a.GrudgeBuild.source==="railway")n=a.GrudgeBuild,g(n);else if(!n||s&&n.raceId!==s&&n.source!=="railway"){const A=s||"human",B=k().find(q=>q.id==="knight")||k()[0];n={schemaVersion:1,name:n&&n.name||"Captain",raceId:A,classId:n&&n.classId||"knight",skinVariant:n&&n.skinVariant||v(A),textureUrl:L(A,n&&n.skinVariant||v(A)),animationPack:n&&n.animationPack||"sword_shield",gearPresetId:n&&n.gearPresetId||"knight",equipped:n&&n.equipped&&Object.keys(n.equipped).length?n.equipped:Object.assign({},B&&B.loadout||{body:"A",arms:"A",legs:"A",head:"A",sword:"A"}),lobby:"pirate_open_world",targetHeight:7.5600000000000005,worldScale:4.2,source:n&&n.source||"session"},g(n)}D()}else P()};if(a.GrudgeRailwayBoot)Promise.resolve(a.GrudgeRailwayBoot).then(r).catch(r);else if(a.GrudgeBoot)r();else{let m=0;const s=setInterval(()=>{(a.GrudgeBoot||a.GrudgeRailwayBoot||++m>40)&&(clearInterval(s),a.GrudgeRailwayBoot?Promise.resolve(a.GrudgeRailwayBoot).then(r).catch(r):r())},50)}}try{l()||document.documentElement.classList.add("cdg-pending")}catch{}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",I):I(),a.GrudgeCharacterDesignGate={isLobbyMode:l,showDesign:P,enterLobby:h,readBuild:o,writeBuild:g,buildStateFromUI:C,applyPirateLobbyIfNeeded:u}})(typeof window<"u"?window:globalThis);function Q(a=0){const d=a*9999.123;function c(t,l){let o=Math.sin(t*127.1+l*311.7+d)*43758.5453;return o-Math.floor(o)}function e(t,l){const o=Math.floor(t),g=Math.floor(l),S=t-o,k=l-g,v=S*S*(3-2*S),L=k*k*(3-2*k),f=c(o,g),E=c(o+1,g),i=c(o,g+1),u=c(o+1,g+1);return f+(E-f)*v+(i-f)*L+(f-E-i+u)*v*L}return function(l,o){return e(l,o)*2-1}}const ne=Q(42);function F(a,d,c=0,e=0,t=120,l=ne){const o=a+c*t,g=d+e*t;let S=l(o/220,g/220);S=Math.sign(S)*Math.pow(Math.abs(S),1.2);const k=l(o/90,g/90),v=l(o/30,g/30);return S*20+k*1+v*1+1}function ie(a=z){const d=`
    precision mediump float;
    attribute vec3 offset;
    attribute vec2 worldOffset;
    attribute vec4 orientation;
    attribute float halfRootAngleSin;
    attribute float halfRootAngleCos;
    attribute float stretch;
    attribute float trail;
    attribute vec2 trailDir;
    uniform float time;
    uniform float bladeHeight;
    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=x0.x>x0.y?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    vec3 rotateVectorByQuaternion(vec3 v, vec4 q){
      return 2.0*cross(q.xyz,v*q.w+cross(q.xyz,v))+v;
    }
    vec4 slerp(vec4 v0, vec4 v1, float t){
      v0=normalize(v0); v1=normalize(v1);
      float d=dot(v0,v1);
      if(d<0.0){v1=-v1;d=-d;}
      if(d>0.9995){return normalize(t*(v1-v0)+v0);}
      float th0=acos(d), th=th0*t, s0=cos(th)-d*sin(th)/sin(th0), s1=sin(th)/sin(th0);
      return s0*v0+s1*v1;
    }
    void main(){
      frc=position.y/bladeHeight;
      float noise=0.5-snoise(vec2(time-worldOffset.x/50.0,time-worldOffset.y/50.0));
      vec4 direction=vec4(0.0,halfRootAngleSin,0.0,halfRootAngleCos);
      direction=slerp(direction,orientation,frc);
      vec3 vPosition=vec3(position.x,position.y+position.y*stretch,position.z);
      vPosition=rotateVectorByQuaternion(vPosition,direction);
      float halfAngle=noise*0.25;
      vPosition=rotateVectorByQuaternion(vPosition,normalize(vec4(sin(halfAngle),0.0,-sin(halfAngle),cos(halfAngle))));
      float t=clamp(trail,0.0,1.0)*3.25;
      if(t>0.001){
        float len=length(trailDir);
        if(len>0.0001){
          vec3 pushDir=normalize(vec3(trailDir.x,0.0,trailDir.y));
          vPosition+=pushDir*(t*frc*0.35);
        }
      }
      vUv=uv; vTrail=clamp(trail*0.3,0.0,1.0);
      vec4 worldPos=modelMatrix*vec4(offset+vPosition,1.0);
      vWorldPosition=worldPos.xyz;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(offset+vPosition,1.0);
    }
  `,c=`
    precision mediump float;
    uniform sampler2D map;
    uniform sampler2D alphaMap;
    uniform vec3 tipColor;
    uniform vec3 bottomColor;
    uniform float cloudTime;
    uniform float cloudScale;
    uniform float cloudIntensity;
    varying vec2 vUv;
    varying float frc;
    varying float vTrail;
    varying vec3 vWorldPosition;
    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
    float snoise(vec2 v){
      const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
      vec2 i=floor(v+dot(v,C.yy));
      vec2 x0=v-i+dot(i,C.xx);
      vec2 i1=x0.x>x0.y?vec2(1.0,0.0):vec2(0.0,1.0);
      vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
      i=mod289(i);
      vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
      vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
      m=m*m; m=m*m;
      vec3 x=2.0*fract(p*C.www)-1.0;
      vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
      m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
      vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
      return 130.0*dot(m,g);
    }
    void main(){
      float alpha=texture2D(alphaMap,vUv).r;
      if(alpha<0.15) discard;
      vec4 col=texture2D(map,vUv);
      col=mix(vec4(tipColor,1.0),col,frc);
      col=mix(vec4(bottomColor,1.0),col,frc);
      col.rgb=mix(col.rgb,vec3(0.0,0.15,0.0),clamp(vTrail,0.0,1.0));
      vec2 cloudUv=vec2((vWorldPosition.x+cloudTime*10.0)/cloudScale,(vWorldPosition.z+cloudTime*10.0)/cloudScale);
      float cloud=snoise(cloudUv)*0.5+0.5;
      col.rgb*=1.0-cloud*cloudIntensity;
      gl_FragColor=vec4(col.rgb,1.0);
    }
  `;return new a.ShaderMaterial({vertexShader:d,fragmentShader:c,uniforms:{time:{value:0},bladeHeight:{value:1.42},map:{value:null},alphaMap:{value:null},tipColor:{value:new a.Color(.45,.75,.22)},bottomColor:{value:new a.Color(.08,.28,.06)},cloudTime:{value:0},cloudScale:{value:80},cloudIntensity:{value:.18}},side:a.DoubleSide})}function we(a=.09,d=1.42){const c=new ue,e=a*.5,t=new Float32Array([-e,0,0,e,0,0,0,d,0,-e*.6,0,.01,e*.6,0,.01,0,d*.85,.01]),l=new Float32Array([0,0,1,0,.5,1,0,0,1,0,.5,1]);return c.setAttribute("position",new te(t,3)),c.setAttribute("uv",new te(l,2)),c.computeVertexNormals(),c}function se(a={},d=120,c=4e4,e=null,t=null,l=0,o=0,g=120,S=ne){const k=a.bW??.09,v=a.bH??1.42,L=ie();L.uniforms.bladeHeight.value=v,e&&(L.uniforms.map.value=e),t&&(L.uniforms.alphaMap.value=t);const f=we(k,v),E=new de;E.index=f.index,E.attributes.position=f.attributes.position,E.attributes.uv=f.attributes.uv,f.attributes.normal&&(E.attributes.normal=f.attributes.normal);const i=new Float32Array(c*3),u=new Float32Array(c*2),C=new Float32Array(c*4),p=new Float32Array(c),b=new Float32Array(c),w=new Float32Array(c),h=new Float32Array(c),_=new Float32Array(c*2);for(let I=0;I<c;I++){const r=(Math.random()-.5)*d,m=(Math.random()-.5)*d,s=F(r,m,l,o,g,S);i[I*3]=r,i[I*3+1]=s,i[I*3+2]=m,u[I*2]=r+l*g,u[I*2+1]=m+o*g;const n=Math.random()*Math.PI*2;C[I*4]=0,C[I*4+1]=Math.sin(n*.5),C[I*4+2]=0,C[I*4+3]=Math.cos(n*.5);const A=(Math.random()-.5)*.4;p[I]=Math.sin(A),b[I]=Math.cos(A),w[I]=.6+Math.random()*.8,h[I]=0,_[I*2]=0,_[I*2+1]=0}E.setAttribute("offset",new H(i,3)),E.setAttribute("worldOffset",new H(u,2)),E.setAttribute("orientation",new H(C,4)),E.setAttribute("halfRootAngleSin",new H(p,1)),E.setAttribute("halfRootAngleCos",new H(b,1)),E.setAttribute("stretch",new H(w,1));const y=new H(h,1);y.setUsage(ee),E.setAttribute("trail",y);const R=new H(_,2);R.setUsage(ee),E.setAttribute("trailDir",R);const P=new W(E,L);P.frustumCulled=!1,P.name="grass_blades",P.userData.layer="vegetation";const D=new V;return D.name=`grass_chunk_${l}_${o}`,D.add(P),D.userData.layer="vegetation",D.userData.grassMaterial=L,D.userData.trailArray=h,D.userData.trailDirArray=_,D.userData.offsetsArray=i,D.userData.trailAttribute=y,D.userData.trailDirAttribute=R,D.userData.terrainWidth=d,D.userData.chunkX=l,D.userData.chunkZ=o,D.tick=I=>{L.uniforms.time.value=I*.6,L.uniforms.cloudTime.value=I*.05},D}const O={bladeWidth:.09,bladeHeight:1.42,instancesHigh:4e4,instancesLow:5e3,chunkSize:120,tipColor:7585592,bottomColor:1328911};function $(a={}){const d=a.chunkX??0,c=a.chunkZ??0,e=a.chunkSize??O.chunkSize,t=!!a.lowDetail,l=a.noise2D||Q(d*17+c*31),o=new V;o.name=`terrain_layers_${d}_${c}`,o.userData.chunkX=d,o.userData.chunkZ=c,o.userData.layers={};const g=t?24:48,S=new ge(e,e,g,g);S.rotateX(-Math.PI/2);const k=S.attributes.position;for(let i=0;i<k.count;i++){const u=k.getX(i),C=k.getZ(i),p=F(u,C,d,c,e,l);k.setY(i,p)}k.needsUpdate=!0,S.computeVertexNormals();const v=new ae({color:4021288,roughness:.92,metalness:.05,map:a.groundMap||null,flatShading:!1});v.map&&(v.map.wrapS=v.map.wrapT=pe,v.map.repeat.set(8,8),v.map.colorSpace=fe);const L=new W(S,v);L.name="layer_surface",L.receiveShadow=!0,L.userData.layer="surface",o.add(L),o.userData.layers.surface=L;const f=t?O.instancesLow:O.instancesHigh,E=se({bW:O.bladeWidth,bH:O.bladeHeight},e,f,a.bladeDiffuse||null,a.bladeAlpha||null,d,c,e,l);if(E.name="layer_vegetation",o.add(E),o.userData.layers.vegetation=E,o.userData.grassMaterial=E.userData.grassMaterial,o.userData.trailArray=E.userData.trailArray,o.userData.trailDirArray=E.userData.trailDirArray,o.userData.offsetsArray=E.userData.offsetsArray,o.userData.trailAttribute=E.userData.trailAttribute,o.userData.trailDirAttribute=E.userData.trailDirAttribute,!t&&a.scatter!==!1){const i=new V;i.name="layer_detail",i.userData.layer="detail";const u=new me(.35,0),C=new ae({color:6972764,roughness:.95,metalness:.05}),p=18;for(let b=0;b<p;b++){const w=(Math.random()-.5)*e*.9,h=(Math.random()-.5)*e*.9,_=F(w,h,d,c,e,l);if(_<2.5&&Math.random()>.35)continue;const y=new W(u,C);y.position.set(w,_+.15,h),y.rotation.set(Math.random(),Math.random(),Math.random());const R=.5+Math.random()*1.4;y.scale.setScalar(R),y.castShadow=!0,y.receiveShadow=!0,i.add(y)}o.add(i),o.userData.layers.detail=i}return o.tick=i=>{E.tick&&E.tick(i)},o.userData.terrainWidth=e,o.userData.getHeight=(i,u)=>F(i,u,d,c,e,l),o}function K(a,d=z){a.background=new d.Color(8893908),a.fog=new d.Fog(10405080,80,280);const c=new d.HemisphereLight(13166847,3820064,.55);return c.name="pirate_hemi",a.add(c),c}const re={THREE:z,getTerrainHeight:F,createGrassTerrain:se,createGrassMaterial:ie,createNoise2D:Q,createTerrainChunk:$,applyPirateLobbyAtmosphere:K,GRASS_DEFAULTS:O,PLAYER_SCALE:4.2,TARGET_HEIGHT:1.8*4.2,layers:{L0:"height_field",L1:"surface",L2:"vegetation",L3:"detail"},spawnIslandChunk(a,d={}){if(!a)return null;const c=$({chunkX:d.chunkX??0,chunkZ:d.chunkZ??0,chunkSize:d.chunkSize??O.chunkSize,lowDetail:!!d.lowDetail,scatter:d.scatter!==!1}),e=(d.chunkX??0)*(d.chunkSize??O.chunkSize),t=(d.chunkZ??0)*(d.chunkSize??O.chunkSize);return c.position.set(e,0,t),a.add(c),c},ensurePirateLobby(a){a&&(a.userData._pirateLobbyBridge||(a.userData._pirateLobbyBridge=!0,K(a,z)))}};if(typeof window<"u"){window.GrudgeGrass=re,window.GrudgeTerrainLayers={createTerrainChunk:$,applyPirateLobbyAtmosphere:K,getTerrainHeight:F,GRASS_DEFAULTS:O};const a=()=>{window.world&&window.world.scene&&document.body.classList.contains("cdg-lobby")&&re.ensurePirateLobby(window.world.scene)};window.addEventListener("grudge:player-ready",a),setTimeout(a,500),setTimeout(a,2e3)}let j=null,X=null,J=null,Z=null,U=null,Y=null;const ve=a=>new Promise((d,c)=>{const e=document.createElement("script");e.src=a,e.onload=d,e.onerror=()=>c(new Error("Failed to load "+a)),document.body.appendChild(e)}),ye=(async()=>{try{if(window.GrudgeRailwayBoot)return await window.GrudgeRailwayBoot;const a=await N(()=>import("./sdk-bootstrap-BgXdIwut.js"),__vite__mapDeps([0,1,2]));if(a.railwayBootPromise)return await a.railwayBootPromise;if(window.GrudgeRailwayBoot)return await window.GrudgeRailwayBoot}catch(a){console.warn("[boot] Railway boot skipped:",a&&a.message)}return null})(),xe=new Promise((a,d)=>{const c=async()=>{try{await ye}catch{}setTimeout(()=>ve("/src/play/script.js").then(a,d),0)};document.readyState==="complete"?c():window.addEventListener("load",c,{once:!0})}).catch(a=>{throw console.error("[boot] script.js load failed:",a),a}),ke=(async()=>{try{const[a,d,c]=await Promise.all([N(()=>import("./three.module-wtWwtx49.js").then(e=>e.T),__vite__mapDeps([3,2])),N(()=>import("./SkeletonUtils-BsEBkbV3.js"),__vite__mapDeps([4,3,2])),N(()=>import("./GLTFLoader-BgOfuyaz.js"),__vite__mapDeps([5,3,2]))]);j=a,X=d,J=c.GLTFLoader,window.THREE_SkeletonUtils=X,window.THREE_GLTFLoader=J}catch(a){console.warn("[boot] core three.js addons unavailable:",a&&a.message)}})(),Se=(async()=>{try{Z=(await N(()=>import("./FBXLoader-6TyEAAlZ.js"),__vite__mapDeps([6,3,2]))).FBXLoader,window.THREE_FBXLoader=Z}catch(a){console.warn("[boot] FBXLoader unavailable:",a&&a.message)}})(),Ae=(async()=>{try{const a=await N(()=>import("./DRACOLoader-D2apF66B.js"),__vite__mapDeps([7,3,2]));U=new a.DRACOLoader,U.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"),U.setDecoderConfig({type:"js"}),window.THREE_DRACOLoader=U}catch(a){console.warn("[boot] DRACOLoader unavailable:",a&&a.message)}})(),_e=(async()=>{try{Y=(await N(()=>import("./sandbox-spawner-9iXduDLP.js"),[])).createGrudgeSandbox}catch(a){console.warn("[boot] sandbox-spawner unavailable:",a&&a.message)}})();try{let l=function(i){t=i,g(i),document.getElementById("modal-backdrop").classList.add("visible")},o=function(){document.getElementById("equipment").classList.remove("visible"),document.getElementById("modal-backdrop").classList.remove("visible")},g=function(i){const u=document.getElementById("equipment");if(!u)return;const C=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.getRaceById&&i.character?window.GrudgePlayerConfig.getRaceById(i.character.id):null,b="Sandbox"+(C?" · "+C.label:"");u.innerHTML='<button class="modal-close" aria-label="Close">✕</button><h2>'+b+'</h2><div class="tabs">  <button class="tab" data-tab="gear">Gear</button>  <button class="tab" data-tab="spawn">Spawn</button>  <button class="tab" data-tab="preset">Preset</button></div><div class="tab-body" data-tab-body="gear"></div><div class="tab-body" data-tab-body="spawn"></div><div class="tab-body" data-tab-body="preset"></div>',u.querySelector(".modal-close").addEventListener("click",o),u.querySelectorAll(".tab").forEach(w=>{w.addEventListener("click",()=>{e=w.dataset.tab,g(i)})}),S(i,u.querySelector('[data-tab-body="gear"]')),k(i,u.querySelector('[data-tab-body="spawn"]')),v(i,u.querySelector('[data-tab-body="preset"]')),u.querySelectorAll(".tab").forEach(w=>w.classList.toggle("active",w.dataset.tab===e)),u.querySelectorAll(".tab-body").forEach(w=>w.classList.toggle("active",w.dataset.tabBody===e)),u.classList.add("visible")},S=function(i,u){if(u.innerHTML="",!i.equipment){u.innerHTML='<div class="empty-msg">No modular equipment on this rig.</div>';return}const C=i.equipment.getGroupedSlots?i.equipment.getGroupedSlots():{},p=["armor","weapons","shields","utility"],b=["axe","hammer","sword","pick","spear","bow","staff","shield"];let w=!1;for(const h of p){const _=C[h];if(!_||!Object.keys(_).length)continue;w=!0;const y=document.createElement("div");y.className="group",y.innerHTML='<div class="group-label">'+h+"</div>";for(const[R,P]of Object.entries(_)){const D=document.createElement("div");D.className="slot-row",D.innerHTML='<span class="slot-name">'+R+"</span>";for(const I of P.variants){const r=document.createElement("button");r.className="variant-btn"+(P.equipped===I?" equipped":""),r.textContent=I==="_default"?"✓":I,r.addEventListener("click",()=>{P.equipped===I?i.equipment.unequip(R):b.indexOf(R)>=0?i.equipment.equipWeapon(R,I):i.equipment.equip(R,I),g(i)}),D.appendChild(r)}y.appendChild(D)}u.appendChild(y)}if(i.equipment.hasParts&&i.equipment.hasParts()){w=!0;const h=i.equipment.getParts(),_=document.createElement("div");_.className="group",_.innerHTML='<div class="group-label">parts</div>',Object.keys(h).sort().forEach(y=>{const R=h[y],P=document.createElement("div");P.className="slot-row",P.innerHTML='<span class="slot-name">'+y+"</span>";const D=document.createElement("button");D.className="variant-btn"+(R.visible?" equipped":""),D.textContent=R.visible?"✓":"·",D.title=R.visible?"Hide":"Show",D.addEventListener("click",()=>{i.equipment.togglePart(y),g(i)}),P.appendChild(D),_.appendChild(P)}),u.appendChild(_)}w||(u.innerHTML='<div class="empty-msg">No equipment slots discovered.</div>')},k=function(i,u){const C=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.SPAWN_CATALOG||[],p=!!(i.character&&i.character.useStore);if(u.innerHTML='<div class="group-label">Drop Bip001 NPCs &middot; '+(p?"ObjectStore CDN":"Local FBX")+"</div>",!C.length){u.innerHTML+='<div class="empty-msg">No spawn catalog loaded.</div>';return}for(const _ of C){const y=document.createElement("div");y.className="spawn-row",y.innerHTML='<span class="spawn-label">'+_.label+"</span>";const R=document.createElement("button");R.className="spawn-btn",R.textContent="Spawn",R.addEventListener("click",()=>{window.GrudgeSandbox.spawnCharacter(_.characterId,{preset:d,useStore:p}).then(()=>g(i)).catch(P=>console.warn("[sandbox] spawn failed:",P))}),y.appendChild(R),u.appendChild(y)}const b=window.GrudgeSandbox.spawned.length,w=document.createElement("div");w.className="spawn-count",w.textContent="Active spawns: "+b+(d?"  ·  preset: "+d:""),u.appendChild(w);const h=document.createElement("div");h.className="row-actions",h.innerHTML='<button data-act="clear" class="danger">Clear All</button><button data-act="ring">Spawn Ring</button>',h.querySelector('[data-act="clear"]').addEventListener("click",()=>{window.GrudgeSandbox.removeAll(),g(i)}),h.querySelector('[data-act="ring"]').addEventListener("click",async()=>{const _=C.map(y=>y.characterId);for(let y=0;y<_.length;y++)await window.GrudgeSandbox.spawnCharacter(_[y],{angle:y/_.length*Math.PI*2,radius:6*4.2,preset:d,useStore:p}).catch(R=>console.warn("[sandbox] ring spawn failed:",R));g(i)}),u.appendChild(h)},v=function(i,u){const C=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.LOADOUT_PRESETS||[];if(u.innerHTML='<div class="group-label">Loadout presets</div>',!C.length){u.innerHTML+='<div class="empty-msg">No presets defined.</div>';return}for(const b of C){const w=document.createElement("div");w.className="preset-row";const h=document.createElement("span");h.className="preset-label",h.innerHTML=(b.icon||"")+" "+b.label+'<span class="preset-sub">'+b.description+"</span>",w.appendChild(h);const _=document.createElement("button");_.className="preset-btn",_.textContent="Apply",_.addEventListener("click",()=>{i.equipment&&i.equipment.applyLoadout&&i.equipment.applyLoadout(b.loadout),g(i)}),w.appendChild(_);const y=document.createElement("button");y.className="variant-btn"+(d===b.id?" equipped":""),y.textContent=d===b.id?"✓":"Arm",y.title="Use this preset for the next spawn",y.addEventListener("click",()=>{d=d===b.id?null:b.id,g(i)}),w.appendChild(y),u.appendChild(w)}const p=document.createElement("div");p.className="row-actions",p.innerHTML='<button data-act="strip">Strip Gear</button>',p.querySelector('[data-act="strip"]').addEventListener("click",()=>{i.equipment&&(i.equipment.unequipAllWeapons(),["body","arms","legs","head","shoulders"].forEach(b=>i.equipment.unequip(b)),g(i))}),u.appendChild(p)},L=function(i){const u=new URL(window.location.href);u.searchParams.set("store",i?"1":"0"),window.location.href=u.toString()},f=function(i){const u=document.getElementById("main-panel");if(!u)return;const C=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.RACES||[],p=i&&i.character&&i.character.id||null,b=!!(i&&i.character&&i.character.useStore);u.innerHTML='<div class="mp-title">Race</div>';for(const h of C){const _=document.createElement("div");_.className="race-tile"+(h.id===p?" active":""),_.style.setProperty("--race-color",h.color),_.title=h.description+(h.passive?" — "+h.passive:"");const y=h.objectStore?'<span class="rt-store">CDN</span>':"";_.innerHTML=y+'<div class="rt-emoji">'+(h.emoji||"⛰")+'</div><div class="rt-name">'+h.label.replace(/\s*\(.*\)$/,"")+'</div><div class="rt-trait">'+h.trait+'</div><div class="rt-faction">'+h.faction+'</div><button class="rt-gear" type="button">Gear</button>',_.addEventListener("click",R=>{if(R.target.classList.contains("rt-gear"))return;if(h.id===p){l(i);return}const P=new URL(window.location.href);P.searchParams.set("char",h.id),window.location.href=P.toString()}),_.querySelector(".rt-gear").addEventListener("click",R=>{if(R.stopPropagation(),h.id===p)l(i);else{const P=new URL(window.location.href);P.searchParams.set("char",h.id),P.searchParams.set("gear","1"),window.location.href=P.toString()}}),u.appendChild(_)}const w=document.createElement("div");w.className="mp-source",w.innerHTML='<div class="mp-source-label">Source</div><div class="mp-source-switch" role="group" aria-label="Asset source">  <button type="button" data-src="1" class="'+(b?"active":"")+'">CDN</button>  <button type="button" data-src="0" class="'+(b?"":"active")+'">Local</button></div>',w.querySelectorAll("button[data-src]").forEach(h=>{h.addEventListener("click",()=>{const _=h.dataset.src==="1";_!==b&&L(_)})}),u.appendChild(w)},E=function(i){const u=[{key:"1",slot:"Skill1"},{key:"2",slot:"Skill2"},{key:"3",slot:"Skill3"},{key:"4",slot:"Skill4"},{key:"5",slot:"Skill5"},{key:"6",slot:"Skill6"},{key:"7",slot:"Skill7"},{key:"8",slot:"Skill8"},{key:"9",slot:"Skill9"}];document.querySelectorAll("#hud .hud-hotbar .slot").forEach((p,b)=>{const w=u[b];if(!w)return;const h=i.hasAction&&i.hasAction(w.slot);p.classList.toggle("bound",!!h),p.classList.toggle("empty",!h)})};document.getElementById("modal-backdrop").addEventListener("click",o),window.addEventListener("keydown",i=>{i.key==="Escape"&&o()});const a=i=>{const u=i.detail.player;f(u),E(u);try{const b=new URLSearchParams(window.location.search);if(b.get("gear")==="1"){l(u),b.delete("gear");const w=b.toString(),h=window.location.pathname+(w?"?"+w:"")+window.location.hash;window.history.replaceState(null,"",h)}}catch{}let C=0;const p=setInterval(()=>{E(u),++C>20&&clearInterval(p)},500)};if(window.addEventListener("grudge:player-ready",a),window.GrudgeReadyBuffer&&a(window.GrudgeReadyBuffer),await xe,await Promise.allSettled([ke,Se,Ae,_e]),Y){const i=Y(j,{FBX:Z,GLTF:J,SkeletonUtils:X,DRACO:U},{getScene:()=>window.world&&window.world.scene,getTerrainY:(C,p)=>window.world&&window.world._getTerrainHeightAtWorld?window.world._getTerrainHeightAtWorld(C,p):0,getPlayerPos:()=>window.world&&window.world.player?window.world.player.group.position:new j.Vector3,playerScale:4.2});window.GrudgePlayerConfig&&(window.GrudgePlayerConfig._sandboxLoaded=!0),window.GrudgeSandbox=i;const u=new j.Clock;(function C(){i.update(Math.min(u.getDelta(),.1)),requestAnimationFrame(C)})()}let d=null;const c=window.GrudgePlayerConfig;if(c&&c.CHARACTERS){const i=document.getElementById("char-select"),u=c.resolveCharacter();for(const b of c.CHARACTERS){const w=document.createElement("option");w.value=b.id,w.textContent=b.label,b.id===u.id&&(w.selected=!0),i.appendChild(w)}i.addEventListener("change",b=>{const w=new URL(window.location.href);w.searchParams.set("char",b.target.value),window.location.href=w.toString()});const C=document.getElementById("hud-name");C&&(C.textContent=u.label);const p=document.getElementById("hud-sub");if(p){const b=u.useStore?"CDN":"local";p.textContent=(u.rigType||"").toUpperCase()+" rig · "+b+" · ?char="+u.id}}let e="gear",t=null}catch(a){console.error("[boot] failed:",a);const d=document.querySelector("#info .controls");d&&(d.textContent="Failed to boot: "+a.message)}
//# sourceMappingURL=play-rbh4UygQ.js.map

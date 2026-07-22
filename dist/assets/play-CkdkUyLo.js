const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/SkeletonUtils-CB3N-7u7.js","assets/three.module-BnjPqKkK.js","assets/GLTFLoader-BNkt41q3.js","assets/FBXLoader-CfHw6hYW.js","assets/DRACOLoader-OqCk_kFd.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";import{T as z,aw as he,ax as O,ay as te,M as V,az as $,aA as be,a9 as ae,w as we,aB as oe,al as ve,a1 as ye,aC as xe}from"./three.module-BnjPqKkK.js";import{G,o as ke,D as le,W as Se,a as Ae}from"./catalog-BootiB2w.js";const _e="modulepreload",Le=function(a){return"/"+a},ne={},H=function(l,i,e){let t=Promise.resolve();if(i&&i.length>0){let S=function(k){return Promise.all(k.map(x=>Promise.resolve(x).then(L=>({status:"fulfilled",value:L}),L=>({status:"rejected",reason:L}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),u=o?.nonce||o?.getAttribute("nonce");t=S(i.map(k=>{if(k=Le(k),k in ne)return;ne[k]=!0;const x=k.endsWith(".css"),L=x?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${k}"]${L}`))return;const f=document.createElement("link");if(f.rel=x?"stylesheet":_e,x||(f.as="script"),f.crossOrigin="",f.href=k,u&&f.setAttribute("nonce",u),document.head.appendChild(f),x)return new Promise((D,r)=>{f.addEventListener("load",D),f.addEventListener("error",()=>r(new Error(`Unable to preload CSS for ${k}`)))})}))}function s(o){const u=new Event("vite:preloadError",{cancelable:!0});if(u.payload=o,window.dispatchEvent(u),!u.defaultPrevented)throw o}return t.then(o=>{for(const u of o||[])u.status==="rejected"&&s(u.reason);return l().catch(s)})};(function(a){const l=[{slot:"body",re:/^Units_Body_([A-Z])$/i,group:"armor"},{slot:"arms",re:/^Units_Arms_([A-Z])$/i,group:"armor"},{slot:"legs",re:/^Units_Legs_([A-Z])$/i,group:"armor"},{slot:"head",re:/^Units_head_([A-Z])$/i,group:"armor"},{slot:"shoulders",re:/^Units_shoulderpads_([A-Z])$/i,group:"armor"},{slot:"axe",re:/(?:Units_|weapon_)axe_([A-Z])$/i,group:"weapon_r"},{slot:"hammer",re:/(?:Units_|weapon_)hammer_([A-Z])$/i,group:"weapon_r"},{slot:"sword",re:/(?:Units_|weapon_)[Ss]word_([A-Z])$/i,group:"weapon_r"},{slot:"pick",re:/(?:Units_|weapon_)pick$/i,group:"weapon_r",noVariant:!0},{slot:"spear",re:/(?:Units_|weapon_)[Ss]pear$/i,group:"weapon_r",noVariant:!0},{slot:"bow",re:/(?:Units_|weapon_)[Bb]ow$/i,group:"weapon_l",noVariant:!0},{slot:"staff",re:/(?:Units_|weapon_)staff_([A-Z])$/i,group:"weapon_l"},{slot:"shield",re:/(?:Units_|)[Ss]hield_([A-Z])$/i,group:"shield"},{slot:"bag",re:/(?:Xtra_|Units_)bag$/i,group:"utility",noVariant:!0},{slot:"wood",re:/(?:Xtra_|Units_)wood$/i,group:"utility",noVariant:!0},{slot:"quiver",re:/(?:Xtra_|Units_)quiver$/i,group:"utility",noVariant:!0}];function i(e){this.prefix=e||"",this.slots={},this.equipped={},this._allMeshes=[],this._parts={},this.bones={}}i.prototype.catalog=function(e){this.root=e,this.slots={},this._allMeshes=[],this._parts={},this.bones.rightHand=e.getObjectByName("R_hand_container")||null,this.bones.leftHand=e.getObjectByName("L_hand_container")||null,this.bones.leftShield=e.getObjectByName("L_shield_container")||null,this.bones.bag=e.getObjectByName("Bone_bag")||null,this.bones.wood=e.getObjectByName("Bone_wood")||null,this.bones.quiver=e.getObjectByName("Quiver_container")||null;const t=this;return e.traverse(function(s){if(!s.isMesh&&!s.isSkinnedMesh)return;const o=s.name||"",u=o.indexOf(t.prefix)===0?o.slice(t.prefix.length):o;let S=!1;for(let k=0;k<l.length;k++){const x=l[k],L=u.match(x.re);if(!L)continue;const f=x.noVariant?"_default":(L[1]||L[2]||"_default").toUpperCase();t.slots[x.slot]||(t.slots[x.slot]={}),t.slots[x.slot][f]=s,s.userData.equipSlot=x.slot,s.userData.equipVariant=f,s.userData.equipGroup=x.group,t._allMeshes.push(s),s.visible=!1,S=!0;break}!S&&o&&(t._parts[o]=s,s.userData.equipPart=o)}),this._autoEquipDefaults(),this.getSlotSummary()},i.prototype._autoEquipDefaults=function(){const e=["body","arms","legs","head"];for(let t=0;t<e.length;t++){const s=this.slots[e[t]];if(!s)continue;const o=Object.keys(s).sort();o[0]&&this.equip(e[t],o[0])}},i.prototype.equip=function(e,t){const s=this.slots[e];if(!s)return!1;const o=Object.entries(s);for(let u=0;u<o.length;u++){const S=o[u][0],k=o[u][1];k.visible=S===t}return this.equipped[e]=t,!0},i.prototype.unequip=function(e){const t=this.slots[e];if(!t)return;const s=Object.values(t);for(let o=0;o<s.length;o++)s[o].visible=!1;delete this.equipped[e]},i.prototype.toggle=function(e,t){this.equipped[e]===t?this.unequip(e):this.equip(e,t)},i.prototype.unequipAllWeapons=function(){for(let t=0;t<this._allMeshes.length;t++){const s=this._allMeshes[t],o=s.userData.equipGroup;(o==="weapon_r"||o==="weapon_l"||o==="shield")&&(s.visible=!1)}const e=["axe","hammer","sword","pick","spear","bow","staff","shield"];for(let t=0;t<e.length;t++)delete this.equipped[e[t]]},i.prototype.equipWeapon=function(e,t){typeof t>"u"&&(t="_default");let s=null;for(let o=0;o<l.length;o++)if(l[o].slot===e){s=l[o];break}if(!s)return!1;for(let o=0;o<this._allMeshes.length;o++){const u=this._allMeshes[o];u.userData.equipGroup===s.group&&(u.visible=!1,delete this.equipped[u.userData.equipSlot])}return this.equip(e,t)},i.prototype.getSlotSummary=function(){const e={},t=Object.entries(this.slots);for(let s=0;s<t.length;s++)e[t[s][0]]=Object.keys(t[s][1]).sort();return e},i.prototype.getGroupedSlots=function(){const e={armor:{},weapons:{},shields:{},utility:{}},t=Object.entries(this.slots);for(let s=0;s<t.length;s++){const o=t[s][0],u=t[s][1];let S=null;for(let x=0;x<l.length;x++)if(l[x].slot===o){S=l[x];break}if(!S)continue;const k=S.group==="weapon_r"||S.group==="weapon_l"?"weapons":S.group==="shield"?"shields":S.group;e[k][o]={variants:Object.keys(u).sort(),equipped:this.equipped[o]||null}}return e},i.prototype.showAll=function(){for(let e=0;e<this._allMeshes.length;e++)this._allMeshes[e].visible=!0},i.prototype.hideAll=function(){for(let e=0;e<this._allMeshes.length;e++)this._allMeshes[e].visible=!1},i.prototype.applyLoadout=function(e){if(!e||typeof e!="object")return[];const t=["axe","hammer","sword","pick","spear","bow","staff","shield"],s=[];this.unequipAllWeapons();const o=Object.keys(e);for(let u=0;u<o.length;u++){const S=o[u],k=e[S],x=this.slots[S];if(!x||!x[k])continue;(t.indexOf(S)>=0?this.equipWeapon(S,k):this.equip(S,k))&&s.push(S)}return s},i.prototype.getParts=function(){const e={},t=Object.keys(this._parts);for(let s=0;s<t.length;s++){const o=this._parts[t[s]];e[t[s]]={visible:!!o.visible,mesh:o}}return e},i.prototype.togglePart=function(e,t){const s=this._parts[e];return s?(s.visible=typeof t=="boolean"?t:!s.visible,s.visible):!1},i.prototype.hasParts=function(){return Object.keys(this._parts).length>0},Object.defineProperty(i.prototype,"meshCount",{get:function(){return this._allMeshes.length}}),Object.defineProperty(i.prototype,"partCount",{get:function(){return Object.keys(this._parts).length}}),a.GrudgeEquipmentManager=i})(typeof window<"u"?window:globalThis);(function(a){const l="/character/races/",i="/Character-Animator-Mapper/Character-Animator-Mapper/attached_assets/extracted/",e={locomotion:i+"locomotion/",action:i+"action/",sword:i+"sword_shield/",longbow:i+"longbow/",magic:i+"magic/",pistol:i+"pistol/",rifle:i+"rifle/",unarmed:i+"unarmed/"};function t(d){return{url:d,rig:"mixamo"}}function s(d){return{url:d,rig:"bip001"}}const o="/character/races/textures/",u=[{id:"human",label:"Human (WK)",file:"WK_Characters.glb",prefix:"WK_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"human/default.png",meta:{color:"#94a3b8",faction:"crusade",trait:"Adaptable",emoji:"🧑",description:"Versatile and adaptable — masters of none, capable of all.",passive:"+1 to all attributes"}},{id:"barbarian",label:"Barbarian (BRB)",file:"BRB_Characters.glb",prefix:"BRB_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"barbarian/default.png",meta:{color:"#f43f5e",faction:"crusade",trait:"Berserker Rage",emoji:"🪓",description:"Untamed fury given form — raw power and relentless aggression.",passive:"+3 STR, +2 AGI, +1 VIT, +1 END, +1 TAC"}},{id:"elf",label:"Elf (ELF)",file:"ELF_Characters.glb",prefix:"ELF_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"elf/highelves.png",meta:{color:"#22d3ee",faction:"fabled",trait:"Arcane Affinity",emoji:"🧝",description:"Ancient and graceful — wielders of arcane arts and deadly precision.",passive:"+3 INT, +2 DEX, +2 AGI, +1 WIS"}},{id:"dwarf",label:"Dwarf (DWF)",file:"DWF_Characters.glb",prefix:"DWF_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"dwarf/default.png",meta:{color:"#f59e0b",faction:"fabled",trait:"Stoneborn",emoji:"⛏",description:"Stout mountain folk — unyielding defense and masterful craftsmanship.",passive:"+3 END, +2 VIT, +1 STR, +1 DEX, +1 WIS"}},{id:"orc",label:"Orc (ORC)",file:"ORC_Characters.glb",prefix:"ORC_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"orc/default.png",meta:{color:"#65a30d",faction:"legion",trait:"Bloodrage",emoji:"👹",description:"Savage brutes bred for war — crushing power and iron will.",passive:"+4 STR, +2 VIT, +2 END"}},{id:"undead",label:"Undead (UD)",file:"UD_Characters.glb",prefix:"UD_",scale:4.2,yOffset:0,rigType:"bip001",texture:o+"undead/default.png",meta:{color:"#a78bfa",faction:"legion",trait:"Undying Will",emoji:"💀",description:"Death-touched revenants fueled by dark energy and grudges unresolved.",passive:"+3 VIT, +2 END, +2 WIS, +1 STR"}}].map(function(d){return Object.assign({},d,{url:l+d.file})}),S="human";function k(){let d=null,h=null;try{const I=sessionStorage.getItem("grudge_active_build");I&&(h=JSON.parse(I))}catch{}try{d=new URLSearchParams(window.location.search).get("char")}catch{}if(!d&&h&&h.raceId&&(d=h.raceId),d){const I=u.find(function(U){return U.id===d});if(I){var y=I.texture;h&&(h.textureUrl?y=h.textureUrl:h.skinVariant&&(y=o+I.id+"/"+h.skinVariant+".png"));var C=Object.assign({},I,{texture:y,build:h});return h&&typeof h.worldScale=="number"&&(C.scale=h.worldScale),h&&typeof h.targetHeight=="number"&&(C.targetHeight=h.targetHeight),C}}return u.find(function(I){return I.id===S})||u[0]}const x=["Idle","Walk","Run","Jump","Fall","Block","RollLeft","RollRight"],L="/character/races/anims/",f={idle:s(L+"idle.glb"),walk:s(L+"walk.glb"),run:s(L+"run.glb"),attack:s(L+"attack.glb"),attackSpear:s(L+"attack-spear.glb"),cast:s(L+"cast.glb"),death:s(L+"death.glb")},D={unarmed:{Attack:[f.attack],Skill1:[f.attack],Skill2:[f.attack]},sword_shield:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attack],Skill1:[f.attack],Skill2:[f.attack],Death:[f.death]},spear_melee:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attackSpear],Skill1:[f.attackSpear],Skill2:[f.attackSpear],Death:[f.death]},magic:{Idle:[f.idle],Cast:[f.cast],Skill3:[f.cast],Skill4:[f.cast],Skill9:[f.cast],Death:[f.death]},longbow:{Idle:[f.idle],Walk:[f.walk],Run:[f.run],Attack:[f.attack],Skill7:[f.attack],Death:[f.death]},rifle:{Attack:[f.attack],Skill8:[f.attack]},pistol:{Attack:[f.attack],Skill8:[f.attack]}},r={Idle:[t(e.locomotion+"idle.fbx")],Walk:[t(e.locomotion+"walking.fbx")],Run:[t(e.locomotion+"running.fbx")],Jump:[t(e.locomotion+"jump.fbx")],Fall:[t(e.action+"falling idle.fbx")],StrafeL:[t(e.locomotion+"left strafe walking.fbx")],StrafeR:[t(e.locomotion+"right strafe walking.fbx")],TurnL:[t(e.locomotion+"left turn 90.fbx")],TurnR:[t(e.locomotion+"right turn 90.fbx")],Attack:[t(e.sword+"sword and shield attack.fbx")],Attack2:[t(e.sword+"sword and shield attack (2).fbx")],Attack3:[t(e.sword+"sword and shield attack (3).fbx")],Attack4:[t(e.sword+"sword and shield attack (4).fbx")],Block:[t(e.sword+"sword and shield block.fbx")],DrawSword:[t(e.sword+"draw sword 1.fbx")],SheathSword:[t(e.sword+"sheath sword 1.fbx")],Roll:[t(e.action+"falling to roll.fbx")],RollLeft:[t(e.locomotion+"left strafe.fbx")],RollRight:[t(e.locomotion+"right strafe.fbx")],Dodge:[t(e.action+"falling to roll.fbx")],Dash:[t(e.locomotion+"running.fbx")],Climb:[t(e.action+"stand to cover.fbx")],Sneak:[t(e.action+"crouched sneaking left.fbx")],SneakL:[t(e.action+"left cover sneak.fbx")],SneakR:[t(e.action+"right cover sneak.fbx")],Swim:[t(e.locomotion+"walking.fbx")],Kick:[t(e.unarmed+"lead_jab.fbx")],Punch:[t(e.unarmed+"lead_jab.fbx")],Cast:[t(e.magic+"Standing 1H Magic Attack 01.fbx")],Cast2H:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Teleport:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Channel:[t(e.magic+"standing idle.fbx")],Death:[t(e.magic+"Standing React Death Backward.fbx")],HitLarge:[t(e.magic+"Standing React Large From Front.fbx")],HitSmall:[t(e.magic+"Standing React Small From Front.fbx")],BowIdle:[t(e.longbow+"standing idle 01.fbx")],BowRunF:[t(e.longbow+"standing run forward.fbx")],BowRunB:[t(e.longbow+"standing run back.fbx")],BowRunL:[t(e.longbow+"standing run left.fbx")],BowRunR:[t(e.longbow+"standing run right.fbx")],PistolIdle:[t(e.pistol+"pistol idle.fbx")],PistolRun:[t(e.pistol+"pistol run.fbx")],PistolJump:[t(e.pistol+"pistol jump.fbx")],RifleIdle:[t(e.rifle+"idle aiming.fbx")],RifleRun:[t(e.rifle+"run forward.fbx")],Skill1:[t(e.sword+"sword and shield attack.fbx")],Skill2:[t(e.sword+"sword and shield attack (2).fbx")],Skill3:[t(e.magic+"Standing 1H Magic Attack 01.fbx")],Skill4:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")],Skill5:[t(e.action+"falling to roll.fbx")],Skill6:[t(e.unarmed+"lead_jab.fbx")],Skill7:[t(e.longbow+"standing run forward.fbx")],Skill8:[t(e.rifle+"idle aiming.fbx")],Skill9:[t(e.magic+"Standing 2H Magic Area Attack 02.fbx")]};function c(d){const h=(d||"").toLowerCase();return h?h==="sword_shield"||h==="1h-shield"?"sword_shield":h==="2h-melee"?"spear_melee":h==="longbow"?"longbow":h==="magic"?"magic":h==="rifle"?"rifle":h==="pistol"?"pistol":h==="unarmed"?"unarmed":"":""}function E(d){const h=d&&d.equipped?d.equipped:null;if(!h)return"";const y=["staff","bow","spear","sword","axe","hammer","pick"];for(let C=0;C<y.length;C++){const P=y[C];if(h[P])return P}return""}function p(d){const h=d&&d.build?d.build:null,y=c(h&&h.animationPack);if(y)return y;const C=E(h);return C==="staff"?"magic":C==="bow"?"longbow":C==="spear"?"spear_melee":C?"sword_shield":"unarmed"}const b={Cast:{kind:"spell-bolt",color:"#9ab8ff",duration:.6,sound:"cast"},Cast2H:{kind:"spell-aoe",color:"#a78bfa",duration:1.2,sound:"cast-aoe"},Teleport:{kind:"teleport",color:"#22d3ee",duration:.45,sound:"teleport"},Channel:{kind:"channel-aura",color:"#7dd3fc",duration:1.5,sound:"channel"},Roll:{kind:"dust-puff",color:"#d4a373",duration:.35,sound:"roll"},Dash:{kind:"dash-trail",color:"#f5e2c1",duration:.3,sound:"dash"},Skill3:{kind:"spell-bolt",color:"#9ab8ff",duration:.6,sound:"cast"},Skill4:{kind:"spell-aoe",color:"#a78bfa",duration:1.2,sound:"cast-aoe"},Skill9:{kind:"spell-aoe",color:"#f43f5e",duration:1.5,sound:"ult"}};function w(d){const h=p(d),y=D[h]||{},C={};return x.concat(n.filter(function(I){return x.indexOf(I)===-1})).forEach(function(I){const U=I.toLowerCase().replace("rollleft","roll-left").replace("rollright","roll-right"),ge=r[I]||[],pe={url:L+d.id+"."+U+".fbx",rig:"bip001"},fe={url:L+U+".fbx",rig:"bip001"},me=y[I]||[];C[I]=[pe,fe].concat(me,ge)}),C}const v={"mixamorig:Hips":"Bip001 Pelvis","mixamorig:Spine":"Bip001 Spine","mixamorig:Spine1":"Bip001 Spine","mixamorig:Spine2":"Bip001 Spine","mixamorig:Neck":"Bip001 Neck","mixamorig:Head":"Bip001 Head","mixamorig:LeftShoulder":"Bip001 L Clavicle","mixamorig:LeftArm":"Bip001 L UpperArm","mixamorig:LeftForeArm":"Bip001 L Forearm","mixamorig:LeftHand":"Bip001 L Hand","mixamorig:RightShoulder":"Bip001 R Clavicle","mixamorig:RightArm":"Bip001 R UpperArm","mixamorig:RightForeArm":"Bip001 R Forearm","mixamorig:RightHand":"Bip001 R Hand","mixamorig:LeftUpLeg":"Bip001 L Thigh","mixamorig:LeftLeg":"Bip001 L Calf","mixamorig:LeftFoot":"Bip001 L Foot","mixamorig:LeftToeBase":"Bip001 L Toe0","mixamorig:RightUpLeg":"Bip001 R Thigh","mixamorig:RightLeg":"Bip001 R Calf","mixamorig:RightFoot":"Bip001 R Foot","mixamorig:RightToeBase":"Bip001 R Toe0"},A={urls:["https://threejs.org/examples/models/gltf/Soldier.glb"],rigType:"mixamo",clips:{Idle:[/idle/i],Walk:[/walk/i],Run:[/run/i],Jump:[/jump/i,/walk/i],Fall:[/fall/i,/idle/i],Block:[/block/i,/idle/i],RollLeft:[/roll.*left|left.*roll|dodge.*left/i,/run/i],RollRight:[/roll.*right|right.*roll|dodge.*right/i,/run/i]}},_={move:{forward:"KeyW",back:"KeyS",left:"KeyA",right:"KeyD"},sprint:"ShiftLeft",jump:"Space",block:"ShiftRight",rollLeft:"KeyQ",rollRight:"KeyE",interact:"KeyF",hotbar:{1:"Digit1",2:"Digit2",3:"Digit3",4:"Digit4",5:"Digit5",6:"Digit6",7:"Digit7",8:"Digit8"}},R={},n=["Idle","Walk","Run","Jump","Fall","StrafeL","StrafeR","TurnL","TurnR","Attack","Attack2","Attack3","Attack4","Block","DrawSword","SheathSword","Roll","RollLeft","RollRight","Dodge","Dash","Climb","Sneak","SneakL","SneakR","Swim","Kick","Punch","Cast","Cast2H","Teleport","Channel","Death","HitLarge","HitSmall","BowIdle","BowRunF","BowRunB","BowRunL","BowRunR","PistolIdle","PistolRun","PistolJump","RifleIdle","RifleRun","Skill1","Skill2","Skill3","Skill4","Skill5","Skill6","Skill7","Skill8","Skill9"],m=[{id:"knight",label:"Knight",description:"Heavy plate, sword & shield.",icon:"⚔",loadout:{body:"C",arms:"C",legs:"C",head:"D",shoulders:"B",sword:"A",shield:"A"}},{id:"berserker",label:"Berserker",description:"Light armor, dual axes.",icon:"⛏",loadout:{body:"B",arms:"B",legs:"B",head:"B",axe:"A"}},{id:"archer",label:"Archer",description:"Cloth + leather, bow & quiver.",icon:"🏹",loadout:{body:"A",arms:"A",legs:"A",head:"A",bow:"_default",quiver:"_default"}},{id:"mage",label:"Mage",description:"Robes and a staff.",icon:"🔮",loadout:{body:"D",arms:"D",legs:"C",head:"E",staff:"A"}},{id:"tank",label:"Tank",description:"Maximum plate, hammer & tower shield.",icon:"🛡",loadout:{body:"E",arms:"D",legs:"C",head:"F",shoulders:"B",hammer:"A",shield:"B"}},{id:"spearman",label:"Spearman",description:"Mid armor, spear & shield.",icon:"🎯",loadout:{body:"B",arms:"B",legs:"B",head:"C",spear:"_default",shield:"A"}},{id:"miner",label:"Miner",description:"Civilian outfit, pick & bag.",icon:"⛏",loadout:{body:"A",arms:"A",legs:"A",head:"A",pick:"_default",bag:"_default"}},{id:"lumberjack",label:"Lumberjack",description:"Civilian outfit, hand-axe & log.",icon:"🪵",loadout:{body:"A",arms:"A",legs:"A",head:"B",axe:"B",wood:"_default"}}];function g(d){return m.find(function(h){return h.id===d})||null}const B=u.map(function(d){return{id:"spawn_"+d.id,kind:"character",label:d.label,characterId:d.id,defaultPreset:null}}),T=u.map(function(d){return{id:d.id,label:d.label,url:d.url,objectStore:d.objectStore,prefix:d.prefix,scale:d.scale,rigType:d.rigType,texture:d.texture,color:d.meta&&d.meta.color||"#c9950a",faction:d.meta&&d.meta.faction||"neutral",trait:d.meta&&d.meta.trait||"",emoji:d.meta&&d.meta.emoji||"",description:d.meta&&d.meta.description||"",passive:d.meta&&d.meta.passive||""}});a.GrudgePlayerConfig={CHARACTERS:u,RACES:T,DEFAULT_CHARACTER_ID:S,ANIMATION_STATES:x,ANIMATION_STATES_BIP001:n,CC_BONE_MAP:R,BIP001_BONE_MAP:v,FALLBACK_BUNDLE:A,CONTROLLER_BINDINGS:_,LOADOUT_PRESETS:m,SPAWN_CATALOG:B,SPELL_VFX:b,SHARED_ANIMS:r,UNITY_DIR:i,UNITY:e,TEXTURE_DIR:o,resolveCharacter:k,animationSourcesFor:w,getLoadoutPreset:g,getSpellVfx:function(d){return b[d]||null},getCharacter:function(d){return u.find(function(h){return h.id===d})||null},getRaceById:function(d){return T.find(function(h){return h.id===d})||null}}})(typeof window<"u"?window:globalThis);(function(a){const l="grudge_active_build",i={human:["default"],barbarian:["default"],elf:["highelves","default"],dwarf:["default"],orc:["default"],undead:["default"]},e=[{id:"sword_shield",label:"Sword & Shield"},{id:"longbow",label:"Longbow"},{id:"magic",label:"Magic"},{id:"spear_melee",label:"Spear"},{id:"unarmed",label:"Unarmed"}];function t(){try{return new URLSearchParams(a.location.search)}catch{return new URLSearchParams}}function s(){const n=t();return!!(n.get("lobby")==="1"||n.get("enter")==="1"||n.get("char"))}function o(){try{const n=sessionStorage.getItem(l);return n?JSON.parse(n):null}catch{return null}}function u(n){try{sessionStorage.setItem(l,JSON.stringify(n))}catch{}}function S(){const n=a.GrudgePlayerConfig;return n&&n.RACES&&n.RACES.length?n.RACES:[{id:"human",label:"Human",emoji:"🧑",color:"#94a3b8",trait:"Adaptable",faction:"crusade"},{id:"barbarian",label:"Barbarian",emoji:"🪓",color:"#f43f5e",trait:"Berserker",faction:"crusade"},{id:"elf",label:"Elf",emoji:"🧝",color:"#22d3ee",trait:"Arcane",faction:"fabled"},{id:"dwarf",label:"Dwarf",emoji:"⛏",color:"#f59e0b",trait:"Stoneborn",faction:"fabled"},{id:"orc",label:"Orc",emoji:"👹",color:"#65a30d",trait:"Bloodrage",faction:"legion"},{id:"undead",label:"Undead",emoji:"💀",color:"#a78bfa",trait:"Undying",faction:"legion"}]}function k(){const n=a.GrudgePlayerConfig;return n&&n.LOADOUT_PRESETS||[{id:"knight",label:"Knight",description:"Sword & shield",loadout:{body:"C",arms:"C",legs:"C",head:"D",shoulders:"B",sword:"A",shield:"A"}},{id:"berserker",label:"Berserker",description:"Axe",loadout:{body:"B",arms:"B",legs:"B",head:"B",axe:"A"}},{id:"archer",label:"Archer",description:"Bow",loadout:{body:"A",arms:"A",legs:"A",head:"A",bow:"_default",quiver:"_default"}},{id:"mage",label:"Mage",description:"Staff",loadout:{body:"D",arms:"D",legs:"C",head:"E",staff:"A"}}]}function x(n){return(i[n]||["default"])[0]}function L(n,m){return"/character/races/textures/"+n+"/"+(m||"default")+".png"}function f(){if(document.getElementById("cdg-styles"))return;const n=document.createElement("style");n.id="cdg-styles",n.textContent=`
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
body.cdg-designing #hud,
body.cdg-designing #main-panel,
body.cdg-designing #info {
  opacity: 0 !important; pointer-events: none !important;
  visibility: hidden !important;
}
body.cdg-designing canvas {
  filter: blur(2px) brightness(0.55);
}
`,document.head.appendChild(n)}function D(){let n=document.getElementById("char-design-gate");return n||(n=document.createElement("div"),n.id="char-design-gate",n.setAttribute("role","dialog"),n.setAttribute("aria-label","Character design"),n.innerHTML=`
      <div class="cdg-shell">
        <div class="cdg-brand">
          <div class="mark">⚓</div>
          <div>
            <h1>Design your pirate</h1>
            <p class="cdg-sub">Grudge Warlords · Open-world lobby on three-layer grass hills</p>
          </div>
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
    `,document.body.appendChild(n),n)}function r(n){document.body.classList.toggle("cdg-designing",!n),document.body.classList.toggle("cdg-lobby",!!n),document.body.dataset.grudgeMode=n?"lobby":"design";const m=document.getElementById("char-design-gate");if(m&&m.classList.toggle("hidden",!!n),n&&a.world&&a.world.scene)try{c(a.world.scene)}catch{}}function c(n){!n||n.userData._pirateLobby||(n.userData._pirateLobby=!0,n.background&&n.background.isColor&&n.background.setHex(8893908),n.fog&&n.fog.isFog&&(n.fog.color.setHex(10405080),n.fog.near=80,n.fog.far=280))}function E(){const n=p.raceId||"human",m=p.skin||x(n),g=k().find(h=>h.id===p.presetId)||k()[0],B=p.pack||"sword_shield",T=(document.getElementById("cdg-name")?.value||"").trim()||"Captain",d=Object.assign({},g&&g.loadout||{body:"A",arms:"A",legs:"A",head:"A",sword:"A"});return{schemaVersion:1,name:T,raceId:n,classId:g&&g.id||"knight",skinVariant:m,textureUrl:L(n,m),animationPack:B,gearPresetId:g&&g.id||"knight",equipped:d,lobby:"pirate_open_world",targetHeight:1.8*4.2,worldScale:4.2}}const p={raceId:"barbarian",skin:"default",pack:"sword_shield",presetId:"berserker"};function b(){const n=document.getElementById("cdg-summary");if(!n)return;const m=E(),g=S().find(B=>B.id===m.raceId);n.innerHTML="<b>"+m.name+"</b> · "+(g?g.label:m.raceId)+"<br>Skin <b>"+m.skinVariant+"</b> · Pack <b>"+m.animationPack+"</b><br>Loadout <b>"+m.gearPresetId+"</b> · Scale <b>4.2</b> (fit 1.8×)<br>Lobby: <b>Pirate open world</b> · 3-layer grass hills"}function w(){f();const n=D(),m=document.getElementById("cdg-races");m.innerHTML="",S().forEach(y=>{const C=document.createElement("button");C.type="button",C.className="cdg-race"+(y.id===p.raceId?" active":""),C.style.setProperty("--rc",y.color||"#c9950a"),C.innerHTML='<div class="em">'+(y.emoji||"⚔")+'</div><div class="nm">'+(y.label||y.id).replace(/\s*\(.*\)$/,"")+'</div><div class="tr">'+(y.trait||"")+"</div>",C.addEventListener("click",()=>{p.raceId=y.id,p.skin=x(y.id),T(),g(),b()}),m.appendChild(C)});function g(){m.querySelectorAll(".cdg-race").forEach((y,C)=>{const P=S()[C];y.classList.toggle("active",P&&P.id===p.raceId)})}const B=document.getElementById("cdg-pack");B.innerHTML="",e.forEach(y=>{const C=document.createElement("option");C.value=y.id,C.textContent=y.label,y.id===p.pack&&(C.selected=!0),B.appendChild(C)}),B.onchange=()=>{p.pack=B.value,b()};function T(){const y=document.getElementById("cdg-skin"),C=i[p.raceId]||["default"];y.innerHTML="",C.forEach(P=>{const I=document.createElement("option");I.value=P,I.textContent=P,P===p.skin&&(I.selected=!0),y.appendChild(I)}),y.onchange=()=>{p.skin=y.value,b()}}T();const d=document.getElementById("cdg-presets");d.innerHTML="",k().forEach(y=>{const C=document.createElement("button");C.type="button",C.className="cdg-preset"+(y.id===p.presetId?" active":""),C.innerHTML=(y.icon?y.icon+" ":"")+y.label+"<small>"+(y.description||"")+"</small>",C.addEventListener("click",()=>{if(p.presetId=y.id,y.loadout){y.loadout.bow?p.pack="longbow":y.loadout.staff?p.pack="magic":y.loadout.spear?p.pack="spear_melee":(y.loadout.sword||y.loadout.axe||y.loadout.hammer)&&(p.pack="sword_shield");const P=document.getElementById("cdg-pack");P&&(P.value=p.pack)}d.querySelectorAll(".cdg-preset").forEach(P=>P.classList.remove("active")),C.classList.add("active"),b()}),d.appendChild(C)});const h=o();if(h&&h.name){const y=document.getElementById("cdg-name");y&&(y.value=h.name),h.raceId&&(p.raceId=h.raceId),h.skinVariant&&(p.skin=h.skinVariant),h.animationPack&&(p.pack=h.animationPack),h.gearPresetId&&(p.presetId=h.gearPresetId),T(),g();const C=document.getElementById("cdg-pack");C&&(C.value=p.pack)}return document.getElementById("cdg-play").onclick=v,document.getElementById("cdg-skip").onclick=()=>{p.raceId="human",p.presetId="knight",p.pack="sword_shield",p.skin="default",v()},document.getElementById("cdg-name").oninput=b,b(),n}function v(){const n=E();u(n);const m=new URL(a.location.href);m.searchParams.set("char",n.raceId),m.searchParams.set("lobby","1"),m.searchParams.delete("enter"),a.location.href=m.pathname+"?"+m.searchParams.toString()+m.hash}function A(){document.body.classList.add("cdg-designing"),w(),r(!1)}function _(){f();const n=document.getElementById("char-design-gate");n&&n.classList.add("hidden"),r(!0);const m=()=>a.world&&a.world.scene?(c(a.world.scene),!0):!1;if(!m()){let g=0;const B=setInterval(()=>{(m()||++g>40)&&clearInterval(B)},250)}}function R(){if(s()){const m=t().get("char");let g=o();if(!g||m&&g.raceId!==m){const B=m||"human",T=k().find(d=>d.id==="knight")||k()[0];g={schemaVersion:1,name:g&&g.name||"Captain",raceId:B,classId:g&&g.classId||"knight",skinVariant:g&&g.skinVariant||x(B),textureUrl:L(B,g&&g.skinVariant||x(B)),animationPack:g&&g.animationPack||"sword_shield",gearPresetId:g&&g.gearPresetId||"knight",equipped:g&&g.equipped&&Object.keys(g.equipped).length?g.equipped:Object.assign({},T&&T.loadout||{body:"A",arms:"A",legs:"A",head:"A",sword:"A"}),lobby:"pirate_open_world",targetHeight:1.8*4.2,worldScale:4.2},u(g)}_()}else A()}try{s()||document.documentElement.classList.add("cdg-pending")}catch{}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",R):R(),a.GrudgeCharacterDesignGate={isLobbyMode:s,showDesign:A,enterLobby:v,readBuild:o,writeBuild:u,buildStateFromUI:E,applyPirateLobbyIfNeeded:c}})(typeof window<"u"?window:globalThis);function ee(a=0){const l=a*9999.123;function i(t,s){let o=Math.sin(t*127.1+s*311.7+l)*43758.5453;return o-Math.floor(o)}function e(t,s){const o=Math.floor(t),u=Math.floor(s),S=t-o,k=s-u,x=S*S*(3-2*S),L=k*k*(3-2*k),f=i(o,u),D=i(o+1,u),r=i(o,u+1),c=i(o+1,u+1);return f+(D-f)*x+(r-f)*L+(f-D-r+c)*x*L}return function(s,o){return e(s,o)*2-1}}const ce=ee(42);function N(a,l,i=0,e=0,t=120,s=ce){const o=a+i*t,u=l+e*t;let S=s(o/220,u/220);S=Math.sign(S)*Math.pow(Math.abs(S),1.2);const k=s(o/90,u/90),x=s(o/30,u/30);return S*20+k*1+x*1+1}function de(a=z){const l=`
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
  `,i=`
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
  `;return new a.ShaderMaterial({vertexShader:l,fragmentShader:i,uniforms:{time:{value:0},bladeHeight:{value:1.42},map:{value:null},alphaMap:{value:null},tipColor:{value:new a.Color(.45,.75,.22)},bottomColor:{value:new a.Color(.08,.28,.06)},cloudTime:{value:0},cloudScale:{value:80},cloudIntensity:{value:.18}},side:a.DoubleSide})}function Ce(a=.09,l=1.42){const i=new be,e=a*.5,t=new Float32Array([-e,0,0,e,0,0,0,l,0,-e*.6,0,.01,e*.6,0,.01,0,l*.85,.01]),s=new Float32Array([0,0,1,0,.5,1,0,0,1,0,.5,1]);return i.setAttribute("position",new ae(t,3)),i.setAttribute("uv",new ae(s,2)),i.computeVertexNormals(),i}function ue(a={},l=120,i=4e4,e=null,t=null,s=0,o=0,u=120,S=ce){const k=a.bW??.09,x=a.bH??1.42,L=de();L.uniforms.bladeHeight.value=x,e&&(L.uniforms.map.value=e),t&&(L.uniforms.alphaMap.value=t);const f=Ce(k,x),D=new he;D.index=f.index,D.attributes.position=f.attributes.position,D.attributes.uv=f.attributes.uv,f.attributes.normal&&(D.attributes.normal=f.attributes.normal);const r=new Float32Array(i*3),c=new Float32Array(i*2),E=new Float32Array(i*4),p=new Float32Array(i),b=new Float32Array(i),w=new Float32Array(i),v=new Float32Array(i),A=new Float32Array(i*2);for(let g=0;g<i;g++){const B=(Math.random()-.5)*l,T=(Math.random()-.5)*l,d=N(B,T,s,o,u,S);r[g*3]=B,r[g*3+1]=d,r[g*3+2]=T,c[g*2]=B+s*u,c[g*2+1]=T+o*u;const h=Math.random()*Math.PI*2;E[g*4]=0,E[g*4+1]=Math.sin(h*.5),E[g*4+2]=0,E[g*4+3]=Math.cos(h*.5);const y=(Math.random()-.5)*.4;p[g]=Math.sin(y),b[g]=Math.cos(y),w[g]=.6+Math.random()*.8,v[g]=0,A[g*2]=0,A[g*2+1]=0}D.setAttribute("offset",new O(r,3)),D.setAttribute("worldOffset",new O(c,2)),D.setAttribute("orientation",new O(E,4)),D.setAttribute("halfRootAngleSin",new O(p,1)),D.setAttribute("halfRootAngleCos",new O(b,1)),D.setAttribute("stretch",new O(w,1));const _=new O(v,1);_.setUsage(te),D.setAttribute("trail",_);const R=new O(A,2);R.setUsage(te),D.setAttribute("trailDir",R);const n=new V(D,L);n.frustumCulled=!1,n.name="grass_blades",n.userData.layer="vegetation";const m=new $;return m.name=`grass_chunk_${s}_${o}`,m.add(n),m.userData.layer="vegetation",m.userData.grassMaterial=L,m.userData.trailArray=v,m.userData.trailDirArray=A,m.userData.offsetsArray=r,m.userData.trailAttribute=_,m.userData.trailDirAttribute=R,m.userData.terrainWidth=l,m.userData.chunkX=s,m.userData.chunkZ=o,m.tick=g=>{L.uniforms.time.value=g*.6,L.uniforms.cloudTime.value=g*.05},m}const q={bladeWidth:.09,bladeHeight:1.42,instancesHigh:4e4,instancesLow:5e3,chunkSize:120,tipColor:7585592,bottomColor:1328911};function K(a={}){const l=a.chunkX??0,i=a.chunkZ??0,e=a.chunkSize??q.chunkSize,t=!!a.lowDetail,s=a.noise2D||ee(l*17+i*31),o=new $;o.name=`terrain_layers_${l}_${i}`,o.userData.chunkX=l,o.userData.chunkZ=i,o.userData.layers={};const u=t?24:48,S=new we(e,e,u,u);S.rotateX(-Math.PI/2);const k=S.attributes.position;for(let r=0;r<k.count;r++){const c=k.getX(r),E=k.getZ(r),p=N(c,E,l,i,e,s);k.setY(r,p)}k.needsUpdate=!0,S.computeVertexNormals();const x=new oe({color:4021288,roughness:.92,metalness:.05,map:a.groundMap||null,flatShading:!1});x.map&&(x.map.wrapS=x.map.wrapT=ve,x.map.repeat.set(8,8),x.map.colorSpace=ye);const L=new V(S,x);L.name="layer_surface",L.receiveShadow=!0,L.userData.layer="surface",o.add(L),o.userData.layers.surface=L;const f=t?q.instancesLow:q.instancesHigh,D=ue({bW:q.bladeWidth,bH:q.bladeHeight},e,f,a.bladeDiffuse||null,a.bladeAlpha||null,l,i,e,s);if(D.name="layer_vegetation",o.add(D),o.userData.layers.vegetation=D,o.userData.grassMaterial=D.userData.grassMaterial,o.userData.trailArray=D.userData.trailArray,o.userData.trailDirArray=D.userData.trailDirArray,o.userData.offsetsArray=D.userData.offsetsArray,o.userData.trailAttribute=D.userData.trailAttribute,o.userData.trailDirAttribute=D.userData.trailDirAttribute,!t&&a.scatter!==!1){const r=new $;r.name="layer_detail",r.userData.layer="detail";const c=new xe(.35,0),E=new oe({color:6972764,roughness:.95,metalness:.05}),p=18;for(let b=0;b<p;b++){const w=(Math.random()-.5)*e*.9,v=(Math.random()-.5)*e*.9,A=N(w,v,l,i,e,s);if(A<2.5&&Math.random()>.35)continue;const _=new V(c,E);_.position.set(w,A+.15,v),_.rotation.set(Math.random(),Math.random(),Math.random());const R=.5+Math.random()*1.4;_.scale.setScalar(R),_.castShadow=!0,_.receiveShadow=!0,r.add(_)}o.add(r),o.userData.layers.detail=r}return o.tick=r=>{D.tick&&D.tick(r)},o.userData.terrainWidth=e,o.userData.getHeight=(r,c)=>N(r,c,l,i,e,s),o}function X(a,l=z){a.background=new l.Color(8893908),a.fog=new l.Fog(10405080,80,280);const i=new l.HemisphereLight(13166847,3820064,.55);return i.name="pirate_hemi",a.add(i),i}const re={THREE:z,getTerrainHeight:N,createGrassTerrain:ue,createGrassMaterial:de,createNoise2D:ee,createTerrainChunk:K,applyPirateLobbyAtmosphere:X,GRASS_DEFAULTS:q,PLAYER_SCALE:4.2,TARGET_HEIGHT:1.8*4.2,layers:{L0:"height_field",L1:"surface",L2:"vegetation",L3:"detail"},spawnIslandChunk(a,l={}){if(!a)return null;const i=K({chunkX:l.chunkX??0,chunkZ:l.chunkZ??0,chunkSize:l.chunkSize??q.chunkSize,lowDetail:!!l.lowDetail,scatter:l.scatter!==!1}),e=(l.chunkX??0)*(l.chunkSize??q.chunkSize),t=(l.chunkZ??0)*(l.chunkSize??q.chunkSize);return i.position.set(e,0,t),a.add(i),i},ensurePirateLobby(a){a&&(a.userData._pirateLobbyBridge||(a.userData._pirateLobbyBridge=!0,X(a,z)))}};if(typeof window<"u"){window.GrudgeGrass=re,window.GrudgeTerrainLayers={createTerrainChunk:K,applyPirateLobbyAtmosphere:X,getTerrainHeight:N,GRASS_DEFAULTS:q};const a=()=>{window.world&&window.world.scene&&document.body.classList.contains("cdg-lobby")&&re.ensurePirateLobby(window.world.scene)};window.addEventListener("grudge:player-ready",a),setTimeout(a,500),setTimeout(a,2e3)}let M={...le},W=null;function Ee(a){return!!(a&&typeof a=="object"&&"schemaVersion"in a)}function De(){W&&clearTimeout(W),W=setTimeout(()=>{const a=G.getActiveId();a&&G.saveBuild(a,M)},600)}function ie(a,l){a.equipment&&a.equipment.applyLoadout(l.equipped)}function se(a){a&&(Ee(a.equipment)?M={...M,...a.equipment}:M={...le,raceId:a.raceId||M.raceId,classId:a.classId||M.classId},window.GrudgeBuild=M)}async function Re(){await G.init(),se(G.getActiveCharacter()),window.addEventListener("grudge:character:updated",()=>{se(G.getActiveCharacter()),window.GrudgePlayer&&ie(window.GrudgePlayer,M)});const a=()=>{window.GrudgePlayer&&ie(window.GrudgePlayer,M)};window.addEventListener("grudge:player-ready",a),window.GrudgePlayer&&a(),ke((l,i)=>{const e=window.GrudgePlayer?.equipment;e&&(i==null?(delete M.equipped[l],e.unequip(l)):(M.equipped[l]=i,Se.has(l)?(e.equipWeapon(l,i),M.animationPack=Ae(l,M.classId)):e.equip(l,i)),De())})}Re();let j=null,J=null,Z=null,Y=null,F=null,Q=null;const Be=a=>new Promise((l,i)=>{const e=document.createElement("script");e.src=a,e.onload=l,e.onerror=()=>i(new Error("Failed to load "+a)),document.body.appendChild(e)}),Ie=new Promise((a,l)=>{const i=()=>{setTimeout(()=>Be("/src/play/script.js").then(a,l),0)};document.readyState==="complete"?i():window.addEventListener("load",i,{once:!0})}).catch(a=>{throw console.error("[boot] script.js load failed:",a),a}),Pe=(async()=>{try{const[a,l,i]=await Promise.all([H(()=>import("./three.module-BnjPqKkK.js").then(e=>e.T),[]),H(()=>import("./SkeletonUtils-CB3N-7u7.js"),__vite__mapDeps([0,1])),H(()=>import("./GLTFLoader-BNkt41q3.js"),__vite__mapDeps([2,1]))]);j=a,J=l,Z=i.GLTFLoader,window.THREE_SkeletonUtils=J,window.THREE_GLTFLoader=Z}catch(a){console.warn("[boot] core three.js addons unavailable:",a&&a.message)}})(),Te=(async()=>{try{Y=(await H(()=>import("./FBXLoader-CfHw6hYW.js"),__vite__mapDeps([3,1]))).FBXLoader,window.THREE_FBXLoader=Y}catch(a){console.warn("[boot] FBXLoader unavailable:",a&&a.message)}})(),Me=(async()=>{try{const a=await H(()=>import("./DRACOLoader-OqCk_kFd.js"),__vite__mapDeps([4,1]));F=new a.DRACOLoader,F.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/"),F.setDecoderConfig({type:"js"}),window.THREE_DRACOLoader=F}catch(a){console.warn("[boot] DRACOLoader unavailable:",a&&a.message)}})(),qe=(async()=>{try{Q=(await H(()=>import("./sandbox-spawner-9iXduDLP.js"),[])).createGrudgeSandbox}catch(a){console.warn("[boot] sandbox-spawner unavailable:",a&&a.message)}})();try{let s=function(r){t=r,u(r),document.getElementById("modal-backdrop").classList.add("visible")},o=function(){document.getElementById("equipment").classList.remove("visible"),document.getElementById("modal-backdrop").classList.remove("visible")},u=function(r){const c=document.getElementById("equipment");if(!c)return;const E=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.getRaceById&&r.character?window.GrudgePlayerConfig.getRaceById(r.character.id):null,b="Sandbox"+(E?" · "+E.label:"");c.innerHTML='<button class="modal-close" aria-label="Close">✕</button><h2>'+b+'</h2><div class="tabs">  <button class="tab" data-tab="gear">Gear</button>  <button class="tab" data-tab="spawn">Spawn</button>  <button class="tab" data-tab="preset">Preset</button></div><div class="tab-body" data-tab-body="gear"></div><div class="tab-body" data-tab-body="spawn"></div><div class="tab-body" data-tab-body="preset"></div>',c.querySelector(".modal-close").addEventListener("click",o),c.querySelectorAll(".tab").forEach(w=>{w.addEventListener("click",()=>{e=w.dataset.tab,u(r)})}),S(r,c.querySelector('[data-tab-body="gear"]')),k(r,c.querySelector('[data-tab-body="spawn"]')),x(r,c.querySelector('[data-tab-body="preset"]')),c.querySelectorAll(".tab").forEach(w=>w.classList.toggle("active",w.dataset.tab===e)),c.querySelectorAll(".tab-body").forEach(w=>w.classList.toggle("active",w.dataset.tabBody===e)),c.classList.add("visible")},S=function(r,c){if(c.innerHTML="",!r.equipment){c.innerHTML='<div class="empty-msg">No modular equipment on this rig.</div>';return}const E=r.equipment.getGroupedSlots?r.equipment.getGroupedSlots():{},p=["armor","weapons","shields","utility"],b=["axe","hammer","sword","pick","spear","bow","staff","shield"];let w=!1;for(const v of p){const A=E[v];if(!A||!Object.keys(A).length)continue;w=!0;const _=document.createElement("div");_.className="group",_.innerHTML='<div class="group-label">'+v+"</div>";for(const[R,n]of Object.entries(A)){const m=document.createElement("div");m.className="slot-row",m.innerHTML='<span class="slot-name">'+R+"</span>";for(const g of n.variants){const B=document.createElement("button");B.className="variant-btn"+(n.equipped===g?" equipped":""),B.textContent=g==="_default"?"✓":g,B.addEventListener("click",()=>{n.equipped===g?r.equipment.unequip(R):b.indexOf(R)>=0?r.equipment.equipWeapon(R,g):r.equipment.equip(R,g),u(r)}),m.appendChild(B)}_.appendChild(m)}c.appendChild(_)}if(r.equipment.hasParts&&r.equipment.hasParts()){w=!0;const v=r.equipment.getParts(),A=document.createElement("div");A.className="group",A.innerHTML='<div class="group-label">parts</div>',Object.keys(v).sort().forEach(_=>{const R=v[_],n=document.createElement("div");n.className="slot-row",n.innerHTML='<span class="slot-name">'+_+"</span>";const m=document.createElement("button");m.className="variant-btn"+(R.visible?" equipped":""),m.textContent=R.visible?"✓":"·",m.title=R.visible?"Hide":"Show",m.addEventListener("click",()=>{r.equipment.togglePart(_),u(r)}),n.appendChild(m),A.appendChild(n)}),c.appendChild(A)}w||(c.innerHTML='<div class="empty-msg">No equipment slots discovered.</div>')},k=function(r,c){const E=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.SPAWN_CATALOG||[],p=!!(r.character&&r.character.useStore);if(c.innerHTML='<div class="group-label">Drop Bip001 NPCs &middot; '+(p?"ObjectStore CDN":"Local FBX")+"</div>",!E.length){c.innerHTML+='<div class="empty-msg">No spawn catalog loaded.</div>';return}for(const A of E){const _=document.createElement("div");_.className="spawn-row",_.innerHTML='<span class="spawn-label">'+A.label+"</span>";const R=document.createElement("button");R.className="spawn-btn",R.textContent="Spawn",R.addEventListener("click",()=>{window.GrudgeSandbox.spawnCharacter(A.characterId,{preset:l,useStore:p}).then(()=>u(r)).catch(n=>console.warn("[sandbox] spawn failed:",n))}),_.appendChild(R),c.appendChild(_)}const b=window.GrudgeSandbox.spawned.length,w=document.createElement("div");w.className="spawn-count",w.textContent="Active spawns: "+b+(l?"  ·  preset: "+l:""),c.appendChild(w);const v=document.createElement("div");v.className="row-actions",v.innerHTML='<button data-act="clear" class="danger">Clear All</button><button data-act="ring">Spawn Ring</button>',v.querySelector('[data-act="clear"]').addEventListener("click",()=>{window.GrudgeSandbox.removeAll(),u(r)}),v.querySelector('[data-act="ring"]').addEventListener("click",async()=>{const A=E.map(_=>_.characterId);for(let _=0;_<A.length;_++)await window.GrudgeSandbox.spawnCharacter(A[_],{angle:_/A.length*Math.PI*2,radius:6*4.2,preset:l,useStore:p}).catch(R=>console.warn("[sandbox] ring spawn failed:",R));u(r)}),c.appendChild(v)},x=function(r,c){const E=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.LOADOUT_PRESETS||[];if(c.innerHTML='<div class="group-label">Loadout presets</div>',!E.length){c.innerHTML+='<div class="empty-msg">No presets defined.</div>';return}for(const b of E){const w=document.createElement("div");w.className="preset-row";const v=document.createElement("span");v.className="preset-label",v.innerHTML=(b.icon||"")+" "+b.label+'<span class="preset-sub">'+b.description+"</span>",w.appendChild(v);const A=document.createElement("button");A.className="preset-btn",A.textContent="Apply",A.addEventListener("click",()=>{r.equipment&&r.equipment.applyLoadout&&r.equipment.applyLoadout(b.loadout),u(r)}),w.appendChild(A);const _=document.createElement("button");_.className="variant-btn"+(l===b.id?" equipped":""),_.textContent=l===b.id?"✓":"Arm",_.title="Use this preset for the next spawn",_.addEventListener("click",()=>{l=l===b.id?null:b.id,u(r)}),w.appendChild(_),c.appendChild(w)}const p=document.createElement("div");p.className="row-actions",p.innerHTML='<button data-act="strip">Strip Gear</button>',p.querySelector('[data-act="strip"]').addEventListener("click",()=>{r.equipment&&(r.equipment.unequipAllWeapons(),["body","arms","legs","head","shoulders"].forEach(b=>r.equipment.unequip(b)),u(r))}),c.appendChild(p)},L=function(r){const c=new URL(window.location.href);c.searchParams.set("store",r?"1":"0"),window.location.href=c.toString()},f=function(r){const c=document.getElementById("main-panel");if(!c)return;const E=window.GrudgePlayerConfig&&window.GrudgePlayerConfig.RACES||[],p=r&&r.character&&r.character.id||null,b=!!(r&&r.character&&r.character.useStore);c.innerHTML='<div class="mp-title">Race</div>';for(const v of E){const A=document.createElement("div");A.className="race-tile"+(v.id===p?" active":""),A.style.setProperty("--race-color",v.color),A.title=v.description+(v.passive?" — "+v.passive:"");const _=v.objectStore?'<span class="rt-store">CDN</span>':"";A.innerHTML=_+'<div class="rt-emoji">'+(v.emoji||"⛰")+'</div><div class="rt-name">'+v.label.replace(/\s*\(.*\)$/,"")+'</div><div class="rt-trait">'+v.trait+'</div><div class="rt-faction">'+v.faction+'</div><button class="rt-gear" type="button">Gear</button>',A.addEventListener("click",R=>{if(R.target.classList.contains("rt-gear"))return;if(v.id===p){s(r);return}const n=new URL(window.location.href);n.searchParams.set("char",v.id),window.location.href=n.toString()}),A.querySelector(".rt-gear").addEventListener("click",R=>{if(R.stopPropagation(),v.id===p)s(r);else{const n=new URL(window.location.href);n.searchParams.set("char",v.id),n.searchParams.set("gear","1"),window.location.href=n.toString()}}),c.appendChild(A)}const w=document.createElement("div");w.className="mp-source",w.innerHTML='<div class="mp-source-label">Source</div><div class="mp-source-switch" role="group" aria-label="Asset source">  <button type="button" data-src="1" class="'+(b?"active":"")+'">CDN</button>  <button type="button" data-src="0" class="'+(b?"":"active")+'">Local</button></div>',w.querySelectorAll("button[data-src]").forEach(v=>{v.addEventListener("click",()=>{const A=v.dataset.src==="1";A!==b&&L(A)})}),c.appendChild(w)},D=function(r){const c=[{key:"1",slot:"Skill1"},{key:"2",slot:"Skill2"},{key:"3",slot:"Skill3"},{key:"4",slot:"Skill4"},{key:"5",slot:"Skill5"},{key:"6",slot:"Skill6"},{key:"7",slot:"Skill7"},{key:"8",slot:"Skill8"},{key:"9",slot:"Skill9"}];document.querySelectorAll("#hud .hud-hotbar .slot").forEach((p,b)=>{const w=c[b];if(!w)return;const v=r.hasAction&&r.hasAction(w.slot);p.classList.toggle("bound",!!v),p.classList.toggle("empty",!v)})};document.getElementById("modal-backdrop").addEventListener("click",o),window.addEventListener("keydown",r=>{r.key==="Escape"&&o()});const a=r=>{const c=r.detail.player;f(c),D(c);try{const b=new URLSearchParams(window.location.search);if(b.get("gear")==="1"){s(c),b.delete("gear");const w=b.toString(),v=window.location.pathname+(w?"?"+w:"")+window.location.hash;window.history.replaceState(null,"",v)}}catch{}let E=0;const p=setInterval(()=>{D(c),++E>20&&clearInterval(p)},500)};if(window.addEventListener("grudge:player-ready",a),window.GrudgeReadyBuffer&&a(window.GrudgeReadyBuffer),await Ie,await Promise.allSettled([Pe,Te,Me,qe]),Q){const r=Q(j,{FBX:Y,GLTF:Z,SkeletonUtils:J,DRACO:F},{getScene:()=>window.world&&window.world.scene,getTerrainY:(E,p)=>window.world&&window.world._getTerrainHeightAtWorld?window.world._getTerrainHeightAtWorld(E,p):0,getPlayerPos:()=>window.world&&window.world.player?window.world.player.group.position:new j.Vector3,playerScale:4.2});window.GrudgePlayerConfig&&(window.GrudgePlayerConfig._sandboxLoaded=!0),window.GrudgeSandbox=r;const c=new j.Clock;(function E(){r.update(Math.min(c.getDelta(),.1)),requestAnimationFrame(E)})()}let l=null;const i=window.GrudgePlayerConfig;if(i&&i.CHARACTERS){const r=document.getElementById("char-select"),c=i.resolveCharacter();for(const b of i.CHARACTERS){const w=document.createElement("option");w.value=b.id,w.textContent=b.label,b.id===c.id&&(w.selected=!0),r.appendChild(w)}r.addEventListener("change",b=>{const w=new URL(window.location.href);w.searchParams.set("char",b.target.value),window.location.href=w.toString()});const E=document.getElementById("hud-name");E&&(E.textContent=c.label);const p=document.getElementById("hud-sub");if(p){const b=c.useStore?"CDN":"local";p.textContent=(c.rigType||"").toUpperCase()+" rig · "+b+" · ?char="+c.id}}let e="gear",t=null}catch(a){console.error("[boot] failed:",a);const l=document.querySelector("#info .controls");l&&(l.textContent="Failed to boot: "+a.message)}
//# sourceMappingURL=play-CkdkUyLo.js.map

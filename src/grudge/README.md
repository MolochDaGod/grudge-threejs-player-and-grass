# `src/grudge/` — Unity gameplay port (Phase 5 prep)
This folder is the JS/TS shadow of the Unity codebase at
`D:\Gamewithall\Grudge Strat\GrudgeNations\Assets\assets\Scripts\`.
Right now it only contains type shapes + frozen mocks so the HUD, mainpanel,
and creator can compile against the eventual real systems. Phase 5 ports the
behaviour file-for-file from the Unity tree.
## File-to-class map (target)
```
src/grudge/                                 ← Unity equivalent
├── attributes.ts                              PlayerAttribute.cs + PlayerAttributes/*.cs
├── build.ts                                   (this repo only)
├── slots.ts                                   Equipment.cs + PlayerEquipment.cs
├── combat.ts                                  Combat.cs + GRUDGE_CombatBalanceConfig.cs
├── experience.ts                              Experience.cs + Level.cs
├── buffs.ts                                   Buff.cs
├── inventory.ts                               Inventory.cs + PlayerInventory.cs + Item.cs
├── skills/                                    ScriptableSkills/*.cs
│   ├── base.ts                                Skill.cs
│   ├── damage.ts                              DamageSkill.cs / TargetDamageSkill.cs
│   ├── heal.ts                                HealSkill.cs / TargetHealSkill.cs / AreaHealSkill.cs
│   ├── buff.ts                                BuffSkill.cs / AreaBuffSkill.cs / TargetBuffSkill.cs / TransformationBuffSkill.cs
│   ├── projectile.ts                          TargetProjectileSkill.cs
│   ├── passive.ts                             PassiveSkill.cs
│   └── bonus.ts                               BonusSkill.cs
├── skill-effects/                             SkillEffects/*.cs
│   ├── buff-effect.ts                         BuffSkillEffect.cs
│   ├── one-time-target-effect.ts              OneTimeTargetSkillEffect.cs
│   ├── projectile-effect.ts                   ProjectileSkillEffect.cs
│   └── transformation-buff-effect.ts          TransformationBuffSkillEffect.cs
├── magic/                                     Addons/!custom/MagicSystem/*.cs
│   ├── tome.ts                                GRUDGE_TomeOfSpells.cs
│   ├── spell-recipe.ts                        GRUDGE_SpellRecipe.cs
│   ├── spell-elements.ts                      GRUDGE_SpellElements.cs
│   ├── spell-iteration-config.ts              GRUDGE_SpellIterationConfig.cs
│   └── tome-auto-attack.ts                    GRUDGE_TomeAutoAttack.cs
├── player/
│   ├── controller.ts                          MovementSystems/PlayerCharacterControllerMovement.cs
│   ├── targeting.ts                           PlayerTabTargeting.cs
│   ├── skill-bar.ts                           PlayerSkillbar.cs
│   └── ...
├── npc/                                       Addons/!custom/GRUDGE_*Ally*.cs + GRUDGE_*Faction*.cs + GRUDGE_*Mercenary*.cs
├── legion/                                    Addons/!custom/GRUDGE_AIAssistant*.cs + GRUDGE_AIConfig.cs
├── vfx/                                       three.js renderers (no Unity equivalent)
└── data/*.json                                generated from Unity ScriptableObject .asset files
```
## Coding patterns
* `[SerializeField] private` → `#private` JS field with public getter.
* Unity `MonoBehaviour.Update(dt)` → explicit `tick(dt, ctx)` invoked from the
  world loop. No global ticker; the parent owns the schedule.
* Unity `ScriptableObject` → frozen plain-data class with a static
  `from(json)` factory. The runtime objects are immutable; player state
  changes go through the typed `Player*` system classes.
* Unity prefab references → string ids resolved from `data/*.json` at boot.
* Unity events → typed `EventTarget` so we can pipe through both DOM events
  and node-style event listeners.
## Frozen-mock policy
Every file in this folder must:
* Export the canonical TypeScript type that the Unity code uses.
* Export a `MOCK_*` constant for the rest of the app to consume during
  Phase 1–4. Mocks are `Object.freeze`'d so callers can't mutate the
  reference shape.
* Throw an `unimplemented(slot)` from any system method that requires real
  behaviour (combat math, skill cast, level up). The HUD treats those throws
  as a "not yet" signal and keeps showing static text.
This way, when Phase 5 ports a Unity file, the mock is replaced with the
real implementation in one PR with no consumer-side change.

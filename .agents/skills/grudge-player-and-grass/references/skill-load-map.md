# Skill load map — player-and-grass

## Minimal chains

### Edit grass / lobby terrain
```
grudge-studio
  → grudge-player-and-grass
  → threejs-skills → threejs-shaders + three-instanced-lod
  → threejs-helpers-physics-terrain (if merging island generators)
```

### Fix character look in /play
```
grudge-studio
  → grudge-player-and-grass
  → grudge6-modular-characters
  → grudge-character-correctness
  → grudge-world-scale
  → threejs-materials + threejs-textures
```

### /space helpers + variants
```
grudge-studio
  → grudge-player-and-grass
  → grudge-world-scale
  → grudge6-modular-characters
  → threejs-loaders + threejs-fundamentals
```

### Deploy
```
grudge-player-and-grass
  → grudge-game-onboarding (checklist)
  → grudge-stack
  → grudge-fleet (domain map)
```

### Combat / anims in lobby
```
grudge-player-and-grass
  → grudge6-combat-runtime
  → grudge-character-correctness
  → grudge-combat-targeting (if mouse target lock)
```

## File → skill ownership

| File | Owner skill |
|------|-------------|
| `src/play/grass-terrain.mjs` | grudge-player-and-grass |
| `src/play/terrain-layers.mjs` | grudge-player-and-grass |
| `src/play/character-design-gate.js` | grudge-player-and-grass |
| `src/play/script.js` Player equip/scale | character-correctness + modular + this |
| `src/play/player-config.js` | modular-characters + this |
| `src/play/equipment-manager.js` | modular-characters |
| `src/space/*` | grudge-player-and-grass + world-scale |
| `src/landing/*` Play handoff | foundry patterns + this |
| `vercel.json` / vite | stack + this |

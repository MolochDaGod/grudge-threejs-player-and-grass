// tests/debug-boot.spec.js
//
// Diagnostic-only — captures every console message + page error fired
// while loading /src/index.html?char=human&store=0 so we can see why the
// boot module isn't reaching window.GrudgePlayerConfig.RACES.
import { test, expect } from "@playwright/test";

test("dump boot console", async ({ page }) => {
  const lines = [];
  page.on("console", (msg) => {
    lines.push(`[${msg.type()}] ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    lines.push(`[pageerror] ${err.message}`);
  });
  page.on("requestfailed", (req) => {
    lines.push(`[requestfailed] ${req.url()} :: ${req.failure()?.errorText}`);
  });

  await page.goto("/src/index.html?char=human&store=0");

  // Poll every 100ms for the first 20s to see when RACES becomes
  // available. Anything > a couple hundred ms means a network stall on
  // the classic <script> tags.
  const start = Date.now();
  let racesAt = null;
  while (Date.now() - start < 20000) {
    const ready = await page.evaluate(
      () => !!(window.GrudgePlayerConfig && window.GrudgePlayerConfig.RACES)
    );
    if (ready) {
      racesAt = Date.now() - start;
      break;
    }
    await page.waitForTimeout(100);
  }
  lines.push(`[racesAt] ${racesAt}ms`);

  await page.waitForTimeout(50000);

  const snapshot = await page.evaluate(() => {
    const cfg = window.GrudgePlayerConfig;
    const tiles = Array.from(document.querySelectorAll("#main-panel .race-tile"));
    const player = window.GrudgePlayer;
    return {
      cfgKnown: !!(cfg && cfg.RACES),
      racesLen: cfg && cfg.RACES ? cfg.RACES.length : null,
      raceIds: cfg && cfg.RACES ? cfg.RACES.map((r) => r.id) : null,
      resolved: cfg && cfg.resolveCharacter ? cfg.resolveCharacter().id : null,
      tilesLen: tiles.length,
      tileIds: tiles.map((t) => t.querySelector(".rt-name")?.textContent),
      tileActives: tiles.map((t) => t.classList.contains("active")),
      playerCharId: player && player.character ? player.character.id : null,
      playerRig: player ? player.rigType : null,
    };
  });
  lines.push("[snapshot] " + JSON.stringify(snapshot));

  console.log("\n===== BOOT LOG =====\n" + lines.join("\n") + "\n====================\n");
  expect(lines.length).toBeGreaterThan(0);
});

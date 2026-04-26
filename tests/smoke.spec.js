// tests/smoke.spec.js
//
// Smoke test for the Grudge Warlords sandbox. Boots the page, waits for
// the player-ready event the bundled script.js fires once the active
// race has loaded, and then asserts:
//   1. Six race tiles render in the Main Panel.
//   2. The CDN/Local source switch reflects ?store= and reloads on click.
//   3. Clicking the active tile's Gear button opens the equipment modal.
//
// Uses ?store=0 so the test is self-contained against the local FBX
// files in character/races/ (no CDN dependency).
import { test, expect } from "@playwright/test";

const PAGE = "/src/index.html";

test.describe("Grudge sandbox smoke", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      console.error("[pageerror]", err.message);
    });
  });

  test("renders 6 race tiles, source switch, opens equipment modal", async ({
    page,
  }) => {
    await page.goto(`${PAGE}?char=human&store=0`);

    // The bundled script dispatches `grudge:player-ready` once the active
    // race FBX has loaded; buildMainPanel() runs in that handler.
    await page.waitForFunction(
      () => !!document.querySelector("#main-panel .race-tile"),
      null,
      { timeout: 45_000 }
    );

    // 1. Six race tiles render.
    const tiles = page.locator("#main-panel .race-tile");
    await expect(tiles).toHaveCount(6);

    // The active tile reflects the ?char=human URL param.
    const active = page.locator("#main-panel .race-tile.active");
    await expect(active).toHaveCount(1);
    await expect(active.locator(".rt-name")).toHaveText(/HUMAN/i);

    // 2. Source switch reflects ?store=0 → "Local" is active.
    const cdnBtn = page.locator(
      '#main-panel .mp-source-switch button[data-src="1"]'
    );
    const localBtn = page.locator(
      '#main-panel .mp-source-switch button[data-src="0"]'
    );
    await expect(localBtn).toHaveClass(/active/);
    await expect(cdnBtn).not.toHaveClass(/active/);

    // Clicking CDN reloads with ?store=1; intercept the navigation to
    // avoid waiting on a second player-ready (which would hit the CDN).
    await Promise.all([
      page.waitForURL(/store=1/, { timeout: 10_000 }),
      cdnBtn.click(),
    ]);

    // 3. Reload back to local mode and verify the Gear button opens the
    //    equipment modal.
    await page.goto(`${PAGE}?char=human&store=0`);
    await page.waitForFunction(
      () => !!document.querySelector("#main-panel .race-tile.active"),
      null,
      { timeout: 45_000 }
    );

    const equipment = page.locator("#equipment");
    const backdrop = page.locator("#modal-backdrop");
    await expect(equipment).not.toHaveClass(/visible/);
    await expect(backdrop).not.toHaveClass(/visible/);

    await page.locator("#main-panel .race-tile.active .rt-gear").click();

    await expect(equipment).toHaveClass(/visible/);
    await expect(backdrop).toHaveClass(/visible/);
    await expect(equipment.locator("h2")).toHaveText(/sandbox/i);
    await expect(equipment.locator(".tab")).toHaveCount(3);

    // ESC closes the modal.
    await page.keyboard.press("Escape");
    await expect(equipment).not.toHaveClass(/visible/);
    await expect(backdrop).not.toHaveClass(/visible/);
  });

  test("RACES catalog exposes 6 entries with required metadata", async ({
    page,
  }) => {
    // Lightweight guard against player-config drift; doesn't depend on
    // asset loading at all.
    await page.goto(`${PAGE}?char=human&store=0`);
    await page.waitForFunction(
      () =>
        !!(window.GrudgePlayerConfig && window.GrudgePlayerConfig.RACES),
      null,
      { timeout: 15_000 }
    );

    const races = await page.evaluate(
      () => window.GrudgePlayerConfig.RACES
    );
    expect(races).toHaveLength(6);
    for (const r of races) {
      expect(r.id).toBeTruthy();
      expect(r.label).toBeTruthy();
      expect(r.rigType).toBe("bip001");
      expect(r.color).toMatch(/^#/);
      expect(r.faction).toBeTruthy();
    }
  });
});

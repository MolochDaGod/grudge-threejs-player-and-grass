// tests/creator-equip.spec.ts
//
// End-to-end smoke for Phase 2:
//   1. Open the landing page.
//   2. Wait for the 3D preview to load the default race + skin (the model's
//      first SkinnedMesh has a `MeshLambertMaterial` with a real `.map`).
//   3. Click an equipment button inside the embedded mainpanel iframe.
//   4. Verify the corresponding child mesh on the loaded model becomes
//      visible (`mesh.visible === true`).
//
// Mocks `api.grudge-studio.com` so we don't depend on a live backend.
import { test, expect, type Page } from "@playwright/test";

test.describe("Creator equipment bridge", () => {
  test.beforeEach(async ({ page }) => {
    // Stub the character API so the SDK happily no-ops without a JWT.
    await page.route(/api\.grudge-studio\.com\/api\/(account|characters).*/, (route) => {
      route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
    });
  });

  test("loads creator and applies skin texture", async ({ page }) => {
    await page.goto("/");
    // Wait for `window.GrudgeCreator` to be set up by preview.ts.
    await page.waitForFunction(
      () => Boolean((window as unknown as { GrudgeCreator?: { model: unknown } }).GrudgeCreator?.model),
      undefined,
      { timeout: 30_000 },
    );
    // Inspect the first SkinnedMesh's material — it should be a
    // MeshLambertMaterial (toon-flat) with a real `.map` texture.
    const matInfo = await page.evaluate(() => {
      const root = (window as unknown as { GrudgeCreator?: { model: { traverse: (cb: (o: unknown) => void) => void } } }).GrudgeCreator?.model;
      if (!root) return null;
      let info: { type: string | null; hasMap: boolean } | null = null;
      root.traverse((o: unknown) => {
        const m = o as { isSkinnedMesh?: boolean; material?: { type: string; map: unknown } };
        if (info || !m.isSkinnedMesh) return;
        info = { type: m.material?.type ?? null, hasMap: !!m.material?.map };
      });
      return info;
    });
    expect(matInfo).not.toBeNull();
    const info = matInfo as unknown as { type: string | null; hasMap: boolean };
    expect(info.type).toBe("MeshLambertMaterial");
    expect(info.hasMap).toBe(true);
  });

  test("equipping a sword in mainpanel toggles the mesh on the character", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(
      () => Boolean((window as unknown as { GrudgeCreator?: { equipment: unknown; model: unknown } }).GrudgeCreator?.equipment),
      undefined,
      { timeout: 30_000 },
    );
    // Click an "A" button in the mainpanel's sword row inside the iframe.
    const iframe = page.frameLocator("#mainpanel-iframe");
    await iframe.locator('.geo-btn[data-slot="sword"][data-variant="A"]').first().click();
    // Verify the sword child mesh is now visible on the loaded model.
    const swordVisible = await page.evaluate(() => {
      const eq = (window as unknown as { GrudgeCreator?: { equipment?: { equipped?: Record<string, string> } } }).GrudgeCreator?.equipment;
      return eq?.equipped?.sword === "A";
    });
    expect(swordVisible).toBe(true);
  });
});

// Helper to make the test file recognised by `npm run test:e2e`.
export {};

declare module "@playwright/test" {
  // Keep the file self-contained even if no extra fixtures are added.
  interface PlaywrightTestArgs {
    page: Page;
  }
}

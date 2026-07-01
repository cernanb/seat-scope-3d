import { expect, type Locator, test } from "@playwright/test";

test("lets a user choose a seat and inspect the 3D perspective", async ({
  page,
}) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Seat Scope 3D" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Selected seat summary" }),
  ).toContainText("F10");

  await page.getByRole("button", { name: "H12" }).click();

  await expect(page).toHaveURL(/seat=H12/);
  await expect(
    page.getByRole("region", { name: "Selected seat summary" }),
  ).toContainText("H12");

  const perspective = page.getByRole("img", { name: "3D view from seat H12" });
  const canvas = perspective.locator("canvas");

  await expect(perspective).toBeVisible();
  await expect(canvas).toBeVisible();
  await expect.poll(() => getCanvasClientArea(canvas)).toBeGreaterThan(150_000);
  await expect.poll(() => countVisibleCanvasPixels(canvas)).toBeGreaterThan(20);

  await page.getByRole("button", { name: "A10" }).click();

  await expect(page).toHaveURL(/seat=A10/);
  await expect(
    page.getByRole("region", { name: "Selected seat summary" }),
  ).toContainText("A10");
  await expect(
    page.getByRole("region", { name: "Selected seat summary" }),
  ).toContainText(/Horizontal angle\s*59\./);
  const frontRowPerspective = page.getByRole("img", {
    name: "3D view from seat A10",
  });
  await expect
    .poll(() => countVisibleCanvasPixels(frontRowPerspective.locator("canvas")))
    .toBeGreaterThan(20);
});

async function getCanvasClientArea(canvas: Locator) {
  return canvas.evaluate((element) => element.clientWidth * element.clientHeight);
}

async function countVisibleCanvasPixels(canvas: Locator) {
  return canvas.evaluate((element) => {
    const source = element as HTMLCanvasElement;
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;

    const context = copy.getContext("2d", { willReadFrequently: true });

    if (!context) {
      return 0;
    }

    context.drawImage(source, 0, 0);

    const pixels = context.getImageData(0, 0, copy.width, copy.height).data;
    let visiblePixels = 0;

    for (let index = 0; index < pixels.length; index += 4 * 20) {
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      const alpha = pixels[index + 3] ?? 0;

      if (alpha > 0 && (red > 80 || green > 80 || blue > 80)) {
        visiblePixels += 1;
      }
    }

    return visiblePixels;
  });
}

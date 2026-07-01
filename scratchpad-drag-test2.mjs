import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:3000/?theater=regal-edwards-irvine-spectrum-auditorium-12-imax&seat=L17');
await page.waitForTimeout(1000);

const canvasSection = page.locator('[aria-label="3D auditorium perspective"] div[role="img"]');
const box = await canvasSection.boundingBox();
console.log('canvas box', box);
const centerX = box.x + box.width / 2;
const centerY = box.y + box.height / 2;

await page.mouse.move(centerX, centerY);
await page.mouse.down();
await page.waitForTimeout(100);
for (let i = 0; i < 15; i++) {
  await page.mouse.move(centerX - (i+1)*20, centerY, { steps: 2 });
  await page.waitForTimeout(30);
}
await page.mouse.up();
await page.waitForTimeout(500);

const perspectiveSection = page.locator('[aria-label="3D auditorium perspective"]');
await perspectiveSection.screenshot({ path: '/private/tmp/claude-501/-Users-cbernardo-Development-projects-seat-scope-3d/cd81c601-0331-4eaf-ac11-21ad9a7fa6a4/scratchpad/l17-after-drag2.png' });

await browser.close();

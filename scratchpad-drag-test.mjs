import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:3000/?theater=regal-edwards-irvine-spectrum-auditorium-12-imax&seat=L17');
await page.waitForTimeout(1000);

const canvasSection = page.locator('[aria-label="3D auditorium perspective"] div[role="img"]');
const box = await canvasSection.boundingBox();
const centerX = box.x + box.width / 2;
const centerY = box.y + box.height / 2;

// Simulate a drag to the right (like a user dragging to look around)
await page.mouse.move(centerX, centerY);
await page.mouse.down();
await page.mouse.move(centerX - 150, centerY - 40, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(300);

const perspectiveSection = page.locator('[aria-label="3D auditorium perspective"]');
await perspectiveSection.screenshot({ path: '/private/tmp/claude-501/-Users-cbernardo-Development-projects-seat-scope-3d/cd81c601-0331-4eaf-ac11-21ad9a7fa6a4/scratchpad/l17-after-drag.png' });

await browser.close();

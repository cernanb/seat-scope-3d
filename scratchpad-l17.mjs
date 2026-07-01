import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.goto('http://localhost:3000/?theater=regal-edwards-irvine-spectrum-auditorium-12-imax&seat=L17');
await page.waitForTimeout(1000);
const canvasSection = page.locator('[aria-label="3D auditorium perspective"]');
await canvasSection.screenshot({ path: '/private/tmp/claude-501/-Users-cbernardo-Development-projects-seat-scope-3d/cd81c601-0331-4eaf-ac11-21ad9a7fa6a4/scratchpad/l17-no-drag.png' });

const summary = page.getByRole('region', { name: 'Selected seat summary' });
console.log(await summary.textContent());

await browser.close();

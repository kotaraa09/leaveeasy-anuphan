// ─────────────────────────────────────────────────────────────
// tests/smoke.spec.js — เทสต์ควันไฟ ตรวจว่าเว็บยังหายใจอยู่
//
// "เทสต์ควันไฟ" มาจากการเปิดเครื่องแล้วดูว่ามีควันขึ้นไหม
// ไม่ได้ตรวจว่าทุกอย่างถูกต้อง แค่ตรวจว่าของพื้นฐานที่สุดยังไม่พัง
//
// เทสต์พวกนี้ไม่ต้องล็อกอิน จึงรันได้ทุกเมื่อโดยไม่ต้องใช้รหัสผ่านของใคร
// สัปดาห์ที่ 9 ค่อยเขียนเทสต์ที่ล็อกอินแล้วกดปุ่มจริงเพิ่ม
// ─────────────────────────────────────────────────────────────

const { test, expect } = require("@playwright/test");

test("หน้าแรกเปิดได้ และมีชื่อระบบอยู่บนหน้า", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/LeaveEasy/i);
});

test("หน้าที่ต้องล็อกอิน ต้องเด้งไปหน้าเข้าสู่ระบบ", async ({ page }) => {
  // 🔒 นี่คือการพิสูจน์ยามด่านหน้าจอที่เขียนไว้ใน js/auth.js
  //    ยามตัวจริงคือ firestore.rules ซึ่งทดสอบด้วยวิธีนี้ไม่ได้
  await page.goto("/leave-requests.html");
  await expect(page.locator("h1")).toContainText("เข้าสู่ระบบ");
});

test("หน้าเข้าสู่ระบบมีช่องอีเมลกับรหัสผ่านครบ", async ({ page }) => {
  await page.goto("/login.html");
  await expect(page.locator("#email")).toBeVisible();
  await expect(page.locator("#password")).toBeVisible();
});

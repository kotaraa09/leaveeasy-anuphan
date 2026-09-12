// ─────────────────────────────────────────────────────────────
// playwright.config.js — ตั้งค่าหุ่นยนต์ที่กดใช้งานเว็บแทนคน
// สัปดาห์ที่ 9: ใช้ Playwright เปิดเบราว์เซอร์จริง กดปุ่มจริง แล้วบอกว่าตรงไหนพัง
//
// 🔑 จุดที่ต้องระวังที่สุดในไฟล์นี้
//    1. baseURL ชี้ไปที่ "เว็บจริงบน Firebase Hosting" ไม่ใช่ localhost
//       เพราะสิ่งที่ต้องพิสูจน์คือ "เว็บที่ผู้สอนเปิดได้ ใช้งานได้จริงไหม"
//       จะทดสอบกับเครื่องตัวเองก็ได้ ดูวิธีสลับข้างล่าง
//    2. ไฟล์นี้ไม่ได้เก็บรหัสผ่านของใคร และห้ามเอามาเก็บด้วย
//       หน้าที่ต้องล็อกอินให้เขียนเทสต์ที่รับอีเมล/รหัสผ่านจาก environment variable แทน
// ─────────────────────────────────────────────────────────────

// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// เว็บที่จะให้หุ่นยนต์ไปกด
//   ค่าเริ่มต้น = เว็บจริงบน Firebase Hosting (ตัวเดียวกับที่เขียนไว้บนสุดของ README)
//   อยากทดสอบกับเครื่องตัวเอง สั่ง `npm run dev` ไว้ก่อน แล้วรันแบบนี้
//      BASE_URL=http://localhost:3000 npx playwright test
var เว็บที่จะทดสอบ = process.env.BASE_URL || "https://leaveeasy-anuphan.web.app";

module.exports = defineConfig({
  testDir: "./tests",

  // รอองค์ประกอบบนหน้าจอนานสุด 10 วินาที ก่อนถือว่าไม่มา
  // เว็บนี้ต้องรอ Firebase ตอบว่าใครล็อกอินอยู่ก่อนเสมอ จึงช้ากว่าเว็บ HTML ล้วน
  expect: { timeout: 10000 },

  use: {
    baseURL: เว็บที่จะทดสอบ,

    // เก็บหลักฐานเฉพาะตอนพัง — เก็บทุกครั้งจะได้ไฟล์กองโตโดยไม่มีใครดู
    screenshot: "only-on-failure",
    trace: "on-first-retry",

    // เว็บเป็นภาษาไทย บอกเบราว์เซอร์ไว้ด้วย เวลาที่เว็บเรียก toLocaleDateString จะได้ตรงกัน
    locale: "th-TH",
    timezoneId: "Asia/Bangkok"
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});

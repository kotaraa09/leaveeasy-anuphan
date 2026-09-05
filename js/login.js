// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ
//
// 🔑 จุดที่ต้องระวังที่สุดในไฟล์นี้
//    1. เข้าสู่ระบบสำเร็จแล้วเท่านั้นถึงเปลี่ยนหน้า — ล้มเหลวต้องคาหน้าเดิมพร้อมบอกเหตุผล
//    2. ห้ามบอกว่า "ไม่มีอีเมลนี้ในระบบ" แยกจาก "รหัสผ่านผิด"
//       เพราะเท่ากับบอกคนนอกว่าอีเมลไหนมีบัญชีอยู่จริง — Firebase เองก็รวมเป็นรหัสเดียวแล้ว
//    3. ปลายทางหลังล็อกอินมาจาก ?next= ซึ่งผู้ใช้แก้ได้เอง
//       จึงรับเฉพาะชื่อไฟล์ในเว็บเรา ไม่รับที่อยู่เต็มที่พาออกไปเว็บอื่น
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebase-init.js";
import { แปลข้อผิดพลาดAuth, รอผู้ใช้ } from "./auth.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

(async function () {
  var ฟอร์ม = document.getElementById("ฟอร์มเข้าสู่ระบบ");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่ม = document.getElementById("ปุ่มเข้าสู่ระบบ");

  // ล็อกอินค้างอยู่แล้วก็ไม่ต้องให้กรอกซ้ำ พาไปหน้าที่ตั้งใจจะไปเลย
  if (await รอผู้ใช้()) {
    location.replace(หน้าถัดไป());
    return;
  }

  ติดปุ่มดูรหัสผ่าน();                    // js/util.js — เติมปุ่มลืมตาให้ช่องรหัสผ่าน

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();
    ซ่อนคำเตือน();

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;

    if (!email)    return เตือน("ยังไม่ได้กรอกอีเมล", "email");
    if (!password) return เตือน("ยังไม่ได้กรอกรหัสผ่าน", "password");

    กำลังส่ง(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      location.replace(หน้าถัดไป());          // สำเร็จแล้วเท่านั้นถึงเปลี่ยนหน้า
    } catch (ข้อผิดพลาด) {
      เตือน(แปลข้อผิดพลาดAuth(ข้อผิดพลาด), "password");
      กำลังส่ง(false);                        // ให้กรอกใหม่ได้ อีเมลที่พิมพ์ไว้ยังอยู่
    }
  });

  // ── ปลายทางหลังล็อกอินสำเร็จ ──
  // รับเฉพาะชื่อไฟล์ในเว็บเราเท่านั้น เช่น leave-requests.html?status=รอพิจารณา
  // ค่าที่ขึ้นต้นด้วย http:// // หรือ / ตัดทิ้งทั้งหมด กันการพาผู้ใช้ออกไปเว็บอื่น
  function หน้าถัดไป() {
    var ค่า = new URLSearchParams(location.search).get("next") || "";
    if (!/^[a-z0-9-]+\.html(\?.*)?$/i.test(ค่า)) return "index.html";
    if (ค่า.indexOf("login.html") === 0) return "index.html";   // กันวนกลับมาหน้าเดิม
    return ค่า;
  }

  // ใช้ตัวช่วยกลางจาก js/util.js กล่องเตือนจึงมีไอคอนและการจัดวางเหมือนทุกหน้า
  function เตือน(ข้อความ, ช่อง) {
    แสดงเตือน(กล่องเตือน, ข้อความ);
    if (ช่อง) document.getElementById(ช่อง).focus();
  }

  function ซ่อนคำเตือน() {
    ซ่อนเตือน(กล่องเตือน);
  }

  function กำลังส่ง(กำลัง) {
    ปุ่ม.disabled = กำลัง;
    ปุ่ม.textContent = กำลัง ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ";
  }
})();

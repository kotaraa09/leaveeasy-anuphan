// ─────────────────────────────────────────────────────────────
// js/signup.js — หน้าสมัครสมาชิก
//
// การสมัคร 1 ครั้งเขียนข้อมูล 2 ที่ และทั้งสองที่ต้องสำเร็จถึงจะใช้งานได้จริง
//    1. Firebase Authentication — เก็บอีเมลกับรหัสผ่านไว้ให้ล็อกอิน
//    2. โฟลเดอร์ users บน Firestore — เก็บ name กับ role ที่ระบบเราต้องใช้
//
// 🔑 จุดที่ต้องระวังที่สุดในไฟล์นี้
//    1. ชื่อไฟล์ในโฟลเดอร์ users ต้องเป็น uid ที่ Firebase ออกให้ ไม่ใช่ u001 ที่ตั้งเอง
//       เพราะเวลาถามว่า "คนที่ล็อกอินอยู่ชื่ออะไร" เรามีแค่ uid ไว้เปิดหาไฟล์
//       ใช้ setDoc (ตั้งชื่อไฟล์เอง) ไม่ใช่ addDoc (ปล่อยให้สุ่มชื่อ)
//    2. ขั้นที่ 1 สำเร็จแต่ขั้นที่ 2 ล้ม = ล็อกอินได้แต่ไม่มีชื่อ ไม่มีบทบาท
//       ลบบัญชีคืนเองไม่ได้จากฝั่งเว็บ จึงต้องบอกผู้ใช้ตรง ๆ แล้วให้กดบันทึกซ้ำได้
//       ห้ามพาไปหน้าอื่นเงียบ ๆ เหมือนทุกอย่างเรียบร้อย
// ─────────────────────────────────────────────────────────────

import { auth, db } from "./firebase-init.js";
import { แปลข้อผิดพลาดAuth, รอผู้ใช้ } from "./auth.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

(async function () {
  var ฟอร์ม = document.getElementById("ฟอร์มสมัคร");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");
  var ปุ่ม = document.getElementById("ปุ่มสมัคร");

  var รหัสผ่านสั้นสุด = 6;                     // Firebase ไม่รับรหัสผ่านสั้นกว่านี้อยู่แล้ว

  // ล็อกอินค้างอยู่แล้วไม่ต้องสมัครใหม่
  if (await รอผู้ใช้()) {
    location.replace("index.html");
    return;
  }

  ติดปุ่มดูรหัสผ่าน();                    // js/util.js — ติดปุ่มลืมตาให้ทั้งสองช่อง
  ติดเกณฑ์รหัสผ่านสด();

  ฟอร์ม.addEventListener("submit", async function (e) {
    e.preventDefault();
    ซ่อนคำเตือน();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var password2 = document.getElementById("password2").value;

    // ── ด่านตรวจ ── ไม่ผ่านข้อไหน หยุดทันที ไม่แตะ Firebase เลย
    if (!name)  return เตือน("ยังไม่ได้กรอกชื่อ-นามสกุล", "name");
    if (!email) return เตือน("ยังไม่ได้กรอกอีเมล", "email");
    if (password.length < รหัสผ่านสั้นสุด) {
      return เตือน("รหัสผ่านต้องยาวอย่างน้อย " + รหัสผ่านสั้นสุด + " ตัวอักษร", "password");
    }
    if (password !== password2) {
      return เตือน("รหัสผ่านสองช่องไม่ตรงกัน", "password2");
    }

    กำลังส่ง(true, "กำลังสมัคร…");
    var บัญชี;
    try {
      บัญชี = await createUserWithEmailAndPassword(auth, email, password);
    } catch (ข้อผิดพลาด) {
      เตือน(แปลข้อผิดพลาดAuth(ข้อผิดพลาด), "email");
      กำลังส่ง(false);
      return;
    }

    // ถึงตรงนี้บัญชีเกิดขึ้นแล้วและล็อกอินให้อัตโนมัติแล้ว เหลือแค่บันทึกโปรไฟล์
    await บันทึกโปรไฟล์(บัญชี.user.uid, name, email);
  });

  // ── ขั้นที่ 2 · เขียนไฟล์ users/{uid} ──
  // แยกออกมาเป็นฟังก์ชันเพราะถ้าล้มเหลว ต้องเรียกซ้ำได้โดยไม่ต้องสมัครบัญชีใหม่
  async function บันทึกโปรไฟล์(uid, name, email) {
    กำลังส่ง(true, "กำลังบันทึกโปรไฟล์…");
    try {
      await setDoc(doc(db, "users", uid), {
        name: name,
        email: email,
        role: "employee"                      // คนสมัครเองได้บทบาทนี้เสมอ เปลี่ยนได้เฉพาะฝ่ายบุคคล
      });
      location.replace("index.html");         // ครบทั้งสองขั้นแล้วเท่านั้นถึงเปลี่ยนหน้า
    } catch (ข้อผิดพลาด) {
      บอกว่าโปรไฟล์ยังไม่ถูกบันทึก(ข้อผิดพลาด, uid, name, email);
    }
  }

  // บัญชีเกิดแล้วแต่โปรไฟล์ยังไม่ลงฐาน — สถานะครึ่ง ๆ กลาง ๆ ที่ต้องบอกให้ชัด
  function บอกว่าโปรไฟล์ยังไม่ถูกบันทึก(ข้อผิดพลาด, uid, name, email) {
    กล่องเตือน.className = "alert alert-warn";
    กล่องเตือน.innerHTML =
      window.ไอคอน("เตือน") +
      "<div><strong>สร้างบัญชีสำเร็จแล้ว แต่บันทึกชื่อลงฐานข้อมูลไม่สำเร็จ</strong><br>" +
      "สาเหตุ: " + esc(แปลข้อผิดพลาดAuth(ข้อผิดพลาด)) + "<br>" +
      "ตอนนี้คุณล็อกอินอยู่แล้ว แต่ระบบยังไม่รู้ชื่อและบทบาทของคุณ — " +
      "กดปุ่มข้างล่างเพื่อบันทึกอีกครั้ง (ไม่ต้องสมัครใหม่ อีเมลนี้ถูกใช้ไปแล้ว)" +
      '<div class="btn-row"><button type="button" id="ปุ่มบันทึกโปรไฟล์ซ้ำ">บันทึกโปรไฟล์อีกครั้ง</button></div></div>';
    กล่องเตือน.classList.remove("hidden");

    document.getElementById("ปุ่มบันทึกโปรไฟล์ซ้ำ").addEventListener("click", function () {
      ซ่อนคำเตือน();
      บันทึกโปรไฟล์(uid, name, email);
    });

    ฟอร์ม.classList.add("hidden");            // ซ่อนฟอร์ม กันกดสมัครซ้ำแล้วเจอ email-already-in-use
    กำลังส่ง(false);
  }

  // ── เกณฑ์รหัสผ่านที่ติ๊กถูกให้เห็นระหว่างพิมพ์ ──
  // บอกตอนที่ยังแก้ได้ง่าย ดีกว่ารอให้กดสมัครแล้วค่อยขึ้นข้อความสีแดง
  // ด่านตรวจตอนกดสมัครยังอยู่ครบ ส่วนนี้เพิ่มมาเพื่อบอกล่วงหน้าเท่านั้น
  function ติดเกณฑ์รหัสผ่านสด() {
    var ช่องรหัส = document.getElementById("password");
    var ช่องซ้ำ = document.getElementById("password2");

    function ตรวจ() {
      สลับ("เกณฑ์ความยาว", ช่องรหัส.value.length >= รหัสผ่านสั้นสุด);
      สลับ("เกณฑ์ตรงกัน",
           ช่องซ้ำ.value.length > 0 && ช่องซ้ำ.value === ช่องรหัส.value);
    }

    // สลับทั้งสีและรูปไอคอน — คนที่แยกสีไม่ออกต้องเห็นความต่างจากรูปได้ด้วย
    function สลับ(รหัส, ผ่าน) {
      var บรรทัด = document.getElementById(รหัส);
      if (!บรรทัด) return;
      บรรทัด.classList.toggle("ผ่าน", ผ่าน);
      var รูป = บรรทัด.querySelector(".ico");
      if (รูป) รูป.outerHTML = window.ไอคอน(ผ่าน ? "ถูก" : "วงกลม", "ico-sm");
    }

    ช่องรหัส.addEventListener("input", ตรวจ);
    ช่องซ้ำ.addEventListener("input", ตรวจ);
  }

  // ใช้ตัวช่วยกลางจาก js/util.js กล่องเตือนจึงมีไอคอนและการจัดวางเหมือนทุกหน้า
  function เตือน(ข้อความ, ช่อง) {
    แสดงเตือน(กล่องเตือน, ข้อความ);
    if (ช่อง) document.getElementById(ช่อง).focus();
  }

  function ซ่อนคำเตือน() {
    ซ่อนเตือน(กล่องเตือน);
  }

  function กำลังส่ง(กำลัง, ข้อความ) {
    ปุ่ม.disabled = กำลัง;
    ปุ่ม.textContent = กำลัง ? (ข้อความ || "กำลังทำงาน…") : "สมัครสมาชิก";
  }

  function esc(ข้อความ) {
    return String(ข้อความ == null ? "" : ข้อความ)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();

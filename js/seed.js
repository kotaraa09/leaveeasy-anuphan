// ─────────────────────────────────────────────────────────────
// js/seed.js — ใส่ข้อมูลตัวอย่างลง Firestore (สัปดาห์ที่ 6)
//
// เครื่องมือชั่วคราว ใช้ครั้งเดียวตอนตั้งระบบ ไม่ใช่ส่วนหนึ่งของหน้าจอระบบ
//
// หลักการ 3 ข้อ
//   1. อ่านข้อมูลจาก js/data.js ตรง ๆ ไม่พิมพ์ซ้ำ — ข้อมูล 2 ที่จะได้ไม่มีวันไม่ตรงกัน
//   2. กำหนดชื่อไฟล์เอง (u001, lr001) ไม่ปล่อยให้ Firestore สุ่มให้
//      เพราะ requesterId: "u001" ต้องชี้ไปเจอไฟล์จริง ไม่งั้นระบบพังแบบเงียบ ๆ
//   3. เขียนทีเดียวพร้อมกันทั้งชุด (batch) — สำเร็จทั้งหมด หรือไม่สำเร็จเลย
//      กันข้อมูลค้างครึ่ง ๆ กลาง ๆ ตอนเน็ตหลุดกลางคัน
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-init.js";
import { doc, writeBatch } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

(function () {
  const ปุ่ม = document.getElementById("ปุ่มใส่ข้อมูล");
  const กล่องบันทึก = document.getElementById("บันทึกผล");
  const กล่องเตือน = document.getElementById("ข้อความเตือน");
  const ข้อความยังไม่เริ่ม = document.getElementById("ยังไม่ได้เริ่ม");

  ปุ่ม.addEventListener("click", ใส่ข้อมูล);

  // ── เขียนข้อมูลทั้งหมดลงฐาน ──
  async function ใส่ข้อมูล() {
    ปุ่ม.disabled = true;
    ปุ่ม.textContent = "กำลังเขียนข้อมูล…";
    กล่องเตือน.classList.add("hidden");
    กล่องบันทึก.innerHTML = "";
    if (ข้อความยังไม่เริ่ม) ข้อความยังไม่เริ่ม.remove();

    const ข้อมูล = window.LEAVE_DATA;
    if (!ข้อมูล) {
      เตือน("อ่าน js/data.js ไม่ได้ — ตรวจว่าไฟล์ยังอยู่ และเปิดหน้านี้ผ่าน http://localhost:3000/seed.html");
      คืนปุ่ม();
      return;
    }

    try {
      const ชุดเขียน = writeBatch(db);
      let จำนวน = 0;

      // 📁 users — ตัดช่อง id ออก เพราะบน Firestore id คือ "ชื่อไฟล์" ไม่ใช่ช่องข้อมูล
      หัวข้อ("📁 users");
      ข้อมูล.users.forEach(function (คน) {
        const { id, ...ช่องข้อมูล } = คน;
        ชุดเขียน.set(doc(db, "users", id), ช่องข้อมูล);
        บรรทัด("users/" + id + "  —  " + คน.name + " (" + คน.role + ")");
        จำนวน++;
      });

      // 📁 leaveTypes
      หัวข้อ("📁 leaveTypes");
      ข้อมูล.leaveTypes.forEach(function (ประเภท) {
        const { id, ...ช่องข้อมูล } = ประเภท;
        ชุดเขียน.set(doc(db, "leaveTypes", id), ช่องข้อมูล);
        บรรทัด("leaveTypes/" + id + "  —  " + ประเภท.name);
        จำนวน++;
      });

      // 📁 leaveRequests
      หัวข้อ("📁 leaveRequests");
      ข้อมูล.leaveRequests.forEach(function (ใบ) {
        const { id, ...ช่องข้อมูล } = ใบ;
        ชุดเขียน.set(doc(db, "leaveRequests", id), ช่องข้อมูล);
        บรรทัด("leaveRequests/" + id + "  —  " + ใบ.status + "  —  " + ใบ.title);
        จำนวน++;
      });

      // 📁 approvals — โฟลเดอร์ย่อยที่ซ้อนอยู่ในใบลาแต่ละใบ
      // ตัด requestId ออกด้วย เพราะพอซ้อนอยู่ในใบลาใบนั้นแล้ว ไม่ต้องบอกซ้ำว่าเป็นของใบไหน
      หัวข้อ("📁 leaveRequests/{ใบลา}/approvals");
      ข้อมูล.approvals.forEach(function (ความเห็น) {
        const { id, requestId, ...ช่องข้อมูล } = ความเห็น;
        ชุดเขียน.set(doc(db, "leaveRequests", requestId, "approvals", id), ช่องข้อมูล);
        บรรทัด("leaveRequests/" + requestId + "/approvals/" + id + "  —  " + ความเห็น.authorName);
        จำนวน++;
      });

      // ส่งขึ้นฐานข้อมูลจริงตรงบรรทัดนี้บรรทัดเดียว
      await ชุดเขียน.commit();

      สำเร็จ("✅ เขียนสำเร็จครบ " + จำนวน + " ไฟล์ — เปิด Firebase Console ดูได้เลย");
      ปุ่ม.textContent = "ใส่ข้อมูลอีกครั้ง (เขียนทับของเดิม)";
    } catch (ข้อผิดพลาด) {
      เตือน(แปลข้อผิดพลาด(ข้อผิดพลาด));
      สำเร็จ("");  // ล้างบรรทัดสรุปทิ้ง กันเข้าใจผิดว่าเขียนสำเร็จ
      ปุ่ม.textContent = "ลองใส่ข้อมูลอีกครั้ง";
    }

    คืนปุ่ม();
  }

  // ── แปลข้อผิดพลาดของ Firebase ให้อ่านรู้เรื่อง ──
  function แปลข้อผิดพลาด(e) {
    const รหัส = (e && e.code) || "";

    if (รหัส === "permission-denied") {
      return "Firestore ปฏิเสธการเขียน — แปลว่ากฎความปลอดภัยยังปิดอยู่ " +
             "ให้เข้า Firebase Console → Firestore Database → แท็บ Rules " +
             'แล้วตรวจว่าเลือก Test mode ไว้ (สัปดาห์ที่ 7 จะกลับมาปิดกฎนี้ให้ถูกต้อง)';
    }
    if (รหัส === "unavailable" || รหัส === "failed-precondition") {
      return "ต่อฐานข้อมูลไม่ได้ — ตรวจว่าสร้าง Firestore Database ใน Console แล้ว " +
             "และเครื่องต่อเน็ตอยู่";
    }
    if (รหัส === "not-found") {
      return "ไม่พบฐานข้อมูลของโปรเจกต์นี้ — เข้า Firebase Console → Build → Firestore Database → Create database ก่อน";
    }
    if (รหัส === "invalid-argument") {
      return "ข้อมูลบางช่องมีรูปแบบที่ Firestore รับไม่ได้ — ตรวจ js/data.js ว่าไม่มีค่า undefined";
    }
    return "เขียนข้อมูลไม่สำเร็จ — " + ((e && e.message) || String(e));
  }

  // ── ตัวช่วยแสดงผลบนหน้าจอ ──
  function หัวข้อ(ข้อความ) {
    เพิ่มบรรทัด(ข้อความ, "บรรทัดหัวข้อ");
  }

  function บรรทัด(ข้อความ) {
    เพิ่มบรรทัด("   ✓ " + ข้อความ, "บรรทัดสำเร็จ");
  }

  function เพิ่มบรรทัด(ข้อความ, คลาส) {
    const แถว = document.createElement("div");
    แถว.className = คลาส;
    แถว.textContent = ข้อความ;
    กล่องบันทึก.appendChild(แถว);
  }

  function สำเร็จ(ข้อความ) {
    let กล่อง = document.getElementById("สรุปผล");
    if (!ข้อความ) {
      if (กล่อง) กล่อง.remove();
      return;
    }
    if (!กล่อง) {
      กล่อง = document.createElement("div");
      กล่อง.id = "สรุปผล";
      กล่อง.className = "alert alert-ok";
      กล่องบันทึก.parentNode.insertBefore(กล่อง, กล่องบันทึก);
    }
    กล่อง.textContent = ข้อความ;
  }

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  function คืนปุ่ม() {
    ปุ่ม.disabled = false;
  }
})();

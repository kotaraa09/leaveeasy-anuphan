// ─────────────────────────────────────────────────────────────
// js/leave-request-detail.js — หน้าที่ 3 รายละเอียดใบลา
// สัปดาห์ที่ 6: อ่านใบลาและความเห็นจาก Firestore ของจริง
//
// ⚠️ สัปดาห์นี้ "อ่านอย่างเดียว"
//    การกดอนุมัติ/ไม่อนุมัติ และการส่งความเห็น ยังเปลี่ยนแค่ในหน่วยความจำ
//    ยังไม่บันทึกกลับลงฐาน — เป็นงานของสัปดาห์ที่ 7 (spec หัวข้อ 8)
//
// 🔑 เหมือนหน้ารายการ: บน Firestore id คือ "ชื่อไฟล์" ไม่ใช่ช่องข้อมูลข้างใน
//    อ่านกลับมาแล้วต้องแปะชื่อไฟล์กลับเป็นช่อง id เอง
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-init.js";
import { doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

(async function () {
  var รหัสใบลา = ค่าจากURL("id");
  var กล่องใบลา = document.getElementById("กล่องใบลา");
  var กล่องความเห็น = document.getElementById("กล่องความเห็น");

  var ใบ, ความเห็น;

  try {
    ใบ = await อ่านใบลา(รหัสใบลา);
  } catch (ข้อผิดพลาด) {
    แสดงข้อผิดพลาด(ข้อผิดพลาด);
    return;                                  // ต่อฐานไม่ได้ ต้องไม่ขึ้น "ไม่พบใบขอลา"
  }

  if (!ใบ) {
    กล่องใบลา.innerHTML = "<p>ไม่พบใบขอลาที่ต้องการ — อาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง</p>";
    return;
  }

  try {
    ความเห็น = await อ่านความเห็น(ใบ.id);
  } catch (ข้อผิดพลาด) {
    ความเห็น = [];                            // อ่านความเห็นไม่ได้ ก็ยังให้ดูใบลาต่อได้
  }

  วาดใบลา();
  วาดความเห็น();
  กล่องความเห็น.classList.remove("hidden");

  document.getElementById("ปุ่มส่งความเห็น").addEventListener("click", ส่งความเห็น);

  // ── อ่านใบลา 1 ใบจากโฟลเดอร์ leaveRequests ──
  async function อ่านใบลา(รหัส) {
    if (!รหัส) return null;

    var ไฟล์ = await getDoc(doc(db, "leaveRequests", รหัส));
    if (ไฟล์.exists()) {
      // ไฟล์.id = ชื่อไฟล์ (เช่น "lr001") · ไฟล์.data() = ช่องข้อมูลข้างใน
      return Object.assign({ id: ไฟล์.id }, ไฟล์.data());
    }

    // ไม่เจอในฐาน — อาจเป็นใบที่เพิ่งยื่นจากฟอร์ม ซึ่งยังอยู่แค่ในหน่วยความจำของเบราว์เซอร์
    // (สัปดาห์ที่ 7 ฟอร์มจะบันทึกลงฐานจริง แล้วสองบรรทัดนี้จะถูกลบทิ้ง)
    var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
    return ใบลาที่ยื่นใหม่.find(function (x) { return x.id === รหัส; }) || null;
  }

  // ── อ่านความเห็นจากโฟลเดอร์ย่อย approvals ที่ซ้อนอยู่ในใบลาใบนี้ ──
  // ไม่ต้องกรองด้วย requestId เหมือนตอนใช้ข้อมูลปลอม เพราะโฟลเดอร์ย่อยนี้
  // เป็นของใบลาใบนี้อยู่แล้วโดยโครงสร้าง
  async function อ่านความเห็น(รหัส) {
    var ผล = await getDocs(collection(db, "leaveRequests", รหัส, "approvals"));
    return ผล.docs.map(function (ไฟล์) {
      return Object.assign({ id: ไฟล์.id }, ไฟล์.data());
    });
  }

  // ── ต่อฐานข้อมูลไม่ได้ ต้องบอกสาเหตุ ไม่ใช่ค้างที่ "กำลังโหลด…" ตลอดไป ──
  function แสดงข้อผิดพลาด(e) {
    var รหัส = (e && e.code) || "";
    var สาเหตุ;

    if (รหัส === "permission-denied") {
      สาเหตุ = "Firestore ปฏิเสธการอ่าน — กฎความปลอดภัยยังปิดอยู่ " +
               "ให้เข้า Firebase Console → Firestore Database → แท็บ Rules แล้วตรวจว่าเลือก Test mode ไว้";
    } else if (รหัส === "unavailable") {
      สาเหตุ = "ต่อฐานข้อมูลไม่ได้ — ตรวจว่าเครื่องต่อเน็ตอยู่ แล้วกด F5 อีกครั้ง";
    } else if (รหัส === "not-found") {
      สาเหตุ = "ไม่พบฐานข้อมูลของโปรเจกต์นี้ — ตรวจค่าใน js/firebase-init.js";
    } else {
      สาเหตุ = "อ่านข้อมูลไม่สำเร็จ — " + ((e && e.message) || String(e));
    }

    กล่องใบลา.innerHTML = '<div class="alert alert-error">⚠️ ' + esc(สาเหตุ) + "</div>";
  }

  // ── วาดข้อมูลใบลาลงหน้าจอ ──
  function วาดใบลา() {
    var แถว = [
      ["หัวข้อ", esc(ใบ.title)],
      ["เหตุผลการลา", esc(ใบ.reason)],
      ["ประเภทการลา", esc(ใบ.leaveTypeName)],
      ["วันที่ลา", esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate)],
      ["ผู้ขอลา", esc(ใบ.requesterName)],
      ["ผู้อนุมัติ", ใบ.approverName ? esc(ใบ.approverName) : "ยังไม่ได้กำหนดผู้อนุมัติ"],
      ["สถานะ", ป้ายสถานะ(ใบ.status)],
      ["วันที่ยื่น", esc(ใบ.createdAt)]
    ];

    var html = แถว.map(function (r) {
      return '<div class="field-row"><span class="k">' + r[0] + "</span><span>" + r[1] + "</span></div>";
    }).join("");

    // ปุ่มอนุมัติ / ไม่อนุมัติ ขึ้นเฉพาะใบที่ยังรอพิจารณา
    if (ใบ.status === "รอพิจารณา") {
      html +=
        '<div class="btn-row">' +
        '<button type="button" class="btn-ok" id="ปุ่มอนุมัติ">อนุมัติ</button>' +
        '<button type="button" class="btn-danger" id="ปุ่มไม่อนุมัติ">ไม่อนุมัติ</button>' +
        "</div>" +
        '<p class="hint">สัปดาห์นี้ยังบันทึกกลับลงฐานไม่ได้ — กด F5 แล้วสถานะจะกลับไปเป็นค่าในฐานข้อมูล</p>';
    } else {
      html += '<p class="hint">ใบนี้พิจารณาแล้ว จึงเปลี่ยนสถานะต่อไม่ได้</p>';
    }

    กล่องใบลา.innerHTML = html;

    if (ใบ.status === "รอพิจารณา") {
      document.getElementById("ปุ่มอนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("อนุมัติ"); });
      document.getElementById("ปุ่มไม่อนุมัติ").addEventListener("click", function () { เปลี่ยนสถานะ("ไม่อนุมัติ"); });
    }
  }

  // ── เปลี่ยนสถานะ (สัปดาห์นี้เปลี่ยนแค่ในหน่วยความจำ · บันทึกลงฐานเป็นงานสัปดาห์ที่ 7) ──
  function เปลี่ยนสถานะ(สถานะใหม่) {
    // กฎ: จะไม่อนุมัติได้ ต้องมีความเห็นอย่างน้อย 1 รายการก่อน
    if (สถานะใหม่ === "ไม่อนุมัติ" && ความเห็น.length === 0) {
      alert("ต้องเขียนความเห็นอย่างน้อย 1 รายการก่อน จึงจะกดไม่อนุมัติได้");
      return;
    }
    ใบ.status = สถานะใหม่;   // แก้เฉพาะช่อง status เท่านั้น
    วาดใบลา();
  }

  // ── รายการความเห็น เรียงจากเก่าไปใหม่ ──
  function วาดความเห็น() {
    var ที่วาง = document.getElementById("รายการความเห็น");
    if (ความเห็น.length === 0) {
      ที่วาง.innerHTML = "<p>ยังไม่มีความเห็นในใบนี้</p>";
      return;
    }
    ที่วาง.innerHTML = ความเห็น
      .slice()
      .sort(function (a, b) { return a.createdAt < b.createdAt ? -1 : 1; })
      .map(function (c) {
        return '<div class="comment"><div class="meta">' + esc(c.authorName) + " · " + esc(c.createdAt) +
               "</div><div>" + esc(c.message) + "</div></div>";
      }).join("");
  }

  // ── ส่งความเห็นใหม่ (สัปดาห์นี้เก็บแค่ในหน่วยความจำ) ──
  function ส่งความเห็น() {
    var ช่อง = document.getElementById("ข้อความความเห็น");
    var เตือน = document.getElementById("เตือนความเห็น");
    var ข้อความ = ช่อง.value.trim();

    if (!ข้อความ) {
      เตือน.textContent = "⚠️ พิมพ์ข้อความก่อน จึงจะส่งความเห็นได้";
      เตือน.classList.remove("hidden");
      return;
    }
    เตือน.classList.add("hidden");

    // สัปดาห์ที่ 6 ยังไม่มีล็อกอิน จึงสมมติว่าผู้เขียนคือ สมหญิง รักงาน
    ความเห็น.push({
      id: "ap-ใหม่-" + Date.now(),
      authorId: "u002", authorName: "สมหญิง รักงาน",
      message: ข้อความ,
      createdAt: เวลาตอนนี้()
    });
    ช่อง.value = "";
    วาดความเห็น();
  }
})();

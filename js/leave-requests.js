// ─────────────────────────────────────────────────────────────
// js/leave-requests.js — หน้าที่ 1 รายการใบลา
// สัปดาห์ที่ 6: อ่านจากโฟลเดอร์ leaveRequests บน Firestore ของจริง
//
// 🔑 จุดที่ต้องระวังที่สุดในไฟล์นี้
//    บน Firestore ช่อง id ไม่ได้อยู่ข้างในไฟล์ แต่ id คือ "ชื่อไฟล์"
//    เวลาอ่านกลับมาจึงต้องเอาชื่อไฟล์มาแปะกลับเป็นช่อง id เอง
//    ถ้าลืม ตารางจะขึ้นครบทุกแถวสวยงาม แต่กดแล้วไม่ไปไหน — พังแบบเงียบ ๆ
// ─────────────────────────────────────────────────────────────

import { db } from "./firebase-init.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

(async function () {
  var กล่อง = document.getElementById("ผลลัพธ์");

  // ── อ่านใบลาจากฐานข้อมูลจริง ──
  // ระหว่างรอตรงบรรทัดนี้ หน้าจอจะค้างข้อความ "กำลังโหลดข้อมูล…" ที่เขียนไว้ใน HTML
  var ใบลาทั้งหมด;
  try {
    ใบลาทั้งหมด = await อ่านใบลาจากฐาน();
  } catch (ข้อผิดพลาด) {
    แสดงข้อผิดพลาด(ข้อผิดพลาด);
    return;                                  // ต่อฐานไม่ได้ ต้องไม่ขึ้น "ยังไม่มีใบขอลาในระบบ"
  }

  // ใบที่เพิ่งยื่นในหน้าถัดไป ยังเก็บในหน่วยความจำของเบราว์เซอร์อยู่
  // (สัปดาห์ที่ 7 ฟอร์มจะบันทึกลงฐานจริง แล้วสองบรรทัดนี้จะถูกลบทิ้ง)
  var ใบลาที่ยื่นใหม่ = JSON.parse(sessionStorage.getItem("ใบลาที่ยื่นใหม่") || "[]");
  ใบลาทั้งหมด = ใบลาทั้งหมด.concat(ใบลาที่ยื่นใหม่);

  // เรียงจากใหม่ไปเก่าตามวันเวลาที่ยื่น
  // เรียงที่นี่ ไม่ได้สั่งให้ Firestore เรียงมาให้ เพราะต้องเรียงใบจากสองแหล่งปนกัน
  // ถ้าให้ Firestore เรียงมาแล้วค่อยเอาใบใหม่มาต่อท้าย ใบที่ใหม่ที่สุดจะไปโผล่ล่างสุด
  ใบลาทั้งหมด.sort(function (a, b) {
    return a.createdAt > b.createdAt ? -1 : 1;
  });

  // ถ้ามีสถานะติดมาท้าย URL ให้กรองเฉพาะสถานะนั้น
  var สถานะที่กรอง = ค่าจากURL("status");
  if (สถานะที่กรอง) {
    ใบลาทั้งหมด = ใบลาทั้งหมด.filter(function (ใบ) { return ใบ.status === สถานะที่กรอง; });
    document.querySelector(".subtitle").textContent =
      "กำลังแสดงเฉพาะใบลาที่สถานะ " + สถานะที่กรอง + " · กดเมนู รายการใบลา เพื่อดูทั้งหมด";
  }

  แสดงจำนวน(ใบลาทั้งหมด.length);
  แสดงตาราง(ใบลาทั้งหมด);

  // ── บอกจำนวนใบลาที่กำลังแสดงอยู่ ──
  // ตอนกรองตามสถานะ จะนับเฉพาะใบที่เห็นบนหน้าจอ ไม่ใช่ทั้งระบบ
  // ถ้าไม่มีสักใบ ไม่ต้องขึ้น "ทั้งหมด 0 ใบ" เพราะตารางบอกอยู่แล้วว่ายังไม่มีใบขอลา
  function แสดงจำนวน(จำนวน) {
    var ที่วาง = document.getElementById("จำนวนใบลา");
    ที่วาง.textContent = จำนวน === 0 ? "" : "ทั้งหมด " + จำนวน + " ใบ";
  }

  // ── ดึงใบลาทุกใบจากโฟลเดอร์ leaveRequests ──
  async function อ่านใบลาจากฐาน() {
    var ผล = await getDocs(collection(db, "leaveRequests"));

    return ผล.docs.map(function (ไฟล์) {
      // ไฟล์.id = ชื่อไฟล์ (เช่น "lr001") · ไฟล์.data() = ช่องข้อมูลข้างใน
      // แปะชื่อไฟล์กลับเข้าไปเป็นช่อง id เพื่อให้ตัววาดตารางสร้างลิงก์ได้เหมือนเดิม
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

    กล่อง.innerHTML = '<div class="alert alert-error">⚠️ ' + esc(สาเหตุ) + "</div>";
  }

  function แสดงตาราง(รายการ) {
    if (รายการ.length === 0) {
      กล่อง.innerHTML = "<p>ยังไม่มีใบขอลาในระบบ</p>";
      return;
    }

    var html =
      "<table><thead><tr>" +
      "<th>หัวข้อ</th>" +
      "<th>ประเภทการลา</th>" +
      "<th>สถานะ</th>" +
      '<th class="hide-mobile">ผู้ขอลา</th>' +
      '<th class="hide-mobile">วันที่ลา</th>' +
      "</tr></thead><tbody>";

    รายการ.forEach(function (ใบ) {
      html +=
        '<tr class="clickable" data-id="' + esc(ใบ.id) + '">' +
        "<td>" + esc(ใบ.title) + "</td>" +
        "<td>" + esc(ใบ.leaveTypeName) + "</td>" +
        "<td>" + ป้ายสถานะ(ใบ.status) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.requesterName) + "</td>" +
        '<td class="hide-mobile">' + esc(ใบ.startDate) + " ถึง " + esc(ใบ.endDate) + "</td>" +
        "</tr>";
    });

    html += "</tbody></table>";
    กล่อง.innerHTML = html;

    // กดที่แถวไหน ไปหน้ารายละเอียดของใบนั้น
    กล่อง.querySelectorAll("tr.clickable").forEach(function (แถว) {
      แถว.addEventListener("click", function () {
        location.href = "leave-request-detail.html?id=" + แถว.dataset.id;
      });
    });
  }
})();

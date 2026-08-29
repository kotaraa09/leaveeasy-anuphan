// ─────────────────────────────────────────────────────────────
// js/nav.js — แถบเมนูด้านบนที่ใช้ร่วมกันทุกหน้า
// แก้เมนูที่ไฟล์นี้ที่เดียว ทุกหน้าเปลี่ยนตามพร้อมกัน
//
// วิธีใช้: ทุกหน้ามี <div id="nav"></div> ไว้บนสุดของ body
// ─────────────────────────────────────────────────────────────

(function () {
  var เมนู = [
    { href: "index.html",             ชื่อ: "หน้าแรก" },
    { href: "leave-requests.html",    ชื่อ: "รายการใบลา" },
    { href: "new-leave-request.html", ชื่อ: "ยื่นใบลาใหม่" },
    { href: "leave-types.html",       ชื่อ: "ประเภทการลา" }
  ];

  // ชื่อหน้าแบบตัด .html ออก เอาไว้เทียบว่าตอนนี้อยู่หน้าไหน
  //
  // ต้องตัด .html ทิ้งก่อนเทียบ เพราะเซิร์ฟเวอร์ที่ใช้ตอนพัฒนา (serve) จะเปลี่ยน
  // /leave-requests.html ให้กลายเป็น /leave-requests ให้เองอัตโนมัติ
  // ถ้าเอา "leave-requests" ไปเทียบกับ "leave-requests.html" ตรง ๆ จะไม่ตรงสักอัน
  // แล้วเส้นใต้ใต้เมนูจะไม่ขึ้นเลยสักหน้า
  function ชื่อหน้า(ที่อยู่) {
    return (ที่อยู่.split("/").pop() || "index").replace(/\.html$/, "");
  }

  // หน้าที่ไม่มีเมนูของตัวเอง แต่เป็นหน้าลูกของเมนูอื่น
  // เปิดหน้ารายละเอียดใบลาอยู่ ก็ให้ขีดเส้นใต้ที่ "รายการใบลา" จะได้รู้ว่าตัวเองอยู่ตรงไหน
  var หน้าลูกของ = {
    "leave-request-detail": "leave-requests"
  };

  var หน้าปัจจุบัน = ชื่อหน้า(location.pathname);
  หน้าปัจจุบัน = หน้าลูกของ[หน้าปัจจุบัน] || หน้าปัจจุบัน;

  var html = '<div class="navbar"><span class="brand">🔧 LeaveEasy</span>';
  เมนู.forEach(function (m) {
    var active = ชื่อหน้า(m.href) === หน้าปัจจุบัน ? ' class="active"' : "";
    html += '<a href="' + m.href + '"' + active + ">" + m.ชื่อ + "</a>";
  });
  // ช่องว่างสำหรับแสดงชื่อคนที่ล็อกอินอยู่ (เติมค่าในสัปดาห์ที่ 7)
  html += '<span class="nav-user" id="navUser"></span></div>';

  var ที่วาง = document.getElementById("nav");
  if (ที่วาง) ที่วาง.innerHTML = html;
})();

// แถบเตือนสีเหลือง ใช้ตอนที่ยังไม่ได้ตั้งค่า Firebase
function showConfigWarning(ข้อความ) {
  var กล่อง = document.createElement("div");
  กล่อง.className = "alert alert-warn";
  กล่อง.innerHTML =
    "⚠️ <strong>ยังไม่ได้ตั้งค่า Firebase</strong> — " +
    (ข้อความ || "หน้านี้จึงยังไม่ได้อ่านข้อมูลจากฐานข้อมูลจริง") +
    "<br>วิธีตั้งค่าอยู่ในไฟล์ SETUP.md ขั้นที่ 4";
  var ที่วาง = document.querySelector(".container") || document.body;
  ที่วาง.insertBefore(กล่อง, ที่วาง.firstChild);
}

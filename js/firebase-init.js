// ─────────────────────────────────────────────────────────────
// js/firebase-init.js — จุดเชื่อมต่อ Firebase ของทั้งระบบ
//
// ไฟล์นี้ทำอย่างเดียว: เปิดการเชื่อมต่อไปยัง Firestore แล้วส่งต่อให้หน้าอื่นใช้
// หน้าไหนต้องการคุยกับฐานข้อมูล ให้ดึงตัวแปร db จากไฟล์นี้ไป ไม่ต้องตั้งค่าซ้ำ
//
// 🔓 ค่า firebaseConfig ข้างล่างนี้ "ไม่ใช่ความลับ"
//    Firebase ออกแบบมาให้เปิดเผยได้ ใครเปิดหน้าเว็บเราก็เห็นค่านี้อยู่แล้ว
//    สิ่งที่กันคนอื่นเข้าถึงข้อมูลจริง ๆ คือ Security Rules (สัปดาห์ที่ 7-8)
//    ไม่ใช่การซ่อนค่าพวกนี้ — จึง commit ขึ้น GitHub ได้ตามปกติ
//
// ⚠️ ไฟล์นี้เป็นแบบ module จึงต้องเปิดผ่าน http://localhost:3000
//    เปิดด้วยการดับเบิลคลิกไฟล์ (file://) เบราว์เซอร์จะบล็อก
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBF6G90hF_YzhjT8y4DyIMZY1Ai5TxLgbU",
  authDomain: "leaveeasy-anuphan.firebaseapp.com",
  projectId: "leaveeasy-anuphan",
  storageBucket: "leaveeasy-anuphan.firebasestorage.app",
  messagingSenderId: "794901713437",
  appId: "1:794901713437:web:0251ef5a0977bae366acf4"
  // measurementId ตัดออก — Analytics ไม่อยู่ในขอบเขต Module 2
};

// ตัวเชื่อมต่อฐานข้อมูล ที่หน้าอื่นจะดึงไปใช้
export const db = getFirestore(initializeApp(firebaseConfig));

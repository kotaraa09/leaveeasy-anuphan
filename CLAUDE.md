# CLAUDE.md — กติกาประจำโครงงาน LeaveEasy

ไฟล์นี้คือสิ่งที่ Claude Code ต้องอ่านก่อนลงมือแก้โค้ดในโฟลเดอร์นี้
เอกสารฉบับเต็มอยู่ที่ `leaveeasy-spec.md` — ไฟล์นี้เก็บเฉพาะข้อที่ผิดบ่อยและห้ามเดาเอง

---

## 1. ชื่อโฟลเดอร์ทั้งหมดบน Firestore

Firestore เก็บข้อมูลเป็น 📁 **โฟลเดอร์ (Collection)** ซ้อน 📄 **ไฟล์ (Document)**
โครงงานนี้มีโฟลเดอร์ **4 ชื่อ เท่านี้ ห้ามสร้างเพิ่มเอง**

| ชื่อโฟลเดอร์ | เก็บอะไร | ชื่อไฟล์ข้างใน | ช่องข้อมูล |
|---|---|---|---|
| `users` | ผู้ใช้ | `u001`, `u002`, `u003` | `name` · `email` · `role` |
| `leaveTypes` | ประเภทการลา | `lt001`, `lt002`, `lt003` | `name` |
| `leaveRequests` | ใบขอลา | `lr001` … `lr005` | `title` · `reason` · `status` · `requesterId` · `requesterName` · `approverId` · `approverName` · `leaveTypeId` · `leaveTypeName` · `startDate` · `endDate` · `createdAt` |
| `leaveRequests/{รหัสใบลา}/approvals` | ความเห็นการอนุมัติ — **โฟลเดอร์ย่อยที่ซ้อนอยู่ในใบลาแต่ละใบ** ไม่ใช่โฟลเดอร์ระดับบนสุด | `ap001` … `ap004` | `authorId` · `authorName` · `message` · `createdAt` |

```
📁 users/          📄 u001 { name, email, role }
📁 leaveTypes/     📄 lt001 { name }
📁 leaveRequests/  📄 lr001 { title, reason, status, requesterId, requesterName,
                              approverId, approverName, leaveTypeId, leaveTypeName,
                              startDate, endDate, createdAt }
                      📁 approvals/  📄 ap001 { authorId, authorName, message, createdAt }
```

**กติกาของชื่อโฟลเดอร์**

- เขียน **ติดกันแบบไม่มีขีดล่าง** — `leaveRequests` `leaveTypes` เท่านั้น
  ห้ามใช้ `leave_requests`, `leave-types`, `LeaveRequests` หรือรูปเอกพจน์อย่าง `leaveRequest`
- ชื่อ ERD ใน `leaveeasy-spec.md` หัวข้อ 5.1 (`leave_requests`, `leave_types`) เป็นชื่อแบบตารางเท่านั้น
  **ตอนเขียนโค้ดให้ใช้ชื่อในตารางข้างบนเสมอ**
- `id` ของแต่ละรายการคือ **ชื่อไฟล์ (Document ID)** ไม่ใช่ช่องข้อมูลข้างใน
  ตอนเขียนลงฐานต้องตัดช่อง `id` ออกก่อน (ดูตัวอย่างใน `js/seed.js`)
- Firestore ไม่มี JOIN — ทุกครั้งที่เก็บรหัสอ้างถึงไฟล์อื่น **ต้องจดชื่อซ้ำไว้คู่กันเสมอ**
  (`requesterId` คู่กับ `requesterName`, `approverId` คู่กับ `approverName`, `leaveTypeId` คู่กับ `leaveTypeName`)
  ไม่งั้นหน้าจอจะขึ้น `u001` แทนชื่อคน

---

## 2. สถานะใบลา — มี 3 แบบเท่านั้น

ช่อง `status` ของ `leaveRequests` รับได้แค่ **3 ค่านี้ เป็นข้อความภาษาไทย สะกดตามนี้เป๊ะ**

| ค่าในช่อง `status` | ความหมาย | สีป้ายบนหน้าจอ |
|---|---|---|
| `รอพิจารณา` | ยื่นแล้ว หัวหน้ายังไม่ตัดสิน | 🟡 เหลือง |
| `อนุมัติ` | หัวหน้าอนุมัติแล้ว | 🟢 เขียว |
| `ไม่อนุมัติ` | หัวหน้าไม่อนุมัติ | 🔴 แดง |

**กติกาของสถานะ**

- ห้ามเพิ่มค่าที่ 4 (เช่น `ยกเลิก`, `ร่าง`) และห้ามใช้คำอังกฤษ (`pending`, `approved`, `rejected`)
- ใบใหม่ที่ยื่นจากฟอร์ม **เริ่มที่ `รอพิจารณา` เสมอ** — ห้ามให้ผู้ขอลาเลือกสถานะเอง
- ปุ่ม **อนุมัติ / ไม่อนุมัติ** ขึ้นเฉพาะใบที่สถานะยังเป็น `รอพิจารณา` เท่านั้น
- จะกด **ไม่อนุมัติ** ได้ ต้องมีความเห็นในใบนั้นอย่างน้อย 1 รายการก่อน
- เปลี่ยนสถานะ = แก้เฉพาะช่อง `status` ช่องเดียว ห้ามเขียนทับทั้งไฟล์
- ค่า 3 ค่านี้ถูกใช้ทั้งใน `js/data.js`, `js/new-leave-request.js`, `js/leave-request-detail.js`,
  ตัวกรอง `?status=` ใน `js/leave-requests.js` และคลาสสี `badge-*` ใน `css/style.css`
  **แก้ที่ไหนต้องแก้ให้ตรงกันทุกที่**

---

## 3. ข้อห้าม — ห้ามใส่คีย์ลงไฟล์ที่ push ขึ้น GitHub

**ห้ามเขียนคีย์ รหัสผ่าน หรือ token ของจริงลงในไฟล์ใด ๆ ที่ถูก commit** และห้ามแนะนำให้ผู้ใช้ทำ

ห้ามใส่ลงไฟล์ที่ push เด็ดขาด:

- ไฟล์ **Service Account** ของ Firebase (`serviceAccountKey.json`, `*-firebase-adminsdk-*.json`) — ไฟล์นี้ข้ามกฎความปลอดภัยได้ทั้งหมด
- Private key ทุกชนิด (`*.pem`, `*.key`, `-----BEGIN PRIVATE KEY-----`)
- token / รหัสผ่าน / ค่าใน `.env`, `.env.local`, `firebase-debug.log`

**ข้อยกเว้นข้อเดียว — `firebaseConfig` ใน `js/firebase-init.js` commit ได้ตามปกติ**
ค่า `apiKey` ของ Firebase ฝั่งเว็บไม่ใช่ความลับ ใครเปิดหน้าเว็บเราก็เห็นอยู่แล้ว
สิ่งที่กันคนอื่นเข้าถึงข้อมูลจริงคือ **Security Rules** (สัปดาห์ที่ 7–8) ไม่ใช่การซ่อนค่านี้
**ห้ามย้ายค่านี้ไป `.env` หรือลบทิ้ง เพราะเข้าใจผิดว่าเป็นคีย์ลับ**

**สิ่งที่ต้องทำก่อน push ทุกครั้ง**

1. รัน `git status` แล้ว **อ่านรายชื่อไฟล์ที่จะขึ้นให้ผู้ใช้ดูก่อน**
2. ถ้าเห็น `node_modules/` หรือไฟล์ที่มีคำว่า `key` / `secret` / `credential` / `.env` — **หยุด อย่า push** แล้วบอกผู้ใช้
3. ถ้าจะกันไฟล์ใหม่ ให้เพิ่มชื่อลง `.gitignore` ก่อน แล้วค่อย commit

> ⚠️ ถ้าคีย์ของจริงเคยถูก commit ไปแล้ว **การลบไฟล์ทีหลังไม่พอ** — คีย์ยังอยู่ในประวัติ git
> ต้องเข้าไปเพิกถอน/สร้างคีย์ใหม่ใน Firebase Console ด้วย และให้บอกผู้ใช้ทันที

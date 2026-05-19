# ระบบ Sales Tracking — แบบสอบถามความพึงพอใจลูกค้าผ่าน QR Code

ระบบเก็บคะแนนความพึงพอใจลูกค้าครบวงจร (Customer Satisfaction System) พัฒนาแบบครบวงจรจากศูนย์ เหมาะสำหรับใช้งานบนอุปกรณ์เคลื่อนที่เป็นหลัก (Mobile-First) และออกแบบหน้าตาด้วยสีสันที่เรียบง่าย สวยงาม น่าเชื่อถือตามรูปแบบของแอปพลิเคชันธุรกรรมการเงินยุคใหม่ (Modern Mobile Banking Style)

---

## 🛠️ Tech Stack ที่ใช้

* **Backend**: Node.js 20+ / Express 4
* **Database**: SQLite (ขับเคลื่อนด้วย `node:sqlite` Native API ประสิทธิภาพสูง ไม่ต้องคอมไพล์)
* **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ไม่ใช้ framework)
* **QR Code Renderer**: `qrcode` (npm) นำเข้าแบบ CDN เพื่อเรนเดอร์ในฝั่ง Client ผ่าน canvas
* **Typography**: Noto Sans Thai จาก Google Fonts
* **Environment Variables**: `dotenv` สำหรับตั้งค่า configurations

---

## 📂 โครงสร้างโฟลเดอร์โครงการ

```
sales-tracking/
├── README.md                   ← เอกสารสรุปการติดตั้งและใช้งานระบบ
├── package.json                ← การกำหนด dependencies และสคริปต์
├── .env.example                ← ตัวอย่างการตั้งค่าตัวแปรสภาพแวดล้อม
├── .gitignore                  ← หลีกเลี่ยงการคอมมิตไฟล์ขยะและไฟล์ข้อมูลลับ
├── server.js                   ← ไฟล์เซิร์ฟเวอร์หลักของแอปพลิเคชัน Express
├── data/
│   └── database.db             ← ไฟล์ฐานข้อมูล SQLite (สร้างอัตโนมัติเมื่อเปิดเซิร์ฟเวอร์)
├── db/
│   ├── schema.sql              ← คำสั่งโครงสร้างตารางข้อมูล (SQLite Syntax)
│   ├── seed.sql                ← ชุดข้อมูลจำลองสำหรับใช้ในการเริ่มทำระบบ/ทดสอบ (SQLite Syntax)
│   └── connection.js           ← การจัดการการเชื่อมต่อฐานข้อมูล SQLite (DatabaseSync)
├── routes/
│   ├── qr-logs.js              ← API สำหรับประมวลผลการบันทึกการสร้าง QR Code
│   ├── survey.js               ← API สำหรับบันทึกคำตอบความพึงพอใจของลูกค้า
│   └── reports.js              ← API สำหรับสร้างสรุปยอดรายงาน (มีระบบ Basic Auth)
├── public/
│   ├── index.html              ← หน้าหลักสำหรับเซลล์ในการกรอกข้อมูลและสร้าง QR Code
│   ├── survey.html             ← หน้าแบบฟอร์มการตอบกลับสำหรับลูกค้า
│   ├── dashboard.html          ← หน้าจอแดชบอร์ดสรุปผลการประเมินสำหรับผู้จัดการ
│   ├── thank-you.html          ← หน้าขอบคุณลูกค้าหลังส่งแบบประเมินผลสำเร็จ
│   ├── css/
│   │   └── styles.css          ← สไตล์ชีทส่วนกลาง ออกแบบตาม modern UI token
│   └── js/
│       ├── qr-generator.js     ← ไฟล์จัดการหน้าจอสร้าง QR Code
│       ├── survey.js           ← ไฟล์จัดการหน้าตอบแบบประเมินของลูกค้า
│       └── dashboard.js        ← ไฟล์จัดเก็บคำสั่งการโหลดข้อมูลแดชบอร์ด
└── scripts/
    └── init-db.js              ← สคริปต์สำหรับสร้างตารางและใส่ชุดข้อมูลตั้งต้น
```

---

## ⚡ ขั้นตอนการติดตั้งและเริ่มต้นระบบ (Setup Instructions)

1. **ติดตั้ง dependencies**:
   ```bash
   npm install
   ```

2. **คัดลอกตัวอย่างการตั้งค่าตัวแปรสภาพแวดล้อม**:
   ```bash
   cp .env.example .env
   ```

3. **สร้างฐานข้อมูลและตารางเริ่มต้น**:
   ```bash
   node scripts/init-db.js
   ```

4. **รันเว็บเซิร์ฟเวอร์**:
   * สำหรับการทำงานทั่วไป:
     ```bash
     npm start
     ```
   * สำหรับการพัฒนาโปรแกรม (Hot-Reload ด้วย nodemon):
     ```bash
     npm run dev
     ```

---

## 🗄️ การจัดการฐานข้อมูล (Database Management)

* **ไฟล์ฐานข้อมูลหลัก**: เก็บอยู่ที่ `./data/database.db`
* **การสำรองข้อมูล (Backup)**: คุณสามารถคัดลอก (Copy) ไฟล์ `./data/database.db` ไปเก็บไว้เพื่อสำรองข้อมูลได้ทันที (ระบบเปิดใช้งาน WAL mode ทำให้สามารถสำรองข้อมูลขณะเซิร์ฟเวอร์ทำงานได้อย่างปลอดภัย)
* **การเข้าดูข้อมูลตรง ๆ**: สามารถใช้โปรแกรม [DB Browser for SQLite](https://sqlitebrowser.org/) (ฟรี) เพื่อเปิดไฟล์ หรือติดตั้งส่วนเสริม (Extension) **SQLite Viewer** ใน VS Code / Antigravity เพื่อดูและแก้ไขตารางข้อมูลได้ทันที
* **การรีเซ็ตข้อมูล (Reset)**: ลบไฟล์ `./data/database.db` จากนั้นสั่งรันสคริปต์ `node scripts/init-db.js` ระบบจะสร้างตารางและเตรียมชุดข้อมูลใหม่ให้จากศูนย์

---

## 🔗 URL แผนที่การใช้งานของแต่ละหน้าเว็บ

* **หน้าจอเซลล์สร้าง QR Code (Sales QR Creator)**: 
  `http://localhost:3000/` หรือ `http://localhost:3000/index.html`
* **หน้าแบบสอบถามของลูกค้า (Customer Survey)**: 
  `http://localhost:3000/survey.html?emp_id=E001&emp_name=สมชาย+ใจดี&project=ABC+Tower&qr_log_id=1&ts=1716000000000` (ตัวอย่าง URL ที่สร้างจาก QR)
* **หน้าแสดงความขอบคุณลูกค้า (Thank You Screen)**: 
  `http://localhost:3000/thank-you.html?score=5`
* **แดชบอร์ดผู้จัดการ (Manager Analytics)**: 
  `http://localhost:3000/dashboard.html` (ใช้ชื่อผู้ใช้/รหัสผ่านตาม `.env` เพื่อล็อกอิน)

---

## 🔌 ข้อมูลรายละเอียด API (Express Router)

### 1. บันทึกประวัติการสร้าง QR Code
* **Endpoint**: `POST /api/qr-logs`
* **Body Request (JSON)**:
  ```json
  {
    "employee_id": "E001",
    "employee_name": "สมชาย ใจดี",
    "project_name": "ABC Tower",
    "generated_url": "http://localhost:3000/survey.html?emp_id=E001&..."
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "id": 1,
    "created_at": "2026-05-19 10:45:00"
  }
  ```

### 2. บันทึกคำตอบแบบประเมินผลจากลูกค้า
* **Endpoint**: `POST /api/survey`
* **Body Request (JSON)**:
  ```json
  {
    "emp_id": "E001",
    "emp_name": "สมชาย ใจดี",
    "project": "ABC Tower",
    "satisfaction_score": 5,
    "suggestions": "บริการดีและรวดเร็วมากครับ",
    "qr_log_id": 1
  }
  ```
* **Response (JSON)**:
  ```json
  {
    "id": 1,
    "submitted_at": "2026-05-19 10:46:00",
    "message": "ขอบคุณสำหรับความเห็นของคุณ ความเห็นของคุณได้รับบันทึกเรียบร้อยแล้ว"
  }
  ```

### 3. ดึงสรุปผลรายงานแดชบอร์ด (ป้องกันด้วย Basic Auth)
* **Endpoint**: `GET /api/reports/summary?from=YYYY-MM-DD&to=YYYY-MM-DD`
* **Headers**: `Authorization: Basic <credentials>`
* **Response (JSON)**:
  ```json
  {
    "totals": {
      "qr_generated": 142,
      "surveys_received": 89,
      "response_rate": 62.7,
      "avg_score": 4.3
    },
    "by_employee": [
      { "employee_id": "E001", "employee_name": "สมชาย ใจดี", "responses": 23, "avg_score": 4.6 }
    ],
    "recent_responses": [
      { "submitted_at": "...", "employee_name": "...", "project_name": "...", "score": 5, "suggestions": "..." }
    ]
  }
  ```

---

## 🚀 ข้อมูลการนำขึ้นระบบจริง (Deployment Notes)

1. **การตั้งระบบบน VPS / Docker**:
   รันระบบ Node.js ผ่าน PM2 หรือยัด Express แอปพลิเคชันลงใน Docker container และเปิด port mapping ให้ถูกต้องตามสภาพแวดล้อมจริง โดยสำรองไฟล์ `./data/database.db` ผ่าน Docker Volumes เพื่อเก็บรักษาข้อมูลอย่างถาวร
2. **การตั้งค่าความปลอดภัย (Security Checklist)**:
   * เปลี่ยน `DASHBOARD_PASS` จากเดิมเสมอในสภาพแวดล้อมที่นำขึ้นระบบจริง
   * เปิดระบบ HTTPS บนเซิร์ฟเวอร์เพื่อให้ข้อมูลรหัสผ่านและการส่งประวัติเข้ารหัสอย่างปลอดภัย

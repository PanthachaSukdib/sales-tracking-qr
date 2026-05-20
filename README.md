# ระบบ Sales Tracking — แบบสอบถามความพึงพอใจลูกค้าผ่าน QR Code

ระบบเก็บคะแนนความพึงพอใจลูกค้าครบวงจร (Customer Satisfaction System) พัฒนาแบบครบวงจรจากศูนย์ เหมาะสำหรับใช้งานบนอุปกรณ์เคลื่อนที่เป็นหลัก (Mobile-First) และออกแบบหน้าตาด้วยสีสันที่เรียบง่าย สวยงาม น่าเชื่อถือตามรูปแบบของแอปพลิเคชันธุรกรรมการเงินยุคใหม่ (Modern Mobile Banking Style)

---

## 🛠️ Tech Stack ที่ใช้

* **Backend**: Node.js 20+ / Express 4
* **Database**: Google Sheets API (`googleapis`)
* **Frontend**: HTML5 + CSS3 + Vanilla JavaScript (ไม่ใช้ framework)
* **QR Code Renderer**: `qrcode` (npm) นำเข้าแบบ CDN เพื่อเรนเดอร์ในฝั่ง Client ผ่าน canvas
* **Typography**: Noto Sans Thai (Self-hosted)
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
│   └── sheets-client.js        ← การจัดการการเชื่อมต่อ Google Sheets API
├── routes/
│   ├── qr-logs.js              ← API สำหรับประมวลผลการบันทึกการสร้าง QR Code
│   ├── survey.js               ← API สำหรับบันทึกคำตอบความพึงพอใจของลูกค้า
│   └── reports.js              ← API สำหรับสร้างสรุปยอดรายงาน (มีระบบ Basic Auth)
├── public/
│   ├── index.html              ← หน้าหลักสำหรับเซลล์ในการกรอกข้อมูลและสร้าง QR Code
│   ├── survey.html             ← หน้าแบบฟอร์มการตอบกลับสำหรับลูกค้า
│   ├── dashboard.html          ← หน้าจอแดชบอร์ดสรุปผลการประเมินสำหรับผู้จัดการ
│   ├── thank-you.html          ← หน้าขอบคุณลูกค้าหลังส่งแบบประเมินผลสำเร็จ
│   ├── scan.html               ← หน้าสำหรับรับค่า QR ก่อนส่งไปยัง MS Forms
│   ├── css/
│   │   ├── styles.css          ← สไตล์ชีทส่วนกลาง ออกแบบตาม modern UI token
│   │   └── fonts.css           ← สไตล์ชีทสำหรับโหลดฟอนต์ Noto Sans Thai แบบ Self-hosted
│   └── js/
│       ├── qr-generator.js     ← ไฟล์จัดการหน้าจอสร้าง QR Code
│       ├── survey.js           ← ไฟล์จัดการหน้าตอบแบบประเมินของลูกค้า
│       └── dashboard.js        ← ไฟล์จัดเก็บคำสั่งการโหลดข้อมูลแดชบอร์ด
└── scripts/
    └── download-fonts.js       ← สคริปต์สำหรับดาวน์โหลดฟอนต์จาก Google Fonts มาเก็บไว้ใน Server
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

3. **เตรียมไฟล์ Service Account JSON**:
   นำไฟล์ Service Account ของ Google Cloud ไปวางไว้ที่ `./secrets/google-sheets-service-account.json`

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

## 🗄️ การตั้งค่าฐานข้อมูล (Setup Google Sheets Database)

1. สร้าง Google Sheet ใหม่ตั้งชื่อ "Sales Tracking Data"
2. สร้าง 2 tabs: `qr_logs` และ `survey_results`
3. ใส่ header rows ตามนี้:
   * **qr_logs**: `id`, `created_at`, `employee_id`, `employee_name`, `project_name`, `customer_name`, `generated_url`, `user_agent`
   * **survey_results**: `id`, `submitted_at`, `employee_id`, `employee_name`, `project_name`, `customer_name`, `satisfaction_score`, `suggestions`
4. ไปที่ `console.cloud.google.com` สร้าง Project + Enable Google Sheets API
5. สร้าง Service Account + Download JSON key → วางที่ `./secrets/google-sheets-service-account.json`
6. คัดลอก email ของ Service Account → Share Google Sheet ให้ email นี้เป็น Editor
7. คัดลอก Sheet ID จาก URL → ใส่ใน `.env` เป็น `GOOGLE_SHEET_ID`

---

## 📝 การตั้งค่าฟอร์ม (Setup Microsoft Forms)

1. เปิดฟอร์มของคุณใน `forms.cloud.microsoft`
2. Settings → Show thank you message → เปิด
3. ใส่ข้อความ: `"ขอบคุณที่กรอกข้อมูล กรุณาประเมินความพึงพอใจ ที่นี่"`
4. ใส่ link "ที่นี่" ชี้ไปที่ `https://<your-domain>/survey.html`
5. คัดลอก URL ของฟอร์ม → ใส่ใน `.env` เป็น `MS_FORMS_URL`

---

## 🔗 URL แผนที่การใช้งานของแต่ละหน้าเว็บ

* **หน้าจอเซลล์สร้าง QR Code**: `http://localhost:3000/`
* **หน้า Redirect ลูกค้า (สแกน QR)**: `http://localhost:3000/scan.html?emp_id=E001&emp_name=สมชาย...` (ชี้ไป MS Forms อัตโนมัติ)
* **หน้าแบบสอบถามของลูกค้า (Customer Survey)**: `http://localhost:3000/survey.html` (ดึงข้อมูลพนักงานจาก LocalStorage)
* **แดชบอร์ดผู้จัดการ (Manager Analytics)**: `http://localhost:3000/dashboard.html`

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

## 🚀 ข้อมูลการนำขึ้นระบบจริง (Deploy Notes)

ตอน deploy production:
1. อัปเดต `QR_REDIRECT_BASE_URL` ใน `.env` ให้เป็น `https://<your-domain>/scan.html`
2. อัปเดต link ใน MS Forms thank you page ให้ตรงกัน
3. ทดสอบ flow บนมือถือจริงทั้ง iOS และ Android
4. **การตั้งค่าความปลอดภัย**: เปลี่ยน `DASHBOARD_PASS` เสมอ และตรวจสอบให้แน่ใจว่าโฟลเดอร์ `/secrets` ไม่ถูกเปิดเผยสู่สาธารณะ

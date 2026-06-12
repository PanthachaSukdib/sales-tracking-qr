// scripts/load-test.js
// สคริปต์จำลองบอทเทสการประมวลผลพร้อมๆ กัน (Load Testing) สำหรับระบบประเมินความพึงพอใจ

// ==========================================
// ⚙️ การตั้งค่าหลัก (SETTINGS)
// ==========================================
const TARGET_URL = 'https://sales-tracking-qr.vercel.app'; // เปลี่ยนเป็น 'http://localhost:3000' หากต้องการเทสที่เครื่องตนเอง (Local)
const CONCURRENT_USERS = 25; // จำนวนบอทที่ต้องการจำลองส่งข้อมูลพร้อมกัน (แนะนำเริ่มต้นที่ 20-30 ตัวบนรุ่นฟรี)

// ตัวช่วยหน่วงเวลาจำลองพฤติกรรมลูกค้า (Delay Helper)
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ตัวช่วยสุ่มคะแนนดาว (3, 4 หรือ 5 ดาว)
const randomRating = () => Math.floor(Math.random() * 3) + 3;

// ตัวช่วยสุ่มรหัสข้อความเพื่อสร้างเลข Job เฉพาะกิจ
const randomId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

async function runBot(botId) {
    const jobNo = `JOB-BOT-TEST-${randomId()}`;
    const empId = 'SST00888';
    const empName = 'กิตติทัศน์ ส่วนสมพงษ์';
    const customer = `บอทจำลอง บริษัท ${randomId()} จำกัด`;
    const sessionId = `bot-session-${botId}-${Date.now()}`;

    console.log(`[บอท #${botId}] เริ่มต้นการทดสอบ (สุ่มเลข Job: ${jobNo})`);

    try {
        // ขั้นตอนที่ 1: จำลองการสแกนและดึงการตั้งค่าคิวอาร์ (Fetch Config)
        const resConfig = await fetch(`${TARGET_URL}/api/config/qr-base`);
        if (!resConfig.ok) throw new Error('ดึงข้อมูลหน้าเปิดคิวอาร์ล้มเหลว');
        console.log(`[บอท #${botId}] 1. สแกนและโหลดหน้าเชื่อมต่อสำเร็จ`);

        // จำลองลูกค้าหน่วงเวลาอ่านข้อมูล PDPA 600ms
        await sleep(600);

        // ขั้นตอนที่ 2: บันทึกประวัติการสแกน (Post Scanned Event)
        const resEvent = await fetch(`${TARGET_URL}/api/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                session_id: sessionId,
                event_type: 'scanned',
                employee_id: empId,
                employee_name: empName,
                customer_name: customer,
                project_name: jobNo
            })
        });
        if (!resEvent.ok) throw new Error('บันทึก Event scanned ล้มเหลว');
        console.log(`[บอท #${botId}] 2. ส่งประวัติบันทึกการสแกนลง Database สำเร็จ`);

        // จำลองเวลาลูกค้าอ่านคำถามและจิ้มคะแนนดาว 1-2.5 วินาที
        await sleep(1000 + Math.random() * 1500);

        // ขั้นตอนที่ 3: ตรวจสอบสถานะการป้องกันการทำซ้ำ (Check Completed Status)
        const resCheck = await fetch(`${TARGET_URL}/api/survey/check-completed?project=${encodeURIComponent(jobNo)}`);
        if (!resCheck.ok) throw new Error('ตรวจสอบสถานะประเมินซ้ำล้มเหลว');
        console.log(`[บอท #${botId}] 3. เช็คระบบป้องกันสแกนซ้ำของเลข Job นี้สำเร็จ`);

        // ขั้นตอนที่ 4: ยิงแบบสอบถามประเมินความพึงพอใจ (Submit Survey)
        const payload = {
            session_id: sessionId,
            employee_id: empId,
            employee_name: empName,
            project_name: jobNo,
            customer_name: customer,
            pdpa_consent_1: 'ยินยอม',
            score_q1: randomRating(),
            score_q2: randomRating(),
            score_q3: randomRating(),
            score_q4: randomRating(),
            improvements: 'ความรวดเร็วในการประสานงานขาย',
            improvements_other: '',
            contact_name: `ผู้ติดต่อ บอท ${botId}`,
            contact_phone: '0812345678',
            contact_email: `bot${botId}@load-test.com`,
            pdpa_consent_2: 'ยินยอม'
        };

        const resSubmit = await fetch(`${TARGET_URL}/api/survey`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!resSubmit.ok) {
            const errText = await resSubmit.text();
            throw new Error(`ส่งข้อมูลแบบประเมินล้มเหลว: ${errText}`);
        }
        
        console.log(`[บอท #${botId}] 4. ส่งข้อมูลประเมินพึงพอใจสำเร็จ! 🎉`);
        return { success: true };

    } catch (err) {
        console.error(`\x1b[31m[บอท #${botId}] ❌ เกิดข้อผิดพลาด: ${err.message}\x1b[0m`);
        return { success: false, error: err.message };
    }
}

async function startLoadTest() {
    console.log(`=================================================`);
    console.log(`🚀 เริ่มการทดสอบระบบบอทโหลด (Load Testing Automation)`);
    console.log(`🎯 โดเมนเป้าหมาย: ${TARGET_URL}`);
    console.log(`👥 จำนวนบอทจำลอง: ${CONCURRENT_USERS} ตัว (ยิงงานพร้อมกัน)`);
    console.log(`=================================================`);

    const startTime = Date.now();
    
    // สร้าง Array ของบอททุกตัวเพื่อให้รันในลักษณะ Asynchronous Parallel (ยิงพร้อมกัน)
    const botPromises = [];
    for (let i = 1; i <= CONCURRENT_USERS; i++) {
        botPromises.push(runBot(i));
    }

    // รอให้บอททุกตัวรันเสร็จสิ้น
    const results = await Promise.all(botPromises);
    
    const duration = Date.now() - startTime;
    const totalSuccess = results.filter(r => r.success).length;
    const totalFail = results.filter(r => !r.success).length;

    console.log(`\n=================================================`);
    console.log(`🏁 สรุปผลการยิงทดสอบระบบ (Load Test Results)`);
    console.log(`⏱️ เวลาประมวลผลทั้งหมด: ${(duration / 1000).toFixed(2)} วินาที`);
    console.log(`✅ ส่งข้อมูลสำเร็จ: \x1b[32m${totalSuccess} รายการ\x1b[0m`);
    console.log(`❌ ส่งข้อมูลล้มเหลว: \x1b[31m${totalFail} รายการ\x1b[0m`);
    console.log(`📊 อัตราความสำเร็จ (Success Rate): ${((totalSuccess / CONCURRENT_USERS) * 100).toFixed(1)}%`);
    console.log(`=================================================`);
    console.log(`💡 คำแนะนำ: คุณสามารถเข้าไปดูผลประเมินของบอทได้ที่หน้า Dashboard หรือตาราง survey_results ใน Supabase ครับ`);
}

startLoadTest();

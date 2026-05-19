-- seed.sql: Mock SQLite data for testing and populating the Sales Tracking dashboard

-- Clear existing data
DELETE FROM survey_results;
DELETE FROM qr_logs;

-- Reset SQLite sequence tables
DELETE FROM sqlite_sequence WHERE name IN ('qr_logs', 'survey_results');

-- Insert into qr_logs
INSERT OR IGNORE INTO qr_logs (id, employee_id, employee_name, project_name, customer_name, generated_url, ip_address, user_agent, created_at) VALUES
(1, 'E001', 'สมชาย ใจดี', 'ABC Tower', 'บริษัท เอบีซี จำกัด', 'http://localhost:3000/survey.html?emp_id=E001&emp_name=%E0%B8%AA%E0%B8%A1%E0%B8%82%E0%B8%B2%E0%B8%A2%20%E0%B9%83%E0%B8%88%E0%B8%94%E0%B8%B5&project=ABC%20Tower&qr_log_id=1', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '-5 hours')),
(2, 'E001', 'สมชาย ใจดี', 'Grand Park Condo', 'คุณวิภาวรรณ', 'http://localhost:3000/survey.html?emp_id=E001&emp_name=%E0%B8%AA%E0%B8%A1%E0%B8%82%E0%B8%B2%E0%B8%A2%20%E0%B9%83%E0%B8%88%E0%B8%94%E0%B8%B5&project=Grand%20Park%20Condo&qr_log_id=2', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', datetime('now', '-4 hours')),
(3, 'E002', 'วิภาดา รักดี', 'XYZ Residence', 'คุณศิริพงษ์', 'http://localhost:3000/survey.html?emp_id=E002&emp_name=%E0%B8%A7%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%94%E0%B8%B2%20%E0%B8%A3%E0%B8%B1%E0%B8%81%E0%B8%94%E0%B8%B5&project=XYZ%20Residence&qr_log_id=3', '192.168.1.50', 'Mozilla/5.0 (Linux; Android 10; K)', datetime('now', '-1 day')),
(4, 'E002', 'วิภาดา รักดี', 'The Breeze Village', 'บริษัท ทรีโอเน็ต', 'http://localhost:3000/survey.html?emp_id=E002&emp_name=%E0%B8%A7%E0%B8%B4%E0%B8%A0%E0%B8%B2%E0%B8%94%E0%B8%B2%20%E0%B8%A3%E0%B8%B1%E0%B8%81%E0%B8%94%E0%B8%B5&project=The%20Breeze%20Village&qr_log_id=4', '127.0.0.1', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', datetime('now', '-3 days')),
(5, 'E003', 'สมพงษ์ ยอดขยัน', 'Siri Home', 'คุณมานพ', 'http://localhost:3000/survey.html?emp_id=E003&emp_name=%E0%B8%AA%E0%B8%A1%E0%B8%90%E0%B8%A5%E0%B9%80%E0%B8%A0%E0%B8%A5%E0%B8%B2%20%E0%B8%A2%E0%B8%AD%E0%B8%94%E0%B8%82%E0%B8%A2%E0%B8%B1%E0%B8%99&project=Siri%20Home&qr_log_id=5', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '-4 days')),
(6, 'E001', 'สมชาย ใจดี', 'Prime Office', 'บริษัท ไพรม์ลิมิเต็ด', 'http://localhost:3000/survey.html?emp_id=E001&emp_name=%E0%B8%AA%E0%B8%A1%E0%B8%82%E0%B8%B2%E0%B8%A2%20%E0%B9%83%E0%B8%88%E0%B8%94%E0%B8%B5&project=Prime%20Office&qr_log_id=6', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', datetime('now', '-5 days'));

-- Insert into survey_results matching the QR logs
INSERT OR IGNORE INTO survey_results (employee_id, employee_name, project_name, customer_name, satisfaction_score, suggestions, qr_log_id, customer_ip, submitted_at) VALUES
('E001', 'สมชาย ใจดี', 'ABC Tower', 'บริษัท เอบีซี จำกัด', 5, 'อธิบายข้อมูลและให้รายละเอียดดีมาก มีความสุภาพเรียบร้อย', 1, '127.0.0.1', datetime('now', '-4 hours')),
('E001', 'สมชาย ใจดี', 'Grand Park Condo', 'คุณวิภาวรรณ', 4, 'บริการดี รวดเร็ว แต่รอนานนิดหน่อย', 2, '127.0.0.1', datetime('now', '-3 hours')),
('E002', 'วิภาดา รักดี', 'XYZ Residence', 'คุณศิริพงษ์', 2, 'พนักงานมาสาย ไม่ตรงเวลา และให้ข้อมูลไม่ค่อยชัดเจน อยากให้ปรับปรุงด่วน', 3, '192.168.1.10', datetime('now', '-23 hours')),
('E002', 'วิภาดา รักดี', 'The Breeze Village', 'บริษัท ทรีโอเน็ต', 5, 'ประทับใจมากค่ะ ตอบคำถามรวดเร็วและช่วยเหลือเป็นอย่างดี', 4, '127.0.0.1', datetime('now', '-2 days')),
('E001', 'สมชาย ใจดี', 'Prime Office', 'บริษัท ไพรม์ลิมิเต็ด', 1, 'ติดต่อยากมาก โทรไปหลายสายไม่ยอมรับโทรศัพท์ และพูดจาไม่ค่อยสุภาพเลย', 6, '127.0.0.1', datetime('now', '-4 days'));

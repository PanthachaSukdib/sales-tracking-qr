-- 1. Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
    emp_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create employee_jobs table
CREATE TABLE IF NOT EXISTS public.employee_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    emp_id TEXT REFERENCES public.employees(emp_id) ON DELETE CASCADE,
    job_number TEXT NOT NULL,
    customer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(emp_id, job_number) -- Prevent duplicate jobs for same employee
);

-- 3. Enable RLS and add Public READ access
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.employees FOR SELECT USING (true);

ALTER TABLE public.employee_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.employee_jobs FOR SELECT USING (true);

-- 4. Insert Data (employees)
INSERT INTO public.employees (emp_id, name) VALUES
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์'),
('SST00721', 'ภาสวิชญ์ คัชมาตย์'),
('SST00730', 'พิมทอง บริบูรณ์'),
('SST00710', 'พสธร เรืองพระยา'),
('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล'),
('SST00008', 'ชานนท์ ชัยวัฒน์')
ON CONFLICT (emp_id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Insert Data (employee_jobs)
INSERT INTO public.employee_jobs (emp_id, job_number, customer) VALUES
('SST00888', 'SNWT-WP-24-0025', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),
('SST00888', 'SNWT-BC-24-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00721', 'SNWT-BC-24-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00721', 'SNWT-WP-24-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

('SST00730', 'SNWT-BC-24-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00730', 'SNWT-BC-24-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00710', 'SNWT-BC-24-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00710', 'SNWT-BC-24-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00259', 'SNWT-BC-24-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00259', 'SNWT-WP-24-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

-- WT สำหรับ SST00008
('SST00008', 'SNWT-BR-01-001', 'บจก. พีทีที เคมิคอล (บำบัดน้ำ Brentwood)'),
('SST00008', 'SNWT-DO-01-001', 'การประปานครหลวง (ระบบควบคุมวาล์ว Dorot)'),
('SST00008', 'SNWT-EV-01-001', 'บจก. เอสซีจี เปเปอร์ (บำบัดน้ำ Evoqua)'),
('SST00008', 'SNWT-FL-01-001', 'โรงงานอาหารไทยเพรซิเดนท์ (วาล์วไฟฟ้า Flowinn)'),
('SST00008', 'SNWT-HA-01-001', 'เทศบาลนครปฐม (ระบบกรองน้ำ HAUS)'),

-- MM สำหรับ SST00008
('SST00008', 'SNMM-EC-01-001', 'คอนโดมิเนียม แอสปาย (ปั๊มน้ำ ECON)'),
('SST00008', 'SNMM-IN-01-001', 'โรงงานสิ่งทอไทย (เครื่องทอ Innowarp)'),
('SST00008', 'SNMM-MB-01-001', 'บจก. ไทยเบฟเวอเรจ (ระบบสายพาน MBJ)'),
('SST00008', 'SNMM-VA-01-001', 'ศูนย์การค้าสยามพารากอน (ระบบส่งกำลัง Value)'),
('SST00008', 'SNMM-KO-01-001', 'คลังสินค้าบิ๊กซี (เครื่องพันฟิล์ม Kowrap)'),

-- EE สำหรับ SST00008
('SST00008', 'SNEE-NO-01-001', 'อาคารตึกช้าง (ระบบเตือนภัย Nohmi)'),
('SST00008', 'SNEE-NN-01-001', 'ธนาคารกสิกรไทย สำนักงานใหญ่ (ระบบดับเพลิง NN100)'),
('SST00008', 'SNEE-ME-01-001', 'โรงพยาบาลจุฬาลงกรณ์ (ระบบวาล์วเคมี MECH)'),
('SST00008', 'SNEE-SI-01-001', 'ศูนย์ข้อมูลศูนย์ราชการ (ระบบแก๊ส SIEX)'),

-- EF สำหรับ SST00008
('SST00008', 'SNEF-MC-01-001', 'ปั๊มน้ำมันบางจาก (ระบบป้องกันฟ้าผ่า MCG)'),
('SST00008', 'SNEF-Pr-01-001', 'โรงไฟฟ้าแม่เมาะ (หัวล่อฟ้า Prevectron)'),
('SST00008', 'SNEF-Pri-01-001', 'คลังน้ำมัน ปตท. พระโขนง (ป้องกันฟ้าผ่า Primer)'),

-- NC สำหรับ SST00008
('SST00008', 'SNNC-ZA-01-001', 'ห้องเซิร์ฟเวอร์ ธ.ไทยพาณิชย์ (ดับเพลิง ZAFEZONE)'),
('SST00008', 'SNNC-BL-01-001', 'รถโดยสาร ขสมก. (ระบบดับเพลิง BlazeCut)'),
('SST00008', 'SNNC-LE-01-001', 'ห้องครัวโรงแรมโอเรียนเต็ล (ดับเพลิง Lehavot)'),
('SST00008', 'SNNC-AG-01-001', 'โรงงานโตโยต้า (ระบบแจ้งเหตุ Aegis)'),

-- WT สำหรับ SST00888
('SST00888', 'SNWT-BR-01-001', 'บจก. พีทีที เคมิคอล (บำบัดน้ำ Brentwood)'),
('SST00888', 'SNWT-DO-01-001', 'การประปานครหลวง (ระบบควบคุมวาล์ว Dorot)'),
('SST00888', 'SNWT-EV-01-001', 'บจก. เอสซีจี เปเปอร์ (บำบัดน้ำ Evoqua)'),
('SST00888', 'SNWT-FL-01-001', 'โรงงานอาหารไทยเพรซิเดนท์ (วาล์วไฟฟ้า Flowinn)'),
('SST00888', 'SNWT-HA-01-001', 'เทศบาลนครปฐม (ระบบกรองน้ำ HAUS)'),

-- MM สำหรับ SST00888
('SST00888', 'SNMM-EC-01-001', 'คอนโดมิเนียม แอสปาย (ปั๊มน้ำ ECON)'),
('SST00888', 'SNMM-IN-01-001', 'โรงงานสิ่งทอไทย (เครื่องทอ Innowarp)'),
('SST00888', 'SNMM-MB-01-001', 'บจก. ไทยเบฟเวอเรจ (ระบบสายพาน MBJ)'),
('SST00888', 'SNMM-VA-01-001', 'ศูนย์การค้าสยามพารากอน (ระบบส่งกำลัง Value)'),
('SST00888', 'SNMM-KO-01-001', 'คลังสินค้าบิ๊กซี (เครื่องพันฟิล์ม Kowrap)'),

-- EE สำหรับ SST00888
('SST00888', 'SNEE-NO-01-001', 'อาคารตึกช้าง (ระบบเตือนภัย Nohmi)'),
('SST00888', 'SNEE-NN-01-001', 'ธนาคารกสิกรไทย สำนักงานใหญ่ (ระบบดับเพลิง NN100)'),
('SST00888', 'SNEE-ME-01-001', 'โรงพยาบาลจุฬาลงกรณ์ (ระบบวาล์วเคมี MECH)'),
('SST00888', 'SNEE-SI-01-001', 'ศูนย์ข้อมูลศูนย์ราชการ (ระบบแก๊ส SIEX)'),

-- EF สำหรับ SST00888
('SST00888', 'SNEF-MC-01-001', 'ปั๊มน้ำมันบางจาก (ระบบป้องกันฟ้าผ่า MCG)'),
('SST00888', 'SNEF-Pr-01-001', 'โรงไฟฟ้าแม่เมาะ (หัวล่อฟ้า Prevectron)'),
('SST00888', 'SNEF-Pri-01-001', 'คลังน้ำมัน ปตท. พระโขนง (ป้องกันฟ้าผ่า Primer)'),

-- NC สำหรับ SST00888
('SST00888', 'SNNC-ZA-01-001', 'ห้องเซิร์ฟเวอร์ ธ.ไทยพาณิชย์ (ดับเพลิง ZAFEZONE)'),
('SST00888', 'SNNC-BL-01-001', 'รถโดยสาร ขสมก. (ระบบดับเพลิง BlazeCut)'),
('SST00888', 'SNNC-LE-01-001', 'ห้องครัวโรงแรมโอเรียนเต็ล (ดับเพลิง Lehavot)'),
('SST00888', 'SNNC-AG-01-001', 'โรงงานโตโยต้า (ระบบแจ้งเหตุ Aegis)')
ON CONFLICT (emp_id, job_number) DO UPDATE SET customer = EXCLUDED.customer;

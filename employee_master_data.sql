-- 1. Create a flattened table for easy CSV upload
CREATE TABLE IF NOT EXISTS public.employee_master_data (
    emp_id TEXT NOT NULL,
    emp_name TEXT NOT NULL,
    job_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (emp_id, job_number)
);

-- 2. Enable RLS and add Public READ access
ALTER TABLE public.employee_master_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.employee_master_data FOR SELECT USING (true);

-- 3. Insert initial dummy data (SST00...)
INSERT INTO public.employee_master_data (emp_id, emp_name, job_number, customer_name) VALUES
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTWP-2024-0025', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00721', 'ภาสวิชญ์ คัชมาตย์', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00721', 'ภาสวิชญ์ คัชมาตย์', 'JOB-WTWP-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

('SST00730', 'พิมทอง บริบูรณ์', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00730', 'พิมทอง บริบูรณ์', 'JOB-WTBC-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00710', 'พสธร เรืองพระยา', 'JOB-WTBC-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00710', 'พสธร เรืองพระยา', 'JOB-WTBC-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล', 'JOB-WTBC-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล', 'JOB-WTWP-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

-- WT สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-WTBR-2026-0001', 'Brentwood'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-WTDO-2026-0002', 'Dorot'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-WTEV-2026-0003', 'Evoqua'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-WTFL-2026-0004', 'Flowinn'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-WTHA-2026-0005', 'HAUS'),

-- MM สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-MMEC-2026-0001', 'ECON'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-MMIN-2026-0002', 'Innowarp'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-MMMB-2026-0003', 'MBJ'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-MMVA-2026-0004', 'Value Value'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-MMKO-2026-0005', 'Kowrap'),

-- EE สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EENO-2026-0001', 'Nohmi'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EENN-2026-0002', 'NN100'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EEME-2026-0003', 'MECH'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EESI-2026-0004', 'SIEX'),

-- EF สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EFMC-2026-0001', 'MCG'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EFPR-2026-0002', 'Prevectron'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-EFPI-2026-0003', 'Primer'),

-- NC สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-NCZA-2026-0001', 'ZAFEZONE'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-NCBL-2026-0002', 'BlazeCut'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-NCLE-2026-0003', 'Lehavot'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-NCAG-2026-0004', 'Aegis'),

-- WT สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTBR-2026-0001', 'Brentwood'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTDO-2026-0002', 'Dorot'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTEV-2026-0003', 'Evoqua'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTFL-2026-0004', 'Flowinn'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTHA-2026-0005', 'HAUS'),

-- MM สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-MMEC-2026-0001', 'ECON'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-MMIN-2026-0002', 'Innowarp'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-MMMB-2026-0003', 'MBJ'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-MMVA-2026-0004', 'Value Value'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-MMKO-2026-0005', 'Kowrap'),

-- EE สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EENO-2026-0001', 'Nohmi'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EENN-2026-0002', 'NN100'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EEME-2026-0003', 'MECH'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EESI-2026-0004', 'SIEX'),

-- EF สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EFMC-2026-0001', 'MCG'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EFPR-2026-0002', 'Prevectron'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-EFPI-2026-0003', 'Primer'),

-- NC สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-NCZA-2026-0001', 'ZAFEZONE'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-NCBL-2026-0002', 'BlazeCut'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-NCLE-2026-0003', 'Lehavot'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-NCAG-2026-0004', 'Aegis')
ON CONFLICT (emp_id, job_number) DO UPDATE SET 
    emp_name = EXCLUDED.emp_name,
    customer_name = EXCLUDED.customer_name;

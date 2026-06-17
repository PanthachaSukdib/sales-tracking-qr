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
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTADT-2024-0025', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00721', 'ภาสวิชญ์ คัชมาตย์', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00721', 'ภาสวิชญ์ คัชมาตย์', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

('SST00730', 'พิมทอง บริบูรณ์', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00730', 'พิมทอง บริบูรณ์', 'JOB-WTVP-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00710', 'พสธร เรืองพระยา', 'JOB-WTVP-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00710', 'พสธร เรืองพระยา', 'JOB-WTVP-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล', 'JOB-WTVP-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

-- WT สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNWT-BR-01-001', 'Brentwood'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNWT-DO-01-001', 'Dorot'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SN-EV-01-001', 'Evoqua'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNWT-FL-01-001', 'Flowinn'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNWT-HA-01-001', 'HAUS'),

-- MM สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNMM-EC-01-001', 'ECON'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNMM-IN-01-001', 'Innowarp'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNMM-MB-01-001', 'MBJ'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNMM-VA-01-001', 'Value Value'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNMM-KO-01-001', 'Kowrap'),

-- EE สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEE-NO-01-001', 'Nohmi'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEE-NN-01-001', 'NN100'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEE-ME-01-001', 'MECH'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEE-SI-01-001', 'SIEX'),

-- EF สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEF-MC-01-001', 'MCG'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEF-Pr-01-001', 'Prevectron'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNEF-Pri-01-001', 'Primer'),

-- NC สำหรับ SST00008
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNNC-ZA-01-001', 'ZAFEZONE'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNNC-BL-01-001', 'BlazeCut'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNNC-LE-01-001', 'Lehavot'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'SNNC-AG-01-001', 'Aegis'),

-- WT สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNWT-BR-01-001', 'Brentwood'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNWT-DO-01-001', 'Dorot'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SN-EV-01-001', 'Evoqua'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNWT-FL-01-001', 'Flowinn'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNWT-HA-01-001', 'HAUS'),

-- MM สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNMM-EC-01-001', 'ECON'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNMM-IN-01-001', 'Innowarp'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNMM-MB-01-001', 'MBJ'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNMM-VA-01-001', 'Value Value'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNMM-KO-01-001', 'Kowrap'),

-- EE สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEE-NO-01-001', 'Nohmi'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEE-NN-01-001', 'NN100'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEE-ME-01-001', 'MECH'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEE-SI-01-001', 'SIEX'),

-- EF สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEF-MC-01-001', 'MCG'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEF-Pr-01-001', 'Prevectron'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNEF-Pri-01-001', 'Primer'),

-- NC สำหรับ SST00888
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNNC-ZA-01-001', 'ZAFEZONE'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNNC-BL-01-001', 'BlazeCut'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNNC-LE-01-001', 'Lehavot'),
('SST00888', 'กิตติทัศน์ ส่วนสมพงษ์', 'SNNC-AG-01-001', 'Aegis')
ON CONFLICT (emp_id, job_number) DO UPDATE SET 
    emp_name = EXCLUDED.emp_name,
    customer_name = EXCLUDED.customer_name;

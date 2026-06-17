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
('SST00008', 'ช่างเทคนิค ทดสอบระบบ')
ON CONFLICT (emp_id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Insert Data (employee_jobs)
INSERT INTO public.employee_jobs (emp_id, job_number, customer) VALUES
('SST00888', 'JOB-WTADT-2024-0025', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),
('SST00888', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00721', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00721', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

('SST00730', 'JOB-WTVP-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00730', 'JOB-WTVP-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00710', 'JOB-WTVP-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00710', 'JOB-WTVP-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00259', 'JOB-WTVP-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00259', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

-- WT สำหรับ SST00008
('SST00008', 'SNWT-BR-01-001', 'Brentwood'),
('SST00008', 'SNWT-DO-01-001', 'Dorot'),
('SST00008', 'SN-EV-01-001', 'Evoqua'),
('SST00008', 'SNWT-FL-01-001', 'Flowinn'),
('SST00008', 'SNWT-HA-01-001', 'HAUS'),

-- MM สำหรับ SST00008
('SST00008', 'SNMM-EC-01-001', 'ECON'),
('SST00008', 'SNMM-IN-01-001', 'Innowarp'),
('SST00008', 'SNMM-MB-01-001', 'MBJ'),
('SST00008', 'SNMM-VA-01-001', 'Value Value'),
('SST00008', 'SNMM-KO-01-001', 'Kowrap'),

-- EE สำหรับ SST00008
('SST00008', 'SNEE-NO-01-001', 'Nohmi'),
('SST00008', 'SNEE-NN-01-001', 'NN100'),
('SST00008', 'SNEE-ME-01-001', 'MECH'),
('SST00008', 'SNEE-SI-01-001', 'SIEX'),

-- EF สำหรับ SST00008
('SST00008', 'SNEF-MC-01-001', 'MCG'),
('SST00008', 'SNEF-Pr-01-001', 'Prevectron'),
('SST00008', 'SNEF-Pri-01-001', 'Primer'),

-- NC สำหรับ SST00008
('SST00008', 'SNNC-ZA-01-001', 'ZAFEZONE'),
('SST00008', 'SNNC-BL-01-001', 'BlazeCut'),
('SST00008', 'SNNC-LE-01-001', 'Lehavot'),
('SST00008', 'SNNC-AG-01-001', 'Aegis'),

-- WT สำหรับ SST00888
('SST00888', 'SNWT-BR-01-001', 'Brentwood'),
('SST00888', 'SNWT-DO-01-001', 'Dorot'),
('SST00888', 'SN-EV-01-001', 'Evoqua'),
('SST00888', 'SNWT-FL-01-001', 'Flowinn'),
('SST00888', 'SNWT-HA-01-001', 'HAUS'),

-- MM สำหรับ SST00888
('SST00888', 'SNMM-EC-01-001', 'ECON'),
('SST00888', 'SNMM-IN-01-001', 'Innowarp'),
('SST00888', 'SNMM-MB-01-001', 'MBJ'),
('SST00888', 'SNMM-VA-01-001', 'Value Value'),
('SST00888', 'SNMM-KO-01-001', 'Kowrap'),

-- EE สำหรับ SST00888
('SST00888', 'SNEE-NO-01-001', 'Nohmi'),
('SST00888', 'SNEE-NN-01-001', 'NN100'),
('SST00888', 'SNEE-ME-01-001', 'MECH'),
('SST00888', 'SNEE-SI-01-001', 'SIEX'),

-- EF สำหรับ SST00888
('SST00888', 'SNEF-MC-01-001', 'MCG'),
('SST00888', 'SNEF-Pr-01-001', 'Prevectron'),
('SST00888', 'SNEF-Pri-01-001', 'Primer'),

-- NC สำหรับ SST00888
('SST00888', 'SNNC-ZA-01-001', 'ZAFEZONE'),
('SST00888', 'SNNC-BL-01-001', 'BlazeCut'),
('SST00888', 'SNNC-LE-01-001', 'Lehavot'),
('SST00888', 'SNNC-AG-01-001', 'Aegis')
ON CONFLICT (emp_id, job_number) DO NOTHING;

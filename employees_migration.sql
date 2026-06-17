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
('SST00888', 'JOB-WTWP-2024-0025', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),
('SST00888', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00721', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00721', 'JOB-WTWP-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

('SST00730', 'JOB-WTBC-2024-0003', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00730', 'JOB-WTBC-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00710', 'JOB-WTBC-2024-0004', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00710', 'JOB-WTBC-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),

('SST00259', 'JOB-WTBC-2024-0006', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา'),
('SST00259', 'JOB-WTWP-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด'),

-- WT สำหรับ SST00008
('SST00008', 'JOB-WTBR-2026-0001', 'Brentwood'),
('SST00008', 'JOB-WTDO-2026-0002', 'Dorot'),
('SST00008', 'JOB-WTEV-2026-0003', 'Evoqua'),
('SST00008', 'JOB-WTFL-2026-0004', 'Flowinn'),
('SST00008', 'JOB-WTHA-2026-0005', 'HAUS'),

-- MM สำหรับ SST00008
('SST00008', 'JOB-MMEC-2026-0001', 'ECON'),
('SST00008', 'JOB-MMIN-2026-0002', 'Innowarp'),
('SST00008', 'JOB-MMMB-2026-0003', 'MBJ'),
('SST00008', 'JOB-MMVA-2026-0004', 'Value Value'),
('SST00008', 'JOB-MMKO-2026-0005', 'Kowrap'),

-- EE สำหรับ SST00008
('SST00008', 'JOB-EENO-2026-0001', 'Nohmi'),
('SST00008', 'JOB-EENN-2026-0002', 'NN100'),
('SST00008', 'JOB-EEME-2026-0003', 'MECH'),
('SST00008', 'JOB-EESI-2026-0004', 'SIEX'),

-- EF สำหรับ SST00008
('SST00008', 'JOB-EFMC-2026-0001', 'MCG'),
('SST00008', 'JOB-EFPR-2026-0002', 'Prevectron'),
('SST00008', 'JOB-EFPI-2026-0003', 'Primer'),

-- NC สำหรับ SST00008
('SST00008', 'JOB-NCZA-2026-0001', 'ZAFEZONE'),
('SST00008', 'JOB-NCBL-2026-0002', 'BlazeCut'),
('SST00008', 'JOB-NCLE-2026-0003', 'Lehavot'),
('SST00008', 'ช่างเทคนิค ทดสอบระบบ', 'JOB-NCAG-2026-0004', 'Aegis'),

-- WT สำหรับ SST00888
('SST00888', 'JOB-WTBR-2026-0001', 'Brentwood'),
('SST00888', 'JOB-WTDO-2026-0002', 'Dorot'),
('SST00888', 'JOB-WTEV-2026-0003', 'Evoqua'),
('SST00888', 'JOB-WTFL-2026-0004', 'Flowinn'),
('SST00888', 'JOB-WTHA-2026-0005', 'HAUS'),

-- MM สำหรับ SST00888
('SST00888', 'JOB-MMEC-2026-0001', 'ECON'),
('SST00888', 'JOB-MMIN-2026-0002', 'Innowarp'),
('SST00888', 'JOB-MMMB-2026-0003', 'MBJ'),
('SST00888', 'JOB-MMVA-2026-0004', 'Value Value'),
('SST00888', 'JOB-MMKO-2026-0005', 'Kowrap'),

-- EE สำหรับ SST00888
('SST00888', 'JOB-EENO-2026-0001', 'Nohmi'),
('SST00888', 'JOB-EENN-2026-0002', 'NN100'),
('SST00888', 'JOB-EEME-2026-0003', 'MECH'),
('SST00888', 'JOB-EESI-2026-0004', 'SIEX'),

-- EF สำหรับ SST00888
('SST00888', 'JOB-EFMC-2026-0001', 'MCG'),
('SST00888', 'JOB-EFPR-2026-0002', 'Prevectron'),
('SST00888', 'JOB-EFPI-2026-0003', 'Primer'),

-- NC สำหรับ SST00888
('SST00888', 'JOB-NCZA-2026-0001', 'ZAFEZONE'),
('SST00888', 'JOB-NCBL-2026-0002', 'BlazeCut'),
('SST00888', 'JOB-NCLE-2026-0003', 'Lehavot'),
('SST00888', 'JOB-NCAG-2026-0004', 'Aegis')
ON CONFLICT (emp_id, job_number) DO UPDATE SET customer = EXCLUDED.customer;

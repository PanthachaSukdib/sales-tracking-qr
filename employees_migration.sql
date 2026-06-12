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
('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล')
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
('SST00259', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด')
ON CONFLICT (emp_id, job_number) DO NOTHING;

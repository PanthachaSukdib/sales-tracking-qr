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
('SST00259', 'นิธิวัฒน์ หวังวัฒนากูล', 'JOB-WTADT-2024-0014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด')
ON CONFLICT (emp_id, job_number) DO UPDATE SET 
    emp_name = EXCLUDED.emp_name,
    customer_name = EXCLUDED.customer_name;

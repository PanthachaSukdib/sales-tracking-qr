-- Run this in Supabase SQL Editor
INSERT INTO public.customers (customer_code, name, address, customer_type, phone) VALUES
('CUST-001', 'ไอคอนสยาม (Icon Siam)', '', 'General', ''),
('CUST-002', 'อาคารตลาดหลักทรัพย์แห่งประเทศไทย', '', 'General', ''),
('CUST-003', 'การประปานครหลวง สาขาบางเขน', '', 'General', ''),
('CUST-004', 'โครงการผลิตน้ำบางปะกง การประปาส่วนภูมิภาค', '', 'General', ''),
('CUST-005', 'ตลาดหลักทรัพย์แห่งประเทศไทย (ระบบดับเพลิงห้อง Data Center)', '', 'General', ''),
('CUST-006', 'โรงพยาบาลสมเด็จพระสังฆราชเจ้า กรมหลวงชินวราลงกรณ์', '', 'General', ''),
('CUST-007', 'เซ็นทรัล เอ็มบาสซี่ (Central Embassy)', '', 'General', ''),
('CUST-008', 'SST', '', 'General', ''),
('CUST-009', 'โรงแรมเซ็นทรัลเวิลด์', '', 'General', ''),
('CUST-010', 'โชว์รูมรถคลาสสิก (ร่วมกับ Nohmi Bosai)', '', 'General', ''),
('CUST-011', 'โรงงานผลิตอาหาร Minor Food (ระบบดับเพลิงครัวอุตสาหกรรม)', '', 'General', ''),
('CUST-012', 'นิคมอุตสาหกรรมอมตะนคร ชลบุรี', '', 'General', ''),
('CUST-013', 'ห้างหุ้นส่วนจำกัด บุญชอบการประปา', '', 'General', ''),
('CUST-014', 'บริษัท เวลท์ แอนด์ โปรส์ จำกัด', '', 'General', ''),
('CUST-015', 'Dttt', '', 'General', '')
ON CONFLICT DO NOTHING;
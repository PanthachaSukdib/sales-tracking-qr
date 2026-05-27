import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import Header from './Header';
// import { db } from '../firebase.js';

export default function QRGenerationForm({ onGenerate }) {
  const [formData, setFormData] = useState({
    empId: '',
    empName: '',
    jobNumber: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onGenerate) onGenerate(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <div className="max-w-md w-full mx-auto min-h-screen bg-white relative px-4 py-8 flex flex-col">
        
        <Header />

        {/* The Form Box */}
        <div className="border border-gray-200 rounded-[20px] p-5 shadow-sm bg-white">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {/* Field 1: Employee ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                รหัสพนักงาน<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="empId"
                value={formData.empId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Field 2: Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ชื่อ - นามสกุล<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="empName"
                value={formData.empName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Field 3: JOB-Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                JOB-Number<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="jobNumber"
                  value={formData.jobNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 appearance-none"
                >
                  <option value="" disabled></option>
                  <option value="JOB-2024-001">JOB-2024-001</option>
                  <option value="JOB-2024-002">JOB-2024-002</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* The Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#75B787] hover:bg-[#5E956C] text-white font-medium py-3 rounded-xl mt-2 transition-all shadow-sm"
            >
              สร้าง QR Code
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
}

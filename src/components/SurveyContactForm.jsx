import React, { useState } from 'react';
import Header from './Header';

export default function SurveyContactForm({ qrData, onSubmit }) {
  // Mock data if qrData is not provided
  const data = qrData || {
    empName: 'สมชาย ใจดี',
    projectName: 'ติดตั้งระบบ 2024',
    customerName: 'บริษัท เอบีซี จำกัด'
  };

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    consent: '' // 'yes' or 'no'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.consent === '') {
      alert('กรุณาเลือกการยินยอมในข้อมูลส่วนบุคคล');
      return;
    }
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <div className="max-w-md w-full mx-auto min-h-screen bg-white relative px-4 py-8 flex flex-col pb-safe">
        
        <Header />

        {/* The Main Card Box */}
        <div className="border border-gray-200 rounded-[20px] p-5 shadow-sm bg-white mb-6">
          
          {/* Top Info Box */}
          <div className="border border-gray-200 rounded-xl p-4 mb-6 flex flex-col gap-2 text-xs sm:text-sm text-gray-700">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-medium">พนักงานที่ให้บริการ:</span>
              <span>{data.empName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-medium">โครงการ:</span>
              <span>{data.projectName}</span>
            </div>
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="font-medium">ลูกค้า:</span>
              <span>{data.customerName}</span>
            </div>
          </div>

          <h2 className="text-[13px] sm:text-sm font-bold text-gray-800 mb-5 leading-relaxed">
            เพื่อให้การบริการที่ดียิ่งขึ้น ขอความร่วมมือท่านระบุข้อมูลติดต่อสำหรับการติดต่อกลับ
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Field 1: Name */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                ชื่อ - นามสกุล
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Field 2: Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                เบอร์โทรศัพท์
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Field 3: Email */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>

            {/* Consent Section */}
            <div className="mt-4 border-t border-gray-100 pt-5">
              <h3 className="text-[13px] sm:text-sm font-bold text-gray-800 mb-1">
                ขอการยินยอมในข้อมูลส่วนบุคคล
              </h3>
              <p className="text-[11px] sm:text-xs text-gray-600 mb-4">
                เพื่อการติดต่อและการบริการของทางบริษัท <span className="text-red-500 cursor-pointer hover:underline">(อ่านเพิ่มเติม)</span>
              </p>

              <div className="mb-4">
                <p className="text-xs sm:text-sm text-gray-700 mb-3">
                  1. ท่านรับทราบและให้ความยินยอมในข้อมูลส่วนบุคคล<span className="text-red-500">*</span>
                </p>
                
                <div className="flex flex-col gap-3 pl-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${formData.consent === 'yes' ? 'border-gray-800' : 'border-gray-400 group-hover:border-gray-600'}`}>
                      {formData.consent === 'yes' && <div className="w-2 h-2 rounded-full bg-gray-800"></div>}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">ยินยอม</span>
                    <input 
                      type="radio" 
                      name="consent" 
                      value="yes"
                      className="hidden" 
                      checked={formData.consent === 'yes'} 
                      onChange={handleChange} 
                    />
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${formData.consent === 'no' ? 'border-gray-800' : 'border-gray-400 group-hover:border-gray-600'}`}>
                      {formData.consent === 'no' && <div className="w-2 h-2 rounded-full bg-gray-800"></div>}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">ไม่ยินยอม</span>
                    <input 
                      type="radio" 
                      name="consent" 
                      value="no"
                      className="hidden" 
                      checked={formData.consent === 'no'} 
                      onChange={handleChange} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-2">
              <button
                type="submit"
                className="w-1/2 min-w-[120px] bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[13px] font-medium py-2.5 rounded-lg transition-all"
              >
                ส่งข้อมูล
              </button>
            </div>
            
          </form>
        </div>

      </div>
    </div>
  );
}

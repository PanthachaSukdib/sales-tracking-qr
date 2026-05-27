import React, { useState } from 'react';
import { Star, Square, CheckSquare } from 'lucide-react';
import Header from './Header';

export default function SurveyRating({ qrData, onNext }) {
  // Mock data if qrData is not provided
  const data = qrData || {
    empName: 'สมชาย ใจดี',
    projectName: 'ติดตั้งระบบ 2024',
    customerName: 'บริษัท เอบีซี จำกัด'
  };

  const [ratings, setRatings] = useState({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0
  });

  const [improvements, setImprovements] = useState([]);
  const [otherText, setOtherText] = useState('');

  const improvementOptions = [
    'ไม่มีสิ่งที่ควรปรับปรุง',
    'คุณภาพราคา',
    'ราคาสินค้า',
    'การประชาสัมพันธ์',
    'ความรวดเร็วในการประสานงานขาย'
  ];

  const handleStarClick = (question, star) => {
    setRatings(prev => ({ ...prev, [question]: star }));
  };

  const toggleImprovement = (option) => {
    setImprovements(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const toggleOther = () => {
    setImprovements(prev => 
      prev.includes('other') 
        ? prev.filter(item => item !== 'other')
        : [...prev, 'other']
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) {
      onNext({ ratings, improvements, otherText });
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

          <h2 className="text-sm sm:text-base font-bold text-gray-800 mb-6">
            ความพึงพอใจต่อด้านการขายและบริการ
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* Question 1 */}
            <div>
              <p className="text-[13px] sm:text-sm text-gray-700 mb-2">1. สินค้ามีความคุ้มค่าเมื่อเทียบกับราคา</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => handleStarClick('q1', star)} className="p-1 focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= ratings.q1 ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2 */}
            <div>
              <p className="text-[13px] sm:text-sm text-gray-700 mb-2">2. ข้อมูลในการนำเสนอขายถูกต้อง ครบถ้วน</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => handleStarClick('q2', star)} className="p-1 focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= ratings.q2 ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3 */}
            <div>
              <p className="text-[13px] sm:text-sm text-gray-700 mb-2">3. การให้บริการติดตั้ง บำรุงรักษา มีคุณภาพ</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => handleStarClick('q3', star)} className="p-1 focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= ratings.q3 ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4 */}
            <div>
              <p className="text-[13px] sm:text-sm text-gray-700 mb-2">4. กระบวนการสั่งซื้อมีความสะดวก ไม่ซับซ้อน</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => handleStarClick('q4', star)} className="p-1 focus:outline-none">
                    <Star className={`w-8 h-8 ${star <= ratings.q4 ? 'fill-gray-900 text-gray-900' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 5 (Checkboxes) */}
            <div>
              <p className="text-[13px] sm:text-sm text-gray-700 mb-3">5. สิ่งที่ควรปรับปรุงทันที (ตอบได้มากกว่า 1 ข้อ))</p>
              <div className="flex flex-col gap-3 pl-2">
                {improvementOptions.map(option => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 bg-gray-300 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-gray-400">
                      {improvements.includes(option) && <CheckSquare className="w-4 h-4 text-gray-800 bg-white border border-gray-300 rounded-sm" />}
                    </div>
                    <span className="text-xs sm:text-sm text-gray-700">{option}</span>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={improvements.includes(option)} 
                      onChange={() => toggleImprovement(option)} 
                    />
                  </label>
                ))}
                
                {/* Other Option */}
                <label className="flex items-center gap-3 cursor-pointer group mt-1">
                  <div className="w-4 h-4 bg-gray-300 rounded-sm flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-gray-400">
                    {improvements.includes('other') && <CheckSquare className="w-4 h-4 text-gray-800 bg-white border border-gray-300 rounded-sm" />}
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">อื่น ๆ (โปรดระบุ</span>
                    <input 
                      type="text" 
                      value={otherText}
                      onChange={(e) => {
                        setOtherText(e.target.value);
                        if (!improvements.includes('other') && e.target.value) toggleOther();
                      }}
                      className="flex-1 border-b border-dotted border-gray-400 bg-transparent text-sm focus:outline-none focus:border-gray-800 pb-0.5 min-w-[50px]" 
                      onClick={() => !improvements.includes('other') && toggleOther()}
                    />
                    <span className="text-xs sm:text-sm text-gray-700">)</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={improvements.includes('other')} 
                    onChange={toggleOther} 
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#75B787] hover:bg-[#5E956C] text-white font-medium py-3 rounded-xl mt-4 transition-all"
            >
              ถัดไป
            </button>
            
          </form>
        </div>

      </div>
    </div>
  );
}

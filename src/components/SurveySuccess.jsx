import React from 'react';
import { ArrowRight, Gift } from 'lucide-react';
// import { db } from '../firebase.js';

export default function SurveySuccess({ onContinue, onSkip }) {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center font-sans text-gray-800">
      <div className="max-w-md w-full mx-auto min-h-screen bg-white shadow-xl relative flex flex-col p-6 pb-safe">
        
        {/* Top Progress - Step Tracker */}
        <div className="mb-10 mt-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 transform -translate-y-1/2 h-0.5 bg-gray-200 z-0"></div>
            <div className="absolute left-6 right-1/2 top-1/2 transform -translate-y-1/2 h-0.5 bg-green-500 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                ✓
              </div>
              <span className="text-[10px] font-bold text-green-600 mt-2">Step 1</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-4 ring-white">
                ✓
              </div>
              <span className="text-[10px] font-bold text-green-600 mt-2">Step 2</span>
            </div>
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-white border-2 border-green-500 text-green-500 flex items-center justify-center font-bold text-xs ring-4 ring-white">
                3
              </div>
              <span className="text-[10px] font-bold text-gray-500 mt-2">Step 3</span>
            </div>
          </div>
        </div>

        {/* Main Graphic & Title */}
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 relative">
            <span className="text-5xl absolute z-10">🎉</span>
            <div className="absolute inset-0 bg-green-400 opacity-20 rounded-full animate-ping"></div>
          </div>
          <h2 className="text-2xl font-black text-green-600 tracking-tight mb-2">ให้คะแนนเรียบร้อยแล้ว!</h2>
          <p className="text-gray-500 text-sm">
            เหลืออีกเพียง 1 ขั้นตอนสุดท้าย<br/>เพื่อให้เราบริการคุณได้ดียิ่งขึ้น
          </p>
        </div>

        <div className="mt-8">
          {/* Call to Action Box */}
          <div className="bg-[#E8F5EE] border border-[#A6D7BD] rounded-xl p-4 mb-6 relative overflow-hidden">
            <Gift className="absolute -right-2 -bottom-2 w-20 h-20 text-[#A6D7BD] opacity-30 transform rotate-12" />
            <div className="relative z-10">
              <h3 className="font-bold text-green-800 text-base mb-1">กรอกข้อมูลเพิ่มเติม</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                ขอข้อมูลเล็กน้อยเพื่อการติดต่อกลับและรับสิทธิพิเศษ ใช้เวลาไม่เกิน 2 นาที...
              </p>
            </div>
          </div>

          {/* Final Actions */}
          <div className="flex flex-col gap-3">
            <button 
              onClick={onContinue}
              className="w-full flex justify-center items-center py-4 rounded-lg text-base font-bold text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all shadow-md"
            >
              ดำเนินการต่อ
            </button>
            <button 
              onClick={onSkip}
              className="w-full flex justify-center items-center py-3 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
            >
              ข้ามขั้นตอนนี้ <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

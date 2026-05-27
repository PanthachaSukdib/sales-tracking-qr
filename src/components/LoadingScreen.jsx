import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <div className="max-w-md w-full mx-auto min-h-screen bg-white relative px-4 flex flex-col justify-center items-center">
        
        <div className="border border-gray-200 rounded-[20px] p-10 shadow-sm bg-white w-full max-w-[280px] flex flex-col items-center justify-center text-center">
          
          {/* Spinner */}
          <div className="relative w-16 h-16 mb-6">
            {/* Outer ring (light green) */}
            <div className="absolute inset-0 rounded-full border-4 border-green-100"></div>
            {/* Spinning segment (darker green) */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#75B787] animate-spin"></div>
          </div>

          <h2 className="text-sm font-medium text-gray-800 mb-2">
            กำลังเปิดแบบฟอร์ม...
          </h2>
          <p className="text-[10px] text-gray-500">
            กรุณารอสักครู่
          </p>
          
        </div>

      </div>
    </div>
  );
}

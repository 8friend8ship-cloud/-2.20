
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} 인테리어 전문가 AI. All rights reserved.</p>
        <p className="text-sm mt-1">본 견적과 공정표는 AI에 의해 생성된 예시이며, 실제와 차이가 있을 수 있습니다.</p>
      </div>
    </footer>
  );
};

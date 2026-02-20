
import React from 'react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-sm text-gray-500 animate-pulse text-center">
        복잡한 수식과 도면을 AI(Flash 모델)가 고속으로 연산 중입니다.<br/>
        약 5~10초 정도 소요됩니다.
      </p>
    </div>
  );
};

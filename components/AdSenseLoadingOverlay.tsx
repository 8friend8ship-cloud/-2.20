
import React, { useEffect, useState } from 'react';
import { AdBanner } from './AdBanner';

interface AdSenseLoadingOverlayProps {
  message: string;
  subMessage: string;
}

export const AdSenseLoadingOverlay: React.FC<AdSenseLoadingOverlayProps> = ({ message, subMessage }) => {
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // 1. Visibility Change Logic (Tab Switch Prevention)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
      }
    };

    // 2. Before Unload Logic (Close/Back Prevention)
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return '';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 3. Progress Bar Animation
    const interval = setInterval(() => {
      if (document.hidden) return; // Do not increment if hidden (Logic check)

      setProgress((oldProgress) => {
        if (oldProgress >= 98) return 98; // Wait for completion (98% max until real finish)
        // 랜덤하게 증가하되, 멈춤 상태가 아니면 진행
        const diff = Math.random() * 3;
        return Math.min(oldProgress + diff, 98);
      });
    }, 400);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl text-center space-y-6">
        
        {/* 1. 진행 상태 텍스트 */}
        <div className="space-y-2 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-gray-900">{message}</h2>
          <p className={`font-medium transition-colors duration-300 ${isPaused ? 'text-red-600 animate-pulse font-bold' : 'text-indigo-600'}`}>
            {isPaused ? "⚠️ 광고 시청을 완료해야 견적이 생성됩니다! 페이지로 돌아오세요." : subMessage}
          </p>
        </div>

        {/* 2. 시각적 진행 바 (Progress Bar) */}
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner relative">
          <div 
            className={`h-4 rounded-full transition-all duration-500 ease-out flex items-center justify-center ${isPaused ? 'bg-red-500' : 'bg-indigo-600'}`}
            style={{ width: `${progress}%` }}
          >
            {!isPaused && <div className="w-full h-full bg-indigo-500 opacity-30 animate-[pulse_1s_ease-in-out_infinite]"></div>}
          </div>
        </div>
        <div className="flex justify-between items-center text-xs">
             <p className={`${isPaused ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                {isPaused ? "작업 일시 중지됨 (탭 이탈 감지)" : "AI 연산 중..."}
             </p>
             <p className="text-gray-400">{Math.round(progress)}% 완료</p>
        </div>

        {/* 3. 구글 애드센스 광고 영역 (Google AdSense Container) */}
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl shadow-lg flex flex-col items-center justify-center overflow-hidden border border-gray-300">
           {/* 실제 광고 컴포넌트 적용 */}
           <AdBanner 
              clientId="ca-pub-2826263278655860" 
              slotId="6505435536"
              className="w-full h-full"
           />
           
           {/* 광고 로딩 전 또는 차단 시 보여줄 백그라운드 텍스트 (광고 뒤에 깔림) */}
           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 -z-10">
              <p>광고 로딩 중...</p>
           </div>
        </div>
        <p className="text-xs text-gray-400 text-center">
            AI 견적 서비스는 광고 수익으로 운영됩니다. 잠시만 기다려주시면 상세 견적이 표시됩니다.
        </p>

        {/* 4. 이탈 방지 경고 문구 */}
        <div className={`border rounded-lg p-4 mt-4 transition-colors duration-300 ${isPaused ? 'bg-red-100 border-red-400' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-center justify-center space-x-2">
            <svg className={`w-6 h-6 ${isPaused ? 'text-red-600' : 'text-blue-600 animate-bounce'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className={`font-bold text-lg ${isPaused ? 'text-red-700' : 'text-blue-700'}`}>
                {isPaused ? "광고 시청이 중단되었습니다!" : "화면을 유지해주세요"}
            </span>
          </div>
          <p className={`text-sm mt-1 ${isPaused ? 'text-red-600' : 'text-blue-600'}`}>
             {isPaused ? "정확한 견적 산출을 위해 페이지를 유지해주세요." : "이 페이지를 벗어나면 AI 분석이 중단됩니다."}
          </p>
        </div>

      </div>
    </div>
  );
};

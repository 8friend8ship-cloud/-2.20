
import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';
import { saveApiKey } from '../utils/storageUtils';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDemo?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSuccess, onDemo }) => {
  const [apiKey, setApiKey] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!apiKey.trim()) {
      setError("API 키를 입력해주세요.");
      return;
    }

    setIsChecking(true);
    setError(null);

    const isValid = await validateApiKey(apiKey);

    if (isValid) {
      saveApiKey(apiKey);
      onSuccess();
    } else {
      setError("API 키 연결 테스트에 실패했습니다. 키를 확인해주세요. (결제 계정이 연결된 유효한 키여야 합니다.)");
      setIsChecking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-xl bg-white">
        <div className="mt-3 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4">
            <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.636 11.536 9.636 10.536 8.636a6 6 0 010-8.486L12 3m0 0l-3 3m3-3l3 3M9 14l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V9a3 3 0 013-3h2" />
            </svg>
          </div>
          <h3 className="text-xl leading-6 font-bold text-gray-900 mb-2">Google API 키 설정</h3>
          <p className="text-sm text-gray-500 mb-6">
            고품질 'Pro' 모델을 사용하기 위해서는 Google AI Studio의 유효한 API 키가 필요합니다.
            <br />
            입력하신 키는 서버로 전송되지 않으며, 암호화되어 브라우저에 안전하게 저장됩니다.
          </p>

          <div className="text-left mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            {error && <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>}
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              취소
            </button>
            <button
              onClick={handleTestAndSave}
              disabled={isChecking}
              className="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
            >
              {isChecking ? '연결 확인 중...' : '연결 테스트 및 저장'}
            </button>
          </div>
          
           <div className="mt-4 text-xs text-gray-400 border-t pt-3">
               <div className="flex justify-between items-center">
                   <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                       Google AI Studio에서 키 발급받기
                   </a>
                   {onDemo && (
                       <button onClick={onDemo} className="text-indigo-600 font-semibold hover:text-indigo-800 text-xs">
                           키 없이 데모 모드로 체험하기 &rarr;
                       </button>
                   )}
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

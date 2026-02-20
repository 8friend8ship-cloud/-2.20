
import React, { useEffect, useRef } from 'react';

interface AdBannerProps {
  clientId: string;
  slotId: string;
  format?: string;
  responsive?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  clientId, 
  slotId, 
  format = 'auto', 
  responsive = 'true',
  className = '',
  style 
}) => {
  const adInit = useRef(false);

  useEffect(() => {
    // 광고 중복 로드 방지
    if (adInit.current) return;

    try {
      // @ts-ignore
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        // @ts-ignore
        window.adsbygoogle.push({});
        adInit.current = true;
      }
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

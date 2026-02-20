
import { UnitPrice } from '../types';

// 존슨 지침 & 홈디자인 레퍼런스 반영 (실견적 + 15~20% 마진 적용)
export const PRICE_TABLE: UnitPrice[] = [
  // =========================================================
  // 1. 철거 공사 (레퍼런스: 마루/확장부/기본 분리)
  // =========================================================
  { category: "철거/가설", item: "기본 철거 (싱크대/신발장/도어/몰딩)", unit: "1식", priceLow: 1800000, priceStandard: 2200000, priceHigh: 2800000, description: "천장몰딩, 조명, 일반가구 포함" },
  { category: "철거/가설", item: "바닥재(마루) 철거 및 샌딩", unit: "평", priceLow: 40000, priceStandard: 50000, priceHigh: 60000, description: "기계철거 및 샌딩 작업 필수" },
  { category: "철거/가설", item: "욕실 전체 철거 (방수층 포함)", unit: "실", priceLow: 600000, priceStandard: 750000, priceHigh: 900000, description: "벽/바닥 타일 및 위생도기 전체" },
  { category: "철거/가설", item: "확장부 조적벽/날개벽 철거", unit: "소", priceLow: 350000, priceStandard: 500000, priceHigh: 700000, description: "미니포크레인/파트너컷팅/폐기물" },
  { category: "철거/가설", item: "폐기물 처리 및 양중비", unit: "식", priceLow: 1000000, priceStandard: 1500000, priceHigh: 2000000, description: "사다리차/엘리베이터 보양 포함" },

  // =========================================================
  // 2. 샷시(창호) 공사 (레퍼런스: KCC/LX 구체화)
  // =========================================================
  { category: "창호공사", item: "KCC 뉴프라임 발코니창 (26mm)", unit: "평형식", priceLow: 9000000, priceStandard: 11000000, priceHigh: 14000000, description: "140단창/242이중창, 로이유리, 자동핸들" },
  { category: "창호공사", item: "내부용 이중창 (와이드빌/공틀)", unit: "틀", priceLow: 800000, priceStandard: 1200000, priceHigh: 1500000, description: "230D/225공틀, 불투명 미스트 유리" },
  { category: "창호공사", item: "터닝도어 (LG하우시스/KCC)", unit: "틀", priceLow: 750000, priceStandard: 900000, priceHigh: 1100000, description: "확장부 단열도어, 아쿠아/미스트유리" },
  { category: "창호공사", item: "폴딩도어 (5~6짝)", unit: "식", priceLow: 1800000, priceStandard: 2400000, priceHigh: 3000000, description: "거실 분합용, 22mm 페어글라스" },

  // =========================================================
  // 3. 목공사 (레퍼런스: 단열/9mm문선/천장평탄화)
  // =========================================================
  { category: "목공사", item: "전체 천장 평탄화 (석고보드)", unit: "식", priceLow: 1500000, priceStandard: 2000000, priceHigh: 3000000, description: "무몰딩/마이너스몰딩 위한 기초작업" },
  { category: "목공사", item: "확장부 단열공사 (열반사+아이소핑크)", unit: "면", priceLow: 600000, priceStandard: 800000, priceHigh: 1000000, description: "결로방지(30T~50T), 우레탄폼 충진" },
  { category: "목공사", item: "9mm 문선 리폼 / ABS도어 교체", unit: "개소", priceLow: 400000, priceStandard: 550000, priceHigh: 700000, description: "영림/예림 도어, 문틀 목공작업 포함" },
  { category: "목공사", item: "3연동 슬림 중문 (초슬림)", unit: "식", priceLow: 900000, priceStandard: 1200000, priceHigh: 1600000, description: "강화유리/모루유리 선택, 파티션 별도" },

  // =========================================================
  // 4. 설비/욕실 (레퍼런스: 젠다이/방수/아메리칸스탠다드)
  // =========================================================
  { category: "설비공사", item: "욕실/베란다 도막 방수 (2차)", unit: "실", priceLow: 400000, priceStandard: 500000, priceHigh: 700000, description: "아쿠아디펜스/고뫄스 등 2회 이상" },
  { category: "설비공사", item: "확장부 난방 연장 (엑셀파이프)", unit: "개소", priceLow: 500000, priceStandard: 700000, priceHigh: 1000000, description: "미장 포함" },
  { category: "욕실공사", item: "공용욕실 전체 리모델링 (600각)", unit: "실", priceLow: 3500000, priceStandard: 4200000, priceHigh: 5500000, description: "졸리컷, 젠다이, 힘펠환풍기, 무광수전" },
  { category: "욕실공사", item: "안방욕실 전체 리모델링 (300*600)", unit: "실", priceLow: 2800000, priceStandard: 3200000, priceHigh: 3800000, description: "기본형, 파티션/욕조 선택" },

  // =========================================================
  // 5. 전기/조명 (레퍼런스: 르그랑/다운라이트/간접등)
  // =========================================================
  { category: "전기공사", item: "전체 스위치/콘센트 (르그랑/나노)", unit: "식", priceLow: 500000, priceStandard: 700000, priceHigh: 1000000, description: "아펠라/아트2 시리즈, 배선기구 일체" },
  { category: "전기공사", item: "전체 매립등(다운라이트) 시공", unit: "식", priceLow: 800000, priceStandard: 1200000, priceHigh: 1800000, description: "3인치/4인치 타공 및 배선작업 포함" },
  { category: "전기공사", item: "간접조명 (T5) 및 배선증설", unit: "식", priceLow: 400000, priceStandard: 600000, priceHigh: 900000, description: "커튼박스, 신발장 하부, 욕실장 하부" },
  { category: "전기공사", item: "인덕션 단독 배선 공사", unit: "식", priceLow: 250000, priceStandard: 350000, priceHigh: 500000, description: "전용 차단기 설치" },

  // =========================================================
  // 6. 마감재 (도배/바닥/필름/탄성)
  // =========================================================
  { category: "도배공사", item: "전체 실크 도배 (LX/개나리)", unit: "평", priceLow: 95000, priceStandard: 110000, priceHigh: 130000, description: "퍼티작업(네바리) 및 부직포 초배 포함" },
  { category: "바닥공사", item: "강마루 시공 (구정/동화)", unit: "평", priceLow: 130000, priceStandard: 150000, priceHigh: 180000, description: "텍스쳐/광폭 기준, 황토본드 사용" },
  { category: "도장공사", item: "탄성코트 (세라믹)", unit: "개소", priceLow: 300000, priceStandard: 400000, priceHigh: 500000, description: "베란다/다용도실 곰팡이 방지" },
  { category: "필름공사", item: "인테리어 필름 (문틀/샷시/현관)", unit: "식", priceLow: 1500000, priceStandard: 2000000, priceHigh: 3000000, description: "현대/LG, 프라이머 작업 필수" },

  // =========================================================
  // 7. 가구 공사 (레퍼런스: PET/사각싱크볼/냉장고장)
  // =========================================================
  { category: "가구공사", item: "주방 싱크대 (PET E0 무광)", unit: "m", priceLow: 450000, priceStandard: 550000, priceHigh: 750000, description: "사각싱크볼(백조), 거위목수전 포함" },
  { category: "가구공사", item: "냉장고장/키큰장 (맞춤제작)", unit: "통", priceLow: 400000, priceStandard: 500000, priceHigh: 700000, description: "비스포크/오브제 라인 맞춤" },
  { category: "가구공사", item: "신발장 (띄움시공+간접등)", unit: "자", priceLow: 150000, priceStandard: 200000, priceHigh: 250000, description: "거울도어 1짝 포함" },
  { category: "가구공사", item: "붙박이장 (여닫이/슬라이딩)", unit: "자", priceLow: 130000, priceStandard: 160000, priceHigh: 220000, description: "내부 구성 포함" },

  // =========================================================
  // 8. 기타 (시스템에어컨 등)
  // =========================================================
  { category: "기타공사", item: "시스템 에어컨 (삼성/LG)", unit: "대", priceLow: 1500000, priceStandard: 1800000, priceHigh: 2200000, description: "단배관/다배관, 실외기 포함 (3~4대 기준)" },
  { category: "기타공사", item: "입주 청소 (전문업체)", unit: "평", priceLow: 15000, priceStandard: 20000, priceHigh: 25000, description: "공사 분진 제거, 피톤치드" },
  { category: "기타공사", item: "도어락/인터폰 교체", unit: "식", priceLow: 350000, priceStandard: 500000, priceHigh: 700000, description: "삼성/코맥스 등" }
];

// 인건비 및 생산성 데이터 (존슨 지침 상세 반영)
export const LABOR_DATA = {
    dailyWages: {
        carpenter_foreman: 400000, // 목공 반장 (기술료 포함 상향)
        carpenter_member: 300000,  // 일반 목공
        tiler_expert: 420000,      // 타일 전공 (600각 시공 기준)
        tiler_assistant: 220000,   // 타일 조공
        demolition: 200000,        // 철거
        general: 180000,           // 잡부
        electrician: 350000,       // 전기공
        wallpaper: 300000,         // 도배사
        flooring: 300000           // 바닥공
    },
    // 생산성 및 계산 규칙
    productivity: {
        inflation_factor: 1.05,
        carpenter_tool_fee: 100000,
        tile_overage: 1.10, 
        tile_overage_complex: 1.15, 
        vanity_coeff_1: 1.05,
        vanity_coeff_2: 1.8,
        vanity_coeff_3: 2.0,
    }
};

export const REGION_FACTOR = {
  SEOUL_METRO: 1.0,
  METROPOLITAN: 0.95,
  RURAL: 0.9,
  ISLAND: 1.2
};

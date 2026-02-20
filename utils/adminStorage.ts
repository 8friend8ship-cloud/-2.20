
import { PRICE_TABLE, LABOR_DATA } from '../constants/prices';
import { MOCK_GENERATED_PLAN, MOCK_BATHROOM_PLAN } from '../constants/mockData';
import { GeneratedPlan, Persona, UnitPrice, VerifiedContractor, MaterialDatabaseItem } from '../types';

const PRICES_KEY = 'johnson_admin_prices_v1';
const LABOR_KEY = 'johnson_admin_labor_v1';
const REFERENCES_KEY = 'johnson_admin_references_v1';
const PERSONA_KEY = 'johnson_admin_personas_v1';
const CONTRACTORS_KEY = 'johnson_admin_contractors_v1';
const MATERIALS_KEY = 'johnson_admin_materials_v1'; 

// --- Prices ---
export const getStoredPriceTable = (): UnitPrice[] => {
  try {
    const stored = localStorage.getItem(PRICES_KEY);
    return stored ? JSON.parse(stored) : PRICE_TABLE;
  } catch (e) {
    console.error("Failed to load prices", e);
    return PRICE_TABLE;
  }
};

export const savePriceTable = (prices: UnitPrice[]) => {
  localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
};

// --- Labor ---
export const getStoredLaborData = () => {
  try {
    const stored = localStorage.getItem(LABOR_KEY);
    return stored ? JSON.parse(stored) : LABOR_DATA;
  } catch (e) {
    console.error("Failed to load labor data", e);
    return LABOR_DATA;
  }
};

export const saveLaborData = (laborData: typeof LABOR_DATA) => {
  localStorage.setItem(LABOR_KEY, JSON.stringify(laborData));
};

// --- References ---
// Updated to reflect the user's detailed feedback regarding Bathroom, Lifting, Waste, and Door labor.
const DEFAULT_REFERENCES = `[존슨 지침: 인테리어 표준 시공 가이드라인 v2.1]

1. 양중 및 보양 (아파트 vs 비아파트 구분)
- 아파트: 사다리차 사용 불가 시 '엘리베이터 사용료(관리실 납부)'와 '승강기 보양비(건축자재)'로 대체하여 견적한다.
- 빌라/단독: 창호/철거 공사 시 '사다리차 비용'을 기본으로 적용한다.

2. 철거 및 폐기물 기준
- 전체 철거: 1.5톤 트럭 (1차 분량) 기준으로 산정한다.
- 욕실 올철거(단독): 1톤 이하 (0.5톤 반차) 비용으로 산정한다.
- 욕실 덧방: 폐기물 양이 적으므로 기본 잡자재비에 포함하거나 소액 책정한다.

3. 욕실 공사 표준 공정 (Smc/도기/전기)
- 공정 순서: 철거/방수(1일) -> 타일 양생 -> 천장/세팅(1일).
- 천장(SMC): '평천장'을 기본으로 하며, 별도 시공일이 아닌 '욕실 세팅일(기구 설치)'에 조명, 환풍기와 함께 일괄 시공한다.
- 전기(욕실 단독 공사 시): 별도의 전기 기술자를 부르지 않는다.
  * 단, 콘센트 신설/이설, 천장 배선 분리, 슬라이딩장 하부 간접조명 등 작업 필요 시 '전기 부분 시공비(약 2시간 작업 비용)'로 별도 책정한다.

4. 목공 및 도어 (전문 시공)
- 도어 단독 시공: 목수 일당(Day)으로 계산하지 않고, '도어 전문 설치비(짝당 단가)'로 계산하여 비용을 절감한다.
- 전체 목공: 가벽, 단열 등 복합 공정일 경우에만 목수 인건비(품)를 적용한다.

5. 자재 선정 및 옵션 (타일/위생도기)
- 타일: 300*600(벽)/300*300(바닥)을 기본으로 하되, 600각(졸리컷) 선택 시 자재비 상승 및 '부자재(아덱스 등)' 옵션을 필수 체크한다.
- 위생도기: 기본형(투피스) vs 고급형(원피스/아메리칸스탠다드) 옵션을 구분하여 제안한다.

6. 기타 필수 체크
- 쇼핑 링크: 자재 리스트 제공 시 고객이 바로 구매 가능한 '쇼핑몰 검색 링크'를 반드시 제공해야 한다.
`;

export const getStoredReferenceGuidelines = (): string => {
    try {
        const stored = localStorage.getItem(REFERENCES_KEY);
        return stored || DEFAULT_REFERENCES;
    } catch (e) {
        return DEFAULT_REFERENCES;
    }
};

export const saveReferenceGuidelines = (text: string) => {
    localStorage.setItem(REFERENCES_KEY, text);
};

// --- MERGED MATERIAL DATABASE (Basic + Finishes + Hidden Items) ---
// 구조: 0.공통/가설 -> 1.철거 -> 2.목공(기초) -> 3.전기 -> 4.설비 -> 5.욕실/타일(마감) -> 6.바닥/벽(마감) -> 7.가구/기타
const INITIAL_MATERIALS: MaterialDatabaseItem[] = [
    // [0] 공통/가설 (Foundation)
    { id: 'COMMON_01', category: '공통', subCategory: '보양', grade: 'standard', name: '플라베니아(PP보양지)', spec: '900*1800*3T', unit: '장', price: 2500, lastUpdated: '2024-02-01', workLink: { laborType: 'general' } },
    { id: 'COMMON_02', category: '공통', subCategory: '보양', grade: 'standard', name: '텐텐지(바닥보양)', spec: '롤', unit: '롤', price: 15000, lastUpdated: '2024-02-01', workLink: { laborType: 'general' } },
    { id: 'COMMON_03', category: '공통', subCategory: '폐기물', grade: 'standard', name: '폐기물 마대(PP)', spec: '80kg용', unit: '장', price: 500, lastUpdated: '2024-02-01', workLink: { laborType: 'general' } },
    { id: 'COMMON_04', category: '공통', subCategory: '폐기물', grade: 'standard', name: '1톤 트럭 폐기물 처리비', spec: '혼합폐기물', unit: '대', price: 450000, lastUpdated: '2024-02-01', workLink: { laborType: 'general' } },
    { id: 'COMMON_05', category: '공통', subCategory: '양중', grade: 'standard', name: '사다리차 사용료 (1시간)', spec: '10층 이하', unit: '시간', price: 150000, lastUpdated: '2024-02-01', workLink: { laborType: 'general' } },
    // NEW ITEMS requested by user
    { id: 'COMMON_06', category: '공통', subCategory: '양중', grade: 'standard', name: '승강기 사용료 (관리실납부)', spec: '아파트 표준', unit: '식', price: 150000, lastUpdated: '2024-02-27', workLink: { laborType: 'none' } },
    { id: 'COMMON_07', category: '공통', subCategory: '보양', grade: 'standard', name: '승강기 보양 (준공청소포함)', spec: '전문업체', unit: '식', price: 250000, lastUpdated: '2024-02-27', workLink: { laborType: 'none' } },
    
    // [1] 철거 (Demolition)
    { id: 'DEMO_01', category: '철거', subCategory: '소모품', grade: 'standard', name: '브레이커/컷팅기 소모품', spec: '날/노미', unit: '식', price: 50000, lastUpdated: '2024-02-01', workLink: { laborType: 'demolition' } },
    { id: 'DEMO_02', category: '철거', subCategory: '폐기물', grade: 'standard', name: '0.5톤 폐기물 처리 (반차)', spec: '욕실단독용', unit: '대', price: 250000, lastUpdated: '2024-02-27', workLink: { laborType: 'demolition' } },

    // [2] 목공/단열 (Carpentry & Insulation - CRITICAL FOR LOGIC)
    { id: 'WOOD_01', category: '목공', subCategory: '자재', grade: 'standard', brand: 'KCC', name: '석고보드(일반)', spec: '9.5T 3x6', unit: '장', price: 3500, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_02', category: '목공', subCategory: '자재', grade: 'standard', brand: 'KCC', name: '석고보드(방수)', spec: '9.5T 3x6', unit: '장', price: 5500, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_03', category: '목공', subCategory: '자재', grade: 'standard', name: '소송 각재(다루끼)', spec: '30*30*3600', unit: '단', price: 30000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_04', category: '목공', subCategory: '자재', grade: 'standard', brand: '영림', name: 'MDF 합판', spec: '9mm 4x8', unit: '장', price: 18000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_05', category: '목공', subCategory: '단열', grade: 'standard', brand: '벽산', name: '아이소핑크 1호', spec: '30T', unit: '장', price: 8000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_06', category: '목공', subCategory: '단열', grade: 'high_end', brand: '벽산', name: '아이소핑크 특호', spec: '50T', unit: '장', price: 12000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_07', category: '목공', subCategory: '부자재', grade: 'standard', name: '우레탄폼 (일회용)', spec: '캔', unit: '통', price: 5000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_08', category: '목공', subCategory: '벽체신설', grade: 'standard', name: '경량철골 스터드(Stud)', spec: '65형', unit: '본', price: 6000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_09', category: '목공', subCategory: '벽체신설', grade: 'standard', name: '경량철골 러너(Runner)', spec: '65형', unit: '본', price: 5000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_member' } },
    { id: 'WOOD_10', category: '목공', subCategory: '몰딩', grade: 'high_end', name: '마이너스 몰딩 프로파일', spec: '알루미늄 3m', unit: '본', price: 15000, lastUpdated: '2024-02-01', workLink: { laborType: 'carpenter_foreman' } },
    // New Door Installation Item
    { id: 'WOOD_11', category: '목공', subCategory: '시공비', grade: 'standard', name: '도어 전문 설치비 (문틀+도어)', spec: '폼충진포함', unit: '짝', price: 80000, lastUpdated: '2024-02-27', workLink: { laborType: 'none' } },

    // [3] 전기/조명 (Electrical)
    { id: 'ELEC_01', category: '전기', subCategory: '배선기구', grade: 'standard', brand: '르그랑', name: '아펠라 스위치 1구', spec: '화이트', unit: '개', price: 5500, lastUpdated: '2024-02-01', workLink: { laborType: 'electrician' } },
    { id: 'ELEC_02', category: '전기', subCategory: '배선기구', grade: 'standard', brand: '르그랑', name: '아펠라 2구 콘센트', spec: '가로형', unit: '개', price: 6000, lastUpdated: '2024-02-01', workLink: { laborType: 'electrician' } },
    { id: 'ELEC_03', category: '전기', subCategory: '조명', grade: 'standard', brand: '필립스', name: '3인치 COB 다운라이트', spec: '7W 4000K', unit: '개', price: 8500, lastUpdated: '2024-02-01', workLink: { laborType: 'electrician' } },
    { id: 'ELEC_04', category: '전기', subCategory: '조명', grade: 'standard', name: 'T5 간접조명', spec: '1200mm 4000K', unit: '개', price: 7000, lastUpdated: '2024-02-01', workLink: { laborType: 'electrician' } },
    { id: 'ELEC_05', category: '전기', subCategory: '조명', grade: 'high_end', brand: '솔라루체', name: '초슬림 엣지 면조명', spec: '1280*320', unit: '개', price: 45000, lastUpdated: '2024-02-01', workLink: { laborType: 'electrician' } },
    // New Bath Electrical
    { id: 'ELEC_06', category: '전기', subCategory: '시공비', grade: 'standard', name: '욕실 부분 전기작업 (간접등/이설)', spec: '2시간 기준', unit: '식', price: 100000, lastUpdated: '2024-02-27', workLink: { laborType: 'none' } },

    // [4] 설비/방수 (Plumbing)
    { id: 'PLUMB_01', category: '설비', subCategory: '배관', grade: 'standard', name: 'PB 파이프(에이콘)', spec: '15A 롤', unit: '롤', price: 45000, lastUpdated: '2024-02-01', workLink: { laborType: 'plumber' } },
    { id: 'PLUMB_02', category: '설비', subCategory: '환기', grade: 'high_end', brand: '힘펠', name: '제로크 (전동댐퍼 일체형)', spec: 'HV3-80X', unit: '대', price: 45000, lastUpdated: '2024-02-01', workLink: { laborType: 'plumber' } },
    { id: 'PLUMB_03', category: '설비', subCategory: '방수', grade: 'high_end', brand: '마페이', name: '아쿠아디펜스 (도막방수)', spec: '15kg', unit: '통', price: 120000, lastUpdated: '2024-02-01', workLink: { laborType: 'plumber' } },
    { id: 'PLUMB_04', category: '설비', subCategory: '방수', grade: 'standard', brand: '고뫄스', name: '고뫄스 방수재', spec: '18L', unit: '통', price: 45000, lastUpdated: '2024-02-01', workLink: { laborType: 'plumber' } },

    // [5] 욕실 도기 (WC) - Representative SKUs
    { id: 'WC_01', category: '욕실', subCategory: '양변기', grade: 'budget', brand: '대림바스', name: '투피스 양변기 (일반형)', spec: '730*400*700', finish: '화이트', installType: '바닥배수', unit: '대', price: 180000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_01', 'SUB_02'] }, searchKeywords: ['저렴한 변기', '일반 변기'], lastUpdated: '2024-02-01' },
    { id: 'WC_02', category: '욕실', subCategory: '양변기', grade: 'standard', brand: '아메리칸스탠다드', name: '웨이브 투피스 (치마형)', spec: '720*390*710', finish: '화이트', installType: '바닥배수', unit: '대', price: 280000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_01', 'SUB_02'] }, searchKeywords: ['치마형 변기', '아메스'], lastUpdated: '2024-02-01' },
    { id: 'WC_03', category: '욕실', subCategory: '양변기', grade: 'high_end', brand: '아메리칸스탠다드', name: '아카시아 수퍼플랫 (원피스)', spec: '700*380*600', finish: '화이트', installType: '바닥배수', unit: '대', price: 550000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_01', 'SUB_02'] }, searchKeywords: ['고급 변기', '원피스'], lastUpdated: '2024-02-01' },
    { id: 'WC_04', category: '욕실', subCategory: '양변기', grade: 'high_end', brand: 'TOTO', name: '벽걸이 양변기 (시스템)', spec: '매립형', finish: '화이트', installType: '벽배수', unit: '대', price: 1200000, workLink: { laborType: 'plumber', autoAddMaterials: ['매립탱크', '조적젠다이'] }, searchKeywords: ['벽걸이 변기', '호텔식'], lastUpdated: '2024-02-01' },

    // [6] 욕실 세면기 (Basin)
    { id: 'WB_01', category: '욕실', subCategory: '세면기', grade: 'budget', brand: '대림바스', name: '긴다리 세면기', spec: '500*400', finish: '화이트', installType: '바닥배수', unit: '대', price: 80000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_02'] }, lastUpdated: '2024-02-01' },
    { id: 'WB_02', category: '욕실', subCategory: '세면기', grade: 'standard', brand: '아메리칸스탠다드', name: '플랫 라운드 (반다리)', spec: '550*460', finish: '화이트', installType: '벽배수', unit: '대', price: 180000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_02'] }, lastUpdated: '2024-02-01' },
    { id: 'WB_03', category: '욕실', subCategory: '세면기', grade: 'high_end', brand: '아메리칸스탠다드', name: '아카시아 베셀 (탑볼)', spec: '원형/사각', finish: '화이트', installType: '탑카운터', unit: '대', price: 250000, workLink: { laborType: 'plumber', autoAddMaterials: ['SUB_02', '대리석상판'] }, lastUpdated: '2024-02-01' },

    // [7] 수전 (Faucet)
    { id: 'FC_01', category: '욕실', subCategory: '수전', grade: 'budget', brand: '국산', name: '기본 크롬 세면수전', spec: '원홀', finish: '크롬', unit: '개', price: 45000, workLink: { laborType: 'plumber' }, lastUpdated: '2024-02-01' },
    { id: 'FC_02', category: '욕실', subCategory: '수전', grade: 'standard', brand: '아메리칸스탠다드', name: '큐브 세면수전', spec: '원홀', finish: '크롬', unit: '개', price: 95000, workLink: { laborType: 'plumber' }, lastUpdated: '2024-02-01' },
    { id: 'FC_03', category: '욕실', subCategory: '수전', grade: 'high_end', brand: '더존테크', name: '하프단101 (무광니켈)', spec: '원홀', finish: '무광니켈', unit: '개', price: 140000, workLink: { laborType: 'plumber' }, lastUpdated: '2024-02-01' },
    { id: 'FC_04', category: '욕실', subCategory: '샤워기', grade: 'standard', brand: '아메리칸스탠다드', name: '큐브 선반형 해바라기', spec: '레인샤워', finish: '화이트/크롬', unit: '개', price: 280000, workLink: { laborType: 'plumber' }, lastUpdated: '2024-02-01' },

    // [8] 바닥재 (Flooring)
    { id: 'FL_01', category: '바닥마감', subCategory: '장판', grade: 'budget', brand: 'LX하우시스', name: '뉴청맥 1.8T', spec: '1.8mm', unit: '평', price: 35000, workLink: { laborType: 'flooring' }, lastUpdated: '2024-02-01' },
    { id: 'FL_02', category: '바닥마감', subCategory: '장판', grade: 'standard', brand: 'LX하우시스', name: '지아자연애 2.2T', spec: '2.2mm', unit: '평', price: 55000, workLink: { laborType: 'flooring' }, lastUpdated: '2024-02-01' },
    { id: 'FL_03', category: '바닥마감', subCategory: '마루', grade: 'standard', brand: '구정마루', name: '강마루 (아이보리)', spec: '94*800*7.5', unit: '평', price: 110000, workLink: { laborType: 'flooring', autoAddMaterials: ['마루본드'] }, lastUpdated: '2024-02-01' },
    { id: 'FL_04', category: '바닥마감', subCategory: '마루', grade: 'high_end', brand: '동화자연마루', name: '나투스진 그란데 (광폭)', spec: '325*810*7', unit: '평', price: 135000, workLink: { laborType: 'flooring', autoAddMaterials: ['황토풀'] }, lastUpdated: '2024-02-01' },
    { id: 'FL_05', category: '바닥마감', subCategory: '마루', grade: 'high_end', brand: '구정마루', name: '원목마루 노블레스', spec: '광폭 원목', unit: '평', price: 250000, workLink: { laborType: 'flooring', autoAddMaterials: ['친환경본드'] }, lastUpdated: '2024-02-01' },

    // [9] 벽마감 (Wall)
    { id: 'WP_01', category: '벽마감', subCategory: '도배', grade: 'budget', brand: '신한벽지', name: '광폭 합지', spec: '종이', unit: '롤', price: 20000, workLink: { laborType: 'wallpaper', autoAddMaterials: ['도배풀'] }, lastUpdated: '2024-02-01' },
    { id: 'WP_02', category: '벽마감', subCategory: '도배', grade: 'standard', brand: 'LX하우시스', name: '베스띠 실크벽지', spec: 'PVC코팅', unit: '롤', price: 45000, workLink: { laborType: 'wallpaper', autoAddMaterials: ['부직포', '운용지'] }, lastUpdated: '2024-02-01' },
    { id: 'WP_03', category: '벽마감', subCategory: '도배', grade: 'high_end', brand: 'LX하우시스', name: '디아망 (프리미엄)', spec: '고두께 실크', unit: '롤', price: 75000, workLink: { laborType: 'wallpaper', autoAddMaterials: ['삼중지'] }, lastUpdated: '2024-02-01' },
    { id: 'PT_01', category: '벽마감', subCategory: '도장', grade: 'high_end', brand: '벤자민무어', name: '스커프엑스 (무광)', spec: 'Gallon', unit: '통', price: 140000, workLink: { laborType: 'painter', autoAddMaterials: ['퍼티', '조인트테이프'] }, lastUpdated: '2024-02-01' },

    // [10] 도어/중문 (Door)
    { id: 'DR_01', category: '도어', subCategory: '방문', grade: 'standard', brand: '영림', name: 'ABS 도어 (민무늬)', spec: 'YA-001', unit: '짝', price: 180000, workLink: { laborType: 'carpenter_member', autoAddMaterials: ['손잡이', '경첩'] }, lastUpdated: '2024-02-01' },
    { id: 'DR_02', category: '도어', subCategory: '중문', grade: 'standard', brand: '예림', name: '3연동 슬림 중문', spec: '초슬림', unit: '식', price: 900000, workLink: { laborType: 'carpenter_member' }, lastUpdated: '2024-02-01' },
    { id: 'DR_03', category: '도어', subCategory: '터닝', grade: 'standard', brand: 'LX하우시스', name: '파워세이브 터닝도어', spec: '단열도어', unit: '틀', price: 650000, workLink: { laborType: 'carpenter_member' }, lastUpdated: '2024-02-01' },

    // [11] 주방/가구 (Kitchen)
    { id: 'KIT_01', category: '가구', subCategory: '싱크대', grade: 'budget', brand: '사제', name: 'LPM 하이그로시 싱크대', spec: '기본형', unit: 'm', price: 350000, workLink: { laborType: 'carpenter_member' }, lastUpdated: '2024-02-01' },
    { id: 'KIT_02', category: '가구', subCategory: '싱크대', grade: 'standard', brand: '사제', name: 'PET 무광 싱크대 (E0)', spec: '사각볼포함', unit: 'm', price: 550000, workLink: { laborType: 'carpenter_member' }, lastUpdated: '2024-02-01' },
    { id: 'KIT_03', category: '가구', subCategory: '후드', grade: 'standard', brand: '하츠', name: '슬림루나 후드', spec: '900', unit: '대', price: 280000, workLink: { laborType: 'none' }, lastUpdated: '2024-02-01' },
    { id: 'KIT_04', category: '가구', subCategory: '수전', grade: 'standard', brand: '백조', name: '거위목 수전', spec: '무광', unit: '개', price: 120000, workLink: { laborType: 'none' }, lastUpdated: '2024-02-01' },

    // [12] 히든 아이템 (Hidden - Auto Add)
    { id: 'SUB_01', category: '부자재', subCategory: '설비', grade: 'standard', name: '양변기 정심/편심', spec: '표준', unit: '개', price: 5000, lastUpdated: '2024-02-01', workLink: { laborType: 'none' } },
    { id: 'SUB_02', category: '부자재', subCategory: '설비', grade: 'standard', name: '고압호스/앵글밸브', spec: '세트', unit: '조', price: 8000, lastUpdated: '2024-02-01', workLink: { laborType: 'none' } },
    { id: 'SUB_03', category: '부자재', subCategory: '타일', grade: 'high_end', name: '아덱스 X18 (고성능 접착제)', spec: '15kg', unit: '포', price: 28000, lastUpdated: '2024-02-01', workLink: { laborType: 'none' } },
    { id: 'SUB_04', category: '부자재', subCategory: '타일', grade: 'high_end', name: '케라폭시 (에폭시 줄눈)', spec: '3kg', unit: '통', price: 90000, lastUpdated: '2024-02-01', workLink: { laborType: 'none' } },
    { id: 'SUB_05', category: '부자재', subCategory: '목공', grade: 'standard', name: 'USG 종이 코너비드', spec: '2.4m', unit: '개', price: 4000, lastUpdated: '2024-02-01', workLink: { laborType: 'none' } },
];

export const getStoredMaterials = (): MaterialDatabaseItem[] => {
    try {
        const stored = localStorage.getItem(MATERIALS_KEY);
        return stored ? JSON.parse(stored) : INITIAL_MATERIALS;
    } catch (e) {
        return INITIAL_MATERIALS;
    }
};

export const saveMaterials = (materials: MaterialDatabaseItem[]) => {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
};

// ... (Rest of the file remains same: Personas, Contractors)
export const getStoredPersonas = (): Persona[] => {
    try {
        const stored = localStorage.getItem(PERSONA_KEY);
        if (stored) return JSON.parse(stored);
        
        const defaultPersona: Persona = {
            id: 'default_full_32py',
            name: '기본 데모: 32평형 전체 인테리어',
            description: '존슨 가이드라인의 기본 데모 데이터입니다.',
            tags: ['32py', 'Standard', 'Demo'],
            data: MOCK_GENERATED_PLAN,
            createdAt: new Date().toISOString()
        };
        return [defaultPersona];
    } catch (e) {
        console.error("Failed to load personas", e);
        return [];
    }
};

export const savePersonas = (personas: Persona[]) => {
    localStorage.setItem(PERSONA_KEY, JSON.stringify(personas));
};

export const addPersona = (persona: Persona) => {
    const current = getStoredPersonas();
    const existingIndex = current.findIndex(p => p.id === persona.id || p.name === persona.name);
    
    if (existingIndex >= 0) {
        current[existingIndex] = persona;
    } else {
        current.push(persona);
    }
    savePersonas(current);
};

export const deletePersona = (id: string) => {
    const current = getStoredPersonas();
    const filtered = current.filter(p => p.id !== id);
    savePersonas(filtered);
};

// --- Verified Contractor Management ---
const INITIAL_CONTRACTORS: VerifiedContractor[] = [
    {
        id: 'c1',
        name: '김목수 TV',
        type: '목공',
        region: '서울/경기',
        contact: '010-1234-5678',
        snsLink: 'https://youtube.com/@carpenter_kim',
        platform: 'youtube',
        description: '30년 경력 내장목공 전문, 9mm 문선 장인',
        isVerified: true,
        tags: ['목공', '단열', '가벽'],
        career: '30년',
        verificationNote: '유튜브 채널 운영중, 시공 디테일 우수'
    },
    {
        id: 'c2',
        name: '박반장 타일팀',
        type: '타일 시공',
        region: '서울 강남/서초',
        contact: '010-9876-5432',
        platform: 'offline', // No SNS
        description: 'SNS는 안하지만 강남권 인테리어 실장님들이 줄서서 기다리는 타일팀',
        isVerified: true,
        tags: ['졸리컷', '대형타일', '오프라인고수'],
        career: '25년',
        verificationNote: '2024년 1월 반포 래미안 현장 실사 완료. 졸리컷 마감 품질 최상급 확인.'
    }
];

export const getStoredContractors = (): VerifiedContractor[] => {
    try {
        const stored = localStorage.getItem(CONTRACTORS_KEY);
        return stored ? JSON.parse(stored) : INITIAL_CONTRACTORS;
    } catch (e) {
        return INITIAL_CONTRACTORS;
    }
};

export const saveContractors = (contractors: VerifiedContractor[]) => {
    localStorage.setItem(CONTRACTORS_KEY, JSON.stringify(contractors));
};

export const getStoredDemoTemplate = (type: 'full' | 'bathroom'): GeneratedPlan => {
    const personas = getStoredPersonas();
    if (type === 'bathroom') return MOCK_BATHROOM_PLAN; 
    return personas[0]?.data || MOCK_GENERATED_PLAN;
};

export const saveDemoTemplate = (type: 'full' | 'bathroom', plan: GeneratedPlan) => {
    console.warn("saveDemoTemplate is deprecated. Use addPersona instead.");
};

export const resetAdminSettings = () => {
  localStorage.removeItem(PRICES_KEY);
  localStorage.removeItem(LABOR_KEY);
  localStorage.removeItem(REFERENCES_KEY);
  localStorage.removeItem(PERSONA_KEY);
  localStorage.removeItem(CONTRACTORS_KEY);
  localStorage.removeItem(MATERIALS_KEY);
};

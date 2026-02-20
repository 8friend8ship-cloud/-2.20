
import { VirtualPlan, GeneratedPlan } from '../types';

// 1x1 Pixel Transparent GIF for placeholder
export const MOCK_IMAGE_BASE64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

// A colorful placeholder for 3D views (Base64 of a small gradient or solid color)
export const MOCK_VIEW_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

export const MOCK_VIRTUAL_PLAN: VirtualPlan = {
  units: 'meters',
  totalFloorArea: 105.0, // approx 32py
  totalWallLength: 85.0,
  rooms: [
    {
      id: 'room-living',
      type: 'LIVING_ROOM',
      boundary: [{x:0, y:0}, {x:5, y:0}, {x:5, y:4}, {x:0, y:4}],
      walls: ['w1', 'w2', 'w3', 'w4'],
      area: 20.0
    },
    {
      id: 'room-master',
      type: 'BEDROOM',
      boundary: [{x:5, y:0}, {x:9, y:0}, {x:9, y:4}, {x:5, y:4}],
      walls: ['w2', 'w5', 'w6', 'w7'],
      area: 16.0
    },
    {
      id: 'room-kitchen',
      type: 'KITCHEN',
      boundary: [{x:0, y:4}, {x:4, y:4}, {x:4, y:7}, {x:0, y:7}],
      walls: ['w4', 'w8', 'w9', 'w10'],
      area: 12.0
    }
  ],
  walls: [
    { id: 'w1', type: 'EXTERNAL', start: {x:0, y:0}, end: {x:5, y:0}, thickness: 0.2 },
    { id: 'w2', type: 'INTERNAL', start: {x:5, y:0}, end: {x:5, y:4}, thickness: 0.1 },
    { id: 'w3', type: 'EXTERNAL', start: {x:0, y:4}, end: {x:5, y:4}, thickness: 0.2 },
    { id: 'w4', type: 'INTERNAL', start: {x:0, y:0}, end: {x:0, y:4}, thickness: 0.1 }
  ],
  doors: [
    { id: 'd1', wallId: 'w2', position: {x:5, y:2}, width: 0.9, type: 'REGULAR' }
  ],
  windows: [
    { id: 'win1', wallId: 'w1', start: {x:1, y:0}, end: {x:4, y:0}, type: 'FULL' }
  ]
};

// ==============================================================================
// SUPER TEMPLATE: Contains ALL standard items for a Full Interior Project
// The AI will use this as a base and MODIFY quantities/prices based on user input.
// ==============================================================================
export const MOCK_GENERATED_PLAN: GeneratedPlan = {
  designConcept: {
    title: "모던 화이트 & 우드 스탠다드 (전체 인테리어)",
    description: "군더더기 없는 화이트 베이스에 따뜻한 우드 텍스처를 더해 아늑함을 연출합니다. 9mm 문선과 라인 조명으로 간결한 라인을 강조했습니다.",
    keywords: ["화이트우드", "9mm문선", "간접조명", "실용적", "모던"]
  },
  costEstimate: [
    // 1. 철거
    {
      category: "철거/가설",
      item: "내부 전체 철거 및 폐기물 처리",
      quantity: 1,
      unit: "식",
      materialCost: 0,
      laborCost: 1800000,
      unitPrice: 1800000,
      totalPrice: 1800000,
      remarks: "싱크대, 신발장, 몰딩, 욕실 도기 등 기본 철거"
    },
    {
      category: "철거/가설",
      item: "마루 철거 및 샌딩",
      quantity: 25, // 실평수 기준
      unit: "평",
      materialCost: 0,
      laborCost: 1000000,
      unitPrice: 40000,
      totalPrice: 1000000,
      remarks: "기계 작업 필수 (장판일 경우 제외)"
    },
    // 2. 창호 (샷시)
    {
      category: "창호공사",
      item: "전체 샷시 교체 (KCC/LX)",
      quantity: 1,
      unit: "식",
      materialCost: 7000000,
      laborCost: 1500000,
      unitPrice: 8500000,
      totalPrice: 8500000,
      remarks: "발코니 단창, 내창 이중창, 터닝도어 포함"
    },
    // 3. 설비/욕실
    {
      category: "설비/방수",
      item: "욕실 철거 및 방수 공사",
      quantity: 2,
      unit: "개소",
      materialCost: 400000,
      laborCost: 800000,
      unitPrice: 600000,
      totalPrice: 1200000,
      remarks: "바닥 철거 후 도막 방수 2회"
    },
    {
      category: "욕실공사",
      item: "공용 욕실 리모델링 (표준형)",
      quantity: 1,
      unit: "실",
      materialCost: 1500000,
      laborCost: 1300000,
      unitPrice: 2800000,
      totalPrice: 2800000,
      remarks: "300*600 타일, 젠다이, 파티션, 도기 세팅"
    },
    {
      category: "욕실공사",
      item: "안방 욕실 리모델링 (컴팩트)",
      quantity: 1,
      unit: "실",
      materialCost: 1200000,
      laborCost: 1000000,
      unitPrice: 2200000,
      totalPrice: 2200000,
      remarks: "기본형 타일 및 도기 교체"
    },
    // 4. 목공
    {
      category: "목공사",
      item: "천장 몰딩 및 걸레받이 시공",
      quantity: 1,
      unit: "식",
      materialCost: 400000,
      laborCost: 600000,
      unitPrice: 1000000,
      totalPrice: 1000000,
      remarks: "마이너스 몰딩 또는 평몰딩 기준"
    },
    {
      category: "목공사",
      item: "문/문틀 교체 (ABS도어)",
      quantity: 5,
      unit: "짝",
      materialCost: 1000000,
      laborCost: 750000,
      unitPrice: 350000,
      totalPrice: 1750000,
      remarks: "9mm 문선 목공 작업 포함"
    },
    // 5. 전기/조명
    {
      category: "전기공사",
      item: "전체 조명/스위치/콘센트 교체",
      quantity: 1,
      unit: "식",
      materialCost: 800000,
      laborCost: 600000,
      unitPrice: 1400000,
      totalPrice: 1400000,
      remarks: "다운라이트 타공, 배선 기구 교체, 인덕션 배선"
    },
    // 6. 타일 (현관/주방/베란다)
    {
      category: "타일공사",
      item: "현관/주방/베란다 타일 시공",
      quantity: 1,
      unit: "식",
      materialCost: 500000,
      laborCost: 700000,
      unitPrice: 1200000,
      totalPrice: 1200000,
      remarks: "600각(현관), 쪽타일(베란다) 기준"
    },
    // 7. 도장/필름
    {
      category: "도장공사",
      item: "바이오 세라믹 탄성코트",
      quantity: 3, // 베란다 개소
      unit: "개소",
      materialCost: 150000,
      laborCost: 350000,
      unitPrice: 166000,
      totalPrice: 500000,
      remarks: "발코니 곰팡이 방지"
    },
    {
      category: "필름공사",
      item: "현관문/기타 마감 필름 리폼",
      quantity: 1,
      unit: "식",
      materialCost: 200000,
      laborCost: 400000,
      unitPrice: 600000,
      totalPrice: 600000,
      remarks: "현관문 내측, 샷시 제외(샷시 교체 시)"
    },
    // 8. 마감 (도배/마루)
    {
      category: "도배공사",
      item: "전체 실크 벽지 시공",
      quantity: 80, // 벽면적 대략
      unit: "평",
      materialCost: 800000,
      laborCost: 1600000,
      unitPrice: 30000, // 평당 시공비
      totalPrice: 2400000,
      remarks: "LG 베스띠/개나리 에비뉴, 부직포 초배 포함"
    },
    {
      category: "바닥공사",
      item: "강마루 시공 (구정/동화)",
      quantity: 28, // 로스 포함
      unit: "평",
      materialCost: 2100000,
      laborCost: 980000,
      unitPrice: 110000,
      totalPrice: 3080000,
      remarks: "친환경 황토본드 사용"
    },
    // 9. 가구
    {
      category: "가구공사",
      item: "주방 싱크대 제작 (PET E0)",
      quantity: 4.5,
      unit: "m",
      materialCost: 1500000,
      laborCost: 1000000,
      unitPrice: 550000, // m당
      totalPrice: 2475000,
      remarks: "사각싱크볼, 거위목수전, 인조대리석 상판"
    },
    {
      category: "가구공사",
      item: "현관 신발장 (띄움시공)",
      quantity: 1,
      unit: "식",
      materialCost: 300000,
      laborCost: 200000,
      unitPrice: 500000,
      totalPrice: 500000,
      remarks: "하부 간접조명, 거울도어 1짝"
    },
    {
      category: "가구공사",
      item: "안방 붙박이장",
      quantity: 11,
      unit: "자",
      materialCost: 800000,
      laborCost: 400000,
      unitPrice: 110000,
      totalPrice: 1210000,
      remarks: "무광 화이트 여닫이 기준"
    },
    // 10. 기타
    {
      category: "기타공사",
      item: "입주 청소 및 준공",
      quantity: 32,
      unit: "평",
      materialCost: 0,
      laborCost: 480000,
      unitPrice: 15000,
      totalPrice: 480000,
      remarks: "공사 분진 제거"
    }
  ],
  materialDetailSheet: [
    {
        category: "바닥재",
        item: "강마루",
        image: "",
        model: "구정마루 그랜드텍스쳐 (오크뉴)",
        spec: "142W * 1200L * 7.5T",
        color: "Natural Oak",
        quantity: "35BOX",
        price: 55000,
        total: 1925000,
        link: "https://www.coupang.com/np/search?q=구정마루+그랜드텍스쳐",
        alternatives: "동화자연마루 나투스진",
        remarks: "본드 포함",
        qr: ""
    },
    {
        category: "벽지",
        item: "실크벽지",
        image: "",
        model: "LX 베스띠 (테라코타 화이트)",
        spec: "106cm * 15.5m",
        color: "Warm White",
        quantity: "15Roll",
        price: 45000,
        total: 675000,
        link: "https://www.coupang.com/np/search?q=LX+베스띠+화이트",
        alternatives: "개나리벽지 에비뉴",
        remarks: "",
        qr: ""
    },
    {
        category: "가구",
        item: "싱크대 상판",
        image: "",
        model: "LX 하이막스 (오로라)",
        spec: "12T 인조대리석",
        color: "Aurora Blanc",
        quantity: "4.5m",
        price: 250000,
        total: 1125000,
        link: "",
        alternatives: "현대 칸스톤 (엔지니어드스톤)",
        remarks: "뒷선반 없음",
        qr: ""
    }
  ],
  materialBoardPrompts: {
      base: "Minimalist Interior, White and Light Wood, Warm Lighting, Clean Lines",
      subTiles: "Wood Flooring Texture, Matte White Wall",
      subFixtures: "Simple Pendant Light, White Door Handle",
      views: {
          top: "Top view floor plan of apartment, wood flooring, furniture layout",
          elevation: "Living room TV wall elevation, simple design",
          iso: "Isometric view of the living room and kitchen area",
          perspective: "Cozy living room perspective with sunlight"
      },
      video: "Slow pan of the living room, focus on wood texture and lighting"
  },
  projectPackage: {
      folderStructure: ["2024_Project_Full/", "├─ Drawings/", "├─ Estimates/", "└─ Materials/"],
      checklist: {
          dimensions: { confidence: 95, ceilingHeightChecked: true, dimensionsInputChecked: true, specialElementsChecked: true },
          rules: { barrisolAdded: false, jollyCutChecked: false, ventilationHeatingMatched: true, vanityCoeffApplied: false, bathtubOptionReflected: false },
          quality: { warrantyIncluded: true, inflationApplied: true, priceRiskWarned: true },
          deliverables: { estimateExists: true, materialSheetExists: true, boardExists: true, promptsExist: true, summaryExists: true }
      },
      readme: "# Full Interior Project\n전체 인테리어 데모 프로젝트입니다.",
      sendingRules: ["견적서 PDF 변환 발송", "자재 샘플 사진 첨부"]
  },
  masterTemplate: {
      inputSummary: {
          projectName: "32평 아파트 전체 인테리어",
          clientName: "홍길동",
          location: "서울",
          bathroomType: "N/A",
          styleGrade: "Standard",
          dimensions: "32py",
          selectedOptions: "확장 포함",
          confidence: "High",
          autoCorrections: { inflation: "1.05", tileOverage: "1.1", exclusions: "별도", waterproofing: "욕실2개소" },
          risks: ["샷시 사다리차 진입 확인"]
      },
      areaCalculations: [
          { type: "바닥", realArea: "84", overage: "1.1", orderArea: "92", basis: "도면", remarks: "" }
      ],
      materialCosts: [
          { category: "마루", item: "구정마루", spec: "강마루", quantity: "35box", price: 55000, total: 1925000, remarks: "" }
      ],
      laborCosts: [
          { type: "마루", task: "시공비", basis: "평", quantity: 32, price: 35000, total: 1120000, remarks: "" }
      ],
      overheadCosts: [],
      totalSummary: {
          materialTotal: 15000000,
          laborTotal: 18000000,
          overheadTotal: 3000000,
          subTotal: 36000000,
          inflationFactor: 1.05,
          finalTotal: 37800000,
          vatNote: "VAT 별도",
          checklist: []
      }
  },
  projectSchedule: [
    {
      phase: "1주차",
      task: "철거, 샷시 시공, 설비(방수)",
      duration: "6일",
      startDate: "2024-03-01",
      endDate: "2024-03-06"
    },
    {
      phase: "2주차",
      task: "목공(단열/도어), 전기 배선",
      duration: "6일",
      startDate: "2024-03-07",
      endDate: "2024-03-12"
    },
    {
      phase: "3주차",
      task: "타일 시공, 필름, 도장(탄성)",
      duration: "5일",
      startDate: "2024-03-13",
      endDate: "2024-03-17"
    },
    {
      phase: "4주차",
      task: "도기세팅, 도배, 마루, 가구, 조명",
      duration: "6일",
      startDate: "2024-03-18",
      endDate: "2024-03-23"
    }
  ],
  confidence: "HIGH",
  confidenceReason: "슈퍼 템플릿(Super Template) 적용됨",
  correctionNeeded: "없음 (데모 모드)"
};

export const MOCK_BATHROOM_PLAN: GeneratedPlan = {
  designConcept: {
    title: "호텔식 프리미엄 욕실 (욕실 집중 데모)",
    description: "600각 포세린 타일과 졸리컷 시공을 적용한 고급스러운 호텔식 욕실 디자인입니다. 조적 젠다이와 매립 수전을 통해 미니멀한 공간을 연출했습니다.",
    keywords: ["호텔식", "포세린", "졸리컷", "프리미엄", "욕실"]
  },
  costEstimate: [
    {
      category: "철거/가설",
      item: "욕실 전체 철거 및 방수",
      quantity: 1,
      unit: "식",
      materialCost: 250000,
      laborCost: 350000,
      unitPrice: 600000,
      totalPrice: 600000,
      remarks: "벽/바닥 전체 철거 후 1,2차 도막 방수"
    },
    {
      category: "욕실공사",
      item: "600각 포세린 타일 시공",
      quantity: 1,
      unit: "식",
      materialCost: 800000,
      laborCost: 760000,
      unitPrice: 1560000,
      totalPrice: 1560000,
      remarks: "전공2+조공1 (졸리컷 시공 포함)"
    },
    {
      category: "욕실공사",
      item: "도기 및 수전 세팅",
      quantity: 1,
      unit: "식",
      materialCost: 1200000,
      laborCost: 200000,
      unitPrice: 1400000,
      totalPrice: 1400000,
      remarks: "아메리칸 스탠다드 도기 기준"
    },
    {
      category: "욕실공사",
      item: "조적 젠다이 시공",
      quantity: 1,
      unit: "식",
      materialCost: 50000,
      laborCost: 100000,
      unitPrice: 150000,
      totalPrice: 150000,
      remarks: "설비 및 조적작업"
    }
  ],
  materialDetailSheet: [
    {
        category: "마감재",
        item: "벽/바닥 타일",
        image: "(추후첨부)",
        model: "윤현상재 600각 포세린 (Beige)",
        spec: "600*600",
        color: "Warm Beige",
        quantity: "25㎡",
        price: 35000,
        total: 875000,
        link: "https://www.coupang.com/np/search?q=600각+포세린타일+베이지",
        alternatives: "저가: 국산 300*600 / 동급: 수입 스탠다드",
        remarks: "졸리컷 시공 포함",
        qr: "생성대기"
    },
    {
        category: "설비",
        item: "세면대",
        image: "(추후첨부)",
        model: "American Standard (플랫)",
        spec: "550*450",
        color: "White",
        quantity: "1개",
        price: 250000,
        total: 250000,
        link: "https://www.coupang.com/np/search?q=아메리칸스탠다드+플랫+세면대",
        alternatives: "저가: 대림 / 프리미엄: 콜러",
        remarks: "",
        qr: ""
    }
  ],
  materialBoardPrompts: {
      base: "Modern Hotel Bathroom, Warm Tone, Matte Texture, Soft Indirect Lighting",
      subTiles: "600x600 Porcelain Tile, Matte texture, Stone look, Beige color",
      subFixtures: "Floating Vanity, White Ceramic, Brushed Nickel Faucet",
      views: {
          top: "Architectural Top View plan, materials layed out flat, labeled",
          elevation: "Front elevation of vanity wall, showing mirror and sink details",
          iso: "3D Isometric cutaway view of the bathroom, showing layout and flow",
          perspective: "Eye-level realistic interior perspective, depth of field, warm atmosphere"
      },
      video: "Cinematic Vlog Style, Slow pan across the bathroom, soft light bloom, realistic reflections, 4k"
  },
  projectPackage: {
      folderStructure: [
          "프로젝트패키지_20240520_Client/",
          "├─ 클라이언트입력/ (도면, 요청사항)",
          "├─ 산출물/ (견적서, 자재시트, 메터리얼보드)",
          "├─ 이미지/ (아이소, 투시도, 렌더링)",
          "├─ 프롬프트/ (이미지 생성 프롬프트 텍스트)",
          "└─ 리드미.md (프로젝트 요약 및 안내)"
      ],
      checklist: {
          dimensions: {
              confidence: 90,
              ceilingHeightChecked: true,
              dimensionsInputChecked: true,
              specialElementsChecked: false
          },
          rules: {
              barrisolAdded: false,
              jollyCutChecked: true,
              ventilationHeatingMatched: true,
              vanityCoeffApplied: true,
              bathtubOptionReflected: true
          },
          quality: {
              warrantyIncluded: true,
              inflationApplied: true,
              priceRiskWarned: true
          },
          deliverables: {
              estimateExists: true,
              materialSheetExists: true,
              boardExists: true,
              promptsExist: true,
              summaryExists: true
          }
      },
      readme: "# Johnson Estimate Project (Demo)\n\n본 프로젝트는 데모 모드에서 생성된 예시입니다.\n\n## 주요 스펙\n- 타일: 600각 포세린 (졸리컷 적용)\n- 도기: 아메리칸 스탠다드\n\n## 견적 요약\n- 총 견적: 약 350만원 (물가보정 1.05 적용)\n\n## 주의사항\n- 실측 후 정확한 물량 산출이 필요합니다.",
      sendingRules: [
          "필수 포함: 견적서, 자재시트, 메터리얼보드, 요약본",
          "대용량 파일: 클라우드 링크 제공 (유효기간 7일)",
          "면책 조항: 견적은 추정치이며 실측 후 변동 가능"
      ]
  },
  masterTemplate: {
      inputSummary: {
          projectName: "Johnson Estimate Demo",
          clientName: "Client",
          location: "서울/경기 (가정)",
          bathroomType: "철거 후 방수",
          styleGrade: "High-end / 600각 포세린",
          dimensions: "2.1m x 1.7m x 2.3m (Standard)",
          selectedOptions: "졸리컷, 젠다이, 매립수전",
          confidence: "90% (Demo Data)",
          autoCorrections: {
              inflation: "1.05 적용",
              tileOverage: "1.15 (졸리컷)",
              exclusions: "문/창 포함",
              waterproofing: "전체 2차 도막"
          },
          risks: ["배관 위치 확인 필요", "엘리베이터 보양 여부 확인"]
      },
      areaCalculations: [
          { type: "바닥", realArea: "3.57", overage: "1.15", orderArea: "4.10", basis: "2.1*1.7*1.15", remarks: "졸리컷 할증" },
          { type: "벽", realArea: "17.48", overage: "1.15", orderArea: "20.10", basis: "(2.1+1.7)*2*2.3*1.15", remarks: "졸리컷 할증" }
      ],
      materialCosts: [
          { category: "타일", item: "600각 포세린", spec: "600*600", quantity: "25㎡", price: 35000, total: 875000, remarks: "윤현상재" },
          { category: "도기", item: "아메리칸 스탠다드 세면대", spec: "플랫", quantity: "1EA", price: 250000, total: 250000, remarks: "" }
      ],
      laborCosts: [
          { type: "타일", task: "타일 시공 (졸리컷)", basis: "식", quantity: 1, price: 760000, total: 760000, remarks: "전공2+조공1" },
          { type: "철거", task: "욕실 철거", basis: "식", quantity: 1, price: 350000, total: 350000, remarks: "방수 포함" }
      ],
      overheadCosts: [
          { item: "폐기물", basis: "회", quantity: 1, price: 350000, total: 350000, remarks: "1.5톤 기준" }
      ],
      totalSummary: {
          materialTotal: 1125000,
          laborTotal: 1110000,
          overheadTotal: 350000,
          subTotal: 2585000,
          inflationFactor: 1.05,
          finalTotal: 2714250,
          vatNote: "VAT 별도",
          checklist: ["단가 변동 가능", "실측 후 면적 조정", "졸리컷 반영됨"]
      }
  },
  projectSchedule: [
    {
      phase: "1일차",
      task: "철거 및 방수 공사",
      duration: "1일",
      startDate: "2024-01-01",
      endDate: "2024-01-01"
    },
    {
      phase: "2일차",
      task: "양생 (방수 건조)",
      duration: "1일",
      startDate: "2024-01-02",
      endDate: "2024-01-02"
    },
    {
      phase: "3일차",
      task: "타일 시공 (떠발이/압착)",
      duration: "1일",
      startDate: "2024-01-03",
      endDate: "2024-01-03"
    },
    {
      phase: "4일차",
      task: "도기 세팅 및 마감",
      duration: "1일",
      startDate: "2024-01-04",
      endDate: "2024-01-04"
    }
  ],
  confidence: "HIGH",
  confidenceReason: "욕실 전용 데모 데이터",
  correctionNeeded: "없음"
};

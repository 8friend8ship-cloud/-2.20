
export enum AppState {
  INPUT,
  ANALYZING_PLAN,
  GENERATING_VIEWS,
  DESIGN_STUDIO,
  FINALIZING,
  RESULTS,
}

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  type: 'INTERNAL' | 'EXTERNAL';
  start: Point;
  end: Point;
  thickness: number;
}

export interface Door {
  id: string;
  wallId: string;
  position: Point;
  width: number;
  type: 'REGULAR' | 'BATHROOM' | 'ENTRANCE';
}

export interface Window {
  id: string;
  wallId: string;
  start: Point;
  end: Point;
  type: 'FULL' | 'HALF' | 'SMALL';
}

export interface Room {
  id:string;
  type: 'LIVING_ROOM' | 'BEDROOM' | 'KITCHEN' | 'BATHROOM' | 'DRESS_ROOM' | 'ENTRANCE' | 'BALCONY' | 'UNKNOWN';
  boundary: Point[];
  walls: string[];
  area: number;
}

export interface VirtualPlan {
  rooms: Room[];
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  units: 'meters';
  totalFloorArea: number;
  totalWallLength: number;
}

// Detailed Bathroom Specifications (Enhanced)
export interface BathroomSpecifics {
  // 1. 철거 및 기초
  demolitionType: 'full_waterproof' | 'partial_overlay' | 'basic_removal'; // 올철거(방수포함) | 덧방(기구철거) | 기본철거
  waterproofing: 'standard_2coat' | 'premium_3coat' | 'none'; // 2차도막 | 3차+부직포 | 덧방시없음

  // 2. 타일 및 마감
  tileSelection: '300_600' | '600_600' | '800_800' | '600_1200' | 'mosaic' | '300_300_floor';
  gendaiFinish: 'jolly_cut' | 'art_marble' | 'nat_marble' | 'tile_finish' | 'none'; // 졸리컷 | 인조대리석 | 천연대리석 | 타일마감
  
  // 3. 도기 및 수전
  toiletType: 'two_piece' | 'one_piece' | 'wall_hung' | 'smart_bidet'; // 투피스 | 원피스 | 벽걸이 | 비데일체
  washbasinType: 'half_pedestal' | 'full_pedestal' | 'top_counter' | 'under_counter'; // 반다리 | 긴다리 | 탑볼 | 언더
  faucetGrade: 'standard_chrome' | 'matte_sus' | 'color_coated' | 'luxury_brand'; // 크롬 | 무광니켈 | 컬러도장 | 수입

  // 4. 구조 및 가구
  wetZoneMethod: 'bathtub' | 'partition_glass' | 'partition_tile' | 'booth' | 'none';
  cabinetType: 'sliding_mirror' | 'flap_jang' | 'mirror_standard' | 'custom_wood'; // 슬라이딩장 | 플랩장 | 거울+수납 | 하부장제작
  ceilingType: 'smc_flat' | 'smc_dome' | 'paint_special' | 'barrisol'; // SMC평 | SMC돔 | 도장 | 바리솔

  // 5. 설비 및 기타 옵션 (Expert Additions)
  ventilation: 'basic_fan' | 'high_end_damper'; // 일반 | 힘펠(댐퍼/온풍)
  drainType: 'standard_yuga' | 'tile_yuga' | 'line_trench'; // 일반유가 | 도기질유가 | 트렌치
  floorHeating: boolean; // 난방 배관 연장 여부
  
  // Dimensions & Logic
  width?: number; 
  depth?: number; 
  height?: number; 
  useDimensionsOnly?: boolean;
  
  // Electrical (Existing)
  needsElectricalWork?: boolean;
  electricalOptions?: {
      moveOutlet: boolean;
      indirectLight: boolean;
      fanConnection: boolean;
  };
}

// Detailed Scope Flags
export interface DetailedScope {
    tile: {
        kitchen: boolean;
        entrance: boolean;
        balcony: boolean;
    };
    wallpaper: 'all_silk' | 'all_paper' | 'combo'; 
    
    flooring: {
        layout: 'all_maru' | 'all_jangpan' | 'all_tile' | 'mix_tile_maru' | 'mix_maru_jangpan';
        specs: {
            maru: 'gang' | 'texture'; 
            jangpan: '1.8' | '2.2' | '5.0'; 
            tile: '600' | '800' | '600_1200'; 
        }
    };

    sash: 'all' | 'partial';
    sashCondition?: string;
    sashConfig?: {
        brand: 'kcc' | 'lx' | 'hyundai';
        glass: 'general_22' | 'low_e_24' | 'triple_system'; 
        windowType: 'double' | 'system'; 
    };

    door: {
        mode: 'replace_all' | 'replace_door_film_frame' | 'film_both' | 'paint_both';
    };

    ceiling?: {
        type: 'flat' | 'mold' | 'exposed'; 
        method: 'replace_all' | 'overlay' | 'paint_only'; 
        indirectLight: boolean; 
        isTwoPly: boolean; 
    };

    wallConfig?: {
        structural: 'existing' | 'new_stud' | 'bad_condition'; 
        layers: '1ply' | '2ply'; 
        finishType: 'wallpaper' | 'paint' | 'film'; 
        baseboard: 'standard' | 'minus_hidden' | 'paint_skirting' | 'none'; 
        soundProofing: boolean; 
        isAllPutty: boolean; 
    };

    molding?: {
        type: 'minus' | 'flat' | 'crown'; 
    };

    entryDoor?: {
        type: '3yeondong' | 'swing' | 'onesliding';
    };

    expansionConfig?: {
        floorHeating: boolean; 
        insulationGrade: 'standard' | 'high_end'; 
        turningDoor: boolean; 
    };

    insulation?: {
        area: string; 
    };

    paint: {
        balconyType: 'ceramic' | 'water';
        livingWall: boolean;
        ceiling: boolean;
        whole: boolean;
    };

    film: {
        doors: boolean; 
        doorsCount?: number; 
        builtIn: boolean; 
        builtInCount?: number; 
        sink: boolean; 
        sinkSize?: number; 
        entrance: boolean; 
        walls?: string; 
    };

    admin: {
        permit: boolean; 
        consent: boolean; 
        protection: boolean; 
    };
}

export interface ProjectScopeFlags {
    sash: boolean;
    door: boolean;
    bath1: boolean;
    bath2: boolean;
    tile: boolean;
    wallpaper: boolean;
    flooring: boolean;
    molding: boolean;
    flatCeiling: boolean;
    kitchenSink: boolean;
    balconyPaint: boolean;
    film: boolean;
    builtIn: boolean;
    electrical: boolean;
    entryDoor: boolean;
    insulation: boolean;
    systemAC: boolean;
    expansion: boolean;
}

export interface ProjectDetails {
  area: number; 
  address?: string; 
  buildingType?: 'apartment' | 'villa' | 'house'; 
  requests: string;
  targetDate?: string;
  moveInDate?: string; 
  budget?: number; 
  image: {
    data: string; 
    mimeType: string;
  };
  roomCount?: number;
  bathroomCount?: number;
  floor?: number; 
  
  alreadyExpandedAreas?: string[];
  needsExpansionAreas?: string[];
  
  // NEW: Chassis Workflow Extensions
  expansionsCurrent?: string[];
  expansionsPlanned?: string[];
  derivedWindowSets?: WindowSet[];

  scopeFlags?: ProjectScopeFlags;
  detailedScope?: DetailedScope;
  itemNotes?: Record<string, string>;

  kitchenSinkSize?: number;
  kitchenSinkGrade?: 'pet' | 'painted';
  systemAcCount?: number;
  windowCount?: number;
  windowGrade?: 'standard' | 'high_end';
  doorCount?: number;

  virtualPlan?: VirtualPlan;
  isometricView?: {
    data: string;
    mimeType: string;
  };
  perspectiveView?: {
    data: string;
    mimeType: string;
  };
  modelType: 'standard' | 'pro';
  isDemo?: boolean;
  projectScope: 'full' | 'bathroom';
  bathroomSpecifics?: BathroomSpecifics;
  wants3DGeneration?: boolean;
}

export interface EstimateItem {
  category: string;
  item: string;
  quantity: number;
  unit: string;
  materialCost: number;
  laborCost: number;
  unitPrice: number;
  totalPrice: number;
  remarks: string;
}

export interface MaterialDetailItem {
  category: string;
  item: string;
  image: string;
  model: string;
  spec: string;
  color: string;
  quantity: string;
  price: number;
  total: number;
  link: string;
  alternatives: string;
  remarks: string;
  qr: string;
}

export interface MaterialDatabaseItem {
    id: string;
    category: string; 
    subCategory: string; 
    grade: 'budget' | 'standard' | 'high_end'; 
    brand?: string; 
    name: string; 
    modelCode?: string; 
    spec: string; 
    finish?: string; 
    installType?: string; 
    unit: string; 
    price: number; 
    link?: string; 
    image?: string; 
    laborRef?: string; 
    
    workLink?: {
        laborType: string; 
        autoAddMaterials?: string[]; 
        complexityFactor?: number; 
    };
    
    searchKeywords?: string[]; 
    description?: string;
    lastUpdated: string;
}

export interface PromptSet {
  base: string;
  subTiles: string;
  subFixtures: string;
  views: {
    top: string;
    elevation: string;
    iso: string;
    perspective: string;
  };
  video: string;
}

export interface VerificationChecklist {
  dimensions: {
    confidence: number;
    ceilingHeightChecked: boolean;
    dimensionsInputChecked: boolean;
    specialElementsChecked: boolean;
  };
  rules: {
    barrisolAdded: boolean;
    jollyCutChecked: boolean;
    ventilationHeatingMatched: boolean;
    vanityCoeffApplied: boolean;
    bathtubOptionReflected: boolean;
  };
  quality: {
    warrantyIncluded: boolean;
    inflationApplied: boolean;
    priceRiskWarned: boolean;
  };
  deliverables: {
    estimateExists: boolean;
    materialSheetExists: boolean;
    boardExists: boolean;
    promptsExist: boolean;
    summaryExists: boolean;
  };
}

export interface ProjectPackage {
  folderStructure: string[];
  checklist: VerificationChecklist;
  readme: string;
  sendingRules: string[];
}

export interface MasterTemplate {
  inputSummary: {
    projectName: string;
    clientName: string;
    location: string;
    bathroomType: string;
    styleGrade: string;
    dimensions: string;
    selectedOptions: string;
    confidence: string;
    autoCorrections: {
      inflation: string;
      tileOverage: string;
      exclusions: string;
      waterproofing: string;
    };
    risks: string[];
  };
  areaCalculations: {
    type: string;
    realArea: string;
    overage: string;
    orderArea: string;
    basis: string;
    remarks: string;
  }[];
  materialCosts: {
    category: string;
    item: string;
    spec: string;
    quantity: string;
    price: number;
    total: number;
    remarks: string;
  }[];
  laborCosts: {
    type: string;
    task: string;
    basis: string;
    quantity: number;
    price: number;
    total: number;
    remarks: string;
  }[];
  overheadCosts: {
    item: string;
    basis: string;
    quantity: number;
    price: number;
    total: number;
    remarks: string;
  }[];
  totalSummary: {
    materialTotal: number;
    laborTotal: number;
    overheadTotal: number;
    subTotal: number;
    inflationFactor: number;
    finalTotal: number;
    vatNote: string;
    checklist: string[];
  };
}

export interface SchedulePhase {
  phase: string;
  task: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface BudgetAnalysis {
    isOverBudget: boolean;
    statusMessage: string;
    costSavingTips: string[];
}

export interface WindowSet {
  id: string;
  roomId: string;
  roomName: string;
  type: '외창' | '발코니창' | '내창' | '분합' | '도어';
  width: number;
  height: number;
  area: number;
  qty: number;
  basis: string;
  ruleId: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface ChassisEvidence {
  windowSets: WindowSet[];
  expansionsCurrent: string[];
  expansionsPlanned: string[];
  floorApplied: number;
  specKeys: Record<string, string>; // windowSetId -> specKey
  baseCostApplied: number;
}

export interface GeneratedPlan {
  designConcept: {
    title: string;
    description: string;
    keywords: string[];
  };
  costEstimate: EstimateItem[];
  budgetAnalysis?: BudgetAnalysis;
  materialDetailSheet?: MaterialDetailItem[];
  materialBoardPrompts?: PromptSet;
  projectPackage?: ProjectPackage;
  masterTemplate?: MasterTemplate;
  projectSchedule: SchedulePhase[];
  chassisEvidence?: ChassisEvidence; // NEW
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason: string;
  correctionNeeded: string;
}

export interface Material {
  id: number;
  category: string;
  name: string;
  description: string;
  imageUrl: string;
  price: string;
}

export interface Persona {
    id: string;
    name: string;
    description: string;
    tags: string[];
    data: GeneratedPlan;
    createdAt: string;
}

export interface PersonaScenario {
    id: string;
    title: string;
    area: number;
    description: string;
    probability: string;
    keyFeatures: string[];
}

export interface PriceSuggestion {
    id: string;
    type: 'UPDATE' | 'NEW';
    category: string;
    item: string;
    unit: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    description?: string;
}

export interface UnitPrice {
  category: string;
  item: string;
  unit: string;
  priceLow: number;
  priceStandard: number;
  priceHigh: number;
  description: string;
}

export interface VerifiedContractor {
    id: string;
    name: string; 
    type: string; 
    region: string; 
    contact: string; 
    snsLink?: string; 
    platform?: 'youtube' | 'instagram' | 'blog' | 'website' | 'other' | 'offline';
    description: string; 
    isVerified: boolean; 
    tags: string[];
    career?: string; 
    verificationNote?: string; 
}

export interface LaborSuggestion {
    key: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
}

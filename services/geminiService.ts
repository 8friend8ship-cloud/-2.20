
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { 
    VirtualPlan, 
    GeneratedPlan, 
    ProjectDetails, 
    MaterialDetailItem, 
    PromptSet, 
    ProjectPackage, 
    MasterTemplate, 
    UnitPrice, 
    PriceSuggestion,
    SchedulePhase,
    LaborSuggestion,
    MaterialDatabaseItem,
    WindowSet
} from '../types';
import { MOCK_GENERATED_PLAN, MOCK_BATHROOM_PLAN, MOCK_VIRTUAL_PLAN, MOCK_IMAGE_BASE64 } from '../constants/mockData';
import { getStoredReferenceGuidelines, getStoredMaterials } from '../utils/adminStorage';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJSON = (text: string | undefined): any => {
    if (!text) return {};
    try {
        let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");
        const firstOpen = cleaned.search(/[\{\[]/);
        const lastClose = cleaned.search(/[\}\]][^\{\}\[\]]*$/);
        if (firstOpen !== -1 && lastClose !== -1) {
            cleaned = cleaned.substring(firstOpen, lastClose + 1);
        }
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error. Raw text:", text);
        throw new Error("AI 응답 데이터 형식이 올바르지 않습니다.");
    }
};

// ... (Rest of the imports and helper functions remain similar) ...
const getRecentMarketPeriod = (): string => {
    const now = new Date();
    const past = new Date(now.setMonth(now.getMonth() - 1)); // 1달 전 데이터까지
    const year = past.getFullYear();
    const month = past.getMonth() + 1;
    return `${year}년 ${month}월`;
};

// --- CHASSIS (WINDOW) WORKFLOW CONSTANTS & RULES ---
const CHASSIS_PRICE_TABLE: Record<string, Record<string, number>> = {
    kcc: {
        "230D-26-LOWE": 350000,  // 발코니 전용창 (㎡당)
        "240D-26-LOWE": 420000,  // 확장부/외기면 (㎡당)
        "230D-22-CLEAR": 280000, // 내창/분합 (㎡당)
        "KITCHEN-FIX-500": 500000, // 주방 고정가
    },
    lx: {
        "230D-26-LOWE": 450000,
        "240D-26-LOWE": 550000,
        "230D-22-CLEAR": 380000,
        "KITCHEN-FIX-500": 650000,
    },
    hyundai: {
        "230D-26-LOWE": 380000,
        "240D-26-LOWE": 450000,
        "230D-22-CLEAR": 310000,
        "KITCHEN-FIX-500": 550000,
    }
};

const calculateChassisCosts = (details: ProjectDetails): { estimate: any[], evidence: any } => {
    const windowSets = details.derivedWindowSets || [];
    const brand = details.detailedScope?.sashConfig?.brand || 'kcc';
    const floor = details.floor || 1;
    const expansionsCurrent = details.expansionsCurrent || [];
    const expansionsPlanned = details.expansionsPlanned || [];
    
    const chassisEstimate: any[] = [];
    const specKeys: Record<string, string> = {};
    
    let totalChassisPrice = 0;

    windowSets.forEach(set => {
        let specKey = "";
        let pricingMode: 'area' | 'fixed' | 'each' = 'area';
        let unitPrice = 0;

        // Step E5 Matching Rules
        if (set.roomName.includes('주방') && set.width < 1500) {
            specKey = "KITCHEN-FIX-500";
            pricingMode = 'fixed';
        } else if (set.type === '외창' || set.type === '발코니창') {
            // Check if this room is expanded (current or planned)
            const isExpanded = expansionsCurrent.includes(set.roomName) || expansionsPlanned.includes(set.roomName);
            specKey = isExpanded ? "240D-26-LOWE" : "230D-26-LOWE";
        } else {
            specKey = "230D-22-CLEAR";
        }

        unitPrice = CHASSIS_PRICE_TABLE[brand][specKey] || 300000;
        specKeys[set.id] = specKey;

        const totalPrice = pricingMode === 'fixed' ? unitPrice : (set.area * unitPrice);
        totalChassisPrice += totalPrice;

        chassisEstimate.push({
            category: "창호(샷시)",
            item: `[${set.roomName}] ${set.type} (${specKey})`,
            quantity: pricingMode === 'fixed' ? 1 : set.area,
            unit: pricingMode === 'fixed' ? "SET" : "㎡",
            materialCost: totalPrice * 0.7,
            laborCost: totalPrice * 0.3,
            unitPrice: unitPrice,
            totalPrice: totalPrice,
            remarks: `${set.width}x${set.height} | ${set.basis}`
        });
    });

    // Step E6: Base Cost
    let baseCost = 700000;
    let baseRemarks = "철거+부자재+코킹+사다리차 기본";
    if (floor >= 15) {
        baseCost += 200000;
        baseRemarks += " (15층 이상 가산)";
    }

    chassisEstimate.push({
        category: "창호(샷시)",
        item: "샤시 공통 공사비",
        quantity: 1,
        unit: "식",
        materialCost: baseCost * 0.4,
        laborCost: baseCost * 0.6,
        unitPrice: baseCost,
        totalPrice: baseCost,
        remarks: baseRemarks
    });

    return {
        estimate: chassisEstimate,
        evidence: {
            windowSets,
            expansionsCurrent,
            expansionsPlanned,
            floorApplied: floor,
            specKeys,
            baseCostApplied: baseCost
        }
    };
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const testAi = new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });
    await testAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'test',
    });
    return true;
  } catch (e) {
    console.error("API Key Validation Error:", e);
    return false;
  }
};

export const createVirtualPlanFromDimensions = (width: number, depth: number, roomType: string): VirtualPlan => {
  return {
    units: 'meters',
    totalFloorArea: width * depth,
    totalWallLength: (width + depth) * 2,
    rooms: [{
        id: 'room-1',
        type: roomType as any,
        boundary: [{x:0, y:0}, {x:width, y:0}, {x:width, y:depth}, {x:0, y:depth}],
        walls: ['w1', 'w2', 'w3', 'w4'],
        area: width * depth
    }],
    walls: [], 
    doors: [],
    windows: []
  };
};

export const analyzeFloorplan = async (image: { data: string; mimeType: string }, isDemo: boolean = false): Promise<VirtualPlan> => {
    if (isDemo) return MOCK_VIRTUAL_PLAN;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            totalFloorArea: { type: Type.NUMBER },
            totalWallLength: { type: Type.NUMBER },
            rooms: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        type: { type: Type.STRING },
                        area: { type: Type.NUMBER },
                    }
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', 
            contents: {
                parts: [
                    { inlineData: { mimeType: image.mimeType, data: image.data } },
                    { text: "Analyze this floorplan. Identify rooms and areas. Return pure JSON." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        
        const result = cleanAndParseJSON(response.text);
        
        return {
            units: 'meters',
            totalFloorArea: result.totalFloorArea || 0,
            totalWallLength: result.totalWallLength || 0,
            rooms: result.rooms || [],
            walls: [],
            doors: [],
            windows: []
        };
    } catch (e) {
        console.warn("Floorplan analysis failed, using fallback.", e);
        return MOCK_VIRTUAL_PLAN;
    }
};

export const generateVisualizations = async (
    virtualPlan: VirtualPlan, 
    image: { data: string; mimeType: string },
    modelType: 'standard' | 'pro',
    isDemo: boolean,
    projectScope: 'full' | 'bathroom'
): Promise<{ isometricView: { data: string; mimeType: string; }; perspectiveView: { data: string; mimeType: string; }; }> => {
    if (isDemo) {
        return {
            isometricView: { data: MOCK_IMAGE_BASE64, mimeType: "image/gif" },
            perspectiveView: { data: MOCK_IMAGE_BASE64, mimeType: "image/gif" }
        };
    }

    try {
        const isoRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', 
            contents: {
                parts: [
                    { inlineData: { mimeType: image.mimeType, data: image.data } },
                    { text: "Generate an isometric 3D floorplan view. Modern interior style, high quality, white walls, wood floor." }
                ]
            },
            config: { imageConfig: { aspectRatio: "4:3" } }
        });
        
        let isoData = MOCK_IMAGE_BASE64;
        let isoMime = "image/png";
        if (isoRes.candidates?.[0]?.content?.parts) {
            for (const p of isoRes.candidates[0].content.parts) {
                if (p.inlineData) {
                    isoData = p.inlineData.data;
                }
            }
        }

        const persRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: image.mimeType, data: image.data } },
                    { text: "Generate a realistic interior perspective view of the living room. Modern design, warm lighting, 4k resolution." }
                ]
            },
            config: { imageConfig: { aspectRatio: "16:9" } }
        });

        let persData = MOCK_IMAGE_BASE64;
        if (persRes.candidates?.[0]?.content?.parts) {
            for (const p of persRes.candidates[0].content.parts) {
                if (p.inlineData) persData = p.inlineData.data;
            }
        }

        return {
            isometricView: { data: isoData, mimeType: isoMime },
            perspectiveView: { data: persData, mimeType: "image/png" }
        };
    } catch (e) {
        console.error("Image gen failed", e);
        return {
            isometricView: { data: MOCK_IMAGE_BASE64, mimeType: "image/gif" },
            perspectiveView: { data: MOCK_IMAGE_BASE64, mimeType: "image/gif" }
        };
    }
};

export const modifyImageStyle = async (
    baseImage: { data: string; mimeType: string }, 
    prompt: string, 
    virtualPlan: VirtualPlan | undefined,
    modelType: 'standard' | 'pro',
    isDemo: boolean | undefined
): Promise<{ data: string; mimeType: string; }> => {
    if (isDemo) return baseImage;

    try {
        const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: baseImage.mimeType, data: baseImage.data } },
                    { text: `Modify this image style: ${prompt}` }
                ]
            }
        });

        let newData = baseImage.data;
        if (res.candidates?.[0]?.content?.parts) {
            for (const p of res.candidates[0].content.parts) {
                if (p.inlineData) newData = p.inlineData.data;
            }
        }
        return { data: newData, mimeType: "image/png" };
    } catch (e) {
        console.error("Modify image failed", e);
        throw e;
    }
};

const generateDerivedWindowSets = async (details: ProjectDetails): Promise<WindowSet[]> => {
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                roomId: { type: Type.STRING },
                roomName: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['외창', '발코니창', '내창', '분합', '도어'] },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                area: { type: Type.NUMBER },
                qty: { type: Type.NUMBER },
                basis: { type: Type.STRING },
                ruleId: { type: Type.STRING },
                confidence: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] }
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: details.image.mimeType, data: details.image.data } },
                { text: `
                Analyze this floorplan and generate a list of window sets (derivedWindowSets) for chassis estimation.
                
                RULES:
                1. Split by room: Bedroom 1, Bedroom 2, Living Room, Kitchen, Balcony 1, etc.
                2. Identify types: '외창'(Outer), '발코니창'(Balcony), '내창'(Inner), '분합'(Divider), '도어'(Door).
                3. Dimensions: If visible on plan, use them. Otherwise, use template rules:
                   - Front Balcony: H=2200 (if floor < 15) or H=2350 (if floor >= 15).
                   - Bedroom: W=1800 (20py) or W=2400 (30py), H=1500.
                   - Kitchen: 500k fixed rule applies later, but estimate size (e.g. 1200x600).
                4. Return pure JSON.
                
                Project Area: ${details.area} py
                Floor: ${details.floor}
                ` }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return cleanAndParseJSON(response.text);
};

export const generateProjectPlan = async (
    details: ProjectDetails, 
    existingEstimate?: any, 
    isRefinement: boolean = false
): Promise<GeneratedPlan> => {
     if (details.isDemo) {
         return details.projectScope === 'bathroom' ? MOCK_BATHROOM_PLAN : MOCK_GENERATED_PLAN;
     }

    const flags = details.scopeFlags;
    const detailedScope = details.detailedScope;
    
    // FETCH CUSTOM GUIDELINES FROM ADMIN PANEL
    const adminGuidelines = getStoredReferenceGuidelines();
    
    // FETCH MATERIAL DB TO CHECK WORK LINKS
    const materialDB = getStoredMaterials();

    // Build a specific context string from detailed scopes to ensure AI sees it
    let scopeContext = "";
    if (detailedScope) {
        scopeContext += `
        SPECIFIC SCOPE DETAILS (MUST REFLECT IN ESTIMATE):
        - Tile: ${JSON.stringify(detailedScope.tile)}
        - Flooring: ${detailedScope.flooring?.layout} (${detailedScope.flooring?.specs?.maru || ''})
        - Tile Spec: ${detailedScope.flooring?.specs?.tile || 'standard'}
        - Sash(Windows): ${detailedScope.sash} (${detailedScope.sashCondition || ''})
        - Door: ${detailedScope.door?.mode}
        - Ceiling Method: ${detailedScope.ceiling?.method}
        - Ceiling Ply: ${detailedScope.ceiling?.isTwoPly ? '2-Ply (Double)' : '1-Ply (Single)'}
        - Molding: ${detailedScope.molding?.type}
        - Entry Door: ${detailedScope.entryDoor?.type}
        - Expansion: ${JSON.stringify(detailedScope.expansionConfig)}
        - Admin: ${JSON.stringify(detailedScope.admin)}
        - Wall Configuration: ${JSON.stringify(detailedScope.wallConfig)}
        `;
    }
    
    // NEW: Bathroom Specific Context
    if (details.projectScope === 'bathroom' && details.bathroomSpecifics) {
        scopeContext += `
        *** BATHROOM SPECIFIC DETAILS (CRITICAL) ***
        - Demolition: ${details.bathroomSpecifics.demolitionType} (Full waterproof implies 2-3 coat waterproofing)
        - Tile Size: ${details.bathroomSpecifics.tileSelection} (600x600 or larger = High labor cost, 600x1200 = Specialized labor)
        - Gendai Finish: ${details.bathroomSpecifics.gendaiFinish} (Jolly Cut = Miter saw labor, Art Marble = Material cost)
        - Wet Zone: ${details.bathroomSpecifics.wetZoneMethod}
        - Ceiling: ${details.bathroomSpecifics.ceilingType}
        - Fixtures: Toilet(${details.bathroomSpecifics.toiletType}), Basin(${details.bathroomSpecifics.washbasinType}), Faucet(${details.bathroomSpecifics.faucetGrade})
        - Add-ons: Ventilation(${details.bathroomSpecifics.ventilation}), Heating(${details.bathroomSpecifics.floorHeating ? 'YES' : 'NO'}), Elec(${JSON.stringify(details.bathroomSpecifics.electricalOptions)})
        `;
    }

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
             designConcept: {
                 type: Type.OBJECT,
                 properties: {
                     title: { type: Type.STRING },
                     description: { type: Type.STRING },
                     keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                 }
             },
             costEstimate: {
                 type: Type.ARRAY,
                 items: {
                     type: Type.OBJECT,
                     properties: {
                         category: { type: Type.STRING },
                         item: { type: Type.STRING },
                         quantity: { type: Type.NUMBER },
                         unit: { type: Type.STRING },
                         materialCost: { type: Type.NUMBER },
                         laborCost: { type: Type.NUMBER },
                         unitPrice: { type: Type.NUMBER },
                         totalPrice: { type: Type.NUMBER },
                         remarks: { type: Type.STRING }
                     }
                 }
             },
             confidence: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
             confidenceReason: { type: Type.STRING },
             correctionNeeded: { type: Type.STRING },
             budgetAnalysis: {
                 type: Type.OBJECT,
                 properties: {
                     isOverBudget: { type: Type.BOOLEAN },
                     statusMessage: { type: Type.STRING },
                     costSavingTips: { type: Type.ARRAY, items: { type: Type.STRING } }
                 }
             }
         }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
        You are an uncompromising, high-end interior construction Quantity Surveyor (QS) in South Korea.
        
        TASK: Generate a **Execution-Level Construction Estimate (실행 견적서)**.
        
        PROJECT DATA:
        ${JSON.stringify(details)}
        
        CLIENT MATERIAL DB (Representative SKUs):
        ${JSON.stringify(materialDB)}
        
        ${scopeContext}
        
        CRITICAL - CLIENT SPECIFIC GUIDELINES (JOHNSON GUIDELINES):
        ${adminGuidelines}
        
        *** PROCESS-TO-MATERIAL MAPPING RULES (STRICT) ***
        You must calculate costs by breaking down the Process into Materials + Labor.
        
        [Rule 1: Material Selection Logic]
        - If the user selects a Grade (e.g. High-end Toilet), find the matching SKU in the DB.
        - Check the 'workLink' property of that SKU.
        - YOU MUST ADD items listed in 'workLink.autoAddMaterials' to the estimate as separate items or sub-materials.
        - E.g. If 'Wall-hung Toilet' selected -> Add 'Concealed Tank System' + 'Wall Reinforcement Labor'.
        
        [Rule 2: Wall Creation / New Stud]
        IF wallConfig.structural == 'new_stud':
           - Add Material: "Lightweight Steel Studs (Runner/Stud)" or "Wood Framework".
           - Add Material: "Gypsum Board".
           - Add Labor: Carpentry (Higher hours).
           - IF soundProofing == true -> Add "Glass Wool" or "Sound Absorber".

        [Rule 3: High-End Paint Finish]
        IF wallConfig.finishType == 'paint' OR wallConfig.isAllPutty == true:
           - Base Layer: MUST assume "2-Ply Gypsum Board" (Double layer). Double the gypsum quantity.
           - Surface Prep: Add "All Putty (올퍼티)" labor (Painter).
           - Material: "Corner Beads" + "Mesh Tape" + "Handycoat".
           - Cost Impact: Approx 1.5x ~ 2.0x higher than wallpaper.

        [Rule 4: Minus Molding / Hidden Details]
        IF molding.type == 'minus' OR baseboard == 'minus_hidden' OR baseboard == 'none':
           - Material: Add "Minus System Profile (Aluminium)" or "PVC Divider".
           - Labor: Increase Carpentry Labor by 30% (Precision cutting required).
           - Labor: Increase Painter Labor (Touch-ups required at gaps).

        [Rule 5: High-End Bathroom & Tile Specs (Ardex/Large Tiles)]
        IF bathroom details exist OR tile grade is 'high_end' OR tileSpec is '800' or '600_1200':
           - **Grout/Silicone**: You MUST explicitly add "Ardex FG4 Grout" (아덱스 줄눈) and "Ardex SN+ Silicone" (아덱스 바이오 실리콘) as distinct material items or Upgrade Options.
           - **Large Tiles (800x800, 600x1200)**:
             - Material: Add "High-Performance Tile Adhesive (Ardex X18 or equivalent)".
             - Labor: Increase Tiler Labor by 1.5x (Large format difficulty + 2-person handling).
             - Add "Tile Leveling Clips (평탄클립)" as a subsidiary material.
        
        [Rule 6: Bathroom Specifics - Jolly Cut & Fixtures]
        IF bathroomSpecifics.gendaiFinish == 'jolly_cut':
           - Add "Jolly Cut Processing Labor" (졸리컷 가공비) to the Tile Labor section.
           - Note: This is highly skilled labor.
        IF bathroomSpecifics.ventilation == 'high_end_damper':
           - Select "Himfel Zeroc" or equivalent high-end fan.
        IF bathroomSpecifics.floorHeating == true:
           - Add "Floor Heating Extension" (난방 배관 연장) to Plumbing/Facilities.

        GENERAL RULES:
        1. **NO SUMMARIZATION**: Do NOT output "Bathroom Remodeling 1 EA". Break it down.
        2. **SEPARATE MATERIAL & LABOR**: 'materialCost' and 'laborCost' must be distinct.
        3. **LANGUAGE**: All Text MUST be in KOREAN (한국어).
        4. **PRICING**: Use realistic Seoul/Metro market prices for ${getRecentMarketPeriod()}.
        
        Return purely JSON data matching the schema.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const result = cleanAndParseJSON(response.text);
    
    // --- MODULE E: CHASSIS WORKFLOW INTEGRATION ---
    let chassisData: { estimate: any[], evidence: any } | null = null;
    if (flags?.sash) {
        let currentDetails = { ...details };
        if (!currentDetails.derivedWindowSets || currentDetails.derivedWindowSets.length === 0) {
            try {
                currentDetails.derivedWindowSets = await generateDerivedWindowSets(currentDetails);
            } catch (e) {
                console.warn("Failed to generate window sets via AI, using empty list.");
            }
        }
        chassisData = calculateChassisCosts(currentDetails);
    }

    // Explicitly sanitize critical fields to prevent UI crashes if AI omits them
    const sanitizedPlan: GeneratedPlan = {
        designConcept: result.designConcept || { title: "견적 분석 결과", description: "AI가 생성한 견적입니다.", keywords: [] },
        costEstimate: Array.isArray(result.costEstimate) ? result.costEstimate : [],
        budgetAnalysis: result.budgetAnalysis ? {
            isOverBudget: !!result.budgetAnalysis.isOverBudget,
            statusMessage: result.budgetAnalysis.statusMessage || "",
            costSavingTips: Array.isArray(result.budgetAnalysis.costSavingTips) ? result.budgetAnalysis.costSavingTips : []
        } : undefined,
        chassisEvidence: chassisData?.evidence,
        confidence: result.confidence || 'MEDIUM',
        confidenceReason: result.confidenceReason || '',
        correctionNeeded: result.correctionNeeded || '',
        projectSchedule: [],
        materialDetailSheet: [],
        materialBoardPrompts: undefined,
        masterTemplate: undefined,
        projectPackage: undefined
    };

    // Merge Chassis Estimate if exists
    if (chassisData) {
        // Remove any existing chassis items from AI to avoid duplication
        sanitizedPlan.costEstimate = sanitizedPlan.costEstimate.filter(item => 
            !item.category.includes("창호") && !item.category.includes("샷시") && !item.item.includes("샤시")
        );
        sanitizedPlan.costEstimate = [...sanitizedPlan.costEstimate, ...chassisData.estimate];
    }

    return sanitizedPlan;
};

// ... (Rest of the file remains same: generateMaterialDetails, generateProjectSchedule, generateMasterTemplate, generateProjectPackage, analyzeMarketPrices, analyzeLaborCosts, discoverAndRefreshMaterials) ...
export const generateMaterialDetails = async (details: ProjectDetails): Promise<{sheet: MaterialDetailItem[], prompts: PromptSet}> => {
    if (details.isDemo) {
        return { 
            sheet: details.projectScope === 'bathroom' ? MOCK_BATHROOM_PLAN.materialDetailSheet! : MOCK_GENERATED_PLAN.materialDetailSheet!,
            prompts: details.projectScope === 'bathroom' ? MOCK_BATHROOM_PLAN.materialBoardPrompts! : MOCK_GENERATED_PLAN.materialBoardPrompts!
        };
    }

    // LOAD LOCAL DATABASE
    const materialDB = getStoredMaterials();

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            sheet: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        category: { type: Type.STRING },
                        item: { type: Type.STRING },
                        image: { type: Type.STRING },
                        model: { type: Type.STRING },
                        spec: { type: Type.STRING },
                        color: { type: Type.STRING },
                        quantity: { type: Type.STRING },
                        price: { type: Type.NUMBER },
                        total: { type: Type.NUMBER },
                        link: { type: Type.STRING },
                        alternatives: { type: Type.STRING },
                        remarks: { type: Type.STRING },
                        qr: { type: Type.STRING },
                    }
                }
            },
            prompts: {
                type: Type.OBJECT,
                properties: {
                    base: { type: Type.STRING },
                    subTiles: { type: Type.STRING },
                    subFixtures: { type: Type.STRING },
                    views: {
                        type: Type.OBJECT,
                        properties: {
                            top: { type: Type.STRING },
                            elevation: { type: Type.STRING },
                            iso: { type: Type.STRING },
                            perspective: { type: Type.STRING },
                        }
                    },
                    video: { type: Type.STRING }
                }
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
        You are a construction purchasing manager (자재 담당자).
        Generate a **Raw Material BOM (Bill of Materials)** for this project.
        
        PROJECT CONTEXT: ${JSON.stringify(details)}
        
        *** IMPORTANT: CLIENT MATERIAL DATABASE ***
        Use items from this database WHENEVER POSSIBLE. Do not invent new brands if a suitable one exists here.
        DATABASE: ${JSON.stringify(materialDB)}
        
        CRITICAL INSTRUCTIONS:
        1. **MATCHING**: Match the user's specs (e.g., '600각 타일', '강마루') with the Database items.
           - If a match is found, use the 'brand', 'name', 'price', and 'link' from the database.
           - If no exact match, you may suggest a market standard item.
           
        2. **SHOPPING LINKS (STRICT)**: 
           - **DO NOT GENERATE FAKE URLs**. 
           - **ONLY** return the 'link' from the DATABASE if it exists.
           - If the item is NOT in the database, LEAVE THE LINK FIELD EMPTY ("").
           - The frontend will automatically generate search links for empty fields.
           
        3. **QUANTITY**: You MUST generate **at least 30 distinct items**. 
           - Do not group items. 
           - Include "Subsidiary Materials" (부자재) like adhesive, grout, silicon from the database.
           
        4. **SPECIFICITY**:
           - If Flooring is 'Maru', list "Maru Box", "Maru Glue (Hwangto)", "Skirting Board (Geol-le-baji)".
           - If Bathroom/Tile is high-end, you MUST list "Ardex FG4 Grout" and "Ardex Silicone".
           
        CRITICAL: All text output MUST be in KOREAN (한국어).
        
        Return pure JSON.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return cleanAndParseJSON(response.text) as {sheet: MaterialDetailItem[], prompts: PromptSet};
};

export const generateProjectSchedule = async (details: ProjectDetails): Promise<SchedulePhase[]> => {
    if (details.isDemo) {
        return details.projectScope === 'bathroom' ? MOCK_BATHROOM_PLAN.projectSchedule : MOCK_GENERATED_PLAN.projectSchedule;
    }

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            schedule: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        phase: { type: Type.STRING },
                        task: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        startDate: { type: Type.STRING },
                        endDate: { type: Type.STRING }
                    }
                }
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a detailed day-by-day or phase-by-phase construction schedule for: ${JSON.stringify(details)}.
        Ensure the logic of construction flow is correct (Demolition -> Sash -> Carpentry -> Electrical -> Tile -> Paint -> Floor -> Furniture).
        
        CRITICAL: All text output MUST be in KOREAN (한국어).
        
        Return pure JSON.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const result = cleanAndParseJSON(response.text);
    return result.schedule || [];
};

export const generateMasterTemplate = async (details: ProjectDetails, plan: GeneratedPlan): Promise<MasterTemplate> => {
    if (details.isDemo) return MOCK_GENERATED_PLAN.masterTemplate!;

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            inputSummary: {
                 type: Type.OBJECT,
                 properties: {
                     projectName: { type: Type.STRING },
                     clientName: { type: Type.STRING },
                     location: { type: Type.STRING },
                     bathroomType: { type: Type.STRING },
                     styleGrade: { type: Type.STRING },
                     dimensions: { type: Type.STRING },
                     selectedOptions: { type: Type.STRING },
                     confidence: { type: Type.STRING },
                     autoCorrections: { 
                         type: Type.OBJECT,
                         properties: {
                             inflation: { type: Type.STRING },
                             tileOverage: { type: Type.STRING },
                             exclusions: { type: Type.STRING },
                             waterproofing: { type: Type.STRING },
                         }
                     },
                     risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                 }
            },
            areaCalculations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, realArea: { type: Type.STRING }, overage: { type: Type.STRING }, orderArea: { type: Type.STRING }, basis: { type: Type.STRING }, remarks: { type: Type.STRING } } } },
            materialCosts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { category: { type: Type.STRING }, item: { type: Type.STRING }, spec: { type: Type.STRING }, quantity: { type: Type.STRING }, price: { type: Type.NUMBER }, total: { type: Type.NUMBER }, remarks: { type: Type.STRING } } } },
            laborCosts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, task: { type: Type.STRING }, basis: { type: Type.STRING }, quantity: { type: Type.NUMBER }, price: { type: Type.NUMBER }, total: { type: Type.NUMBER }, remarks: { type: Type.STRING } } } },
            overheadCosts: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { item: { type: Type.STRING }, basis: { type: Type.STRING }, quantity: { type: Type.NUMBER }, price: { type: Type.NUMBER }, total: { type: Type.NUMBER }, remarks: { type: Type.STRING } } } },
            totalSummary: {
                type: Type.OBJECT,
                properties: {
                    materialTotal: { type: Type.NUMBER },
                    laborTotal: { type: Type.NUMBER },
                    overheadTotal: { type: Type.NUMBER },
                    subTotal: { type: Type.NUMBER },
                    inflationFactor: { type: Type.NUMBER },
                    finalTotal: { type: Type.NUMBER },
                    vatNote: { type: Type.STRING },
                    checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a summary report from this plan: ${JSON.stringify(plan)}. 
        CRITICAL: All text output MUST be in KOREAN (한국어).
        Return pure JSON.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return cleanAndParseJSON(response.text) as MasterTemplate;
};

export const generateProjectPackage = async (details: ProjectDetails): Promise<ProjectPackage> => {
     if (details.isDemo) return MOCK_GENERATED_PLAN.projectPackage!;

     const schema: Schema = {
         type: Type.OBJECT,
         properties: {
             folderStructure: { type: Type.ARRAY, items: { type: Type.STRING } },
             checklist: {
                 type: Type.OBJECT,
                 properties: {
                     dimensions: { type: Type.OBJECT, properties: { confidence: { type: Type.NUMBER }, ceilingHeightChecked: { type: Type.BOOLEAN }, dimensionsInputChecked: { type: Type.BOOLEAN }, specialElementsChecked: { type: Type.BOOLEAN } } },
                     rules: { type: Type.OBJECT, properties: { barrisolAdded: { type: Type.BOOLEAN }, jollyCutChecked: { type: Type.BOOLEAN }, ventilationHeatingMatched: { type: Type.BOOLEAN }, vanityCoeffApplied: { type: Type.BOOLEAN }, bathtubOptionReflected: { type: Type.BOOLEAN } } },
                     quality: { type: Type.OBJECT, properties: { warrantyIncluded: { type: Type.BOOLEAN }, inflationApplied: { type: Type.BOOLEAN }, priceRiskWarned: { type: Type.BOOLEAN } } },
                     deliverables: { type: Type.OBJECT, properties: { estimateExists: { type: Type.BOOLEAN }, materialSheetExists: { type: Type.BOOLEAN }, boardExists: { type: Type.BOOLEAN }, promptsExist: { type: Type.BOOLEAN }, summaryExists: { type: Type.BOOLEAN } } },
                 }
             },
             readme: { type: Type.STRING },
             sendingRules: { type: Type.ARRAY, items: { type: Type.STRING } },
         }
     };

     const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: `Generate package info for: ${JSON.stringify(details)}. 
         CRITICAL: All text output MUST be in KOREAN (한국어).
         Return pure JSON.`,
         config: {
             responseMimeType: "application/json",
             responseSchema: schema
         }
     });

     return cleanAndParseJSON(response.text) as ProjectPackage;
};

export const analyzeMarketPrices = async (currentPrices: UnitPrice[]): Promise<PriceSuggestion[]> => {
    const referencePeriod = getRecentMarketPeriod();
    
    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['UPDATE', 'NEW'] },
                category: { type: Type.STRING },
                item: { type: Type.STRING },
                unit: { type: Type.STRING },
                currentPrice: { type: Type.NUMBER },
                suggestedPrice: { type: Type.NUMBER },
                reason: { type: Type.STRING },
                description: { type: Type.STRING },
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
        You are a top-tier construction Quantity Surveyor (QS) in South Korea.
        
        CONTEXT:
        - Current Date: ${new Date().toLocaleDateString()}
        - Reference Market Data: ${referencePeriod} (latest actual market data)
        
        Review the following unit price list for a residential renovation project.

        Input Data: ${JSON.stringify(currentPrices)}

        TASKS:
        1. **Price Check (UPDATE):** Compare against actual South Korean market rates for **${referencePeriod}**. 
           - Focus on REAL transaction prices (field costs), not just official government estimates.
           - Suggest updates if prices are unrealistic (too low or too high).
        2. **Gap Analysis (NEW):** Identify MISSING items that are essential for a complete estimate. 
           - If 'Demolition' exists, check if 'Waste Disposal' (폐기물 처리) is present. If not, suggest it.
           - If 'Tile' exists, check if 'Subsidiary Materials' (부자재: 본드, 줄눈) is present.
           - If 'Wallpaper' exists, check if 'Base Work' (초배/퍼티) is included or separate.
           - Suggest commonly missed items like 'Elevator Protection' (엘리베이터 보양), 'Permit Fees' (행위허가 대행).

        INSTRUCTIONS:
        - For missing items, set 'type' to 'NEW'.
        - Set 'currentPrice' to 0 for NEW items.
        - Provide a specific 'reason' mentioning the period (e.g., "${referencePeriod} 기준 인건비 상승 반영", "필수 공정 누락").
        - All text must be in KOREAN (한국어).

        Return pure JSON matching the schema.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return cleanAndParseJSON(response.text) as PriceSuggestion[];
};

export const analyzeLaborCosts = async (currentLabor: Record<string, number>): Promise<LaborSuggestion[]> => {
    const referencePeriod = getRecentMarketPeriod();

    const schema: Schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                key: { type: Type.STRING },
                currentPrice: { type: Type.NUMBER },
                suggestedPrice: { type: Type.NUMBER },
                reason: { type: Type.STRING },
            }
        }
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
        You are a construction labor market expert in South Korea.
        
        CONTEXT:
        - Current Date: ${new Date().toLocaleDateString()}
        - Reference Market Data: ${referencePeriod} (latest actual market data)

        Analyze the following DAILY WAGES (Day Rates / 일당).
        
        Input Wages: ${JSON.stringify(currentLabor)}
        
        Reflect recent trends from ${referencePeriod}:
        - Tiler (Tile Expert) wages have increased significantly due to shortage.
        - Carpenter wages are stable but high.
        - General labor (Demolition/Helper) costs.

        For each key, provide a suggested price (or keep same) and a reason citing the trend in ${referencePeriod}.
        
        Output JSON matching schema.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    return cleanAndParseJSON(response.text) as LaborSuggestion[];
};

export const discoverAndRefreshMaterials = async (
    currentDB: MaterialDatabaseItem[], 
    targetCategories: string[] = [], // Empty means all
    mode: 'scan_and_update' | 'verify_only' = 'scan_and_update'
): Promise<{
    updates: MaterialDatabaseItem[],
    newItems: MaterialDatabaseItem[]
}> => {
    const referencePeriod = getRecentMarketPeriod();
    const isTargeted = targetCategories.length > 0;
    
    // Define the Item Schema
    const itemSchema = {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            subCategory: { type: Type.STRING },
            grade: { type: Type.STRING }, // Force AI to set grade
            brand: { type: Type.STRING },
            name: { type: Type.STRING },
            spec: { type: Type.STRING },
            unit: { type: Type.STRING },
            price: { type: Type.NUMBER },
            link: { type: Type.STRING },
            laborRef: { type: Type.STRING },
            reason: { type: Type.STRING, description: "Detailed reason for price change or why this item is new" }
        }
    };

    const schema: Schema = {
        type: Type.OBJECT,
        properties: {
            updates: {
                type: Type.ARRAY,
                items: itemSchema,
                description: "Existing items with updated prices or info"
            },
            newItems: {
                type: Type.ARRAY,
                items: itemSchema,
                description: "Completely new items to add to the DB"
            }
        }
    };
    
    // Filter input DB if targeted to reduce token context and focus AI
    const relevantDB = isTargeted 
        ? currentDB.filter(item => targetCategories.some(c => item.category.includes(c) || item.subCategory.includes(c)))
        : currentDB;

    // Create prompt instructions based on mode
    let taskInstruction = "";
    if (mode === 'scan_and_update') {
        taskInstruction = `
        1. **REVIEW & VERIFY (Update)**: Check the prices of the ${relevantDB.length} provided items in '${targetCategories.join(', ')}'. 
           - **STRICT ANTI-INFLATION RULE**: Do NOT assume prices increased. If the price is stable, DO NOT add it to 'updates'.
           - Only update if you are confident the price has changed by >5% (Up OR Down) in the Korean market (${referencePeriod}).
           - Provide a valid reason (e.g., "Discounted model", "Raw material drop", "2024 Price Hike").
           
        2. **DISCOVER (New - DIVERSIFY)**: Find exactly 3 **COMPETITOR or ALTERNATIVE** items for '${targetCategories.join(', ')}'.
           - **Brand Diversity**: If the list has 'KCC', find 'Younglim' or 'Yesol'. If 'American Standard', find 'Daelim' or 'TOTO'.
           - **Spec Diversity**: If the list has '600x600 Tile', find '600x1200' or '400x800'.
           - Assign a unique ID starting with 'new_'.
        `;
    } else {
        taskInstruction = `
        1. **VERIFY ONLY (Update)**: Strictly check the prices of the provided items in '${targetCategories.join(', ')}' against ${referencePeriod} market data.
           - **STRICT ANTI-INFLATION RULE**: Do NOT assume prices increased.
           - DO NOT generate new items. Keep 'newItems' array empty.
           - Only add to 'updates' if the price deviation is significant (>10%).
        `;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `
        You are a construction material sourcing expert for the South Korean market.
        
        TARGET SCOPE: ${isTargeted ? `Refocus exclusively on these categories: [${targetCategories.join(', ')}]` : "All Categories"}
        MODE: ${mode}
        
        TASK:
        ${taskInstruction}
           
        INPUT DB (Targeted Subset): ${JSON.stringify(relevantDB)}
        
        *** CRITICAL RULES FOR CARPENTRY & WOOD (목공) ***
        - **Differentiate by Thickness (Spec)**: Items with different thicknesses (e.g., MDF 9T vs MDF 18T, Plywood 4.8T vs 11.5T) are DIFFERENT items. 
        - Do NOT merge them. You MUST scan and list common thicknesses used in Korean interior (4.8T, 9T, 12T, 15T, 18T).
        - **Material Types**: Clearly distinguish between MDF, PB (Particle Board), and Plywood (일반합판, 방수합판, 자작합판).
        
        INSTRUCTIONS:
        - Use external knowledge of South Korean interior material prices (e.g. Younglim, KCC, LX Z:IN, American Standard).
        - **Grade**: MUST set to 'budget', 'standard', or 'high_end'.
        - **WorkLink**: Suggest a labor type if applicable (e.g. 'flooring', 'tiler').
        - **Price Logic**: Prices can be FLAT or LOWER. Do not blindly increase.
        
        Return pure JSON with 'updates' and 'newItems' arrays.
        `,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });

    const parsed = cleanAndParseJSON(response.text);
    // SAFE RETURN: Ensure arrays exist even if AI returns undefined/malformed data
    return {
        updates: parsed.updates || [],
        newItems: parsed.newItems || []
    };
};

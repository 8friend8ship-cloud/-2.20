
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UserInputForm } from './components/UserInputForm';
import { ResultsDisplay } from './components/ResultsDisplay';
import { LoadingSpinner } from './components/LoadingSpinner'; // Keep for small loads inside components
import { AdSenseLoadingOverlay } from './components/AdSenseLoadingOverlay'; // NEW
import { AdminPanel } from './components/AdminPanel'; // NEW
import { DesignStudio } from './components/DesignStudio';
import { 
    generateProjectPlan, 
    generateVisualizations, 
    analyzeFloorplan, 
    modifyImageStyle,
    generateMasterTemplate,
    generateMaterialDetails,
    generateProjectPackage,
    generateProjectSchedule, // NEW Import
    createVirtualPlanFromDimensions
} from './services/geminiService';
import { AppState, ProjectDetails, GeneratedPlan } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.INPUT);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [isometricView, setIsometricView] = useState<{ data: string; mimeType: string; } | null>(null);
  const [perspectiveView, setPerspectiveView] = useState<{ data: string; mimeType: string; } | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModifying, setIsModifying] = useState<boolean>(false);
  
  // Loading States for partial updates
  const [loadingSection, setLoadingSection] = useState<'materials' | 'package' | 'report' | 'schedule' | null>(null);

  // Admin Panel State
  const [showAdmin, setShowAdmin] = useState(false);
  
  const processProject = async (details: ProjectDetails) => {
      setProjectDetails(details);
      setError(null);
      setGeneratedPlan(null); // Reset plan
      
      const isDemo = details.isDemo === true;
      const skip3D = !details.wants3DGeneration; 

      try {
        setAppState(AppState.ANALYZING_PLAN);
        
        let virtualPlan;
        
        // Handle "Dimensions Only" mode for Bathroom
        if (details.projectScope === 'bathroom' && 
            details.bathroomSpecifics?.useDimensionsOnly && 
            details.bathroomSpecifics.width && 
            details.bathroomSpecifics.depth) {
            
            // Skip AI analysis and create a virtual plan from dimensions directly
            virtualPlan = createVirtualPlanFromDimensions(
                details.bathroomSpecifics.width, 
                details.bathroomSpecifics.depth,
                'BATHROOM'
            );
            // Artificial delay to mimic processing feel if desired, or just proceed immediately
            if (isDemo) await new Promise(resolve => setTimeout(resolve, 1500)); 

        } else {
            // Standard AI Analysis from Image
            try {
                virtualPlan = await analyzeFloorplan(details.image, isDemo);
            } catch (analysisError) {
                console.warn("AI Floorplan Analysis failed, falling back to area-based estimation.", analysisError);
                const areaM2 = details.area * 3.3058;
                const side = Math.sqrt(areaM2);
                const roomType = details.projectScope === 'bathroom' ? 'BATHROOM' : 'LIVING_ROOM';
                virtualPlan = createVirtualPlanFromDimensions(side, side, roomType);
            }
        }

        const detailsWithPlan = { ...details, virtualPlan };
        setProjectDetails(detailsWithPlan);

        if (skip3D) {
            // New Workflow: Go directly to Estimate (Step 1)
            await handleFinalizeLogic(detailsWithPlan);
        } else {
            setAppState(AppState.GENERATING_VIEWS);
            const { isometricView, perspectiveView } = await generateVisualizations(
                virtualPlan, 
                details.image,
                details.modelType,
                isDemo,
                details.projectScope
            );
            
            setIsometricView(isometricView);
            setPerspectiveView(perspectiveView);
            setAppState(AppState.DESIGN_STUDIO);
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`AI 처리 중 오류가 발생했습니다: ${errorMessage}`);
        setAppState(AppState.INPUT);
        console.error(err);
      }
  };

  // Step 1: Generate Basic Estimate Only
  const handleFinalizeLogic = async (details: ProjectDetails) => {
      setAppState(AppState.FINALIZING);
      try {
        // 타임아웃을 60초에서 120초로 연장
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI 연산량이 많아 응답 시간이 초과되었습니다. 다시 시도해주세요.")), 120000)
        );

        const logicPromise = generateProjectPlan(details, undefined, false);

        // Race the logic against the timeout
        const basicPlan = await Promise.race([logicPromise, timeoutPromise]) as GeneratedPlan;
        
        setGeneratedPlan(basicPlan);
        setAppState(AppState.RESULTS);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`견적 생성 중 오류가 발생했습니다: ${errorMessage}`);
        setAppState(AppState.INPUT);
      }
  };

  const handleInitialSubmit = useCallback(async (details: ProjectDetails) => {
    await processProject(details);
  }, []);

  const handleStyleModification = useCallback(async (viewToModify: 'iso' | 'pers', prompt: string) => {
    const baseImage = viewToModify === 'iso' ? isometricView : perspectiveView;
    if (!projectDetails || !baseImage) return;

    setIsModifying(true);
    setError(null);
    try {
        const modifiedImage = await modifyImageStyle(
            baseImage, 
            prompt, 
            projectDetails.virtualPlan,
            projectDetails.modelType,
            projectDetails.isDemo
        );
        if (viewToModify === 'iso') {
            setIsometricView(modifiedImage);
        } else {
            setPerspectiveView(modifiedImage);
        }
    } catch (err) {
        setError('스타일 변경에 실패했습니다. 요청을 더 명확하게 하거나 다시 시도해주세요.');
        console.error(err);
    } finally {
        setIsModifying(false);
    }
  }, [projectDetails, isometricView, perspectiveView]);

  const handleFinalizeDesign = useCallback(async () => {
    if (!projectDetails) return;
    
    const finalDetails = { 
      ...projectDetails, 
      isometricView: isometricView || undefined,
      perspectiveView: perspectiveView || undefined 
    };
    setProjectDetails(finalDetails);

    await handleFinalizeLogic(finalDetails);

  }, [projectDetails, isometricView, perspectiveView]);
  
  // --- Partial Loaders (On Demand - Deep Dive) ---

  const handleLoadMaterials = async () => {
      if (!projectDetails || !generatedPlan) return;
      setLoadingSection('materials');
      try {
          const { sheet, prompts } = await generateMaterialDetails(projectDetails);
          setGeneratedPlan(prev => prev ? { ...prev, materialDetailSheet: sheet, materialBoardPrompts: prompts } : null);
      } catch (e) {
          alert("자재 상세 분석에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
          setLoadingSection(null);
      }
  };
  
  const handleLoadSchedule = async () => {
      if (!projectDetails || !generatedPlan) return;
      setLoadingSection('schedule');
      try {
          const schedule = await generateProjectSchedule(projectDetails);
          setGeneratedPlan(prev => prev ? { ...prev, projectSchedule: schedule } : null);
      } catch (e) {
          alert("상세 공정표 생성에 실패했습니다.");
      } finally {
          setLoadingSection(null);
      }
  };

  const handleLoadPackage = async () => {
      if (!projectDetails || !generatedPlan) return;
      setLoadingSection('package');
      try {
           const projectPackage = await generateProjectPackage(projectDetails);
           setGeneratedPlan(prev => prev ? { ...prev, projectPackage } : null);
      } catch (e) {
          alert("패키지 데이터를 생성하는데 실패했습니다.");
      } finally {
          setLoadingSection(null);
      }
  };

  const handleLoadMasterTemplate = async () => {
      if (!projectDetails || !generatedPlan) return;
      setLoadingSection('report');
      try {
          const masterTemplate = await generateMasterTemplate(projectDetails, generatedPlan);
          setGeneratedPlan(prev => prev ? { ...prev, masterTemplate } : null);
      } catch (e) {
          alert("종합 리포트를 생성하는데 실패했습니다.");
      } finally {
          setLoadingSection(null);
      }
  };

  const handleReset = useCallback(() => {
    setAppState(AppState.INPUT);
    setProjectDetails(null);
    setGeneratedPlan(null);
    setIsometricView(null);
    setPerspectiveView(null);
    setError(null);
    setLoadingSection(null);
  }, []);

  const renderContent = () => {
    const isBathroomMode = projectDetails?.projectScope === 'bathroom';

    switch (appState) {
      case AppState.INPUT:
        return <UserInputForm onSubmit={handleInitialSubmit} error={error} />;
        
      case AppState.ANALYZING_PLAN:
        return (
          <AdSenseLoadingOverlay 
            message={isBathroomMode ? "욕실 구조 및 치수 분석 중..." : "전체 공간 구조 분석 및 객체 인식 중..."}
            subMessage={projectDetails?.isDemo 
                ? "데모 데이터를 로딩하고 있습니다." 
                : "AI가 도면을 정밀하게 분석하여 벽체, 문, 창문을 식별하고 있습니다."}
          />
        );

      case AppState.GENERATING_VIEWS:
        return (
          <AdSenseLoadingOverlay 
            message="AI 인테리어 디자인 생성 중..."
            subMessage="선택하신 스타일과 자재를 적용하여 3D 시각화 자료(아이소/투시도)를 그리고 있습니다."
          />
        );

      case AppState.DESIGN_STUDIO:
        if (projectDetails && isometricView && perspectiveView) {
             return (
              <DesignStudio
                projectDetails={projectDetails}
                isometricView={isometricView}
                perspectiveView={perspectiveView}
                onModifyStyle={handleStyleModification}
                onFinalize={handleFinalizeDesign}
                isModifying={isModifying}
                onBack={handleReset}
                error={error}
              />
            );
        }
        return <LoadingSpinner />;

       case AppState.FINALIZING:
        return (
           <AdSenseLoadingOverlay 
            message="최종 상세 견적 산출 중..."
            subMessage="AI가 각 공정별 물량을 계산하고 시장 단가를 대입하여 견적서를 작성하고 있습니다. (약 30~60초 소요)"
          />
        );

      case AppState.RESULTS:
        return generatedPlan && projectDetails && (
          <ResultsDisplay 
            plan={generatedPlan} 
            details={projectDetails}
            onReset={handleReset}
            onLoadMasterTemplate={handleLoadMasterTemplate}
            onLoadMaterials={handleLoadMaterials}
            onLoadSchedule={handleLoadSchedule}
            onLoadPackage={handleLoadPackage}
            loadingSection={loadingSection}
          />
        );
      default:
        return <UserInputForm onSubmit={handleInitialSubmit} error={error} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-800">
      <Header onOpenAdmin={() => setShowAdmin(true)} />
      <main className="flex-grow container mx-auto px-4 py-8 relative">
        {renderContent()}
      </main>
      <Footer />
      {showAdmin && (
        <AdminPanel 
            onClose={() => setShowAdmin(false)} 
            initialAddress={projectDetails?.address} 
        />
      )}
    </div>
  );
};

export default App;

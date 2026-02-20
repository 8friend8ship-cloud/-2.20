
import React, { useState, useEffect, useRef } from 'react';
import { 
    getStoredPriceTable, savePriceTable, 
    getStoredLaborData, saveLaborData, 
    getStoredReferenceGuidelines, saveReferenceGuidelines,
    getStoredContractors, saveContractors,
    getStoredMaterials, saveMaterials
} from '../utils/adminStorage';
import { analyzeMarketPrices, analyzeLaborCosts, discoverAndRefreshMaterials } from '../services/geminiService';
import { PriceSuggestion, VerifiedContractor, UnitPrice, LaborSuggestion, MaterialDatabaseItem } from '../types';

interface AdminPanelProps {
  onClose: () => void;
  initialAddress?: string;
}

// Map English keys to Korean labels for Labor
const LABOR_LABEL_MAP: Record<string, string> = {
    carpenter_foreman: '🔨 목공 반장 (Foreman)',
    carpenter_member: '🔨 목공 팀원',
    tiler_expert: '🧱 타일 전공 (Expert)',
    tiler_assistant: '🧱 타일 조공',
    demolition: '🏗️ 철거공',
    general: '🧹 일반 잡부 (조공)',
    electrician: '💡 전기 기술자',
    wallpaper: '📜 도배사',
    flooring: '🪵 바닥(마루) 시공자'
};

// UI Tabs (Display Name)
const CATEGORY_TABS = [
    '전체', '공통', '철거', '목공', '천장', 
    '전기', '설비', '욕실', '타일', 
    '바닥', '벽', '페인트', '필름', 
    '샤시', '도어', '주방/가구', '기타'
];

// Mapping Logic: Tab Name -> Actual DB Category/SubCategory Keywords
const CATEGORY_MAPPING: Record<string, string[]> = {
    '전체': [],
    '공통': ['공통', '가설', '양중', '보양'],
    '철거': ['철거'],
    '목공': ['목공', '단열', '가벽', '목자재'],
    '천장': ['천장', '몰딩', '덴조'], 
    '전기': ['전기', '조명', '배선'],
    '설비': ['설비', '방수', '배관', '환기'],
    '욕실': ['욕실', '도기', '수전', '악세사리'],
    '타일': ['타일'], 
    '바닥': ['바닥', '마루', '장판', '데코타일'],
    '벽': ['벽', '도배'], 
    '페인트': ['페인트', '도장', '탄성'], 
    '필름': ['필름', '시트', '인테리어 필름'], 
    '샤시': ['샤시', '샷시', '창호', '유리'], 
    '도어': ['도어', '문', '중문', '방문'],
    '주방/가구': ['주방', '가구', '싱크대', '붙박이', '신발장'],
    '기타': ['기타', '부자재', '잡자재']
};

interface MergeStats {
    newMaterialsCount: number;
    newPricesCount: number;
    newContractorsCount: number;
    totalNew: number;
    details: string[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, initialAddress }) => {
  const [activeTab, setActiveTab] = useState<'materials' | 'prices' | 'labor' | 'guidelines' | 'contractors'>('materials'); 
  
  // Price Data
  const [priceTable, setPriceTable] = useState<UnitPrice[]>([]);
  const [isAnalyzingPrices, setIsAnalyzingPrices] = useState(false);
  const [priceSuggestions, setPriceSuggestions] = useState<PriceSuggestion[]>([]);

  // Labor Data
  const [laborData, setLaborData] = useState<any>(null);
  const [isAnalyzingLabor, setIsAnalyzingLabor] = useState(false);
  const [laborSuggestions, setLaborSuggestions] = useState<LaborSuggestion[]>([]);

  // Guidelines
  const [guidelines, setGuidelines] = useState('');

  // Contractors
  const [contractors, setContractors] = useState<VerifiedContractor[]>([]);
  const [editingContractor, setEditingContractor] = useState<VerifiedContractor | null>(null);
  
  // Materials
  const [materials, setMaterials] = useState<MaterialDatabaseItem[]>([]);
  const [isUpdatingMaterials, setIsUpdatingMaterials] = useState(false);
  const [activeMaterialCategory, setActiveMaterialCategory] = useState<string>('전체'); 
  
  // Scan Config State
  const [showScanModal, setShowScanModal] = useState(false);
  const [selectedScanCategories, setSelectedScanCategories] = useState<Set<string>>(new Set());
  const [scanMode, setScanMode] = useState<'scan_and_update' | 'verify_only'>('scan_and_update');

  // Staging Area for AI Material Updates
  const [pendingMaterialUpdates, setPendingMaterialUpdates] = useState<{ updates: MaterialDatabaseItem[], newItems: MaterialDatabaseItem[] } | null>(null);
  const [selectedUpdates, setSelectedUpdates] = useState<Set<string>>(new Set());
  const [selectedNewItems, setSelectedNewItems] = useState<Set<string>>(new Set());

  // Save Feedback States
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Backup & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [restoreModalData, setRestoreModalData] = useState<any | null>(null);
  const [mergeStats, setMergeStats] = useState<MergeStats | null>(null);

  useEffect(() => {
    setPriceTable(getStoredPriceTable());
    setLaborData(getStoredLaborData());
    setGuidelines(getStoredReferenceGuidelines());
    setContractors(getStoredContractors());
    setMaterials(getStoredMaterials());
    
    if (initialAddress) {
        setActiveTab('contractors');
    }

    document.body.style.overflow = 'hidden';
    return () => {
        document.body.style.overflow = 'unset';
    };
  }, [initialAddress]);

  // --- Backup (Export) Logic with "Save As" Fallback ---
  const handleExportData = async () => {
      const backupData = {
          timestamp: new Date().toISOString(),
          version: '1.0',
          data: {
              materials,
              priceTable,
              laborData,
              guidelines,
              contractors
          }
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0,4);
      const fileName = `johnson_backup_${dateStr}_${timeStr}.json`;

      const triggerLegacyDownload = () => {
          const blob = new Blob([dataStr], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      };

      // @ts-ignore
      const supportsFileSystemAccess = 'showSaveFilePicker' in window;

      if (supportsFileSystemAccess) {
          try {
              // @ts-ignore
              const handle = await window.showSaveFilePicker({
                  suggestedName: fileName,
                  types: [{
                      description: 'JSON Files',
                      accept: { 'application/json': ['.json'] },
                  }],
              });
              const writable = await handle.createWritable();
              await writable.write(dataStr);
              await writable.close();
              alert("✅ 선택하신 위치에 백업 파일이 저장되었습니다.");
              return; 
          } catch (pickerError: any) {
              if (pickerError.name === 'AbortError') return;
              console.warn("File System API failed, falling back:", pickerError);
          }
      }

      triggerLegacyDownload();
      if (!supportsFileSystemAccess) {
          alert(`✅ 백업 파일이 '다운로드' 폴더에 자동 저장되었습니다.\n\n(현재 브라우저 보안 정책상 '저장 위치 선택' 창을 띄울 수 없어 자동 저장됩니다.)`);
      } else {
          alert("✅ 백업 파일이 저장되었습니다.");
      }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileRead = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const json = JSON.parse(e.target?.result as string);
              if (!json.timestamp || !json.data) {
                  throw new Error("Invalid format");
              }
              setRestoreModalData(json);
              setMergeStats(null); 
          } catch (error) {
              console.error(error);
              alert("❌ 파일 형식이 올바르지 않습니다. 존슨 백업 파일이 맞는지 확인해주세요.");
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsText(file);
  };

  const calculateMergeStats = (incoming: any): MergeStats => {
      let newMaterialsCount = 0;
      let newPricesCount = 0;
      let newContractorsCount = 0;
      const details: string[] = [];

      if (incoming.materials) {
          const currentIds = new Set(materials.map(m => m.id));
          const newItems = incoming.materials.filter((m: MaterialDatabaseItem) => !currentIds.has(m.id));
          newMaterialsCount = newItems.length;
          if (newMaterialsCount > 0) details.push(`자재 리스트: ${newMaterialsCount}개 추가`);
      }

      if (incoming.priceTable) {
          const currentKeys = new Set(priceTable.map(p => `${p.category}_${p.item}`));
          const newItems = incoming.priceTable.filter((p: UnitPrice) => !currentKeys.has(`${p.category}_${p.item}`));
          newPricesCount = newItems.length;
          if (newPricesCount > 0) details.push(`단가표 항목: ${newPricesCount}개 추가`);
      }

      if (incoming.contractors) {
          const currentIds = new Set(contractors.map(c => c.id));
          const newItems = incoming.contractors.filter((c: VerifiedContractor) => !currentIds.has(c.id));
          newContractorsCount = newItems.length;
          if (newContractorsCount > 0) details.push(`시공자 DB: ${newContractorsCount}명 추가`);
      }

      return {
          newMaterialsCount,
          newPricesCount,
          newContractorsCount,
          totalNew: newMaterialsCount + newPricesCount + newContractorsCount,
          details
      };
  };

  const handleRestoreOption = (mode: 'overwrite' | 'merge') => {
      if (!restoreModalData || !restoreModalData.data) return;
      const incoming = restoreModalData.data;

      if (mode === 'overwrite') {
          if(confirm("⚠️ 경고: 현재 데이터를 모두 삭제하고 백업 파일 내용으로 덮어씁니다. 계속하시겠습니까?")) {
              performOverwrite(incoming);
          }
      } else {
          const stats = calculateMergeStats(incoming);
          setMergeStats(stats);
      }
  };

  const performOverwrite = (incoming: any) => {
      try {
          if (incoming.materials) { setMaterials(incoming.materials); saveMaterials(incoming.materials); }
          if (incoming.priceTable) { setPriceTable(incoming.priceTable); savePriceTable(incoming.priceTable); }
          if (incoming.laborData) { setLaborData(incoming.laborData); saveLaborData(incoming.laborData); }
          if (incoming.guidelines) { setGuidelines(incoming.guidelines); saveReferenceGuidelines(incoming.guidelines); }
          if (incoming.contractors) { setContractors(incoming.contractors); saveContractors(incoming.contractors); }
          alert("✅ 모든 데이터가 백업 파일 내용으로 덮어씌워졌습니다.");
          setRestoreModalData(null);
      } catch (e) {
          alert("복원 중 오류 발생");
      }
  };

  const performMerge = () => {
      if (!restoreModalData || !restoreModalData.data) return;
      const incoming = restoreModalData.data;

      try {
          let addedCount = 0;
          if (incoming.materials) {
              const currentIds = new Set(materials.map(m => m.id));
              const newItems = incoming.materials.filter((m: MaterialDatabaseItem) => !currentIds.has(m.id));
              if (newItems.length > 0) {
                  const merged = [...materials, ...newItems];
                  setMaterials(merged);
                  saveMaterials(merged);
                  addedCount += newItems.length;
              }
          }
          if (incoming.priceTable) {
              const currentKeys = new Set(priceTable.map(p => `${p.category}_${p.item}`));
              const newItems = incoming.priceTable.filter((p: UnitPrice) => !currentKeys.has(`${p.category}_${p.item}`));
              if (newItems.length > 0) {
                  const merged = [...priceTable, ...newItems];
                  setPriceTable(merged);
                  savePriceTable(merged);
                  addedCount += newItems.length;
              }
          }
          if (incoming.contractors) {
              const currentIds = new Set(contractors.map(c => c.id));
              const newItems = incoming.contractors.filter((c: VerifiedContractor) => !currentIds.has(c.id));
              if (newItems.length > 0) {
                  const merged = [...contractors, ...newItems];
                  setContractors(merged);
                  saveContractors(merged);
                  addedCount += newItems.length;
              }
          }
          
          alert(`✅ 병합 완료! 총 ${addedCount}개의 항목이 성공적으로 추가되었습니다.`);
          setRestoreModalData(null);
          setMergeStats(null);
      } catch (e) {
          alert("병합 중 오류 발생");
      }
  };

  const handleSaveWithFeedback = async (action: () => void) => {
      setSaveStatus('saving');
      await new Promise(r => setTimeout(r, 600)); 
      action();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleSavePrices = () => handleSaveWithFeedback(() => savePriceTable(priceTable));
  const handleSaveLabor = () => handleSaveWithFeedback(() => saveLaborData(laborData));
  const handleSaveGuidelines = () => handleSaveWithFeedback(() => saveReferenceGuidelines(guidelines));
  const handleSaveContractors = () => handleSaveWithFeedback(() => saveContractors(contractors));
  const handleSaveMaterials = () => handleSaveWithFeedback(() => saveMaterials(materials));

  const handleAnalyzePrices = async () => {
    setIsAnalyzingPrices(true);
    try {
        const result = await analyzeMarketPrices(priceTable);
        setPriceSuggestions(result);
    } catch (e) {
        alert('시장 분석 중 오류가 발생했습니다.');
    } finally {
        setIsAnalyzingPrices(false);
    }
  };

  const handleAnalyzeLabor = async () => {
    if (!laborData) return;
    setIsAnalyzingLabor(true);
    try {
        const result = await analyzeLaborCosts(laborData.dailyWages);
        setLaborSuggestions(result);
    } catch (e) {
        alert('인건비 분석 중 오류가 발생했습니다.');
    } finally {
        setIsAnalyzingLabor(false);
    }
  };

  const openScanModal = (mode: 'scan_and_update' | 'verify_only') => {
      setScanMode(mode);
      setSelectedScanCategories(new Set()); 
      setShowScanModal(true);
  };

  const executeMaterialScan = async () => {
      if (selectedScanCategories.size === 0) {
          alert("스캔할 공정을 최소 1개 이상 선택해주세요.");
          return;
      }
      
      setShowScanModal(false); 
      setIsUpdatingMaterials(true);
      setPendingMaterialUpdates(null);
      
      const targetCategories = Array.from(selectedScanCategories) as string[];

      try {
          const result = await discoverAndRefreshMaterials(materials, targetCategories, scanMode);
          setPendingMaterialUpdates(result);
          setSelectedUpdates(new Set(result.updates.map(i => i.id)));
          setSelectedNewItems(new Set(result.newItems.map(i => i.id)));
      } catch (e) {
          console.error(e);
          alert("자재 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
          setIsUpdatingMaterials(false);
      }
  };

  const handleApplyMaterialChanges = () => {
      if (!pendingMaterialUpdates) return;

      try {
          let newMaterials = [...materials];
          pendingMaterialUpdates.updates.forEach(update => {
              if (selectedUpdates.has(update.id)) {
                  const idx = newMaterials.findIndex(m => m.id === update.id);
                  if (idx !== -1) {
                      newMaterials[idx] = { 
                          ...newMaterials[idx], 
                          ...update, 
                          lastUpdated: new Date().toISOString().split('T')[0] 
                      };
                  }
              }
          });
          pendingMaterialUpdates.newItems.forEach(newItem => {
              if (selectedNewItems.has(newItem.id)) {
                  const safeItem: MaterialDatabaseItem = {
                      id: `m${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                      category: newItem.category || '기타',
                      subCategory: newItem.subCategory || '일반',
                      grade: newItem.grade || 'standard',
                      brand: newItem.brand || '',
                      name: newItem.name || '이름 없음',
                      spec: newItem.spec || '-',
                      unit: newItem.unit || 'ea',
                      price: typeof newItem.price === 'number' ? newItem.price : 0,
                      link: newItem.link || '',
                      laborRef: newItem.laborRef || '',
                      workLink: newItem.workLink || { laborType: 'none' }, 
                      lastUpdated: new Date().toISOString().split('T')[0]
                  };
                  newMaterials.push(safeItem);
              }
          });

          setMaterials(newMaterials);
          saveMaterials(newMaterials); 
          setPendingMaterialUpdates(null);
          alert("선택한 정보가 라이브러리에 반영 및 저장되었습니다!");
      } catch (e) {
          console.error(e);
          alert("데이터 반영 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
  };

  const applyPriceSuggestion = (suggestion: PriceSuggestion) => {
      if (suggestion.type === 'UPDATE') {
          setPriceTable(prev => prev.map(item => 
              (item.category === suggestion.category && item.item === suggestion.item)
              ? { ...item, priceStandard: suggestion.suggestedPrice }
              : item
          ));
      } else {
          const newItem: UnitPrice = {
              category: suggestion.category,
              item: suggestion.item,
              unit: suggestion.unit,
              priceLow: Math.round(suggestion.suggestedPrice * 0.9),
              priceStandard: suggestion.suggestedPrice,
              priceHigh: Math.round(suggestion.suggestedPrice * 1.1),
              description: suggestion.description || ''
          };
          setPriceTable(prev => [...prev, newItem]);
      }
      setPriceSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const applyLaborSuggestion = (s: LaborSuggestion) => {
      if (!laborData) return;
      setLaborData({
          ...laborData,
          dailyWages: {
              ...laborData.dailyWages,
              [s.key]: s.suggestedPrice
          }
      });
      setLaborSuggestions(prev => prev.filter(x => x.key !== s.key));
  };

  const handleAddContractor = () => {
      setEditingContractor({
          id: Date.now().toString(),
          name: '',
          type: '종합 인테리어',
          region: '서울',
          contact: '',
          platform: 'offline', 
          description: '',
          isVerified: true,
          tags: [],
          career: '10년',
          verificationNote: ''
      });
  };

  const handleSaveContractorForm = () => {
      if (!editingContractor || !editingContractor.name) return;
      
      setContractors(prev => {
          const exists = prev.find(c => c.id === editingContractor.id);
          if (exists) {
              return prev.map(c => c.id === editingContractor.id ? editingContractor : c);
          } else {
              return [...prev, editingContractor];
          }
      });
      handleSaveContractors(); 
      setEditingContractor(null);
  };

  const handleDeleteContractor = (id: string) => {
      if(confirm("정말 삭제하시겠습니까?")) {
          setContractors(prev => prev.filter(c => c.id !== id));
          handleSaveContractors(); 
      }
  };

  const handleMaterialChange = (idx: number, field: keyof MaterialDatabaseItem, value: any) => {
      const newMaterials = [...materials];
      newMaterials[idx] = { ...newMaterials[idx], [field]: value };
      setMaterials(newMaterials);
  };

  const handleDeleteMaterial = (idx: number) => {
      if (confirm("삭제하시겠습니까?")) {
          const newMaterials = materials.filter((_, i) => i !== idx);
          setMaterials(newMaterials);
      }
  };

  const handleAddMaterial = () => {
      let defaultCategory = '기타';
      if (activeMaterialCategory !== '전체') {
          const mapping = CATEGORY_MAPPING[activeMaterialCategory];
          if (mapping && mapping.length > 0) {
              defaultCategory = mapping[activeMaterialCategory === '바닥' ? 1 : 0] || activeMaterialCategory; 
          } else {
              defaultCategory = activeMaterialCategory;
          }
      }

      const newItem: MaterialDatabaseItem = {
          id: `m${Date.now()}`,
          category: defaultCategory,
          subCategory: '',
          grade: 'standard', 
          brand: '',
          name: '신규 자재',
          spec: '',
          unit: 'ea',
          price: 0,
          link: '',
          laborRef: '',
          workLink: { laborType: 'none' }, 
          lastUpdated: new Date().toISOString().split('T')[0]
      };
      setMaterials([...materials, newItem]);
  };

  const toggleUpdateSelection = (id: string, type: 'new' | 'update') => {
      const setFunc = type === 'new' ? setSelectedNewItems : setSelectedUpdates;
      setFunc(prev => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
      });
  };

  const toggleScanCategory = (cat: string) => {
      setSelectedScanCategories(prev => {
          const next = new Set(prev);
          if (next.has(cat)) next.delete(cat);
          else next.add(cat);
          return next;
      });
  };

  const filteredMaterials = activeMaterialCategory === '전체' 
      ? materials 
      : materials.filter(m => {
          const keywords = CATEGORY_MAPPING[activeMaterialCategory];
          if (!keywords) return m.category === activeMaterialCategory;
          return keywords.some(k => 
              m.category.includes(k) || 
              m.category === k ||
              (m.subCategory && m.subCategory.includes(k))
          );
      });

  const scanOptions = CATEGORY_TABS.filter(c => c !== '전체');

  return (
    // Changed main container to be fully fixed and white, removing the overlay effect for full screen feel
    <div className="fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important; 
          scrollbar-width: none !important; 
        }
      `}</style>
      
      {/* Header */}
      <div className="p-4 md:p-6 bg-gray-900 text-white flex justify-between items-center flex-shrink-0 shadow-md">
        <h2 className="text-xl font-bold flex items-center gap-2">
          ⚙️ 관리자 설정 패널
        </h2>
        <div className="flex items-center gap-3">
            <button 
                onClick={handleImportClick} 
                className="px-3 py-1.5 bg-gray-700 text-gray-200 text-xs font-bold rounded hover:bg-gray-600 flex items-center gap-1 border border-gray-600"
                title="저장된 파일을 불러와서 현재 데이터를 덮어씁니다"
            >
                📥 데이터 복원
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileRead} 
                accept=".json" 
                className="hidden" 
            />
            <button 
                onClick={handleExportData} 
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 flex items-center gap-1 shadow-md"
                title="현재 설정(자재, 단가, 인건비)을 파일로 저장합니다"
            >
                💾 전체 백업 (저장하기)
            </button>
            
            <div className="h-6 w-px bg-gray-700 mx-1"></div>

            <button onClick={onClose} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex border-b border-gray-200 bg-white flex-shrink-0 overflow-x-auto hide-scrollbar">
         {['materials', 'prices', 'labor', 'guidelines', 'contractors'].map(tab => (
             <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={`flex-1 min-w-[120px] py-4 text-sm font-bold capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
             >
                 {tab === 'materials' ? '🧱 자재 리스트 관리' : tab === 'prices' ? '💰 기본 단가 관리' : tab === 'labor' ? '👷 인건비 관리' : tab === 'guidelines' ? '📝 가이드라인' : '🕵️ 시공자 관리'}
             </button>
         ))}
      </div>

      {/* Main Content Area */}
      <div 
          className="p-4 md:p-8 bg-gray-50 flex-grow overflow-y-auto hide-scrollbar"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
          {activeTab === 'materials' && (
              <div className="space-y-6 max-w-full mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900">🧱 자재 라이브러리 (Master DB)</h3>
                          <p className="text-xs text-gray-500 mt-1">AI가 사용할 자재 품목을 미리 정의합니다.</p>
                      </div>
                      <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1">
                          <button 
                              onClick={() => openScanModal('verify_only')} 
                              disabled={isUpdatingMaterials} 
                              className="px-4 py-2 bg-orange-100 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-200 font-bold text-sm shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                              <span>⚖️ 시세 검증</span>
                          </button>
                          <button 
                              onClick={() => openScanModal('scan_and_update')} 
                              disabled={isUpdatingMaterials} 
                              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-lg hover:from-blue-600 hover:to-cyan-700 font-bold text-sm shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                          >
                              {isUpdatingMaterials ? '분석 중...' : '🌐 AI 신규 발굴'}
                          </button>
                          
                          <button onClick={handleSaveMaterials} className={`px-4 py-2 rounded-lg font-bold text-sm shadow-md transition-all whitespace-nowrap ${saveStatus === 'saved' ? 'bg-green-600 text-white' : 'bg-gray-800 text-white hover:bg-gray-900'}`}>
                              {saveStatus === 'saving' ? '저장 중...' : saveStatus === 'saved' ? '✅ 저장 완료!' : '저장하기'}
                          </button>
                      </div>
                  </div>

                  {/* --- FILTER TABS (WRAPPED) --- */}
                  <div className="flex flex-wrap gap-2 mb-4 items-center">
                      <span className="text-xs font-bold text-gray-500 mr-2">공정별 필터:</span>
                      {CATEGORY_TABS.map(cat => (
                          <button 
                              key={cat}
                              onClick={() => setActiveMaterialCategory(cat)} 
                              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeMaterialCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                          >
                              {cat}
                              {activeMaterialCategory === cat && ` (${filteredMaterials.length})`}
                          </button>
                      ))}
                  </div>

                  {/* Rest of Modal & Content Logic Same as before */}
                  {restoreModalData && (
                      // ... Restore Modal Code ...
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200">
                              <h3 className="text-xl font-bold text-center mb-4">데이터 복원</h3>
                              {!mergeStats && (
                                  <div className="space-y-3">
                                      <button onClick={() => handleRestoreOption('merge')} className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-xl font-bold text-blue-900 border border-blue-200 text-left">A. 병합 (Merge)</button>
                                      <button onClick={() => handleRestoreOption('overwrite')} className="w-full p-4 bg-white hover:bg-red-50 rounded-xl font-bold text-gray-900 border border-gray-200 text-left">B. 덮어쓰기 (Overwrite)</button>
                                      <button onClick={() => setRestoreModalData(null)} className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">취소</button>
                                  </div>
                              )}
                              {mergeStats && (
                                  <div>
                                      <div className="bg-gray-50 p-4 rounded mb-4 text-sm"><ul className="list-disc pl-4">{mergeStats.details.map((d,i)=><li key={i}>{d}</li>)}</ul></div>
                                      <div className="flex gap-2"><button onClick={()=>setMergeStats(null)} className="flex-1 py-2 bg-gray-200 rounded font-bold">뒤로</button><button onClick={performMerge} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">실행</button></div>
                                  </div>
                              )}
                          </div>
                      </div>
                  )}

                  {showScanModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
                          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                              <h3 className="text-xl font-bold mb-4">{scanMode === 'scan_and_update' ? 'AI 자재 발굴' : '시세 검증'}</h3>
                              <div className="grid grid-cols-3 gap-2 mb-6">
                                  {scanOptions.map(cat => (
                                      <label key={cat} className={`flex items-center justify-center p-2 rounded border cursor-pointer text-sm font-medium ${selectedScanCategories.has(cat) ? 'bg-indigo-600 text-white' : 'bg-gray-50'}`}>
                                          <input type="checkbox" className="hidden" checked={selectedScanCategories.has(cat)} onChange={() => toggleScanCategory(cat)} />
                                          {cat}
                                      </label>
                                  ))}
                              </div>
                              <div className="flex gap-3"><button onClick={() => setShowScanModal(false)} className="flex-1 py-3 bg-gray-100 rounded font-bold">취소</button><button onClick={executeMaterialScan} className="flex-1 py-3 bg-indigo-600 text-white rounded font-bold">시작</button></div>
                          </div>
                      </div>
                  )}

                  {pendingMaterialUpdates && (
                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 mb-6">
                          <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-blue-900">🔍 AI 분석 결과</h4><div className="flex gap-2"><button onClick={() => setPendingMaterialUpdates(null)} className="px-3 py-1 bg-gray-300 rounded font-bold text-xs">취소</button><button onClick={handleApplyMaterialChanges} className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-xs">반영</button></div></div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded h-60 overflow-y-auto border">
                                  <h5 className="font-bold text-green-700 text-sm mb-2">신규 ({pendingMaterialUpdates.newItems.length})</h5>
                                  {pendingMaterialUpdates.newItems.map(item => (
                                      <label key={item.id} className="flex gap-2 p-1 border-b text-xs"><input type="checkbox" checked={selectedNewItems.has(item.id)} onChange={() => toggleUpdateSelection(item.id, 'new')} /><span>{item.name} ({item.price}원)</span></label>
                                  ))}
                              </div>
                              <div className="bg-white p-3 rounded h-60 overflow-y-auto border">
                                  <h5 className="font-bold text-orange-700 text-sm mb-2">변동 ({pendingMaterialUpdates.updates.length})</h5>
                                  {pendingMaterialUpdates.updates.map(item => (
                                      <label key={item.id} className="flex gap-2 p-1 border-b text-xs"><input type="checkbox" checked={selectedUpdates.has(item.id)} onChange={() => toggleUpdateSelection(item.id, 'update')} /><span>{item.name} → {item.price}원</span></label>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}

                  {/* RESPONSIVE HYBRID VIEW */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      {/* MOBILE: CARD VIEW */}
                      <div className="md:hidden p-4 space-y-4">
                          {filteredMaterials.map(m => {
                              const originalIndex = materials.findIndex(item => item.id === m.id);
                              return (
                                  <div key={m.id} className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm flex flex-col gap-2">
                                      <div className="flex justify-between items-center border-b pb-2">
                                          <div className="flex gap-1">
                                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{m.category}</span>
                                              <span className="bg-gray-50 text-gray-400 px-2 py-0.5 rounded text-xs">{m.subCategory}</span>
                                          </div>
                                          <button onClick={() => handleDeleteMaterial(originalIndex)} className="text-red-400 font-bold px-2">×</button>
                                      </div>
                                      <div>
                                          <input type="text" value={m.brand} onChange={e => handleMaterialChange(originalIndex, 'brand', e.target.value)} className="w-full text-xs font-bold text-indigo-700 mb-1 border-none p-0 focus:ring-0" placeholder="브랜드" />
                                          <input type="text" value={m.name} onChange={e => handleMaterialChange(originalIndex, 'name', e.target.value)} className="w-full text-sm font-bold text-gray-900 border-b border-gray-100 pb-1" />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                          <div><span className="text-gray-400">규격:</span> <input type="text" value={m.spec} onChange={e => handleMaterialChange(originalIndex, 'spec', e.target.value)} className="w-20 border rounded p-1" /></div>
                                          <div><span className="text-gray-400">단위:</span> <input type="text" value={m.unit} onChange={e => handleMaterialChange(originalIndex, 'unit', e.target.value)} className="w-12 border rounded p-1 text-center" /></div>
                                          <div className="col-span-2 flex items-center gap-2">
                                              <span className="text-gray-400">단가:</span> 
                                              <input type="number" value={m.price} onChange={e => handleMaterialChange(originalIndex, 'price', parseInt(e.target.value))} className="flex-1 border rounded p-1 font-bold text-right" />
                                              <span className="text-gray-600">원</span>
                                          </div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>

                      {/* DESKTOP: TABLE VIEW */}
                      <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-100 text-gray-600 font-bold uppercase text-xs">
                                  <tr>
                                      <th className="px-4 py-3 whitespace-nowrap">공정</th>
                                      <th className="px-4 py-3">브랜드/품명</th>
                                      <th className="px-4 py-3">규격/단위</th>
                                      <th className="px-4 py-3 text-right whitespace-nowrap">단가(원)</th>
                                      <th className="px-4 py-3 whitespace-nowrap">연관 인건비</th>
                                      <th className="px-4 py-3 whitespace-nowrap">관리</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {filteredMaterials.map((m) => {
                                      const originalIndex = materials.findIndex(item => item.id === m.id);
                                      return (
                                          <tr key={m.id} className="hover:bg-gray-50">
                                              <td className="px-4 py-2 align-top">
                                                  <input type="text" value={m.category} onChange={e => handleMaterialChange(originalIndex, 'category', e.target.value)} className="w-24 border border-gray-300 rounded p-1 text-xs font-bold bg-white text-gray-900" placeholder="카테고리" />
                                                  <input type="text" value={m.subCategory || ''} onChange={e => handleMaterialChange(originalIndex, 'subCategory', e.target.value)} className="w-24 border border-gray-300 rounded p-1 text-xs mt-1 block bg-white text-gray-900" placeholder="상세분류" />
                                              </td>
                                              <td className="px-4 py-2 align-top">
                                                  <input type="text" value={m.brand} onChange={e => handleMaterialChange(originalIndex, 'brand', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-xs font-bold text-indigo-900 bg-white mb-1" placeholder="브랜드" />
                                                  <input type="text" value={m.name} onChange={e => handleMaterialChange(originalIndex, 'name', e.target.value)} className="w-full border border-gray-300 rounded p-1 text-xs bg-white text-gray-900" placeholder="상품명" />
                                              </td>
                                              <td className="px-4 py-2 align-top">
                                                  <div className="flex gap-1">
                                                      <input type="text" value={m.spec} onChange={e => handleMaterialChange(originalIndex, 'spec', e.target.value)} className="w-20 border border-gray-300 rounded p-1 text-xs bg-white text-gray-900" placeholder="규격" />
                                                      <input type="text" value={m.unit} onChange={e => handleMaterialChange(originalIndex, 'unit', e.target.value)} className="w-12 border border-gray-300 rounded p-1 text-xs text-center bg-white text-gray-900" placeholder="단위" />
                                                  </div>
                                              </td>
                                              <td className="px-4 py-2 align-top text-right">
                                                  <input type="number" value={m.price} onChange={e => handleMaterialChange(originalIndex, 'price', parseInt(e.target.value))} className="w-24 border border-gray-300 rounded p-1 text-xs text-right font-bold bg-white text-gray-900" />
                                              </td>
                                              <td className="px-4 py-2 align-top">
                                                  <select 
                                                      value={m.laborRef || ''} 
                                                      onChange={e => handleMaterialChange(originalIndex, 'laborRef', e.target.value)}
                                                      className="w-full border border-gray-300 rounded p-1 text-xs bg-white text-gray-900"
                                                  >
                                                      <option value="">(선택)</option>
                                                      {laborData && Object.keys(laborData.dailyWages).map(k => (
                                                          <option key={k} value={k}>{LABOR_LABEL_MAP[k] || k}</option>
                                                      ))}
                                                  </select>
                                                  {m.link && <a href={m.link} target="_blank" className="text-[10px] text-blue-500 block mt-1 truncate max-w-[100px] hover:underline">🔗 구매링크</a>}
                                              </td>
                                              <td className="px-4 py-2 align-top text-center">
                                                  <button onClick={() => handleDeleteMaterial(originalIndex)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors">🗑️</button>
                                              </td>
                                          </tr>
                                      );
                                  })}
                                  {filteredMaterials.length === 0 && (
                                      <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">등록된 자재가 없습니다.</td></tr>
                                  )}
                              </tbody>
                          </table>
                      </div>
                      
                      <button onClick={handleAddMaterial} className="w-full py-3 bg-gray-50 text-gray-500 font-bold text-sm hover:bg-gray-100 border-t border-gray-200">
                          + {activeMaterialCategory !== '전체' ? `'${activeMaterialCategory}' 관련 항목으로` : ''} 수동 추가하기
                      </button>
                  </div>
              </div>
          )}

          {activeTab === 'prices' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                      <div><h3 className="text-lg font-bold text-gray-900">표준 단가표 관리</h3><p className="text-xs text-gray-500 mt-1">기준 단가 설정</p></div>
                      <div className="flex gap-2">
                          <button onClick={handleAnalyzePrices} disabled={isAnalyzingPrices} className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold text-sm">{isAnalyzingPrices?'분석중':'🤖 AI 분석'}</button>
                          <button onClick={handleSavePrices} className={`px-4 py-2 rounded-lg font-bold text-sm text-white ${saveStatus==='saved'?'bg-green-600':'bg-gray-800'}`}>{saveStatus==='saved'?'저장완료':'저장하기'}</button>
                      </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                      {priceTable.map((item, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-3 items-center border-b py-2 last:border-0">
                              <input className="col-span-2 border rounded p-1 text-xs font-bold text-center" value={item.category} onChange={e=>{const n=[...priceTable];n[idx].category=e.target.value;setPriceTable(n)}} />
                              <input className="col-span-5 border rounded p-1 text-sm" value={item.item} onChange={e=>{const n=[...priceTable];n[idx].item=e.target.value;setPriceTable(n)}} />
                              <input className="col-span-4 border rounded p-1 text-right font-bold" type="number" value={item.priceStandard} onChange={e=>{const n=[...priceTable];n[idx].priceStandard=parseInt(e.target.value);setPriceTable(n)}} />
                              <button className="col-span-1 text-red-500" onClick={()=>setPriceTable(priceTable.filter((_,i)=>i!==idx))}>×</button>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {activeTab === 'labor' && laborData && (
              <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="flex justify-between items-center">
                       <div><h3 className="text-lg font-bold text-gray-900">인건비 관리</h3></div>
                       <div className="flex gap-2">
                          <button onClick={handleAnalyzeLabor} disabled={isAnalyzingLabor} className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold text-sm">AI 분석</button>
                          <button onClick={handleSaveLabor} className={`px-4 py-2 rounded-lg font-bold text-sm text-white ${saveStatus==='saved'?'bg-green-600':'bg-indigo-600'}`}>{saveStatus==='saved'?'저장완료':'저장하기'}</button>
                       </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                          <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">일일 노무비</h4>
                          {Object.entries(laborData.dailyWages).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center py-2 border-b last:border-0">
                                  <label className="text-sm font-bold text-gray-700">{LABOR_LABEL_MAP[key]||key}</label>
                                  <input type="number" value={value as number} onChange={(e) => setLaborData({...laborData, dailyWages: {...laborData.dailyWages, [key]: parseInt(e.target.value)}})} className="w-32 border rounded p-1 text-right font-bold" />
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'guidelines' && (
              <div className="h-full flex flex-col max-w-5xl mx-auto">
                  <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold">가이드라인</h3>
                       <button onClick={handleSaveGuidelines} className={`px-4 py-2 rounded-lg font-bold text-sm text-white ${saveStatus==='saved'?'bg-green-600':'bg-indigo-600'}`}>{saveStatus==='saved'?'저장완료':'저장하기'}</button>
                  </div>
                  <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} className="flex-grow p-4 border rounded-xl font-mono text-sm resize-none" />
              </div>
          )}

          {activeTab === 'contractors' && (
              <div className="space-y-6 max-w-5xl mx-auto">
                  <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold">시공자 관리</h3>
                      <button onClick={handleAddContractor} className="px-4 py-2 bg-green-600 text-white rounded font-bold text-sm">+ 등록</button>
                  </div>
                  {editingContractor ? (
                      <div className="bg-white p-6 rounded-xl border">
                          <h4 className="font-bold mb-4">{editingContractor.name?'수정':'신규'}</h4>
                          <div className="grid grid-cols-2 gap-4">
                              <input className="border p-2 rounded" placeholder="업체명" value={editingContractor.name} onChange={e=>setEditingContractor({...editingContractor, name:e.target.value})} />
                              <input className="border p-2 rounded" placeholder="연락처" value={editingContractor.contact} onChange={e=>setEditingContractor({...editingContractor, contact:e.target.value})} />
                              <input className="border p-2 rounded" placeholder="지역" value={editingContractor.region} onChange={e=>setEditingContractor({...editingContractor, region:e.target.value})} />
                              <textarea className="col-span-2 border p-2 rounded" placeholder="설명" value={editingContractor.description} onChange={e=>setEditingContractor({...editingContractor, description:e.target.value})} />
                          </div>
                          <div className="mt-4 flex gap-2 justify-end">
                              <button onClick={()=>setEditingContractor(null)} className="px-4 py-2 bg-gray-200 rounded">취소</button>
                              <button onClick={handleSaveContractorForm} className="px-4 py-2 bg-indigo-600 text-white rounded">저장</button>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {contractors.map(c => (
                              <div key={c.id} className="bg-white p-4 border rounded-xl flex justify-between items-center">
                                  <div>
                                      <h4 className="font-bold">{c.name}</h4>
                                      <p className="text-sm text-gray-500">{c.type} | {c.region}</p>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={()=>setEditingContractor(c)} className="px-3 py-1 bg-gray-100 rounded text-sm">수정</button>
                                      <button onClick={()=>handleDeleteContractor(c.id)} className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">삭제</button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}
      </div>
    </div>
  );
};

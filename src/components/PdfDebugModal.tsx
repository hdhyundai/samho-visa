import React, { useState, useEffect, useRef } from 'react';
import { 
  X, RotateCcw, Download, Eye, 
  Save, CheckCircle2, ChevronRight, Search,
  Plus, Trash2, Upload, FileText, ArrowRight,
  ArrowUp, ArrowDown, ArrowLeft, MoreHorizontal, Sparkles,
  Move, Type, CheckSquare, SlidersHorizontal, Edit3
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { saveAs } from 'file-saver';
import { FormData } from '../types';
import { 
  PDF_COORDS_MAIN, 
  PDF_COORDS_RESIDENCE, 
  PDF_COORDS_GUARANTEE, 
  PDF_COORDS_INCOME,
  FORM_FIELD_LABELS,
  PdfCoordBox,
  CustomDocItem,
  BUILTIN_PRESET_DOCS,
  AVAILABLE_MAPPING_FIELDS,
  PRESET_COORDS_CONTRACT,
  PRESET_COORDS_REASON,
  PRESET_COORDS_ATTORNEY,
  resolveFieldValueForCoord
} from '../constants/formConstants';

interface PdfDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  initialDocType?: string;
  onUpdateCustomDocs?: (docs: CustomDocItem[]) => void;
}

export const PdfDebugModal: React.FC<PdfDebugModalProps> = ({
  isOpen,
  onClose,
  formData,
  initialDocType = 'income',
  onUpdateCustomDocs
}) => {
  const [activeDoc, setActiveDoc] = useState<string>(initialDocType);
  const [viewMode, setViewMode] = useState<'edit' | 'print'>('edit');
  const [zoomScale, setZoomScale] = useState<number>(0.95);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [moveStep, setMoveStep] = useState<1 | 5 | 10>(5);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);

  // Field Picker Modal state
  const [isFieldPickerOpen, setIsFieldPickerOpen] = useState<boolean>(false);
  const [pickerTab, setPickerTab] = useState<'preset' | 'custom'>('preset');
  const [pendingAddPos, setPendingAddPos] = useState<{ x: number; y: number } | null>(null);
  const [pickerCategory, setPickerCategory] = useState<string>('all');

  // Direct Key-in States for Field Picker modal
  const [customKeyinLabel, setCustomKeyinLabel] = useState<string>('');
  const [customKeyinValue, setCustomKeyinValue] = useState<string>('');
  const [customKeyinType, setCustomKeyinType] = useState<'text' | 'check'>('text');

  // Custom direct text values map (Key -> Value)
  const [customTextMap, setCustomTextMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('customPdfTextMap');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // Custom labels map (Key -> Friendly Label)
  const [customLabelsMap, setCustomLabelsMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('customPdfLabelsMap');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  // New Document Registration modal
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState<boolean>(false);
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocSelectedPreset, setNewDocSelectedPreset] = useState<'contract' | 'reason' | 'attorney' | 'blank'>('contract');
  const [newDocPdfFile, setNewDocPdfFile] = useState<File | null>(null);

  // Dragging & Resizing state
  const [draggingField, setDraggingField] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialX: number; initialY: number } | null>(null);

  const [resizingField, setResizingField] = useState<string | null>(null);
  const [resizeDirection, setResizeDirection] = useState<'both' | 'width' | 'height'>('both');
  const resizeStartRef = useRef<{ clientX: number; clientY: number; initialW: number; initialH: number } | null>(null);

  // Custom Docs Registry
  const [customDocs, setCustomDocs] = useState<CustomDocItem[]>(() => {
    try {
      const saved = localStorage.getItem('customDocRegistry');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [...BUILTIN_PRESET_DOCS];
  });

  // Custom coordinates state loaded from localStorage or factory default
  const [customCoords, setCustomCoords] = useState<Record<string, Record<string, PdfCoordBox>>>(() => {
    try {
      const saved = localStorage.getItem('customPdfCoords');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      main: { ...PDF_COORDS_MAIN },
      residence: { ...PDF_COORDS_RESIDENCE },
      guarantee: { ...PDF_COORDS_GUARANTEE },
      income: { ...PDF_COORDS_INCOME },
      contract_std: { ...PRESET_COORDS_CONTRACT },
      reason_stmt: { ...PRESET_COORDS_REASON },
      power_of_attorney: { ...PRESET_COORDS_ATTORNEY }
    };
  });

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDocType) {
      setActiveDoc(initialDocType);
    }
  }, [initialDocType, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (isFieldPickerOpen) {
          setIsFieldPickerOpen(false);
          setPendingAddPos(null);
        } else if (isNewDocModalOpen) {
          setIsNewDocModalOpen(false);
        } else if (isAddMode) {
          setIsAddMode(false);
        } else if (selectedField) {
          setSelectedField(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isFieldPickerOpen, isNewDocModalOpen, isAddMode, selectedField]);

  // Mouse move and up for dragging and resizing coordinate boxes
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // 1. Resizing mode
      if (resizingField && resizeStartRef.current) {
        const docCoords = customCoords[activeDoc];
        if (!docCoords || !docCoords[resizingField]) return;
        const currentBox = docCoords[resizingField];

        const deltaW = Math.round((e.clientX - resizeStartRef.current.clientX) / zoomScale);
        const deltaH = Math.round((e.clientY - resizeStartRef.current.clientY) / zoomScale);

        const newW = resizeDirection === 'height' 
          ? (currentBox.w || resizeStartRef.current.initialW)
          : Math.max(6, Math.min(550, resizeStartRef.current.initialW + deltaW));

        const newH = resizeDirection === 'width' 
          ? (currentBox.h || resizeStartRef.current.initialH)
          : Math.max(6, Math.min(500, resizeStartRef.current.initialH + deltaH));

        setCustomCoords(prev => ({
          ...prev,
          [activeDoc]: {
            ...prev[activeDoc],
            [resizingField]: {
              ...currentBox,
              w: newW,
              h: newH
            }
          }
        }));
        return;
      }

      // 2. Dragging mode
      if (!draggingField || !dragStartRef.current) return;
      const docCoords = customCoords[activeDoc];
      if (!docCoords || !docCoords[draggingField]) return;
      const currentBox = docCoords[draggingField];

      const deltaX = Math.round((e.clientX - dragStartRef.current.clientX) / zoomScale);
      const deltaY = Math.round((dragStartRef.current.clientY - e.clientY) / zoomScale);

      const boxW = currentBox.w || 20;
      const boxH = currentBox.h || 20;

      const newX = Math.max(0, Math.min(595 - boxW, dragStartRef.current.initialX + deltaX));
      const newY = Math.max(0, Math.min(842 - boxH, dragStartRef.current.initialY + deltaY));

      setCustomCoords(prev => ({
        ...prev,
        [activeDoc]: {
          ...prev[activeDoc],
          [draggingField]: {
            ...currentBox,
            x: newX,
            y: newY
          }
        }
      }));
    };

    const handleMouseUp = () => {
      if (draggingField) {
        setDraggingField(null);
        dragStartRef.current = null;
      }
      if (resizingField) {
        setResizingField(null);
        resizeStartRef.current = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingField, resizingField, resizeDirection, activeDoc, zoomScale, customCoords]);

  if (!isOpen) return null;

  const currentCoords = customCoords[activeDoc] || {};
  const currentLabels = (FORM_FIELD_LABELS as any)[activeDoc] || {};

  const getFieldValue = (key: string): { display: string; isChecked: boolean } => {
    return resolveFieldValueForCoord(key, formData, customTextMap);
  };

  const getFieldFriendlyName = (key: string): string => {
    if (customLabelsMap[key]) return customLabelsMap[key];
    if (currentLabels[key]) return currentLabels[key];
    const mapping = AVAILABLE_MAPPING_FIELDS.find(f => f.key === key);
    if (mapping) return mapping.label;
    return key.replace(/_/g, ' ');
  };

  const updateCoord = (fieldKey: string, property: 'x' | 'y' | 'w' | 'h', delta: number) => {
    setCustomCoords(prev => {
      const docCoords = { ...prev[activeDoc] };
      const current = docCoords[fieldKey];
      if (!current) return prev;
      const updated = { ...current };
      const defaultVal = property === 'w' 
        ? (current.type === 'check' ? 14 : 20) 
        : (property === 'h' ? (current.type === 'check' ? 14 : 14) : 0);
      const currentVal = (updated as any)[property] !== undefined ? (updated as any)[property] : defaultVal;
      const minVal = (property === 'w' || property === 'h') ? 4 : 0;
      (updated as any)[property] = Math.max(minVal, currentVal + delta);
      docCoords[fieldKey] = updated;
      return {
        ...prev,
        [activeDoc]: docCoords
      };
    });
  };

  const setCoordValue = (fieldKey: string, property: 'x' | 'y' | 'w' | 'h', val: number) => {
    setCustomCoords(prev => {
      const docCoords = { ...prev[activeDoc] };
      const current = docCoords[fieldKey];
      if (!current) return prev;
      const minVal = (property === 'w' || property === 'h') ? 4 : 0;
      const updated = { ...current, [property]: Math.max(minVal, val) };
      docCoords[fieldKey] = updated;
      return {
        ...prev,
        [activeDoc]: docCoords
      };
    });
  };

  const deleteCoordField = (fieldKey: string) => {
    const friendlyName = getFieldFriendlyName(fieldKey);
    if (confirm(`'${friendlyName}' 필드를 삭제하시겠습니까?`)) {
      setCustomCoords(prev => {
        const docCoords = { ...prev[activeDoc] };
        delete docCoords[fieldKey];
        return {
          ...prev,
          [activeDoc]: docCoords
        };
      });
      if (selectedField === fieldKey) {
        setSelectedField(null);
      }
      setSaveToast(`'${friendlyName}' 항목이 삭제되었습니다.`);
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const handleSaveToLocalStorage = () => {
    try {
      localStorage.setItem('customPdfCoords', JSON.stringify(customCoords));
      localStorage.setItem('customDocRegistry', JSON.stringify(customDocs));
      localStorage.setItem('customPdfTextMap', JSON.stringify(customTextMap));
      localStorage.setItem('customPdfLabelsMap', JSON.stringify(customLabelsMap));
      setSaveToast('모든 서식 좌표 및 설정이 안전하게 저장되었습니다!');
      setTimeout(() => setSaveToast(null), 3000);
      if (onUpdateCustomDocs) {
        onUpdateCustomDocs(customDocs);
      }
    } catch (e: any) {
      alert('저장 실패: ' + e.message);
    }
  };

  const handleAddCustomKeyinField = () => {
    const label = customKeyinLabel.trim() || '직접입력항목';
    const val = customKeyinValue.trim();
    const ptX = pendingAddPos ? pendingAddPos.x : 150;
    const ptY = pendingAddPos ? pendingAddPos.y : 500;
    const customKey = `custom_${Date.now()}`;

    const newBox: PdfCoordBox = {
      type: customKeyinType,
      x: ptX,
      y: ptY,
      w: customKeyinType === 'check' ? 14 : Math.min(320, Math.max(90, Math.round(val.length * 11) + 24)),
      h: customKeyinType === 'check' ? 14 : 20
    };

    setCustomCoords(prev => ({
      ...prev,
      [activeDoc]: {
        ...(prev[activeDoc] || {}),
        [customKey]: newBox
      }
    }));

    setCustomLabelsMap(prev => {
      const updated = { ...prev, [customKey]: label };
      localStorage.setItem('customPdfLabelsMap', JSON.stringify(updated));
      return updated;
    });

    if (customKeyinType === 'text') {
      setCustomTextMap(prev => {
        const updated = { ...prev, [customKey]: val };
        localStorage.setItem('customPdfTextMap', JSON.stringify(updated));
        return updated;
      });
    }

    setSelectedField(customKey);
    setIsFieldPickerOpen(false);
    setPendingAddPos(null);
    setIsAddMode(false);
    setCustomKeyinLabel('');
    setCustomKeyinValue('');
    setCustomKeyinType('text');
    setSaveToast(`'${label}' 항목이 배치되었습니다.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleResetToDefault = () => {
    if (confirm(`'${activeDocTitle}' 서식의 좌표를 최초 표준값으로 초기화하시겠습니까?`)) {
      setCustomCoords(prev => {
        let defaultForDoc = {};
        if (activeDoc === 'main') defaultForDoc = { ...PDF_COORDS_MAIN };
        else if (activeDoc === 'residence') defaultForDoc = { ...PDF_COORDS_RESIDENCE };
        else if (activeDoc === 'guarantee') defaultForDoc = { ...PDF_COORDS_GUARANTEE };
        else if (activeDoc === 'income') defaultForDoc = { ...PDF_COORDS_INCOME };
        else if (activeDoc === 'contract_std') defaultForDoc = { ...PRESET_COORDS_CONTRACT };
        else if (activeDoc === 'reason_stmt') defaultForDoc = { ...PRESET_COORDS_REASON };
        else if (activeDoc === 'power_of_attorney') defaultForDoc = { ...PRESET_COORDS_ATTORNEY };
        else defaultForDoc = {};

        const updated = {
          ...prev,
          [activeDoc]: defaultForDoc
        };
        try {
          localStorage.setItem('customPdfCoords', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
      setShowMoreMenu(false);
      setSaveToast('표준 좌표로 복원되었습니다.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleAddFieldToActiveDoc = (fieldOption: typeof AVAILABLE_MAPPING_FIELDS[0]) => {
    const ptX = pendingAddPos ? pendingAddPos.x : 150;
    const ptY = pendingAddPos ? pendingAddPos.y : 500;
    let targetKey = fieldOption.key;
    let counter = 1;
    while (currentCoords[targetKey]) {
      targetKey = `${fieldOption.key}_${counter}`;
      counter++;
    }

    const newBox: PdfCoordBox = {
      type: fieldOption.type,
      x: ptX,
      y: ptY,
      w: fieldOption.defaultW,
      h: fieldOption.defaultH
    };

    setCustomCoords(prev => ({
      ...prev,
      [activeDoc]: {
        ...(prev[activeDoc] || {}),
        [targetKey]: newBox
      }
    }));

    setSelectedField(targetKey);
    setIsFieldPickerOpen(false);
    setPendingAddPos(null);
    setIsAddMode(false);
    setSaveToast(`'${fieldOption.label}' 항목이 문서에 추가되었습니다.`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleCreateNewDoc = async () => {
    const title = newDocTitle.trim();
    if (!title) {
      alert('문서 서식 제목을 입력해주세요.');
      return;
    }
    const docId = 'doc_' + Date.now().toString(36);

    if (newDocPdfFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);
        localStorage.setItem(`visaPdfTemplate_${docId}`, b64);
      };
      reader.readAsArrayBuffer(newDocPdfFile);
    }

    let initialCoords: Record<string, PdfCoordBox> = {};
    if (newDocSelectedPreset === 'contract') {
      initialCoords = { ...PRESET_COORDS_CONTRACT };
    } else if (newDocSelectedPreset === 'reason') {
      initialCoords = { ...PRESET_COORDS_REASON };
    } else if (newDocSelectedPreset === 'attorney') {
      initialCoords = { ...PRESET_COORDS_ATTORNEY };
    }

    const newDocItem: CustomDocItem = {
      id: docId,
      title: title,
      desc: `${title} (사내 등록 서식)`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updatedCustomDocs = [...customDocs, newDocItem];
    setCustomDocs(updatedCustomDocs);
    localStorage.setItem('customDocRegistry', JSON.stringify(updatedCustomDocs));

    setCustomCoords(prev => {
      const updated = {
        ...prev,
        [docId]: initialCoords
      };
      localStorage.setItem('customPdfCoords', JSON.stringify(updated));
      return updated;
    });

    if (onUpdateCustomDocs) {
      onUpdateCustomDocs(updatedCustomDocs);
    }

    setActiveDoc(docId);
    setSelectedField(null);
    setIsNewDocModalOpen(false);
    setNewDocTitle('');
    setNewDocPdfFile(null);
    setNewDocSelectedPreset('contract');
    setSaveToast(`새 서식 '${title}'이 성공적으로 등록되었습니다!`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  const handleDeleteCustomDoc = (docId: string) => {
    const docToDelete = customDocs.find(d => d.id === docId);
    const title = docToDelete?.title || docId;
    if (confirm(`'${title}' 서식을 완전히 삭제하시겠습니까?`)) {
      const updated = customDocs.filter(d => d.id !== docId);
      setCustomDocs(updated);
      localStorage.setItem('customDocRegistry', JSON.stringify(updated));
      localStorage.removeItem(`visaPdfTemplate_${docId}`);

      setCustomCoords(prev => {
        const nextCoords = { ...prev };
        delete nextCoords[docId];
        localStorage.setItem('customPdfCoords', JSON.stringify(nextCoords));
        return nextCoords;
      });

      if (onUpdateCustomDocs) {
        onUpdateCustomDocs(updated);
      }
      setActiveDoc('income');
      setSelectedField(null);
      setSaveToast('서식이 삭제되었습니다.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const handleExportJson = () => {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      customDocs,
      customCoords,
      customTextMap,
      customLabelsMap
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    saveAs(blob, `visa_form_settings_backup_${new Date().toISOString().split('T')[0]}.json`);
    setShowMoreMenu(false);
    setSaveToast('설정 파일이 다운로드되었습니다.');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.customCoords) {
          setCustomCoords(parsed.customCoords);
          localStorage.setItem('customPdfCoords', JSON.stringify(parsed.customCoords));
        }
        if (parsed.customDocs && Array.isArray(parsed.customDocs)) {
          setCustomDocs(parsed.customDocs);
          localStorage.setItem('customDocRegistry', JSON.stringify(parsed.customDocs));
          if (onUpdateCustomDocs) onUpdateCustomDocs(parsed.customDocs);
        }
        if (parsed.customTextMap) {
          setCustomTextMap(parsed.customTextMap);
          localStorage.setItem('customPdfTextMap', JSON.stringify(parsed.customTextMap));
        }
        if (parsed.customLabelsMap) {
          setCustomLabelsMap(parsed.customLabelsMap);
          localStorage.setItem('customPdfLabelsMap', JSON.stringify(parsed.customLabelsMap));
        }
        setShowMoreMenu(false);
        setSaveToast('설정이 성공적으로 복원되었습니다!');
        setTimeout(() => setSaveToast(null), 3500);
      } catch (err: any) {
        alert('백업 파일 가져오기 실패: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      let arrayBuffer: ArrayBuffer | null = null;
      const tplB64 = localStorage.getItem(`visaPdfTemplate_${activeDoc}`);
      if (tplB64) {
        try {
          arrayBuffer = Uint8Array.from(atob(tplB64), c => c.charCodeAt(0)).buffer;
        } catch (err) {}
      } else {
        try {
          const res = await fetch(`/templates/${activeDoc}.pdf`);
          if (res.ok) arrayBuffer = await res.arrayBuffer();
        } catch (err) {}
      }

      let pdfDoc: PDFDocument;
      if (arrayBuffer) {
        pdfDoc = await PDFDocument.load(arrayBuffer);
      } else {
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        page.drawRectangle({
          x: 20, y: 780, width: 555, height: 40,
          borderColor: rgb(0.2, 0.4, 0.7), borderWidth: 1,
          color: rgb(0.96, 0.98, 1)
        });
      }

      pdfDoc.registerFontkit(fontkit);
      const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf';
      const fontRes = await fetch(fontUrl);
      const fontBuffer = await fontRes.arrayBuffer();
      const font = await pdfDoc.embedFont(fontBuffer);
      const page = pdfDoc.getPages()[0];
      const textColor = rgb(0.05, 0.15, 0.4);

      const coords = customCoords[activeDoc] || {};
      Object.entries(coords).forEach(([key, pos]: [string, any]) => {
        const { display, isChecked } = getFieldValue(key);
        if (pos.type === 'check') {
          if (isChecked || display === 'V') {
            page.drawText('V', {
              x: pos.x - 5,
              y: pos.y - 4,
              size: 11,
              font: font,
              color: textColor
            });
          }
        } else if (pos.type === 'text' && display) {
          let fontSize = 9;
          const boxWidth = pos.w || 100;
          while (fontSize > 6 && font.widthOfTextAtSize(display, fontSize) > boxWidth - 2) {
            fontSize -= 0.5;
          }
          const textW = font.widthOfTextAtSize(display, fontSize);
          const drawX = pos.x + (boxWidth / 2) - (textW / 2);
          page.drawText(display, {
            x: Math.max(pos.x, drawX),
            y: pos.y + ((pos.h || 18) / 2) - (fontSize / 3),
            size: fontSize,
            font: font,
            color: textColor
          });
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      saveAs(blob, `${activeDocTitle}_인쇄테스트.pdf`);
    } catch (e: any) {
      alert('PDF 생성 오류: ' + e.message);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredKeys = Object.keys(currentCoords).filter(key => {
    const friendly = getFieldFriendlyName(key);
    const { display } = getFieldValue(key);
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      friendly.toLowerCase().includes(q) ||
      display.toLowerCase().includes(q)
    );
  });

  const selectedPos = selectedField ? currentCoords[selectedField] : null;

  const isBuiltinDoc = ['main', 'residence', 'guarantee', 'income'].includes(activeDoc);
  const activeCustomDoc = customDocs.find(d => d.id === activeDoc);
  const activeDocTitle = isBuiltinDoc 
    ? (activeDoc === 'income' ? '직업 및 연간소득금액 신고서'
      : activeDoc === 'main' ? '통합신청서 (별지 제34호)'
      : activeDoc === 'residence' ? '거주·숙소제공 사실확인서'
      : '신원보증서')
    : (activeCustomDoc?.title || activeDoc);

  const handleSheetClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sheetRef.current) return;
    const rect = sheetRef.current.getBoundingClientRect();
    const clickXPt = Math.round((e.clientX - rect.left) / zoomScale);
    const clickYPt = Math.round(842 - ((e.clientY - rect.top) / zoomScale));

    if (clickXPt >= 0 && clickXPt <= 595 && clickYPt >= 0 && clickYPt <= 842) {
      setPendingAddPos({ x: clickXPt, y: clickYPt });
      setIsFieldPickerOpen(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm select-none">
      <div className="bg-slate-900 border border-slate-700/60 rounded-2xl w-full max-w-[98vw] h-[95vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  PDF 인쇄 좌표 및 추가 양식 등록기
                </h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 font-bold border border-blue-500/30 hidden md:inline">
                  스마트 매핑 스튜디오
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                문서 상자를 드래그하거나 방향키로 1px씩 정밀 이동하세요. 우측 패널에서 너비·높이를 즉시 변경할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveToast && (
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{saveToast}</span>
              </div>
            )}

            <button
              onClick={handleSaveToLocalStorage}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition shadow-md shadow-emerald-600/30 cursor-pointer"
              title="설정 영구 저장"
            >
              <Save className="w-3.5 h-3.5" />
              <span>좌표 저장</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              title="실제 출력 PDF 테스트 다운로드"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExporting ? '생성 중...' : 'PDF 테스트'}</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer"
                title="추가 옵션"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMoreMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1 z-50 text-xs">
                  <button
                    onClick={handleExportJson}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>설정 백업 (JSON)</span>
                  </button>
                  <label className="w-full px-3.5 py-2 text-left text-slate-300 hover:bg-slate-700 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>백업 파일 복원</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={handleImportJson} 
                    />
                  </label>
                  <div className="border-t border-slate-700 my-1" />
                  <button
                    onClick={handleResetToDefault}
                    className="w-full px-3.5 py-2 text-left text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>표준 좌표로 초기화</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 rounded-xl border border-slate-700 transition cursor-pointer"
              title="창 닫기"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Subbar: Document Tabs & Quick Controls */}
        <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 max-w-[65vw]">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">
              편집 서식:
            </span>
            {[
              { id: 'income', label: '소득신고서' },
              { id: 'main', label: '통합신청서' },
              { id: 'residence', label: '거주숙소' },
              { id: 'guarantee', label: '신원보증서' }
            ].map(doc => (
              <button
                key={doc.id}
                onClick={() => { setActiveDoc(doc.id); setSelectedField(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeDoc === doc.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <span>{doc.label}</span>
              </button>
            ))}

            {customDocs.map(cDoc => (
              <button
                key={cDoc.id}
                onClick={() => { setActiveDoc(cDoc.id); setSelectedField(null); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeDoc === cDoc.id 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                <span>{cDoc.title}</span>
              </button>
            ))}

            <button
              onClick={() => setIsNewDocModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 cursor-pointer transition whitespace-nowrap"
              title="새 서식 등록"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ 서식 추가</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-800 p-0.5 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'edit' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Move className="w-3 h-3" />
                <span>편집 모드</span>
              </button>
              <button
                onClick={() => setViewMode('print')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  viewMode === 'print' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>인쇄 뷰</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsAddMode(!isAddMode);
                if (!isAddMode) {
                  setSaveToast('문서 용지의 원하는 위치를 클릭하면 새 항목이 배치됩니다.');
                  setTimeout(() => setSaveToast(null), 3000);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                isAddMode
                  ? 'bg-amber-600 text-white border-amber-400 shadow-md animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="클릭하여 새 항목 배치"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAddMode ? '배치할 곳 클릭...' : '+ 항목 배치'}</span>
            </button>

            <div className="flex items-center bg-slate-800 px-2 py-1 rounded-xl border border-slate-700 gap-1.5 text-xs text-slate-300">
              <button
                onClick={() => setZoomScale(z => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                className="hover:text-white px-0.5 cursor-pointer font-bold"
              >
                -
              </button>
              <span className="font-mono text-[11px] w-9 text-center font-bold">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={() => setZoomScale(z => Math.min(1.4, Number((z + 0.1).toFixed(2))))}
                className="hover:text-white px-0.5 cursor-pointer font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Canvas Workspace Center */}
          <div 
            ref={canvasContainerRef}
            className={`flex-1 bg-slate-950 overflow-auto p-4 sm:p-8 flex flex-col items-center relative select-none ${
              isAddMode ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            <div className="mb-3 px-4 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-full text-xs text-slate-300 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                {isAddMode 
                  ? '문서 위 원하는 위치를 클릭하면 필드 추가 창이 열립니다.'
                  : '상자를 클릭하여 드래그하거나 우측 방향키로 1px 단위 정밀 조정을 하실 수 있습니다.'}
              </span>
            </div>

            {/* A4 Paper Sheet */}
            <div 
              ref={sheetRef}
              onClick={isAddMode ? handleSheetClick : undefined}
              style={{
                width: `${595 * zoomScale}px`,
                height: `${842 * zoomScale}px`,
                minWidth: `${595 * zoomScale}px`,
                minHeight: `${842 * zoomScale}px`,
                transformOrigin: 'top center'
              }}
              className="bg-white rounded-lg shadow-2xl relative border border-slate-300 overflow-hidden"
            >
              {/* Document Header */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-4 z-0 pointer-events-none">
                <span className="text-[11px] font-bold text-slate-600">
                  {activeDocTitle}
                </span>
                <span className="text-[10px] text-slate-400">
                  {isBuiltinDoc ? '출입국 표준 규격' : '사내 서식'}
                </span>
              </div>

              {/* Render Field Boxes */}
              {Object.entries(currentCoords).map(([key, pos]: [string, any]) => {
                const isSelected = selectedField === key;
                const { display, isChecked } = getFieldValue(key);
                const friendlyLabel = getFieldFriendlyName(key);

                const boxW = pos.w || (pos.type === 'check' ? 14 : 20);
                const boxH = pos.h || (pos.type === 'check' ? 14 : 14);

                const boxLeft = pos.type === 'check' ? pos.x - 7 : pos.x;
                const boxBottom = pos.type === 'check' ? pos.y - 7 : pos.y;
                const boxTop = 842 - boxBottom - boxH;

                const leftPct = (boxLeft / 595) * 100;
                const topPct = (boxTop / 842) * 100;
                const widthPct = (boxW / 595) * 100;
                const heightPct = (boxH / 842) * 100;

                return (
                  <div
                    key={key}
                    onMouseDown={(e) => {
                      if (e.button !== 0 || isAddMode) return;
                      setSelectedField(key);
                      setDraggingField(key);
                      dragStartRef.current = {
                        clientX: e.clientX,
                        clientY: e.clientY,
                        initialX: pos.x,
                        initialY: pos.y
                      };
                    }}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      width: `${widthPct}%`,
                      height: `${heightPct}%`
                    }}
                    className={`absolute transition-shadow cursor-grab active:cursor-grabbing group z-10 flex items-center justify-center ${
                      viewMode === 'print'
                        ? 'border border-transparent'
                        : isSelected
                        ? 'border-2 border-blue-600 bg-blue-500/20 ring-2 ring-blue-400/50 shadow-lg z-30'
                        : 'border border-blue-400/70 bg-blue-500/5 hover:border-blue-600 hover:bg-blue-500/15'
                    }`}
                    title={`${friendlyLabel} (${key})`}
                  >
                    {viewMode === 'edit' && (
                      <span 
                        className={`absolute -top-3 left-0 px-1 py-0.2 text-[8px] font-bold rounded leading-none whitespace-nowrap pointer-events-none transition shadow-sm ${
                          isSelected
                            ? 'bg-blue-600 text-white z-40'
                            : 'bg-slate-700 text-white opacity-80 group-hover:opacity-100'
                        }`}
                      >
                        {friendlyLabel}
                      </span>
                    )}

                    <div className="w-full h-full flex items-center justify-center overflow-hidden px-0.5 pointer-events-none">
                      {pos.type === 'check' ? (
                        isChecked || display === 'V' ? (
                          <span className="font-extrabold text-blue-900 leading-none" style={{ fontSize: `${Math.max(8, 11 * zoomScale)}px` }}>
                            V
                          </span>
                        ) : (
                          viewMode === 'edit' && (
                            <span className="text-slate-400 text-[8px] font-mono leading-none">
                              [ ]
                            </span>
                          )
                        )
                      ) : display ? (
                        <span 
                          className="font-bold text-slate-900 font-sans tracking-tight text-center leading-tight truncate select-none"
                          style={{ 
                            fontSize: `${Math.max(7, 9.5 * zoomScale)}px`
                          }}
                        >
                          {display}
                        </span>
                      ) : (
                        viewMode === 'edit' && (
                          <span 
                            className="text-slate-400 text-[7px] italic text-center font-sans truncate"
                          >
                            (비어있음)
                          </span>
                        )
                      )}
                    </div>

                    {viewMode === 'edit' && isSelected && (
                      <>
                        <div 
                          onClick={(e) => e.stopPropagation()}
                          className="absolute -top-10 left-0 flex items-center gap-1 bg-slate-950/95 border border-blue-500/60 shadow-2xl rounded-lg px-2 py-1 text-[10px] text-white z-[60] whitespace-nowrap pointer-events-auto backdrop-blur-md"
                        >
                          <div className="flex items-center gap-0.5 border-r border-slate-700 pr-1.5">
                            <span className="font-bold text-cyan-300 mr-0.5">폭:</span>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'w', -10)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="폭 줄이기 -10px"
                            >
                              -10
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'w', -2)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="폭 줄이기 -2px"
                            >
                              -2
                            </button>
                            <span className="font-mono text-emerald-300 font-bold px-1">{boxW}px</span>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'w', 2)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="폭 늘리기 +2px"
                            >
                              +2
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'w', 10)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="폭 늘리기 +10px"
                            >
                              +10
                            </button>
                          </div>

                          <div className="flex items-center gap-0.5 pl-0.5">
                            <span className="font-bold text-amber-300 mr-0.5">높이:</span>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'h', -10)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="높이 줄이기 -10px"
                            >
                              -10
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'h', -2)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="높이 줄이기 -2px"
                            >
                              -2
                            </button>
                            <span className="font-mono text-emerald-300 font-bold px-1">{boxH}px</span>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'h', 2)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="높이 늘리기 +2px"
                            >
                              +2
                            </button>
                            <button
                              type="button"
                              onClick={() => updateCoord(key, 'h', 10)}
                              className="px-1 py-0.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded text-[9px] font-bold text-slate-300"
                              title="높이 늘리기 +10px"
                            >
                              +10
                            </button>
                          </div>
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (e.button !== 0) return;
                            setResizingField(key);
                            setResizeDirection('width');
                            resizeStartRef.current = {
                              clientX: e.clientX,
                              clientY: e.clientY,
                              initialW: boxW,
                              initialH: boxH
                            };
                          }}
                          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-2 h-5 bg-cyan-500 border border-white rounded cursor-ew-resize shadow-md hover:scale-125 transition-transform z-50 flex items-center justify-center"
                          title="좌우 너비 조절"
                        >
                          <div className="w-0.5 h-2.5 bg-white rounded-full pointer-events-none" />
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (e.button !== 0) return;
                            setResizingField(key);
                            setResizeDirection('height');
                            resizeStartRef.current = {
                              clientX: e.clientX,
                              clientY: e.clientY,
                              initialW: boxW,
                              initialH: boxH
                            };
                          }}
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-2 bg-amber-500 border border-white rounded cursor-ns-resize shadow-md hover:scale-125 transition-transform z-50 flex items-center justify-center"
                          title="상하 높이 조절"
                        >
                          <div className="w-2.5 h-0.5 bg-white rounded-full pointer-events-none" />
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            if (e.button !== 0) return;
                            setResizingField(key);
                            setResizeDirection('both');
                            resizeStartRef.current = {
                              clientX: e.clientX,
                              clientY: e.clientY,
                              initialW: boxW,
                              initialH: boxH
                            };
                          }}
                          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-blue-600 border border-white rounded-full cursor-nwse-resize shadow-md hover:scale-125 transition-transform z-50 flex items-center justify-center"
                          title="대각선 크기 조절"
                        >
                          <div className="w-1 h-1 bg-white rounded-full pointer-events-none" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inspector Panel */}
          <div className="w-80 sm:w-88 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold text-white">
                  {selectedField ? '선택된 필드 속성 및 정밀 조정' : '문서 필드 매핑 목록'}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
                  총 {Object.keys(currentCoords).length}개
                </span>
                {!isBuiltinDoc && (
                  <button
                    onClick={() => handleDeleteCustomDoc(activeDoc)}
                    className="p-1 hover:bg-rose-950/40 text-rose-400 rounded transition"
                    title="이 서식 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {selectedField && selectedPos ? (
              <div className="flex-1 overflow-y-auto min-h-0 p-3.5 sm:p-4 space-y-4">
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="min-w-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {selectedPos.type === 'check' ? '체크박스 [V]' : '텍스트 입력칸'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white mt-1.5 truncate">
                      {getFieldFriendlyName(selectedField)}
                    </h4>
                    <span className="text-[10px] text-slate-500 font-mono">
                      키: {selectedField}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCoordField(selectedField)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/20 transition cursor-pointer shrink-0"
                    title="필드 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Box Size Control */}
                <div className="space-y-3 bg-slate-950/80 p-3 rounded-2xl border border-blue-500/30 shadow-inner">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                      <span className="font-extrabold text-white">상자 크기 조절 (너비/높이)</span>
                    </div>
                    <span className="text-[10px] text-cyan-300 font-mono font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-500/30">
                      W: {selectedPos.w || (selectedPos.type === 'check' ? 14 : 20)}px | H: {selectedPos.h || (selectedPos.type === 'check' ? 14 : 14)}px
                    </span>
                  </div>

                  {/* Width */}
                  <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-1">
                        좌우 너비 (Width):
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <input
                          type="number"
                          min="4"
                          max="550"
                          value={selectedPos.w || (selectedPos.type === 'check' ? 14 : 20)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setCoordValue(selectedField, 'w', val);
                          }}
                          className="w-16 px-1.5 py-0.5 bg-slate-950 border border-cyan-500/50 rounded text-center text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                        />
                        <span className="text-slate-400 text-[10px]">px</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'w', -10)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="너비 줄이기 10px"
                        >
                          -10
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'w', -2)}
                          className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="너비 줄이기 2px"
                        >
                          -2
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">너비 미세조절</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'w', 2)}
                          className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="너비 늘리기 2px"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'w', 10)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="너비 늘리기 10px"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Height */}
                  <div className="space-y-1.5 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-300 flex items-center gap-1">
                        상하 높이 (Height):
                      </span>
                      <div className="flex items-center gap-1 font-mono text-xs">
                        <input
                          type="number"
                          min="4"
                          max="500"
                          value={selectedPos.h || (selectedPos.type === 'check' ? 14 : 14)}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setCoordValue(selectedField, 'h', val);
                          }}
                          className="w-16 px-1.5 py-0.5 bg-slate-950 border border-amber-500/50 rounded text-center text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                        />
                        <span className="text-slate-400 text-[10px]">px</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'h', -10)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="높이 줄이기 10px"
                        >
                          -10
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'h', -2)}
                          className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="높이 줄이기 2px"
                        >
                          -2
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">높이 미세조절</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'h', 2)}
                          className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="높이 늘리기 2px"
                        >
                          +2
                        </button>
                        <button
                          type="button"
                          onClick={() => updateCoord(selectedField, 'h', 10)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-xs font-bold border border-slate-700 cursor-pointer transition"
                          title="높이 늘리기 10px"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direction Pad */}
                <div className="space-y-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/80">
                    <span className="font-bold text-slate-300">위치 이동 패드:</span>
                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setMoveStep(1)}
                        className={`px-1.5 py-0.5 rounded font-bold ${moveStep === 1 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        1px
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoveStep(5)}
                        className={`px-1.5 py-0.5 rounded font-bold ${moveStep === 5 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        5px
                      </button>
                      <button
                        type="button"
                        onClick={() => setMoveStep(10)}
                        className={`px-1.5 py-0.5 rounded font-bold ${moveStep === 10 ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                      >
                        10px
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 py-1">
                    <button
                      type="button"
                      onClick={() => updateCoord(selectedField, 'y', moveStep)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>위로 (Y+)</span>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCoord(selectedField, 'x', -moveStep)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-blue-400" />
                        <span>좌측 (X-)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => updateCoord(selectedField, 'x', moveStep)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                      >
                        <span>우측 (X+)</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateCoord(selectedField, 'y', -moveStep)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1 border border-slate-700 transition cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                      <span>아래로 (Y-)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/60">
                    <div className="flex items-center justify-between text-xs bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">X좌표:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedPos.x || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setCoordValue(selectedField, 'x', val);
                          }}
                          className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white font-mono font-bold"
                        />
                        <span className="text-[10px] text-slate-500">px</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-mono">Y좌표:</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={selectedPos.y || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setCoordValue(selectedField, 'y', val);
                          }}
                          className="w-12 px-1 py-0.5 bg-slate-950 border border-slate-700 rounded text-center text-xs text-white font-mono font-bold"
                        />
                        <span className="text-[10px] text-slate-500">px</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Key-in Editor */}
                <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">인쇄 텍스트:</span>
                    <span className="text-[10px] text-blue-400 font-medium">직접 문구 수정</span>
                  </div>
                  
                  {selectedPos.type === 'check' ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-700/60">
                      <span className="font-bold text-emerald-400">
                        {getFieldValue(selectedField).isChecked ? '체크됨 [V]' : '체크안됨 [ ]'}
                      </span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customTextMap[selectedField] !== undefined ? customTextMap[selectedField] : (getFieldValue(selectedField).display || '')}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        setCustomTextMap(prev => {
                          const updated = { ...prev, [selectedField]: newVal };
                          localStorage.setItem('customPdfTextMap', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      placeholder="출력할 텍스트를 직접 입력하세요"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-emerald-300 font-bold focus:outline-none focus:border-blue-500"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedField(null)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer border border-slate-700"
                >
                  선택 해제
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-3 border-b border-slate-800 bg-slate-900/60">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="필드명 또는 내용 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredKeys.length > 0 ? (
                    filteredKeys.map(key => {
                      const pos = currentCoords[key];
                      const isSelected = selectedField === key;
                      const { display, isChecked } = getFieldValue(key);
                      const friendly = getFieldFriendlyName(key);
                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedField(key)}
                          className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-between gap-2 border ${
                            isSelected 
                              ? 'bg-blue-600/20 border-blue-500/50' 
                              : 'bg-slate-800/40 hover:bg-slate-800 border-slate-800/60'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-white truncate">
                                {friendly}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {pos.type === 'check' 
                                ? (isChecked ? '체크됨 [V]' : '미체크')
                                : (display || '(비어있음)')
                              }
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-blue-400 translate-x-0.5' : 'text-slate-600'}`} />
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center text-xs text-slate-500">
                      일치하는 필드가 없습니다.
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-slate-800 bg-slate-900/90">
                  <button
                    onClick={() => {
                      setPendingAddPos({ x: 150, y: 500 });
                      setIsFieldPickerOpen(true);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 필드 추가 배치</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* POPUP 1: Field Picker */}
      {isFieldPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div>
                <h4 className="text-sm font-extrabold text-white">
                  배치할 인쇄 필드 선택
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  선택한 위치에 자동 입력될 필드를 선택하거나 문구를 직접 입력하세요.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsFieldPickerOpen(false);
                  setPendingAddPos(null);
                }}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pt-3 pb-2 bg-slate-950/70 border-b border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPickerTab('preset')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  pickerTab === 'preset'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>표준 서식 데이터 연결</span>
              </button>
              <button
                type="button"
                onClick={() => setPickerTab('custom')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  pickerTab === 'custom'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                <span>원하는 문구 직접 입력 (자유 양식)</span>
              </button>
            </div>

            {pickerTab === 'preset' && (
              <>
                <div className="p-3 border-b border-slate-800 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto text-xs">
                  {[
                    { id: 'all', label: '전체' },
                    { id: '인적사항 (외국인)', label: '외국인' },
                    { id: '사업장 (근무처)', label: '사업장' },
                    { id: '직무 및 소득', label: '직무/소득' },
                    { id: '날짜 및 서명', label: '날짜/서명' },
                    { id: '기타 및 체크', label: '체크박스' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setPickerCategory(cat.id)}
                      className={`px-3 py-1 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                        pickerCategory === cat.id 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="p-4 overflow-y-auto space-y-2 flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {AVAILABLE_MAPPING_FIELDS
                      .filter(f => pickerCategory === 'all' || f.category === pickerCategory)
                      .map(f => (
                        <button
                          key={f.key}
                          onClick={() => handleAddFieldToActiveDoc(f)}
                          className="p-3 rounded-xl bg-slate-800/60 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-700/60 text-left transition flex flex-col cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-blue-300">
                              {f.label}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                              {f.type === 'check' ? '체크' : '텍스트'}
                            </span>
                          </div>
                          {f.sampleValue && (
                            <div className="text-[11px] text-slate-400 mt-1 truncate">
                              예시: <span className="text-slate-300 font-medium">{f.sampleValue}</span>
                            </div>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              </>
            )}

            {pickerTab === 'custom' && (
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-200">
                  원하는 텍스트 문구나 체크 표시를 서식의 특정 위치에 자유롭게 영구 인쇄할 수 있습니다.
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    1. 항목 식별 명칭 (예: 기숙사 특약사항)
                  </label>
                  <input
                    type="text"
                    placeholder="이 항목의 제목을 적어주세요"
                    value={customKeyinLabel}
                    onChange={(e) => setCustomKeyinLabel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    2. 출력 형식 선택
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomKeyinType('text')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        customKeyinType === 'text'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>텍스트 문구 인쇄</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomKeyinType('check')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition ${
                        customKeyinType === 'check'
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>체크 표시 [V]</span>
                    </button>
                  </div>
                </div>

                {customKeyinType === 'text' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">
                      3. 실제 인쇄될 내용
                    </label>
                    <textarea
                      rows={3}
                      placeholder="예: 현대삼호 기숙사 302호 입주 확인 필"
                      value={customKeyinValue}
                      onChange={(e) => setCustomKeyinValue(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-medium resize-none"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddCustomKeyinField}
                  disabled={!customKeyinLabel.trim() && !customKeyinValue.trim()}
                  className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-md shadow-amber-600/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>이 위치에 항목 등록하기</span>
                </button>
              </div>
            )}

            <div className="p-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
              <button
                onClick={() => {
                  setIsFieldPickerOpen(false);
                  setPendingAddPos(null);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: New Document Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">
                    새 사내 서식 양식 등록
                  </h4>
                  <p className="text-xs text-slate-400">
                    근로계약서, 확인서 등 필요한 서식을 추가합니다.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  1. 서식 명칭 입력 *
                </label>
                <input
                  type="text"
                  placeholder="예: 사내 블록공정 근로계약서"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  2. 시작 템플릿 프리셋
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewDocSelectedPreset('contract');
                      if (!newDocTitle) setNewDocTitle('표준근로계약서');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newDocSelectedPreset === 'contract'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-extrabold">근로계약서 양식</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">기본 고용계약 좌표</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewDocSelectedPreset('reason');
                      if (!newDocTitle) setNewDocTitle('체류사유서');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newDocSelectedPreset === 'reason'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-extrabold">체류사유서 양식</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">사유서 텍스트 좌표</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewDocSelectedPreset('attorney');
                      if (!newDocTitle) setNewDocTitle('위임장 (출입국)');
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newDocSelectedPreset === 'attorney'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-extrabold">위임장 양식</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">대리인 위임장 좌표</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewDocSelectedPreset('blank')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col ${
                      newDocSelectedPreset === 'blank'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs font-extrabold">빈 양식</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">처음부터 직접 배치</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300">
                  3. 양식 PDF 파일 업로드 (선택사항)
                </label>
                <div className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-slate-400 truncate max-w-[200px]">
                    {newDocPdfFile ? newDocPdfFile.name : '선택된 파일 없음'}
                  </div>
                  <label className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0">
                    <span>PDF 선택</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setNewDocPdfFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsNewDocModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleCreateNewDoc}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
              >
                <span>서식 생성</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

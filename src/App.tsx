import React from 'react';
import { 
  Home, Users, Plus, Camera, Upload, 
  AlertTriangle, Check, CheckCircle2, RotateCw, Info, HelpCircle,
  FileText, Download, ArrowRight, Loader2, Search, X, 
  FileSpreadsheet, Sparkles, CheckSquare, Edit3, Milestone,
  Building2, ShieldCheck, FileUp, Eye,
  Crosshair, Briefcase, ChevronRight, ChevronLeft, EyeOff,
  Globe, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

import { FormData, EmployeeDBItem, VerificationIssue, VerificationResponse, WorkplaceProfile } from './types';
import { i18nDict, LangCode, reqNames, docMatrix } from './i18n';
import { DocInfoModal } from './components/DocInfoModal';
import { DBModal } from './components/DBModal';
import { DatePicker } from './components/DatePicker';
import { CameraModal } from './components/CameraModal';
import { WorkplaceModal } from './components/WorkplaceModal';
import { PrivacyModal } from './components/PrivacyModal';
import { TemplateManagerModal } from './components/TemplateManagerModal';
import { PdfDebugModal } from './components/PdfDebugModal';
import { CountryFlagPicker } from './components/CountryFlagPicker';
import { LanguageFlagPicker } from './components/LanguageFlagPicker';
import { CompanyDocRequestModal } from './components/CompanyDocRequestModal';
import { PdfPreviewModal } from './components/PdfPreviewModal';
import { GovDocGuideModal } from './components/GovDocGuideModal';
import { saveEmployee } from './firebase';

import { 
  initialFormData, 
  PDF_COORDS_MAIN, 
  PDF_COORDS_RESIDENCE, 
  PDF_COORDS_GUARANTEE, 
  PDF_COORDS_INCOME,
  DEFAULT_WORKPLACES,
  SHIPYARD_JOB_CODES,
  CustomDocItem,
  BUILTIN_PRESET_DOCS,
  resolveFieldValueForCoord
} from './constants/formConstants';

import { 
  renderE74RRecommend, 
  renderE74RScoreSheet, 
  renderE74RPersonalStmt, 
  renderE74RCompanyRecommend, 
  renderLaborContract, 
  renderEmploymentCert 
} from './utils/pdfDocRenderers';

export default function App() {
  const [step, setStep] = React.useState<number | 'excel'>(0);
  const [isBatchMode, setIsBatchMode] = React.useState<boolean>(false);
  const [currentLang, setCurrentLang] = React.useState<LangCode>('kr');
  const [formData, setFormData] = React.useState<FormData>(initialFormData);

  const [isOCRProcessing, setIsOCRProcessing] = React.useState(false);
  const [isVerifyProcessing, setIsVerifyProcessing] = React.useState(false);
  const [isExcelProcessing, setIsExcelProcessing] = React.useState(false);

  // Modals state
  const [isDocInfoOpen, setIsDocInfoOpen] = React.useState(false);
  const [activeDocInfoType, setActiveDocInfoType] = React.useState<string>('chk_extension');
  const [isDBModalOpen, setIsDBModalOpen] = React.useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = React.useState(false);
  const [isWorkplaceModalOpen, setIsWorkplaceModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [isDebugModalOpen, setIsDebugModalOpen] = React.useState(false);
  const [debugModalDocType, setDebugModalDocType] = React.useState<string>('income');

  // PDF Preview Modal State
  const [previewPdfState, setPreviewPdfState] = React.useState<{
    isOpen: boolean;
    url: string | null;
    title: string;
    filename?: string;
  }>({
    isOpen: false,
    url: null,
    title: '',
    filename: ''
  });

  const handleOpenPdfPreview = (url: string, title: string, filename?: string) => {
    setPreviewPdfState({
      isOpen: true,
      url,
      title,
      filename
    });
  };

  // Company Document Request Modal State
  const [isCompanyDocModalOpen, setIsCompanyDocModalOpen] = React.useState(false);
  const [companyDocModalTargets, setCompanyDocModalTargets] = React.useState<string[]>([]);

  const handleOpenCompanyDocRequest = (docs?: string[]) => {
    if (docs && docs.length > 0) {
      setCompanyDocModalTargets(docs);
    } else {
      const currentDocList = docMatrix[formData.visaType]?.[formData.reqType] || docMatrix[formData.visaType]?.['default'] || [];
      const compDocs = currentDocList.filter(d => d.type === 'company').map(d => d.name.kr);
      setCompanyDocModalTargets(compDocs.length > 0 ? compDocs : [
        '표준근로계약서 사본',
        '재직증명서',
        '사업자등록증 사본',
        '국세 납세증명서 (체납 없음 확인용)',
        '지방세 납세증명서',
        '4대 사회보험 사업장 가입자 명부',
        '고용허가서 사본 (E-9)',
        '고용기업 추천서 (직인 날인)'
      ]);
    }
    setIsCompanyDocModalOpen(true);
  };

  // Government Document Issuance Guide Modal State
  const [isGovGuideModalOpen, setIsGovGuideModalOpen] = React.useState(false);
  const [govGuideTargetDoc, setGovGuideTargetDoc] = React.useState<string | undefined>(undefined);

  const handleOpenGovGuide = (docName?: string) => {
    setGovGuideTargetDoc(docName);
    setIsGovGuideModalOpen(true);
  };

  // Custom Registered Documents State
  const [customDocList, setCustomDocList] = React.useState<CustomDocItem[]>(() => {
    try {
      const saved = localStorage.getItem('customDocRegistry');
      if (saved) {
        const parsed: CustomDocItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const missing = BUILTIN_PRESET_DOCS.filter(b => !parsed.some(p => p.id === b.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('customDocRegistry', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [...BUILTIN_PRESET_DOCS];
  });

  // Workplaces state
  const [workplaces, setWorkplaces] = React.useState<WorkplaceProfile[]>(() => {
    try {
      const saved = localStorage.getItem('visaWorkplaces');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const missing = DEFAULT_WORKPLACES.filter(d => !parsed.some(p => p.id === d.id));
          if (missing.length > 0) {
            const merged = [...parsed, ...missing];
            localStorage.setItem('visaWorkplaces', JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      }
    } catch(e) {}
    return DEFAULT_WORKPLACES;
  });

  const [selectedWorkplaceId, setSelectedWorkplaceId] = React.useState<string>('gayoung_tech');

  // Privacy & Masking toggles
  const [maskArc, setMaskArc] = React.useState<boolean>(true);

  const [msgDialog, setMsgDialog] = React.useState<{ isOpen: boolean; title: string; desc: string; type: 'info' | 'error' | 'success' }>({
    isOpen: false,
    title: '',
    desc: '',
    type: 'info'
  });

  const [confirmDialog, setConfirmDialog] = React.useState<{ isOpen: boolean; title: string; desc: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    desc: '',
    onConfirm: () => {}
  });

  // AI Verification issues and error highlights
  const [issues, setIssues] = React.useState<VerificationIssue[]>([]);
  const [verificationPassed, setVerificationPassed] = React.useState<boolean | null>(null);
  const [errorHighlights, setErrorHighlights] = React.useState<Set<string>>(new Set());
  const [activePickerSection, setActivePickerSection] = React.useState<'personal' | 'dorm' | 'guar' | null>(null);

  // Attachments for Step 5 AI cross-checking
  const [attachments, setAttachments] = React.useState<{ id: string; name: string; base64: string; mimeType: string }[]>([]);

  // Selected PDFs to download in Step 6
  const [selectedDocs, setSelectedDocs] = React.useState<Record<string, boolean>>({
    main: true,
    residence: true,
    guarantee: false,
    income: true
  });

  const [downloadLinks, setDownloadLinks] = React.useState<{ name: string; url: string; filename: string }[]>([]);
  const [checkedRequiredDocs, setCheckedRequiredDocs] = React.useState<Record<string, boolean>>({});

  // Load auto-save values on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('visaAutoSave');
      if (saved) {
        setFormData(prev => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync chosen papers based on step changes
  React.useEffect(() => {
    if (step === 6) {
      const isResNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg', 'chk_change_status'].includes(formData.reqType);
      const isGuarNeeded = ['E-7-4R', 'E-7-3', 'E-7-4', 'E-7'].includes(formData.visaType) && ['chk_extension', 'chk_change_status'].includes(formData.reqType);
      const isIncomeNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg', 'chk_change_status'].includes(formData.reqType);
      const isE74R = formData.visaType === 'E-7-4R';
      const isShipyardE7 = ['E-7-4R', 'E-7-3', 'E-7-4'].includes(formData.visaType);

      setSelectedDocs(prev => ({
        main: true,
        residence: isResNeeded,
        guarantee: isGuarNeeded,
        income: isIncomeNeeded,
        e74r_recommend: isE74R,
        e74r_score_sheet: isE74R,
        e74r_personal_stmt: isE74R,
        e74r_company_recommend: isE74R,
        contract_std: true,
        employment_cert: isShipyardE7,
        ...prev
      }));
    }
  }, [step, formData.reqType, formData.visaType]);

  const handleSaveWorkplaces = (wps: WorkplaceProfile[]) => {
    setWorkplaces(wps);
    try {
      localStorage.setItem('visaWorkplaces', JSON.stringify(wps));
    } catch(e) {}
  };

  const handleSelectWorkplace = (wp: WorkplaceProfile) => {
    setSelectedWorkplaceId(wp.id);
    handleFormChange('i_cname', wp.name);
    handleFormChange('i_cregno', wp.regNo);
    handleFormChange('i_rep_name', wp.repName);
    handleFormChange('i_rep_id', wp.repIdMasked || '650101-1******');
    handleFormChange('i_rep_gender', wp.repGender);
    handleFormChange('i_caddr', wp.address);
    handleFormChange('i_cphone', wp.phone);
  };

  const t = (key: string): string => {
    return i18nDict[currentLang]?.[key] || key;
  };

  const handleFormChange = (key: keyof FormData, value: any) => {
    let processedValue = value;
    if (['i_surname', 'i_givenname', 'i_nation', 'i_passport', 'i_address_home', 'i_email', 'val_change_status'].includes(key)) {
      processedValue = typeof value === 'string' ? value.toUpperCase() : value;
    }

    const updated = { ...formData, [key]: processedValue };
    setFormData(updated);

    try {
      localStorage.setItem('visaAutoSave', JSON.stringify(updated));
    } catch(e) {}

    if (errorHighlights.has(key)) {
      const updatedSet = new Set(errorHighlights);
      updatedSet.delete(key);
      setErrorHighlights(updatedSet);
    }
  };

  const showConfirm = (title: string, desc: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, title, desc, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
  };

  const handleHomeClick = () => {
    showConfirm(
      '첫 화면으로 이동',
      '작성 중인 내용이 저장됩니다. 첫 화면으로 이동하시겠습니까?',
      () => {
        setStep(0);
      }
    );
  };

  const handleConfirmOk = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  const showAlert = (title: string, desc: string, type: 'info' | 'error' | 'success' = 'info') => {
    setMsgDialog({ isOpen: true, title, desc, type });
  };

  const closeAlert = () => {
    setMsgDialog(prev => ({ ...prev, isOpen: false }));
  };

  const isNewWorkplaceNeeded = ['chk_change_work', 'chk_change_status'].includes(formData.reqType);
  const isDormNeeded = ['chk_extension', 'chk_change_work', 'chk_alien_reg'].includes(formData.reqType);
  const isFamilyProxyNeeded = formData.submitter !== 'self';
  const isReentryPeriodNeeded = formData.reqType === 'chk_reentry';
  const isRefundAccountNeeded = ['chk_alien_reg', 'chk_reissue'].includes(formData.reqType);
  const isGuaranteeNeeded = formData.visaType === 'E-7' && ['chk_extension', 'chk_change_status'].includes(formData.reqType);

  const formatPhoneNumber = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.startsWith('02')) {
      if (raw.length <= 2) return raw;
      if (raw.length <= 5) return `${raw.slice(0, 2)}-${raw.slice(2)}`;
      if (raw.length <= 9) return `${raw.slice(0, 2)}-${raw.slice(2, 5)}-${raw.slice(5)}`;
      return `${raw.slice(0, 2)}-${raw.slice(2, 6)}-${raw.slice(6, 10)}`;
    } else {
      if (raw.length <= 3) return raw;
      if (raw.length <= 6) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
      if (raw.length <= 10) return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
      return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
    }
  };

  const formatRegNo = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 6) return raw;
    return `${raw.slice(0, 6)}-${raw.slice(6, 13)}`;
  };

  const formatBusinessNo = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (raw.length <= 3) return raw;
    if (raw.length <= 5) return `${raw.slice(0, 3)}-${raw.slice(3)}`;
    return `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5, 10)}`;
  };

  const formatMoney = (val: string): string => {
    const raw = val.replace(/[^0-9]/g, '');
    if (!raw) return '';
    return Number(raw).toLocaleString('en-US');
  };

  const handleSaveToDB = async () => {
    if (!formData.i_arc || !formData.i_surname) return;
    try {
      const updatedItem: EmployeeDBItem = {
        ...formData,
        lastUpdated: new Date().toISOString().split('T')[0]
      };
      await saveEmployee(updatedItem);
    } catch(err) {
      console.error('Failed to save to database:', err);
    }
  };

  const handleLoadItem = (item: EmployeeDBItem) => {
    setFormData(item);
    setIsDBModalOpen(false);
    setErrorHighlights(new Set());
    showAlert('불러오기 완료', `${item.i_surname} 근로자의 서식 정보가 로드되었습니다.`, 'success');
  };

  const handleDeleteItem = (arc: string) => {
    try {
      const dbStr = localStorage.getItem('visa_employee_db') || '[]';
      let db: EmployeeDBItem[] = JSON.parse(dbStr);
      db = db.filter(e => e.i_arc !== arc);
      localStorage.setItem('visa_employee_db', JSON.stringify(db));
    } catch(err) {
      console.error(err);
    }
  };

  const processOCRFile = async (file: File) => {
    setIsOCRProcessing(true);
    setErrorHighlights(new Set());
    try {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/gemini/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType: file.type })
      });

      if (!response.ok) {
        throw new Error('AI OCR 처리 응답이 올바르지 않습니다.');
      }

      const rawResult = await response.json();
      
      setFormData(prev => ({
        ...prev,
        i_surname: rawResult.i_surname || prev.i_surname,
        i_givenname: rawResult.i_givenname || prev.i_givenname,
        i_dob: rawResult.i_dob || prev.i_dob,
        i_gender: (rawResult.i_gender === 'M' || rawResult.i_gender === 'F') ? rawResult.i_gender : prev.i_gender,
        i_nation: rawResult.i_nation || prev.i_nation,
        i_arc: rawResult.i_arc ? formatRegNo(rawResult.i_arc) : prev.i_arc,
        i_passport: rawResult.i_passport || prev.i_passport,
        i_pass_issue: rawResult.i_pass_issue || prev.i_pass_issue,
        i_pass_exp: rawResult.i_pass_exp || prev.i_pass_exp,
        i_address_kr: rawResult.i_address_kr || prev.i_address_kr,
        i_cellphone: rawResult.i_cellphone ? formatPhoneNumber(rawResult.i_cellphone) : prev.i_cellphone,
        i_cname: rawResult.i_cname || prev.i_cname,
        i_cregno: rawResult.i_cregno ? formatBusinessNo(rawResult.i_cregno) : prev.i_cregno,
        i_rep_name: rawResult.i_rep_name || prev.i_rep_name,
        i_rep_id: rawResult.i_rep_id ? formatRegNo(rawResult.i_rep_id) : prev.i_rep_id,
        i_caddr: rawResult.i_caddr || prev.i_caddr,
        i_cphone: rawResult.i_cphone ? formatPhoneNumber(rawResult.i_cphone) : prev.i_cphone,
        i_job: rawResult.i_job || prev.i_job,
        i_job_code: rawResult.i_job_code || prev.i_job_code,
        i_income: rawResult.i_income || prev.i_income,
        i_dorm_start: rawResult.i_dorm_start || prev.i_dorm_start,
        visaType: (['E-7-4R', 'E-7-3', 'E-7-4', 'E-9', 'E-7', 'F-2-R'].includes(rawResult.visaType) ? rawResult.visaType : prev.visaType)
      }));

      showAlert(
        'AI 신분증 인식 성공', 
        '신분증에서 이름, 등록번호, 주소 등을 자동으로 추출하여 입력했습니다.', 
        'success'
      );
    } catch(err: any) {
      showAlert('OCR 인식 오류', err.message || '인식 처리에 실패했습니다.', 'error');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const handleOCRFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processOCRFile(file);
    e.target.value = '';
  };

  const handleVerify = async () => {
    if (attachments.length === 0) {
      showAlert('서류 필요', '교차 검증을 위해 최소 1건 이상의 증빙서류 사진 또는 PDF를 등록해주세요.', 'info');
      return;
    }

    setIsVerifyProcessing(true);
    setIssues([]);
    setVerificationPassed(null);
    setErrorHighlights(new Set());

    try {
      const response = await fetch('/api/gemini/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: attachments,
          formData: formData,
          language: currentLang === 'kr' ? 'Korean' : currentLang === 'vn' ? 'Vietnamese' : currentLang === 'ne' ? 'Nepali' : 'English'
        })
      });

      if (!response.ok) {
        throw new Error('AI 검증 서버 응답 오류');
      }

      const data: VerificationResponse = await response.json();
      
      setIssues(data.issues || []);
      if (data.status === 'PASS' || !data.issues || data.issues.length === 0) {
        setVerificationPassed(true);
        showAlert('AI 검증 완료 (100% 일치)', '입력값과 증빙서류 간 불일치가 없습니다. 안심하고 다음 단계로 진행하세요.', 'success');
      } else {
        setVerificationPassed(false);
        const highlights = new Set<string>();
        data.issues.forEach(i => {
          if (i.fieldId) highlights.add(String(i.fieldId));
        });
        setErrorHighlights(highlights);
        showAlert(
          t('ai_msg_fail_title'),
          `${t('ai_msg_fail_desc')} (발견된 불일치: ${data.issues.length}건)`,
          'info'
        );
      }
    } catch (err: any) {
      showAlert(t('ai_msg_err_title'), t('ai_msg_err_desc'), 'error');
    } finally {
      setIsVerifyProcessing(false);
    }
  };

  const handleNextStep = (next: number | 'excel') => {
    if (typeof next === 'number' && next > 1 && next < 6) {
      handleSaveToDB();
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = (prev: number | 'excel') => {
    setStep(prev);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetData = () => {
    showConfirm(
      '입력 데이터 초기화', 
      '작성 중인 모든 근로자 정보가 지워집니다. 진행하시겠습니까?', 
      () => {
        setFormData(initialFormData);
        try {
          localStorage.removeItem('visaAutoSave');
        } catch(e) {}
        setErrorHighlights(new Set());
        setAttachments([]);
        setIssues([]);
        setVerificationPassed(null);
        setDownloadLinks([]);
        setStep(0);
        showAlert('초기화 완료', '모든 입력 내용이 초기화되었습니다.', 'success');
      }
    );
  };

  const isPdfBytes = (buf: ArrayBuffer | null): boolean => {
    if (!buf || buf.byteLength < 5) return false;
    const u8 = new Uint8Array(buf);
    return u8[0] === 0x25 && u8[1] === 0x50 && u8[2] === 0x44 && u8[3] === 0x46 && u8[4] === 0x2D;
  };

  const drawSingleDocBlob = async (docType: string, fontBuffer: ArrayBuffer, customFormData: FormData): Promise<Blob> => {
    let arrayBuffer: ArrayBuffer | null = null;
    const tplB64 = localStorage.getItem(`visaPdfTemplate_${docType}`);
    
    if (tplB64) {
      try {
        const decoded = Uint8Array.from(atob(tplB64), c => c.charCodeAt(0)).buffer;
        if (isPdfBytes(decoded)) {
          arrayBuffer = decoded;
        }
      } catch (err) {
        console.error("Local storage template error", err);
      }
    } else if (['main', 'residence', 'guarantee'].includes(docType)) {
      try {
        const res = await fetch(`/templates/${docType}.pdf`);
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && !contentType.includes('text/html')) {
          const buf = await res.arrayBuffer();
          if (isPdfBytes(buf)) {
            arrayBuffer = buf;
          }
        }
      } catch {
        // Proceed to vector build fallback
      }
    }

    if (arrayBuffer && isPdfBytes(arrayBuffer)) {
      try {
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        pdfDoc.registerFontkit(fontkit);
        const font = await pdfDoc.embedFont(fontBuffer);
        const page = pdfDoc.getPages()[0];
        const inkColor = rgb(0.1, 0.2, 0.85);

        let coords = docType === 'main' 
          ? PDF_COORDS_MAIN 
          : (docType === 'residence' 
            ? PDF_COORDS_RESIDENCE 
            : (docType === 'guarantee' 
              ? PDF_COORDS_GUARANTEE 
              : (docType === 'income' ? PDF_COORDS_INCOME : {})));

        let customTextMap: Record<string, string> = {};
        try {
          const savedText = localStorage.getItem('customPdfTextMap');
          if (savedText) customTextMap = JSON.parse(savedText);
        } catch (e) {}

        try {
          const savedCustom = localStorage.getItem('customPdfCoords');
          if (savedCustom) {
            const parsed = JSON.parse(savedCustom);
            if (parsed && parsed[docType]) {
              coords = parsed[docType];
            }
          }
        } catch (e) {
          console.error("Failed to load custom coordinates:", e);
        }

        const drawBox = (coordKey: string, text: string) => {
          if (!text) return;
          const pos = (coords as any)[coordKey];
          if (!pos) return;

          if (pos.type === 'check') {
            page.drawText('V', { x: pos.x - 5, y: pos.y - 5, size: 12, font, color: inkColor });
            return;
          }

          if (pos.type === 'text' && pos.w && pos.h) {
            const str = String(text).trim();
            let fontSize = 9;
            const textW = font.widthOfTextAtSize(str, fontSize);
            let drawX = pos.x + (pos.w / 2) - (textW / 2);
            if (drawX < pos.x) drawX = pos.x;

            page.drawText(str, {
              x: drawX,
              y: pos.y + (pos.h / 2) - (fontSize / 3),
              size: fontSize,
              font,
              color: inkColor
            });
          }
        };

        const getUpperVal = (valStr: string) => (valStr || '').toUpperCase();
        const fullFName = getUpperVal(customFormData.i_surname) + ' ' + getUpperVal(customFormData.i_givenname);
        const today = new Date();
        const ty = String(today.getFullYear());
        const tm = String(today.getMonth() + 1);
        const td = String(today.getDate());

        if (docType === 'main') {
          const reqType = customFormData.reqType;
          if (reqType) drawBox(reqType, 'check');
          if (reqType === 'chk_change_status') {
            drawBox('val_change_status', getUpperVal(customFormData.val_change_status));
          }
          drawBox('surname', getUpperVal(customFormData.i_surname));
          drawBox('givenname', getUpperVal(customFormData.i_givenname));
          
          const dob = customFormData.i_dob;
          if (dob) {
            const p = dob.split('-');
            if (p.length === 3) {
              drawBox('dob_yyyy', p[0]);
              drawBox('dob_mm', p[1]);
              drawBox('dob_dd', p[2]);
            }
          }

          if (customFormData.i_gender === 'M') drawBox('gender_m', 'check');
          if (customFormData.i_gender === 'F') drawBox('gender_f', 'check');
          drawBox('nation', getUpperVal(customFormData.i_nation));

          const arcRaw = (customFormData.i_arc || '').replace(/-/g, '');
          for (let i = 0; i < arcRaw.length; i++) {
            if (i < 13) drawBox(`arc_${i + 1}`, arcRaw[i]);
          }

          drawBox('passport', getUpperVal(customFormData.i_passport));
          drawBox('pass_issue', customFormData.i_pass_issue);
          drawBox('pass_exp', customFormData.i_pass_exp);
          drawBox('address_kr', customFormData.i_address_kr);
          drawBox('phone', customFormData.i_phone);
          drawBox('cellphone', customFormData.i_cellphone);
          drawBox('address_home', getUpperVal(customFormData.i_address_home));
          drawBox('home_phone', customFormData.i_home_phone);
          drawBox('cname', customFormData.i_cname);
          drawBox('cregno', customFormData.i_cregno);
          drawBox('cphone', customFormData.i_cphone);
          drawBox('new_cname', customFormData.i_new_cname);
          drawBox('new_cregno', customFormData.i_new_cregno);
          drawBox('new_cphone', customFormData.i_new_cphone);
          drawBox('job', customFormData.i_job);
          drawBox('income', (customFormData.i_income || '').replace(/,/g, ''));
          drawBox('reentry_period', customFormData.i_reentry_period);
          drawBox('email', getUpperVal(customFormData.i_email));

          let refundStr = '';
          if (customFormData.i_refund_bank || customFormData.i_refund_acc) {
            refundStr = `${customFormData.i_refund_bank} / ${customFormData.i_refund_acc}`.replace(/^ \/ | \/ $/g, '');
          }
          drawBox('refund_acc', refundStr);
          drawBox('app_date', `${ty}.${tm}.${td}`);
          drawBox('sign_main', fullFName);

          const submitter = customFormData.submitter || 'self';
          if (submitter === 'self') {
            drawBox('sign_sub_1', fullFName);
          } else if (submitter === 'spouse') {
            drawBox('sign_sub_2', getUpperVal(customFormData.i_spouse));
          } else if (submitter === 'parents') {
            drawBox('sign_sub_3', getUpperVal(customFormData.i_parents));
          }
        } else if (docType === 'residence') {
          drawBox('f_nation', getUpperVal(customFormData.i_nation));
          drawBox('f_name', fullFName);
          drawBox('f_arc', customFormData.i_arc);
          drawBox('f_phone', customFormData.i_cellphone);
          drawBox('f_addr', customFormData.i_address_kr);
          drawBox('p_id', customFormData.i_rep_id);
          drawBox('p_nation', '대한민국');

          let pNameStr = customFormData.i_cname;
          if (customFormData.i_rep_name) pNameStr += ` (${customFormData.i_rep_name})`;
          drawBox('p_name', pNameStr);
          drawBox('p_phone', customFormData.i_cphone);
          drawBox('rel_employer', 'check');

          if (customFormData.r_own) drawBox(customFormData.r_own, 'check');
          if (customFormData.r_type) drawBox(customFormData.r_type, 'check');

          const start = customFormData.i_dorm_start;
          if (start) {
            const p = start.split('-');
            if (p.length === 3) {
              drawBox('start_y', p[0]);
              drawBox('start_m', p[1]);
              drawBox('start_d', p[2]);
            }
          }
          drawBox('sign_y', ty);
          drawBox('sign_m', tm);
          drawBox('sign_d', td);
          drawBox('p_sign_name', customFormData.i_rep_name);
          drawBox('p_company', customFormData.i_cname);
        } else if (docType === 'guarantee') {
          drawBox('f_surname', getUpperVal(customFormData.i_surname));
          drawBox('f_givenname', getUpperVal(customFormData.i_givenname));
          if (customFormData.i_gender === 'M') drawBox('f_sex_m', 'check');
          if (customFormData.i_gender === 'F') drawBox('f_sex_f', 'check');
          drawBox('f_dob', customFormData.i_dob);
          drawBox('f_nation', getUpperVal(customFormData.i_nation));
          drawBox('f_pass', getUpperVal(customFormData.i_passport));
          drawBox('f_phone', customFormData.i_cellphone);
          drawBox('f_addr', customFormData.i_address_kr);
          drawBox('f_purpose', '체류자격 연장 및 체류관리 보증');
          drawBox('p_name', customFormData.i_rep_name);
          drawBox('p_nation', '대한민국');
          if (customFormData.i_rep_gender === 'M') drawBox('p_sex_m', 'check');
          if (customFormData.i_rep_gender === 'F') drawBox('p_sex_f', 'check');
          drawBox('p_dob', customFormData.i_rep_id);
          drawBox('p_phone', customFormData.i_cphone);
          drawBox('p_addr', customFormData.i_caddr);
          drawBox('p_rel', '고용주 (대표이사)');
          
          const periodStr = (customFormData.i_guar_start && customFormData.i_guar_end)
            ? `${customFormData.i_guar_start} ~ ${customFormData.i_guar_end}`
            : '체류기간 만료일까지 (2년)';
          drawBox('p_period', periodStr);
          drawBox('p_company', customFormData.i_cname);
          drawBox('p_job', '대표이사');
          drawBox('p_caddr', customFormData.i_caddr);
          drawBox('sign_y', ty);
          drawBox('sign_m', tm);
          drawBox('sign_d', td);
          drawBox('p_sign_name', customFormData.i_rep_name);
        } else if (docType === 'income') {
          drawBox('f_name', fullFName);
          drawBox('f_arc', customFormData.i_arc);
          drawBox('f_nation', getUpperVal(customFormData.i_nation));
          drawBox('f_sojourn_status', customFormData.visaType);
          drawBox('f_visa', customFormData.visaType);
          drawBox('f_phone', customFormData.i_cellphone || customFormData.i_phone);
          drawBox('f_email', getUpperVal(customFormData.i_email));
          drawBox('c_regno', customFormData.i_cregno);
          drawBox('c_name', customFormData.i_cname);
          drawBox('job_code', customFormData.i_job_code || '7431');
          drawBox('c_job_code', customFormData.i_job_code || '7431');
          drawBox('job_title', customFormData.i_job || '선체도장공');
          drawBox('c_job', customFormData.i_job || '선체도장공');
          const annualIncomeWon = customFormData.i_income ? `${customFormData.i_income}0,000` : '36,000,000';
          drawBox('annual_income', annualIncomeWon);
          drawBox('c_income_won', annualIncomeWon);
          drawBox('income_tax_proof', 'check');
          drawBox('c_income_bracket', 'check');
          drawBox('sign_y', ty);
          drawBox('sign_m', tm);
          drawBox('sign_d', td);
          drawBox('declarant_name', fullFName);
          drawBox('f_sign', fullFName);
        } else {
          Object.keys(coords || {}).forEach(k => {
            const res = resolveFieldValueForCoord(k, customFormData, customTextMap);
            if (res.isChecked || res.display) {
              drawBox(k, res.isChecked ? 'check' : res.display);
            }
          });
        }

        const pdfBytes = await pdfDoc.save();
        return new Blob([pdfBytes as any], { type: 'application/pdf' });
      } catch (err: any) {
        console.warn(`Template load skipped for ${docType}, building vector document:`, err?.message || err);
      }
    }

    // High quality vector fallback renderer
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const font = await pdfDoc.embedFont(fontBuffer);

    if (docType === 'e74r_recommend') {
      await renderE74RRecommend(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    } else if (docType === 'e74r_score_sheet') {
      await renderE74RScoreSheet(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    } else if (docType === 'e74r_personal_stmt') {
      await renderE74RPersonalStmt(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    } else if (docType === 'e74r_company_recommend') {
      await renderE74RCompanyRecommend(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    } else if (docType === 'contract_std') {
      await renderLaborContract(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    } else if (docType === 'employment_cert') {
      await renderEmploymentCert(pdfDoc, font, customFormData);
      return new Blob([(await pdfDoc.save()) as any], { type: 'application/pdf' });
    }

    const page = pdfDoc.addPage([595, 842]);
    page.drawRectangle({
      x: 35, y: 740, width: 525, height: 60,
      color: rgb(0.05, 0.12, 0.28)
    });

    const docTypeTitles: Record<string, string> = {
      main: '통합신청서 (별지 제34호 서식)',
      residence: '거주·숙소제공 사실확인서',
      guarantee: '신원보증서 (별지 제129호 서식)',
      income: '직업 및 연간 소득금액 신고서'
    };
    const docDisplayTitle = docTypeTitles[docType] || customDocList.find(d => d.id === docType)?.title || '출입국 제출용 표준 서식';

    page.drawText('HD HYUNDAI SAMHO IMMIGRATION SYSTEM', { x: 50, y: 775, size: 9, font, color: rgb(0.48, 0.81, 0.29) });
    page.drawText(docDisplayTitle, { x: 50, y: 752, size: 12, font, color: rgb(1,1,1) });

    const drawRow = (label: string, value: string, yPos: number, isSection: boolean = false) => {
      if (isSection) {
        page.drawRectangle({ x: 35, y: yPos - 3, width: 525, height: 18, color: rgb(0.92, 0.95, 0.98) });
        page.drawText(label, { x: 42, y: yPos, size: 9, font, color: rgb(0.1, 0.2, 0.4) });
      } else {
        page.drawLine({ start: { x: 35, y: yPos - 6 }, end: { x: 560, y: yPos - 6 }, color: rgb(0.92, 0.92, 0.92) });
        page.drawText(label, { x: 42, y: yPos, size: 9, font, color: rgb(0.3, 0.4, 0.5) });
        page.drawText(value || '-', { x: 200, y: yPos, size: 9, font, color: rgb(0.1, 0.1, 0.15) });
      }
    };

    let curY = 700;
    drawRow('1. 외국인 인적사항 (Foreigner Details)', '', curY, true); curY -= 25;
    drawRow('성명 (Full Name)', `${customFormData.i_surname} ${customFormData.i_givenname}`.toUpperCase(), curY); curY -= 18;
    drawRow('외국인등록번호 (ARC No.)', customFormData.i_arc, curY); curY -= 18;
    drawRow('여권번호 (Passport No.)', customFormData.i_passport, curY); curY -= 18;
    drawRow('생년월일 및 성별', `${customFormData.i_dob || '-'} / ${customFormData.i_gender === 'M' ? '남 (M)' : '여 (F)'}`, curY); curY -= 18;
    drawRow('국적 (Nationality)', customFormData.i_nation, curY); curY -= 18;
    drawRow('체류자격 및 신청업무', `${customFormData.visaType} / ${reqNames[customFormData.reqType] || customFormData.reqType}`, curY); curY -= 18;
    drawRow('체류지 주소 (Korea Address)', customFormData.i_address_kr, curY); curY -= 25;

    drawRow('2. 사업장 및 소득신고 (Workplace & Income)', '', curY, true); curY -= 25;
    drawRow('회사 상호 (Company Name)', customFormData.i_cname, curY); curY -= 18;
    drawRow('사업자등록번호 (Business Reg. No.)', customFormData.i_cregno, curY); curY -= 18;
    drawRow('대표자 성명 (Representative)', customFormData.i_rep_name, curY); curY -= 18;
    drawRow('대표자 식별번호', customFormData.i_rep_id || '보안 마스킹', curY); curY -= 18;
    drawRow('직종 및 직업코드', `${customFormData.i_job || '기능인력'} (KSCO: ${customFormData.i_job_code || '7431'})`, curY); curY -= 18;
    drawRow('연간 추정 소득', customFormData.i_income ? `${customFormData.i_income} 만원` : '36,000,000 원', curY); curY -= 18;
    drawRow('숙소 입주 시작일', customFormData.i_dorm_start || '별도 확인', curY); curY -= 25;

    drawRow('3. 확인 및 서명 (Declaration & Submission)', '', curY, true); curY -= 25;
    const todayStr = new Date().toISOString().split('T')[0];
    drawRow('신청일자 (Date)', todayStr, curY); curY -= 18;
    drawRow('신청인 본인 (Declarant)', `${customFormData.i_surname} ${customFormData.i_givenname} (서명 날인)`, curY); curY -= 35;

    page.drawText('HD HYUNDAI SAMHO HEAVY INDUSTRIES CO., LTD.', { x: 35, y: curY, size: 8, font, color: rgb(0.2, 0.4, 0.2) });
    page.drawCircle({ x: 480, y: curY + 10, size: 25, color: rgb(0.95, 0.9, 0.9), borderColor: rgb(0.85, 0.1, 0.1), borderWidth: 2 });
    page.drawText('직인', { x: 472, y: curY + 13, size: 8, font, color: rgb(0.8, 0, 0) });
    page.drawText('생략', { x: 472, y: curY + 3, size: 8, font, color: rgb(0.8, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
  };

  const generateSelectedPDFs = async () => {
    setIsOCRProcessing(true);
    setDownloadLinks([]);
    try {
      const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf';
      const fontResponse = await fetch(fontUrl);
      const fontBuffer = await fontResponse.arrayBuffer();
      const links: { name: string; url: string; filename: string }[] = [];

      if (selectedDocs.main) {
        const blob = await drawSingleDocBlob('main', fontBuffer, formData);
        links.push({
          name: '통합신청서 (별지 제34호) PDF',
          url: URL.createObjectURL(blob),
          filename: `통합신청서_${formData.i_surname || '외국인'}.pdf`
        });
      }
      if (selectedDocs.residence) {
        const blob = await drawSingleDocBlob('residence', fontBuffer, formData);
        links.push({
          name: '거주·숙소제공 사실확인서 PDF',
          url: URL.createObjectURL(blob),
          filename: `거주숙소제공확인서_${formData.i_surname || '외국인'}.pdf`
        });
      }
      if (selectedDocs.guarantee) {
        const blob = await drawSingleDocBlob('guarantee', fontBuffer, formData);
        links.push({
          name: '신원보증서 (별지 제129호) PDF',
          url: URL.createObjectURL(blob),
          filename: `신원보증서_${formData.i_surname || '외국인'}.pdf`
        });
      }
      if (selectedDocs.income) {
        const blob = await drawSingleDocBlob('income', fontBuffer, formData);
        links.push({
          name: '직업 및 연간 소득금액 신고서 PDF',
          url: URL.createObjectURL(blob),
          filename: `소득금액신고서_${formData.i_surname || '외국인'}.pdf`
        });
      }

      for (const cDoc of customDocList) {
        if (selectedDocs[cDoc.id]) {
          const blob = await drawSingleDocBlob(cDoc.id, fontBuffer, formData);
          links.push({
            name: `${cDoc.title} PDF`,
            url: URL.createObjectURL(blob),
            filename: `${cDoc.title.replace(/\s+/g, '_')}_${formData.i_surname || '외국인'}.pdf`
          });
        }
      }

      setDownloadLinks(links);
      showAlert('PDF 생성 완료', '모든 출입국 신청서류 PDF가 규격에 맞추어 생성되었습니다.', 'success');
    } catch(e: any) {
      showAlert('생성 오류', e.message || '문서 생성 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsOCRProcessing(false);
    }
  };

  const downloadExcelTemplate = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('외국인근로자_서식일괄입력');

      worksheet.columns = [
        { header: '성 (Surname)', key: 'surname', width: 20 },
        { header: '이름 (Given Name)', key: 'givenname', width: 25 },
        { header: '생년월일 (YYYYMMDD)', key: 'dob', width: 20 },
        { header: '성별 (M/F)', key: 'gender', width: 10 },
        { header: '국적 (영문대문자)', key: 'nation', width: 15 },
        { header: '외국인등록번호 (13자리)', key: 'arc', width: 22 },
        { header: '여권번호', key: 'passport', width: 15 },
        { header: '여권발급일 (YYYYMMDD)', key: 'pass_issue', width: 22 },
        { header: '여권만료일 (YYYYMMDD)', key: 'pass_exp', width: 22 },
        { header: '국내 도로명주소', key: 'addr_kr', width: 35 },
        { header: '휴대전화번호', key: 'cellphone', width: 15 },
        { header: '일반전화번호', key: 'phone', width: 15 },
        { header: '본국주소', key: 'addr_home', width: 25 },
        { header: '본국전화번호', key: 'home_phone', width: 20 },
        { header: '이메일', key: 'email', width: 25 },
        { header: '제출인 구분', key: 'submitter', width: 15 },
        { header: '대리인 성명', key: 'proxy_name', width: 20 },
        { header: '회사상호', key: 'cname', width: 25 },
        { header: '사업자등록번호 (10자리)', key: 'cregno', width: 25 },
        { header: '대표자 성명', key: 'rep_name', width: 15 },
        { header: '대표자 주민번호앞자리', key: 'rep_id', width: 25 },
        { header: '대표자 성별(M/F)', key: 'rep_gender', width: 20 },
        { header: '회사 소재지주소', key: 'caddr', width: 35 },
        { header: '회사 대표전화', key: 'cphone', width: 20 },
        { header: '신규회사 상호', key: 'new_cname', width: 20 },
        { header: '신규 사업자번호', key: 'new_cregno', width: 20 },
        { header: '신규 회사전화', key: 'new_cphone', width: 20 },
        { header: '숙소소유형태', key: 'dorm_own', width: 15 },
        { header: '숙소유형', key: 'dorm_type', width: 15 },
        { header: '거주시작일 (YYYYMMDD)', key: 'dorm_start', width: 25 },
        { header: '직종명', key: 'job', width: 15 },
        { header: '연간소득 (만원단위)', key: 'income', width: 15 },
        { header: '재입국기간', key: 'reentry', width: 15 },
        { header: '환급은행', key: 'refund_bank', width: 15 },
        { header: '환급계좌번호', key: 'refund_acc', width: 25 }
      ];

      worksheet.getRow(1).eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
        cell.font = { bold: true, color: { argb: 'FF1F4E78' } };
        cell.border = { bottom: { style: 'thin' } };
      });

      worksheet.addRow({
        surname: 'BUI', givenname: 'QUOC TINH', dob: '19800812', gender: 'M', nation: 'VIETNAM', 
        arc: '800812-5000000', passport: 'E03861791', pass_issue: '20200101', pass_exp: '20300101', addr_kr: '전남 영암군 삼호읍 대불로 10', cellphone: '01012345678', 
        phone: '', addr_home: 'SON HA, THAI THUY', home_phone: '+84 00-000-0000', email: 'example@email.com', submitter: '본인 직접 제출', proxy_name: '', 
        cname: '가영테크(주)', cregno: '4118119799', rep_name: '김가영', rep_id: '650101-1000000', rep_gender: 'M', caddr: '전남 영암군 삼호읍 대불로 93', 
        cphone: '0614602114', new_cname: '', new_cregno: '', new_cphone: '', dorm_own: '임차 (회사/타인)', dorm_type: '회사 기숙사', dorm_start: '20240518', 
        job: '선체도장공', income: '3000', reentry: '1년', refund_bank: '기업은행', refund_acc: '110-123-456789'
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), 'HD현대삼호_외국인근로자_표준일괄입력서식.xlsx');
      showAlert('다운로드 완료', '표준 엑셀 템플릿 파일이 다운로드되었습니다.', 'success');
    } catch(err) {
      showAlert('오류', '엑셀 서식 파일 생성에 실패했습니다.', 'error');
    }
  };

  const processExcelBatch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExcelProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];

      if (!worksheet) {
        throw new Error('엑셀 워크시트를 찾을 수 없습니다.');
      }

      const headersRow = worksheet.getRow(1);
      const headers: string[] = [];
      headersRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let val = '';
        if (cell.value !== null && cell.value !== undefined) {
          val = String(cell.value).trim();
        }
        headers[colNumber] = val;
      });

      const rows: any[] = [];
      worksheet.eachRow((row, number) => {
        if (number === 1) return;
        
        const rowData: Record<string, string> = {};
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber];
          if (!header) return;
          let val = cell.value;
          let strVal = val !== null && val !== undefined ? String(val).trim() : '';
          rowData[header] = strVal;
        });

        if (rowData['성 (Surname)'] || rowData['이름 (Given Name)']) {
          rows.push(rowData);
        }
      });

      if (rows.length === 0) {
        throw new Error('엑셀 데이터에 등록할 근로자 정보가 없습니다.');
      }

      const fontUrl = 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf';
      const fontBuffer = await (await fetch(fontUrl)).arrayBuffer();
      const zip = new JSZip();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dummyFormData: FormData = {
          ...formData,
          i_surname: row['성 (Surname)'] || formData.i_surname,
          i_givenname: row['이름 (Given Name)'] || formData.i_givenname,
          i_dob: row['생년월일 (YYYYMMDD)'] || formData.i_dob,
          i_nation: row['국적 (영문대문자)'] || formData.i_nation,
          i_arc: row['외국인등록번호 (13자리)'] || formData.i_arc,
          i_passport: row['여권번호'] || formData.i_passport,
          i_address_kr: row['국내 도로명주소'] || formData.i_address_kr,
          i_cellphone: row['휴대전화번호'] || formData.i_cellphone,
          i_cname: row['회사상호'] || formData.i_cname,
          i_cregno: row['사업자등록번호 (10자리)'] || formData.i_cregno,
          i_rep_name: row['대표자 성명'] || formData.i_rep_name
        };

        const nameLabel = `${dummyFormData.i_surname}_${dummyFormData.i_givenname}`.toUpperCase().replace(/\s+/g, '_');
        const mainBlob = await drawSingleDocBlob('main', fontBuffer, dummyFormData);
        zip.file(`${nameLabel}_통합신청서.pdf`, mainBlob);

        const resBlob = await drawSingleDocBlob('residence', fontBuffer, dummyFormData);
        zip.file(`${nameLabel}_거주숙소확인서.pdf`, resBlob);

        const incBlob = await drawSingleDocBlob('income', fontBuffer, dummyFormData);
        zip.file(`${nameLabel}_소득신고서.pdf`, incBlob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `HD현대삼호_비자신청서_${rows.length}명.zip`);
      showAlert('일괄 생성 완료', `총 ${rows.length}명의 근로자 서류가 압축 파일(ZIP)로 저장되었습니다.`, 'success');
    } catch(err: any) {
      showAlert('일괄 처리 오류', err.message || '엑셀 처리 중 문제가 발생했습니다.', 'error');
    } finally {
      setIsExcelProcessing(false);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-300 flex flex-col font-sans antialiased relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#07080d]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-blue-600/15 via-sky-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-gradient-to-tl from-cyan-600/10 to-transparent blur-3xl" />
      </div>

      {/* Navigation Toolbar */}
      <header className="bg-black/70 backdrop-blur-md border-b border-white/10 text-white sticky top-0 z-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              type="button"
              onClick={handleHomeClick} 
              className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 rounded-xl transition shadow-md cursor-pointer shrink-0"
              title="첫 화면으로 이동"
            >
              <Home className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            </button>
            <div className="flex items-center gap-2 text-left">
              <img 
                src="/hd-hyundai-samho-ci.svg" 
                alt="HD현대삼호" 
                className="h-5 sm:h-6 object-contain" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/hd-hyundai-samho-ci.png';
                }}
              />
              <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight hidden xs:inline">비자행정 시스템</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {formData.i_cname && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-medium">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[150px]">{formData.i_cname}</span>
              </div>
            )}
            <button 
              type="button"
              onClick={() => setIsWorkplaceModalOpen(true)}
              className="w-9 h-9 bg-white/5 hover:bg-white/10 active:bg-white/15 text-blue-300 rounded-xl flex items-center justify-center transition border border-white/10 cursor-pointer"
              title="사업장 관리"
            >
              <Building2 className="w-4 h-4 text-blue-400" />
            </button>
            <button 
              type="button"
              onClick={() => setIsDBModalOpen(true)}
              className="w-9 h-9 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center transition shadow-sm border border-emerald-500/30 cursor-pointer"
              title={t('btn_db')}
            >
              <Users className="w-4 h-4 text-white" />
            </button>
            <button 
              type="button"
              onClick={handleResetData}
              className="w-9 h-9 bg-white/5 hover:bg-white/10 active:bg-white/15 text-amber-300 rounded-xl flex items-center justify-center transition border border-white/10 cursor-pointer"
              title="입력 초기화"
            >
              <RotateCw className="w-4 h-4 text-amber-400" />
            </button>
            <LanguageFlagPicker 
              currentLang={currentLang} 
              onSelectLang={setCurrentLang} 
            />
          </div>
        </div>
        
        {/* Step Indicator */}
        {step !== 0 && (
          <div className="bg-[#0A0A0C]/70 border-t border-white/10 backdrop-blur-md">
            {/* Mobile Touch Progress */}
            <div className="sm:hidden px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-[11px] font-bold border border-blue-500/30 shrink-0">
                    {isBatchMode 
                      ? (step === 1 ? '01 / 02' : '02 / 02')
                      : `0${step} / 07`}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {isBatchMode 
                      ? (step === 1 ? t('s1_step') : t('s_excel_step'))
                      : t(`s${step}_step`)}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isBatchMode) {
                        if (step === 'excel') handlePrevStep(1);
                        else handlePrevStep(0);
                      } else {
                        if (typeof step === 'number' && step > 1) handlePrevStep(step - 1);
                        else handlePrevStep(0);
                      }
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (isBatchMode) {
                        if (step === 1) handleNextStep('excel');
                      } else {
                        if (typeof step === 'number' && step < 7) handleNextStep(step + 1);
                      }
                    }}
                    disabled={isBatchMode ? step === 'excel' : step === 7}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 disabled:opacity-30 transition cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {(isBatchMode ? [1, 2] : [1, 2, 3, 4, 5, 6, 7]).map((num) => {
                  const isActive = isBatchMode 
                    ? (num === 1 ? step === 1 : step === 'excel')
                    : step === num;
                  const isCompleted = isBatchMode
                    ? (num === 1 ? step === 'excel' : false)
                    : (typeof step === 'number' && step > num);
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        if (isBatchMode) {
                          if (num === 1) handleNextStep(1);
                          else if (num === 2) handleNextStep('excel');
                        } else {
                          handleNextStep(num as number);
                        }
                      }}
                      className={`h-2.5 rounded-full transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' 
                          : isCompleted 
                          ? 'bg-emerald-500/80' 
                          : 'bg-white/10'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Desktop Progress */}
            <div className="hidden sm:flex max-w-7xl mx-auto px-4 lg:px-8 py-3 items-center justify-between w-full text-xs font-bold gap-2">
              {(isBatchMode ? [1, 2] : [1, 2, 3, 4, 5, 6, 7]).map((num) => {
                const isActive = isBatchMode 
                  ? (num === 1 ? step === 1 : step === 'excel')
                  : step === num;
                const isCompleted = isBatchMode
                  ? (num === 1 ? step === 'excel' : false)
                  : (typeof step === 'number' && step > num);
                const stepLabel = (isBatchMode && num === 2) ? t('s_excel_step') : t(`s${num}_step`);
                const isLast = isBatchMode ? num === 2 : num === 7;
                return (
                  <div key={num} className="flex-1 flex items-center justify-center min-w-0">
                    <button 
                      type="button"
                      onClick={() => {
                        if (isBatchMode) {
                          if (num === 1) handleNextStep(1);
                          else if (num === 2) handleNextStep('excel');
                        } else {
                          handleNextStep(num as number);
                        }
                      }}
                      className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-xl transition"
                    >
                      <span 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                          isActive 
                            ? 'bg-blue-600 text-white font-bold shadow-[0_0_12px_rgba(37,99,235,0.6)]' 
                            : isCompleted 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-white/5 border border-white/10 text-slate-500'
                        }`}
                      >
                        {isCompleted ? <Check className="w-3 h-3" /> : num}
                      </span>
                      <span className={`truncate text-xs ${isActive ? 'text-white font-extrabold' : 'text-slate-500'}`}>{stepLabel}</span>
                    </button>
                    {!isLast && <ArrowRight className="w-3 h-3 text-slate-700 ml-1 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center relative z-10 ${step === 0 ? 'max-w-5xl' : 'max-w-4xl'}`}>
        <AnimatePresence mode="wait">
          {/* STEP 0: Gateway */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="w-full max-w-4xl mx-auto py-6 sm:py-10 space-y-8"
            >
              <div className="text-center space-y-3 max-w-2xl mx-auto px-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>HD현대삼호 조선해양 외국인 비자 지원</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  외국인 근로자 비자 행정 서류를<br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                    원클릭으로 자동 생성하세요
                  </span>
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                  출입국관리법 표준 통합신청서, 거주·숙소제공확인서, 신원보증서, 소득신고서 및 사내 맞춤형 서식까지 오류 없이 정확히 생성합니다.
                </p>
              </div>

              {/* 2 Main Entry Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div 
                  onClick={() => {
                    setIsBatchMode(false);
                    handleNextStep(1);
                  }}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-blue-500/50 p-6 sm:p-8 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">개별 신청서 작성 (1인)</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        신분증 사진 OCR 자동인식 및 AI 정합성 검증을 거쳐 출입국 제출용 PDF를 즉시 생성합니다.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>작성 시작하기</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setIsBatchMode(true);
                    handleNextStep(1);
                  }}
                  className="rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-cyan-500/50 p-6 sm:p-8 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">엑셀 일괄 생성 (다수 근로자)</h3>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        표준 엑셀 명단을 업로드하여 수십 명의 신청서류를 한 번에 PDF 압축파일(ZIP)로 생성합니다.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-cyan-400">
                    <span>엑셀 업로드로 시작</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Management Dock */}
              <div className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2 sm:gap-2.5 max-w-5xl mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsWorkplaceModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>사업장 관리</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDBModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>인력 DB</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenCompanyDocRequest()}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>서류 요청문</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenGovGuide()}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                    title="소득금액증명원, 외국인등록사실증명 등 정부기관 발급 가이드"
                  >
                    <Globe className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>정부증명 발급처</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsTemplateModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <FileUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>서식 관리</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDebugModalDocType('income');
                      setIsDebugModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>좌표 조정기</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.08] text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>보안 관리</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Visa & Request Selection */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s1_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s1_title')}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {t('s1_desc')}
                </p>
              </div>

              {/* 1. Current Visa Type Selector */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Milestone className="w-4 h-4" />
                    <span>1. {t('s1_visa')} (현재 소지 비자)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">선택 시 해당 비자에 맞춤 서식 자동 적용</span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { code: 'E-7-4R', labelKr: 'E-7-4R (광역형 숙련기능)', descKr: '지역특화 광역지자체 추천 비자', badge: '조선소 핵심' },
                    { code: 'E-7-3', labelKr: 'E-7-3 (일반기능인력)', descKr: '선박 용접/도장/배관 전문', badge: '조선 직종' },
                    { code: 'E-7-4', labelKr: 'E-7-4 (숙련기능인력)', descKr: 'K-point 점수제 일반 전환', badge: '' },
                    { code: 'E-9', labelKr: 'E-9 (비전문취업)', descKr: '제조업 고용허가제 근로자', badge: '' },
                    { code: 'E-7', labelKr: 'E-7 (특정활동)', descKr: '전문/준전문 인력 전반', badge: '' },
                    { code: 'F-2-R', labelKr: 'F-2-R (지역특화형)', descKr: '인구감소지역 우수인재 거주', badge: '' }
                  ].map((vtItem) => {
                    const isSelected = formData.visaType === vtItem.code;
                    return (
                      <div 
                        key={vtItem.code} 
                        onClick={() => {
                          handleFormChange('visaType', vtItem.code);
                        }}
                        className={`flex flex-col justify-between p-4 border rounded-2xl cursor-pointer transition-all duration-200 min-h-[76px] ${
                          isSelected 
                            ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)] text-white' 
                            : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="radio" 
                              name="visaType" 
                              value={vtItem.code} 
                              checked={isSelected} 
                              onChange={() => handleFormChange('visaType', vtItem.code)}
                              className="w-4 h-4 text-blue-500 border-white/20 cursor-pointer shrink-0" 
                            />
                            <span className={`font-extrabold text-xs sm:text-sm tracking-wide ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                              {vtItem.labelKr}
                            </span>
                          </div>
                          {vtItem.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shrink-0">
                              {vtItem.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 pl-6.5 mt-1 leading-tight">{vtItem.descKr}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Request Type Selector */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4" />
                    <span>2. {t('s1_req')} (출입국 민원 종류)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">통상적으로 '체류기간 연장'이 가장 많이 이용됩니다.</span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
                  {([
                    { code: 'chk_extension', title: '체류기간 연장허가', desc: '현재 비자 유지 및 기간 연장' },
                    { code: 'chk_change_status', title: '체류자격 변경허가', desc: 'E-9에서 E-7-4 전환 등 자격 변경' },
                    { code: 'chk_alien_reg', title: '외국인등록 (최초 신규)', desc: '입국 후 외국인등록증 최초 발급' },
                    { code: 'chk_change_work', title: '근무처 변경·추가 허가', desc: '이직 또는 근무사업장 이동' },
                    { code: 'chk_reentry', title: '재입국허가 (복수)', desc: '출국 후 복수 재입국 허가 신청' },
                    { code: 'chk_reissue', title: '외국인등록증 재발급', desc: '등록증 분실 또는 훼손 시 재발급' }
                  ] as const).map((rt) => {
                    const isSelected = formData.reqType === rt.code;
                    return (
                      <div 
                        key={rt.code}
                        className={`p-3.5 border rounded-2xl flex items-center justify-between transition-all duration-200 relative group pr-12 min-h-[58px] cursor-pointer ${
                          isSelected ? 'bg-blue-950/40 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                        }`}
                        onClick={() => handleFormChange('reqType', rt.code)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input 
                            type="radio" 
                            name="reqType" 
                            value={rt.code} 
                            checked={isSelected}
                            onChange={() => handleFormChange('reqType', rt.code)}
                            className="w-4 h-4 text-blue-500 border-white/20 shrink-0 cursor-pointer" 
                          />
                          <div className="min-w-0">
                            <span className={`text-xs sm:text-sm font-extrabold leading-tight block ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>
                              {rt.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                              {rt.desc}
                            </span>
                          </div>
                        </div>

                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDocInfoType(rt.code);
                            setIsDocInfoOpen(true);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/10 transition cursor-pointer"
                          title="필수 구비서류 목록 확인"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Conditional Change of Status specifications - ONLY WHEN '체류자격 변경허가' IS EXPLICITLY CHOSEN */}
              {formData.reqType === 'chk_change_status' && (
                <div className="bg-blue-950/25 p-5 rounded-3xl border border-blue-500/30 flex flex-col gap-2.5 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <label className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">
                        [체류자격 변경허가 선택됨] 변경하려는 목표 비자 세부 명칭
                      </label>
                    </div>
                    <span className="text-[11px] text-slate-400">통합신청서 1페이지 기재사항</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    현재 비자({formData.visaType})에서 변경하여 새롭게 취득하고자 하는 비자 자격 명칭을 선택하거나 직접 입력하세요.
                  </p>
                  
                  {/* Quick selection chips for target visa */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {[
                      'E-7-4R (광역추천 숙련기능)',
                      'E-7-4 (일반 숙련기능인력)',
                      'E-7-3 (조선기능인력)',
                      'F-2-R (지역특화 거주)'
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handleFormChange('val_change_status', preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          formData.val_change_status === preset
                            ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <input 
                    type="text" 
                    value={formData.val_change_status}
                    onChange={(e) => handleFormChange('val_change_status', e.target.value)}
                    placeholder="예: E-7-4R (광역추천 숙련기능인력)"
                    className="w-full bg-black/40 border border-white/15 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold mt-1"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(0)} 
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  type="button"
                  onClick={() => isBatchMode ? handleNextStep('excel') : handleNextStep(2)}
                  className="w-2/3 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer text-xs sm:text-sm"
                >
                  {isBatchMode ? t('btn_to_excel') : t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP EXCEL */}
          {step === 'excel' && (
            <motion.div 
              key="stepexcel"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s_excel_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s_excel_title')}
                </h3>
              </div>

              <div className="bg-[#0f111a] border border-white/10 p-6 sm:p-8 rounded-3xl text-center shadow-xl space-y-6 relative">
                {isExcelProcessing && (
                  <div className="absolute inset-0 bg-black/85 z-20 flex flex-col items-center justify-center rounded-3xl backdrop-blur-sm">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                    <span className="text-sm font-bold text-emerald-300">{t('msg_excel_prog')}</span>
                  </div>
                )}

                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <FileSpreadsheet className="w-8 h-8" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  표준 엑셀 서식을 다운로드한 후 사내 근로자 명단을 입력하여 업로드하시면, 선택하신 비자 및 신청서 양식의 개별 PDF들이 자동으로 생성되어 압축파일(ZIP)로 즉시 다운로드됩니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
                  <button 
                    type="button"
                    onClick={downloadExcelTemplate} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('btn_excel_down')}</span>
                  </button>
                  <label className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>{t('btn_excel_up')}</span>
                    <input 
                      type="file" 
                      accept=".xlsx, .xls" 
                      onChange={processExcelBatch}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-2 flex">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(1)} 
                  className="w-full py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Personal Information */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                    {t('s2_step')}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                    {t('s2_title')}
                  </h3>
                </div>

                <div className="flex gap-2 items-center">
                  <button 
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 font-bold text-xs border border-emerald-500/30 rounded-xl cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>신분증 촬영 OCR</span>
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 font-bold text-xs border border-blue-500/30 rounded-xl cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>파일 스캔</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleOCRFile}
                      className="hidden" 
                    />
                  </label>
                </div>
              </div>

              {/* Personal Details Form */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                {isOCRProcessing && (
                  <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-blue-300 animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                    <span>AI가 신분증 사진을 분석하여 양식을 자동 채우는 중입니다...</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s2_sub1')}</span>
                  <button
                    type="button"
                    onClick={() => setMaskArc(!maskArc)}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                  >
                    {maskArc ? <EyeOff className="w-3.5 h-3.5 text-cyan-400" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{maskArc ? 'ARC 마스킹 해제' : 'ARC 마스킹 적용'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${errorHighlights.has('i_surname') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t('l_surname')}
                    </label>
                    <input 
                      type="text" 
                      value={formData.i_surname}
                      onChange={(e) => handleFormChange('i_surname', e.target.value)}
                      placeholder="예: BUI"
                      className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold ${
                        errorHighlights.has('i_surname') ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${errorHighlights.has('i_givenname') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t('l_givenname')}
                    </label>
                    <input 
                      type="text" 
                      value={formData.i_givenname}
                      onChange={(e) => handleFormChange('i_givenname', e.target.value)}
                      placeholder="예: QUOC TINH"
                      className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold ${
                        errorHighlights.has('i_givenname') ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  <DatePicker 
                    label={t('l_dob')}
                    value={formData.i_dob}
                    onChange={(val) => handleFormChange('i_dob', val)}
                    placeholder="YYYY-MM-DD"
                    error={errorHighlights.has('i_dob')}
                    onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                  />

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_gender')}</label>
                    <select 
                      value={formData.i_gender}
                      onChange={(e) => handleFormChange('i_gender', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      <option value="M" className="bg-[#121217]">{t('gender_m')}</option>
                      <option value="F" className="bg-[#121217]">{t('gender_f')}</option>
                    </select>
                  </div>

                  <CountryFlagPicker
                    value={formData.i_nation}
                    onChange={(val) => handleFormChange('i_nation', val)}
                    error={errorHighlights.has('i_nation')}
                    label={t('l_nation')}
                    placeholder="예: VIETNAM"
                  />

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${errorHighlights.has('i_arc') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t('l_arc')}
                    </label>
                    <input 
                      type="text" 
                      value={formData.i_arc}
                      onChange={(e) => handleFormChange('i_arc', formatRegNo(e.target.value))}
                      placeholder="예: 800812-5000000"
                      className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-bold ${
                        errorHighlights.has('i_arc') ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${errorHighlights.has('i_passport') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t('l_pass')}
                    </label>
                    <input 
                      type="text" 
                      value={formData.i_passport}
                      onChange={(e) => handleFormChange('i_passport', e.target.value)}
                      placeholder="예: E03861791"
                      className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold ${
                        errorHighlights.has('i_passport') ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <DatePicker 
                      label={t('l_pass_issue')}
                      value={formData.i_pass_issue}
                      onChange={(val) => handleFormChange('i_pass_issue', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_pass_issue')}
                      onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                    />
                    <DatePicker 
                      label={t('l_pass_exp')}
                      value={formData.i_pass_exp}
                      onChange={(val) => handleFormChange('i_pass_exp', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_pass_exp')}
                      alignRight
                      onOpenChange={(open) => setActivePickerSection(open ? 'personal' : null)}
                    />
                  </div>
                </div>
              </div>

              {/* Submitter selector */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-3">
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s2_sub2')}</span>
                <div className="flex flex-wrap gap-4">
                  {(['self', 'spouse', 'parents'] as const).map((sub) => (
                    <label key={sub} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-slate-300">
                      <input 
                        type="radio" 
                        name="submitter" 
                        value={sub} 
                        checked={formData.submitter === sub}
                        onChange={(e) => handleFormChange('submitter', e.target.value)}
                        className="w-4 h-4 text-blue-500 border-white/20 cursor-pointer" 
                      />
                      <span>
                        {sub === 'self' ? t('sub_self') : sub === 'spouse' ? t('sub_spouse') : t('sub_parents')}
                      </span>
                    </label>
                  ))}
                </div>

                {isFamilyProxyNeeded && (
                  <div className="border-t border-white/10 pt-3">
                    {formData.submitter === 'spouse' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_spouse')}</label>
                        <input 
                          type="text" 
                          value={formData.i_spouse}
                          onChange={(e) => handleFormChange('i_spouse', e.target.value)}
                          placeholder="예: NGUYEN THI B"
                          className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                    {formData.submitter === 'parents' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_parents')}</label>
                        <input 
                          type="text" 
                          value={formData.i_parents}
                          onChange={(e) => handleFormChange('i_parents', e.target.value)}
                          placeholder="예: NGUYEN VAN C"
                          className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(1)} 
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  type="button"
                  onClick={() => handleNextStep(3)}
                  className="w-2/3 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Address & Contact */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s3_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s3_title')}
                </h3>
              </div>

              {/* Korea Address */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s3_sub1')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className={`block text-xs font-bold mb-1.5 uppercase ${errorHighlights.has('i_address_kr') ? 'text-rose-500' : 'text-slate-400'}`}>
                      {t('l_addr_kr')}
                    </label>
                    <input 
                      type="text" 
                      value={formData.i_address_kr}
                      onChange={(e) => handleFormChange('i_address_kr', e.target.value)}
                      placeholder="전남 영암군 삼호읍 대불로 OO, OO호"
                      className={`w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold ${
                        errorHighlights.has('i_address_kr') ? 'border-rose-500' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_cell')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_cellphone}
                      onChange={(e) => handleFormChange('i_cellphone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 010-1234-5678"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_tel')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_phone}
                      onChange={(e) => handleFormChange('i_phone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 061-123-4567"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Home Address */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s3_sub2')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_addr_home')}</label>
                    <input 
                      type="text" 
                      value={formData.i_address_home}
                      onChange={(e) => handleFormChange('i_address_home', e.target.value)}
                      placeholder="예: SON HA, THAI THUY, THAI BINH"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_home_tel')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_home_phone}
                      onChange={(e) => handleFormChange('i_home_phone', e.target.value)}
                      placeholder="예: +84 90-123-4567"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_email')}</label>
                    <input 
                      type="email" 
                      value={formData.i_email}
                      onChange={(e) => handleFormChange('i_email', e.target.value)}
                      placeholder="예: WORKER@EMAIL.COM"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(2)} 
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  type="button"
                  onClick={() => handleNextStep(4)}
                  className="w-2/3 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-extrabold rounded-xl transition shadow-[0_0_20px_rgba(37,99,235,0.4)] cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Workplace & Residence Info */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s4_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s4_title')}
                </h3>
              </div>

              {/* Current Workplace */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s4_sub1')}</span>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedWorkplaceId}
                      onChange={(e) => {
                        setSelectedWorkplaceId(e.target.value);
                        const wp = (workplaces || []).find(w => w.id === e.target.value);
                        if (wp) handleSelectWorkplace(wp);
                      }}
                      className="bg-black/50 border border-blue-500/40 text-blue-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-400"
                    >
                      <option value="" disabled>-- 협력사 선택 --</option>
                      {(workplaces || []).map(w => (
                        <option key={w.id} value={w.id} className="bg-[#121217] text-white">
                          {w.name} ({w.repName})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsWorkplaceModalOpen(true)}
                      className="px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 text-xs font-bold rounded-xl border border-blue-500/30 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>사업장 등록</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_cname')}</label>
                    <input 
                      type="text" 
                      value={formData.i_cname}
                      onChange={(e) => handleFormChange('i_cname', e.target.value)}
                      placeholder="가영테크(주)"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_cregno')}</label>
                    <input 
                      type="text" 
                      value={formData.i_cregno}
                      onChange={(e) => handleFormChange('i_cregno', formatBusinessNo(e.target.value))}
                      placeholder="예: 411-81-19799"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_rep_name')}</label>
                    <input 
                      type="text" 
                      value={formData.i_rep_name}
                      onChange={(e) => handleFormChange('i_rep_name', e.target.value)}
                      placeholder="김가영"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_rep_id')}</label>
                    <input 
                      type="text" 
                      value={formData.i_rep_id}
                      onChange={(e) => handleFormChange('i_rep_id', formatRegNo(e.target.value))}
                      placeholder="예: 650101-1******"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_rep_gender')}</label>
                    <select 
                      value={formData.i_rep_gender}
                      onChange={(e) => handleFormChange('i_rep_gender', e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold cursor-pointer"
                    >
                      <option value="M" className="bg-[#121217]">남성 (M)</option>
                      <option value="F" className="bg-[#121217]">여성 (F)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_caddr')}</label>
                    <input 
                      type="text" 
                      value={formData.i_caddr}
                      onChange={(e) => handleFormChange('i_caddr', e.target.value)}
                      placeholder="전남 영암군 삼호읍 대불로 93"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_cphone')}</label>
                    <input 
                      type="tel" 
                      value={formData.i_cphone}
                      onChange={(e) => handleFormChange('i_cphone', formatPhoneNumber(e.target.value))}
                      placeholder="예: 061-460-2114"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Conditional New Workplace */}
              {isNewWorkplaceNeeded && (
                <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                  <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s4_sub2')}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_new_cname')}</label>
                      <input 
                        type="text" 
                        value={formData.i_new_cname}
                        onChange={(e) => handleFormChange('i_new_cname', e.target.value)}
                        placeholder="예: 지원ENG"
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_new_cregno')}</label>
                      <input 
                        type="text" 
                        value={formData.i_new_cregno}
                        onChange={(e) => handleFormChange('i_new_cregno', formatBusinessNo(e.target.value))}
                        placeholder="예: 411-86-XXXXX"
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_new_cphone')}</label>
                      <input 
                        type="tel" 
                        value={formData.i_new_cphone}
                        onChange={(e) => handleFormChange('i_new_cphone', formatPhoneNumber(e.target.value))}
                        placeholder="예: 061-460-XXXX"
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {isDormNeeded && (
                <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                  <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s4_sub3')}</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{t('l_dorm_own')}</label>
                      <div className="flex gap-4">
                        {(['own_self', 'own_rent', 'own_other'] as const).map((own) => (
                          <label key={own} className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-300">
                            <input 
                              type="radio" 
                              name="r_own" 
                              value={own} 
                              checked={formData.r_own === own}
                              onChange={(e) => handleFormChange('r_own', e.target.value)}
                              className="w-4 h-4 text-emerald-500 border-white/20"
                            />
                            <span>{own === 'own_self' ? t('own_1') : own === 'own_rent' ? t('own_2') : t('own_3')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">{t('l_dorm_type')}</label>
                      <div className="flex gap-4">
                        {(['type_dorm', 'type_private', 'type_hotel'] as const).map((ht) => (
                          <label key={ht} className="flex items-center gap-1.5 cursor-pointer text-sm font-bold text-slate-300">
                            <input 
                              type="radio" 
                              name="r_type" 
                              value={ht} 
                              checked={formData.r_type === ht}
                              onChange={(e) => handleFormChange('r_type', e.target.value)}
                              className="w-4 h-4 text-emerald-500 border-white/20"
                            />
                            <span>{ht === 'type_dorm' ? t('type_1') : ht === 'type_private' ? t('type_2') : t('type_3')}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <DatePicker 
                      label={t('l_dorm_start')}
                      value={formData.i_dorm_start}
                      onChange={(val) => handleFormChange('i_dorm_start', val)}
                      placeholder="YYYY-MM-DD"
                      error={errorHighlights.has('i_dorm_start')}
                      className="sm:col-span-2 max-w-[200px]"
                      openUpward
                      onOpenChange={(open) => setActivePickerSection(open ? 'dorm' : null)}
                    />
                  </div>
                </div>
              )}

              {/* Job & Income */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-4">
                <span className="block text-xs font-extrabold text-blue-400 uppercase tracking-wider">{t('s4_sub4')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-400 uppercase">{t('l_job')}</label>
                      <select
                        onChange={(e) => {
                          const item = SHIPYARD_JOB_CODES.find(j => j.code === e.target.value);
                          if (item) {
                            handleFormChange('i_job', item.titleKr);
                            handleFormChange('i_job_code', item.code);
                          }
                        }}
                        className="bg-black/50 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold rounded-lg px-2 py-0.5"
                      >
                        <option value="">조선 직종 빠른선택</option>
                        {SHIPYARD_JOB_CODES.map(j => (
                          <option key={j.code} value={j.code} className="bg-[#121217] text-white">
                            {j.titleKr} ({j.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <input 
                      type="text" 
                      value={formData.i_job}
                      onChange={(e) => handleFormChange('i_job', e.target.value)}
                      placeholder="선체도장공"
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 font-semibold"
                    />
                    {formData.i_job_code && (
                      <span className="text-[10px] font-mono text-indigo-400 font-semibold mt-1 block">
                        한국표준직업분류 코드(KSCO): {formData.i_job_code}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-bold uppercase ${errorHighlights.has('i_income') ? 'text-rose-500' : 'text-slate-400'}`}>
                        {t('l_income')}
                      </label>
                      {formData.i_income && (
                        <span className="text-[11px] font-mono text-emerald-400 font-bold">
                          = {Number(formData.i_income.replace(/,/g, '') || 0) * 10000 > 0 ? (Number(formData.i_income.replace(/,/g, '') || 0) * 10000).toLocaleString() : 0} 원
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.i_income}
                        onChange={(e) => handleFormChange('i_income', formatMoney(e.target.value))}
                        placeholder="3,600"
                        className={`w-full bg-black/40 border border-white/10 text-white rounded-xl pl-4 pr-16 py-3 text-sm focus:outline-none focus:border-blue-500 font-mono text-right font-bold ${
                          errorHighlights.has('i_income') ? 'border-rose-500' : ''
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-extrabold text-white/50">만원</span>
                    </div>
                  </div>

                  {isReentryPeriodNeeded && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_reentry')}</label>
                      <input 
                        type="text" 
                        value={formData.i_reentry_period}
                        onChange={(e) => handleFormChange('i_reentry_period', e.target.value)}
                        placeholder="예: 1년"
                        className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  )}

                  {isRefundAccountNeeded && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">{t('l_refund')}</label>
                      <div className="flex border border-white/10 rounded-xl overflow-hidden focus-within:border-blue-500">
                        <input 
                          type="text" 
                          value={formData.i_refund_bank}
                          onChange={(e) => handleFormChange('i_refund_bank', e.target.value)}
                          placeholder="환급 은행"
                          className="w-1/3 px-4 py-3 text-sm bg-black/40 text-white border-r border-white/10 font-semibold"
                        />
                        <input 
                          type="text" 
                          value={formData.i_refund_acc}
                          onChange={(e) => handleFormChange('i_refund_acc', e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="계좌번호"
                          className="w-2/3 px-4 py-3 text-sm bg-transparent text-white font-mono font-semibold"
                        />
                      </div>
                    </div>
                  )}

                  {isGuaranteeNeeded && (
                    <div className="sm:col-span-2">
                      <div className="grid grid-cols-2 gap-2">
                        <DatePicker 
                          label={t('l_guar_start')}
                          value={formData.i_guar_start}
                          onChange={(val) => handleFormChange('i_guar_start', val)}
                          placeholder="YYYY-MM-DD"
                          error={errorHighlights.has('i_guar_start')}
                          openUpward
                          onOpenChange={(open) => setActivePickerSection(open ? 'guar' : null)}
                        />
                        <DatePicker 
                          label={t('l_guar_end')}
                          value={formData.i_guar_end}
                          onChange={(val) => handleFormChange('i_guar_end', val)}
                          placeholder="YYYY-MM-DD"
                          error={errorHighlights.has('i_guar_end')}
                          alignRight
                          openUpward
                          onOpenChange={(open) => setActivePickerSection(open ? 'guar' : null)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(3)} 
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  type="button"
                  onClick={() => handleNextStep(5)}
                  className="w-2/3 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold rounded-xl transition shadow-md cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>{t('btn_to_ai')}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: AI Verification */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s5_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s5_title')}
                </h3>
              </div>

              {/* Drop Zone */}
              <div 
                className="bg-gradient-to-br from-slate-950 to-indigo-950/40 rounded-3xl p-6 sm:p-8 text-white shadow-xl text-center border-2 border-indigo-500/20 border-dashed space-y-4"
              >
                <Sparkles className="w-8 h-8 text-yellow-400 mx-auto" />
                <div>
                  <h4 className="text-lg font-bold">{t('s5_sub1')}</h4>
                  <p className="text-xs text-indigo-200 mt-1 max-w-md mx-auto">{t('s5_desc')}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                  <label className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-5 cursor-pointer transition">
                    <Camera className="w-6 h-6 text-indigo-300 mb-1" />
                    <span className="text-xs font-bold text-slate-200">{t('s5_btn_camera')}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const base64 = await new Promise<string>((resolve) => {
                          const reader = new FileReader();
                          reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
                          reader.readAsDataURL(file);
                        });
                        setAttachments(prev => [...prev, { id: Math.random().toString(), name: file.name, base64, mimeType: file.type }]);
                        e.target.value = '';
                      }}
                      className="hidden" 
                    />
                  </label>

                  <label className="flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl py-5 cursor-pointer transition">
                    <Upload className="w-6 h-6 text-indigo-300 mb-1" />
                    <span className="text-xs font-bold text-slate-200">{t('s5_btn_gallery')}</span>
                    <input 
                      type="file" 
                      multiple
                      accept="image/*, application/pdf"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files) return;
                        for (let i = 0; i < files.length; i++) {
                          const file = files[i];
                          const base64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (event) => resolve((event.target?.result as string).split(',')[1]);
                            reader.readAsDataURL(file);
                          });
                          setAttachments(prev => [...prev, { id: Math.random().toString(), name: file.name, base64, mimeType: file.type }]);
                        }
                        e.target.value = '';
                      }}
                      className="hidden" 
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="border-t border-white/10 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-xs font-bold text-indigo-200">
                        등록된 증빙서류 ({attachments.length}건)
                      </span>
                      <button 
                        type="button"
                        onClick={() => setAttachments([])}
                        className="text-[10px] text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded transition"
                      >
                        전체 삭제
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-center">
                      {attachments.map((doc) => (
                        <div key={doc.id} className="relative bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-white max-w-[140px] truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{doc.name}</span>
                          <button 
                            type="button"
                            onClick={() => setAttachments(prev => prev.filter(a => a.id !== doc.id))}
                            className="ml-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {isVerifyProcessing && (
                <div className="bg-[#0f111a] border border-white/10 p-6 rounded-3xl text-center py-10">
                  <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3 mx-auto" />
                  <span className="text-sm font-bold text-indigo-200">{t('ai_loading')}</span>
                </div>
              )}

              {!isVerifyProcessing && verificationPassed === true && (
                <div className="bg-emerald-950/20 text-emerald-100 border border-emerald-500/30 rounded-2xl p-5 flex gap-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-base text-emerald-300 mb-1">{t('ai_pass_title')}</h4>
                    <p className="text-xs text-emerald-400/90">{t('ai_pass_desc')}</p>
                  </div>
                </div>
              )}

              {!isVerifyProcessing && verificationPassed === false && issues.length > 0 && (
                <div className="bg-rose-950/20 text-rose-100 border border-rose-500/20 rounded-2xl p-5 flex flex-col gap-3">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-base text-rose-300 mb-1">{t('ai_fail_title')} ({issues.length}건)</h4>
                      <p className="text-xs text-rose-400/90">{t('ai_msg_fail_desc')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-2">
                    {issues.map((iss, idx) => (
                      <div key={idx} className="bg-black/30 p-3 rounded-xl border border-rose-500/10">
                        <span className="inline-block px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold rounded mb-1">{iss.category}</span>
                        <div className="font-bold text-sm text-white mb-0.5">{iss.description}</div>
                        <div className="text-xs text-rose-400">{iss.recommendation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifyProcessing}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-md transition text-sm flex justify-center items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('btn_verify')}</span>
                </button>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => handlePrevStep(4)} 
                    className="w-1/4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
                  >
                    {t('btn_prev')}
                  </button>
                  <button 
                    type="button"
                    onClick={() => handlePrevStep(2)}
                    className="w-1/4 py-3 bg-rose-950/20 border border-rose-500/20 text-rose-300 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('btn_edit')}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleNextStep(6)}
                    className="w-2/4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                  >
                    <span>{t('btn_next')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: PDF Generation */}
          {step === 6 && (
            <motion.div 
              key="step6"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s6_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s6_title')}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{t('s6_desc')}</p>
              </div>

              {/* Checks */}
              <div className="bg-[#0f111a] border border-white/10 p-5 rounded-3xl shadow-xl space-y-3">
                <span className="block text-xs font-extrabold text-blue-400 tracking-wider uppercase mb-1">{t('s6_sub1')}</span>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.main}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, main: e.target.checked }))}
                      className="w-4 h-4 text-blue-500 rounded mr-3 cursor-pointer" 
                    />
                    <span className="font-bold text-slate-200 text-sm">{t('doc_1')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.residence}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, residence: e.target.checked }))}
                      className="w-4 h-4 text-emerald-500 rounded mr-3 cursor-pointer" 
                    />
                    <span className="font-bold text-slate-200 text-sm">{t('doc_2')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.guarantee}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, guarantee: e.target.checked }))}
                      className="w-4 h-4 text-indigo-500 rounded mr-3 cursor-pointer" 
                    />
                    <span className="font-bold text-slate-200 text-sm">{t('doc_3')}</span>
                  </label>

                  <label className="flex items-center p-3 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/5 transition">
                    <input 
                      type="checkbox" 
                      checked={selectedDocs.income}
                      onChange={(e) => setSelectedDocs(prev => ({ ...prev, income: e.target.checked }))}
                      className="w-4 h-4 text-amber-500 rounded mr-3 cursor-pointer" 
                    />
                    <span className="font-bold text-slate-200 text-sm">{t('doc_4')}</span>
                  </label>

                  {customDocList.map(cDoc => (
                    <div 
                      key={cDoc.id}
                      className="p-3 border border-white/10 rounded-2xl flex items-center justify-between hover:bg-white/5 transition"
                    >
                      <label className="flex items-center flex-1 cursor-pointer min-w-0">
                        <input 
                          type="checkbox" 
                          checked={!!selectedDocs[cDoc.id]}
                          onChange={(e) => setSelectedDocs(prev => ({ ...prev, [cDoc.id]: e.target.checked }))}
                          className="w-4 h-4 text-purple-500 rounded mr-3 cursor-pointer shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-200 text-sm truncate block">{cDoc.title}</span>
                          <span className="text-xs text-slate-400 truncate block mt-0.5">{cDoc.desc}</span>
                        </div>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setDebugModalDocType(cDoc.id);
                          setIsDebugModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      >
                        <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                        <span>좌표</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => handleOpenCompanyDocRequest()}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-emerald-950/30 text-emerald-300 rounded-2xl border border-white/10 transition flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm font-bold"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>회사 구비서류 요청문 발송</span>
                </button>
                <button 
                  type="button"
                  onClick={generateSelectedPDFs}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{t('btn_generate')}</span>
                </button>
              </div>

              {/* Downloads list */}
              {downloadLinks.length > 0 && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      생성된 서류 목록 ({downloadLinks.length}건)
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPdfPreview(downloadLinks[0].url, downloadLinks[0].name, downloadLinks[0].filename)}
                      className="px-2.5 py-1 bg-blue-600/25 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>미리보기</span>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {downloadLinks.map((link, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between p-3 bg-black/40 border border-emerald-500/20 rounded-xl"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="text-xs sm:text-sm font-bold text-white block truncate">{link.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono block truncate">{link.filename}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPdfPreview(link.url, link.name, link.filename)}
                            className="text-xs font-bold text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>보기</span>
                          </button>
                          <a 
                            href={link.url}
                            download={link.filename}
                            className="text-xs font-bold text-emerald-300 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>다운로드</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation button */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(5)} 
                  className="w-1/3 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setCheckedRequiredDocs({});
                    handleNextStep(7);
                  }}
                  className="w-2/3 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>{t('btn_to_step7')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 7: Final Checklist */}
          {step === 7 && (
            <motion.div 
              key="step7"
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="pb-3 border-b border-white/10">
                <span className="text-cyan-400 font-mono font-bold text-xs uppercase tracking-widest">
                  {t('s7_step')}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {t('s7_title')}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{t('s7_desc')}</p>
              </div>

              {/* Informational Guidance Notice Box */}
              <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/25 flex items-start gap-3 text-xs leading-relaxed shadow-lg">
                <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-slate-300">
                  <p className="font-extrabold text-white text-xs sm:text-sm">
                    서류 주체별 발급 및 구비 가이드 안내
                  </p>
                  <p>
                    • <strong className="text-emerald-300 font-bold">회사 발행 서류 (표준근로계약서, 재직증명서, 사업자등록증 등)</strong>: 소속 회사(인사팀/총무부)에서 직접 발급하여 직인을 날인해 주는 서류입니다. <strong className="text-emerald-400">[회사요청]</strong> 버튼을 누르면 담당자에게 카톡/이메일로 보낼 수 있는 요청문을 즉시 생성합니다.
                  </p>
                  <p>
                    • <strong className="text-amber-300 font-bold">본인 준비 서류 (소득금액증명원, 외국인등록사실증명 등)</strong>: <strong className="text-amber-400">[발급 가이드 & 이동]</strong> 버튼을 누르면 국세청 홈택스, 정부24, 하이코리아 등 해당 기관 공식 사이트로 즉시 이동하며, 본인인증 방법 및 메뉴 접속 순서를 단계별로 확인하실 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="bg-[#0f111a] border border-white/10 p-4 sm:p-5 rounded-3xl shadow-xl space-y-3">
                {(() => {
                  const docList = docMatrix[formData.visaType]?.[formData.reqType] || docMatrix[formData.visaType]?.['default'] || [];
                  if (docList.length === 0) {
                    return <div className="text-center py-6 text-sm text-slate-400">등록된 구비서류 정보가 없습니다.</div>;
                  }
                  return (
                    <div className="space-y-2.5">
                      {docList.map((doc, idx) => {
                        const docName = doc.name[currentLang] || doc.name.kr;
                        const isDocChecked = !!checkedRequiredDocs[idx];
                        let badgeColor = '';
                        let badgeLabel = '';
                        if (doc.type === 'auto') {
                          badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                          badgeLabel = t('badge_auto');
                        } else if (doc.type === 'company') {
                          badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                          badgeLabel = t('badge_company');
                        } else {
                          badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                          badgeLabel = t('badge_personal');
                        }
                        return (
                          <div 
                            key={idx}
                            className={`p-3.5 border rounded-2xl transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                              isDocChecked 
                                ? 'bg-emerald-950/20 border-emerald-500/60' 
                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                            }`}
                          >
                            <label className="flex items-start sm:items-center flex-1 min-w-0 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isDocChecked}
                                onChange={(e) => {
                                  setCheckedRequiredDocs(prev => ({
                                    ...prev,
                                    [idx]: e.target.checked
                                  }));
                                }}
                                className="w-4 h-4 text-emerald-500 rounded mr-3.5 mt-0.5 sm:mt-0 cursor-pointer shrink-0" 
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-slate-200 text-xs sm:text-sm block break-keep">{docName}</span>
                                {doc.type === 'company' && (
                                  <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                                    * 소속 회사(인사팀)에서 직접 발행하는 서류
                                  </span>
                                )}
                                {doc.type === 'personal' && (
                                  <span className="text-[11px] text-amber-400/80 block mt-0.5">
                                    * 국세청 홈택스 / 정부24 / 기관 사이트에서 본인 발급
                                  </span>
                                )}
                                {doc.type === 'auto' && (
                                  <span className="text-[11px] text-blue-400/80 block mt-0.5">
                                    * 스마트 비자 시스템에서 법정 규격 PDF 자동 생성 완료
                                  </span>
                                )}
                              </div>
                            </label>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                              <span 
                                onClick={() => {
                                  if (doc.type === 'personal') {
                                    handleOpenGovGuide(doc.name.kr);
                                  } else if (doc.type === 'company') {
                                    handleOpenCompanyDocRequest([doc.name.kr]);
                                  }
                                }}
                                className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold border shrink-0 ${badgeColor} ${
                                  doc.type !== 'auto' ? 'cursor-pointer hover:brightness-125' : ''
                                }`}
                                title={doc.type === 'personal' ? '발급 가이드 열기' : doc.type === 'company' ? '회사 요청문 작성' : undefined}
                              >
                                {badgeLabel}
                              </span>

                              {doc.type === 'company' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleOpenCompanyDocRequest([doc.name.kr]);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="회사 담당자에게 서류 발송 요청문 생성"
                                >
                                  <Building2 className="w-3.5 h-3.5" />
                                  <span>회사요청</span>
                                </button>
                              )}

                              {doc.type === 'personal' && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleOpenGovGuide(doc.name.kr);
                                  }}
                                  className="px-2.5 py-1 bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                                  title="발급처 사이트 바로가기 및 상세 발급 순서 확인"
                                >
                                  <Globe className="w-3.5 h-3.5 text-amber-300" />
                                  <span>발급 가이드 & 이동</span>
                                  <ExternalLink className="w-3 h-3 text-amber-400" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button 
                  type="button"
                  onClick={() => handlePrevStep(6)} 
                  className="sm:w-1/4 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition cursor-pointer text-xs sm:text-sm"
                >
                  {t('btn_prev')}
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenGovGuide()}
                  className="sm:w-1/3 py-3.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-200 border border-amber-500/30 font-bold rounded-xl transition text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-amber-300" />
                  <span>정부기관 발급 가이드 전체보기</span>
                </button>
                <button 
                  type="button"
                  onClick={handleHomeClick}
                  className="sm:flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl transition border border-white/10 text-xs sm:text-sm cursor-pointer shadow"
                >
                  {t('btn_home')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer credits */}
      <footer className="text-center py-6 text-xs text-slate-500 border-t border-white/5 relative z-10">
        <span>Made by 정민규 &copy; {new Date().getFullYear()} HD HYUNDAI SAMHO HEAVY INDUSTRIES. ALL RIGHTS RESERVED.</span>
      </footer>

      {/* Popups & Modals */}
      <DocInfoModal 
        isOpen={isDocInfoOpen}
        onClose={() => setIsDocInfoOpen(false)}
        visaType={formData.visaType}
        reqType={activeDocInfoType}
        currentLang={currentLang}
        onRequestCompanyDoc={(docs) => handleOpenCompanyDocRequest(docs)}
        onOpenGovDocGuide={(docName) => handleOpenGovGuide(docName)}
      />

      <CompanyDocRequestModal
        isOpen={isCompanyDocModalOpen}
        onClose={() => setIsCompanyDocModalOpen(false)}
        formData={formData}
        targetDocNames={companyDocModalTargets}
        visaType={formData.visaType}
        reqType={formData.reqType}
      />

      <DBModal 
        isOpen={isDBModalOpen}
        onClose={() => setIsDBModalOpen(false)}
        onLoadItem={handleLoadItem}
        onDeleteItem={handleDeleteItem}
      />

      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(file) => processOCRFile(file)}
        currentLang={currentLang}
      />

      <WorkplaceModal
        isOpen={isWorkplaceModalOpen}
        onClose={() => {
          setIsWorkplaceModalOpen(false);
          try {
            const saved = localStorage.getItem('visaWorkplaces');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) setWorkplaces(parsed);
            }
          } catch(e) {}
        }}
        workplaces={workplaces || DEFAULT_WORKPLACES}
        selectedWorkplaceId={selectedWorkplaceId}
        onSelectWorkplace={(wp) => {
          handleSelectWorkplace(wp);
          setSelectedWorkplaceId(wp.id);
        }}
        onSaveWorkplaces={handleSaveWorkplaces}
        lang={currentLang}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        onClearAllData={() => {
          handleResetData();
          showAlert('초기화 완료', '모든 개인정보가 파기되었습니다.', 'success');
        }}
      />

      <TemplateManagerModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        lang={currentLang}
        onOpenDebugDoc={(docId) => {
          setDebugModalDocType(docId);
          setIsDebugModalOpen(true);
        }}
      />

      <PdfDebugModal
        isOpen={isDebugModalOpen}
        onClose={() => setIsDebugModalOpen(false)}
        formData={formData}
        initialDocType={debugModalDocType}
        onUpdateCustomDocs={(docs) => setCustomDocList(docs)}
      />

      <PdfPreviewModal
        isOpen={previewPdfState.isOpen}
        onClose={() => setPreviewPdfState(prev => ({ ...prev, isOpen: false }))}
        pdfUrl={previewPdfState.url}
        title={previewPdfState.title}
        filename={previewPdfState.filename}
      />

      <GovDocGuideModal
        isOpen={isGovGuideModalOpen}
        onClose={() => setIsGovGuideModalOpen(false)}
        targetDocName={govGuideTargetDoc}
        lang={currentLang}
      />

      {/* Alert modal */}
      {msgDialog.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[220] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-xs shadow-2xl border border-white/10 text-center">
            <div className="mb-4">
              {msgDialog.type === 'success' ? (
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : msgDialog.type === 'error' ? (
                <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                  <Info className="w-7 h-7" />
                </div>
              )}
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">{msgDialog.title}</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6 whitespace-pre-wrap">{msgDialog.desc}</p>
            <button 
              type="button"
              onClick={closeAlert}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-md"
            >
              확인 (OK)
            </button>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[220] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-xs shadow-2xl border border-white/10 text-center">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-white mb-1">{confirmDialog.title}</h3>
            <p className="text-xs text-slate-400 font-semibold mb-6 whitespace-pre-wrap">{confirmDialog.desc}</p>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={closeConfirm}
                className="w-1/2 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 rounded-xl font-bold transition text-xs cursor-pointer"
              >
                취소 (Cancel)
              </button>
              <button 
                type="button"
                onClick={handleConfirmOk}
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition text-xs cursor-pointer shadow-md"
              >
                확인 (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

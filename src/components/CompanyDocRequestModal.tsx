import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Copy, Mail, MessageSquare, Printer, Check, 
  Calendar, User, FileText, Eye, FileCheck
} from 'lucide-react';
import { FormData } from '../types';
import { reqNames } from '../i18n';

interface CompanyDocRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  targetDocNames?: string[];
  visaType: string;
  reqType: string;
}

const DEFAULT_COMPANY_DOCS = [
  '표준근로계약서 사본',
  '재직증명서',
  '사업자등록증 사본',
  '국세 납세증명서 (체납 없음 확인용)',
  '지방세 납세증명서',
  '4대 사회보험 사업장 가입자 명부',
  '고용허가서 사본 (E-9)',
  '고용기업 추천서 (직인 날인)',
  '부가가치세 과세표준증명원'
];

export const CompanyDocRequestModal: React.FC<CompanyDocRequestModalProps> = ({
  isOpen,
  onClose,
  formData,
  targetDocNames = [],
  visaType,
  reqType
}) => {
  const [recipientType, setRecipientType] = useState<'ceo' | 'hr' | 'custom'>('hr');
  const [customRecipient, setCustomRecipient] = useState<string>('');
  const [formatMode, setFormatMode] = useState<'email' | 'messenger' | 'formal'>('email');
  const [copied, setCopied] = useState<boolean>(false);
  const [customDocInput, setCustomDocInput] = useState<string>('');
  const [availableDocs, setAvailableDocs] = useState<string[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      const mergedList = Array.from(new Set([
        ...(targetDocNames && targetDocNames.length > 0 ? targetDocNames : []),
        ...DEFAULT_COMPANY_DOCS
      ]));
      setAvailableDocs(mergedList);

      const initialMap: Record<string, boolean> = {};
      if (targetDocNames && targetDocNames.length > 0) {
        targetDocNames.forEach(d => { initialMap[d] = true; });
      } else {
        mergedList.slice(0, 4).forEach(d => { initialMap[d] = true; });
      }
      setSelectedDocs(initialMap);
    }
  }, [isOpen, targetDocNames]);

  const defaultDeadline = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}년 ${m}월 ${day}일까지`;
  }, []);

  const [deadline, setDeadline] = useState<string>(defaultDeadline);
  const [additionalNote, setAdditionalNote] = useState<string>('');

  if (!isOpen) return null;

  const fullName = `${formData.i_surname} ${formData.i_givenname}`.trim().toUpperCase() || '외국인 근로자';
  const companyName = formData.i_cname || '회사(사업장)';
  const repName = formData.i_rep_name || '대표이사';
  const reqTitle = reqNames[reqType] || '체류기간 연장허가';
  const arcMasked = formData.i_arc 
    ? (formData.i_arc.length > 7 ? `${formData.i_arc.slice(0, 8)}******` : formData.i_arc)
    : '등록번호 기재 예정';
  const nationality = formData.i_nation || '외국국적';

  const recipientLabel = recipientType === 'ceo' 
    ? `${companyName} ${repName} 대표님 귀하` 
    : recipientType === 'hr'
    ? `${companyName} 인사총무부(외국인 비자 담당자) 귀하`
    : (customRecipient.trim() || `${companyName} 비자 담당자님 귀하`);

  const activeDocList = availableDocs.filter(k => selectedDocs[k]);

  const handleAddCustomDoc = () => {
    const trimmed = customDocInput.trim();
    if (!trimmed) return;
    if (!availableDocs.includes(trimmed)) {
      setAvailableDocs(prev => [...prev, trimmed]);
    }
    setSelectedDocs(prev => ({ ...prev, [trimmed]: true }));
    setCustomDocInput('');
  };

  const emailSubject = `[비자신청 서류요청] ${fullName} 근로자 출입국 제출용 회사 서류 요청의 건 (${visaType || 'E-7/E-9'})`;

  const emailBody = `${recipientLabel}

안녕하십니까, ${companyName} 외국인 근로자 비자 행정 처리 안내드립니다.

소속 외국인 근로자 [${fullName}]의 출입국관리청 ${reqTitle} 신청 서류를 준비 중입니다.
출입국청 제출을 위해 아래 회사 구비서류를 기한 내에 발급 및 날인하여 전달해주시길 정중히 요청드립니다.

■ 근로자 기본 인적사항
• 성명(영문): ${fullName} (${nationality})
• 외국인등록번호: ${arcMasked}
• 신청 체류자격: ${visaType || '비자'} / ${reqTitle}
• 소속 근무처: ${companyName}

■ 요청 서류 목록 (${activeDocList.length}건)
${activeDocList.length > 0 ? activeDocList.map((doc, idx) => `${idx + 1}. ${doc}`).join('\n') : '(선택된 서류가 없습니다.)'}

■ 제출 요청 기한: ${deadline}
${additionalNote ? `■ 전달 및 참고사항: ${additionalNote}\n` : ''}
서류 발급 후 스캔본을 이메일로 회신 주시거나 원본을 행정담당자에게 전달해주시기 바랍니다.
원활한 출입국 민원 접수가 완료될 수 있도록 협조 부탁드립니다. 감사합니다.

${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
HD현대삼호 외국인 비자지원 시스템 드림`;

  const messengerBody = `[비자신청 서류요청]
${recipientLabel}

${fullName} 근로자의 출입국 비자 신청(${visaType || '비자'} ${reqTitle})을 위해 아래 회사 구비서류 전달을 부탁드립니다.

■ 요청 서류 목록 (${activeDocList.length}건):
${activeDocList.length > 0 ? activeDocList.map((doc, idx) => `• ${doc}`).join('\n') : '• 요청 서류 없음'}

■ 기한: ${deadline}
${additionalNote ? `■ 특이사항: ${additionalNote}\n` : ''}
감사합니다.`;

  const currentDisplayContent = formatMode === 'messenger' ? messengerBody : emailBody;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentDisplayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = currentDisplayContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenMailApp = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoUrl;
  };

  const handleOpenSmsApp = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:${separator}body=${encodeURIComponent(messengerBody)}`;
    window.location.href = smsUrl;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>회사 구비서류 요청 공문 - ${fullName}</title>
        <style>
          body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #003366; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: bold; color: #003366; letter-spacing: -0.5px; }
          .meta { font-size: 13px; color: #555; margin-top: 8px; display: flex; justify-content: space-between; }
          .section-title { font-size: 15px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; color: #003366; border-left: 4px solid #003366; padding-left: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; font-size: 14px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f4f6f9; width: 25%; font-weight: bold; }
          .doc-table th { background: #eef2f7; text-align: center; }
          .doc-table td { text-align: left; }
          .footer { margin-top: 50px; text-align: right; font-size: 15px; }
          @media print { body { padding: 15px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">출입국 비자 행정 서류 구비 협조 요청서</div>
          <div class="meta">
            <span>문서번호: HDSH-VISA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}</span>
            <span>수신: ${recipientLabel}</span>
          </div>
        </div>

        <div class="section-title">1. 대상 근로자 인적사항</div>
        <table>
          <tr>
            <th>성 명 (Full Name)</th>
            <td><strong>${fullName}</strong> (${nationality})</td>
            <th>외국인등록번호</th>
            <td>${arcMasked}</td>
          </tr>
          <tr>
            <th>신청 자격</th>
            <td>${visaType || '비자'} / ${reqTitle}</td>
            <th>소속 사업장</th>
            <td>${companyName}</td>
          </tr>
        </table>

        <div class="section-title">2. 회사 구비 요청 서류 (${activeDocList.length}건)</div>
        <table class="doc-table">
          <thead>
            <tr>
              <th style="width: 10%;">연번</th>
              <th>요청 서식 명칭</th>
              <th style="width: 25%;">비고 / 준비요령</th>
            </tr>
          </thead>
          <tbody>
            ${activeDocList.map((d, idx) => `
              <tr>
                <td style="text-align: center;">${idx + 1}</td>
                <td><strong>${d}</strong></td>
                <td>원본 또는 직인 날인본</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="section-title">3. 제출 기한 및 안내사항</div>
        <table>
          <tr>
            <th>제출 마감일시</th>
            <td><strong style="color: #c00;">${deadline} 까지</strong></td>
          </tr>
          ${additionalNote ? `
          <tr>
            <th>비고 사항</th>
            <td>${additionalNote}</td>
          </tr>
          ` : ''}
        </table>

        <p style="margin-top: 25px; font-size: 14px; line-height: 1.8;">
          상기 외국인 근로자의 안정적인 체류자격 유지 및 공기 준수를 위해 필요한 법정 출입국 제출 서류이오니 기한 내 발급 협조 부탁드립니다.
        </p>

        <div class="footer">
          <p>${new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p style="margin-top: 15px; font-weight: bold; font-size: 16px;">
            ${companyName} 비자 행정 지원팀
          </p>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[180] flex items-center justify-center p-2 sm:p-4 select-none animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#10121a] border border-white/10 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#151824] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="text-xs sm:text-base font-bold text-white truncate">
                  회사 구비서류 요청 메시지 생성기
                </h3>
                <span className="hidden xs:inline-block text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shrink-0">
                  원클릭 발송
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate sm:whitespace-normal">
                사업주/인사담당자에게 필요한 회사 서류를 이메일 또는 메신저로 즉시 요청하세요.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recipient */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>수신자 호칭 선택</span>
              </label>
              <div className="flex items-center gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setRecipientType('hr')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'hr'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  인사담당자
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('ceo')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'ceo'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  대표이사님
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientType('custom')}
                  className={`flex-1 py-1.5 px-2 rounded-lg border font-medium transition cursor-pointer text-center ${
                    recipientType === 'custom'
                      ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  직접 입력
                </button>
              </div>
              {recipientType === 'custom' && (
                <input 
                  type="text"
                  placeholder="예: 현대삼호 인사과 홍길동 책임 귀하"
                  value={customRecipient}
                  onChange={(e) => setCustomRecipient(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Deadline */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>제출 마감 기한</span>
              </label>
              <input 
                type="text"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="예: 2026년 10월 20일까지"
                className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">
                * 영업일 기준 통상 3일 이내로 설정 권장
              </p>
            </div>
          </div>

          {/* Target Documents Checklist with Add Custom Doc */}
          <div className="p-3.5 bg-white/[0.02] border border-white/10 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>요청 서류 목록</span>
                <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  {activeDocList.length}건
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  const allMap: Record<string, boolean> = {};
                  const isAllChecked = availableDocs.every(d => selectedDocs[d]);
                  availableDocs.forEach(d => { allMap[d] = !isAllChecked; });
                  setSelectedDocs(allMap);
                }}
                className="text-[11px] text-slate-400 hover:text-white transition cursor-pointer"
              >
                {availableDocs.every(d => selectedDocs[d]) ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {availableDocs.map(doc => {
                const isChecked = !!selectedDocs[doc];
                return (
                  <label 
                    key={doc}
                    className={`flex items-center p-2 rounded-xl border text-xs transition cursor-pointer ${
                      isChecked
                        ? 'bg-blue-600/15 border-blue-500/40 text-blue-200 font-medium shadow-sm'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setSelectedDocs(prev => ({
                          ...prev,
                          [doc]: e.target.checked
                        }));
                      }}
                      className="w-3.5 h-3.5 text-blue-500 rounded border-white/20 mr-2 bg-black/40 cursor-pointer shrink-0"
                    />
                    <span className="truncate">{doc}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex gap-1.5 pt-1">
              <input 
                type="text"
                placeholder="+ 기타 서류 직접 추가 (예: 조선업 출입증 사본)"
                value={customDocInput}
                onChange={(e) => setCustomDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomDoc();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddCustomDoc}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
              >
                추가
              </button>
            </div>
          </div>

          {/* Mode Tabs & Live Preview Header */}
          <div className="space-y-2">
            <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mr-1 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">양식 미리보기:</span> 
                </span>
                <button
                  type="button"
                  onClick={() => setFormatMode('email')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'email'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  <span>이메일 본문</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('messenger')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'messenger'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>문자/카톡</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormatMode('formal')}
                  className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                    formatMode === 'formal'
                      ? 'bg-purple-600 text-white font-bold shadow-sm'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <FileCheck className="w-3 h-3" />
                  <span>공문 서식</span>
                </button>
              </div>
              
              <button
                onClick={handleCopy}
                className={`self-end xs:self-auto px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사됨!' : '본문 복사'}</span>
              </button>
            </div>

            {/* Message Preview Box */}
            {formatMode === 'formal' ? (
              <div className="p-4 bg-white text-slate-900 rounded-xl font-sans text-xs border border-white/20 shadow-md max-h-60 overflow-y-auto select-text leading-normal">
                <div className="text-center font-bold text-sm tracking-widest border-b-2 border-slate-900 pb-2 mb-3">
                  출입국 비자 행정 서류 구비 협조 요청서
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 mb-3">
                  <span>문서번호: HDSH-IMMI-{new Date().getFullYear()}-0926</span>
                  <span>수신: <strong>{recipientLabel}</strong></span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-3">
                  <div className="font-bold text-slate-800 mb-1">대상자: {fullName} ({nationality})</div>
                  <div className="text-slate-600">등록번호: {arcMasked} | 비자: {visaType || '비자'} ({reqTitle})</div>
                </div>
                <div className="font-bold text-slate-800 mb-1.5">요청 서류 목록 ({activeDocList.length}종):</div>
                <ol className="list-decimal pl-5 space-y-0.5 text-slate-700 mb-3">
                  {activeDocList.map((doc, i) => (
                    <li key={i} className="font-medium">{doc}</li>
                  ))}
                </ol>
                <div className="text-slate-800 mb-2">
                  제출 기한: <strong className="text-rose-600">{deadline} 까지</strong>
                </div>
                {additionalNote && (
                  <div className="text-slate-600 mb-2">비고사항: {additionalNote}</div>
                )}
                <div className="text-right text-slate-500 text-[11px] mt-4 pt-2 border-t border-slate-200">
                  {companyName} 행정지원팀
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="p-3.5 bg-black/60 border border-white/10 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto select-text shadow-inner">
                  {currentDisplayContent}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <input 
              type="text"
              placeholder="추가 안내사항 (예: 사업자등록증은 최신 발급본으로 부탁드립니다)"
              value={additionalNote}
              onChange={(e) => setAdditionalNote(e.target.value)}
              className="w-full px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 bg-[#151824] border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-4 shrink-0">
          <div className="text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>상용 메신저 및 이메일 클라이언트 자동 연동 지원</span>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>공문출력/PDF</span>
            </button>
            <button
              onClick={handleOpenSmsApp}
              className="px-2.5 sm:px-3 py-2 sm:py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>문자전송</span>
            </button>
            <button
              onClick={handleOpenMailApp}
              className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>메일작성</span>
            </button>
            <button
              onClick={() => {
                handleCopy();
                setTimeout(() => onClose(), 600);
              }}
              className="px-2.5 sm:px-3.5 py-2 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>복사 후 닫기</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

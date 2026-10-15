import React from 'react';
import { ShieldCheck, Lock, Trash2, X, CheckCircle2, FileText } from 'lucide-react';
import { LangCode } from '../i18n';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: LangCode;
  onClearPrivacyCache?: () => void;
  onClearAllData?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  lang = 'kr',
  onClearPrivacyCache,
  onClearAllData
}) => {
  if (!isOpen) return null;

  const handleClear = () => {
    if (onClearAllData) onClearAllData();
    else if (onClearPrivacyCache) onClearPrivacyCache();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#12141c] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/10 flex items-center justify-between bg-[#171a26]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {lang === 'kr' ? '개인정보 보호 및 보안 처리 지침' : 'Personal Information & Compliance Policy'}
              </h3>
              <p className="text-[11px] sm:text-xs text-emerald-400 font-mono truncate">
                🔒 GDPR & 개인정보보호법 준수 (Client-Side Memory First)
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-3 sm:space-y-4 flex-1 text-xs leading-relaxed text-slate-300">
          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400 shrink-0" />
              1. 수집 및 처리 목적
            </h4>
            <p className="text-slate-300 break-keep">
              본 비자지원 스마트 시스템(HelpMe Visa)은 외국인 근로자의 <strong>출입국관리법상 체류기간 연장, 근무처 변경, 체류자격 변경(E-7-4R 등) 및 신원보증 서식 자동 생성</strong>을 위한 목적으로만 최소한의 개인정보를 수집·처리합니다.
            </p>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
              2. 처리하는 고유식별정보 및 보호 조치
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li><strong>외국인 근로자:</strong> 외국인등록번호(ARC), 여권번호, 성명, 생년월일, 주소</li>
              <li><strong>고용 사업장:</strong> 사업자등록번호, 대표자 생년월일(마스킹 보존), 연락처</li>
              <li><strong>신원보증인:</strong> 대표자 주민등록번호 앞자리 및 성명</li>
            </ul>
          </div>

          <div className="p-3 sm:p-4 bg-white/5 border border-white/10 rounded-xl space-y-1.5 sm:space-y-2">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              3. 파기 및 보안 관리
            </h4>
            <p className="text-slate-300 break-keep">
              사용자가 서류 작성을 완료하고 <strong>'PDF 생성'</strong> 후 브라우저 캐시 삭제 또는 세션 초기화 시 로컬 저장소의 모든 입력 데이터는 즉시 완전 파기됩니다.
            </p>
          </div>

          {/* Action Box: Purge Cache */}
          <div className="p-3.5 sm:p-4 bg-red-950/20 border border-red-500/30 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h5 className="font-bold text-red-300 text-xs sm:text-sm flex items-center gap-1.5">
                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                임시 저장 데이터 즉시 완전 삭제
              </h5>
              <p className="text-slate-400 text-[11px] mt-0.5 break-keep">
                브라우저 LocalStorage에 임시 저장된 모든 근로자 정보 및 자동저장 데이터를 즉각 초기화합니다.
              </p>
            </div>
            <button
              onClick={() => {
                handleClear();
                onClose();
              }}
              className="w-full sm:w-auto px-3.5 py-2 bg-red-600/90 hover:bg-red-500 text-white font-bold rounded-lg transition shrink-0 flex items-center justify-center gap-1.5 shadow-lg text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              데이터 완전 파기
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-t border-white/10 bg-[#171a26] flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 text-center"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

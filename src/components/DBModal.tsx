import React from 'react';
import { X, Search, Trash2, ShieldAlert, Database, Cloud } from 'lucide-react';
import { EmployeeDBItem } from '../types';
import { fetchEmployees, deleteEmployee } from '../firebase';
import { findCountry } from './CountryFlagPicker';

interface DBModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadItem: (item: EmployeeDBItem) => void;
  onDeleteItem: (arc: string) => void;
}

export const DBModal: React.FC<DBModalProps> = ({
  isOpen,
  onClose,
  onLoadItem,
  onDeleteItem,
}) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [pwdError, setPwdError] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [items, setItems] = React.useState<EmployeeDBItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [dbSource, setDbSource] = React.useState<'cloud' | 'local'>('local');

  React.useEffect(() => {
    if (!isOpen) {
      setIsAuthenticated(false);
      setPasswordInput('');
      setPwdError(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (isOpen && isAuthenticated) {
      setLoading(true);
      fetchEmployees()
        .then(({ source, items: loadedItems }) => {
          setItems(loadedItems);
          setDbSource(source);
        })
        .catch((err) => {
          console.error('Failed to load employee DB:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '1234') {
      setIsAuthenticated(true);
      setPwdError(false);
    } else {
      setPwdError(true);
      setPasswordInput('');
    }
  };

  const filteredItems = items.filter(emp => {
    const fullSearch = `${emp.i_surname} ${emp.i_givenname} ${emp.i_arc}`.toLowerCase();
    return fullSearch.includes(search.toLowerCase());
  });

  const handleDelete = async (arc: string) => {
    onDeleteItem(arc);
    await deleteEmployee(arc);
    setItems(prev => prev.filter(item => item.i_arc !== arc));
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[160] flex items-center justify-center p-4">
        <div className="bg-[#10121a] p-6 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-blue-500/20 relative animate-[slideUpFade_0.4s_ease-out]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              관리자 비밀번호 확인
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-3">인사담당자 전용 관리자 암호를 입력하세요. (초기 비밀번호: 1234)</p>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="비밀번호 4자리"
                autoFocus
                className={`w-full bg-black/40 border ${pwdError ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-blue-500'} text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none transition-colors text-center text-lg tracking-widest font-mono`}
              />
              {pwdError && <p className="text-rose-400 text-xs mt-2 text-center">비밀번호가 올바르지 않습니다.</p>}
            </div>
            <button type="submit" className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-[0_0_15px_rgba(59,130,246,0.3)] mt-2 cursor-pointer">
              인증 및 DB 열기
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[160] flex items-center justify-center p-2.5 sm:p-4">
      <div className="bg-[#10121a] p-4 sm:p-6 rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-blue-500/20 flex flex-col max-h-[90vh] sm:max-h-[80vh] relative animate-[slideUpFade_0.4s_ease-out]">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 truncate">
              <Database className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>등록 외국인 인력 DB</span>
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              {dbSource === 'cloud' ? (
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  <Cloud className="w-3 h-3 animate-pulse shrink-0" />
                  <span>Cloud Synced (클라우드 동기화)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  <Database className="w-3 h-3 shrink-0" />
                  <span>Local Cache (로컬 저장소)</span>
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-blue-500 text-white placeholder-slate-500 transition-all font-semibold"
            placeholder="성명 또는 외국인등록번호 검색..."
          />
        </div>

        {/* Database List */}
        <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 border border-white/10 bg-black/20 rounded-2xl min-h-[180px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
              <span className="text-sm font-semibold animate-pulse text-blue-400">인력 데이터 불러오는 중...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-slate-400">
              <ShieldAlert className="w-10 h-10 mb-2 opacity-50 text-slate-400" />
              <p className="text-sm font-semibold">저장된 근로자 정보가 없습니다.</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/5">
              {filteredItems.map((emp) => {
                const fullName = `${emp.i_surname} ${emp.i_givenname}`.toUpperCase();
                const country = findCountry(emp.i_nation);
                return (
                  <li
                    key={emp.i_arc || Math.random().toString()}
                    className="p-3 sm:p-4 flex justify-between items-center hover:bg-white/5 transition-colors cursor-pointer group gap-2"
                  >
                    <div onClick={() => onLoadItem(emp)} className="flex-1 min-w-0">
                      <div className="font-extrabold text-white text-xs sm:text-sm tracking-wide flex items-center gap-1.5 truncate">
                        {country && <span className="text-base leading-none shrink-0">{country.flag}</span>}
                        <span className="truncate">{fullName}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="bg-white/5 border border-white/10 text-slate-300 px-1.5 py-0.5 rounded font-mono text-[10px] shrink-0">
                          {emp.i_arc || '등록번호 없음'}
                        </span>
                        {country && (
                          <span className="text-[10px] text-slate-400 font-medium truncate">
                            {country.nameKr}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500 hidden xs:inline">
                          수정일: {emp.lastUpdated}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(emp.i_arc);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer shrink-0"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 sm:py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 text-slate-200 rounded-xl font-bold transition cursor-pointer min-h-[44px] text-xs sm:text-sm"
        >
          닫기 (Close)
        </button>
      </div>
    </div>
  );
};

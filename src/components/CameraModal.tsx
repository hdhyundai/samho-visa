import React from 'react';
import { X, Camera, RefreshCw, AlertTriangle, Image } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
  currentLang: 'kr' | 'en' | 'vn' | 'ne';
}

const DICT: Record<'kr' | 'en' | 'vn' | 'ne', {
  title: string;
  guide: string;
  guideSub: string;
  capture: string;
  noPermission: string;
  noPermissionDesc: string;
  fallbackBtn: string;
  close: string;
}> = {
  kr: {
    title: '외국인 신분증 / 여권 촬영',
    guide: '여권 또는 외국인등록증을 네모 상자에 맞춰 촬영해주세요.',
    guideSub: '글자가 선명하게 보일수록 AI OCR 인식 정확도가 높아집니다.',
    capture: '촬영 및 자동인식',
    noPermission: '카메라 권한이 없거나 지원되지 않는 브라우저입니다.',
    noPermissionDesc: '브라우저 주소창 좌측 자물쇠 아이콘을 클릭하여 카메라 접근 권한을 허용하시거나, 아래 파일 선택 버튼을 눌러 기존 신분증 사진을 선택해주세요.',
    fallbackBtn: '갤러리 / 파일에서 선택',
    close: '닫기'
  },
  en: {
    title: 'ID Photo Capture',
    guide: 'Please align your Passport or ARC inside the box.',
    guideSub: 'Higher clarity ensures more accurate AI OCR extraction.',
    capture: 'Capture & Scan',
    noPermission: 'Camera permission denied or unavailable.',
    noPermissionDesc: 'Please enable camera permissions or select an existing ID image below.',
    fallbackBtn: 'Select from Gallery/Files',
    close: 'Close'
  },
  vn: {
    title: 'Chụp ảnh Thẻ ID',
    guide: 'Vui lòng căn chỉnh Hộ chiếu hoặc Thẻ ARC vào khung.',
    guideSub: 'Chữ càng rõ nét, độ chính xác AI OCR càng cao.',
    capture: 'Chụp ảnh',
    noPermission: 'Không có quyền truy cập camera.',
    noPermissionDesc: 'Vui lòng cấp quyền camera hoặc chọn ảnh từ máy.',
    fallbackBtn: 'Chọn từ Thư viện/Tệp',
    close: 'Đóng'
  },
  ne: {
    title: 'फोटो खिच्नुहोस्',
    guide: 'कृपया राहदानी वा विदेशी दर्ता कार्ड बक्समा मिलाउनुहोस्।',
    guideSub: 'अक्षरहरू स्पष्ट भएमा AI ले राम्रोसँग पढ्न सक्छ।',
    capture: 'फोटो खिच्नुहोस्',
    noPermission: 'क्यामेरा अनुमति अस्वीकृत भयो।',
    noPermissionDesc: 'कृपया क्यामेरा अनुमति दिनुहोस् वा फाइलबाट फोटो छान्नुहोस्।',
    fallbackBtn: 'ग्यालरीबाट छान्नुहोस्',
    close: 'बन्द गर्नुहोस्'
  }
};

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  currentLang,
}) => {
  const [hasPermission, setHasPermission] = React.useState<boolean | null>(null);
  const [facingMode, setFacingMode] = React.useState<'environment' | 'user'>('environment');
  const [isLoading, setIsLoading] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const t = DICT[currentLang] || DICT.kr;

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setIsLoading(true);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('이 브라우저는 웹 카메라를 지원하지 않습니다.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((err) => {
          console.warn('Video playback was interrupted:', err);
        });
      }
      setHasPermission(true);
    } catch (err: any) {
      console.error('Camera startup error:', err);
      setHasPermission(false);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  if (!isOpen) return null;

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `captured_id_${Date.now()}.jpg`, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }, 'image/jpeg', 0.92);
  };

  const handleFallbackFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCapture(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[160] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#10121a] p-4 sm:p-6 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-emerald-500/20 flex flex-col items-center relative animate-[slideUpFade_0.3s_ease-out]">
        
        {/* Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-400" />
            <span className="text-base font-bold text-slate-200">{t.title}</span>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/5 active:bg-white/10 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Instructions */}
        <div className="text-center mb-4">
          <h4 className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
            {t.guide}
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            {t.guideSub}
          </p>
        </div>

        {/* Camera Stage */}
        <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-[#0A0A0C] border border-white/10 flex items-center justify-center">
          {hasPermission === false ? (
            <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center h-full overflow-y-auto">
              <AlertTriangle className="w-10 h-10 text-rose-500 mb-2 shrink-0" />
              <p className="text-xs sm:text-sm font-extrabold text-rose-400 mb-1">{t.noPermission}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 max-w-sm mb-4 leading-normal">
                {t.noPermissionDesc}
              </p>
              
              <label className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-lg shrink-0">
                <Image className="w-3.5 h-3.5" />
                <span>{t.fallbackBtn}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFallbackFile}
                  className="hidden" 
                />
              </label>
            </div>
          ) : (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-2" />
                  <span className="text-xs text-slate-400">카메라 준비 중...</span>
                </div>
              )}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {/* Guideline cutout overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <div className="w-[92%] h-[70%] border-2 border-emerald-400 border-dashed rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.45),0_0_0_9999px_rgba(10,10,12,0.68)] relative flex items-center justify-center">
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                  
                  <span className="text-[11px] text-emerald-300 font-extrabold tracking-widest uppercase bg-black/60 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-md">
                    여권 / 외국인등록증
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="w-full mt-5 flex items-center justify-between gap-4">
          {hasPermission !== false && (
            <label className="p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl border border-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0" title={t.fallbackBtn}>
              <Image className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFallbackFile}
                className="hidden" 
              />
            </label>
          )}

          {hasPermission !== false ? (
            <button
              type="button"
              onClick={handleCapture}
              disabled={isLoading}
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <Camera className="w-4 h-4" />
              <span>{t.capture}</span>
            </button>
          ) : (
            <div className="flex-1" />
          )}

          {hasPermission !== false && (
            <button
              type="button"
              onClick={toggleFacingMode}
              disabled={isLoading}
              className="p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 rounded-xl border border-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
              title="카메라 전환"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          )}

          {hasPermission === false && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-extrabold rounded-xl transition cursor-pointer text-sm"
            >
              {t.close}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

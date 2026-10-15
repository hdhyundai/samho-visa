import React, { useState, useMemo } from 'react';
import { 
  X, ExternalLink, Search, CheckCircle2, AlertTriangle, 
  HelpCircle, Globe, Building, FileText, ChevronRight, Copy, Check, Info, ShieldCheck
} from 'lucide-react';
import { LangCode } from '../i18n';

export interface GovDocGuideItem {
  id: string;
  nameKr: string;
  category: 'tax' | 'immi' | 'korean' | 'health' | 'edu';
  agencyKr: string;
  agencyEn: string;
  portalName: string;
  officialUrl: string;
  directServiceUrl?: string;
  feeKr: string;
  feeEn: string;
  processTimeKr: string;
  processTimeEn: string;
  summary: Record<LangCode, string>;
  steps: Record<LangCode, string[]>;
  tips: Record<LangCode, string[]>;
}

export const GOV_DOC_GUIDES: GovDocGuideItem[] = [
  {
    id: 'hometax_income',
    nameKr: '소득금액증명원 (최근 1~2개년)',
    category: 'tax',
    agencyKr: '국세청 (홈택스 / 손택스)',
    agencyEn: 'National Tax Service (Hometax)',
    portalName: '국세청 홈택스',
    officialUrl: 'https://www.hometax.go.kr',
    directServiceUrl: 'https://www.hometax.go.kr',
    feeKr: '무료 (인터넷 발급 시)',
    feeEn: 'Free (Online)',
    processTimeKr: '즉시 발급 (인터넷 접수 후 바로 출력)',
    processTimeEn: 'Instant online printing',
    summary: {
      kr: '출입국 심사에서 비자 연장 및 자격변경(E-7-4, F-2-R 등) 시 필수 제출 서류입니다. 연간 소득 요건 충족 여부를 확인합니다.',
      en: 'Essential proof of income required by Korean Immigration for visa extension and status change (E-7-4, F-2-R). Confirms your annual declared income.',
      vn: 'Chứng nhận mức thu nhập bắt buộc nộp cho Cục xuất nhập cảnh khi gia hạn hoặc đổi visa (E-7-4, F-2-R) để xác minh mức lương hàng năm.',
      ne: 'भिसा थप र स्थिति परिवर्तन (E-7-4, F-2-R) को लागि अध्यागमन कार्यालयमा बुझाउनुपर्ने आम्दानीको प्रमाण पत्र।'
    },
    steps: {
      kr: [
        '1단계: 국세청 홈택스(www.hometax.go.kr)에 접속 후 우측 상단 [로그인] 클릭',
        '2단계: 본인인증 로그인 (카카오, 토스, PASS 등 간편인증 또는 외국인등록번호 등록 공동·금융인증서)',
        '3단계: 상단 메뉴 [국세증명·사업자등록·세금관련 신청/신고] ➔ [즉시발급 증명] ➔ [소득금액증명] 클릭',
        '4단계: 기본 인적사항 확인 후 발급 옵션 설정:\n• 발급유형: [한글] 선택 (국내 출입국 관공서 제출용)\n• 증명구분: [근로소득자용] (또는 종합소득세 신고자용)\n• 과세기간: 비자 신청 대상 연도 선택 (예: 최근 1년 또는 최근 2년)\n• 사용목적: [관공서제출용], 제출처: [관공서] 선택\n• 주민등록번호 및 주소 공개여부: 반드시 [공개] 선택',
        '5단계: 하단 [신청하기] 클릭 ➔ 인터넷 접수목록 화면으로 자동 이동 ➔ [출력] 버튼 클릭하여 A4 종이 출력 또는 PDF 파일 저장!'
      ],
      en: [
        'Step 1: Visit National Tax Service Hometax (www.hometax.go.kr) and click [Login] at the top right.',
        'Step 2: Log in using Simple Auth (Kakao, PASS, Toss) or Financial Certificate registered with your Alien Registration Number (ARC).',
        'Step 3: In the top menu, go to [Tax Certificates (국세증명)] ➔ [Instant Issue (즉시발급 증명)] ➔ [Proof of Income (소득금액증명)].',
        'Step 4: Check your personal info and select options:\n• Issue Type: Korean [한글]\n• Income Type: Wage Earner [근로소득자용]\n• Tax Year: Select target year (last 1-2 years)\n• Purpose: Government Office Submission [관공서제출용]\n• ARC & Address display: Set to [Show / 공개] (Mandatory for immigration)',
        'Step 5: Click [Submit / 신청하기] ➔ On the application history screen, click [Print / 출력] to print or save as PDF.'
      ],
      vn: [
        'Bước 1: Truy cập trang Hometax (www.hometax.go.kr) và bấm [Đăng nhập] ở góc trên bên phải.',
        'Bước 2: Đăng nhập bằng xác thực giản tiện (Kakao, Toss, PASS) hoặc chứng thư tài chính có số ARC.',
        'Bước 3: Chọn mục [국세증명 (Chứng nhận thuế)] ➔ [소득금액증명 (Chứng nhận thu nhập)].',
        'Bước 4: Thiết lập thông tin:\n• Loại: Tiếng Hàn [한글]\n• Đối tượng: Người hưởng lương [근로소득자용]\n• Năm tính thuế: Chọn năm gần nhất\n• Mục đích: Nộp cơ quan nhà nước [관공서제출용]\n• Hiển thị số ARC và địa chỉ: Chọn [Hiển thị / 공개]',
        'Bước 5: Bấm [Đăng ký / 신청하기] ➔ Chọn [In / 출력] để in hoặc tải file PDF.'
      ],
      ne: [
        'चरण १: Hometax (www.hometax.go.kr) मा गएर माथिको [लगइन] मा थिच्नुहोस्।',
        'चरण २: Kakao, Toss, वा बैंक प्रमाणपत्र मार्फत आफ्नो ARC नम्बर प्रयोग गरी लगइन गर्नुहोस्।',
        'चरण ३: मेनुबाट [국세증명] ➔ [소득금액증명] (आम्दानी प्रमाणपत्र) छान्नुहोस्।',
        'चरण ४: विवरण भर्नुहोस्:\n• भाषा: कोरियन [한글]\n• आम्दानी प्रकार: कामदार आम्दानी [근로소득자용]\n• वर्ष: पछिल्लो १ वा २ वर्ष\n• उद्देश्य: सरकारी कार्यालय [관공서제출용]\n• ARC र ठेगाना: देखाउने [공개]',
        'चरण ५: [신청하기] थिचेपछि [출력] बाट सिधै प्रिन्ट वा PDF सेभ गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 [발급 시기 주의] 전년도(2025년 귀속) 근로소득 소득금액증명원은 매년 5월 1일 이후부터 홈택스에서 조회가 가능합니다. 5월 이전에는 전전년도 소득금액증명원과 최근 원천징수영수증(회사 직인 날인본)을 함께 제출합니다.',
        '💡 [온라인 인증 불가 시] 스마트폰 본인인증이 어려운 경우 외국인등록증을 지참하여 인근 세무서 민원실을 방문하시거나, 시청·군청·주민센터에 설치된 무인민원발급기(지문인식)를 이용하시면 무료로 즉시 발급받으실 수 있습니다.',
        '💡 [성명 일치 확인] 외국인등록증 상의 영문 성명(띄어쓰기 포함)과 홈택스 가입 명의가 100% 일치해야 본인인증이 정상 처리됩니다.'
      ],
      en: [
        '💡 [Issuance Timing] Previous year wage income certificate becomes available on Hometax after May 1st each year. Before May, use the prior year plus Company Withholding Tax Receipt with official stamp.',
        '💡 [Offline Alternative] If you cannot verify online, bring your ARC to any local District Tax Office (세무서) or use uncrewed kiosk machines at Community Centers.',
        '💡 [Name Matching] Your English name and spacing on the ARC must exactly match your telecom/bank verification name.'
      ],
      vn: [
        '💡 [Thời điểm cấp] Thu nhập năm trước chỉ có thể tra cứu trên Hometax sau ngày 1 tháng 5. Trước tháng 5, hãy nộp giấy của năm trước đó kèm Giấy khấu trừ thuế của công ty.',
        '💡 [Nếu không có xác thực online] Mang thẻ ARC đến Chi cục thuế (세무서) gần nhất hoặc máy tự động tại phường để in miễn phí.',
        '💡 [Khớp họ tên] Tên tiếng Anh trên ARC và tên đăng ký SIM điện thoại phải khớp từng ký tự.'
      ],
      ne: [
        '💡 [जारी मिति] अघिल्लो वर्षको आम्दानी प्रमाणपत्र हरेक वर्ष मे १ तारिख पछि मात्र अनलाइन उपलब्ध हुन्छ।',
        '💡 [अनलाइन नभएमा] आफ्नो विदेशी दर्ता कार्ड (ARC) लिएर नजिकको कर कार्यालय (세무서) वा वडा कार्यालयको मेसिनबाट नि:शुल्क निकाल्न सकिन्छ।',
        '💡 [नामको हिज्जे] ARC मा भएको नाम र फोन नम्बर दर्ता गर्दाको नाम हुबहु मिल्नुपर्छ।'
      ]
    }
  },
  {
    id: 'gov24_alien_cert',
    nameKr: '외국인등록 사실증명 (정부24)',
    category: 'immi',
    agencyKr: '법무부 출입국·외국인관서 / 정부24',
    agencyEn: 'Ministry of Justice / Gov24',
    portalName: '정부24 (Gov.kr)',
    officialUrl: 'https://www.gov.kr',
    directServiceUrl: 'https://www.gov.kr/portal/service/serviceInfo/127000000028',
    feeKr: '온라인 무료 (방문 발급 시 2,000원)',
    feeEn: 'Free Online (2,000 KRW in person)',
    processTimeKr: '즉시 발급 (전자문서 / 종이 출력)',
    processTimeEn: 'Instant online issuance',
    summary: {
      kr: '대한민국 내 체류지 주소 변경 이력, 등록일자, 체류자격 변동 사실을 공적으로 증명하는 법무부 공식 증명서입니다.',
      en: 'Official certificate from the Ministry of Justice proving your registered address history, entry date, and stay status in Korea.',
      vn: 'Chứng nhận chính thức của Bộ Tư pháp chứng minh lịch sử cư trú, ngày đăng ký và tư cách lưu trú tại Hàn Quốc.',
      ne: 'कोरियामा बसाइको ठेगाना, दर्ता मिति र भिसा स्थितिको आधिकारिक सरकारी प्रमाण।'
    },
    steps: {
      kr: [
        '1단계: 정부24 포털(www.gov.kr) 접속',
        '2단계: 검색창에 [외국인등록사실증명] 검색 후 검색결과에서 [발급하기] 버튼 클릭',
        '3단계: 간편인증 또는 공동·금융인증서로 회원/비회원 로그인',
        '4단계: 신청 정보 확인:\n• 본인 외국인등록번호 및 영문 성명 확인\n• 체류지 주소 변경 이력: [포함] 선택 (최근 주소 증빙 필요 시)\n• 체류자격 부여/변경 이력: [포함] 선택\n• 수령방법: [온라인발급(본인출력)] 선택',
        '5단계: 하단 [민원신청하기] 클릭 ➔ 처리완료 화면에서 [문서출력] 버튼 클릭하여 인쇄!'
      ],
      en: [
        'Step 1: Visit Gov24 portal (www.gov.kr).',
        'Step 2: In the search bar, type [외국인등록사실증명] (Alien Registration Certificate) and click [Issue / 발급하기].',
        'Step 3: Log in using Simple Authentication or Banking Certificate.',
        'Step 4: Fill in application fields:\n• Check ARC number & name\n• Address History: Select [Include / 포함]\n• Status Change History: Select [Include / 포함]\n• Delivery method: Select [Online Issue / 온라인발급(본인출력)]',
        'Step 5: Click [Submit / 민원신청하기] ➔ On completed screen, click [Print Document / 문서출력].'
      ],
      vn: [
        'Bước 1: Vào trang Gov24 (www.gov.kr).',
        'Bước 2: Tìm kiếm từ khóa [외국인등록사실증명] và bấm [발급하기 (Cấp giấy)].',
        'Bước 3: Đăng nhập bằng xác thực đơn giản (Kakao/PASS) hoặc chứng thư số.',
        'Bước 4: Kiểm tra thông tin:\n• Lịch sử đổi địa chỉ: Chọn [Bao gồm / 포함]\n• Phương thức nhận: Chọn [Tự in online / 온라인발급]',
        'Bước 5: Bấm [Đăng ký / 민원신청하기] ➔ Chọn [In tài liệu / 문서출력].'
      ],
      ne: [
        'चरण १: Gov24 (www.gov.kr) मा जानुहोस्।',
        'चरण २: [외국인등록사실증명] खोजी गरी [발급하기] थिच्नुहोस्।',
        'चरण ३: Kakao वा बैंक प्रमाणपत्रबाट लगइन गर्नुहोस्।',
        'चरण ४: ठेगाना परिवर्तन विवरण [포함] र प्राप्त गर्ने माध्यम [온라인발급] छान्नुहोस्।',
        'चरण ५: [민원신청하기] थिचेपछि [문서출력] बाट प्रिन्ट गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 인터넷 정부24 이용 시 발급 수수료가 전액 면제(0원)됩니다.',
        '💡 가까운 읍·면·동 주민센터(행정복지센터) 민원창구에서도 외국인등록증을 제시하시면 즉시 발급받으실 수 있습니다 (방문 수수료 2,000원).'
      ],
      en: [
        '💡 Online issuance via Gov24 is 100% free of charge (0 KRW).',
        '💡 You can also get it at any local Community Service Center (주민센터) by presenting your ARC (fee: 2,000 KRW).'
      ],
      vn: [
        '💡 Cấp trực tuyến qua Gov24 hoàn toàn miễn phí.',
        '💡 Có thể đến trực tiếp UBND phường (주민센터) mang theo thẻ ARC để được cấp ngay (lệ phí 2.000 KRW).'
      ],
      ne: [
        '💡 Gov24 अनलाइनबाट निकाल्दा कुनै शुल्क लाग्दैन (नि:शुल्क)।',
        '💡 नजिकको वडा कार्यालय (주민센터) मा ARC लिएर गएर पनि निकाल्न सकिन्छ (शुल्क २,००० वन)।'
      ]
    }
  },
  {
    id: 'socinet_kiip',
    nameKr: '사회통합프로그램(KIIP) 이수증 / 한국어평가 결과증명',
    category: 'korean',
    agencyKr: '법무부 출입국·외국인정책본부 사회통합정보망',
    agencyEn: 'Ministry of Justice (Socinet)',
    portalName: '사회통합정보망 (Socinet)',
    officialUrl: 'https://www.socinet.go.kr',
    directServiceUrl: 'https://www.socinet.go.kr',
    feeKr: '무료',
    feeEn: 'Free',
    processTimeKr: '즉시 인쇄 (마이페이지에서 조회)',
    processTimeEn: 'Instant download from My Page',
    summary: {
      kr: 'E-7-4(숙련기능인력) 및 E-7-4R(광역지자체 추천) 비자 신청 시 한국어 능력 배점 및 필수 요건 충족 증빙 서류입니다.',
      en: 'Essential proof of Korean proficiency score for E-7-4 and E-7-4R points-based visa applications. Issued by Ministry of Justice.',
      vn: 'Chứng nhận trình độ tiếng Hàn bắt buộc cho visa E-7-4 và E-7-4R tính điểm. Cấp bởi Bộ Tư pháp Hàn Quốc.',
      ne: 'E-7-4 र E-7-4R भिसा अंक प्रणालीका लागि कोरियन भाषा दक्षता प्रमाणित गर्ने सरकारी प्रमाणपत्र।'
    },
    steps: {
      kr: [
        '1단계: 법무부 사회통합정보망(www.socinet.go.kr) 접속',
        '2단계: 본인 계정 아이디와 비밀번호로 로그인',
        '3단계: 상단 메뉴 [마이페이지] 클릭',
        '4단계: [사회통합프로그램] ➔ [이수증 출력] 또는 [평가결과 출력] 메뉴 선택',
        '5단계: 이수한 단계(예: 2단계, 3단계, 4단계) 또는 종합평가 합격 내역 확인 후 [출력] 클릭하여 인쇄!'
      ],
      en: [
        'Step 1: Visit Socinet official portal (www.socinet.go.kr).',
        'Step 2: Log in with your registered User ID and Password.',
        'Step 3: Click [My Page (마이페이지)] in the top navigation.',
        'Step 4: Go to [KIIP Program / 평가결과조회] ➔ [Print Certificate (이수증 출력)].',
        'Step 5: Select your completed stage (Stage 2, 3, 4, etc.) and click [Print].'
      ],
      vn: [
        'Bước 1: Vào trang Socinet (www.socinet.go.kr).',
        'Bước 2: Đăng nhập bằng tài khoản và mật khẩu đã tạo.',
        'Bước 3: Chọn [Trang cá nhân (마이페이지)].',
        'Bước 4: Chọn mục [In chứng chỉ hoàn thành (이수증 출력)] hoặc kết quả thi.',
        'Bước 5: Chọn giai đoạn đã hoàn thành (Lớp 2, 3, 4...) và bấm [In].'
      ],
      ne: [
        'चरण १: Socinet (www.socinet.go.kr) मा जानुहोस्।',
        'चरण २: आफ्नो ID र पासवर्डबाट लगइन गर्नुहोस्।',
        'चरण ३: माथिको [My Page / 마이페이지] मा थिच्नुहोस्।',
        'चरण ४: [이수증 출력] (प्रमाणपत्र प्रिन्ट) मा जानुहोस्।',
        'चरण ५: पूरा गरेको तह (Stage 2, 3, 4) छानी प्रिन्ट गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 E-7-4R 지역특화비자는 사회통합프로그램 2단계 이상 이수(또는 사전평가 41점 이상)가 기본 요건입니다.',
        '💡 이수증 출력 오류 시 인터넷 익스플로러 대신 크롬(Chrome) 브라우저의 팝업 차단을 해제하고 진행하세요.'
      ],
      en: [
        '💡 E-7-4R visa requires completion of at least KIIP Stage 2 (or pre-evaluation score of 41+).',
        '💡 If printing fails, make sure pop-up blocker is disabled in your Chrome browser.'
      ],
      vn: [
        '💡 Visa E-7-4R yêu cầu tối thiểu hoàn thành KIIP lớp 2 (hoặc thi xếp lớp từ 41 điểm trở lên).',
        '💡 Hãy tắt chặn cửa sổ bật lên (pop-up) trên trình duyệt Chrome để in chứng chỉ.'
      ],
      ne: [
        '💡 E-7-4R भिसाका लागि कम्तिमा KIIP लेभल २ पास (वा प्रि-टेष्टमा ४१ अंक) हुनुपर्छ।',
        '💡 प्रिन्ट नभएमा क्रोम ब्राउजरको Pop-up Allow गर्नुहोस्।'
      ]
    }
  },
  {
    id: 'topik_cert',
    nameKr: '한국어능력시험(TOPIK) 성적증명서',
    category: 'korean',
    agencyKr: '국립국제교육원 TOPIK',
    agencyEn: 'National Institute for International Education (NIIED)',
    portalName: 'TOPIK 공식 홈페이지',
    officialUrl: 'https://www.topik.go.kr',
    directServiceUrl: 'https://www.topik.go.kr',
    feeKr: '무료 (온라인 발급)',
    feeEn: 'Free Online',
    processTimeKr: '즉시 발급 및 PDF 저장',
    processTimeEn: 'Instant print / PDF download',
    summary: {
      kr: '출입국 점수제 및 한국어 능력 증빙 공식 성적표입니다. 응시일로부터 2년 이내의 유효한 성적만 인정됩니다.',
      en: 'Official score report for TOPIK test. Scores are valid for 2 years from the test announcement date.',
      vn: 'Chứng chỉ điểm thi năng lực tiếng Hàn TOPIK chính thức, có giá trị trong vòng 2 năm kể từ ngày thi.',
      ne: 'TOPIK कोरियन भाषा परीक्षाको आधिकारिक लब्धांक पत्र। नतिजा प्रकाशन भएको २ वर्षसम्म मान्य हुन्छ।'
    },
    steps: {
      kr: [
        '1단계: TOPIK 공식 홈페이지(www.topik.go.kr) 접속',
        '2단계: 상단 메뉴 [성적확인/증명서발급] ➔ [증명서발급] 클릭',
        '3단계: 시험 회차, 수험번호, 생년월일 입력 후 [조회] 클릭',
        '4단계: 성적 확인 후 [증명서 발급/출력] 버튼 클릭',
        '5단계: 위변조 방지 프로그램 실행 후 원본 출력 또는 PDF 저장!'
      ],
      en: [
        'Step 1: Visit official TOPIK website (www.topik.go.kr).',
        'Step 2: Go to menu [Score Check / Certificate (성적확인)] ➔ [Issue Certificate (증명서발급)].',
        'Step 3: Enter your Test Round number, Registration ID, and Date of Birth.',
        'Step 4: Check your score details and click [Print Certificate].',
        'Step 5: Print original copy or save secure PDF.'
      ],
      vn: [
        'Bước 1: Vào trang chủ TOPIK (www.topik.go.kr).',
        'Bước 2: Chọn mục [성적확인 (Kiểm tra điểm)] ➔ [증명서발급 (Cấp chứng chỉ)].',
        'Bước 3: Nhập kỳ thi, số báo danh và ngày sinh.',
        'Bước 4: Kiểm tra điểm và chọn [In chứng chỉ].',
        'Bước 5: In trực tiếp hoặc lưu bản PDF bảo mật.'
      ],
      ne: [
        'चरण १: TOPIK को आधिकारिक वेबसाइट (www.topik.go.kr) मा जानुहोस्।',
        'चरण २: [성적확인] ➔ [증명서발급] मा जानुहोस्।',
        'चरण ३: परीक्षाको चरण, रोल नम्बर र जन्ममिति भर्नुहोस्।',
        'चरण ४: नतिजा हेरेपछि [증명서 발급] थिच्नुहोस्।',
        'चरण ५: प्रिन्ट वा सुरक्षित PDF सेभ गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 출입국 제출용 성적증명서는 유효기간(시험 성적 발표일로부터 2년)이 지나지 않아야 심사에 반영됩니다.',
        '💡 증명서 하단의 진위확인 바코드가 훼손되지 않도록 고화질로 인쇄하세요.'
      ],
      en: [
        '💡 Certificates must be within the 2-year validity window from the test announcement date.',
        '💡 Ensure the barcode at the bottom is clearly printed for immigration verification.'
      ],
      vn: [
        '💡 Chứng chỉ phải còn trong thời hạn 2 năm mới được Cục xuất nhập cảnh công nhận.',
        '💡 In rõ mã vạch bảo mật ở góc dưới để quét kiểm tra.'
      ],
      ne: [
        '💡 नतिजा आएको २ वर्ष भित्रको परीक्षा प्रमाणपत्र मात्र अध्यागमनले स्वीकार गर्छ।',
        '💡 तलको बारकोड प्रष्ट आउने गरी सफा प्रिन्ट गर्नुहोस्।'
      ]
    }
  },
  {
    id: 'wetax_localtax',
    nameKr: '근로자 개인 지방세 완납증명서 (체납 없음 확인용)',
    category: 'tax',
    agencyKr: '행정안전부 위택스 / 정부24 / 시·군·구청',
    agencyEn: 'Ministry of the Interior and Safety (Wetax / Gov24)',
    portalName: '위택스 (Wetax)',
    officialUrl: 'https://www.wetax.go.kr',
    directServiceUrl: 'https://www.gov.kr/portal/service/serviceInfo/PTR000050306',
    feeKr: '무료',
    feeEn: 'Free',
    processTimeKr: '즉시 발급',
    processTimeEn: 'Instant issuance',
    summary: {
      kr: '외국인 근로자가 대한민국에 납부해야 할 주민세, 자동차세 등 지방세 체납이 없음을 증명하는 서류로, 출입국 비자 연장 시 필수입니다.',
      en: 'Proof that the foreign employee has zero unpaid local taxes (resident tax, etc.). Required for all visa renewals.',
      vn: 'Chứng nhận người lao động nước ngoài không nợ thuế địa phương (thuế cư trú, v.v.). Bắt buộc khi gia hạn visa.',
      ne: 'कामदारले स्थानीय कर (बासिन्दा कर) तिर्न बाँकी नरहेको प्रमाणित गर्ने सरकारी कागजात।'
    },
    steps: {
      kr: [
        '1단계: 위택스(www.wetax.go.kr) 또는 정부24(www.gov.kr) 접속',
        '2단계: 본인인증 로그인 (간편인증 또는 공동인증서)',
        '3단계: [납세증명서 발급] ➔ [지방세 납세증명] 메뉴 선택',
        '4단계: 증명구분 [해당사항 없음(체납 없음)] 확인 및 제출처 [관공서제출용] 선택',
        '5단계: [신청하기] 클릭 ➔ 즉시 문서 출력!'
      ],
      en: [
        'Step 1: Go to Wetax (www.wetax.go.kr) or Gov24 (www.gov.kr).',
        'Step 2: Log in with Simple Auth or Banking Certificate.',
        'Step 3: Select [Tax Certificates] ➔ [Local Tax Payment Certificate (지방세 납세증명)].',
        'Step 4: Check personal details and select Purpose: [Government Submission / 관공서제출용].',
        'Step 5: Click Submit and print document.'
      ],
      vn: [
        'Bước 1: Truy cập Wetax (www.wetax.go.kr) hoặc Gov24.',
        'Bước 2: Đăng nhập bằng xác thực điện tử.',
        'Bước 3: Chọn [지방세 납세증명 (Chứng nhận nộp thuế địa phương)].',
        'Bước 4: Chọn mục đích [관공서제출용 (Nộp cơ quan nhà nước)].',
        'Bước 5: Bấm Đăng ký và in chứng nhận.'
      ],
      ne: [
        'चरण १: Wetax (www.wetax.go.kr) वा Gov24 मा जानुहोस्।',
        'चरण २: लगइन गर्नुहोस् र [지방세 납세증명] छान्नुहोस्।',
        'चरण ३: उद्देश्य [관공서제출용] छानी आवेदन गर्नुहोस्।',
        'चरण ४: सिधै प्रिन्ट गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 주민세(개인분) 체납이 단 1원이라도 있으면 출입국 비자 연장이 전면 보류되므로 사전에 완납해야 합니다.',
        '💡 관할 시·군청 및 읍·면 주민센터 민원실에서도 외국인등록증을 제시하시면 수수료 없이 즉시 발급받으실 수 있습니다.'
      ],
      en: [
        '💡 Any unpaid local tax (even 1 KRW) will put your visa renewal on hold immediately.',
        '💡 You can also obtain it instantly for free at any Town Office (주민센터) by presenting your ARC.'
      ],
      vn: [
        '💡 Nếu còn nợ thuế cư trú dù chỉ 1 Won, hồ sơ gia hạn visa sẽ bị từ chối ngay lập tức.',
        '💡 Có thể đến UBND phường (주민센터) xuất trình thẻ ARC để in miễn phí.'
      ],
      ne: [
        '💡 १ वन मात्र कर बाँकी भए पनि भिसा थप रोकिन सक्छ, त्यसैले पहिल्यै चुक्ता गर्नुहोस्।',
        '💡 वडा कार्यालयमा ARC लगेर पनि तुरुन्तै नि:शुल्क निकाल्न सकिन्छ।'
      ]
    }
  },
  {
    id: 'health_tb',
    nameKr: '결핵진단서 / 채용 건강진단서',
    category: 'health',
    agencyKr: '관할 보건소 / 법무부 지정 외국인 채용 신체검사 병원',
    agencyEn: 'Public Health Center / Designated Hospitals',
    portalName: '공공보건포털 e-보건소',
    officialUrl: 'https://www.e-health.go.kr',
    feeKr: '보건소 약 2,000원 ~ 5,000원 (병원 약 30,000원 ~ 40,000원)',
    feeEn: 'Health Center: ~3,000 KRW (Hospital: ~35,000 KRW)',
    processTimeKr: '검사 후 약 2~4일 소요',
    processTimeEn: 'Takes 2-4 days after examination',
    summary: {
      kr: '결핵 고위험국 출신 근로자의 체류기간 연장 및 자격변경 시 의무 제출 서류입니다. 흉부 X-ray 검사를 통해 발급받습니다.',
      en: 'Mandatory medical certificate for workers from designated high-TB-burden countries. Obtained through chest X-ray screening.',
      vn: 'Chứng nhận xét nghiệm lao phổi bắt buộc đối với lao động từ các quốc gia trong danh sách chỉ định khi gia hạn/đổi visa.',
      ne: 'तोकिएका देशका नागरिकहरूले भिसा थप वा परिवर्तन गर्दा अनिवार्य बुझाउनुपर्ने क्षयरोग (TB) परीक्षण रिपोर्ट।'
    },
    steps: {
      kr: [
        '1단계: 외국인등록증 및 여권 지참 후 거주지/근무지 관할 보건소 또는 법무부 지정병원 방문',
        '2단계: 민원접수처에서 [외국인 체류허가용 결핵검진] 신청서 작성 및 수수료 납부',
        '3단계: 영상의학과에서 흉부 X-ray(엑스선) 촬영 진행',
        '4단계: 검사일 기준 2~4일 후 보건소 재방문 또는 e-보건소(www.e-health.go.kr)에서 온라인 발급/인쇄!'
      ],
      en: [
        'Step 1: Bring your ARC & Passport to the local Public Health Center (보건소) or designated hospital.',
        'Step 2: Fill in the TB Screening application form for Immigration at the front desk.',
        'Step 3: Take a chest X-ray examination.',
        'Step 4: Pick up the certificate 2-4 days later in person, or print online via e-Health portal (www.e-health.go.kr).'
      ],
      vn: [
        'Bước 1: Mang theo thẻ ARC và Hộ chiếu đến Trạm y tế (보건소) hoặc bệnh viện chỉ định.',
        'Bước 2: Điền đơn đăng ký khám lao phổi phục vụ xuất nhập cảnh.',
        'Bước 3: Chụp X-quang lồng ngực.',
        'Bước 4: Nhận kết quả sau 2-4 ngày hoặc in online tại trang e-Health (www.e-health.go.kr).'
      ],
      ne: [
        'चरण १: ARC र राहदानी लिएर नजिकको स्वास्थ्य चौकी (보건소) वा तोकिएको अस्पताल जानुहोस्।',
        'चरण २: अध्यागमनका लागि क्षयरोग जाँच फाराम भर्नुहोस्।',
        'चरण ३: छातीको एक्स-रे (X-ray) गराउनुहोस्।',
        'चरण ४: २-४ दिनपछि गएर रिपोर्ट लिनुहोस् वा e-Health वेबसाइटबाट अनलाइन प्रिन्ट गर्नुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 일반 병원보다 시·군 관할 보건소(예: 영암군보건소, 목포시보건소)가 비용이 훨씬 저렴합니다.',
        '💡 진단서 유효기간은 발급일로부터 통상 3개월 이내이므로 비자 신청 시점에 맞춰 검사하세요.'
      ],
      en: [
        '💡 Public Health Centers (보건소) are much cheaper than private hospitals.',
        '💡 Medical certificates are generally valid for 3 months from the date of issue.'
      ],
      vn: [
        '💡 Khám ở Trạm y tế công (보건소) chi phí rẻ hơn nhiều so với bệnh viện tư.',
        '💡 Giấy khám chỉ có giá trị trong vòng 3 tháng kể từ ngày cấp.'
      ],
      ne: [
        '💡 सरकारी स्वास्थ्य चौकी (보건소) मा निजी अस्पताल भन्दा धेरै सस्तो हुन्छ।',
        '💡 यो रिपोर्ट जारी मितिले ३ महिनासम्म मात्र मान्य हुन्छ।'
      ]
    }
  },
  {
    id: 'hikorea_portal',
    nameKr: '하이코리아 출입국 방문예약 및 전자민원 접수',
    category: 'immi',
    agencyKr: '법무부 출입국·외국인정책본부',
    agencyEn: 'Ministry of Justice (HiKorea)',
    portalName: '하이코리아 (HiKorea)',
    officialUrl: 'https://www.hikorea.go.kr',
    feeKr: '인지대 규정에 따름 (전자민원 할인 혜택 가능)',
    feeEn: 'Standard statutory immigration fees',
    processTimeKr: '방문예약 즉시 완료 / 전자민원 3~7일 심사',
    processTimeEn: 'Instant appointment reservation',
    summary: {
      kr: '출입국사무소 방문 사전 예약 및 온라인 체류기간 연장 전자민원을 직접 신청할 수 있는 법무부 외국인 종합포털입니다.',
      en: 'The official immigration portal for foreign residents to book in-person appointments or submit e-applications online.',
      vn: 'Cổng thông tin xuất nhập cảnh chính thức để đặt lịch hẹn trực tiếp hoặc nộp hồ sơ gia hạn online.',
      ne: 'अध्यागमन कार्यालय जाने समय बुक गर्न वा अनलाइन आवेदन दिन सकिने आधिकारिक सरकारी पोर्टल।'
    },
    steps: {
      kr: [
        '1단계: 하이코리아(www.hikorea.go.kr) 접속 및 본인 계정 로그인',
        '2단계: [방문예약] ➔ [방문예약 신청(비회원/회원)] 클릭',
        '3단계: 관할 출입국청(예: 광주출입국 목포출장소) 및 처리업무 [체류관리] 선택',
        '4단계: 방문 희망 날짜 및 시간대 선택 후 [예약접수증] 출력하여 신청서류와 함께 지참 방문!'
      ],
      en: [
        'Step 1: Visit HiKorea (www.hikorea.go.kr) and log in.',
        'Step 2: Click [Reserve Visit (방문예약 신청)].',
        'Step 3: Select your jurisdictional Immigration Office (e.g. Mokpo Branch) and service type [Stay Management].',
        'Step 4: Select available date/time and print your Appointment Slip to bring along.'
      ],
      vn: [
        'Bước 1: Vào trang HiKorea (www.hikorea.go.kr) và đăng nhập.',
        'Bước 2: Chọn [Đặt lịch hẹn (방문예약)].',
        'Bước 3: Chọn Chi cục xuất nhập cảnh phụ trách và loại thủ tục.',
        'Bước 4: Chọn ngày giờ còn trống và in Giấy xác nhận đặt lịch hẹn mang theo.'
      ],
      ne: [
        'चरण १: HiKorea (www.hikorea.go.kr) मा जानुहोस्।',
        'चरण २: [방문예약] (समय बुकिङ) मा थिच्नुहोस्।',
        'चरण ३: आफ्नो क्षेत्रको अध्यागमन कार्यालय र काम छान्नुहोस्।',
        'चरण ४: मिति र समय छानी बुकिङ स्लिप प्रिन्ट गरेर कार्यालय जानुहोस्।'
      ]
    },
    tips: {
      kr: [
        '💡 방문예약 없이 출입국사무소를 방문하면 당일 접수가 불가능할 수 있으므로 최소 2~3주 전에 사전 예약하세요.'
      ],
      en: [
        '💡 Walk-ins without advance reservation may be turned away. Book at least 2-3 weeks ahead.'
      ],
      vn: [
        '💡 Nếu không đặt lịch trước có thể sẽ không được tiếp nhận hồ sơ trong ngày. Hãy đặt sớm trước 2-3 tuần.'
      ],
      ne: [
        '💡 अग्रिम बुकिङ बिना जाँदा काम नहुन सक्छ, त्यसैले २-३ हप्ता अगाडि नै बुकिङ गर्नुहोस्।'
      ]
    }
  }
];

interface GovDocGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDocName?: string;
  lang?: LangCode;
}

export const GovDocGuideModal: React.FC<GovDocGuideModalProps> = ({
  isOpen,
  onClose,
  targetDocName,
  lang = 'kr'
}) => {
  const [activeTabLang, setActiveTabLang] = useState<LangCode>(lang);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string>('hometax_income');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Sync lang
  React.useEffect(() => {
    setActiveTabLang(lang);
  }, [lang]);

  // If targetDocName provided, try matching
  React.useEffect(() => {
    if (isOpen && targetDocName) {
      const match = GOV_DOC_GUIDES.find(item => 
        item.nameKr.includes(targetDocName) || 
        targetDocName.includes(item.nameKr) ||
        (targetDocName.includes('소득금액') && item.id === 'hometax_income') ||
        (targetDocName.includes('외국인등록') && item.id === 'gov24_alien_cert') ||
        (targetDocName.includes('한국어') && item.id === 'socinet_kiip') ||
        (targetDocName.includes('사회통합') && item.id === 'socinet_kiip') ||
        (targetDocName.includes('TOPIK') && item.id === 'topik_cert') ||
        (targetDocName.includes('지방세') && item.id === 'wetax_localtax') ||
        (targetDocName.includes('결핵') && item.id === 'health_tb')
      );
      if (match) {
        setSelectedDocId(match.id);
      }
    }
  }, [isOpen, targetDocName]);

  const filteredDocs = useMemo(() => {
    return GOV_DOC_GUIDES.filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesSearch = 
        doc.nameKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.agencyKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.portalName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const currentDoc = useMemo(() => {
    return GOV_DOC_GUIDES.find(d => d.id === selectedDocId) || GOV_DOC_GUIDES[0];
  }, [selectedDocId]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleOpenSite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[180] flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#0f121d] border border-blue-500/30 w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh] overflow-hidden animate-[scaleIn_0.25s_ease-out]">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between shrink-0 bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  본인 준비 서류 안내
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  정부·공공기관 증명원 발급 가이드 & 바로가기
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                소득금액증명원, 외국인등록사실증명 등 필수 증명서의 온라인 발급 절차 및 공식 사이트 연결
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Lang Tabs */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-[11px] font-bold">
              {(['kr', 'en', 'vn', 'ne'] as LangCode[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveTabLang(l)}
                  className={`px-2 py-1 rounded-lg transition cursor-pointer uppercase ${
                    activeTabLang === l 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {l === 'kr' ? '한국어' : l === 'en' ? 'EN' : l === 'vn' ? 'VN' : 'NE'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left Nav List + Right Detail View */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          
          {/* Left Column: Document Selection List */}
          <div className="w-full md:w-72 md:border-r border-white/10 p-3 sm:p-4 flex flex-col gap-2.5 shrink-0 bg-black/20">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="증명서명 / 발급기관 검색..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium scrollbar-none">
              {[
                { id: 'all', label: '전체' },
                { id: 'tax', label: '소득/세금' },
                { id: 'immi', label: '체류/출입국' },
                { id: 'korean', label: '한국어' },
                { id: 'health', label: '건강검진' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Document Items List */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[140px] md:min-h-0">
              {filteredDocs.map((doc) => {
                const isSelected = doc.id === currentDoc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-2.5 rounded-xl border transition flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/5 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-cyan-400' : 'bg-slate-600'}`} />
                        <span className="text-xs font-bold truncate block">
                          {doc.nameKr}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5 ml-3">
                        {doc.portalName}
                      </span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Step-by-Step Guide & Official Link */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto flex flex-col space-y-5 bg-[#0b0e17]/60">
            
            {/* Title & Official Portal Jump Card */}
            <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/20 border border-blue-500/25 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                    {currentDoc.agencyKr}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    수수료: <strong className="text-emerald-400 font-bold">{currentDoc.feeKr}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
                  {currentDoc.nameKr}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {currentDoc.summary[activeTabLang] || currentDoc.summary.kr}
                </p>
              </div>

              {/* Direct Jump Button */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenSite(currentDoc.directServiceUrl || currentDoc.officialUrl)}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{currentDoc.portalName} 바로가기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(currentDoc.directServiceUrl || currentDoc.officialUrl)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="URL 복사"
                >
                  {copiedUrl === (currentDoc.directServiceUrl || currentDoc.officialUrl) ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>URL 복사</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    사이트 접속 및 단계별 상세 발급 순서
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">
                  처리시간: <strong className="text-slate-200">{currentDoc.processTimeKr}</strong>
                </span>
              </div>

              <div className="space-y-2.5">
                {(currentDoc.steps[activeTabLang] || currentDoc.steps.kr).map((stepText, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3 hover:border-blue-500/30 transition"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30 flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                        {stepText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Foreign Worker Special Tips & Warnings */}
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wider">
                  외국인 근로자 필수 주의사항 & 발급 꿀팁
                </span>
              </div>
              <ul className="space-y-1.5 text-xs text-amber-200/90 leading-relaxed pl-1">
                {(currentDoc.tips[activeTabLang] || currentDoc.tips.kr).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 shrink-0">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Offline Issuance Helper */}
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-slate-400 shrink-0" />
                <div>
                  <span className="text-white font-bold block">
                    인터넷 본인인증이 불가능한 경우 (오프라인 발급 안내)
                  </span>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    가까운 세무서 민원실, 관할 출입국관리사무소 또는 지자체 주민센터 무인민원발급기(지문인식)를 이용하세요.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSite('https://www.gov.kr')}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-[11px] font-bold shrink-0 transition cursor-pointer"
              >
                정부24 바로가기
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-white/10 flex items-center justify-between shrink-0 bg-[#090b12]">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">
              대한민국 공식 정부기관 포털 웹사이트로 직접 연결됩니다.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow cursor-pointer"
          >
            확인 (닫기)
          </button>
        </div>
      </div>
    </div>
  );
};

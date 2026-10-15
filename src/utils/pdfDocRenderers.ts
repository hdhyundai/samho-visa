import { PDFDocument, rgb, PDFPage } from 'pdf-lib';
import { FormData } from '../types';

const COLOR_TEXT = rgb(0.1, 0.1, 0.1);
const COLOR_MUTED = rgb(0.4, 0.4, 0.4);
const COLOR_BORDER = rgb(0.65, 0.65, 0.65);
const COLOR_HEADER_BG = rgb(0.93, 0.95, 0.98);
const COLOR_RED_STAMP = rgb(0.85, 0.1, 0.1);

function drawTableBox(page: PDFPage, x: number, y: number, w: number, h: number, bg?: any) {
  if (bg) {
    page.drawRectangle({ x, y, width: w, height: h, color: bg });
  }
  page.drawRectangle({
    x, y, width: w, height: h,
    borderWidth: 1,
    borderColor: COLOR_BORDER
  });
}

function drawStamp(page: PDFPage, font: any, x: number, y: number, repName: string) {
  page.drawCircle({ x, y, size: 23, color: rgb(0.98, 0.95, 0.95), borderColor: COLOR_RED_STAMP, borderWidth: 1.5 });
  page.drawText('직인생략', { x: x - 15, y: y + 4, size: 7, font, color: COLOR_RED_STAMP });
  page.drawText(`${repName.slice(0, 3)} 인`, { x: x - 15, y: y - 7, size: 7, font, color: COLOR_RED_STAMP });
}

// 1. <별지 1호> 광역지자체 추천 신청서 (E-7-4R)
export async function renderE74RRecommend(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  // Top header
  page.drawText('<별지 1호> 광역지자체 추천 신청서', { x: 40, y: 800, size: 10, font, color: COLOR_TEXT });
  
  // Title
  page.drawText('2026년도 광역형 비자 지자체 추천 신청서', { x: 105, y: 760, size: 15, font, color: COLOR_TEXT });
  page.drawText('※ 표시는 필수 기재항목(*)으로 누락 없이 작성 바랍니다.', { x: 40, y: 735, size: 8, font, color: COLOR_MUTED });

  let curY = 725;
  const tableW = 515;

  // 1. 신청구분
  drawTableBox(page, 40, curY - 24, 110, 24, COLOR_HEADER_BG);
  page.drawText('신청구분 (*)\n(해당 유형에 V 체크)', { x: 48, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 24, tableW - 110, 24);
  page.drawText('일반추천 (E-7-4)  [   ]        광역추천 (E-7-4R)  [ V ]', { x: 165, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // 2. 인적사항
  drawTableBox(page, 40, curY - 76, 110, 76, COLOR_HEADER_BG);
  page.drawText('신청인 인적사항 (*)', { x: 62, y: curY - 42, size: 9, font, color: COLOR_TEXT });
  
  // 성명 및 외국인번호
  drawTableBox(page, 150, curY - 25, 60, 25, COLOR_HEADER_BG);
  page.drawText('성  명', { x: 168, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 25, 130, 25);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 215, y: curY - 17, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 25, 80, 25, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 345, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 25, tableW - 380, 25);
  page.drawText(formData.i_arc || '880519-5600011', { x: 425, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  // 체류지 주소
  drawTableBox(page, 150, curY - 50, 60, 25, COLOR_HEADER_BG);
  page.drawText('주소(체류지)', { x: 162, y: curY - 43, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 50, tableW - 170, 25);
  page.drawText(formData.i_address_kr || '전라남도 영암군 삼호읍 대불로 120-28, 3층 302호', { x: 215, y: curY - 42, size: 8, font, color: COLOR_TEXT });

  // 연락처
  drawTableBox(page, 150, curY - 76, 60, 26, COLOR_HEADER_BG);
  page.drawText('연 락 처', { x: 163, y: curY - 69, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 76, tableW - 170, 26);
  page.drawText(`휴대전화: ${formData.i_cellphone || '010-4832-8805'}      이메일: ${formData.i_email || '-'}`, { x: 215, y: curY - 69, size: 8.5, font, color: COLOR_TEXT });
  curY -= 76;

  // 3. 체류 및 자격
  drawTableBox(page, 40, curY - 25, 110, 25, COLOR_HEADER_BG);
  page.drawText('현재 체류자격 (*)', { x: 60, y: curY - 19, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 25, tableW - 110, 25);
  page.drawText(`비자 종류: [ ${formData.visaType === 'E-7-4R' ? 'E-9' : formData.visaType} ]        국적: [ ${formData.i_nation || '우즈베키스탄'} ]`, { x: 165, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  // 4. 고용기업체 정보
  drawTableBox(page, 40, curY - 60, 110, 60, COLOR_HEADER_BG);
  page.drawText('고용기업 현황 (*)', { x: 62, y: curY - 35, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 20, 60, 20, COLOR_HEADER_BG);
  page.drawText('기 업 명', { x: 163, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 20, 130, 20);
  page.drawText(formData.i_cname || '(주)가영테크', { x: 215, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 20, 80, 20, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 345, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 20, tableW - 380, 20);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 425, y: curY - 15, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 40, 60, 20, COLOR_HEADER_BG);
  page.drawText('소 재 지', { x: 158, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 40, tableW - 170, 20);
  page.drawText(formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93 (HD현대삼호 내)', { x: 215, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 150, curY - 60, 60, 20, COLOR_HEADER_BG);
  page.drawText('대 표 자', { x: 153, y: curY - 55, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 210, curY - 60, 130, 20);
  page.drawText(formData.i_rep_name || '김가영', { x: 215, y: curY - 55, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 340, curY - 60, 80, 20, COLOR_HEADER_BG);
  page.drawText('전화번호', { x: 360, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 420, curY - 60, tableW - 380, 20);
  page.drawText(formData.i_cphone || '061-462-3588', { x: 425, y: curY - 55, size: 8.5, font, color: COLOR_TEXT });
  curY -= 60;

  // 5. 추천 사유
  drawTableBox(page, 40, curY - 60, 110, 60, COLOR_HEADER_BG);
  page.drawText('추천 필요성 및 사유', { x: 68, y: curY - 35, size: 9, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 60, tableW - 110, 60);
  page.drawText('1. 조선업 선박 블록 용접 및 도장 분야 숙련기능공으로 지역특화 광역비자(E-7-4R) 취득을 통해\n   안정적인 장기근무와 지역경제 정착을 추진하고자 함.', { x: 155, y: curY - 20, size: 7.5, font, color: COLOR_TEXT });
  page.drawText('2. 성실한 근무태도와 무단결근 없는 모범 근로자로 한국어 소통능력을 갖추어 사내 협력사\n   핵심 생산인력으로서의 추천 기준을 충족함.', { x: 155, y: curY - 45, size: 7.5, font, color: COLOR_TEXT });
  curY -= 60;

  // 6. 요건 확인
  drawTableBox(page, 40, curY - 80, 110, 80, COLOR_HEADER_BG);
  page.drawText('기본요건 충족 여부', { x: 55, y: curY - 45, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 150, curY - 80, tableW - 110, 80);
  page.drawText('1. 기본 자격요건 :       충족 [ V ]            미충족 [   ]  ', { x: 155, y: curY - 22, size: 8, font, color: COLOR_TEXT });
  page.drawText('   - 최근 10년 이내 4년 이상 E-9 등 체류 및 점수제 배점 기준 충족', { x: 165, y: curY - 36, size: 7, font, color: COLOR_MUTED });
  page.drawText('2. 소득 및 근로계약 :      충족 [ V ]            미충족 [   ]  ', { x: 155, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  page.drawText('   - 연봉 2,600만원 이상 2년 이상 근로계약 체결 완료', { x: 165, y: curY - 69, size: 7, font, color: COLOR_MUTED });
  curY -= 80;

  // Bottom statement
  page.drawText('위와 같이 광역지자체 추천서를 신청합니다.', { x: 160, y: curY - 45, size: 10, font, color: COLOR_TEXT });
  page.drawText(`${ty}년       ${tm}월       ${td}일`, { x: 380, y: curY - 75, size: 9, font, color: COLOR_TEXT });
  page.drawText(`신청인(외국인) :  ${fullName}  (서명)`, { x: 260, y: curY - 105, size: 9.5, font, color: COLOR_TEXT });

  // Footer stamp
  drawStamp(page, font, 490, curY - 105, formData.i_rep_name || '김가영');
}

// 2. <별지 2-1호> 점수제 평가표 [신청인 자가측정용] (E-7-4R)
export async function renderE74RScoreSheet(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('<별지 2-1호> 점수제 평가표 [신청인 자가측정용]', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('K-point E-7-4 점수제 자가진단 및 평가표', { x: 180, y: 780, size: 13, font, color: COLOR_TEXT });
  page.drawText('(신청인 본인이 증빙 가능한 항목에 직접 체크하여 제출합니다.)', { x: 40, y: 755, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.12, 0.22, 0.42) });
  page.drawText('광역형 숙련기능인력 (E-7-4R) 점수 배점', { x: 140, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  // Worker header
  drawTableBox(page, 40, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('성 명', { x: 50, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 24, 155, 24);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 115, y: curY - 17, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 270, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 24, tableW - 310, 24);
  page.drawText(formData.i_arc || '880519-5600011', { x: 360, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 40, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('근무처', { x: 55, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 24, 155, 24);
  page.drawText(formData.i_cname || '(주)가영테크', { x: 115, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('국 적', { x: 295, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 24, tableW - 310, 24);
  page.drawText(formData.i_nation || '우즈베키스탄', { x: 360, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // Basic Requirements Box
  drawTableBox(page, 40, curY - 70, 70, 70, COLOR_HEADER_BG);
  page.drawText('기본요건\n(필수 충족)', { x: 45, y: curY - 40, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 110, curY - 70, tableW - 70, 70);
  page.drawText('1. 최근 10년간 비전문취업(E-9, E-10, H-2) 4년 이상 국내 정상 체류  [ O ]', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  page.drawText('2. 현재 1년 이상 등록 사업장 정상 재직 중  [ O ]', { x: 120, y: curY - 34, size: 8, font, color: COLOR_TEXT });
  page.drawText('3. 향후 2년 이상 연봉 2,600만원 이상 E-7-4 근로계약 체결 완료  [ O ]', { x: 120, y: curY - 50, size: 8, font, color: COLOR_TEXT });
  page.drawText('4. 벌금 100만원 이상 형사처벌 및 출입국관리법 위반 사실 없음  [ O ]', { x: 120, y: curY - 65, size: 8, font, color: COLOR_TEXT });
  curY -= 70;

  // Score Table Header
  drawTableBox(page, 40, curY - 22, 260, 22, COLOR_HEADER_BG);
  page.drawText('평 가 항 목        ', { x: 140, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 300, curY - 22, 60, 22, COLOR_HEADER_BG);
  page.drawText('배 점', { x: 318, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 22, tableW - 320, 22, COLOR_HEADER_BG);
  page.drawText('소명 및 입증 서류', { x: 420, y: curY - 16, size: 8.5, font, color: COLOR_TEXT });
  curY -= 22;

  const scoreRows = [
    { label: '1. 평균소득 (최근 2개년 평균 4,500만원 이상)', score: '80', proof: '소득금액증명원 (홈택스)' },
    { label: '2. 한국어능력 (사회통합프로그램 2단계 / TOPIK)', score: '50', proof: '사회통합프로그램(KIIP) 이수증' },
    { label: '3. 연령 기준 (30세 ~ 39세 구간)', score: '30', proof: '외국인등록증 및 여권 사본' },
    { label: '[기본항목 소계 (160점)]', score: '160', proof: '기본항목 50점 이상 충족 (통과)', isSubtotal: true },
    { label: '4. 광역지자체 추천 (전라남도 추천서 수령)', score: '50', proof: '광역지자체 도지사 추천서' },
    { label: '5. 현 근무처 장기근속 (현 고용기업 3년 이상)', score: '50', proof: '경력증명서 및 사업자등록증' },
    { label: '6. 인구감소지역 / 뿌리산업 조선업 가점', score: '20', proof: '영암군 소재 / 4대보험 명부' },
    { label: '[가점항목 소계 (120점)]', score: '120', proof: '가점항목 충족', isSubtotal: true },
    { label: '7. 감점항목 (출입국관리법 등 위반 감점)', score: '0', proof: '해당사항 없음' }
  ];

  scoreRows.forEach(r => {
    const bg = r.isSubtotal ? rgb(0.95, 0.97, 0.92) : undefined;
    drawTableBox(page, 40, curY - 20, 260, 20, bg);
    page.drawText(r.label, { x: 45, y: curY - 14, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(page, 300, curY - 20, 60, 20, bg);
    page.drawText(r.score, { x: 322, y: curY - 14, size: 8, font, color: COLOR_TEXT });
    drawTableBox(page, 360, curY - 20, tableW - 320, 20, bg);
    page.drawText(r.proof, { x: 368, y: curY - 14, size: 7, font, color: COLOR_MUTED });
    curY -= 20;
  });

  // Total Score Row
  drawTableBox(page, 40, curY - 28, 260, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('총   점 (합산점수: 총 300점 중 200점 이상 통과)', { x: 60, y: curY - 18, size: 9, font, color: rgb(0.1, 0.2, 0.5) });
  drawTableBox(page, 300, curY - 28, 60, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('280점', { x: 318, y: curY - 18, size: 11, font, color: rgb(0.1, 0.2, 0.5) });
  drawTableBox(page, 360, curY - 28, tableW - 320, 28, rgb(0.88, 0.93, 0.99));
  page.drawText('적격 판정 (기준 200점 초과)', { x: 380, y: curY - 18, size: 8.5, font, color: rgb(0.1, 0.2, 0.5) });
  curY -= 28;

  // Date and sign
  page.drawText(`신청일자:  ${ty}.   ${tm}.   ${td}.`, { x: 60, y: curY - 50, size: 9.5, font, color: COLOR_TEXT });
  page.drawText(`신청인:  ${fullName}  (서명)`, { x: 300, y: curY - 50, size: 9.5, font, color: COLOR_TEXT });
}

// 3. <별지 3-1호> 외국인 본인 인적사항 등 확인서 (E-7-4R)
export async function renderE74RPersonalStmt(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('<별지 3-1호> 외국인 본인 인적사항 등 확인서', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('외국인 본인 인적사항 등 확인서', { x: 190, y: 780, size: 13, font, color: COLOR_TEXT });
  page.drawText('(신청인 본인의 학력, 혼인관계 및 가족사항을 정확히 기재합니다.)', { x: 40, y: 755, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.15, 0.25, 0.45) });
  page.drawText('광역형 숙련기능인력 (E-7-4R) 신청인 기본 정보', { x: 145, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('성  명', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 120, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 270, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_arc || '880519-5600011', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('국  적', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText(formData.i_nation || '우즈베키스탄', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('휴대전화번호', { x: 285, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_cellphone || '010-4832-8805', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('혼인 여부', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText('[ V ] 기혼          [   ] 미혼          [   ] 기타', { x: 120, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('최종 학력', { x: 280, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_education || '고졸', { x: 360, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('배우자 유무', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 150, 26);
  page.drawText('[ V ] 유          [   ] 무', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 265, curY - 26, 85, 26, COLOR_HEADER_BG);
  page.drawText('혼인 일자', { x: 285, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 350, curY - 26, tableW - 310, 26);
  page.drawText(formData.i_marriage_date || '2018.01.30', { x: 360, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  // Family Table Header
  drawTableBox(page, 40, curY - 26, 75, 104, COLOR_HEADER_BG);
  page.drawText('가족 사항', { x: 55, y: curY - 56, size: 9, font, color: COLOR_TEXT });

  const familyRows = [
    { rel: '배우자', name: formData.i_spouse || 'MUKHTOROVA DILNOZA', dob: formData.i_spouse_dob || '1992.09.03' },
    { rel: '자녀 1', name: formData.i_child1_name || 'IKROMOV SAIDXON NAJIBULLO UGLI', dob: formData.i_child1_dob || '2018.12.18' },
    { rel: '자녀 2', name: formData.i_child2_name || 'IKROMOV SAIDOLIMXON NAJIBULLO UGLI', dob: formData.i_child2_dob || '2021.11.02' },
    { rel: '자녀 3', name: '-', dob: '-' }
  ];

  familyRows.forEach(f => {
    drawTableBox(page, 115, curY - 26, 50, 26, COLOR_HEADER_BG);
    page.drawText(f.rel, { x: 125, y: curY - 18, size: 8, font, color: COLOR_TEXT });

    drawTableBox(page, 165, curY - 26, 165, 26);
    page.drawText(f.name, { x: 170, y: curY - 18, size: 7, font, color: COLOR_TEXT });

    drawTableBox(page, 330, curY - 26, 85, 26);
    page.drawText(f.dob, { x: 340, y: curY - 18, size: 8, font, color: COLOR_TEXT });

    drawTableBox(page, 415, curY - 26, tableW - 375, 26);
    page.drawText(f.name !== '-' ? '[   ] 국내동거        [ V ] 본국거주' : '[   ] 국내동거        [   ] 본국거주', { x: 425, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });

    curY -= 26;
  });

  page.drawText('위 기재사항은 사실과 틀림없음을 확인합니다.', { x: 185, y: curY - 60, size: 11, font, color: COLOR_TEXT });
  page.drawText(`작성일자:  ${ty}.   ${tm}.   ${td}.`, { x: 70, y: curY - 100, size: 9.5, font, color: COLOR_TEXT });
  page.drawText(`확인인(본인):  ${fullName}  (서명)`, { x: 300, y: curY - 100, size: 9.5, font, color: COLOR_TEXT });
}

// 4. [별지서식] 고용기업 추천서 (E-7-4R)
export async function renderE74RCompanyRecommend(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  page.drawText('[별지서식] 고용기업 추천서', { x: 40, y: 805, size: 9.5, font, color: COLOR_TEXT });
  page.drawText('고용기업체 대표자 추천서', { x: 190, y: 780, size: 14, font, color: COLOR_TEXT });
  page.drawText('(고용기업 대표자가 해당 외국인 근로자의 숙련도와 성실성을 확인 후 직인 날인합니다.)', { x: 40, y: 760, size: 7.5, font, color: COLOR_MUTED });

  // Banner
  page.drawRectangle({ x: 40, y: 720, width: 515, height: 26, color: rgb(0.12, 0.28, 0.45) });
  page.drawText('광역형 숙련기능인력 (E-7-4R) 기업추천 사항', { x: 145, y: 728, size: 11, font, color: rgb(1, 1, 1) });

  let curY = 720;
  const tableW = 515;

  // 1. 피추천인 정보
  drawTableBox(page, 40, curY - 72, 60, 72, COLOR_HEADER_BG);
  page.drawText('피추천인\n(외국인)', { x: 55, y: curY - 40, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('성 명', { x: 118, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, 150, 24);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 175, y: curY - 17, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 325, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 24, tableW - 365, 24);
  page.drawText(formData.i_arc || '880519-5600011', { x: 415, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('국 적', { x: 120, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, 150, 24);
  page.drawText(formData.i_nation || 'UZBEKISTAN', { x: 175, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 24, 85, 24, COLOR_HEADER_BG);
  page.drawText('성 별', { x: 350, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 24, tableW - 365, 24);
  page.drawText(formData.i_gender === 'M' ? '남성 (Male)' : '여성 (Female)', { x: 415, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  drawTableBox(page, 100, curY - 24, 70, 24, COLOR_HEADER_BG);
  page.drawText('근무기간', { x: 115, y: curY - 17, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 24, tableW - 130, 24);
  page.drawText(formData.i_work_period || '1년 이상 (2025.01.23 ~ 2026.08.23 재계약 체결)', { x: 175, y: curY - 17, size: 8.5, font, color: COLOR_TEXT });
  curY -= 24;

  // 2. 기업체 정보
  drawTableBox(page, 40, curY - 100, 60, 100, COLOR_HEADER_BG);
  page.drawText('고용기업\n현 황', { x: 55, y: curY - 55, size: 9, font, color: COLOR_TEXT });

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('상 호', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(formData.i_cname || '(주)가영테크', { x: 175, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 325, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 415, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('대 표 자', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(formData.i_rep_name || '김가영', { x: 175, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('전체 내국인근로자', { x: 328, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(`${formData.i_total_workers || '138'}명 (쿼터 내)`, { x: 415, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('E-7-4 고용인원', { x: 108, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, 150, 25);
  page.drawText(`${formData.i_e74_workers || '13'}명 (기준 적합)`, { x: 175, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 320, curY - 25, 85, 25, COLOR_HEADER_BG);
  page.drawText('전화번호', { x: 345, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 405, curY - 25, tableW - 365, 25);
  page.drawText(formData.i_cphone || '061-462-3588', { x: 415, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 25;

  drawTableBox(page, 100, curY - 25, 70, 25, COLOR_HEADER_BG);
  page.drawText('소 재 지', { x: 118, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 170, curY - 25, tableW - 130, 25);
  page.drawText(formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93 (HD현대삼호 내)', { x: 175, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 25;

  // Recommendation Box
  drawTableBox(page, 40, curY - 80, 60, 80, COLOR_HEADER_BG);
  page.drawText('추천 사유\n및 의견', { x: 60, y: curY - 45, size: 9, font, color: COLOR_TEXT });
  drawTableBox(page, 100, curY - 80, tableW - 60, 80);
  page.drawText('상기 외국인은 당사 조선소 선체 도장 및 블록 방청 직종의 필수 인력으로서 뛰어난 기술력과\n성실함을 인정받아 향후 지속적인 장기 고용이 필수적입니다. 또한 한국어 능력을 성실히 함양하여\n작업장 내 안전수칙 준수 및 동료들과의 원활한 소통이 가능하므로 숙련기능인력(E-7-4)으로 적극 추천합니다.', { x: 110, y: curY - 22, size: 7.5, font, color: COLOR_TEXT });
  curY -= 80;

  // Attachment
  drawTableBox(page, 40, curY - 24, tableW, 24);
  page.drawText('첨부서류: 1. 표준근로계약서 사본    2. 4대보험 사업장 가입자 명부    3. 사업자등록증 사본 (각 1부)', { x: 50, y: curY - 16, size: 8, font, color: COLOR_TEXT });
  curY -= 24;

  // Date and sign
  page.drawText(`${ty}년       ${tm}월       ${td}일`, { x: 380, y: curY - 50, size: 9, font, color: COLOR_TEXT });
  page.drawText(`추천기업:  ${formData.i_cname || '(주)가영테크'}     대표자:  ${formData.i_rep_name || '김가영'}   (직인)`, { x: 160, y: curY - 85, size: 9.5, font, color: COLOR_TEXT });
  drawStamp(page, font, 495, curY - 85, formData.i_rep_name || '김가영');
}

// 5. 표준근로계약서 (Labor Contract - 2 Pages)
export async function renderLaborContract(pdfDoc: PDFDocument, font: any, formData: FormData) {
  // Page 1
  const p1 = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const nextTy = String(parseInt(ty) + 2);
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  p1.drawText('표준근로계약서 / Labor Contract (Sample)', { x: 160, y: 800, size: 13, font, color: COLOR_TEXT });
  p1.drawText('사업주와 근로자는 아래의 근로조건을 성실히 이행할 것을 합의하며 근로계약을 체결한다.', { x: 40, y: 775, size: 7.5, font, color: COLOR_MUTED });
  p1.drawText('(The following parties agree to fully comply with the terms of the contract stated hereinafter.)', { x: 40, y: 763, size: 7, font, color: COLOR_MUTED });

  let curY = 750;
  const tableW = 515;

  // Employer block
  drawTableBox(p1, 40, curY - 60, 60, 60, COLOR_HEADER_BG);
  p1.drawText('사업주\nEmployer', { x: 48, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('사업체명', { x: 115, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 20, 160, 20);
  p1.drawText(formData.i_cname || '(주)가영테크', { x: 165, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('전화번호', { x: 332, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 20, tableW - 340, 20);
  p1.drawText(formData.i_cphone || '061-462-3588', { x: 385, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 40, 60, 20, COLOR_HEADER_BG);
  p1.drawText('소재지', { x: 115, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 40, tableW - 120, 20);
  p1.drawText(formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93', { x: 165, y: curY - 35, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 60, 60, 20, COLOR_HEADER_BG);
  p1.drawText('대표자', { x: 120, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 60, 160, 20);
  p1.drawText(formData.i_rep_name || '김가영', { x: 165, y: curY - 55, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 60, 60, 20, COLOR_HEADER_BG);
  p1.drawText('사업자번호', { x: 326, y: curY - 55, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 60, tableW - 340, 20);
  p1.drawText(formData.i_cregno || '847-81-03268', { x: 385, y: curY - 55, size: 8, font, color: COLOR_TEXT });
  curY -= 60;

  // Employee block
  drawTableBox(p1, 40, curY - 40, 60, 40, COLOR_HEADER_BG);
  p1.drawText('근로자\nEmployee', { x: 48, y: curY - 25, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('성  명', { x: 120, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 20, 160, 20);
  p1.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 165, y: curY - 15, size: 7.5, font, color: COLOR_TEXT });

  drawTableBox(p1, 320, curY - 20, 60, 20, COLOR_HEADER_BG);
  p1.drawText('생년월일', { x: 332, y: curY - 15, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 380, curY - 20, tableW - 340, 20);
  p1.drawText(formData.i_dob || '1988-05-19', { x: 385, y: curY - 15, size: 8, font, color: COLOR_TEXT });

  drawTableBox(p1, 100, curY - 40, 60, 20, COLOR_HEADER_BG);
  p1.drawText('본국주소', { x: 110, y: curY - 35, size: 8, font, color: COLOR_TEXT });
  drawTableBox(p1, 160, curY - 40, tableW - 120, 20);
  p1.drawText(formData.i_address_home || 'SIR DARYO VILOYATI, UZBEKISTAN', { x: 165, y: curY - 35, size: 7.5, font, color: COLOR_TEXT });
  curY -= 40;

  // Contract Terms
  const terms = [
    { no: '1. 근로계약기간\nTerm of Contract', text: `${ty}년 ${tm}월 ${td}일   ~   ${nextTy}년 ${tm}월 ${td}일  (24개월 체결 - E-7-4 요건 충족)` },
    { no: '2. 근무장소\nPlace of Work', text: `${formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93 (HD현대삼호 사내공장)'}` },
    { no: '3. 업무내용\nDescription', text: `담당직무 : ${formData.i_job || '선체도장공'} (KSCO: ${formData.i_job_code || '7832'})\n선박 블록 표면 전처리, 선체 방청도장 및 쇼트블라스트 작업` },
    { no: '4. 근로시간\nWorking Hours', text: '08:00 ~ 17:00 (1일 8시간, 주 40시간 근무)\n- 당사자 합의 시 주 12시간 한도 내 연장근로 가능' },
    { no: '5. 휴게시간\nRecess Hours', text: '1일 총 1시간 20분 (80 minutes per day, 식사시간 포함)' },
    { no: '6. 휴일\nHolidays', text: '[ V ] 주휴일 (매주 일요일)    [ V ] 근로자의 날    [ V ] 취업규칙 소정공휴일' }
  ];

  terms.forEach(t => {
    drawTableBox(p1, 40, curY - 45, 110, 45, COLOR_HEADER_BG);
    p1.drawText(t.no, { x: 45, y: curY - 22, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(p1, 150, curY - 45, tableW - 110, 45);
    p1.drawText(t.text, { x: 160, y: curY - 20, size: 7.5, font, color: COLOR_TEXT });
    curY -= 45;
  });

  // Page 2
  const p2 = pdfDoc.addPage([595, 842]);
  p2.drawText('표준근로계약서 / Labor Contract (이어서/Page 2)', { x: 170, y: 800, size: 12, font, color: COLOR_TEXT });

  let curY2 = 770;
  const rawNum = parseInt((formData.i_income || '3240').replace(/[^0-9]/g, ''), 10) || 3240;
  const mVal = Math.round((rawNum * 10000) / 12).toLocaleString();

  const p2Terms = [
    { no: '7. 임금사항\nPayment', text: `1) 기본급 (월급액) : ${mVal} 원  (연간 환산: ${(rawNum * 10000).toLocaleString()} 원)\n   * 법무부 E-7-4 비자 신청요건인 연봉 2,600만원 (월 217만원) 이상 충족\n2) 상여금 : 연 100% 지급 (설/추석 각 50% 분할)` },
    { no: '8. 임금지급일\nPayment Date', text: '매월 15일 (지급일이 공휴일인 경우 그 전일 지급)' },
    { no: '9. 지급방법\nMethods', text: '[ V ] 근로자 본인 명의 계좌 입금 (Direct Deposit)' },
    { no: '10. 숙식제공\nAccomm & Meals', text: '1) 숙소제공 : [ V ] 사내외 기숙사 제공 (월 관리비 100,000원 부담)\n2) 식사제공 : [ V ] 조식/중식/석식 제공 (근무일 무료)' },
    { no: '11. 기타사항\nCompliance', text: '본 계약에 정함이 없는 사항은 근로기준법 및 당사 취업규칙에 의함.' }
  ];

  p2Terms.forEach(t => {
    drawTableBox(p2, 40, curY2 - 50, 110, 50, COLOR_HEADER_BG);
    p2.drawText(t.no, { x: 45, y: curY2 - 25, size: 7.5, font, color: COLOR_TEXT });
    drawTableBox(p2, 150, curY2 - 50, tableW - 110, 50);
    p2.drawText(t.text, { x: 160, y: curY2 - 22, size: 7.5, font, color: COLOR_TEXT });
    curY2 -= 50;
  });

  // Signatures
  p2.drawText(`${ty}년       ${tm}월       ${td}일`, { x: 380, y: curY2 - 40, size: 9, font, color: COLOR_TEXT });
  p2.drawText(`사업주 (Employer):  ${formData.i_cname || '(주)가영테크'}     대표자:  ${formData.i_rep_name || '김가영'}  (직인)`, { x: 60, y: curY2 - 80, size: 8.5, font, color: COLOR_TEXT });
  drawStamp(p2, font, 480, curY2 - 80, formData.i_rep_name || '김가영');

  p2.drawText(`근로자 (Employee):  ${fullName}  (서명)`, { x: 60, y: curY2 - 120, size: 8.5, font, color: COLOR_TEXT });
}

// 6. 재직증명서
export async function renderEmploymentCert(pdfDoc: PDFDocument, font: any, formData: FormData) {
  const page = pdfDoc.addPage([595, 842]);
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const fullName = `${formData.i_surname} ${formData.i_givenname}`.toUpperCase().trim();

  // Document No
  page.drawText(`문서번호: GY-${ty}-61호`, { x: 40, y: 800, size: 9, font, color: COLOR_MUTED });

  // Title
  page.drawText('재  직  증  명  서', { x: 175, y: 750, size: 17, font, color: COLOR_TEXT });

  let curY = 705;
  const tableW = 515;

  // 1. 인적사항
  page.drawText('1. 인적사항', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('성  명', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(fullName || 'MUKHTOROV NAJIBULLO', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('국  적', { x: 310, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText(formData.i_nation || '우즈베키스탄', { x: 430, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('생년월일', { x: 55, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_dob || '1988년 05월 19일', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('외국인등록번호', { x: 290, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText(formData.i_arc || '880519-5600011', { x: 380, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('체류지주소', { x: 65, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText(formData.i_address_kr || '전라남도 영암군 삼호읍 대불로 120-28, 302호(용앙리)', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 36;

  // 2. 재직사항
  page.drawText('2. 재직사항', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('회사명', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_cname || '가영테크(주)', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('사업자등록번호', { x: 290, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText(formData.i_cregno || '847-81-03268', { x: 380, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('대표자', { x: 60, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_rep_name || '김가영', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('직  위', { x: 310, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText('사 원', { x: 375, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('소재지', { x: 45, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText(formData.i_caddr || '전라남도 영암군 삼호읍 대불로 93, HD현대삼호 사내공장', { x: 120, y: curY - 18, size: 8, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('재직기간', { x: 58, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText('2025년 01월 23일  ~  현재 재직 중', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 36;

  // 3. 용도
  page.drawText('3. 발급용도', { x: 40, y: curY, size: 10, font, color: COLOR_TEXT });
  curY -= 10;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('담당업무', { x: 58, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, 170, 26);
  page.drawText(formData.i_job || '선체도장공', { x: 170, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });

  drawTableBox(page, 285, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('발급용도', { x: 305, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  drawTableBox(page, 360, curY - 26, tableW - 320, 26);
  page.drawText('출입국 체류자격 신청용', { x: 400, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 26;

  drawTableBox(page, 40, curY - 26, 75, 26, COLOR_HEADER_BG);
  page.drawText('제출처', { x: 45, y: curY - 18, size: 7.5, font, color: COLOR_TEXT });
  drawTableBox(page, 115, curY - 26, tableW - 75, 26);
  page.drawText('광주출입국·외국인사무소 목포출장소 (법무부)', { x: 120, y: curY - 18, size: 8.5, font, color: COLOR_TEXT });
  curY -= 50;

  // Closing
  page.drawText('상기와 같이 당사에 성실히 재직하고 있음을 증명합니다.', { x: 190, y: curY - 20, size: 11, font, color: COLOR_TEXT });
  page.drawText(`${ty}년       ${tm}월       ${td}일`, { x: 235, y: curY - 60, size: 10, font, color: COLOR_TEXT });
  page.drawText(`${formData.i_cname || '가영테크(주)'}        대표이사 ${formData.i_rep_name || '김가영'}`, { x: 170, y: curY - 100, size: 12, font, color: COLOR_TEXT });

  drawStamp(page, font, 430, curY - 100, formData.i_rep_name || '김가영');
}

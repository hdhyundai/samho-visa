import { FormData, WorkplaceProfile, JobCodeItem } from '../types';

export const DEFAULT_WORKPLACES: WorkplaceProfile[] = [
  {
    id: "hdsamho",
    name: "HD현대삼호 주식회사",
    regNo: "411-81-19799",
    repName: "신현대",
    repIdMasked: "650101-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93",
    phone: "061-460-2114",
    isDefault: true
  },
  {
    id: "gayoung_tech",
    name: "가영테크(주)",
    regNo: "847-81-03268",
    repName: "김가영",
    repIdMasked: "710403-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 (HD현대삼호 사내)",
    phone: "061-462-3588",
    isDefault: false
  },
  {
    id: "hd_career_sol",
    name: "HD커리어솔루션",
    regNo: "411-86-99881",
    repName: "이정호",
    repIdMasked: "690319-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 (사내협력관)",
    phone: "010-9709-2514",
    isDefault: false
  },
  {
    id: "sub_welding_1",
    name: "(주)삼호용접기술",
    regNo: "411-86-12345",
    repName: "박철수",
    repIdMasked: "700315-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 사내 3공장",
    phone: "061-460-5511",
    isDefault: false
  },
  {
    id: "sub_coating_2",
    name: "(주)대불선박도장",
    regNo: "411-87-67890",
    repName: "최영희",
    repIdMasked: "681120-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 도장공장",
    phone: "061-460-7722",
    isDefault: false
  },
  {
    id: "sub_pipe_3",
    name: "(주)서남해양배관",
    regNo: "411-88-24680",
    repName: "정민우",
    repIdMasked: "750805-1******",
    repGender: "M",
    address: "전라남도 영암군 삼호읍 대불로 93 의장공장",
    phone: "061-460-8833",
    isDefault: false
  }
];

export const SHIPYARD_JOB_CODES: JobCodeItem[] = [
  { code: "7431", titleKr: "선박용접공 (조선선박/플랜트용접)", titleEn: "Welder (Shipbuilding/Plant)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7832", titleKr: "선체도장공 (블록/선체도장)", titleEn: "Painter (Hull/Block Coating)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7422", titleKr: "선박배관공 (선박/해양배관설치)", titleEn: "Pipefitter (Marine Piping)", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7411", titleKr: "선체조립공 (구조물/선곽조립)", titleEn: "Ship Hull Fitter / Structure Assembler", category: "E-7-3 / E-7-4R / E-9" },
  { code: "7621", titleKr: "선박전기원 (해양/선박전기설비)", titleEn: "Electrician (Marine Electrical)", category: "E-7-3 / E-9" },
  { code: "8520", titleKr: "선박기관정비원 (기관보조)", titleEn: "Marine Mechanic / Assistant", category: "E-9" },
  { code: "9999", titleKr: "기타 제조업 단순노무원", titleEn: "General Manufacturing Worker", category: "E-9" }
];

export const initialFormData: FormData = {
  visaType: "E-7-4R",
  reqType: "chk_extension", // Default to the most common application (체류기간 연장허가)
  val_change_status: "E-7-4R (광역추천 숙련기능인력)",
  submitter: "self",
  i_surname: "",
  i_givenname: "",
  i_dob: "",
  i_gender: "M",
  i_nation: "",
  i_arc: "",
  i_passport: "",
  i_pass_issue: "",
  i_pass_exp: "",
  i_spouse: "",
  i_spouse_dob: "",
  i_parents: "",
  i_child1_name: "",
  i_child1_dob: "",
  i_child2_name: "",
  i_child2_dob: "",
  i_education: "고졸",
  i_marriage: "유",
  i_marriage_date: "",
  i_total_workers: "138",
  i_e74_workers: "13",
  i_work_period: "1년 이상 근무",
  i_address_kr: "",
  i_cellphone: "",
  i_phone: "",
  i_address_home: "",
  i_home_phone: "",
  i_email: "",
  i_cname: "가영테크(주)",
  i_cregno: "847-81-03268",
  i_rep_name: "김가영",
  i_rep_id: "710403-1******",
  i_rep_gender: "M",
  i_caddr: "전남 영암군 삼호읍 대불로 93 (HD현대삼호 내)",
  i_cphone: "061-462-3588",
  i_new_cname: "",
  i_new_cregno: "",
  i_new_cphone: "",
  r_own: "own_rent",
  r_type: "type_dorm",
  i_dorm_start: "",
  i_job: "선체도장공",
  i_job_code: "7832",
  i_income: "3,240",
  i_reentry_period: "1년",
  i_refund_bank: "",
  i_refund_acc: "",
  i_guar_start: "",
  i_guar_end: ""
};

export const PDF_COORDS_MAIN = {
  chk_alien_reg: { type: 'check', x: 69, y: 696 }, 
  chk_reissue: { type: 'check', x: 67, y: 663 }, 
  chk_extension: { type: 'check', x: 68, y: 639 }, 
  chk_change_status: { type: 'check', x: 68, y: 616 },
  val_change_status: { type: 'text', x: 187, y: 611, w: 23, h: 9 }, 
  chk_grant_status: { type: 'check', x: 68, y: 580 }, 
  chk_extra_act: { type: 'check', x: 226, y: 697 }, 
  chk_change_work: { type: 'check', x: 228, y: 663 },
  chk_reentry: { type: 'check', x: 226, y: 639 }, 
  chk_change_residence: { type: 'check', x: 226, y: 616 },
  surname: { type: 'text', x: 128, y: 524, w: 137, h: 11 }, 
  givenname: { type: 'text', x: 269, y: 524, w: 159, h: 11 },
  dob_yyyy: { type: 'text', x: 147, y: 496, w: 80, h: 13 }, 
  dob_mm: { type: 'text', x: 228, y: 498, w: 38, h: 11 }, 
  dob_dd: { type: 'text', x: 268, y: 498, w: 39, h: 11 }, 
  gender_m: { type: 'check', x: 370, y: 516 }, 
  gender_f: { type: 'check', x: 369, y: 505 }, 
  nation: { type: 'text', x: 482, y: 476, w: 56, h: 46 },
  arc_1: { type: 'text', x: 187, y: 476, w: 19, h: 20 }, 
  arc_2: { type: 'text', x: 207, y: 476, w: 20, h: 20 }, 
  arc_3: { type: 'text', x: 228, y: 476, w: 19, h: 20 }, 
  arc_4: { type: 'text', x: 249, y: 476, w: 17, h: 20 }, 
  arc_5: { type: 'text', x: 269, y: 476, w: 19, h: 20 }, 
  arc_6: { type: 'text', x: 289, y: 476, w: 18, h: 20 }, 
  arc_7: { type: 'text', x: 308, y: 476, w: 17, h: 20 }, 
  arc_8: { type: 'text', x: 325, y: 476, w: 19, h: 20 }, 
  arc_9: { type: 'text', x: 343, y: 476, w: 16, h: 20 }, 
  arc_10: { type: 'text', x: 362, y: 476, w: 16, h: 20 }, 
  arc_11: { type: 'text', x: 378, y: 476, w: 17, h: 20 }, 
  arc_12: { type: 'text', x: 397, y: 476, w: 16, h: 20 }, 
  arc_13: { type: 'text', x: 414, y: 476, w: 16, h: 20 },
  passport: { type: 'text', x: 127, y: 454, w: 101, h: 21 }, 
  pass_issue: { type: 'text', x: 308, y: 454, w: 87, h: 21 }, 
  pass_exp: { type: 'text', x: 480, y: 455, w: 59, h: 21 },
  address_kr: { type: 'text', x: 127, y: 434, w: 412, h: 20 }, 
  phone: { type: 'text', x: 184, y: 419, w: 113, h: 13 }, 
  cellphone: { type: 'text', x: 417, y: 420, w: 121, h: 13 },
  address_home: { type: 'text', x: 185, y: 399, w: 231, h: 21 }, 
  home_phone: { type: 'text', x: 483, y: 398, w: 55, h: 21 },
  cname: { type: 'text', x: 208, y: 335, w: 53, h: 20 }, 
  cregno: { type: 'text', x: 355, y: 335, w: 59, h: 20 }, 
  cphone: { type: 'text', x: 482, y: 334, w: 57, h: 21 },
  new_cname: { type: 'text', x: 207, y: 313, w: 53, h: 21 }, 
  new_cregno: { type: 'text', x: 356, y: 313, w: 59, h: 20 }, 
  new_cphone: { type: 'text', x: 482, y: 313, w: 56, h: 21 },
  job: { type: 'text', x: 483, y: 299, w: 55, h: 15 }, 
  income: { type: 'text', x: 207, y: 299, w: 47, h: 14 }, 
  reentry_period: { type: 'text', x: 208, y: 287, w: 53, h: 13 }, 
  email: { type: 'text', x: 355, y: 286, w: 163, h: 13 }, 
  refund_acc: { type: 'text', x: 356, y: 266, w: 183, h: 19 },
  app_date: { type: 'text', x: 208, y: 252, w: 87, h: 13 }, 
  sign_main: { type: 'text', x: 436, y: 252, w: 101, h: 13 }, 
  sign_sub_1: { type: 'text', x: 99, y: 130, w: 64, h: 22 }, 
  sign_sub_2: { type: 'text', x: 274, y: 130, w: 57, h: 19 }, 
  sign_sub_3: { type: 'text', x: 449, y: 130, w: 40, h: 18 }
};

export const PDF_COORDS_RESIDENCE = {
  f_nation: { type: 'text', x: 167, y: 683, w: 84, h: 45 }, 
  f_arc: { type: 'text', x: 388, y: 683, w: 142, h: 45 },
  f_name: { type: 'text', x: 168, y: 656, w: 194, h: 25 }, 
  f_phone: { type: 'text', x: 429, y: 654, w: 103, h: 26 }, 
  f_addr: { type: 'text', x: 168, y: 629, w: 362, h: 25 },
  p_nation: { type: 'text', x: 167, y: 554, w: 73, h: 38 }, 
  p_id: { type: 'text', x: 378, y: 554, w: 153, h: 39 }, 
  p_name: { type: 'text', x: 168, y: 525, w: 207, h: 25 }, 
  p_phone: { type: 'text', x: 429, y: 525, w: 99, h: 25 },
  rel_family: { type: 'check', x: 182, y: 503 }, 
  rel_employer: { type: 'check', x: 271, y: 502 }, 
  rel_other: { type: 'check', x: 366, y: 502 }, 
  rel_other_desc: { type: 'text', x: 428, y: 509, w: 96, h: 13 },
  own_self: { type: 'check', x: 181, y: 468 }, 
  own_rent: { type: 'check', x: 273, y: 470 }, 
  own_other: { type: 'check', x: 380, y: 469 }, 
  own_other_desc: { type: 'text', x: 440, y: 468, w: 83, h: 14 },
  type_private: { type: 'check', x: 181, y: 441 }, 
  type_dorm: { type: 'check', x: 325, y: 441 }, 
  type_hotel: { type: 'check', x: 182, y: 413 }, 
  type_other: { type: 'check', x: 326, y: 412 }, 
  type_other_desc: { type: 'text', x: 388, y: 406, w: 131, h: 17 },
  start_y: { type: 'text', x: 169, y: 374, w: 45, h: 19 }, 
  start_m: { type: 'text', x: 254, y: 374, w: 37, h: 18 }, 
  start_d: { type: 'text', x: 342, y: 373, w: 36, h: 21 },
  sign_y: { type: 'text', x: 150, y: 313, w: 61, h: 17 }, 
  sign_m: { type: 'text', x: 250, y: 314, w: 23, h: 16 }, 
  sign_d: { type: 'text', x: 316, y: 314, w: 21, h: 14 },
  p_sign_name: { type: 'text', x: 261, y: 290, w: 69, h: 17 }, 
  p_company: { type: 'text', x: 263, y: 275, w: 68, h: 15 }
};

export const PDF_COORDS_GUARANTEE = {
  f_surname: { type: 'text', x: 131, y: 672, w: 127, h: 30 }, 
  f_givenname: { type: 'text', x: 274, y: 672, w: 134, h: 29 }, 
  f_hanja: { type: 'text', x: 434, y: 672, w: 97, h: 29 },
  f_dob: { type: 'text', x: 163, y: 640, w: 245, h: 29 }, 
  f_sex_m: { type: 'check', x: 465, y: 654 }, 
  f_sex_f: { type: 'check', x: 507, y: 654 },
  f_nation: { type: 'text', x: 149, y: 607, w: 258, h: 31 }, 
  f_pass: { type: 'text', x: 450, y: 607, w: 81, h: 31 },
  f_addr: { type: 'text', x: 181, y: 576, w: 226, h: 30 }, 
  f_phone: { type: 'text', x: 451, y: 577, w: 80, h: 28 }, 
  f_purpose: { type: 'text', x: 166, y: 546, w: 362, h: 27 },
  p_name: { type: 'text', x: 145, y: 474, w: 260, h: 27 }, 
  p_hanja: { type: 'text', x: 434, y: 473, w: 97, h: 28 }, 
  p_nation: { type: 'text', x: 147, y: 444, w: 258, h: 25 },
  p_sex_m: { type: 'check', x: 466, y: 457 }, 
  p_sex_f: { type: 'check', x: 508, y: 456 },
  p_dob: { type: 'text', x: 220, y: 413, w: 186, h: 29 }, 
  p_phone: { type: 'text', x: 450, y: 414, w: 79, h: 27 }, 
  p_addr: { type: 'text', x: 143, y: 381, w: 385, h: 30 },
  p_rel: { type: 'text', x: 199, y: 352, w: 330, h: 29 }, 
  p_company: { type: 'text', x: 153, y: 320, w: 253, h: 29 }, 
  p_job: { type: 'text', x: 436, y: 321, w: 93, h: 27 },
  p_caddr: { type: 'text', x: 178, y: 290, w: 228, h: 27 }, 
  p_note: { type: 'text', x: 437, y: 290, w: 93, h: 27 }, 
  p_period: { type: 'text', x: 338, y: 260, w: 189, h: 25 }, 
  sign_y: { type: 'text', x: 355, y: 96, w: 60, h: 13 }, 
  sign_m: { type: 'text', x: 429, y: 98, w: 34, h: 12 }, 
  sign_d: { type: 'text', x: 480, y: 97, w: 31, h: 13 }, 
  p_sign_name: { type: 'text', x: 356, y: 66, w: 124, h: 20 }
};

export interface PdfCoordBox {
  type: 'text' | 'check';
  x: number;
  y: number;
  w?: number;
  h?: number;
}

export const PDF_COORDS_INCOME: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 675, w: 160, h: 20 },
  f_arc: { type: 'text', x: 385, y: 675, w: 150, h: 20 },
  f_nation: { type: 'text', x: 150, y: 645, w: 160, h: 20 },
  f_visa: { type: 'text', x: 385, y: 645, w: 150, h: 20 },
  f_sojourn_status: { type: 'text', x: 385, y: 645, w: 150, h: 20 },
  f_phone: { type: 'text', x: 150, y: 615, w: 160, h: 20 },
  f_email: { type: 'text', x: 385, y: 615, w: 150, h: 20 },
  c_name: { type: 'text', x: 150, y: 550, w: 160, h: 20 },
  c_regno: { type: 'text', x: 385, y: 550, w: 150, h: 20 },
  c_job: { type: 'text', x: 150, y: 518, w: 160, h: 20 },
  job_title: { type: 'text', x: 150, y: 518, w: 160, h: 20 },
  c_job_code: { type: 'text', x: 385, y: 518, w: 150, h: 20 },
  job_code: { type: 'text', x: 385, y: 518, w: 150, h: 20 },
  c_income_won: { type: 'text', x: 200, y: 460, w: 120, h: 20 },
  annual_income: { type: 'text', x: 200, y: 460, w: 120, h: 20 },
  c_income_bracket: { type: 'check', x: 180, y: 420 },
  income_tax_proof: { type: 'check', x: 180, y: 420 },
  sign_y: { type: 'text', x: 200, y: 220, w: 50, h: 15 },
  sign_m: { type: 'text', x: 290, y: 220, w: 30, h: 15 },
  sign_d: { type: 'text', x: 360, y: 220, w: 30, h: 15 },
  f_sign: { type: 'text', x: 420, y: 180, w: 120, h: 20 },
  declarant_name: { type: 'text', x: 420, y: 180, w: 120, h: 20 }
};

export const FORM_FIELD_LABELS: Record<string, Record<string, string>> = {
  main: {
    chk_alien_reg: '외국인등록 [V]',
    chk_reissue: '등록증 재발급 [V]',
    chk_extension: '체류기간 연장허가 [V]',
    chk_change_status: '체류자격 변경허가 [V]',
    val_change_status: '체류자격 변경명칭',
    chk_grant_status: '체류자격 부여 [V]',
    chk_extra_act: '체류자격외 활동허가 [V]',
    chk_change_work: '근무처 변경·추가허가 [V]',
    chk_reentry: '재입국허가(단수/복수) [V]',
    chk_change_residence: '체류지 변경신고 [V]',
    surname: '외국인 성 (Surname)',
    givenname: '외국인 이름 (Given Name)',
    dob_yyyy: '생년 (YYYY)',
    dob_mm: '생월 (MM)',
    dob_dd: '생일 (DD)',
    gender_m: '성별 남 [V]',
    gender_f: '성별 여 [V]',
    nation: '국적 (Nationality)',
    arc_1: '외국인등록번호 1',
    arc_2: '외국인등록번호 2',
    arc_3: '외국인등록번호 3',
    arc_4: '외국인등록번호 4',
    arc_5: '외국인등록번호 5',
    arc_6: '외국인등록번호 6',
    arc_7: '외국인등록번호 7',
    arc_8: '외국인등록번호 8',
    arc_9: '외국인등록번호 9',
    arc_10: '외국인등록번호 10',
    arc_11: '외국인등록번호 11',
    arc_12: '외국인등록번호 12',
    arc_13: '외국인등록번호 13',
    passport: '여권번호 (Passport No.)',
    pass_issue: '여권 발급일 (Issue Date)',
    pass_exp: '여권 만료일 (Expiry Date)',
    address_kr: '대한민국 내 주소',
    phone: '전화번호',
    cellphone: '휴대전화번호',
    address_home: '본국 주소',
    home_phone: '본국 전화번호',
    cname: '현재 근무처 회사명',
    cregno: '현재 사업자등록번호',
    cphone: '현재 회사 전화번호',
    new_cname: '변경 예정 근무처',
    new_cregno: '변경 사업자등록번호',
    new_cphone: '변경 회사 전화번호',
    job: '직업/직종',
    income: '연간 소득금액',
    reentry_period: '재입국 신청기간',
    email: '이메일 (E-mail)',
    refund_acc: '환급계좌번호',
    app_date: '신청일자 (YYYY.MM.DD)',
    sign_main: '신청인 서명',
    sign_sub_1: '본인 제출 서명',
    sign_sub_2: '배우자 대리 서명',
    sign_sub_3: '부모 대리 서명'
  },
  residence: {
    f_nation: '외국인 국적',
    f_arc: '외국인등록번호',
    f_name: '외국인 성명',
    f_phone: '외국인 연락처',
    f_addr: '체류지 도로명주소',
    p_nation: '제공자 국적',
    p_id: '제공자 생년월일/등록번호',
    p_name: '제공자 성명/회사명',
    p_phone: '제공자 연락처',
    rel_family: '관계: 가족 [V]',
    rel_employer: '관계: 고용주 [V]',
    rel_other: '관계: 기타 [V]',
    rel_other_desc: '관계 기타 내용',
    own_self: '소유형태: 본인소유 [V]',
    own_rent: '소유형태: 임차 [V]',
    own_other: '소유형태: 기타 [V]',
    own_other_desc: '소유형태 기타 내용',
    type_private: '숙소: 단독/공동주택 [V]',
    type_dorm: '숙소: 기숙사 [V]',
    type_hotel: '숙소: 고시원/모텔 [V]',
    type_other: '숙소: 기타 [V]',
    type_other_desc: '숙소 기타 내용',
    start_y: '거주시작 연도',
    start_m: '거주시작 월',
    start_d: '거주시작 일',
    sign_y: '작성 연도',
    sign_m: '작성 월',
    sign_d: '작성 일',
    p_sign_name: '숙소제공자 서명',
    p_company: '회사/사업장명'
  },
  guarantee: {
    f_surname: '외국인 성',
    f_givenname: '외국인 이름',
    f_hanja: '외국인 한자성명',
    f_dob: '외국인 생년월일',
    f_sex_m: '외국인 성별 남 [V]',
    f_sex_f: '외국인 성별 여 [V]',
    f_nation: '외국인 국적',
    f_pass: '외국인 여권번호',
    f_addr: '외국인 국내주소',
    f_phone: '외국인 전화번호',
    f_purpose: '신원보증 사유',
    p_name: '신원보증인 성명',
    p_hanja: '보증인 한자성명',
    p_nation: '보증인 국적',
    p_sex_m: '보증인 성별 남 [V]',
    p_sex_f: '보증인 성별 여 [V]',
    p_dob: '보증인 생년월일',
    p_phone: '보증인 전화번호',
    p_addr: '보증인 주소',
    p_rel: '피보증인과의 관계',
    p_company: '보증인 직장명',
    p_job: '보증인 직위',
    p_caddr: '보증인 직장주소',
    p_note: '참고사항',
    p_period: '신원보증 기간',
    sign_y: '작성 연도',
    sign_m: '작성 월',
    sign_d: '작성 일',
    p_sign_name: '보증인 서명'
  },
  income: {
    f_name: '외국인 성명 (Full Name)',
    f_arc: '외국인등록번호 (Alien Reg No.)',
    f_nation: '국적 (Nationality)',
    f_visa: '체류자격 (Sojourn Status)',
    f_sojourn_status: '체류자격 (Sojourn Status)',
    f_phone: '연락처 (Telephone)',
    f_email: '이메일 (E-mail)',
    c_name: '근무처 상호 (Company Name)',
    c_regno: '사업자등록번호 (Business Reg No.)',
    c_job: '근무 직종 (Job Title)',
    job_title: '근무 직종 (Job Title)',
    c_job_code: '직업코드 (KSCO Code)',
    job_code: '직업코드 (KSCO Code)',
    c_income_won: '연간소득금액 (Annual Income)',
    annual_income: '연간소득금액 (Annual Income)',
    c_income_bracket: '소득구간 선택 [V]',
    income_tax_proof: '소득금액증명 제출 [V]',
    sign_y: '작성 연도',
    sign_m: '작성 월',
    sign_d: '작성 일',
    f_sign: '신고인 서명',
    declarant_name: '신고인 성명'
  }
};

export interface CustomDocItem {
  id: string;
  title: string;
  desc: string;
  createdAt: string;
  isPreset?: boolean;
}

export interface AvailableFieldOption {
  key: string;
  label: string;
  category: '인적사항 (외국인)' | '사업장 (근무처)' | '직무 및 소득' | '날짜 및 서명' | '기타 및 체크';
  type: 'text' | 'check';
  defaultW: number;
  defaultH: number;
  sampleValue?: string;
}

export const AVAILABLE_MAPPING_FIELDS: AvailableFieldOption[] = [
  // 1. 외국인 인적사항
  { key: 'f_name', label: '외국인 성명 (Full Name, 대문자)', category: '인적사항 (외국인)', type: 'text', defaultW: 160, defaultH: 20, sampleValue: 'BUI QUOC TINH' },
  { key: 'f_surname', label: '외국인 성 (Surname)', category: '인적사항 (외국인)', type: 'text', defaultW: 80, defaultH: 20, sampleValue: 'BUI' },
  { key: 'f_givenname', label: '외국인 이름 (Given name)', category: '인적사항 (외국인)', type: 'text', defaultW: 100, defaultH: 20, sampleValue: 'QUOC TINH' },
  { key: 'f_arc', label: '외국인등록번호 전체 (000000-0000000)', category: '인적사항 (외국인)', type: 'text', defaultW: 140, defaultH: 20, sampleValue: '800812-5000000' },
  { key: 'f_arc_front', label: '외국인등록번호 앞자리(생년월일)', category: '인적사항 (외국인)', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '800812' },
  { key: 'f_arc_back', label: '외국인등록번호 뒷자리', category: '인적사항 (외국인)', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '5000000' },
  { key: 'f_dob', label: '생년월일 (YYYY-MM-DD)', category: '인적사항 (외국인)', type: 'text', defaultW: 100, defaultH: 20, sampleValue: '1980-08-12' },
  { key: 'f_dob_yyyy', label: '생년 (YYYY)', category: '인적사항 (외국인)', type: 'text', defaultW: 40, defaultH: 20, sampleValue: '1980' },
  { key: 'f_dob_mm', label: '생월 (MM)', category: '인적사항 (외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '08' },
  { key: 'f_dob_dd', label: '생일 (DD)', category: '인적사항 (외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '12' },
  { key: 'f_gender', label: '성별 (M / F)', category: '인적사항 (외국인)', type: 'text', defaultW: 30, defaultH: 20, sampleValue: 'M' },
  { key: 'f_nation', label: '국적 (Nationality)', category: '인적사항 (외국인)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: 'VIETNAM' },
  { key: 'f_visa', label: '체류자격 (E-9, E-7 등)', category: '인적사항 (외국인)', type: 'text', defaultW: 60, defaultH: 20, sampleValue: 'E-9' },
  { key: 'f_passport', label: '여권번호 (Passport No.)', category: '인적사항 (외국인)', type: 'text', defaultW: 110, defaultH: 20, sampleValue: 'E03861791' },
  { key: 'f_pass_issue', label: '여권 발급일 (Issue Date)', category: '인적사항 (외국인)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '2020-01-01' },
  { key: 'f_pass_exp', label: '여권 만료일 (Expiry Date)', category: '인적사항 (외국인)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '2030-01-01' },
  { key: 'f_phone', label: '외국인 휴대전화번호', category: '인적사항 (외국인)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '010-1234-5678' },
  { key: 'f_email', label: '외국인 이메일 (E-mail)', category: '인적사항 (외국인)', type: 'text', defaultW: 160, defaultH: 20, sampleValue: 'worker@email.com' },
  { key: 'f_addr', label: '국내 도로명 체류지 주소', category: '인적사항 (외국인)', type: 'text', defaultW: 280, defaultH: 24, sampleValue: '전남 영암군 삼호읍 대불로 10' },
  { key: 'f_addr_home', label: '본국 거주지 주소', category: '인적사항 (외국인)', type: 'text', defaultW: 240, defaultH: 24, sampleValue: 'SON HA, THAI THUY, VIETNAM' },
  // 2. 사업장 정보
  { key: 'c_name', label: '사업장 상호 (회사명)', category: '사업장 (근무처)', type: 'text', defaultW: 180, defaultH: 20, sampleValue: '가영테크(주)' },
  { key: 'c_regno', label: '사업자등록번호 (10자리)', category: '사업장 (근무처)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '411-81-19799' },
  { key: 'c_rep', label: '대표자 성명', category: '사업장 (근무처)', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '김가영' },
  { key: 'c_rep_id', label: '대표자 생년월일/주민번호앞자리', category: '사업장 (근무처)', type: 'text', defaultW: 130, defaultH: 20, sampleValue: '650101-1******' },
  { key: 'c_addr', label: '사업장 소재지 도로명주소', category: '사업장 (근무처)', type: 'text', defaultW: 280, defaultH: 24, sampleValue: '전남 영암군 삼호읍 대불로 93' },
  { key: 'c_phone', label: '사업장 대표 전화번호', category: '사업장 (근무처)', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '061-460-2114' },
  // 3. 직무 및 소득
  { key: 'job_title', label: '근무 직종명', category: '직무 및 소득', type: 'text', defaultW: 120, defaultH: 20, sampleValue: '선체도장공' },
  { key: 'job_code', label: '직업코드 (KSCO)', category: '직무 및 소득', type: 'text', defaultW: 70, defaultH: 20, sampleValue: '7431' },
  { key: 'annual_income', label: '연간 추정소득 (원화)', category: '직무 및 소득', type: 'text', defaultW: 110, defaultH: 20, sampleValue: '36,000,000원' },
  { key: 'monthly_income', label: '월 추정급여 (원화)', category: '직무 및 소득', type: 'text', defaultW: 110, defaultH: 20, sampleValue: '3,000,000원' },
  // 4. 날짜 및 서명
  { key: 'today_date', label: '오늘 일자 (YYYY.MM.DD)', category: '날짜 및 서명', type: 'text', defaultW: 100, defaultH: 20, sampleValue: '2026.09.25' },
  { key: 'sign_y', label: '작성 연도 (YYYY)', category: '날짜 및 서명', type: 'text', defaultW: 45, defaultH: 20, sampleValue: '2026' },
  { key: 'sign_m', label: '작성 월 (MM)', category: '날짜 및 서명', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '09' },
  { key: 'sign_d', label: '작성 일 (DD)', category: '날짜 및 서명', type: 'text', defaultW: 30, defaultH: 20, sampleValue: '25' },
  { key: 'sign_f', label: '외국인 근로자 자필서명란', category: '날짜 및 서명', type: 'text', defaultW: 130, defaultH: 20, sampleValue: 'BUI QUOC TINH' },
  { key: 'sign_rep', label: '대표자 서명/직인란', category: '날짜 및 서명', type: 'text', defaultW: 90, defaultH: 20, sampleValue: '김가영 (인)' },
  // 5. 기타 및 체크
  { key: 'check_box', label: '체크박스 (V 마크)', category: '기타 및 체크', type: 'check', defaultW: 14, defaultH: 14, sampleValue: 'V' },
  { key: 'custom_text', label: '직접 입력 문구 (자유 텍스트)', category: '기타 및 체크', type: 'text', defaultW: 150, defaultH: 20, sampleValue: '특약사항' }
];

export const BUILTIN_PRESET_DOCS: CustomDocItem[] = [
  {
    id: 'e74r_recommend',
    title: '광역지자체 추천 신청서 (E-7-4R <별지 1호>)',
    desc: '2026년도 광역형 비자 지자체 추천서 표준 서식',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_score_sheet',
    title: '점수제 평가표 (E-7-4R <별지 2-1호>)',
    desc: '소득·자격·한국어능력 총점 280점 배점 자가측정표',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_personal_stmt',
    title: '외국인 본인 인적사항 확인서 (E-7-4R <별지 3-1호>)',
    desc: '가족관계 및 거주확인서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'e74r_company_recommend',
    title: '고용기업 추천서 (E-7-4R [기업 직인])',
    desc: '기업 대표 명의 추천서 및 재직확인',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'contract_std',
    title: '표준근로계약서 (Standard Labor Contract)',
    desc: 'E-7-4/E-7-3 조선소 고용노동부 표준 2600만 이상 계약서',
    createdAt: '2026-09-25',
    isPreset: true
  },
  {
    id: 'employment_cert',
    title: '재직증명서 (조선소 사내협력사 발급)',
    desc: '출입국 제출용 회사 직인 재직증명서',
    createdAt: '2026-10-01',
    isPreset: true
  },
  {
    id: 'reason_stmt',
    title: '체류사유서 (Reason Statement)',
    desc: '체류자격 변경 및 연장 사유서',
    createdAt: '2026-09-25',
    isPreset: true
  },
  {
    id: 'power_of_attorney',
    title: '위임장 (Power of Attorney)',
    desc: '출입국 행정업무 대리 위임장 서식',
    createdAt: '2026-09-25',
    isPreset: true
  }
];

export const PRESET_COORDS_CONTRACT: Record<string, PdfCoordBox> = {
  c_name: { type: 'text', x: 130, y: 720, w: 180, h: 18 },
  c_phone: { type: 'text', x: 380, y: 720, w: 140, h: 18 },
  c_addr: { type: 'text', x: 130, y: 695, w: 390, h: 18 },
  c_rep: { type: 'text', x: 130, y: 670, w: 140, h: 18 },
  f_name: { type: 'text', x: 130, y: 635, w: 180, h: 18 },
  f_dob: { type: 'text', x: 380, y: 635, w: 140, h: 18 },
  f_addr: { type: 'text', x: 130, y: 610, w: 390, h: 18 },
  job_title: { type: 'text', x: 150, y: 550, w: 160, h: 18 },
  monthly_income: { type: 'text', x: 180, y: 440, w: 140, h: 18 },
  today_date: { type: 'text', x: 230, y: 150, w: 140, h: 18 },
  sign_rep: { type: 'text', x: 420, y: 110, w: 90, h: 18 },
  sign_f: { type: 'text', x: 420, y: 75, w: 100, h: 18 }
};

export const PRESET_COORDS_REASON: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 710, w: 160, h: 18 },
  f_arc: { type: 'text', x: 380, y: 710, w: 140, h: 18 },
  f_nation: { type: 'text', x: 150, y: 680, w: 160, h: 18 },
  f_visa: { type: 'text', x: 380, y: 680, w: 140, h: 18 },
  c_name: { type: 'text', x: 150, y: 650, w: 180, h: 18 },
  c_rep: { type: 'text', x: 380, y: 650, w: 140, h: 18 },
  job_title: { type: 'text', x: 150, y: 620, w: 160, h: 18 },
  custom_text: { type: 'text', x: 100, y: 460, w: 400, h: 110 },
  today_date: { type: 'text', x: 230, y: 220, w: 140, h: 18 },
  sign_f: { type: 'text', x: 390, y: 180, w: 120, h: 18 },
  sign_rep: { type: 'text', x: 390, y: 145, w: 120, h: 18 }
};

export const PRESET_COORDS_ATTORNEY: Record<string, PdfCoordBox> = {
  f_name: { type: 'text', x: 150, y: 700, w: 160, h: 18 },
  f_arc: { type: 'text', x: 380, y: 700, w: 140, h: 18 },
  f_addr: { type: 'text', x: 150, y: 670, w: 370, h: 18 },
  f_phone: { type: 'text', x: 150, y: 640, w: 160, h: 18 },
  c_rep: { type: 'text', x: 150, y: 560, w: 160, h: 18 },
  c_phone: { type: 'text', x: 380, y: 560, w: 140, h: 18 },
  today_date: { type: 'text', x: 230, y: 260, w: 140, h: 18 },
  sign_f: { type: 'text', x: 390, y: 200, w: 120, h: 18 }
};

export function resolveFieldValueForCoord(
  key: string,
  formData: FormData,
  customTextMap?: Record<string, string>
): { display: string; isChecked: boolean } {
  const upperSurname = (formData.i_surname || '').toUpperCase().trim();
  const upperGivenname = (formData.i_givenname || '').toUpperCase().trim();
  const fullName = `${upperSurname} ${upperGivenname}`.trim();
  const today = new Date();
  const ty = String(today.getFullYear());
  const tm = String(today.getMonth() + 1).padStart(2, '0');
  const td = String(today.getDate()).padStart(2, '0');
  const cleanArc = (formData.i_arc || '').replace(/-/g, '');

  if (key === 'check_box' || key.startsWith('chk_')) {
    return { display: 'V', isChecked: true };
  }

  if (customTextMap && customTextMap[key] !== undefined && customTextMap[key] !== '') {
    return { display: customTextMap[key], isChecked: false };
  }

  if (key === 'custom_text' || key.startsWith('custom_text_') || key.startsWith('custom_')) {
    const customVal = customTextMap?.[key] || '';
    return { display: customVal, isChecked: false };
  }

  switch (key) {
    // Applicant
    case 'f_name':
    case 'fullName':
    case 'name': return { display: fullName || 'BUI QUOC TINH', isChecked: false };
    case 'f_surname':
    case 'surname': return { display: upperSurname || 'BUI', isChecked: false };
    case 'f_givenname':
    case 'givenname': return { display: upperGivenname || 'QUOC TINH', isChecked: false };
    case 'f_arc':
    case 'arc': return { display: formData.i_arc || '800812-5000000', isChecked: false };
    case 'f_arc_front': return { display: cleanArc.slice(0, 6) || '800812', isChecked: false };
    case 'f_arc_back': return { display: cleanArc.slice(6, 13) || '5000000', isChecked: false };
    case 'f_dob':
    case 'dob': return { display: formData.i_dob || '1980-08-12', isChecked: false };
    case 'f_dob_yyyy': return { display: (formData.i_dob || '').split('-')[0] || '1980', isChecked: false };
    case 'f_dob_mm': return { display: (formData.i_dob || '').split('-')[1] || '08', isChecked: false };
    case 'f_dob_dd': return { display: (formData.i_dob || '').split('-')[2] || '12', isChecked: false };
    case 'f_gender': return { display: formData.i_gender || 'M', isChecked: false };
    case 'f_nation':
    case 'nation': return { display: (formData.i_nation || 'VIETNAM').toUpperCase(), isChecked: false };
    case 'f_visa':
    case 'visa':
    case 'f_sojourn_status': return { display: formData.visaType || 'E-9', isChecked: false };
    case 'f_passport':
    case 'passport': return { display: (formData.i_passport || 'E03861791').toUpperCase(), isChecked: false };
    case 'f_pass_issue': return { display: formData.i_pass_issue || '2020-01-01', isChecked: false };
    case 'f_pass_exp': return { display: formData.i_pass_exp || '2030-01-01', isChecked: false };
    case 'f_phone':
    case 'cellphone':
    case 'phone': return { display: formData.i_cellphone || formData.i_phone || '010-1234-5678', isChecked: false };
    case 'f_email':
    case 'email': return { display: formData.i_email || 'worker@email.com', isChecked: false };
    case 'f_addr':
    case 'address_kr': return { display: formData.i_address_kr || '전남 영암군 삼호읍 대불로 10', isChecked: false };
    case 'f_addr_home':
    case 'address_home': return { display: (formData.i_address_home || 'SON HA, THAI THUY, VIETNAM').toUpperCase(), isChecked: false };

    // Workplace
    case 'c_name':
    case 'cname': return { display: formData.i_cname || '가영테크(주)', isChecked: false };
    case 'c_regno':
    case 'cregno': return { display: formData.i_cregno || '411-81-19799', isChecked: false };
    case 'c_rep':
    case 'rep_name': return { display: formData.i_rep_name || '김가영', isChecked: false };
    case 'c_rep_id':
    case 'rep_id': return { display: formData.i_rep_id || '650101-1******', isChecked: false };
    case 'c_addr':
    case 'caddr': return { display: formData.i_caddr || '전남 영암군 삼호읍 대불로 93', isChecked: false };
    case 'c_phone':
    case 'cphone': return { display: formData.i_cphone || '061-460-2114', isChecked: false };

    // Job / Income
    case 'job_title':
    case 'job':
    case 'c_job': return { display: formData.i_job || '선체도장공', isChecked: false };
    case 'job_code':
    case 'c_job_code': return { display: formData.i_job_code || '7832', isChecked: false };
    case 'annual_income':
    case 'c_income_won': {
      const val = formData.i_income ? `${formData.i_income}0,000` : '36,000,000';
      return { display: `${val}원`, isChecked: false };
    }
    case 'monthly_income': {
      const rawNum = parseInt((formData.i_income || '3240').replace(/[^0-9]/g, ''), 10) || 3240;
      const mVal = Math.round((rawNum * 10000) / 12).toLocaleString();
      return { display: `${mVal}원`, isChecked: false };
    }

    // E-7-4R and Labor Contract Extended Fields
    case 'marriage': return { display: formData.i_marriage || '유', isChecked: false };
    case 'marriage_date': return { display: formData.i_marriage_date || '2018.01.30', isChecked: false };
    case 'education': return { display: formData.i_education || '고졸', isChecked: false };
    case 'total_workers': return { display: formData.i_total_workers || '138명', isChecked: false };
    case 'e74_workers': return { display: formData.i_e74_workers || '13명', isChecked: false };
    case 'work_period': return { display: formData.i_work_period || '1년 이상 근무', isChecked: false };
    case 'f_spouse':
    case 'spouse_name': return { display: (formData.i_spouse || 'MUKHTOROVA DILNOZA').toUpperCase(), isChecked: false };
    case 'spouse_dob': return { display: formData.i_spouse_dob || '1992.09.03', isChecked: false };
    case 'child1_name': return { display: (formData.i_child1_name || 'IKROMOV SAIDXON NAJIBULLO UGLI').toUpperCase(), isChecked: false };
    case 'child1_dob': return { display: formData.i_child1_dob || '2018.12.18', isChecked: false };
    case 'child2_name': return { display: (formData.i_child2_name || 'IKROMOV SAIDOLIMXON NAJIBULLO UGLI').toUpperCase(), isChecked: false };
    case 'child2_dob': return { display: formData.i_child2_dob || '2021.11.02', isChecked: false };
    case 'score_total': return { display: '280점 (통과)', isChecked: false };

    // Dates / Signs
    case 'today_date':
    case 'app_date': return { display: `${ty}.${tm}.${td}`, isChecked: false };
    case 'sign_y': return { display: ty, isChecked: false };
    case 'sign_m': return { display: tm, isChecked: false };
    case 'sign_d': return { display: td, isChecked: false };
    case 'sign_f':
    case 'f_sign':
    case 'sign_main':
    case 'declarant_name': return { display: fullName || 'BUI QUOC TINH', isChecked: false };
    case 'sign_rep':
    case 'p_sign_name': return { display: formData.i_rep_name || '김가영', isChecked: false };

    default:
      if (customTextMap && customTextMap[key]) {
        return { display: customTextMap[key], isChecked: false };
      }
      return { display: '', isChecked: false };
  }
}

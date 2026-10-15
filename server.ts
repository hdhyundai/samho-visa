import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3): Promise<any> {
  let attempt = 0;
  let delay = 1000;
  const models = [params.model || "gemini-2.5-flash", "gemini-3.1-flash-lite", "gemini-3.7-flash"];

  for (const model of models) {
    attempt = 0;
    delay = 1000;
    while (attempt < maxRetries) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model: model
        });
        return response;
      } catch (err: any) {
        attempt++;
        console.warn(`Gemini generation failed (model: ${model}, attempt: ${attempt}/${maxRetries}):`, err.message || err);
        if (attempt >= maxRetries) {
          if (model === models[models.length - 1]) {
            throw err;
          }
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }
}

export function createApiRouter() {
  const router = express.Router();
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("✅ Google Gemini AI 연동 준비 완료.");
  } else {
    console.warn("⚠️ GEMINI_API_KEY 미설정. OCR 및 검증 요청 시 오류가 반환될 수 있습니다.");
  }

  // AI OCR extraction endpoint
  router.post("/gemini/ocr", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ error: "Gemini AI API 키가 설정되지 않았습니다. GEMINI_API_KEY 환경변수를 확인해주세요." });
      }

      const { image, mimeType } = req.body;
      if (!image || !mimeType) {
        return res.status(400).json({ error: "Missing image data or mimeType" });
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: image,
              mimeType: mimeType
            }
          },
          {
            text: `외국인등록증(ARC), 여권(Passport), 사업자등록증 또는 근로계약서 이미지입니다. 
대한민국 법무부 출입국 외국인청 행정서류 자동 완성을 위해 다음 항목들을 정확하게 JSON 형식으로 추출해주세요.

[필수 추출 규칙]
1. 성(i_surname)과 이름(i_givenname)은 여권/등록증상의 공식 영문 대문자로 분리 추출
2. 생년월일(i_dob), 여권발급일, 만료일은 "YYYY-MM-DD" 표준 형식
3. 외국인등록번호(i_arc)는 13자리 형식 (예: "880519-5600011")
4. 국내체류지주소(i_address_kr) 및 사업장주소(i_caddr)는 도로명주소 우선
5. 사업자등록번호(i_cregno)는 하이픈 포함 ("847-81-03268")
6. 연간소득(i_income)은 만원 단위 숫자 (예: 3240, 4588)
7. 확인되지 않는 항목은 빈 문자열("")로 반환하세요.

JSON 출력 형식:
{
  "i_surname": "영문 성 (예: MUKHTOROV)",
  "i_givenname": "영문 이름 (예: NAJIBULLO IKROMOVICH)",
  "i_dob": "YYYY-MM-DD (예: 1988-05-19)",
  "i_gender": "M 또는 F",
  "i_nation": "영문 국가명 (예: UZBEKISTAN, SRI LANKA, VIETNAM)",
  "i_arc": "외국인등록번호 (예: 880519-5600011)",
  "i_passport": "여권번호 (예: FA0616217)",
  "i_pass_issue": "YYYY-MM-DD",
  "i_pass_exp": "YYYY-MM-DD",
  "i_address_kr": "국내 체류지 주소",
  "i_cellphone": "휴대전화번호 (예: 010-4832-8805)",
  "i_cname": "사업장 회사명",
  "i_cregno": "사업자등록번호 (예: 847-81-03268)",
  "i_rep_name": "대표자 성명",
  "i_rep_id": "대표자 주민번호앞자리 (예: 710403-1000000)",
  "i_caddr": "사업장 주소",
  "i_cphone": "회사 대표전화 (예: 061-462-3588)",
  "i_job": "직종명",
  "i_job_code": "한국표준직업분류코드 (예: 7832, 7431)",
  "i_income": "연간소득 만원단위 (예: 3240)",
  "i_dorm_start": "기숙사 거주시작일 YYYY-MM-DD",
  "visaType": "추정 비자 자격 (예: E-7-4R, E-7-3, E-9)"
}`
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No text returned from Gemini");
      }
      res.json(JSON.parse(text.trim()));
    } catch (err: any) {
      console.error("AI OCR Server Error:", err);
      res.status(500).json({ error: err.message || "Failed to perform OCR" });
    }
  });

  // AI Document Verification / Crosscheck endpoint
  router.post("/gemini/verify", async (req, res) => {
    try {
      if (!ai) {
        return res.status(400).json({ error: "Gemini AI API 키가 설정되지 않았습니다. GEMINI_API_KEY 환경변수를 확인해주세요." });
      }

      const { documents, formData, language } = req.body;
      if (!formData) {
        return res.status(400).json({ error: "Missing formData values" });
      }

      const prompt = `당신은 대한민국 출입국 외국인청의 전문 비자 심사관 및 최고 수준의 시각 인공지능(Vision AI)입니다.
신청자가 입력한 양식 데이터(formData)와 실제 첨부된 증빙서류 이미지(외국인등록증, 여권, 사업자등록증, 근로계약서, 소득금액증명원 등)를 한 자 한 자 정밀하게 대조 검증해주세요.

[중점 심사 기준]
1. 영문 성명(i_surname, i_givenname)의 철자가 여권/외국인등록증과 1글자라도 불일치하는지 여부
2. 외국인등록번호(i_arc) 생년월일 및 성별 뒷자리 첫 번호의 정합성
3. 여권번호(i_passport) 및 여권 만료일(i_pass_exp)의 유효성 (신청일 기준 6개월 이상 잔여 여부)
4. 사업자등록번호(i_cregno) 및 회사명(i_cname), 대표자명(i_rep_name)
5. E-7-4R (광역형) & E-7-3 조선업 전용 요건:
   - 최소 체류기간 요건: 최근 10년 중 4년 이상 합법 체류 여부
   - 계약 연봉 2,600만원 이상 여부 (월 217만원 이상 필수)
   - 근로계약기간 2년 이상 체결 여부
   - 사업장 국민고용인원 대비 고용허용 인원 쿼터

[검증 불일치 시]
- 불일치하는 필드의 'fieldId'를 정확히 지정하세요:
  (i_surname, i_givenname, i_dob, i_arc, i_passport, i_address_kr, i_cname, i_cregno, i_rep_name, i_rep_id, i_caddr, i_cphone, i_income, i_dorm_start, visaType 등)
- 설명('description')과 권고사항('recommendation')은 [${language || 'Korean'}] 언어로 친절하고 명확하게 작성하세요.

[검증 대상 양식 입력 데이터]:
${JSON.stringify(formData, null, 2)}`;

      const contents: any[] = [{ text: prompt }];

      if (documents && Array.isArray(documents)) {
        for (const doc of documents) {
          if (doc && doc.data && doc.mimeType) {
            contents.push({
              inlineData: {
                data: doc.data,
                mimeType: doc.mimeType
              }
            });
          }
        }
      }

      const response = await generateContentWithRetry(ai, {
        model: "gemini-2.5-flash",
        contents: contents,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { 
                type: Type.STRING,
                description: "PASS (일치) or FAIL (불일치 발견)"
              },
              issues: {
                type: Type.ARRAY,
                description: "발견된 불일치 또는 미비점 목록",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    fieldId: { 
                      type: Type.STRING,
                      description: "불일치 필드 ID"
                    },
                    category: { 
                      type: Type.STRING,
                      description: "항목 구분 (인적사항, 비자요건, 사업장정보 등)"
                    },
                    description: { 
                      type: Type.STRING,
                      description: "구체적 불일치 내용"
                    },
                    recommendation: { 
                      type: Type.STRING,
                      description: "수정 권고 조치"
                    }
                  },
                  required: ["fieldId", "category", "description", "recommendation"]
                }
              }
            },
            required: ["status", "issues"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response returned from Gemini validation model");
      }
      res.json(JSON.parse(text.trim()));
    } catch (err: any) {
      console.error("AI Verify Server Error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze document verification" });
    }
  });

  return router;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Mount API router
  app.use("/api", createApiRouter());

  // Template PDFs 404 guard
  app.get("/templates/*.pdf", (req, res, next) => {
    const templatePath = path.join(process.cwd(), "public", req.path);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: "Template PDF not found" });
    }
    next();
  });

  // Serve static files or Vite dev server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

// Start if executed directly
if (import.meta.url === `file://${process.argv[1]}` || process.env.RUN_SERVER === 'true') {
  startServer();
}

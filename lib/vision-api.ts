import {
  classifyTrashFromAnnotations,
  parseAiTrashJson,
  type TrashDetectionResult,
} from "@/lib/trash-classifier";

export type { TrashDetectionResult } from "@/lib/trash-classifier";
export {
  classifyTrashFromAnnotations,
  isAfterPhotoStillDirty,
  formatCooldown,
} from "@/lib/trash-classifier";

const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY ??
  process.env.EXPO_PUBLIC_GEMINI_API_KEY ??
  "AIzaSyCDgsFGE3ohjfegCjNmqyypMkGIKT3pi38";

const VISION_URL = "https://vision.googleapis.com/v1/images:annotate";
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

export class VisionRequestError extends Error {
  kind: "network" | "api";

  constructor(kind: "network" | "api" = "api", message = "VISION_ERROR") {
    super(message);
    this.name = "VisionRequestError";
    this.kind = kind;
  }
}

export type DetectTrashInput = string | { uri?: string; base64?: string };

function toBase64(imageBase64: string): string {
  const raw = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
  return raw.replace(/\s/g, "");
}

function isNetworkFailure(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as { message?: string; name?: string };
  const message = (err.message || "").toLowerCase();
  return (
    err.name === "TypeError" ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("timeout") ||
    message.includes("timed out")
  );
}

async function prepareImageBase64(input: DetectTrashInput): Promise<string> {
  const photo = typeof input === "string" ? { base64: input } : input;

  if (photo.uri) {
    try {
      const ImageManipulator = await import("expo-image-manipulator");
      const result = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 768 } }],
        {
          compress: 0.55,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );
      if (result.base64) return result.base64.replace(/\s/g, "");
    } catch (error) {
      console.warn("이미지 압축 실패, 원본을 사용합니다:", error);
    }
  }

  if (!photo.base64) {
    throw new VisionRequestError("api", "사진 데이터가 없습니다.");
  }
  return toBase64(photo.base64);
}

async function detectWithVision(imageBase64: string): Promise<TrashDetectionResult | null> {
  const response = await fetch(`${VISION_URL}?key=${GOOGLE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requests: [
        {
          image: { content: imageBase64 },
          features: [
            { type: "LABEL_DETECTION", maxResults: 20 },
            { type: "OBJECT_LOCALIZATION", maxResults: 20 },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`VISION_HTTP_${response.status}`);
  }

  const data = await response.json();
  const result = data?.responses?.[0];
  if (!result) return null;
  if (result.error) {
    throw new Error(result.error.message || "VISION_BODY_ERROR");
  }

  return classifyTrashFromAnnotations(
    result.labelAnnotations || [],
    result.localizedObjectAnnotations || []
  );
}

async function detectWithGemini(imageBase64: string): Promise<TrashDetectionResult | null> {
  const prompt = `이 사진에 길거리 쓰레기(병, 캔, 비닐, 담배꽁초, 종이, 음식물 등)가 보이는지 판단하세요.
JSON만 출력하세요.
쓰레기가 있으면: {"found":true,"category":"plastic|glass|metal|paper|food|other","description":"한국어 이름","confidence":0.0~1.0}
없으면: {"found":false}`;

  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: "image/jpeg", data: imageBase64 } },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        lastError = new Error(`GEMINI_HTTP_${response.status}`);
        continue;
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || "").join("") ||
        "";
      return parseAiTrashJson(text);
    } catch (error) {
      lastError = error;
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError) throw lastError;
  return null;
}

export async function detectTrash(
  image: DetectTrashInput
): Promise<TrashDetectionResult | null> {
  const imageBase64 = await prepareImageBase64(image);

  try {
    return await detectWithGemini(imageBase64);
  } catch (geminiError) {
    try {
      return await detectWithVision(imageBase64);
    } catch (visionError) {
      if (isNetworkFailure(geminiError) && isNetworkFailure(visionError)) {
        throw new VisionRequestError("network");
      }
      console.error("AI 인식 오류:", geminiError, visionError);
      throw new VisionRequestError("api");
    }
  }
}

export async function isValidTrashImage(imageBase64: string): Promise<boolean> {
  try {
    const result = await detectTrash(imageBase64);
    return result !== null && result.confidence > 0.4;
  } catch {
    return false;
  }
}

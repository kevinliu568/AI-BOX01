
import { GoogleGenAI } from "@google/genai";
import type { ScriptData, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY 環境變數未設定。");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const buildPrompt = (topic: string, duration: number): string => {
  return `
    你是一位專業的健康醫療電視節目腳本作家。你的任務是為一個${duration}分鐘的訪談節目，針對以下主題生成一份詳細、專業且易於大眾理解的腳本。

    主題: "${topic}"

    請遵循以下結構和要求來撰寫腳本，並根據總時長 ${duration} 分鐘，合理地按比例分配以下各個環節的時間：

    1.  **節目開場:**
        *   主持人開場白，引出今日主題的重要性。
        *   介紹今天的專家來賓（請虛構一位權威的醫生或專家）。
        *   簡要說明節目將探討的內容。
        *   在段落最後，請提供一個【製作插圖提示詞】，這個提示詞應該要能生動地描繪該段落的核心概念，風格為現代、簡潔、資訊圖表風格。

    2.  **第一節：主題核心解析:**
        *   深入解釋 "${topic}" 是什麼。
        *   討論其主要成因、風險因素和常見症狀。
        *   使用比喻或簡單的例子幫助觀眾理解。
        *   在段落最後，請提供一個【製作插圖提示詞】，這個提示詞應該要能生動地描繪該段落的核心概念，風格為現代、簡潔、資訊圖表風格。

    3.  **第二節：預防與最新治療方案:**
        *   探討有效的預防方法。
        *   介紹目前主流的治療方式，包含藥物和非藥物治療。
        *   提及是否有任何最新的研究或突破性療法。
        *   在段落最後，請提供一個【製作插圖提示詞】，這個提示詞應該要能生動地描繪該段落的核心概念，風格為現代、簡潔、資訊圖表風格。

    4.  **第三節：生活方式調整與迷思破解:**
        *   提供與 "${topic}" 相關的飲食、運動和生活作息建議。
        *   破解坊間流傳的常見迷思或錯誤觀念。
        *   在段落最後，請提供一個【製作插圖提示詞】，這個提示詞應該要能生動地描繪該段落的核心概念，風格為現代、簡潔、資訊圖表風格。

    5.  **觀眾問答:**
        *   虛構2-3個觀眾的典型問題，並由專家提供簡潔明瞭的回答。
        *   在段落最後，請提供一個【製作插圖提示詞】，這個提示詞應該要能生動地描繪該段落的核心概念，風格為現代、簡潔、資訊圖表風格。

    6.  **節目結尾:**
        *   主持人總結今日重點。
        *   提醒觀眾重要注意事項。
        *   感謝專家來賓，並預告下集節目。

    **格式要求:**
    *   請使用 Markdown 格式化腳本，包含標題、列表等。
    *   明確標示出主持人和專家的對話，例如：【主持人】、【專家】。
    *   在每個段落開頭標示出你分配的預計時間，例如：[00:00-03:00]。
    *   內容必須科學、準確、客觀，並基於最新的醫學資訊。
  `;
};

export const generateScript = async (topic: string, duration: number): Promise<ScriptData> => {
  try {
    const prompt = buildPrompt(topic, duration);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const content = response.text;
    const rawSources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    const sources: GroundingSource[] = rawSources
      .map((chunk: any) => ({
        uri: chunk.web?.uri || '',
        title: chunk.web?.title || '',
      }))
      .filter((source: GroundingSource) => source.uri && source.title);

    // Remove duplicate sources
    const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());
    
    if (!content) {
        throw new Error("API 回應為空，請稍後再試。");
    }

    return { content, sources: uniqueSources };
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("與 AI 服務通訊失敗，請檢查您的網路連線或 API 金鑰。");
  }
};

export const regenerateDialogue = async (currentScript: string): Promise<string> => {
  const prompt = `
    你是一位頂尖的電視節目編劇。你的任務是潤飾一份現有的健康醫療節目腳本。

    請針對以下腳本內容，**僅僅**改寫【主持人】和【專家】的對話部分。
    目標是讓對話風格變得更具同理心、更口語化、更引人入勝，但同時必須保留所有原始的醫學資訊和核心觀點。

    **重要規則：**
    1.  **不要**更改任何時間標示，例如 \`[00:00-03:00]\`。
    2.  **不要**更改或刪除任何【製作插圖提示詞】的區塊。
    3.  **不要**更改 Markdown 的結構，例如標題 (\`##\` or \`###\`) 或列表。
    4.  **只要**專注於重寫【主持人】和【專家】後面的對話文字。

    以下是原始腳本：
    ---
    ${currentScript}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    const newContent = response.text;
    if (!newContent) {
      throw new Error("API 回應為空，無法生成新的對話。");
    }
    return newContent;
  } catch (error) {
    console.error("Gemini API call for regeneration failed:", error);
    throw new Error("與 AI 服務通訊失敗，無法生成新的對話選項。");
  }
};

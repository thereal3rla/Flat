import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Sleep helper
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function POST(request: NextRequest) {
    try {
        const { file, fileType } = await request.json();

        if (!file || file.length > 14 * 1024 * 1024) {
            return NextResponse.json(
                { error: "File too large (>10MB). Batching should prevent this." },
                { status: 413 }
            );
        }

        const base64Data = file.replace(/^data:[^;]+;base64,/, "");
        const mimeType = fileType === "pdf" ? "application/pdf" : "image/png";

        // --- Generate with Retry ---
        const model = genAI.getGenerativeModel(
            {
                // Using gemini-3-flash-preview as requested
                model: "gemini-3-flash-preview",
                generationConfig: { responseMimeType: "application/json" }
            }
        );

        const prompt = `Analyze this floor plan document batch. 
        
        CRITICAL: Return a Valid JSON object.
        
        Task:
        1. Identify distinct floor plan layouts.
        2. Extract the EXACT area for EACH individual apartment instance.
        3. Do NOT average the areas. List them all.
        4. Extract the Residential Complex (RC) name / Project Name if visible on the page (e.g., in the title block). If not found, return null.
        
        JSON Schema:
        {
          "summary": { "totalFloors": number, "buildingTotalArea": number, "totalApartments": number },
          "projectName": "string | null", 
          "layouts": [
            {
              "layoutName": "string",
              "floors": "string",
              "totalApartmentsOnFloor": number,
              "apartmentMix": [
                 { 
                   "type": "string", 
                   "count": number, 
                   "areas": number[] // List of areas for each apartment of this type. Example: [45.2, 45.5, 46.0]
                 } 
              ],
              "totalAreaPerFloor": number
            }
          ]
        }`;

        let result;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                result = await model.generateContent([
                    { inlineData: { mimeType: mimeType, data: base64Data } },
                    { text: prompt }
                ]);
                break; // Success
            } catch (err: any) {
                if (err.status === 429 || err.message?.includes("429")) {
                    console.log(`Hit 429. Retrying... (${retryCount + 1}/${maxRetries})`);
                    retryCount++;
                    await sleep(3000 * retryCount); // 3s, 6s, 9s backoff
                } else {
                    throw err; // Fatal error
                }
            }
        }

        if (!result) throw new Error("Failed to generate content after retries.");

        const responseText = result.response.text();
        console.log("Gemini Raw Response:", responseText); // Debug logging

        if (!responseText) {
            throw new Error("Gemini returned empty response");
        }

        // Parse
        const cleanText = responseText.replace(/```json|```/g, "").trim();
        let jsonData = JSON.parse(cleanText);

        // Normalize: If model returns array, take first item
        if (Array.isArray(jsonData)) {
            jsonData = jsonData[0];
        }

        return NextResponse.json(jsonData);

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


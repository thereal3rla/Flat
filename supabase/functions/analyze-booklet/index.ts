import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

serve(async (req) => {
    try {
        const { record } = await req.json()
        const bookletId = record.id
        const pdfUrl = record.pdf_url

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        // 1. Update status to processing
        await supabase
            .from('booklets')
            .update({ status: 'processing' })
            .eq('id', bookletId)

        // 2. Upload PDF to Gemini File API (fixes memory issues)
        console.log('Uploading PDF to Gemini File API...');
        const fetchPdfResponse = await fetch(pdfUrl);
        if (!fetchPdfResponse.ok) throw new Error('Failed to fetch PDF from storage');

        const pdfBlob = await fetchPdfResponse.blob();

        // Step A: Initial upload request
        const uploadUrl = `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${GEMINI_API_KEY}`;
        const uploadResponse = await fetch(uploadUrl, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Protocol': 'resumable',
                'X-Goog-Upload-Command': 'start',
                'X-Goog-Upload-Header-Content-Length': pdfBlob.size.toString(),
                'X-Goog-Upload-Header-Content-Type': 'application/pdf',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ file: { display_name: `booklet_${bookletId}` } }),
        });

        const uploadLocation = uploadResponse.headers.get('x-goog-upload-url');
        if (!uploadLocation) throw new Error('Failed to get upload location');

        // Step B: Upload the data
        const finalUploadResponse = await fetch(uploadLocation, {
            method: 'POST',
            headers: {
                'X-Goog-Upload-Offset': '0',
                'X-Goog-Upload-Command': 'upload, finalize',
            },
            body: pdfBlob,
        });

        const fileInfo = await finalUploadResponse.json();
        const fileUri = fileInfo.file.uri;
        console.log('File uploaded to Gemini:', fileUri);

        // 3. Call Gemini with File URI
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${GEMINI_API_KEY}`

        const prompt = `
### ROLE
You are a Senior Real Estate Data Analyst. Your goal is to structure architectural data with extreme precision.

### OBJECTIVE
Analyze the provided floor plan document. You must group the data hierarchically:
**Project -> Entrances (Sections/Подъезды) -> Floor Layouts -> Apartments.**

### CRITICAL RULES
1.  **HIERARCHY IS KING:**
    - First, identify if the building has multiple **Sections (Секции)** or **Entrances (Подъезды)**.
    - If the document explicitly separates "Section A" and "Section B", you must create two entries in the \`entrances\` array.
    - If no sections are named, create one default entrance named "Main Section".

2.  **CALCULATING TOTALS (NO GUESSING):**
    - **Total Apartments:** strictly calculate as:
      SUM( for each layout: \`apartmentsOnLayout\` * \`countOfFloorsWithThisLayout\` ).
    - **Explicit Override:** If the text says "Total: 150 apartments", trust the text over your calculation.

3.  **AI ANALYSIS:**
    - Fill the \`aiAnalize\` field with a comprehensive review of the layout efficiency, zoning, and ergonomics in Russian.

### OUTPUT FORMAT
Return **ONLY** valid JSON. All string values must be in **RUSSIAN**.

### JSON SCHEMA
{
  "projectInfo": {
    "name": "String (Project Name)",
    "globalSummary": {
      "totalBuildingFloors": number, // Max floors across all sections
      "totalBuildingApartments": number, // Sum of all sections
      "verificationMethod": "String (e.g., 'Explicit text found: 92' or 'Calculated by summing sections')"
    }
  },
  "entrances": [ // ARRAY OF SECTIONS / ПОДЪЕЗДЫ
    {
      "entranceName": "String (e.g., 'Секция 1', 'Подъезд А')",
      "maxFloors": number, // Max floors specifically in this section
      "floorLayouts": [ // GROUP BY IDENTICAL FLOORS
        {
          "floorRange": "String (e.g., '2-9')",
          "floorsCount": number, // How many floors use this exact plan? (e.g., 8)
          "totalApartmentsOnSingleFloor": number, // How many apts on ONE floor of this type
          "apartments": [
            {
              "type": "String (e.g., '1-к', '2-к')",
              "area": number, // Exact area. DO NOT AVERAGE.
              "countOnFloor": number // How many of this specific apartment on this floor
            }
          ]
        }
      ]
    }
  ],
  "aiAnalize": "String (Detailed analysis in Russian. Discuss zoning, pros/cons, light, and space efficiency.)"
}
`;

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { fileData: { mimeType: "application/pdf", fileUri: fileUri } },
                            { text: prompt }
                        ]
                    }
                ],
                generationConfig: { responseMimeType: "application/json" }
            })
        })

        const result = await geminiResponse.json()
        const resultText = result.candidates[0].content.parts[0].text
        const cleanText = resultText.replace(/```json|```/g, "").trim()
        const jsonData = JSON.parse(cleanText)

        // 4. Update database
        await supabase
            .from('booklets')
            .update({
                analysis_info: jsonData,
                status: 'completed'
            })
            .eq('id', bookletId)

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
    } catch (error) {
        console.error(error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } })
    }
})

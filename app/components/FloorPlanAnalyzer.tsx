"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { PDFDocument } from "pdf-lib";

// Dynamic import of PdfPreview with NO SSR to prevent DOMMatrix errors
const PdfPreview = dynamic(() => import("./PdfPreview"), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center text-slate-500">Запуск просмотра PDF...</div>
});

const BATCH_SIZE = 1; // Number of pages per API request (Reduced to 1 to avoid Vercel 4.5MB limit)

interface FloorLayout {
    layoutName: string;
    floors: string;
    floorsDescription?: string;
    totalApartmentsOnFloor: number;
    apartmentMix: { type: string; count: number; areas: number[] }[];
    totalAreaPerFloor: number;
    notes?: string;
}

interface AnalysisResult {
    summary: {
        totalFloors: number;
        buildingTotalArea: number;
        totalApartments?: number;
    };
    projectName?: string;
    layouts: FloorLayout[];
    notes?: string;
    error?: string;
    rawResponse?: string;
}

export default function FloorPlanAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string>("");

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);

    // Analysis State
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<string>("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [rcName, setRcName] = useState<string>(""); // State for RC Name

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when file changes
    useEffect(() => {
        if (file) {
            setNumPages(0);
            setSelectedIndices([]);
            setResult(null);
            setError("");
        }
    }, [file]);

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setError("Пожалуйста, загрузите PDF файл для этой версии анализатора.");
                return;
            }
            setFile(selectedFile);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            if (droppedFile.type !== "application/pdf") {
                setError("Пожалуйста, загрузите PDF файл.");
                return;
            }
            setFile(droppedFile);
        }
    }, []);

    const togglePage = (pageNumber: number) => {
        setSelectedIndices((prev) =>
            prev.includes(pageNumber)
                ? prev.filter((n) => n !== pageNumber)
                : [...prev, pageNumber].sort((a, b) => a - b)
        );
    };

    const processBatch = async (batchIndices: number[], originalPdf: PDFDocument, batchNum: number, totalBatches: number): Promise<AnalysisResult> => {
        setProcessingStep(`Обработка пакета ${batchNum}/${totalBatches}...`);

        const newPdf = await PDFDocument.create();
        const pagesToCopy = batchIndices.map(i => i - 1);
        const copiedPages = await newPdf.copyPages(originalPdf, pagesToCopy);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const pdfBytes = await newPdf.saveAsBase64();
        const base64Payload = `data:application/pdf;base64,${pdfBytes}`;

        const response = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                file: base64Payload,
                fileType: "pdf",
            }),
        });

        if (!response.ok) {
            if (response.status === 413) {
                throw new Error(`Ошибка 413: Файл слишком большой для сервера. Пакет ${batchNum} не отправлен.`);
            }
            let errorMessage = `Пакет ${batchNum} не удался`;
            try {
                const data = await response.json();
                errorMessage = data.error || errorMessage;
            } catch (e) {
                // If response is not JSON (e.g. HTML 413/504 page)
                errorMessage = `Сервер вернул ошибку ${response.status} (${response.statusText})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        return data;
    };

    const handleAnalyze = async () => {
        if (!file || selectedIndices.length === 0) return;
        setIsProcessing(true);
        setError("");
        setProcessingStep("Подготовка...");

        try {
            const arrayBuffer = await file.arrayBuffer();
            const originalPdf = await PDFDocument.load(arrayBuffer);

            // Create Batches
            const batches: number[][] = [];
            for (let i = 0; i < selectedIndices.length; i += BATCH_SIZE) {
                batches.push(selectedIndices.slice(i, i + BATCH_SIZE));
            }

            const results: AnalysisResult[] = [];

            // Sequential Processing
            for (let i = 0; i < batches.length; i++) {
                const batchResult = await processBatch(batches[i], originalPdf, i + 1, batches.length);
                results.push(batchResult);
            }

            // Merge Results
            setProcessingStep("Объединение результатов...");

            // Find first non-empty projectName
            const foundName = results.find(r => r.projectName)?.projectName;
            const finalRcName = foundName || "";
            setRcName(finalRcName);

            const mergedResult: AnalysisResult = {
                summary: {
                    totalFloors: results.reduce((sum, r) => sum + (r.summary?.totalFloors || 0), 0),
                    buildingTotalArea: results.reduce((sum, r) => sum + (r.summary?.buildingTotalArea || 0), 0),
                },
                layouts: results.flatMap(r => r.layouts || []),
                notes: results.map(r => r.notes).filter(Boolean).join("\n"),
                // Keep raw response of first or all? For debug maybe last.
                rawResponse: results.map(r => r.rawResponse).join("\n---\n")
            };

            setResult(mergedResult);

        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "Не удалось проанализировать документ");
        } finally {
            setIsProcessing(false);
            setProcessingStep("");
        }
    };

    // Calculate actual stats from the parsed data (frontend calculation)
    const calculatedTotalApps = result?.layouts.reduce((sum, layout) =>
        sum + layout.apartmentMix.reduce((lSum, mix) => lSum + mix.areas.length, 0), 0) || 0;

    const calculatedTotalArea = result?.layouts.reduce((sum, layout) =>
        sum + layout.apartmentMix.reduce((lSum, mix) => lSum + mix.areas.reduce((a, b) => a + b, 0), 0), 0) || 0;

    const calculatedAvgArea = calculatedTotalApps > 0
        ? (calculatedTotalArea / calculatedTotalApps).toFixed(2)
        : "0";

    const handleDownloadCsv = () => {
        if (!result) return;

        // BOM for Excel to open UTF-8 correctly
        const BOM = "\uFEFF";

        // 1. Title Row: RC Name
        let csvContent = `ЖК: ${rcName}\n\n`; // Empty line after title

        // 2. Headers (without "ЖК" column)
        const headers = ["Название планировки", "Этажи", "Тип квартиры", "Площадь (м²)"];
        csvContent += headers.join(";") + "\n";

        result.layouts.forEach(layout => {
            layout.apartmentMix.forEach(mix => {
                mix.areas.forEach(area => {
                    const row = [
                        // Removed RC Name from data row
                        `"${layout.layoutName.replace(/"/g, '""')}"`,
                        `"${layout.floors}"`,
                        `"${mix.type}"`,
                        area.toString().replace(".", ",") // Excel often likes comma for decimals in RU/EU
                    ];
                    csvContent += row.join(";") + "\n";
                });
            });
        });

        // Add Summary Stats at the bottom
        csvContent += "\n";
        csvContent += `Всего квартир;${calculatedTotalApps}\n`;
        csvContent += `Средняя площадь (м²);${calculatedAvgArea.replace(".", ",")}\n`;

        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-8 text-slate-800">
            <div className="max-w-6xl mx-auto relative">
                <button
                    onClick={() => window.location.reload()}
                    className="absolute top-0 right-0 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-2 text-sm font-medium p-2 hover:bg-slate-100 rounded-lg"
                    title="Обновить страницу"
                >
                    🔄 Очистить
                </button>

                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
                        🏢 Квартирография
                    </h1>
                    <p className="text-slate-500">
                        Загрузите PDF → Выберите страницы → Получите анализ
                    </p>
                </header>

                <div className="grid lg:grid-cols-12 gap-6">
                    {/* Left Column: Upload & Selection */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Step 1: Upload */}
                        {!file && (
                            <div
                                className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-500 hover:bg-slate-50 transition-all cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => e.preventDefault()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <div className="text-5xl mb-4">📄</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Загрузить планировку (PDF)</h3>
                                <p className="text-sm text-slate-500">Перетащите файл или нажмите для выбора</p>
                            </div>
                        )}

                        {/* Step 2: Page Selection */}
                        {file && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                                    <div>
                                        <h2 className="font-bold text-slate-900">Выберите страницы с планировками</h2>
                                        <p className="text-xs text-slate-500">
                                            {selectedIndices.length} страниц выбрано
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="text-xs text-red-400 hover:text-red-300 px-3 py-1 bg-red-500/10 rounded-lg"
                                    >
                                        Изменить файл
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
                                    <PdfPreview
                                        file={file}
                                        numPages={numPages}
                                        selectedIndices={selectedIndices}
                                        onTogglePage={togglePage}
                                        onLoadSuccess={setNumPages}
                                    />
                                </div>

                                <div className="p-4 border-t border-slate-200 bg-slate-50">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isProcessing || selectedIndices.length === 0}
                                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        {isProcessing
                                            ? `⏳ ${processingStep}`
                                            : `Анализировать ${selectedIndices.length} стр.`
                                        }
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm">
                                ⚠️ {error}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Results */}
                    <div className="lg:col-span-7 space-y-6">
                        {!result ? (
                            <div className="h-full min-h-[400px] border border-slate-300 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                <div className="text-6xl mb-4 opacity-20">📊</div>
                                <p>Результаты анализа появятся здесь</p>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* RC Name Input */}
                                <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
                                    <label className="text-slate-500 text-xs uppercase tracking-wider mb-1 block">Название ЖК</label>
                                    <input
                                        type="text"
                                        value={rcName}
                                        onChange={(e) => setRcName(e.target.value)}
                                        className="w-full text-xl font-bold text-slate-900 border-b-2 border-emerald-500 focus:outline-none focus:border-emerald-700 bg-transparent"
                                        placeholder="Введите название ЖК"
                                    />
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Всего этажей</div>
                                        <div className="text-3xl font-bold text-slate-900">{result.summary.totalFloors}</div>
                                    </div>
                                    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Всего квартир</div>
                                        <div className="text-3xl font-bold text-blue-600">
                                            {calculatedTotalApps}
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Ср. площадь</div>
                                        <div className="text-3xl font-bold text-purple-600">
                                            {calculatedAvgArea} m²
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">Общая площадь</div>
                                        <div className="text-3xl font-bold text-emerald-600">
                                            {calculatedTotalArea.toLocaleString()} m²
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleDownloadCsv}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        📄 Выгрузить отчет
                                    </button>
                                </div>

                                {/* Layouts List */}
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        🏗️ Найденные планировки
                                    </h3>
                                    {result.layouts.map((layout, idx) => (
                                        <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-slate-900 text-lg">{layout.layoutName}</h4>
                                                    <p className="text-sm text-blue-600">Этажей: {layout.floors}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold text-slate-900">{layout.totalAreaPerFloor?.toLocaleString()} m²</div>
                                                    <div className="text-xs text-slate-500">на этаж</div>
                                                </div>
                                            </div>
                                            <div className="p-4 grid gap-3 sm:grid-cols-2">
                                                {layout.apartmentMix.flatMap((mix, mixIdx) =>
                                                    mix.areas.map((area, areaIdx) => (
                                                        <div key={`${mixIdx}-${areaIdx}`} className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center">
                                                            <div>
                                                                <div className="text-slate-900 font-medium">{mix.type}</div>
                                                                <div className="text-xs text-slate-500">1 шт.</div>
                                                            </div>
                                                            <div className="text-right font-mono text-emerald-600">
                                                                <span>{area} m²</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Raw JSON Toggle */}
                                <details className="group">
                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-800 flex items-center gap-2 mt-8">
                                        <span>▶</span> Показать технический JSON
                                    </summary>
                                    <pre className="mt-4 p-4 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 overflow-x-auto border border-slate-200">
                                        {JSON.stringify(result, null, 2)}
                                    </pre>
                                </details>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

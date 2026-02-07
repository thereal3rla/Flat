"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF worker
// Use local public file to avoid CORS issues with CDN
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfPreviewProps {
    file: File | string | null;
    selectedIndices: number[];
    numPages: number;
    onTogglePage: (pageNum: number) => void;
    onLoadSuccess: (numPages: number) => void;
}

export default function PdfPreview({
    file,
    selectedIndices,
    numPages,
    onTogglePage,
    onLoadSuccess
}: PdfPreviewProps) {
    return (
        <Document
            file={file}
            onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
            className="flex flex-wrap gap-4 justify-center"
            error={<div className="text-red-600 text-sm p-4">Ошибка загрузки PDF</div>}
            loading={<div className="text-slate-500 p-4">Загрузка страниц...</div>}
        >
            {Array.from(new Array(numPages), (el, index) => {
                const pageNum = index + 1;
                const isSelected = selectedIndices.includes(pageNum);
                return (
                    <div
                        key={`page_${pageNum}`}
                        onClick={() => onTogglePage(pageNum)}
                        className={`cursor-pointer relative group transition-all duration-200 ${isSelected
                            ? "ring-4 ring-blue-500 scale-105 shadow-xl z-20"
                            : "ring-1 ring-slate-300 opacity-80 hover:opacity-100 hover:scale-105 hover:z-10"
                            }`}
                    >
                        <Page
                            pageNumber={pageNum}
                            width={120}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="rounded-lg overflow-hidden bg-white"
                        />
                        <div className={`absolute inset-0 flex items-center justify-center bg-slate-900/40 font-bold text-white text-lg backdrop-blur-sm transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isSelected ? '✅ Выбрано' : `Стр. ${pageNum}`}
                        </div>
                    </div>
                );
            })}
        </Document>
    );
}

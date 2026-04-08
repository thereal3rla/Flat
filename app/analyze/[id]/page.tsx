'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';

export default function AnalysisPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booklet, setBooklet] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchBooklet = async () => {
        try {
            const response = await fetch(`/api/booklets`);
            const data = await response.json();
            const item = data.find((b: any) => b.id === id);
            if (item) setBooklet(item);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Parses "2-8", "5", "2-4" into an array of floor numbers
    const parseFloorRange = (range: string): number[] => {
        const floors: number[] = [];
        for (const part of range.split(',')) {
            const m = part.trim().match(/^(\d+)-(\d+)$/);
            if (m) {
                for (let f = +m[1]; f <= +m[2]; f++) floors.push(f);
            } else {
                const n = parseInt(part.trim());
                if (!isNaN(n)) floors.push(n);
            }
        }
        return floors.length ? floors : [1];
    };

    const handleDownloadExcel = () => {
        if (!booklet?.analysis_info) return;

        const rows: (string | number)[][] = [
            ['Подъезд', 'Этаж', 'Тип квартиры', 'Площадь (м²)'],
        ];

        let totalApts = 0;
        let totalArea = 0;

        const entrances: any[] = booklet.analysis_info.entrances || [];
        for (const ent of entrances) {
            const label = ent.entranceName || 'Подъезд';
            for (const layout of ent.floorLayouts || []) {
                const floors = parseFloorRange(layout.floorRange || '1');
                for (const floor of floors) {
                    for (const apt of layout.apartments || []) {
                        const count = apt.countOnFloor || 1;
                        for (let i = 0; i < count; i++) {
                            rows.push([label, floor, apt.type, apt.area]);
                            totalArea += apt.area || 0;
                            totalApts += 1;
                        }
                    }
                }
            }
        }

        // Summary — use the same source as the page cards
        const totalBuildingApartments = booklet.analysis_info.projectInfo?.globalSummary?.totalBuildingApartments || totalApts;
        let avgTotal = 0, avgCount = 0;
        for (const ent of entrances) {
            for (const layout of ent.floorLayouts || []) {
                for (const apt of layout.apartments || []) {
                    const n = apt.countOnFloor || 1;
                    avgTotal += (apt.area || 0) * n;
                    avgCount += n;
                }
            }
        }
        const avgArea = avgCount > 0 ? +(avgTotal / avgCount).toFixed(1) : 0;

        rows.push([]);
        rows.push(['', '', 'Количество квартир', totalBuildingApartments]);
        rows.push(['', '', 'Средняя площадь (м²)', avgArea]);

        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Column widths
        ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 20 }, { wch: 16 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');

        const name = booklet.analysis_info.projectInfo?.name || booklet.name || 'report';
        XLSX.writeFile(wb, `${name}.xlsx`);
    };

    useEffect(() => {
        fetchBooklet();
        const interval = setInterval(() => {
            if (booklet && booklet.status !== 'completed' && booklet.status !== 'error') {
                fetchBooklet();
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [id, booklet?.status]);

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Загрузка...</div>;
    if (!booklet) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Буклет не найден.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-8 text-slate-800 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-4xl mx-auto space-y-8">
                <button
                    onClick={() => router.push('/')}
                    className="text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-2 transition-colors font-medium"
                >
                    ← Вернуться к списку
                </button>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">{booklet.name}</h1>
                            <p className="text-slate-500 text-sm mt-1">
                                Загружено: {new Date(booklet.created_at).toLocaleString('ru-RU')}
                            </p>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${booklet.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            booklet.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                            {booklet.status === 'completed' ? 'Готово' :
                                booklet.status === 'processing' ? 'В обработке' :
                                    'В очереди'}
                        </div>
                    </div>

                    <div className="p-8">
                        {booklet.status === 'completed' && booklet.analysis_info ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-bold">ЖК</div>
                                        <div className="text-xl font-bold text-slate-900 truncate" title={booklet.analysis_info.projectInfo?.name}>
                                            {booklet.analysis_info.projectInfo?.name || '—'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-bold">Этажей</div>
                                        <div className="text-2xl font-bold text-slate-900">
                                            {booklet.analysis_info.projectInfo?.globalSummary?.totalBuildingFloors || '—'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-bold">Квартир</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {booklet.analysis_info.projectInfo?.globalSummary?.totalBuildingApartments || '—'}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-bold">Ср. площадь</div>
                                        <div className="text-2xl font-bold text-purple-600">
                                            {(() => {
                                                let total = 0, count = 0;
                                                (booklet.analysis_info.entrances || []).forEach((ent: any) =>
                                                    (ent.floorLayouts || []).forEach((layout: any) =>
                                                        (layout.apartments || []).forEach((apt: any) => {
                                                            const n = apt.countOnFloor || 1;
                                                            total += (apt.area || 0) * n;
                                                            count += n;
                                                        })
                                                    )
                                                );
                                                return count > 0 ? `${(total / count).toFixed(1)} м²` : '—';
                                            })()}
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl">
                                        <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-bold">Проверка</div>
                                        <div className="text-xs font-medium text-slate-600 mt-1">
                                            {booklet.analysis_info.projectInfo?.globalSummary?.verificationMethod || '—'}
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Analysis by Entrance */}
                                <div className="space-y-8">
                                    {booklet.analysis_info.entrances?.map((entrance: any, eIdx: number) => (
                                        <div key={eIdx} className="space-y-4">
                                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                                                🏢 {entrance.entranceName || `Секция ${eIdx + 1}`}
                                                <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                                    Макс. этажей: {entrance.maxFloors}
                                                </span>
                                            </h3>

                                            <div className="grid gap-6">
                                                {entrance.floorLayouts?.map((layout: any, lIdx: number) => (
                                                    <div key={lIdx} className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                                                        <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                                                            <div>
                                                                <h4 className="font-bold text-slate-900">Этажи: {layout.floorRange}</h4>
                                                                <p className="text-xs text-slate-500">Кол-во этажей с такой планировкой: {layout.floorsCount}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-sm font-bold text-slate-900">{layout.totalApartmentsOnSingleFloor} квартир</div>
                                                                <div className="text-[10px] text-slate-500 uppercase font-bold">на этаже</div>
                                                            </div>
                                                        </div>
                                                        <div className="p-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                                            {layout.apartments?.map((apt: any, aIdx: number) => (
                                                                <div key={aIdx} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-colors">
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="font-bold text-slate-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-sm">{apt.type}</span>
                                                                        <span className="text-xs text-slate-400 font-medium">x{apt.countOnFloor}</span>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <span className="text-lg font-bold text-emerald-600 block leading-none">{apt.area} <span className="text-sm">м²</span></span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* AI Analysis */}
                                {booklet.analysis_info.aiAnalize && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                            🤖 AI Анализ планировок
                                        </h3>
                                        <p className="text-indigo-800 text-sm leading-relaxed whitespace-pre-wrap">
                                            {booklet.analysis_info.aiAnalize}
                                        </p>
                                    </div>
                                )}

                                <div className="pt-8 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                                    <button
                                        onClick={handleDownloadExcel}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                                    >
                                        📊 Выгрузить отчёт
                                    </button>
                                    <a
                                        href={`/api/booklets/${id}/export-features`}
                                        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-5 rounded-xl transition-all shadow-md shadow-violet-500/20"
                                    >
                                        🏗 Продуктовые фичи XLSX
                                    </a>
                                    <a
                                        href={booklet.pdf_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-500 transition-colors font-bold"
                                    >
                                        📄 Открыть оригинальный PDF <span>↗</span>
                                    </a>
                                </div>
                            </div>
                        ) : booklet.status === 'processing' ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
                                <p className="text-slate-600 font-medium text-lg">Gemini анализирует буклет...</p>
                                <p className="text-xs text-slate-400">Это может занять минуту в зависимости от размера файла.</p>
                            </div>
                        ) : booklet.status === 'error' ? (
                            <div className="py-20 text-center space-y-4">
                                <div className="text-5xl opacity-50">⚠️</div>
                                <p className="text-slate-600 text-lg font-bold">Ошибка при анализе.</p>
                                <button
                                    onClick={() => fetch(`/api/booklets/${id}/analyze`, { method: 'POST' }).then(() => fetchBooklet())}
                                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-red-500/20"
                                >
                                    Попробовать снова
                                </button>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-4">
                                <p className="text-slate-500 text-lg">Анализ еще не запущен.</p>
                                <button
                                    onClick={() => fetch(`/api/booklets/${id}/analyze`, { method: 'POST' }).then(() => fetchBooklet())}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-blue-500/20"
                                >
                                    Запустить анализ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

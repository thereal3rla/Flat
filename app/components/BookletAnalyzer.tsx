'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BookletAnalyzer() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [booklets, setBooklets] = useState<any[]>([]);
    const [message, setMessage] = useState('');

    const fetchBooklets = async () => {
        const response = await fetch('/api/booklets');
        const data = await response.json();
        setBooklets(data);
    };

    useEffect(() => {
        fetchBooklets();
    }, []);

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage('📤 Загрузка файла...');

        try {
            // Upload directly from browser to Supabase Storage
            // (bypasses Vercel's 4.5MB serverless function body limit)
            const safeName = file.name
                .replace(/[^\x00-\x7F]/g, '') // remove non-ASCII (Cyrillic etc.)
                .replace(/\s+/g, '_')           // spaces → underscores
                .replace(/[^a-zA-Z0-9._-]/g, '') // remove remaining special chars
                || 'file.pdf';                  // fallback if name becomes empty
            const fileName = `${Date.now()}-${safeName}`;
            const { data: storageData, error: storageError } = await supabase.storage
                .from('booklets')
                .upload(fileName, file);

            if (storageError) {
                throw new Error(`Ошибка загрузки: ${storageError.message}`);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('booklets')
                .getPublicUrl(fileName);

            // Step 2: Save record to DB via API (only sends URL, not the file)
            setMessage('💾 Сохранение записи...');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: file.name.replace('.pdf', ''),
                    publicUrl,
                }),
            });

            if (response.ok) {
                const newBooklet = await response.json();
                setMessage('✅ Загрузка успешна! Начинаю анализ...');
                setFile(null);
                fetchBooklets();

                // Trigger analysis
                fetch(`/api/booklets/${newBooklet.id}/analyze`, { method: 'POST' });
            } else {
                const err = await response.json();
                throw new Error(err.error || 'Ошибка сохранения записи.');
            }
        } catch (error: any) {
            console.error(error);
            setMessage(`❌ ${error.message || 'Произошла ошибка.'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 sm:p-8 text-slate-800 font-[family-name:var(--font-geist-sans)]">
            <div className="max-w-5xl mx-auto space-y-12">
                <header className="text-center space-y-4">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                        🏢 Квартирография
                    </h1>
                    <p className="text-slate-500">Загрузите PDF буклет для автоматического анализа данных</p>
                </header>

                <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Загрузить новый буклет</h2>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="border-2 border-dashed border-slate-300 group-hover:border-blue-500 transition-all rounded-xl p-10 text-center space-y-2 bg-slate-50/50">
                                <div className="text-4xl">📄</div>
                                <p className="text-slate-600 font-medium">
                                    {file ? file.name : "Перетащите PDF буклет сюда или нажмите для выбора"}
                                </p>
                                <p className="text-xs text-slate-400">Максимальный размер 100MB</p>
                            </div>
                        </div>
                        <button
                            disabled={!file || uploading}
                            className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${!file || uploading
                                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20"
                                }`}
                        >
                            {uploading ? "💾 Загрузка и обработка..." : "🚀 Начать анализ"}
                        </button>
                        {message && (
                            <p className="text-center text-sm font-medium animate-pulse text-blue-600">{message}</p>
                        )}
                    </form>
                </section>

                <section className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900">Список Буклетов</h2>
                        <button onClick={fetchBooklets} className="text-sm text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1">
                            🔄 Обновить
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {booklets.map((booklet) => (
                            <Link
                                key={booklet.id}
                                href={`/analyze/${booklet.id}`}
                                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-3xl">📘</span>
                                    <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold border ${booklet.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                        booklet.status === 'processing' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                                            'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}>
                                        {booklet.status === 'completed' ? 'Готово' :
                                            booklet.status === 'processing' ? 'В обработке' :
                                                'В очереди'}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors truncate mb-1">
                                        {booklet.name}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        {new Date(booklet.created_at).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Открыть анализ</span>
                                    <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {booklets.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
                            <p className="text-slate-400">Буклеты еще не загружены.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // Fetch all features for this booklet
        const { data: features, error } = await supabase
            .from('booklet_features')
            .select('*')
            .eq('booklet_id', id)
            .order('section')
            .order('subsection')
            .order('feature_name');

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!features || features.length === 0) {
            return NextResponse.json(
                { error: 'Продуктовые фичи для этого буклета не найдены. Возможно, анализ ещё не завершён.' },
                { status: 404 }
            );
        }

        // Get booklet name for the file
        const { data: booklet } = await supabase
            .from('booklets')
            .select('name')
            .eq('id', id)
            .single();

        // Build XLSX
        const headers = [
            'Раздел',
            'Подраздел',
            'Продуктовая фича',
            'Суб-компонент',
            'Тегирование',
            'Найдено в буклете',
            'Уверенность AI',
            'Габариты',
            'Материал',
            'Бренд',
            'Доп характеристики',
            'Заметки AI',
        ];

        const rows: (string | number | boolean)[][] = [headers];

        for (const f of features) {
            rows.push([
                f.section || '',
                f.subsection || '',
                f.feature_name || '',
                f.sub_component || '',
                f.tag || '',
                f.found_in_booklet ? 'Да' : 'Нет',
                f.ai_confidence != null ? Number(f.ai_confidence) : 0,
                f.dimensions || '',
                f.material || '',
                f.brand || '',
                f.extra_info || '',
                f.ai_notes || '',
            ]);
        }

        // Summary rows
        const foundCount = features.filter((f: any) => f.found_in_booklet).length;
        rows.push([]);
        rows.push(['', '', 'Всего фичей проверено', features.length, '', '', '', '', '', '', '', '']);
        rows.push(['', '', 'Найдено в буклете', foundCount, '', '', '', '', '', '', '', '']);

        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Column widths
        ws['!cols'] = [
            { wch: 22 },  // Раздел
            { wch: 30 },  // Подраздел
            { wch: 40 },  // Фича
            { wch: 18 },  // Суб-компонент
            { wch: 30 },  // Тегирование
            { wch: 16 },  // Найдено
            { wch: 14 },  // Уверенность
            { wch: 30 },  // Габариты
            { wch: 25 },  // Материал
            { wch: 25 },  // Бренд
            { wch: 30 },  // Доп характеристики
            { wch: 50 },  // Заметки AI
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Продуктовые фичи');

        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

        const fileName = booklet?.name
            ? `${booklet.name} - фичи.xlsx`
            : `features-${id}.xlsx`;

        return new Response(Buffer.from(buffer), {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
            },
        });

    } catch (error: any) {
        console.error('Export features error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

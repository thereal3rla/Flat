import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        // 1. Get booklet info
        const { data: booklet, error: fetchError } = await supabase
            .from('booklets')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !booklet) {
            return NextResponse.json({ error: 'Booklet not found' }, { status: 404 });
        }

        if (booklet.status === 'completed' || booklet.status === 'processing') {
            return NextResponse.json(booklet);
        }

        // 2. Set status to processing
        await supabase
            .from('booklets')
            .update({ status: 'processing' })
            .eq('id', id);

        // 3. Trigger Supabase Edge Function
        // Replace <YOUR_PROJECT_REF> with your actual project reference
        const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0];
        const functionUrl = `https://${projectRef}.functions.supabase.co/analyze-booklet`;

        fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ record: booklet })
        }).catch(err => console.error('Edge Function Trigger Error:', err));

        return NextResponse.json({ message: 'Анализ запущен через Edge Function', status: 'processing' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

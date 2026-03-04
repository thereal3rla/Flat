import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const { name, publicUrl } = await request.json();

        if (!publicUrl) {
            return NextResponse.json({ error: 'No publicUrl provided' }, { status: 400 });
        }

        // Insert record into Database (file is already uploaded to Supabase Storage by the client)
        console.log('Inserting record into Database...', { name, publicUrl });
        const { data: bookletData, error: dbError } = await supabase
            .from('booklets')
            .insert([
                {
                    name: name || 'Без названия',
                    pdf_url: publicUrl,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Supabase Database Error:', dbError);
            return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 });
        }

        return NextResponse.json(bookletData);
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

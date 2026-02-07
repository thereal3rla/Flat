import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const name = formData.get('name') as string || file.name;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 1. Upload to Supabase Storage
        const fileName = `${Date.now()}-${file.name}`;
        console.log('Uploading file to Supabase:', fileName);
        const { data: storageData, error: storageError } = await supabase.storage
            .from('booklets')
            .upload(fileName, file);

        if (storageError) {
            console.error('Supabase Storage Error:', storageError);
            return NextResponse.json({ error: `Storage error: ${storageError.message}` }, { status: 500 });
        }

        console.log('File uploaded successfully, getting public URL...');
        const { data: { publicUrl } } = supabase.storage
            .from('booklets')
            .getPublicUrl(fileName);

        // 2. Insert record into Database
        console.log('Inserting record into Database...', { name, publicUrl });
        const { data: bookletData, error: dbError } = await supabase
            .from('booklets')
            .insert([
                {
                    name,
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

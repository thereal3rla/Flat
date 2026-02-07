import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking Supabase connection...');
    console.log('URL:', supabaseUrl);

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    console.log('Buckets found:', buckets.map(b => b.name));

    const bookletBucket = buckets.find(b => b.name === 'booklets');
    if (bookletBucket) {
        console.log('Bucket "booklets" exists.');
    } else {
        console.error('Bucket "booklets" does NOT exist. Please create it in Supabase dashboard.');
    }

    const { data: tables, error: dbError } = await supabase.from('booklets').select('*').limit(1);
    if (dbError) {
        console.error('Error selecting from "booklets" table:', dbError.message);
    } else {
        console.log('Table "booklets" exists and is accessible.');
    }
}

check();

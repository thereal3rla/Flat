-- Create the booklets table
create table if not exists booklets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  pdf_url text not null,
  analysis_info jsonb,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on table
alter table booklets enable row level security;

-- Allow public read access to table
create policy "Allow public read access" on booklets
  for select using (true);

-- Allow public insert access to table
create policy "Allow public insert access" on booklets
  for insert with check (true);

-- Allow public update access to table
create policy "Allow public update access" on booklets
  for update using (true);

-- --- STORAGE POLICIES ---
-- These policies allow public access to the 'booklets' bucket.
-- Run these if you are getting "new row violates row-level security policy" errors.

-- 1. Give users access to upload files to the 'booklets' bucket
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'booklets' );

-- 2. Give users access to update their own files in the 'booklets' bucket
create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'booklets' );

-- 3. Give users access to view files in the 'booklets' bucket
create policy "Public View"
on storage.objects for select
using ( bucket_id = 'booklets' );

-- ============================================================
-- Product features detected by AI in each booklet
-- Run this AFTER schema.sql (depends on booklets table)
-- ============================================================

create table if not exists booklet_features (
  id            uuid default gen_random_uuid() primary key,
  booklet_id    uuid not null references booklets(id) on delete cascade,
  section       text not null,        -- Раздел (ДОМ, Двор, ...)
  subsection    text not null,        -- Подраздел (Квартира предчистовая, МАФ-ы, ...)
  feature_name  text not null,        -- Продуктовая фича (Радиаторы, Окна, ...)
  sub_component text,                 -- Суб-компонент (Профиль окна, Стекла, ...)
  is_product_feature boolean default false,  -- Прод фича (да/нет)
  in_cost       boolean default false,       -- Себестоимость в УСП
  tag           text,                 -- Тегирование (Функциональность, Безопасность, ...)
  dimensions    text,                 -- Габариты
  material      text,                 -- Материал
  brand         text,                 -- Бренд
  extra_info    text,                 -- Доп характеристики
  found_in_booklet boolean default false,    -- Найдено AI в буклете
  ai_confidence numeric(3,2) default 0,      -- Уверенность AI (0.00 – 1.00)
  ai_notes      text,                 -- Заметки AI
  created_at    timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prevent duplicate rows on re-analysis (expression index handles NULL sub_component)
create unique index if not exists uq_booklet_features
  on booklet_features (booklet_id, section, subsection, feature_name, coalesce(sub_component, ''));

-- Index for fast lookups by booklet
create index if not exists idx_booklet_features_booklet_id on booklet_features(booklet_id);

-- Enable RLS
alter table booklet_features enable row level security;

-- Public policies (same pattern as booklets table)
create policy "Allow public read access" on booklet_features
  for select using (true);

create policy "Allow public insert access" on booklet_features
  for insert with check (true);

create policy "Allow public update access" on booklet_features
  for update using (true);

create policy "Allow public delete access" on booklet_features
  for delete using (true);

/*
# POLAR — India's Polar Science Platform Schema

## Overview
Creates the complete database schema for the POLAR platform, an integrated
polar science outreach, knowledge repository, expedition archive, media
dissemination and AI platform for India's polar research program.

## New Tables
1. `stations` — Research stations (Himadri, Maitri, Bharati)
2. `expeditions` — Polar expeditions linked to stations
3. `documents` — Knowledge repository items (reports, papers, datasets, etc.)
4. `media` — Photographs and videos from expeditions
5. `stories` — Public outreach editorial stories
6. `ai_content` — AI-generated content records
7. `admin_profiles` — Links auth users to admin profiles

## Security
- Public content tables (stations, expeditions, documents, media, stories, ai_content):
  SELECT open to anon + authenticated (public browsing)
  INSERT/UPDATE/DELETE restricted to authenticated (admin only)
- admin_profiles: authenticated only

## Notes
- Uses gen_random_uuid() for primary keys
- Timestamps default to now()
- Text arrays used for tags, research_areas, authors, institutions
- JSONB used for flexible metadata fields
*/

-- ============ STATIONS ============
CREATE TABLE IF NOT EXISTS stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  region text NOT NULL,
  location text NOT NULL,
  coordinates text,
  established_year int,
  description text,
  overview text,
  research_focus text[] DEFAULT '{}',
  image_url text,
  hero_image_url text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ============ EXPEDITIONS ============
CREATE TABLE IF NOT EXISTS expeditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  year int NOT NULL,
  region text NOT NULL,
  station_id uuid REFERENCES stations(id) ON DELETE SET NULL,
  expedition_number text,
  objectives text,
  research_areas text[] DEFAULT '{}',
  institutions text[] DEFAULT '{}',
  scientists text[] DEFAULT '{}',
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- ============ DOCUMENTS ============
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  type text NOT NULL,
  region text NOT NULL,
  year int,
  research_areas text[] DEFAULT '{}',
  description text,
  abstract text,
  authors text[] DEFAULT '{}',
  institution text,
  tags text[] DEFAULT '{}',
  source text,
  expedition_id uuid REFERENCES expeditions(id) ON DELETE SET NULL,
  station_id uuid REFERENCES stations(id) ON DELETE SET NULL,
  file_url text,
  pages int,
  doi text,
  created_at timestamptz DEFAULT now()
);

-- ============ MEDIA ============
CREATE TABLE IF NOT EXISTS media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'photograph',
  category text NOT NULL,
  station_id uuid REFERENCES stations(id) ON DELETE SET NULL,
  expedition_id uuid REFERENCES expeditions(id) ON DELETE SET NULL,
  region text,
  year int,
  description text,
  image_url text,
  video_url text,
  photographer text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- ============ STORIES ============
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  hero_image text,
  introduction text,
  sections jsonb DEFAULT '[]',
  related_expedition_id uuid REFERENCES expeditions(id) ON DELETE SET NULL,
  related_document_ids text[] DEFAULT '{}',
  related_media_ids text[] DEFAULT '{}',
  author text,
  published_date date,
  tags text[] DEFAULT '{}',
  reading_time int,
  created_at timestamptz DEFAULT now()
);

-- ============ AI CONTENT ============
CREATE TABLE IF NOT EXISTS ai_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE SET NULL,
  expedition_id uuid REFERENCES expeditions(id) ON DELETE SET NULL,
  content_type text NOT NULL,
  generated_text text,
  prompt text,
  created_at timestamptz DEFAULT now()
);

-- ============ ADMIN PROFILES ============
CREATE TABLE IF NOT EXISTS admin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_expeditions_station ON expeditions(station_id);
CREATE INDEX IF NOT EXISTS idx_expeditions_year ON expeditions(year);
CREATE INDEX IF NOT EXISTS idx_documents_expedition ON documents(expedition_id);
CREATE INDEX IF NOT EXISTS idx_documents_station ON documents(station_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_region ON documents(region);
CREATE INDEX IF NOT EXISTS idx_documents_year ON documents(year);
CREATE INDEX IF NOT EXISTS idx_media_station ON media(station_id);
CREATE INDEX IF NOT EXISTS idx_media_expedition ON media(expedition_id);
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);

-- ============ RLS: STATIONS ============
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_stations" ON stations;
CREATE POLICY "public_read_stations" ON stations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_stations" ON stations;
CREATE POLICY "admin_insert_stations" ON stations FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_stations" ON stations;
CREATE POLICY "admin_update_stations" ON stations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_stations" ON stations;
CREATE POLICY "admin_delete_stations" ON stations FOR DELETE TO authenticated USING (true);

-- ============ RLS: EXPEDITIONS ============
ALTER TABLE expeditions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_expeditions" ON expeditions;
CREATE POLICY "public_read_expeditions" ON expeditions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_expeditions" ON expeditions;
CREATE POLICY "admin_insert_expeditions" ON expeditions FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_expeditions" ON expeditions;
CREATE POLICY "admin_update_expeditions" ON expeditions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_expeditions" ON expeditions;
CREATE POLICY "admin_delete_expeditions" ON expeditions FOR DELETE TO authenticated USING (true);

-- ============ RLS: DOCUMENTS ============
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_documents" ON documents;
CREATE POLICY "public_read_documents" ON documents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_documents" ON documents;
CREATE POLICY "admin_insert_documents" ON documents FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_documents" ON documents;
CREATE POLICY "admin_update_documents" ON documents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_documents" ON documents;
CREATE POLICY "admin_delete_documents" ON documents FOR DELETE TO authenticated USING (true);

-- ============ RLS: MEDIA ============
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_media" ON media;
CREATE POLICY "public_read_media" ON media FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_media" ON media;
CREATE POLICY "admin_insert_media" ON media FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_media" ON media;
CREATE POLICY "admin_update_media" ON media FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_media" ON media;
CREATE POLICY "admin_delete_media" ON media FOR DELETE TO authenticated USING (true);

-- ============ RLS: STORIES ============
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_stories" ON stories;
CREATE POLICY "public_read_stories" ON stories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_stories" ON stories;
CREATE POLICY "admin_insert_stories" ON stories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_stories" ON stories;
CREATE POLICY "admin_update_stories" ON stories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_stories" ON stories;
CREATE POLICY "admin_delete_stories" ON stories FOR DELETE TO authenticated USING (true);

-- ============ RLS: AI CONTENT ============
ALTER TABLE ai_content ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_read_ai_content" ON ai_content;
CREATE POLICY "public_read_ai_content" ON ai_content FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_insert_ai_content" ON ai_content;
CREATE POLICY "admin_insert_ai_content" ON ai_content FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_update_ai_content" ON ai_content;
CREATE POLICY "admin_update_ai_content" ON ai_content FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_delete_ai_content" ON ai_content;
CREATE POLICY "admin_delete_ai_content" ON ai_content FOR DELETE TO authenticated USING (true);

-- ============ RLS: ADMIN PROFILES ============
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_read_own_profile" ON admin_profiles;
CREATE POLICY "admin_read_own_profile" ON admin_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_insert_own_profile" ON admin_profiles;
CREATE POLICY "admin_insert_own_profile" ON admin_profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "admin_update_own_profile" ON admin_profiles;
CREATE POLICY "admin_update_own_profile" ON admin_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
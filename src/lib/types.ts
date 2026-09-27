export type Station = {
  id: string;
  slug: string;
  name: string;
  region: string;
  location: string;
  coordinates: string;
  established_year: number;
  description: string;
  overview: string;
  research_focus: string[];
  image_url: string;
  hero_image_url: string;
  sort_order: number;
};

export type Expedition = {
  id: string;
  slug: string;
  title: string;
  year: number;
  region: string;
  station_id: string;
  station?: Station;
  expedition_number: string;
  objectives: string;
  research_areas: string[];
  institutions: string[];
  scientists: string[];
  description: string;
  image_url: string;
};

export type Document = {
  id: string;
  slug: string;
  title: string;
  type: string;
  region: string;
  year: number;
  research_areas: string[];
  description: string;
  abstract: string;
  authors: string[];
  institution: string;
  tags: string[];
  source: string;
  expedition_id: string;
  station_id: string;
  file_url: string;
  pages: number | null;
  doi: string | null;
};

export type Media = {
  id: string;
  slug: string;
  title: string;
  type: string;
  category: string;
  station_id: string;
  expedition_id: string;
  region: string;
  year: number;
  description: string;
  image_url: string;
  video_url: string;
  photographer: string;
  metadata: Record<string, unknown>;
};

export type Story = {
  id: string;
  slug: string;
  title: string;
  hero_image: string;
  introduction: string;
  sections: StorySection[];
  related_expedition_id: string;
  related_document_ids: string[];
  related_media_ids: string[];
  author: string;
  published_date: string;
  tags: string[];
  reading_time: number;
};

export type StorySection = {
  heading: string;
  body: string;
};

export type AIContent = {
  id: string;
  document_id: string;
  expedition_id: string;
  content_type: string;
  generated_text: string;
  prompt: string;
};

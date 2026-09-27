import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Station, Expedition, Document, Media, Story, AIContent } from './types';
import {
  MOCK_STATIONS,
  MOCK_EXPEDITIONS,
  MOCK_DOCUMENTS,
  MOCK_MEDIA,
  MOCK_STORIES
} from './mockData';

export function useStations() {
  const [data, setData] = useState<Station[]>(MOCK_STATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('stations')
          .select('*')
          .order('sort_order');
        if (error || !res || res.length === 0) {
          setData(MOCK_STATIONS);
        } else {
          setData(res as Station[]);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error fetching stations');
        setData(MOCK_STATIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

export function useStation(slug: string | undefined) {
  const [data, setData] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data: res } = await supabase
          .from('stations')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (res) {
          setData(res as Station);
        } else {
          const fallback = MOCK_STATIONS.find((s) => s.slug === slug) || null;
          setData(fallback);
        }
      } catch {
        const fallback = MOCK_STATIONS.find((s) => s.slug === slug) || null;
        setData(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { data, loading };
}

export function useExpeditions() {
  const [data, setData] = useState<Expedition[]>(MOCK_EXPEDITIONS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('expeditions')
          .select('*, station:stations(*)')
          .order('year', { ascending: false });
        if (error || !res || res.length === 0) {
          setData(MOCK_EXPEDITIONS);
        } else {
          setData(res as Expedition[]);
        }
      } catch {
        setData(MOCK_EXPEDITIONS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

export function useExpedition(slug: string | undefined) {
  const [data, setData] = useState<Expedition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data: res } = await supabase
          .from('expeditions')
          .select('*, station:stations(*)')
          .eq('slug', slug)
          .maybeSingle();
        if (res) {
          setData(res as Expedition);
        } else {
          const fallback = MOCK_EXPEDITIONS.find((e) => e.slug === slug) || null;
          setData(fallback);
        }
      } catch {
        const fallback = MOCK_EXPEDITIONS.find((e) => e.slug === slug) || null;
        setData(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { data, loading };
}

export function useDocuments() {
  const [data, setData] = useState<Document[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('documents')
          .select('*')
          .order('year', { ascending: false });
        if (error || !res || res.length === 0) {
          setData(MOCK_DOCUMENTS);
        } else {
          setData(res as Document[]);
        }
      } catch {
        setData(MOCK_DOCUMENTS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

export function useDocument(slug: string | undefined) {
  const [data, setData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data: res } = await supabase
          .from('documents')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (res) {
          setData(res as Document);
        } else {
          const fallback = MOCK_DOCUMENTS.find((d) => d.slug === slug) || null;
          setData(fallback);
        }
      } catch {
        const fallback = MOCK_DOCUMENTS.find((d) => d.slug === slug) || null;
        setData(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { data, loading };
}

export function useMedia() {
  const [data, setData] = useState<Media[]>(MOCK_MEDIA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('media')
          .select('*')
          .order('year', { ascending: false });
        if (error || !res || res.length === 0) {
          setData(MOCK_MEDIA);
        } else {
          setData(res as Media[]);
        }
      } catch {
        setData(MOCK_MEDIA);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

export function useStories() {
  const [data, setData] = useState<Story[]>(MOCK_STORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('stories')
          .select('*')
          .order('published_date', { ascending: false });
        if (error || !res || res.length === 0) {
          setData(MOCK_STORIES);
        } else {
          setData(res as Story[]);
        }
      } catch {
        setData(MOCK_STORIES);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

export function useStory(slug: string | undefined) {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const { data: res } = await supabase
          .from('stories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        if (res) {
          setData(res as Story);
        } else {
          const fallback = MOCK_STORIES.find((s) => s.slug === slug) || null;
          setData(fallback);
        }
      } catch {
        const fallback = MOCK_STORIES.find((s) => s.slug === slug) || null;
        setData(fallback);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return { data, loading };
}

export function useAIContent() {
  const [data, setData] = useState<AIContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: res, error } = await supabase
          .from('ai_content')
          .select('*')
          .order('created_at', { ascending: false });
        if (error || !res) {
          setData([]);
        } else {
          setData(res as AIContent[]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}

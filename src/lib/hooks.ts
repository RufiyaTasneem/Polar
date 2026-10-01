import { useEffect, useState } from 'react';

import type {
  Station,
  Expedition,
  Document,
  Media,
  Story,
  AIContent
} from './types';

import {
  MOCK_STATIONS,
  MOCK_EXPEDITIONS,
  MOCK_DOCUMENTS,
  MOCK_MEDIA,
  MOCK_STORIES
} from './mockData';

import { supabase } from './supabase';

/* =========================================================
   STATIONS
   ========================================================= */

export function useStations() {
  const [data, setData] = useState<Station[]>(MOCK_STATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStations() {
      setLoading(true);
      setError(null);

      const { data: stations, error } = await supabase
        .from('stations')
        .select('*')
        .order('sort_order', { ascending: true });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching stations:', error);
        setError(error.message);

        // Keep mock data as fallback
        setData(MOCK_STATIONS);
      } else {
        setData(stations || []);
      }

      setLoading(false);
    }

    fetchStations();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}


/* =========================================================
   SINGLE STATION
   ========================================================= */

export function useStation(slug: string | undefined) {
  const [data, setData] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStation() {
      if (!slug) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: station, error } = await supabase
        .from('stations')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error('Error fetching station:', error);
        setError(error.message);

        // Fallback to mock data
        const mockStation =
          MOCK_STATIONS.find((s) => s.slug === slug) || null;

        setData(mockStation);
      } else {
        setData(station);
      }

      setLoading(false);
    }

    fetchStation();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { data, loading, error };
}


/* =========================================================
   EXPEDITIONS
   ========================================================= */

export function useExpeditions() {
  const [data, setData] = useState<Expedition[]>(MOCK_EXPEDITIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchExpeditions() {
      setLoading(true);
      setError(null);

      const { data: expeditions, error } = await supabase
        .from('expeditions')
        .select('*')
        .order('year', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching expeditions:', error);
        setError(error.message);

        // Fallback
        setData(MOCK_EXPEDITIONS);
      } else {
        setData(expeditions || []);
      }

      setLoading(false);
    }

    fetchExpeditions();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}


/* =========================================================
   SINGLE EXPEDITION
   ========================================================= */

export function useExpedition(slug: string | undefined) {
  const [data, setData] = useState<Expedition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchExpedition() {
      if (!slug) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: expedition, error } = await supabase
        .from('expeditions')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error('Error fetching expedition:', error);
        setError(error.message);

        // Fallback
        const mockExpedition =
          MOCK_EXPEDITIONS.find((e) => e.slug === slug) || null;

        setData(mockExpedition);
      } else {
        setData(expedition);
      }

      setLoading(false);
    }

    fetchExpedition();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { data, loading, error };
}


/* =========================================================
   DOCUMENTS
   ========================================================= */

export function useDocuments() {
  const [data, setData] = useState<Document[]>(MOCK_DOCUMENTS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDocuments() {
      setLoading(true);
      setError(null);

      const { data: documents, error } = await supabase
        .from('documents')
        .select('*')
        .order('year', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching documents:', error);
        setError(error.message);

        // Fallback
        setData(MOCK_DOCUMENTS);
      } else {
        setData(documents || []);
      }

      setLoading(false);
    }

    fetchDocuments();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}


/* =========================================================
   SINGLE DOCUMENT
   ========================================================= */

export function useDocument(slug: string | undefined) {
  const [data, setData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchDocument() {
      if (!slug) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: document, error } = await supabase
        .from('documents')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error('Error fetching document:', error);
        setError(error.message);

        // Fallback
        const mockDocument =
          MOCK_DOCUMENTS.find((d) => d.slug === slug) || null;

        setData(mockDocument);
      } else {
        setData(document);
      }

      setLoading(false);
    }

    fetchDocument();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { data, loading, error };
}


/* =========================================================
   MEDIA
   ========================================================= */

export function useMedia() {
  const [data, setData] = useState<Media[]>(MOCK_MEDIA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchMedia() {
      setLoading(true);
      setError(null);

      const { data: media, error } = await supabase
        .from('media')
        .select('*')
        .order('year', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching media:', error);
        setError(error.message);

        // Fallback
        setData(MOCK_MEDIA);
      } else if (!media?.length) {
        setData(MOCK_MEDIA);
      } else {
        setData(media);
      }

      setLoading(false);
    }

    fetchMedia();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}


/* =========================================================
   STORIES
   ========================================================= */

export function useStories() {
  const [data, setData] = useState<Story[]>(MOCK_STORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStories() {
      setLoading(true);
      setError(null);

      const { data: stories, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching stories:', error);
        setError(error.message);

        // Fallback
        setData(MOCK_STORIES);
      } else {
        setData(stories || []);
      }

      setLoading(false);
    }

    fetchStories();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}


/* =========================================================
   SINGLE STORY
   ========================================================= */

export function useStory(slug: string | undefined) {
  const [data, setData] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchStory() {
      if (!slug) {
        setData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: story, error } = await supabase
        .from('stories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error('Error fetching story:', error);
        setError(error.message);

        // Fallback
        const mockStory =
          MOCK_STORIES.find((s) => s.slug === slug) || null;

        setData(mockStory);
      } else {
        setData(story);
      }

      setLoading(false);
    }

    fetchStory();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { data, loading, error };
}


/* =========================================================
   AI CONTENT
   ========================================================= */

export function useAIContent() {
  const [data, setData] = useState<AIContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchAIContent() {
      setLoading(true);
      setError(null);

      const { data: aiContent, error } = await supabase
        .from('ai_content')
        .select('*')
        .order('created_at', { ascending: false });

      if (!mounted) return;

      if (error) {
        console.error('Error fetching AI content:', error);
        setError(error.message);

        // AI content doesn't have mock data currently
        setData([]);
      } else {
        setData(aiContent || []);
      }

      setLoading(false);
    }

    fetchAIContent();

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
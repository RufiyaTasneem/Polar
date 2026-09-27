import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  MOCK_STATIONS,
  MOCK_EXPEDITIONS,
  MOCK_DOCUMENTS,
  MOCK_MEDIA,
  MOCK_STORIES
} from '@/lib/mockData';

const TABLES = ['stations', 'expeditions', 'documents', 'media', 'stories'] as const;
type Table = (typeof TABLES)[number];

const INITIAL_MOCK_MAP: Record<Table, Record<string, unknown>[]> = {
  stations: MOCK_STATIONS as unknown as Record<string, unknown>[],
  expeditions: MOCK_EXPEDITIONS as unknown as Record<string, unknown>[],
  documents: MOCK_DOCUMENTS as unknown as Record<string, unknown>[],
  media: MOCK_MEDIA as unknown as Record<string, unknown>[],
  stories: MOCK_STORIES as unknown as Record<string, unknown>[],
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [table, setTable] = useState<Table>('stations');
  const [rowsMap, setRowsMap] = useState<Record<Table, Record<string, unknown>[]>>(INITIAL_MOCK_MAP);
  const [busy, setBusy] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const isDemo = localStorage.getItem('polar_admin_demo_session') === 'true';
      if (!data.session && !isDemo) {
        navigate('/admin/login', { replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    loadTableData();
  }, [table]);

  async function loadTableData() {
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data && data.length > 0) {
        setRowsMap((prev) => ({ ...prev, [table]: data as Record<string, unknown>[] }));
      }
    } catch {
      // Retain mock map
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    localStorage.removeItem('polar_admin_demo_session');
    await supabase.auth.signOut();
    navigate('/admin/login', { replace: true });
  }

  async function addRecord() {
    if (!form.name.trim() || !form.slug.trim()) return;

    const newRecord: Record<string, unknown> = {
      id: `custom-${Date.now()}`,
      slug: form.slug.trim(),
      description: form.description.trim(),
      created_at: new Date().toISOString(),
    };

    if (table === 'stations') {
      Object.assign(newRecord, {
        name: form.name.trim(),
        region: 'Arctic',
        location: 'Polar Region',
        sort_order: 0,
        established_year: new Date().getFullYear(),
      });
    } else if (table === 'stories') {
      Object.assign(newRecord, {
        title: form.name.trim(),
        hero_image: 'https://images.pexels.com/photos/1663376/pexels-photo-1663376.jpeg?auto=compress&cs=tinysrgb&w=1920',
        introduction: form.description.trim(),
        sections: [],
      });
    } else {
      Object.assign(newRecord, {
        title: form.name.trim(),
        year: new Date().getFullYear(),
      });
    }

    // Try Supabase insert first
    try {
      const { error } = await supabase.from(table).insert(newRecord);
      if (error) {
        // Local state fallback for demo
        setRowsMap((prev) => ({
          ...prev,
          [table]: [newRecord, ...prev[table]],
        }));
      } else {
        loadTableData();
      }
    } catch {
      setRowsMap((prev) => ({
        ...prev,
        [table]: [newRecord, ...prev[table]],
      }));
    }

    setForm({ name: '', slug: '', description: '' });
    setStatusMsg(`Record "${newRecord.title || newRecord.name}" added successfully.`);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  async function removeRecord(id: unknown) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      await supabase.from(table).delete().eq('id', id);
    } catch {
      // Ignore error
    }

    setRowsMap((prev) => ({
      ...prev,
      [table]: prev[table].filter((r) => r.id !== id),
    }));
  }

  const currentRows = rowsMap[table] || [];

  return (
    <main className="min-h-screen bg-[#080B0F]/85 backdrop-blur-[2px] relative z-10 text-[#F4F5F2] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="font-mono text-xs tracking-[0.3em] text-[#8FD8E8] mb-3">POLAR / ADMIN DASHBOARD</p>
            <h1 className="font-display font-bold text-4xl md:text-5xl tracking-tight">Content Control Panel</h1>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-xs font-mono tracking-widest text-[#9BA6B2] hover:text-[#8FD8E8] transition-colors">
              VIEW PUBLIC SITE →
            </Link>
            <button
              onClick={signOut}
              className="text-xs font-mono tracking-widest text-[#9BA6B2] hover:text-red-400 transition-colors inline-flex items-center gap-2"
            >
              SIGN OUT <LogOut size={14} />
            </button>
          </div>
        </header>

        {statusMsg && (
          <div className="mt-4 p-4 bg-[#8FD8E8]/10 border border-[#8FD8E8] text-[#8FD8E8] font-mono text-xs flex items-center gap-2">
            <CheckCircle2 size={16} /> {statusMsg}
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto py-6 border-b border-white/10">
          {TABLES.map((t) => (
            <button
              key={t}
              onClick={() => setTable(t)}
              className={`px-5 py-2.5 text-xs font-mono tracking-widest whitespace-nowrap transition-colors ${
                table === t ? 'bg-[#8FD8E8] text-[#080B0F] font-semibold' : 'text-[#9BA6B2] border border-white/10 hover:text-[#F4F5F2]'
              }`}
            >
              {t.toUpperCase()} ({rowsMap[t]?.length || 0})
            </button>
          ))}
        </div>

        <section className="grid lg:grid-cols-[340px_1fr] gap-10 pt-8">
          <aside className="border border-white/10 p-6 bg-[#11161C]/50 h-fit">
            <p className="font-mono text-xs tracking-widest text-[#8FD8E8] mb-6">QUICK ADD TO {table.toUpperCase()}</p>
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-[#9BA6B2] mb-1">TITLE / NAME</label>
                <input
                  className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 focus:outline-none focus:border-[#8FD8E8]"
                  placeholder="e.g. Arctic Atmosphere Study"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9BA6B2] mb-1">URL SLUG</label>
                <input
                  className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 focus:outline-none focus:border-[#8FD8E8]"
                  placeholder="e.g. arctic-atmosphere-study"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#9BA6B2] mb-1">DESCRIPTION</label>
                <textarea
                  className="w-full bg-[#080B0F] border border-white/15 text-[#F4F5F2] text-sm p-3 min-h-24 resize-y focus:outline-none focus:border-[#8FD8E8]"
                  placeholder="Brief summary or abstract..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <button
                onClick={addRecord}
                disabled={!form.name.trim() || !form.slug.trim()}
                className="w-full py-3 bg-[#8FD8E8] text-[#080B0F] text-xs font-mono tracking-widest inline-flex justify-center items-center gap-2 disabled:opacity-40 hover:bg-[#8FD8E8]/90 transition-colors"
              >
                ADD RECORD <Plus size={14} />
              </button>
            </div>
          </aside>

          <section>
            {busy ? (
              <p className="font-mono text-xs text-[#9BA6B2] animate-pulse">LOADING RECORDS...</p>
            ) : currentRows.length === 0 ? (
              <p className="text-[#9BA6B2] font-mono text-sm">No records found in table "{table}".</p>
            ) : (
              <div className="space-y-3">
                {currentRows.map((row) => (
                  <div
                    key={String(row.id)}
                    className="border border-white/10 bg-[#11161C]/30 p-5 flex items-center justify-between gap-4 hover:border-white/20 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-display text-[#F4F5F2] truncate">
                        {String(row.title ?? row.name ?? row.slug ?? 'Untitled Record')}
                      </p>
                      <p className="font-mono text-xs text-[#9BA6B2]/70 mt-1 truncate">
                        Slug: {String(row.slug ?? row.id)} {row.region ? `· ${row.region}` : ''} {row.year ? `· ${row.year}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => removeRecord(row.id)}
                      className="text-[#9BA6B2] hover:text-red-400 p-2 transition-colors"
                      title="Delete Record"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type Platform = "Instagram" | "TikTok" | "LinkedIn" | "X" | "YouTube";
type Status = "Idea" | "Drafted" | "Scheduled" | "Published";

type PostIdea = {
  id: string;
  title: string;
  platform: Platform;
  status: Status;
  date: string;
  notes: string;
};

type PostForm = Omit<PostIdea, "id">;

const platforms: Platform[] = ["Instagram", "TikTok", "LinkedIn", "X", "YouTube"];
const statuses: Status[] = ["Idea", "Drafted", "Scheduled", "Published"];
const storageKey = "content-planner-posts";

function createInitialForm(): PostForm {
  return {
    title: "",
    platform: "Instagram",
    status: "Idea",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  };
}

const samplePosts: PostIdea[] = [
  {
    id: "sample-1",
    title: "Launch week carousel",
    platform: "Instagram",
    status: "Scheduled",
    date: "2026-05-20",
    notes: "Highlight three customer outcomes and add a soft CTA.",
  },
  {
    id: "sample-2",
    title: "Founder story clip",
    platform: "TikTok",
    status: "Drafted",
    date: "2026-05-22",
    notes: "Keep it under 30 seconds with captions and a strong hook.",
  },
  {
    id: "sample-3",
    title: "Monthly metrics recap",
    platform: "LinkedIn",
    status: "Published",
    date: "2026-05-14",
    notes: "Share lessons learned and tag the product team.",
  },
];

const statusStyles: Record<Status, string> = {
  Idea: "bg-slate-100 text-slate-700 ring-slate-200",
  Drafted: "bg-amber-100 text-amber-800 ring-amber-200",
  Scheduled: "bg-indigo-100 text-indigo-800 ring-indigo-200",
  Published: "bg-emerald-100 text-emerald-800 ring-emerald-200",
};

export default function Home() {
  const [posts, setPosts] = useState<PostIdea[]>([]);
  const [form, setForm] = useState<PostForm>(() => createInitialForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<"All" | Platform>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | Status>("All");
  const [query, setQuery] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedPosts = window.localStorage.getItem(storageKey);
      setPosts(storedPosts ? (JSON.parse(storedPosts) as PostIdea[]) : samplePosts);
    } catch {
      setPosts(samplePosts);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch {
      // Keep the planner usable even when storage is unavailable or full.
    }
  }, [isHydrated, posts]);

  const stats = useMemo(
    () => [
      { label: "Total ideas", value: posts.length },
      { label: "Drafted", value: posts.filter((post) => post.status === "Drafted").length },
      { label: "Published", value: posts.filter((post) => post.status === "Published").length },
      { label: "Scheduled", value: posts.filter((post) => post.status === "Scheduled").length },
    ],
    [posts],
  );

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return posts
      .filter((post) => platformFilter === "All" || post.platform === platformFilter)
      .filter((post) => statusFilter === "All" || post.status === statusFilter)
      .filter((post) => {
        if (!normalizedQuery) {
          return true;
        }

        return `${post.title} ${post.notes}`.toLowerCase().includes(normalizedQuery);
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [platformFilter, posts, query, statusFilter]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      return;
    }

    if (editingId) {
      setPosts((currentPosts) =>
        currentPosts.map((post) => (post.id === editingId ? { ...form, id: editingId, title: form.title.trim() } : post)),
      );
      setEditingId(null);
    } else {
      setPosts((currentPosts) => [
        { ...form, id: crypto.randomUUID(), title: form.title.trim() },
        ...currentPosts,
      ]);
    }

    setForm(createInitialForm());
  }

  function startEditing(post: PostIdea) {
    setEditingId(post.id);
    setForm({ title: post.title, platform: post.platform, status: post.status, date: post.date, notes: post.notes });
  }

  function deletePost(id: string) {
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(createInitialForm());
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(createInitialForm());
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-soft sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-indigo-100 ring-1 ring-white/15">
              Social content command center
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Content Planner</h1>
            <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
              Capture ideas, schedule posts, and keep every platform moving with a lightweight planner that stays in your browser.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
            <p className="text-sm text-slate-300">Next post</p>
            <p className="mt-1 text-2xl font-semibold">{filteredPosts[0]?.date ?? "No date set"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{stat.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">{editingId ? "Edit idea" : "Add new idea"}</h2>
              <p className="mt-1 text-sm text-slate-500">Plan title, platform, status, date, and notes.</p>
            </div>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-full px-3 py-1 text-sm font-semibold text-slate-500 hover:bg-slate-100">
                Cancel
              </button>
            )}
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                required
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="e.g. Behind-the-scenes reel"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Platform</span>
                <select
                  value={form.platform}
                  onChange={(event) => setForm({ ...form, platform: event.target.value as Platform })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
                >
                  {platforms.map((platform) => (
                    <option key={platform}>{platform}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as Status })}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                placeholder="Add creative angle, hook, hashtags, or assets needed."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              />
            </label>
          </div>

          <button type="submit" className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500">
            {editingId ? "Save changes" : "Add post idea"}
          </button>
        </form>

        <section className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-slate-200/70 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Planned posts</h2>
              <p className="mt-1 text-sm text-slate-500">Filter, search, edit, or remove upcoming content.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[36rem]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search title or notes"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              />
              <select
                value={platformFilter}
                onChange={(event) => setPlatformFilter(event.target.value as "All" | Platform)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              >
                <option>All</option>
                {platforms.map((platform) => (
                  <option key={platform}>{platform}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as "All" | Status)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 transition focus:border-indigo-400 focus:bg-white"
              >
                <option>All</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{post.platform}</span>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[post.status]}`}>{post.status}</span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{post.date}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-bold text-slate-950">{post.title}</h3>
                      {post.notes && <p className="mt-2 text-sm leading-6 text-slate-600">{post.notes}</p>}
                    </div>
                    <div className="flex gap-2 sm:flex-col">
                      <button type="button" onClick={() => startEditing(post)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-indigo-700 ring-1 ring-indigo-100 transition hover:bg-indigo-50">
                        Edit
                      </button>
                      <button type="button" onClick={() => deletePost(post.id)} className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-rose-700 ring-1 ring-rose-100 transition hover:bg-rose-50">
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                <h3 className="text-lg font-bold text-slate-950">No posts found</h3>
                <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or add a new content idea.</p>
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

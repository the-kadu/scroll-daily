"use client";

import { useEffect, useState } from "react";

const DEFAULT_GUIDE = `PERSONA: A wise Tavern Guildmaster translating modern corporate, tech, and business news into RPG quests, patch notes, and tavern rumors. Treat market shifts like world events, industry leaders like raid bosses, and career tips like stat buffs.

TARGET AUDIENCE: Tech and business professionals on LinkedIn and X who love gaming and fantasy lore.

KEY CHANNEL: LinkedIn (also works on X).

TONE: Witty, insightful, epic, yet practical.

FORMAT & LENGTH: Short-form social post, 150-250 words. Start with a punchy hook headline. Include bulleted "quest objectives" or "stat buffs". End with a clear Call to Action (CTA) asking followers to share their strategy in the comments.

GOALS: Grow a following by being the daily voice that makes business news fun and useful.

VISUAL MOOD & COLORS: 16-bit pixel art tavern aesthetic. Colors #F4EBD0 (parchment), #12130F (obsidian), #3A86FF (mana blue).`;

const EXAMPLES = [
  "A major tech company announces layoffs of 10% of its workforce while posting record profits.",
  "Remote work vs. return-to-office: more companies are requiring 4 days a week in the office.",
  "A tip for new managers: how to give feedback people actually act on.",
];

const CHANNELS: { name: string; limit: number | null }[] = [
  { name: "LinkedIn", limit: 3000 },
  { name: "X", limit: 280 },
  { name: "Facebook", limit: null },
];

const KEYS = {
  guide: "scroll_guide",
  drafts: "scroll_drafts",
  history: "scroll_guide_history",
};

type Draft = { id: string; topic: string; date: string; text: string };
type Snapshot = { id: string; date: string; text: string };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function store(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function wordCount(s: string) {
  const t = s.trim();
  return t ? t.split(/\s+/).length : 0;
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const [guide, setGuide] = useState(DEFAULT_GUIDE);
  const [guideMsg, setGuideMsg] = useState("");
  const [topic, setTopic] = useState("");
  const [channel, setChannel] = useState("LinkedIn");
  const [post, setPost] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState("");
  const [tab, setTab] = useState<"drafts" | "history">("drafts");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [history, setHistory] = useState<Snapshot[]>([]);

  useEffect(() => {
    setGuide(load<string>(KEYS.guide, DEFAULT_GUIDE));
    setDrafts(load<Draft[]>(KEYS.drafts, []));
    setHistory(load<Snapshot[]>(KEYS.history, []));
    setReady(true);
  }, []);

  const limit = CHANNELS.find((c) => c.name === channel)?.limit ?? null;
  const overLimit = limit !== null && post.length > limit;

  function saveGuide() {
    const snap: Snapshot = { id: String(Date.now()), date: new Date().toISOString(), text: guide };
    const next = [snap, ...history];
    setHistory(next);
    store(KEYS.history, next);
    store(KEYS.guide, guide);
    setGuideMsg("Codex saved at " + new Date().toLocaleTimeString() + ". A snapshot was added to the Vault.");
  }

  function resetGuide() {
    if (confirm("Replace the Codex text with the default? (Press Save to keep it.)")) {
      setGuide(DEFAULT_GUIDE);
    }
  }

  async function uploadGuide(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setGuide(await f.text());
    setGuideMsg("Loaded " + f.name + ". Press Save to keep it.");
    e.target.value = "";
  }

  async function cast() {
    setError("");
    setSaveMsg("");
    if (!topic.trim()) {
      setError("Give the scribe a topic first.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, guide, channel }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || "Something went wrong. Please try again.");
      setPost(j.post);
      if (typeof j.remaining === "number") setRemaining(j.remaining);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setLoading(false);
  }

  function onImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => setImage(String(rd.result));
    rd.readAsDataURL(f);
  }

  function saveDraft() {
    if (!post.trim()) return;
    const d: Draft = { id: String(Date.now()), topic, date: new Date().toISOString(), text: post };
    const next = [d, ...drafts];
    if (store(KEYS.drafts, next)) {
      setDrafts(next);
      setSaveMsg("Draft sealed in the Vault.");
    } else {
      setSaveMsg("The Vault is full. Delete old drafts and try again.");
    }
  }

  async function copyPost() {
    try {
      await navigator.clipboard.writeText(post);
      setSaveMsg("Copied! Paste it into " + channel + " and attach your picture there.");
    } catch {
      setSaveMsg("Couldn't copy automatically. Select the text and copy it by hand.");
    }
  }

  function deleteDraft(id: string) {
    const next = drafts.filter((d) => d.id !== id);
    setDrafts(next);
    store(KEYS.drafts, next);
  }

  function clearHistory() {
    if (confirm("Erase all Codex snapshots?")) {
      setHistory([]);
      store(KEYS.history, []);
    }
  }

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6 border-4 border-wood bg-obsidian p-4 text-center shadow-[6px_6px_0_0_#000]">
        <h1 className="font-pixel text-xl leading-8 text-parchment sm:text-3xl sm:leading-10">
          The Daily Scroll
        </h1>
        <p className="mt-2 font-pixel text-[10px] leading-4 text-mana">
          THE GUILDMASTER&apos;S TAVERN &middot; TODAY&apos;S NEWS, YOUR BRAND
        </p>
        <p className="mx-auto mt-3 max-w-2xl font-serif text-sm text-parchment">
          1) Set your brand voice in the Codex. 2) Drop in a topic or headline. 3) Cast the spell, tweak the post, and copy it to your feed. Free to use, no sign-up.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Guild Codex */}
        <section className="panel">
          <h2 className="mb-1 font-pixel text-xs leading-5 text-obsidian">⚔ The Guild Codex</h2>
          <p className="mb-2 text-sm text-wood">
            Your personal brand lens: voice, tone, audience, length, call to action. Edit it to make it yours.
          </p>
          <label className="label" htmlFor="guide">Brand guide</label>
          <textarea
            id="guide"
            className="field"
            rows={17}
            value={guide}
            onChange={(e) => setGuide(e.target.value)}
          />
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="pixel-btn" onClick={saveGuide}>Save Codex</button>
            <label className="pixel-btn-alt cursor-pointer">
              Upload .txt/.md
              <input type="file" accept=".txt,.md,text/plain" className="hidden" onChange={uploadGuide} />
            </label>
            <button className="pixel-btn-alt" onClick={resetGuide}>Reset</button>
          </div>
          {guideMsg && <p className="mt-2 text-sm text-wood">{guideMsg}</p>}
        </section>

        {/* Scribe a New Scroll */}
        <section className="panel">
          <h2 className="mb-3 font-pixel text-xs leading-5 text-obsidian">📜 Scribe a New Scroll</h2>

          <label className="label" htmlFor="channel">Where will you post it?</label>
          <select
            id="channel"
            className="field mb-3"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
          >
            {CHANNELS.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
                {c.limit ? ` (${c.limit} characters max)` : ""}
              </option>
            ))}
          </select>

          <label className="label" htmlFor="topic">Today&apos;s topic or news story</label>
          <textarea
            id="topic"
            className="field"
            rows={5}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Paste a headline, article excerpt, or general topic..."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="text-sm text-wood">Try:</span>
            {EXAMPLES.map((ex, i) => (
              <button key={i} className="pixel-btn-alt" onClick={() => setTopic(ex)}>
                Example {i + 1}
              </button>
            ))}
          </div>

          <button className="pixel-btn mt-4" onClick={cast} disabled={loading}>
            {loading ? "Casting..." : post ? "Cast Again" : "Cast Spell (Generate Post)"}
          </button>
          {remaining !== null && (
            <p className="mt-2 text-sm text-wood">
              {remaining} spell{remaining === 1 ? "" : "s"} left this hour.
            </p>
          )}
          {error && <p className="mt-2 font-bold text-red-800">{error}</p>}
        </section>

        {/* Output + image */}
        <section className="panel lg:col-span-2">
          <h2 className="mb-3 font-pixel text-xs leading-5 text-obsidian">🖋 The Finished Scroll</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <textarea
                className="field"
                rows={14}
                value={post}
                onChange={(e) => setPost(e.target.value)}
                placeholder="Your post appears here. Edit freely."
              />
              <p className={"mt-1 text-sm " + (overLimit ? "font-bold text-red-800" : "text-wood")}>
                {wordCount(post)} words &middot; {post.length}
                {limit ? ` / ${limit}` : ""} characters
                {overLimit ? ` — too long for ${channel}, trim it before posting` : ""}
              </p>
            </div>
            <div>
              <label className="label" htmlFor="img">Add a picture</label>
              <input id="img" type="file" accept="image/*" onChange={onImage} className="block w-full text-sm" />
              {image && (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="Upload preview" className="mt-3 w-full border-4 border-wood" />
                  <button className="pixel-btn-alt mt-2" onClick={() => setImage(null)}>
                    Remove picture
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="pixel-btn" onClick={saveDraft} disabled={!post.trim()}>
              Save Final Draft
            </button>
            <button className="pixel-btn-alt" onClick={copyPost} disabled={!post.trim()}>
              Copy Post
            </button>
          </div>
          {saveMsg && <p className="mt-2 text-sm text-wood">{saveMsg}</p>}
        </section>

        {/* The Vault */}
        <section className="panel lg:col-span-2">
          <h2 className="mb-1 font-pixel text-xs leading-5 text-obsidian">🗝 The Vault</h2>
          <p className="mb-3 text-sm text-wood">
            Stored only in this browser. Clearing browser data erases it, and it does not sync to other devices. Pictures are not saved.
          </p>
          <div className="mb-3 flex gap-2">
            <button className={tab === "drafts" ? "pixel-btn" : "pixel-btn-alt"} onClick={() => setTab("drafts")}>
              Saved Drafts ({drafts.length})
            </button>
            <button className={tab === "history" ? "pixel-btn" : "pixel-btn-alt"} onClick={() => setTab("history")}>
              Codex History ({history.length})
            </button>
          </div>

          {tab === "drafts" && (
            <div>
              {drafts.length === 0 && <p className="text-sm text-wood">No drafts sealed yet.</p>}
              {drafts.map((d) => (
                <article key={d.id} className="mb-3 border-2 border-wood bg-[#fbf5df] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-pixel text-[10px] leading-4 text-mana">
                      {new Date(d.date).toLocaleString()}
                    </span>
                    <span className="flex gap-2">
                      <button
                        className="pixel-btn-alt"
                        onClick={() => {
                          setPost(d.text);
                          setTopic(d.topic);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Load
                      </button>
                      <button className="pixel-btn-alt" onClick={() => deleteDraft(d.id)}>
                        Delete
                      </button>
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-bold">Topic: {d.topic || "(none)"}</p>
                  <pre className="mt-1 whitespace-pre-wrap font-serif text-sm">{d.text}</pre>
                </article>
              ))}
            </div>
          )}

          {tab === "history" && (
            <div>
              {history.length === 0 ? (
                <p className="text-sm text-wood">No Codex snapshots yet. Save the Codex to create one.</p>
              ) : (
                <button className="pixel-btn-alt mb-3" onClick={clearHistory}>
                  Clear history
                </button>
              )}
              {history.map((h) => (
                <article key={h.id} className="mb-3 border-2 border-wood bg-[#fbf5df] p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-pixel text-[10px] leading-4 text-mana">
                      {new Date(h.date).toLocaleString()}
                    </span>
                    <button
                      className="pixel-btn-alt"
                      onClick={() => {
                        setGuide(h.text);
                        setGuideMsg("Restored an old snapshot. Press Save to keep it.");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Restore
                    </button>
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap font-serif text-sm">{h.text}</pre>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

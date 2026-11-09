# PRD: The Daily Scroll (Daily Content Creator)

## Job to be done
"When I want to post something on LinkedIn or X today, help me turn a topic or news story into a post that already sounds like me, so I can tweak it and publish in a couple of minutes instead of staring at a blank page."

## Problem
Growing a following takes a fresh, on-brand post every day. Writing one from scratch is slow, and generic AI output sounds like everyone else's.

## Goal
Let anyone paste a topic or news story and get an editable short-form post written through their own "Personal Brand Lens" (an editable brand guide). Visual vibe: "The Guildmaster's Tavern," a 16-bit RPG menu meets a fantasy tavern notice board.

## Target users
Tech and business professionals on LinkedIn and X who love gaming and fantasy lore and want a consistent daily posting habit. The tool is free and open to anyone: no sign-up, no passcode.

## Default brand lens (the Guild Codex)
- **Persona:** A wise Tavern Guildmaster translating corporate, tech, and business news into RPG quests, patch notes, and tavern rumors. Market shifts are world events, leaders are raid bosses, career tips are stat buffs.
- **Audience:** Tech and business professionals who love gaming and fantasy lore.
- **Tone:** Witty, insightful, epic, yet practical.
- **Format and length:** 150-250 words, punchy hook headline, bulleted quest objectives or stat buffs, CTA asking followers to share their strategy in the comments.
- **Visual mood:** 16-bit pixel tavern; #F4EBD0, #12130F, #3A86FF.

## Functional requirements
1. **Guild Codex (brand guide):** prefilled text area; user edits, saves, uploads a .txt/.md, or resets to default.
2. **Scribe a New Scroll (generator):** pick the target channel (LinkedIn, X, Facebook), enter a topic (or click an example), press "Cast Spell (Generate Post)". Channel is passed to the model so X posts respect 280 characters.
3. **The Finished Scroll:** editable post with live word and character count against the channel limit (warns when over), "Cast Again", copy button, image upload with preview and remove, "Save Final Draft".
4. **The Vault (localStorage only):** Saved Drafts (topic, date/time, final text; load and delete) and Codex History (timestamped snapshot on every Codex save; restore).
5. **Server-side generation:** `/api/generate` calls the LLM provider from the server.

## Security and abuse protection (the app is public)
- API key read only from server env `LLM_API_KEY`; never in browser, localStorage, or GitHub.
- No passcode, so protection is limits: 5 generations per IP per hour (`PER_IP_LIMIT`) and a global daily cap of 200 (`DAILY_LIMIT`). When the cap is hit, users see a friendly message.
- Only same-origin requests are accepted by the API route.
- Input size limits (topic 4,000 chars, Codex 6,000 chars) and a 700-token output cap.
- Topic is passed as data inside tags, separate from system instructions; provider errors are logged server-side, not shown to users.
- Owner should set a monthly spend cap in the LLM provider dashboard as the final guardrail.

## Non-goals (this version)
Auto-posting, trending-topic discovery, email digests, server-side database, AI image generation, accounts, payments.

## Known limitations
- Vault is device/browser-only and is lost if browser data is cleared; pictures are not saved.
- Rate limits live in server memory, so they reset on cold starts and are per instance (best-effort). The daily cap and the provider spend cap are the backstop.
- A determined abuser could rotate IP addresses; the daily cap bounds the total cost.

## Acceptance tests
- Changing the Codex (different CTA or length) changes the output accordingly.
- Choosing X produces a post of 280 characters or less; the counter turns red if the user edits it past the limit.
- The 6th generation from one IP within an hour returns a friendly rate-limit message.
- Saving the Codex adds a history snapshot; saving a draft adds a vault entry; both survive a refresh.
- Image upload shows a preview next to the post and can be removed.
- No API key appears in page source, network responses, localStorage, or the repo.
- A direct call to `/api/generate` from another origin is rejected (403).
- Tested with: a tech earnings story, a layoffs headline, a general career topic, and a non-business topic.

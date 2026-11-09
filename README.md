# The Daily Scroll

Free, open-access tool built with Next.js (App Router) + Tailwind. It applies your editable brand guide ("Guild Codex") to a topic and drafts a post for LinkedIn, X, or Facebook.

## Run locally
```bash
npm install
cp .env.example .env.local   # then set LLM_API_KEY
npm run dev
```
Open http://localhost:3000.

## Deploy
1. Push the project to GitHub so `package.json` and `app/` are at the top level of the repo.
2. Vercel: Add New > Project > import the repo (Next.js is auto-detected; leave Root Directory empty).
3. Settings > Environment Variables: add `LLM_API_KEY` (Production). Optional: `LLM_PROVIDER` (`openai` if using OpenAI), `LLM_MODEL`, `PER_IP_LIMIT`, `DAILY_LIMIT`.
4. Settings > Deployment Protection: turn Vercel Authentication off so anyone can open the site.
5. Redeploy (variables apply only to new deployments).

## Protecting your key (the app is public)
- The key is read only in `app/api/generate/route.ts`.
- Default limits: 5 generations per IP per hour and 200 per day in total. Change them with `PER_IP_LIMIT` and `DAILY_LIMIT`.
- Limits are in server memory and reset on cold starts, so also set a monthly spend cap in your LLM provider dashboard.

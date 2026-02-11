# Deploy Workflow

## How updates reach the live site

1. **You make changes** locally
2. **You say**: "Commit to git" (or "Push to git", "Deploy updates")
3. **AI runs**: `git add .` → `git commit -m "..."` → `git push origin main`
4. **Vercel auto-deploys** — no extra step

The live URL updates within 1–2 minutes after each push.

---

## Quick reference

| You say | What happens |
|---------|--------------|
| "Commit to git" | Stage, commit, push — Vercel deploys automatically |
| "Push my changes" | Same as above |

---

## Manual commands (if needed)

```bash
git add .
git commit -m "Your message here"
git push origin main
```

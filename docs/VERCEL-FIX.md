# Fixing the failing Vercel deployments | إصلاح فشل النشر على Vercel

## Diagnosis (confirmed from the actual build log)

Deployment `dpl_FwmNyrcXYAEFobm7Tn19imWpsBSA` on project `desktop-tutorial-58zf` fails with:

```
Error: No Next.js version detected. Make sure your package.json has "next" in
either "dependencies" or "devDependencies". Also check your Root Directory
setting matches the directory of your package.json file.
```

That is a project-settings problem, not a code problem:

- The repository root is **Lahza**, a Vite app (no `next` dependency). Verified: it builds locally in under 3 seconds.
- **Thamin** (Next.js) lives in the `thamin/` subfolder and builds cleanly.
- Six Vercel projects are connected to this one repository with
  Framework Preset = Next.js and Root Directory = repository root, so every
  push fails in 6-10 seconds before any code runs.

هذه مشكلة إعدادات في لوحة Vercel وليست مشكلة في الكود: جذر المستودع تطبيق
Vite بينما المشاريع الفاشلة مضبوطة على إطار Next.js، وتطبيق ثمين (Next.js)
موجود في مجلد `thamin/`.

## The fix (2 minutes per project, dashboard only)

One Vercel project per app, each with the correct Root Directory:

| Keep one project for | Settings → General | Environment variables |
| --- | --- | --- |
| **Thamin ثمين** (rename `desktop-tutorial-58zf` to `thamin`) | Root Directory = `thamin` · Framework Preset = Next.js | `DATABASE_URL` (Supabase Postgres), `AUTH_SECRET`, optional: `AI_*`, `METAL_PRICE_API_KEY`, `SUPABASE_*`, `VAPID_*`, `NEXT_PUBLIC_SITE_URL` |
| **Lahza** (`desktop-tutorial`) | Root Directory = *(empty / repository root)* · Framework Preset = **Vite** | none required |
| **Wisal web** (if wanted) | Root Directory = `wisal-web` · Framework Preset = Other | none |

Then **delete the duplicate projects**: `1`, `vercel`, `desktop-tutorial-fz1m`,
and any other project pointing at this repository that is not in the table
above. Duplicates are why one push produces six failed builds.

ثم احذف المشاريع المكررة (`1` و`vercel` و`desktop-tutorial-fz1m` وأي مشروع
آخر يشير إلى هذا المستودع خارج الجدول أعلاه)؛ التكرار هو سبب ظهور ستة
أخطاء بناء عند كل دفعة.

## Before Thamin production goes live

1. In `thamin/prisma/schema.prisma` change `provider = "sqlite"` to
   `"postgresql"` and set `DATABASE_URL` to the Supabase connection string.
2. Run once from any machine:
   `cd thamin && npx prisma db push && npm run db:seed`
3. Redeploy. Sign in and change the seeded passwords from Settings.

## Steps done in the repository

- Verified the root Lahza build and the Thamin build both pass locally.
- Each app already ships its own `vercel.json`, so no code change is needed
  for the fix above.

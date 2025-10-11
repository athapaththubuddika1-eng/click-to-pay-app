# Ads Click Pay - Mini App (localStorage + Vercel serverless)

## Features
- Register / Login (localStorage)
- Dashboard, Earn (watch ad / captcha), Tasks, Referral, Withdraw, Profile
- Admin panel (approve/reject withdraw, add balance, manage tasks, ban/unban users)
- Telegram notifications via serverless function (set BOT_TOKEN & BOT_CHAT_ID)
- Mobile-first dark theme with simple animations & emojis
- Local DB (localStorage) — no Firebase

## Deploy
1. Create repo, paste files with structure.
2. Deploy to Vercel.
3. Set env vars:
   - BOT_TOKEN
   - BOT_CHAT_ID
   - ADMIN_EMAIL
   - ADMIN_PASS
4. Visit site.

## Notes
- Ad iframe may be blocked by some ad providers; if so change to open in same tab.
- For production, replace localStorage with secure backend and add authentication.

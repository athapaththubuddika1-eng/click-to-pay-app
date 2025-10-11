# Ads Click Pay - Mini App (Final)

## Features
- LocalStorage-based single-page files (HTML/CSS/JS)
- Register/Login/Profile/Dashboard/Earn/Tasks/Referral/Withdraw/Admin
- Watch ad (iframe) with 5s countdown; captcha+ad flow
- Tasks join/claim; Admin can add tasks
- Withdraw request -> Admin approve/reject; history updates; user balance adjusts
- Referral system: referral code + Telegram link; both sides get $0.005
- Telegram notifications via serverless `api/sendTelegram.js` (set BOT_TOKEN & BOT_CHAT_ID)
- Mobile-first dark theme, emojis, loading animations

## Deploy
1. Push files to GitHub repo.
2. Import repo into Vercel.
3. Set Environment Variables in Vercel:
   - BOT_TOKEN (telegram bot token)
   - BOT_CHAT_ID (chat id for notifications)
   - ADMIN_EMAIL (optional)
   - ADMIN_PASS (optional)
4. Deploy.

## Notes
- Uses localStorage as DB for demo. For production, swap to a real backend.
- Ad provider may block framing; if iframe blocked, modify to open in same tab (location.href).

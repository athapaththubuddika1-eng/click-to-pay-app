# Ads Click Pay - Mini App

## Setup (local / Vercel)
1. Copy files to project folder.
2. Deploy to Vercel as a static project (no build).
3. (Optional) Add env secrets on Vercel:
   - `adsclickpay_bot_token` (your telegram bot token)
   - `adsclickpay_chat_id` (admin chat id)
   - `adsclickpay_bot_username` (bot username w/o @)

For local testing you can set in browser console:
## Admin credentials (hidden)
- Email: `hasanbuddika1@gmail.com`
- Password: `Aabbcc.123`

**Note:** For production, never expose admin creds in client-side code. Use serverless endpoints.

## Features
- LocalStorage-based user DB
- Register / Login / Dashboard
- Referral code & link (Telegram bot link) + copy
- Earn: watch ads (open ad link, 5s countdown) + captcha simulate
- Tasks: admin adds tasks, tasks appear and user can join (open link) then claim reward once
- Withdraw: request withdraw, admin approve/reject; admin approval reduces user balance
- Telegram notify for new registrations, withdraw requests, withdraw approvals (if token/chat id set)
- Loading animations, mobile responsive, dark-theme look

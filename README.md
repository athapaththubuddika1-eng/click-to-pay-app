# Ads Click Pay — Mini App (final)

## Setup
1. Create Firebase project — enable Authentication (Email/Password) and Firestore (native mode).
2. In Firestore, allow test rules while developing:
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} { allow read, write: if true; }
     }
   }
3. Paste files into GitHub repo.
4. Deploy to Vercel (Import repo). In Vercel project settings, set Environment Variables:
   - BOT_TOKEN = <your telegram bot token>
   - CHAT_ID = <your chat id>
5. Visit the site (mobile / Telegram mini-app) and test.

## Admin
- Email: hasanbuddika1@gmail.com
- Password: Aabbcc.123

## Notes
- Production: tighten Firestore rules, move admin actions to secure Cloud Functions, server-side verification for ad views.

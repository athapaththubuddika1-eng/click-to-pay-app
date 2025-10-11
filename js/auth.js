// js/auth.js
import { db, ref, get, set } from './firebase.js';
import { safeEmail } from './main.js';

// Register function
export async function registerUser({ username, email, password, refCode }) {
  email = String(email).toLowerCase();
  const safe = safeEmail(email);
  const userRef = ref(db, `users/${safe}`);
  const snap = await get(userRef);
  // if you want to prevent duplicate emails, check snap.exists()
  const createdAt = new Date().toISOString();
  const code = safe.slice(0,6).toUpperCase();
  await set(userRef, {
    username, email, password,
    balance: 0,
    referrals: 0,
    referralCode: code,
    refBy: refCode || null,
    tonAddress: '',
    createdAt,
    banned: false
  });
  // handle referral bonus: award 0.005 to both sides if ref exists
  if (refCode) {
    // find owner by referralCode
    const usersSnap = await get(ref(db,'users'));
    if (usersSnap.exists()) {
      const users = usersSnap.val();
      for (const k in users) {
        if (users[k].referralCode === refCode) {
          const ownerRef = ref(db, `users/${k}`);
          const owner = users[k];
          const ownerBal = Number(owner.balance || 0) + 0.005;
          await set(ownerRef, { ...owner, balance: ownerBal, referrals: Number(owner.referrals||0)+1 });
          // add initial bonus to new user
          const newRef = ref(db, `users/${safe}`);
          const newSnap = await get(newRef);
          if (newSnap.exists()) {
            const newUser = newSnap.val();
            await set(newRef, { ...newUser, balance: Number(newUser.balance||0) + 0.005 });
          }
          break;
        }
      }
    }
  }
  // store login locally
  localStorage.setItem('userEmail', email);
}

// Login function
export async function loginUser({ email, password }) {
  email = String(email).toLowerCase();
  const safe = safeEmail(email);
  const snap = await get(ref(db, `users/${safe}`));
  if (!snap.exists()) throw new Error('Invalid email or password');
  const user = snap.val();
  if (user.password !== password) throw new Error('Invalid email or password');
  if (user.banned) throw new Error('Account suspended');
  localStorage.setItem('userEmail', email);
  return user;
}

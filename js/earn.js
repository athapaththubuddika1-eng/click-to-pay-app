document.addEventListener("DOMContentLoaded", () => {
  const captchaDisplay = document.getElementById("captcha");
  const input = document.getElementById("captchaInput");
  const message = document.getElementById("message");
  const submitBtn = document.getElementById("submitBtn");
  const reloadBtn = document.getElementById("reloadBtn");
  const noCaptchaBtn = document.getElementById("noCaptchaBtn");
  const backBtn = document.getElementById("backToDashboard");

  const user = JSON.parse(localStorage.getItem("loggedUser")) || null;
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  let captchaCode = "";

  const generateCaptcha = () => {
    captchaCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    captchaDisplay.textContent = captchaCode;
    message.textContent = "🕐 Waiting for captcha...";
  };

  reloadBtn.addEventListener("click", generateCaptcha);
  generateCaptcha();

  // Ad & reward values
  const AD_REWARD = 0.00015;
  const CAPTCHA_REWARD = 0.0002;
  const WATCH_TIME = 5000; // 5 seconds

  const updateBalance = (amount) => {
    user.balance = (user.balance || 0) + amount;
    localStorage.setItem("loggedUser", JSON.stringify(user));
    // ✅ update local database list (simulate backend)
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      users[index].balance = user.balance;
      localStorage.setItem("users", JSON.stringify(users));
    }
  };

  const openAdAndReward = (rewardAmount) => {
    message.textContent = "🕒 Opening ad... Please wait 5s.";
    const adLink = "https://t.me"; // example ad link (Telegram)
    window.open(adLink, "_blank");
    setTimeout(() => {
      updateBalance(rewardAmount);
      message.textContent = `✅ Reward added: $${rewardAmount.toFixed(5)}. Updated balance: $${user.balance.toFixed(5)}`;
    }, WATCH_TIME);
  };

  submitBtn.addEventListener("click", () => {
    if (input.value.toUpperCase() === captchaCode) {
      message.textContent = "✅ Captcha verified!";
      openAdAndReward(CAPTCHA_REWARD);
      generateCaptcha();
      input.value = "";
    } else {
      message.textContent = "❌ Invalid captcha. Try again!";
      generateCaptcha();
    }
  });

  noCaptchaBtn.addEventListener("click", () => {
    openAdAndReward(AD_REWARD);
  });

  backBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });
});

// --- Captcha Generator ---
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let captcha = "";
  for (let i = 0; i < 5; i++) {
    captcha += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  document.getElementById("captchaValue").innerText = captcha;
}

document.getElementById("reloadCaptcha").onclick = generateCaptcha;
generateCaptcha();

// --- Global values ---
const adLink = "https://www.effectivegatecpm.com/dnm2jrcaj?key=c73c264e4447410ce55eb32960238eaa";
const captchaReward = 0.0002;
const adReward = 0.00015;

document.getElementById("earnForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const userCaptcha = document.getElementById("captchaInput").value.trim();
  const realCaptcha = document.getElementById("captchaValue").innerText.trim();

  if (userCaptcha !== realCaptcha) {
    alert("❌ Wrong CAPTCHA! Try again.");
    generateCaptcha();
    return;
  }

  // Add captcha reward first
  let balance = parseFloat(localStorage.getItem("balance") || "0");
  balance += captchaReward;
  localStorage.setItem("balance", balance.toFixed(6));

  document.getElementById("watchBtn").disabled = true;
  document.getElementById("watchBtn").innerText = "⏳ Opening Ad in 5s...";

  let countdown = 5;
  const interval = setInterval(() => {
    countdown--;
    document.getElementById("watchBtn").innerText = `⏳ Opening in ${countdown}s...`;
    if (countdown <= 0) {
      clearInterval(interval);

      // Open ad link in Telegram mini-browser
      window.location.href = adLink;

      // Add ad reward after open
      let newBalance = parseFloat(localStorage.getItem("balance") || "0");
      newBalance += adReward;
      localStorage.setItem("balance", newBalance.toFixed(6));

      document.getElementById("watchBtn").innerText = "✅ Done! Earned $0.00035";
      document.getElementById("watchBtn").disabled = false;
      document.getElementById("captchaInput").value = "";
      generateCaptcha();
    }
  }, 1000);
});

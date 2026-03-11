export function showToast(msg, type = "success") {
  const toast = document.createElement("div");
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; padding: 12px 20px;
    border-radius: 8px; color: white; font-weight: 500; z-index: 9999;
    background: ${type === "error" ? "#e74c3c" : "#2ecc71"};
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    opacity: 0; transition: opacity 0.4s, transform 0.4s;
    transform: translateY(20px);
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  }, 100);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => toast.remove(), 500);
  }, 2800);
}
/* =========================
   UI / Page interactions
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for anchor links (except external + mailto + tel)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Reveal on scroll (data-reveal -> add class "revealed")
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (revealItems.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("revealed");
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((el) => io.observe(el));
  }

  // Footer year (optional)
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu toggle (optional)
  // Если у тебя другое id/классы — можно удалить этот блок.
  const burger = document.querySelector("[data-burger]");
  const nav = document.querySelector("[data-nav]");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      nav.classList.toggle("open");
      burger.classList.toggle("open");
    });
    // close menu on link click
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        burger.classList.remove("open");
      });
    });
  }

  /* =========================
     Form -> Backend (/lead)
     ========================= */

  const form = document.getElementById("leadForm");
  if (!form) return;

  // Toast (optional). Если у тебя есть элемент #toast — будет красиво.
  const toast = document.getElementById("toast");
  const showToast = (text) => {
    if (!toast) return alert(text);
    toast.textContent = text;
    toast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => (toast.hidden = true), 3500);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Берём значения по name=""
    const payload = {
      name: (form.elements["name"]?.value || "").trim(),
      contact: (form.elements["contact"]?.value || "").trim(),
      city: (form.elements["city"]?.value || "").trim(),
      message: (form.elements["message"]?.value || "").trim(),
    };

    // Мини-проверка на фронте
    if (!payload.name || !payload.contact) {
      showToast("❌ Заполни имя и контакт.");
      return;
    }

    try {
      const res = await fetch("/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Если сервер не вернул JSON — покажем понятную ошибку
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Сервер вернул не JSON: ${text.slice(0, 200)}`);
      }

      if (!res.ok || !data.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }

      showToast("✅ Готово. Заявка отправлена.");
      form.reset();
    } catch (err) {
      console.error("SEND ERROR:", err);
      showToast("❌ Ошибка отправки. Открой Console/Network.");
    }
  });
});
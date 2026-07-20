"use strict";

// Reading progress.
const progress = document.querySelector(".reading-progress span");

function updateReadingProgress() {
    const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = documentHeight > 0 ? window.scrollY / documentHeight : 0;
    progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
}

updateReadingProgress();
window.addEventListener("scroll", updateReadingProgress, { passive: true });
window.addEventListener("resize", updateReadingProgress);

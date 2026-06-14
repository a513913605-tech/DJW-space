(function () {
  const canUseCustomCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canUseCustomCursor || reduceMotion) return;

  const ring = document.createElement("div");
  ring.className = "custom-cursor";
  ring.setAttribute("aria-hidden", "true");
  ring.innerHTML = `
    <div class="custom-cursor__ring"></div>
    <div class="custom-cursor__label">OPEN</div>
  `;

  document.body.append(ring);
  document.documentElement.classList.add("has-custom-cursor");

  const interactiveSelector = [
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "[role='button']",
    ".card",
    ".work-card",
    ".intro-visual",
    ".music-control",
    ".chip",
    ".ghost-btn",
    ".contact-link",
    ".archive-link"
  ].join(",");
  const cardSelector = ".card, .work-card, .archive-link";
  const textSelector = ".material-title, h1, h2";

  let isVisible = false;
  let targetX = window.innerWidth * 0.5;
  let targetY = window.innerHeight * 0.5;
  let ringX = targetX;
  let ringY = targetY;
  let cursorFrame = null;

  function setActiveState(event) {
    const target = event.target;
    const interactive = target.closest?.(interactiveSelector);
    const card = target.closest?.(cardSelector);
    const text = target.closest?.(textSelector);

    ring.classList.toggle("is-interactive", Boolean(interactive));
    ring.classList.toggle("is-card", Boolean(card));
    ring.classList.toggle("is-text", Boolean(text && !card));
  }

  function showCursor() {
    if (isVisible) return;
    isVisible = true;
    document.documentElement.classList.add("is-custom-cursor-visible");
    ring.style.setProperty("--cursor-alpha", "1");
  }

  function hideCursor() {
    isVisible = false;
    document.documentElement.classList.remove("is-custom-cursor-visible");
    ring.classList.remove("is-interactive", "is-card", "is-text", "is-pressed");
    ring.style.setProperty("--cursor-alpha", "0");
  }

  function renderCursor() {
    ringX += (targetX - ringX) * 0.34;
    ringY += (targetY - ringY) * 0.34;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    cursorFrame = requestAnimationFrame(renderCursor);
  }

  function updatePointer(event) {
    targetX = event.clientX;
    targetY = event.clientY;
    showCursor();
    setActiveState(event);
  }

  ring.style.left = `${ringX}px`;
  ring.style.top = `${ringY}px`;
  cursorFrame = requestAnimationFrame(renderCursor);

  document.addEventListener("pointermove", updatePointer, { passive: true });
  document.addEventListener("mousemove", updatePointer, { passive: true });
  window.addEventListener("pointerdown", () => ring.classList.add("is-pressed"), { passive: true });
  window.addEventListener("pointerup", () => ring.classList.remove("is-pressed"), { passive: true });
  window.addEventListener("pointerleave", hideCursor);
  window.addEventListener("blur", hideCursor);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      hideCursor();
      if (cursorFrame) {
        cancelAnimationFrame(cursorFrame);
        cursorFrame = null;
      }
    } else if (!cursorFrame) {
      cursorFrame = requestAnimationFrame(renderCursor);
    }
  });
})();

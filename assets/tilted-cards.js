(function () {
  const canTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!canTilt || reduceMotion) return;

  const selectors = [
    ".card",
    ".ability__item",
    ".archive-link",
    ".contact-link",
    ".timeline-item",
    ".incubation-card",
    ".qr-card",
    ".project-brief__item",
    ".project-brief__wide",
    ".project-brief__lead"
  ].join(",");

  const initialized = new WeakSet();

  function getConfig(card) {
    if (card.matches(".card")) {
      return { rotate: 8.5, scale: 1.018, lift: -8, glare: 0.58 };
    }
    if (card.matches(".ability__item")) {
      return { rotate: 5.5, scale: 1.012, lift: -4, glare: 0.24 };
    }
    if (card.matches(".timeline-item, .incubation-card")) {
      return { rotate: 4.5, scale: 1.012, lift: -5, glare: 0.28 };
    }
    if (card.matches(".project-brief__item, .project-brief__wide, .project-brief__lead")) {
      return { rotate: 3.5, scale: 1.006, lift: -2, glare: 0.18 };
    }
    if (card.matches(".qr-card")) {
      return { rotate: 5, scale: 1.018, lift: -3, glare: 0 };
    }
    return { rotate: 4, scale: 1.012, lift: -3, glare: 0.22 };
  }

  function resetCard(card) {
    card.style.removeProperty("transform");
    card.style.setProperty("--tilt-glare-alpha", "0");
  }

  function initCard(card) {
    if (!card || initialized.has(card) || card.closest(".modal-transition-ghost")) return;
    initialized.add(card);
    card.classList.add("tilt-card");
    resetCard(card);

    const hasGlare = Array.from(card.children).some((child) => child.classList?.contains("tilt-card__glare"));
    if (!hasGlare) {
      const glare = document.createElement("span");
      glare.className = "tilt-card__glare";
      glare.setAttribute("aria-hidden", "true");
      card.appendChild(glare);
    }

    const config = getConfig(card);
    let frame = null;
    let targetRx = 0;
    let targetRy = 0;
    let currentRx = 0;
    let currentRy = 0;
    let targetScale = 1;
    let currentScale = 1;
    let targetLift = 0;
    let currentLift = 0;
    let targetGlare = 0;
    let currentGlare = 0;
    let isActive = false;

    function render() {
      currentRx += (targetRx - currentRx) * 0.18;
      currentRy += (targetRy - currentRy) * 0.18;
      currentScale += (targetScale - currentScale) * 0.16;
      currentLift += (targetLift - currentLift) * 0.16;
      currentGlare += (targetGlare - currentGlare) * 0.18;

      card.style.setProperty("--tilt-rx", `${currentRx.toFixed(3)}deg`);
      card.style.setProperty("--tilt-ry", `${currentRy.toFixed(3)}deg`);
      card.style.setProperty("--tilt-scale", currentScale.toFixed(4));
      card.style.setProperty("--tilt-lift", `${currentLift.toFixed(2)}px`);
      card.style.setProperty("--tilt-glare-alpha", currentGlare.toFixed(3));
      card.style.transform = `perspective(900px) rotateX(${currentRx.toFixed(3)}deg) rotateY(${currentRy.toFixed(3)}deg) translate3d(0, ${currentLift.toFixed(2)}px, 0) scale(${currentScale.toFixed(4)})`;

      if (
        isActive ||
        Math.abs(currentRx) > 0.02 ||
        Math.abs(currentRy) > 0.02 ||
        Math.abs(currentScale - targetScale) > 0.001 ||
        Math.abs(currentLift) > 0.02 ||
        currentGlare > 0.01
      ) {
        frame = requestAnimationFrame(render);
      } else {
        frame = null;
        resetCard(card);
      }
    }

    function ensureFrame() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    card.addEventListener("pointermove", (event) => {
      if (card.classList.contains("is-transition-source")) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
      const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const offsetX = x - 0.5;
      const offsetY = y - 0.5;

      targetRx = offsetY * -config.rotate;
      targetRy = offsetX * config.rotate;
      targetScale = config.scale;
      targetLift = config.lift;
      targetGlare = config.glare;
      card.style.setProperty("--tilt-glare-x", `${(x * 100).toFixed(2)}%`);
      card.style.setProperty("--tilt-glare-y", `${(y * 100).toFixed(2)}%`);
      isActive = true;
      ensureFrame();
    }, { passive: true });

    card.addEventListener("pointerenter", () => {
      isActive = true;
      targetScale = config.scale;
      targetLift = config.lift;
      targetGlare = config.glare;
      ensureFrame();
    }, { passive: true });

    card.addEventListener("pointerleave", () => {
      isActive = false;
      targetRx = 0;
      targetRy = 0;
      targetScale = card.matches(".card:not(.is-current)") ? 0.985 : 1;
      targetLift = 0;
      targetGlare = 0;
      ensureFrame();
    }, { passive: true });

    card.addEventListener("pointerdown", () => {
      targetScale = Math.max(0.982, config.scale - 0.03);
      ensureFrame();
    }, { passive: true });

    card.addEventListener("pointerup", () => {
      targetScale = isActive ? config.scale : card.matches(".card:not(.is-current)") ? 0.985 : 1;
      ensureFrame();
    }, { passive: true });
  }

  function scan(root = document) {
    root.querySelectorAll?.(selectors).forEach(initCard);
    if (root.matches?.(selectors)) initCard(root);
  }

  scan();

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) scan(node);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();

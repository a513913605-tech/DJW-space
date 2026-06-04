(function () {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const grid = document.createElement("div");
  grid.className = "geo-grid";
  grid.setAttribute("aria-hidden", "true");
  grid.innerHTML = `
    <div class="geo-grid__sphere">
      <svg viewBox="-500 -500 1000 1000" focusable="false">
        <circle class="geo-line" cx="0" cy="0" r="430"></circle>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="330"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="230"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="125"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="56"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="385" transform="rotate(90)"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="385" transform="rotate(60)"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="385" transform="rotate(30)"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="385" transform="rotate(-30)"></ellipse>
        <ellipse class="geo-line geo-line--soft" cx="0" cy="0" rx="430" ry="385" transform="rotate(-60)"></ellipse>
        <path class="geo-line geo-line--axis" d="M -430 0 H 430"></path>
        <path class="geo-line geo-line--axis" d="M 0 -430 V 430"></path>
      </svg>
    </div>
  `;

  document.body.prepend(grid);

  if (reduceMotion) return;

  let targetRotation = 0;
  let currentRotation = 0;
  let targetDrift = 0;
  let currentDrift = 0;
  let ticking = false;

  function updateTargets() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = (window.scrollY || window.pageYOffset || 0) / maxScroll;
    targetRotation = progress * 34;
    targetDrift = (progress - 0.5) * 18;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(animate);
    }
  }

  function animate() {
    currentRotation += (targetRotation - currentRotation) * 0.08;
    currentDrift += (targetDrift - currentDrift) * 0.08;
    grid.style.setProperty("--geo-rotate", `${currentRotation.toFixed(3)}deg`);
    grid.style.setProperty("--geo-drift", `${currentDrift.toFixed(3)}px`);

    if (
      Math.abs(targetRotation - currentRotation) > 0.01 ||
      Math.abs(targetDrift - currentDrift) > 0.01
    ) {
      requestAnimationFrame(animate);
      return;
    }

    ticking = false;
  }

  updateTargets();
  window.addEventListener("scroll", updateTargets, { passive: true });
  window.addEventListener("resize", updateTargets);
})();

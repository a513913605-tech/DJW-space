(function () {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;

  const startedAt = performance.now();
  const minVisible = 900;
  const maxVisible = 1700;
  let hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    const wait = Math.max(0, minVisible - (performance.now() - startedAt));
    window.setTimeout(() => {
      loader.classList.add("is-hidden");
      window.setTimeout(() => loader.remove(), 720);
    }, wait);
  }

  if (document.readyState === "complete") {
    hideLoader();
  } else {
    window.addEventListener("load", hideLoader, { once: true });
    window.setTimeout(hideLoader, maxVisible);
  }
})();

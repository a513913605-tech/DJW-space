(function () {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;

  const storageKey = "portfolioHomeLoaderPlayed";
  const pageName = window.location.pathname.split("/").pop().toLowerCase();
  const isHomePage = pageName === "" || pageName === "index.html";

  if (!isHomePage) {
    loader.remove();
    return;
  }

  try {
    if (sessionStorage.getItem(storageKey) === "true") {
      loader.remove();
      return;
    }
  } catch (error) {
    // Session storage can be unavailable in strict privacy modes.
  }

  const startedAt = performance.now();
  const minVisible = 900;
  const maxVisible = 1500;
  let hidden = false;

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    try {
      sessionStorage.setItem(storageKey, "true");
    } catch (error) {}
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

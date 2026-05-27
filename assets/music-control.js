(function () {
  const controls = Array.from(document.querySelectorAll("[data-music-control]"));
  if (!controls.length) return;

  const storageKey = "djwPortfolioMusic";
  const storageVersion = 2;
  const defaultState = {
    enabled: true,
    volume: 0.9,
    version: storageVersion
  };

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved || typeof saved !== "object") {
        return { ...defaultState };
      }
      if (saved.version !== storageVersion) {
        return {
          enabled: typeof saved.enabled === "boolean" ? saved.enabled : defaultState.enabled,
          volume: defaultState.volume,
          version: storageVersion
        };
      }
      return {
        enabled: typeof saved.enabled === "boolean" ? saved.enabled : defaultState.enabled,
        volume: Number.isFinite(saved.volume) ? saved.volume : defaultState.volume,
        version: storageVersion
      };
    } catch (error) {
      return { ...defaultState };
    }
  }

  function saveState(nextState) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextState));
    } catch (error) {
      // localStorage can be unavailable in strict privacy modes.
    }
  }

  const state = readState();
  state.volume = Math.min(1, Math.max(0, state.volume));
  state.version = storageVersion;

  const audio = new Audio("背景音效.mp3");
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = state.volume;

  let isPlaying = false;
  let pendingResume = state.enabled;
  let playRequest = null;

  function updateControl(control) {
    const toggle = control.querySelector(".music-control__toggle");
    const range = control.querySelector(".music-control__range");
    const value = control.querySelector(".music-control__value");
    control.classList.toggle("is-playing", isPlaying);
    control.classList.toggle("is-open", isPlaying);
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isPlaying));
      toggle.setAttribute("aria-label", isPlaying ? "Pause background music" : "Play background music");
      toggle.title = isPlaying ? "Pause music" : "Play music";
    }
    if (range) range.value = String(Math.round(state.volume * 100));
    if (value) value.textContent = `${Math.round(state.volume * 100)}%`;
  }

  function updateAllControls() {
    controls.forEach(updateControl);
  }

  async function playAudio(options = {}) {
    if (playRequest) return playRequest;
    state.enabled = true;
    pendingResume = false;
    if (options.save !== false) saveState(state);
    playRequest = audio.play()
      .then(() => {
        isPlaying = true;
        pendingResume = false;
      })
      .catch(() => {
        isPlaying = false;
        pendingResume = true;
      })
      .finally(() => {
        playRequest = null;
        updateAllControls();
      });
    updateAllControls();
    return playRequest;
  }

  function pauseAudio() {
    audio.pause();
    isPlaying = false;
    pendingResume = false;
    state.enabled = false;
    saveState(state);
    updateAllControls();
  }

  function setVolume(value) {
    state.volume = Math.min(1, Math.max(0, value / 100));
    audio.volume = state.volume;
    saveState(state);
    updateAllControls();
  }

  controls.forEach((control) => {
    const toggle = control.querySelector(".music-control__toggle");
    const range = control.querySelector(".music-control__range");
    if (toggle) {
      toggle.addEventListener("click", () => {
        if (isPlaying) pauseAudio();
        else playAudio();
      });
    }
    if (range) {
      range.addEventListener("input", (event) => {
        setVolume(Number(event.target.value));
      });
    }
  });

  const resumeOnInteraction = (event) => {
    if (event?.target?.closest?.("[data-music-control]")) return;
    if (pendingResume && state.enabled && !isPlaying) {
      playAudio();
    }
  };

  window.addEventListener("pointerdown", resumeOnInteraction, { passive: true });
  window.addEventListener("keydown", resumeOnInteraction);

  updateAllControls();
  if (state.enabled) {
    playAudio({ save: false });
  }
})();

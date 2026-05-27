(function () {
  const controls = Array.from(document.querySelectorAll("[data-music-control]"));
  if (!controls.length) return;

  const storageKey = "djwPortfolioMusic";
  const defaultState = {
    enabled: false,
    volume: 0.28
  };

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
      return {
        enabled: Boolean(saved.enabled),
        volume: Number.isFinite(saved.volume) ? saved.volume : defaultState.volume
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

  const audio = new Audio("背景音效.mp3");
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = state.volume;

  let isPlaying = false;
  let pendingResume = state.enabled;

  function updateControl(control) {
    const toggle = control.querySelector(".music-control__toggle");
    const range = control.querySelector(".music-control__range");
    const value = control.querySelector(".music-control__value");
    control.classList.toggle("is-playing", isPlaying);
    control.classList.toggle("is-open", state.enabled || isPlaying);
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

  async function playAudio() {
    state.enabled = true;
    pendingResume = false;
    saveState(state);
    try {
      await audio.play();
      isPlaying = true;
    } catch (error) {
      isPlaying = false;
      pendingResume = true;
    }
    updateAllControls();
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

  const resumeOnInteraction = () => {
    if (pendingResume && state.enabled && !isPlaying) {
      playAudio();
    }
  };

  window.addEventListener("pointerdown", resumeOnInteraction, { passive: true });
  window.addEventListener("keydown", resumeOnInteraction);

  updateAllControls();
})();

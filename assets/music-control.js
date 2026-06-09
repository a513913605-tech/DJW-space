(function () {
  const controls = Array.from(document.querySelectorAll("[data-music-control]"));
  if (!controls.length) return;

  const storageKey = "djwPortfolioMusic";
  const storageVersion = 8;
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
          enabled: defaultState.enabled,
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
  audio.setAttribute("playsinline", "");

  let isPlaying = false;
  let pendingResume = state.enabled;
  let playRequest = null;
  let mutedPrimeRequest = null;
  let isMutedPrimed = false;

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

  function updateMobileCompactState() {
    const shouldCompact = window.innerWidth <= 720 && (window.scrollY || window.pageYOffset || 0) > 24;
    controls.forEach((control) => {
      control.classList.toggle("is-compact", shouldCompact);
    });
  }

  function tryMutedPrime() {
    if (mutedPrimeRequest || isMutedPrimed || !state.enabled) return mutedPrimeRequest;
    audio.muted = true;
    mutedPrimeRequest = audio.play()
      .then(() => {
        isMutedPrimed = true;
        isPlaying = false;
        pendingResume = true;
      })
      .catch(() => {
        isMutedPrimed = false;
        audio.muted = false;
      })
      .finally(() => {
        mutedPrimeRequest = null;
        updateAllControls();
      });
    return mutedPrimeRequest;
  }

  function activatePrimedAudio() {
    if (!isMutedPrimed) return false;
    state.enabled = true;
    pendingResume = false;
    isPlaying = true;
    isMutedPrimed = false;
    audio.muted = false;
    audio.volume = state.volume;
    saveState(state);
    updateAllControls();
    audio.play().catch(() => {
      isPlaying = false;
      pendingResume = true;
      tryMutedPrime();
      updateAllControls();
    });
    return true;
  }

  function playAudio(options = {}) {
    if (playRequest && !options.force) return playRequest;
    state.enabled = true;
    pendingResume = true;
    isMutedPrimed = false;
    audio.muted = false;
    if (options.save !== false) saveState(state);
    audio.volume = state.volume;
    playRequest = audio.play()
      .then(() => {
        isPlaying = true;
        pendingResume = false;
      })
      .catch(() => {
        isPlaying = false;
        pendingResume = true;
        if (options.allowMutedPrime !== false) tryMutedPrime();
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
    audio.muted = false;
    isPlaying = false;
    isMutedPrimed = false;
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
    if (pendingResume && state.enabled && !isPlaying) {
      const now = performance.now();
      const isMoveEvent = event?.type === "mousemove" || event?.type === "pointermove" || event?.type === "mouseover" || event?.type === "pointerover";
      const interval = isMoveEvent ? 420 : 160;
      if (resumeOnInteraction.lastAttempt && now - resumeOnInteraction.lastAttempt < interval) return;
      resumeOnInteraction.lastAttempt = now;
      if (activatePrimedAudio()) return;
      playAudio({ force: true });
    }
  };

  const interactionTargets = [window, document, document.documentElement];
  const interactionEvents = [
    "pointerover",
    "pointermove",
    "pointerdown",
    "pointerup",
    "mouseover",
    "mousemove",
    "mousedown",
    "mouseup",
    "touchstart",
    "touchmove",
    "touchend",
    "click",
    "keydown",
    "wheel"
  ];
  interactionTargets.forEach((target) => {
    interactionEvents.forEach((eventName) => {
      target.addEventListener(eventName, resumeOnInteraction, { passive: eventName !== "click" && eventName !== "keydown", capture: true });
    });
  });
  window.addEventListener("scroll", (event) => {
    updateMobileCompactState();
    resumeOnInteraction(event);
  }, { passive: true });
  window.addEventListener("resize", updateMobileCompactState);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && pendingResume && state.enabled && !isPlaying) {
      playAudio({ save: false });
    }
  });

  updateAllControls();
  updateMobileCompactState();
  if (state.enabled) {
    const attemptImmediatePlayback = () => playAudio({ save: false, force: true });
    attemptImmediatePlayback();
    window.addEventListener("pageshow", attemptImmediatePlayback, { once: true });
    window.addEventListener("load", attemptImmediatePlayback, { once: true });
    document.addEventListener("DOMContentLoaded", attemptImmediatePlayback, { once: true });
    window.setTimeout(attemptImmediatePlayback, 120);
    window.setTimeout(attemptImmediatePlayback, 640);
  }
})();

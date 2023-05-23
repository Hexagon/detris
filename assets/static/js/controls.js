// js/controls.js

let handleChange = null;

const initialize = (network) => {
  const listenKeys = [
    "ArrowUp",
    "ArrowLeft",
    "ArrowRight",
    "ArrowDown",
    "KeyA",
    "KeyD",
    "Space",
  ];

  const setState = (prop, val, _isEvent) => {
    handleChange && handleChange({ key: prop, state: val });
  };

  const handleKeyDown = (e) => {
    if (listenKeys.includes(e.code)) {
      if (e.code === "Space") setState("drop", true);
      if (e.code === "ArrowUp") setState("rotCW", true);
      if (e.code === "KeyA") setState("rotCCW", true);
      if (e.code === "KeyD") setState("rotCW", true);
      if (e.code === "ArrowLeft") setState("left", true);
      if (e.code === "ArrowRight") setState("right", true);
      if (e.code === "ArrowDown") setState("down", true);
    }
  };

  const handleKeyUp = (e) => {
    if (listenKeys.includes(e.code)) {
      if (e.code === "Space") setState("drop", false);
      if (e.code === "ArrowUp") setState("rotCW", false);
      if (e.code === "KeyA") setState("rotCCW", false);
      if (e.code === "KeyD") setState("rotCW", false);
      if (e.code === "ArrowLeft") setState("left", false);
      if (e.code === "ArrowRight") setState("right", false);
      if (e.code === "ArrowDown") setState("down", false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  return {
    setHandleChange: (callback) => {
      handleChange = callback
    }
  }
};

export default {
  initialize,
};

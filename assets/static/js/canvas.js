// js/modules/dom/canvas.js

const canvasFactory = function () {
  // Private
  var exports = {},
    listeners = {},
    canvas,
    context,
    widthOffset,
    heightOffset,
    emit = function (event, a1, a2, a3) {
      listeners[event] && listeners[event](a1, a2, a3);
    },
    autoResize = function (e) {
      canvas.width = window.innerWidth + (widthOffset || 0);
      canvas.height = window.innerHeight + (heightOffset || 0);
      emit("resize", {
        width: canvas.width,
        height: canvas.height,
      });
    };

  // Public
  exports.on = function (event, fn) {
    if (listeners[event]) {
      console.log(
        "Warning: Dropping previous listener connected to '" + event +
          "', only one listener is allowed.",
      );
      return;
    }

    listeners[event] = fn;
  };

  exports.getCanvas = function () {
    return canvas;
  };

  exports.getContext = function () {
    return context;
  };

  exports.place = function (
    destinationSelector,
    id,
    width,
    height,
    _widthOffset,
    _heightOffset,
  ) {
    var destination;

    // Find destination element
    destination = document.querySelector(destinationSelector);
    if (!destination) {
      console.error("Destination not found");
      return false;
    }

    // Create canvas
    canvas = document.createElement("canvas");
    canvas.id = id;

    // Place canvas at destination
    try {
      destination.appendChild(canvas);
    } catch (e) {
      console.error("Could not place canvas in destination:", e);
      return false;
    }

    // Get a 2d context
    context = canvas.getContext("2d");

    //
    widthOffset = _widthOffset;
    heightOffset = _heightOffset;

    // Listen for resize events
    if (!width && !height) {
      window.addEventListener("resize", autoResize);
      // Call resize one initial time
      autoResize();
    } else {
      canvas.width = width + (widthOffset || 0);
      canvas.height = height + (heightOffset || 0);
      setTimeout(
        emit("resize", {
          width: canvas.width,
          height: canvas.height,
        }),
        10,
      );
    }

    // All good!
    return true;
  };

  return exports;
};

export { canvasFactory };

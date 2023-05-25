/**
 * Wrapper for the viewport canvas element
 *
 * @file static/js/common/canvas.js
 */

class Canvas {
  constructor() {
    this.canvas = null;
    this.context = null;
    this.widthOffset = null;
    this.heightOffset = null;
  }

  getCanvas() {
    return this.canvas;
  }

  getContext() {
    return this.context;
  }

  place(destinationSelector, id, width, height, _widthOffset, _heightOffset) {
    // Find destination element
    const destination = document.querySelector(destinationSelector);
    if (!destination) {
      console.error("Destination not found");
      return false;
    }

    // Create canvas
    this.canvas = document.createElement("canvas");
    this.canvas.id = id;

    // Place canvas at destination
    try {
      destination.innerHTML = "";
      destination.appendChild(this.canvas);
    } catch (e) {
      console.error("Could not place canvas in destination:", e);
      return false;
    }

    // Get a 2d context
    this.context = this.canvas.getContext("2d");

    this.widthOffset = _widthOffset;
    this.heightOffset = _heightOffset;

    // Set canvas size
    if (!width && !height) {
      this.autoResize();
    } else {
      this.canvas.width = width + (this.widthOffset || 0);
      this.canvas.height = height + (this.heightOffset || 0);
    }

    // All good!
    return true;
  }

  autoResize() {
    this.canvas.width = window.innerWidth + (this.widthOffset || 0);
    this.canvas.height = window.innerHeight + (this.heightOffset || 0);
  }
}

export { Canvas };

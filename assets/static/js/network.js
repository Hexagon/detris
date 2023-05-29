/**
 * WebSocket communication wrapper
 *
 * @file static/js/network.js
 */

class Network {
  constructor() {
    this.ws = null;
  }

  #url(s) {
    const l = window.location;
    const dir = l.pathname.substring(0, l.pathname.lastIndexOf("/"));

    return ((l.protocol === "https:") ? "wss://" : "ws://") + l.host + dir + s;
  }

  async connect(uri, messageCallback, connectCallback, disconnectCallback) {
    // Set up promise
    let resolver;

    const done = new Promise((resolve) => {
      resolver = resolve;
    });

    this.ws = new WebSocket(this.#url(uri));

    // In
    this.ws.onmessage = (m) => {
      const data = JSON.parse(m.data);
      messageCallback && messageCallback(data);
    };

    this.ws.onopen = () => {
      setTimeout(() => {
        resolver();
        if (connectCallback) connectCallback();
      }, 1);
    };

    this.ws.onclose = disconnectCallback;

    return await done;
  }

  sendControlsChange(data) {
    this.ws.send(JSON.stringify({ packet: "key", data: data }));
  }

  sendPlayerReady(nickname, mode, code) {
    this.ws.send(JSON.stringify({ packet: "ready", nickname, mode, code }));
  }
}

export { Network };

// js/network.js
function url(s) {
  const l = window.location,
    dir = l.pathname.substring(0, l.pathname.lastIndexOf("/"));

  return ((l.protocol === "https:") ? "wss://" : "ws://") + l.host + dir + s;
}

const connect = (uri, onMessage, onConnect, onDisconnect) => {
  const ws = new WebSocket(url(uri));

  // In
  ws.onmessage = (m) => {
    const data = JSON.parse(m.data);
    onMessage && onMessage(data);
  };

  ws.onopen = onConnect;

  ws.onclose = onDisconnect;

  // Expose connect function
  return {
    connect,
    sendControlsChange: (data) => {
      ws.send(JSON.stringify({ packet: "key", data: data }));
    },
    sendPlayerReady: (nickname) => {
      ws.send(JSON.stringify({ packet: "ready", nickname: nickname }));
    },
  };
};

export default {
  connect,
};

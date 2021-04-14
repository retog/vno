export const liveReloadScript = `
// ===========================\n
// LIVE RELOADING\n
// Create WebSocket connection.
const socket = new WebSocket("ws://localhost:8080");

// Connection opened
socket.addEventListener("open", function (event) {
  socket.send("[LiveReload client connected]");
});

// Listen for messages
socket.addEventListener("message", function (event) {
  socket.send("[LiveReload reloading...]");
  if (event.data === 'window.location.reload();') {
    eval(event.data);
  }
});

// ===========================\n
`;

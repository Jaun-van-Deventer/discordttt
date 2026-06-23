import { DiscordSDK } from "@discord/embedded-app-sdk";

const discordSdk = new DiscordSDK("1519044740916445367");

await discordSdk.ready();

const context = await discordSdk.commands.getInstanceID();
const roomId = context.instanceId;
const socket = io(import.meta.env.VITE_SERVER_URL);

let player = "X";

socket.emit("join", roomId);

const boardEl = document.getElementById("board");

function render(board) {
  boardEl.innerHTML = "";

  board.forEach((cell, i) => {
    const btn = document.createElement("button");
    btn.textContent = cell || "";
    btn.style.width = "60px";
    btn.style.height = "60px";

    btn.onclick = () => {
      socket.emit("move", {
        roomId,
        index: i,
        player
      });
    };

    boardEl.appendChild(btn);
  });
}

socket.on("state", (state) => {
  render(state.board);

  if (state.winner) {
    alert(state.winner + " wins!");
  }
});

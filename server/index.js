const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");
const io = require("socket.io")(server, {
  cors: {origin: "http://localhost:4000"},
});
const data = require("./data.js");

app.use(express.static(path.join(__dirname, "build")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// --- Bingo Logic
let allBoards = [];

const getRandomBingoBoard = (id, name) => {
  let items = [];
  let posCounter = 0;
  while (items.length < 25) {
    let random = Math.floor(Math.random() * data.length);
    let item = {...data[random]};
    if (!items.some((obj) => obj.id === item.id)) {
      posCounter += 1;
      item.pos = posCounter;
      item.active = false;
      if (item.pos === 13)
        item = {
          id,
          description: "Bitcoin Bullshit Bingo",
          pos: 13,
          active: true,
          player: name,
        };
      items.push(item);
    }
  }
  return items;
};

const setFieldActive = (field) => {
  return allBoards.map((board) =>
    board.map((obj) => (obj.id === field.id ? {...obj, active: true} : obj))
  );
};

const checkFive = (slice) => {
  let activeInRow = slice.filter((obj) => obj.active);
  return activeInRow.length === 5;
};

const checkRows = (board) => {
  let start = 0;
  let end = 5;
  while (end <= 25) {
    let slice = board.slice(start, end);
    if (checkFive(slice)) {
      return true;
    } else {
      start = end;
      end += 5;
    }
  }
};

const checkCols = (board) => {
  let rows = 0;
  const step = 5;
  while (rows < 5) {
    const slice = [];
    let start = rows;
    while (slice.length < 5) {
      slice.push(board[start]);
      start += step;
    }
    win = checkFive(slice);
    if (win) {
      return true;
    } else {
      rows += 1;
    }
  }
};

const checkDiags = (board) => {
  if (
    board[0].active &&
    board[6].active &&
    board[12].active &&
    board[18].active &&
    board[24].active
  ) {
    return true;
  } else if (
    board[4].active &&
    board[8].active &&
    board[12].active &&
    board[16].active &&
    board[20].active
  ) {
    return true;
  }
  return false;
};

const checkWinners = () => {
  // go through each board, return false or the id of the winner
  const winners = [];
  allBoards.forEach((board) => {
    // check rows
    let hWin = checkRows(board);
    let vWin = checkCols(board);
    let dWin = checkDiags(board);
    if (hWin || dWin || vWin) {
      let player = board[12].player;
      winners.push(player);
    }
  });

  // default return statement
  return winners;
};

// --- Socket IO
let onlineClients = [];

io.on("connection", (socket) => {
  // New user signs in
  socket.on("userRegistered", ({name}) => {
    const board = getRandomBingoBoard(socket.id, name);
    onlineClients.push({id: socket.id, player: name});
    allBoards.push(board);
    io.to(socket.id).emit("boardSet", board);

    const playerNames = onlineClients.map((obj) => obj.player);
    io.emit("playersListed", playerNames);
  });

  // User sets field to active
  socket.on("fieldActivated", ({item}) => {
    allBoards = setFieldActive(item); // update the board state in the backend
    const winners = checkWinners();
    io.emit("fieldActivated", item.id);

    // emit a winner if there is one
    if (winners.length >= 1) io.emit("userWon", winners);
  });

  // User wants to play again after a win
  socket.on("rematchRequested", () => {
    allBoards = [];
    onlineClients.map((client) => {
      const board = getRandomBingoBoard(client.id, client.player);
      allBoards.push(board);
      io.to(client.id).emit("rematchRequested", board);
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    onlineClients = onlineClients.filter((user) => {
      user.id !== socket.id;
    });

    // update player list upon rage quit
    const playerNames = onlineClients.map((obj) => obj.player);
    io.emit("playersListed", playerNames);

    // make sure there is no board floating around
    if (onlineClients.length === 0) {
      allBoards = [];
    }
  });
});

server.listen(4000, () => {});

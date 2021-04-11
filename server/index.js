const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {origin: "http://localhost:3000"},
});

// --- Bingo Logic
let allBoards = [];
const data = require("./data.js");

const getRandomBingoBoard = (id, name) => {
  var items = [];
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
  posCounter = 0;
  return items;
};

const updateAllBoards = (field) => {
  return allBoards.map((board) =>
    board.map((obj) => (obj.id === field.id ? {...obj, active: true} : obj))
  );
};

const checkFive = (slice) => {
  let activeInRow = slice.filter((obj) => obj.active);
  return activeInRow.length === 5 ? true : false;
};

const checkRows = (board) => {
  let start = 0;
  let end = 5;
  while (end < 25) {
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
  } else {
    return false;
  }
};

const checkWinners = () => {
  // go through each board, return false or the id of the winner
  let winners = [];
  allBoards.map((board) => {
    // check rows
    let hWin = checkRows(board);
    let vWin = checkCols(board);
    let dWin = checkDiags(board);
    if (hWin | dWin | vWin) {
      let player = board[12].player;
      winners.push(player);
    }
  });

  // default return statement
  return winners;
};

let onlineClients = [];

// --- Socket IO
io.on("connection", (socket) => {
  // New user signs in
  socket.on("newUser", ({name}) => {
    const board = getRandomBingoBoard(socket.id, name);
    onlineClients.push({id: socket.id, player: name});
    allBoards.push(board);
    io.to(socket.id).emit("setBoard", board);
  });

  // User sets field to active
  socket.on("setActive", ({item}) => {
    if (item.pos !== 13) {
      allBoards = updateAllBoards(item); // update the board state in the backend
      const winners = checkWinners();
      // const field = data.find((obj) => obj.id == item.id);
      // field.active = true; // log the field
      io.emit("setActive", item.id);

      // emit a winner if there is one
      if (winners.length >= 1) io.emit("gotWinners", winners);
    }
  });

  // User wants to play again after a win
  socket.on("playAgain", () => {
    allBoards = [];
    // let clients = Array.from(onlineClients);
    onlineClients.map((client) => {
      const board = getRandomBingoBoard(client.id, client.player);
      allBoards.push(board);
      io.to(client.id).emit("playAgain", board);
    });
  });

  // User disconnects
  socket.on("disconnect", () => {
    onlineClients = onlineClients.filter((user) => {
      user.id !== socket.id;
    });
    if (onlineClients.length === 0) {
      allBoards = [];
    }
  });
});

server.listen(4000, () => {});

import {Layout} from "antd";
import {useEffect, useState} from "react";
import io from "socket.io-client";
import BingoHeader from "./components/BingoHeader";
import Board from "./components/Board";
import LoginModal from "./components/LoginModal";
import WinningModal from "./components/WinningModal";
import PlayerList from "./components/PlayerList";

const {Content} = Layout;
const socket = io.connect("http:bingo.alex-roos.work");
// const socket = io.connect("http://localhost:4000");

const App = () => {
  const [board, setBoard] = useState([]);
  const [username, setUsername] = useState("");
  const [winners, setWinners] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("playersListed", (names) => {
      setPlayers(names);
    });

    return () => {
      socket.off("playersListed");
    };
  }, [setPlayers]);

  useEffect(() => {
    socket.on("userWon", (winner) => {
      setWinners(winner);
      setGameOver(true);
    });
    return () => {
      socket.off("userWon");
    };
  }, [setWinners, setGameOver]);

  useEffect(() => {
    socket.on("rematchRequested", (newBoard) => {
      setGameOver(false);
      setWinners([]);
      setBoard(newBoard);
    });
    return () => {
      socket.off("rematchRequested");
    };
  }, [setGameOver, setWinners]);

  const playAgain = () => {
    socket.emit("rematchRequested");
  };

  return (
    <Layout>
      <LoginModal
        showModal={!username}
        setUsername={setUsername}
        socket={socket}
      />
      <WinningModal show={gameOver} winners={winners} onPlayAgain={playAgain} />
      <BingoHeader username={username} />
      <Content>
        <Board board={board} setBoard={setBoard} socket={socket} />
        <PlayerList players={players} />
      </Content>
    </Layout>
  );
};

export default App;

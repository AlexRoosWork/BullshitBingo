import {Layout, Typography} from "antd";
import {useEffect, useState} from "react";
import io from "socket.io-client";
import "./App.css";
import Board from "./components/Board";
import LoginModal from "./components/LoginModal";
import WinningModal from "./components/WinningModal";

const socket = io.connect("http://localhost:4000");
const {Header, Content} = Layout;
const {Title} = Typography;

const App = () => {
  const [board, setBoard] = useState([]);
  const [username, setUsername] = useState("");
  const [winners, setWinners] = useState(["a", "b"]);
  const [gameOver, setGameOver] = useState(false);

  // new user registers
  // useEffect(() => {
  //   socket.on("newUser", ({name}) => {
  //     setUsername(name);
  //   });
  // });

  useEffect(() => {
    socket.on("gotWinners", (winner) => {
      setWinners(winner);
      setGameOver(true);
    });
    return () => {
      socket.removeListener("gotWinners");
    };
  }, [setWinners, setGameOver]);

  useEffect(() => {
    socket.on("playAgain", (newBoard) => {
      console.log("new board: ", newBoard);
      setGameOver(false);
      setWinners([]);
      setBoard(newBoard);
    });
    return () => {
      socket.removeListener("playAgain");
    };
  }, [setGameOver, setWinners]);

  return (
    <Layout>
      <LoginModal
        showModal={!username}
        setUsername={setUsername}
        socket={socket}
      />
      <WinningModal showModal={gameOver} winners={winners} socket={socket} />
      <Header>
        <Title level={4} type="success">
          Playing Bingo as {username}
        </Title>
      </Header>
      <Content>
        <Board board={board} setBoard={setBoard} socket={socket} />
      </Content>
    </Layout>
  );
};

export default App;

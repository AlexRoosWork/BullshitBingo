import {Col, Row, Typography} from "antd";
import {useEffect} from "react";
import "../App.css";

const {Text} = Typography;

const BingoCell = ({item, socket}) => {
  const handleClick = () => {
    console.log("emitting: ", item);
    socket.emit("setActive", {item});
  };

  if (item.pos === 13) {
    return (
      <Col span={4} className="middle-cell" onClick={handleClick}>
        <Text>{item.description}</Text>
      </Col>
    );
  } else {
    return (
      <Col span={4} className="cell" onClick={handleClick}>
        <Text delete={item.active}>{item.description}</Text>
      </Col>
    );
  }
};

const BingoRow = ({cells, socket}) => {
  return (
    <Row justify="center" align="middle" gutter={[14, 14]}>
      {cells.map((cell, index) => {
        return <BingoCell item={cell} key={index} socket={socket} />;
      })}
    </Row>
  );
};

const Board = ({socket, board, setBoard}) => {
  // set board for new user
  useEffect(() => {
    socket.on("setBoard", (board) => {
      setBoard(board);
    });
  }, [board, setBoard, socket]);

  // set new active field
  useEffect(() => {
    socket.on("setActive", (id) => {
      setBoard(
        board.map((obj) => (obj.id === id ? {...obj, active: true} : obj))
      );
      console.log("ran effect hook: ", board);
    });
    return () => {
      socket.removeListener("setActive");
    };
  }, [board, setBoard, socket]);

  return (
    <Row justify="center" align="middle">
      <Col span={20}>
        <BingoRow socket={socket} cells={board.slice(0, 5)} />
        <BingoRow socket={socket} cells={board.slice(5, 10)} />
        <BingoRow socket={socket} cells={board.slice(10, 15)} />
        <BingoRow socket={socket} cells={board.slice(15, 20)} />
        <BingoRow socket={socket} cells={board.slice(20, 25)} />
      </Col>
    </Row>
  );
};

export default Board;

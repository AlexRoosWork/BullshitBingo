import {Row, Col, Typography, Divider} from "antd";
import {useState, useEffect} from "react";
import "../App.css";

const {Title} = Typography;

const PlayerList = ({socket}) => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("playersListed", (names) => {
      setPlayers(names);
    });

    return () => {
      socket.removeListener("playersListed");
    };
  }, [socket, setPlayers]);

  return (
    <Row justify="center" align="middle">
      <Col span={14}>
        <Divider />
        <Title level={2} className="text-center">
          Currently {players.length} players:
        </Title>
        {players.map((player) => {
          return (
            <Title level={4} key={player}>
              👤 {player}
            </Title>
          );
        })}
      </Col>
    </Row>
  );
};

export default PlayerList;

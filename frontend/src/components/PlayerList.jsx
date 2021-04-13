import {Col, Divider, Row, Typography} from "antd";

const {Title} = Typography;

const PlayerList = ({players}) => {
  return (
    <Row justify="center" align="middle">
      <Col span={14}>
        <Divider />
        <Title level={2} className="text-center">
          Currently {players.length} players:
        </Title>
        {players.map((player) => (
          <Title level={4} key={player}>
            👤 {player}
          </Title>
        ))}
      </Col>
    </Row>
  );
};

export default PlayerList;

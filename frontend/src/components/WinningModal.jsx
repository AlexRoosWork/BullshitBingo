import {Modal, Typography} from "antd";

const {Title} = Typography;

const WinningModal = ({winners, show, onPlayAgain}) => {
  return (
    <Modal
      visible={show}
      title={<Title level={1}>๐ถ๐The winner takes it all๐๐ต</Title>}
      okText="Play Again"
      onOk={onPlayAgain}
    >
      {winners.map((winner) => (
        <Title level={2} key={winner}>
          Player "{winner}" won the game!
        </Title>
      ))}
    </Modal>
  );
};

export default WinningModal;

import {Modal, Typography} from "antd";

const {Title} = Typography;

const WinningModal = ({winners, showModal, socket}) => {
  const playAgain = () => {
    socket.emit("playAgain");
  };

  return (
    <Modal
      visible={showModal}
      title={<Title level={1}>🎉Winner winner🎉, chicken🐔 dinner🍜</Title>}
      okText="Play Again"
      onOk={playAgain}
    >
      {winners.map((winner) => (
        <Title level={2} key={winner.name}>
          Player "{winner}" won the game!
        </Title>
      ))}
    </Modal>
  );
};

export default WinningModal;

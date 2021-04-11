import {Input, Modal} from "antd";
import {useState} from "react";

const LoginModal = ({showModal, setUsername, socket}) => {
  const [name, setName] = useState();

  const confirmName = () => {
    socket.emit("newUser", {name});
    setUsername(name);
  };

  return (
    <Modal
      title="Pick a username"
      visible={showModal}
      onOk={confirmName}
      okText="Confirm"
    >
      <Input
        id="username"
        onChange={(e) => setName(e.target.value)}
        onPressEnter={confirmName}
      />
    </Modal>
  );
};

export default LoginModal;

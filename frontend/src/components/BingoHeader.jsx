import {Layout, Typography} from "antd";
import "../App.css";

const {Header} = Layout;
const {Title} = Typography;

const BingoHeader = ({username}) => {
  return (
    <Header>
      <Title level={4} className="text-center" style={{color: "white"}}>
        Playing Bicoin Bullshit Bingo as {username}
      </Title>
    </Header>
  );
};

export default BingoHeader;

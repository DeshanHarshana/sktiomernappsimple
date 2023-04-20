import "./App.css";
import io from "socket.io-client"; /*this is socket.io client part. this is get responsibility to connect with socket.io*/
import { useState } from "react";
import Chat from "./Chat";

const socket = io.connect("http://localhost:4000");
/*in this point we should put what is the socket io server url*/
/*after we establish this io.connect our backend socket io server shows user connected with id
and if we close our react app then our backend socket io server shows us user disconnected with id*/

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      //we should check our room and username not empty because those are the main data that we need to establish connection

      socket.emit("join_room", room);
      //this one use to show chat windows after we enter the chatroom
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Chat with friends</h3>
          <input
            type="text"
            placeholder="Your Name..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          {/*in socket io room is important thing. before we start chatting we need to tell what is our room
            then socket io send us to that room and our message broadcast only that room
            if someone enter that room he can see that message
            otherwise he can't
            */  
        }
          
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join A Chat Room</button>
        </div>
      ) : (

        /*in this application everything pass via socket variable that we initialize above
        then if we extend our app definitely we should pass that variable to that component also
        that is why we pass that variable to that component*/
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;

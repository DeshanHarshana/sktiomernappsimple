import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";




function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");

  //this use to store message array
  const [messageList, setMessageList] = useState([]);


 

  const sendMessage = async () => {
    if (currentMessage !== "") {
      /*we create some object that including some information's
      finally we will pass that object to our backend socket io sever */
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };
      {/**
      we emit new event with name "send_message"
      */}
      await socket.emit("send_message", messageData);

      /*we use above code to send our own message also our chat list
      it mean if we send some message to someone it should appear in our chat also
       this below code is use for that one
       we add our messageData to list
       */
      setMessageList((list) => [...list, messageData]);
     

      //after sending that we empty our typing area
      setCurrentMessage("");
    }
  };

  /*Now we need a way to catch data from backend emit
  then we have to listen to our backend 
  then backend emit some data we can capture it and use it
  for that we use useEffect and we add [socket] because if our socket has some changes then only listen
  to that receive_message event*/
  useEffect(() => {
    socket.on('allmessages', (data)=>{
      setMessageList(data)
     
    })
    socket.on("receive_message", (data) => {
      /*what happened on below
      actually we get current state as list from our message list
      and we update it as by including new data
      ...list meaning current messages
      ...list, data meaning append new comming data to current list
      */
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Your Room</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {/*we loop message list*/}
          {messageList.map((messageContent, index) => {
            return (
              <div
                className="message" key={index}
                
                id={username === messageContent.author ? "you" : "other"}
                //if username is us then we apply you style to message and otherwise we apply other style to messgae div
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          //this is use to send message by pressing enter
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;

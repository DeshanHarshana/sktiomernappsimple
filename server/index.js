require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose')
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const PORT =process.env.PORT|  4000;
app.use(cors());

const Message = require("./Model/Message")

const db="mongodb+srv://deshan:1234@cluster0.4pgq5mf.mongodb.net/test?retryWrites=true&w=majority";



//firebase

var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const database=admin.firestore();
let messageRef=database.collection('Message');

















mongoose.connect(db).then(()=>{
  console.log("mongodb connect")
}).catch((error)=>{
  console.log(error)
})


const server = http.createServer(app);/*this is the server which we create using express*/


//this is how we connect our express server with socket.io server
const io = new Server(server,  {
  cors: {
    origin: "https://6440f36ed618d063901535dd--famous-cactus-a361fb.netlify.app", /*our frontend server*/
    allowedHeaders:'*',
    methods: ["GET", "POST"],
    
    credentials:true
  },
  
});
/*adding cors is more important because it solve lot of cores issue with socket.io*/


//socket io based on event emitting 
//there are pre build events in socket io for example -> connection, join_room etc..


//io.on("connection") meaning is we are now listning event that id is "connection" */
io.on("connection", (socket) => { /*if someone emit event we use callback function for grab that things */
  /*if someone go to our frontend it generate socket.id and we can display it*/
  console.log(`User Connected: ${socket.id}`);
  


  /*this is event that use to join to room. actually if someone in frontend is emit something to
  "join_room" with room id then this socket.on take that one and get passed data as data.
  then inside the socket variable we have a method call join
  we use that one to join a room. but it need what room we should join. then we should pass room name also
  via event.

  when you join to chat you are everytime new user. because it generate new userid for you
  */
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    // Message.find({room:data}, '-_id room author message time', (error, result)=>{
    //   if(!error){
    //     socket.emit("allmessages",result)
    //     console.log("this is mongodb ", result)
    //   }
      
    // })

    const dt=messageRef.where("room", '==', data);
    dt.get().then(querySnapshot=>{
      if(!querySnapshot.empty){
       var p= querySnapshot.docs.map(doc => Object.assign(doc.data(), {id: doc.id}));
       socket.emit("allmessages",p);
      }
    })

   
  });


  /* again we listing to another event that is call send_message
  actually in the frontend we emit event with some message data
  after we emit, this socket is on and it listning to "send message" event
  after frontend emit it then below function take that data
  */
  socket.on("send_message", (data) => {
    /*now after catch send message emit we should need to send that data to particular room
    for that we can use emit method with to
    then frontend can listen that event and they can grab that one

    we should send that emit to our room only otherwise it send that message to every room
    */
   const messageData={
    room: data.room,
    author: data.author,
    message: data.message,
    time:data.time
   }

   messageRef.add(messageData);

   const message=new Message(messageData);
   message.save().then(()=>{
    socket.to(data.room).emit("receive_message", data);
   })

  

    
  });


  /*disconnect is another pre build event in socket io. it responsiblility is whenever someone leaving our site
  show he is disconnected. */
  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});




server.listen(PORT, () => {
  console.log("SERVER RUNNING");
});

const mongoose=require('mongoose');
const schema=new mongoose.Schema({
        room: String,
        author: String,
        message: String,
        time:String
    })

const Message = mongoose.model('Message', schema);
module.exports = Message;
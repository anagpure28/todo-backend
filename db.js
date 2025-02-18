const mongoose =  require("mongoose");
require("dotenv").config()

// Connecting the database
const connection = mongoose.connect('mongodb+srv://aniket:aniket@cluster0.duy5ltf.mongodb.net/NewTodo?retryWrites=true&w=majority&appName=Cluster0')

module.exports = {
    connection
}
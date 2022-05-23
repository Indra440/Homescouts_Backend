const config = require("config");
const mongoose = require("mongoose");

const host = config.get('database.mongodb.host');
const db_name = config.get('database.mongodb.db_name');
const port = config.get('database.mongodb.port');

const connectionString = `mongodb://${host}:${port}/${db_name}`;

mongoose.connect(connectionString,{useNewUrlParser:true,useUnifiedTopology: true});

mongoose.connection
 .once("open",()=> console.log("Connected to mongodb"))
 .on("error", error=>{
    console.log("Mongodb Connection error ", error);
});

module.exports = mongoose;
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let categorySchema = new Schema({
    name:{
        type:String,
        required:true
    },
    is_active:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model("categories",categorySchema);

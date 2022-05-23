const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let buttonsSchema = new Schema({
    label:{
        type:String,
        required:true
    },
    link:{
        type:String,
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    extension_id:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'extensions'
    }
},{
    timestamps:true
});

module.exports = mongoose.model("buttons",buttonsSchema);
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let videosSchema = new Schema({
    title:{
        type:String,
        default:null
    },
    link:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    enable_banner: {
        type:Boolean,
        required:false
    },
    delay_time : {
        type:Number, // In days
        default : null,
        required : false
    },
    banner_ad:{
        type:String,
        default:null,
        required:false
    },
    banner_link:{
        type:String,
        default:null,
        required:false
    },
    is_deleted:{
        type:Boolean,
        default:false,
    }
},{
    timestamps:true
});


module.exports = mongoose.model("videos",videosSchema);
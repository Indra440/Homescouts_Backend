const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let bannersSchema = new Schema({
    image_link:{
        type:String,
        default:null,
        required:false
    },
    link:{
        type:String,
        default:null,
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    is_active:{
        type:Boolean,
        default:true
    },
    owner_id:{
        type:Schema.Types.ObjectId,
        ref:'users'
    },
    category_id:{
        type:Schema.Types.ObjectId,
        ref:'category'
    }
},{
    timestamps:true
});

module.exports = mongoose.model("banners",bannersSchema);

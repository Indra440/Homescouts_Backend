const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let extensionsSchema = new Schema({
    name:{
        type:String,
        default:null,
        required:true
    },
    description:{
        short_description:{
            type:String,
            default:null,
            required:true
        },
        long_description:{
            type:String,
            default:null,
            required:true
        }
    },
    logo:{
        small_icon:{
            type:String,
            default:null,
            required:true
        },
        medium_icon:{
            type:String,
            default:null,
            required:true
        },
        large_icon:{
            type:String,
            default:null,
            required:true
        },
        primary_logo:{
            type:String,
            default:null,
            required:true
        }
    },
    version:{
        type:String,
        required:true,
        default:null
    },
    extension_owner_id :{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    admin_id:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'users'
    },
    category_id:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'category'
    },
    enable_signup:{
        type:Boolean,
        required:false,
        default:false
    },
    signup_link:{
        type:String,
        required:false,
        default:null
    },
    is_active:{
        type:Boolean,
        default:true
    },
    global_banner:{
        type:Schema.Types.ObjectId,
        required : false,
        default : null,
        ref:'banners'
    },
    buttons:[{
        button_id:{
            type:Schema.Types.ObjectId,
            ref:'buttons'
        }
    }],
    videos:[{
        video_id:{
            type:Schema.Types.ObjectId,
            ref:'videos'
        }
    }],
    broadcast_details: {
        date_time: {
            type:String,
            default:null
        },
        content: {
            type:String,
            default:null
        },
        label : {
            type:String,
            default:null
        },
        link: {
            type:String,
            default:null
        },
        is_active: {
            type:Boolean,
            default:true
        },
        is_deleted :{
            type:Boolean,
            default:false
        }
    },
},{
    timestamps:true
});

module.exports = mongoose.model("extensions",extensionsSchema);
const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let extensionusersSchema = new Schema({
    name:{
        first_name:{
            type:String,
            required:false
        },
        last_name:{
            type:String,
            required:false
        }
    },
    email:{
        type:String,
        default:null,
        required:true,
        unique:true
    },
    associated_extension_details:[{
        extension_owner_id :{
            type:Schema.Types.ObjectId,
            ref:'users'
        },
        admin_id:{
            type:Schema.Types.ObjectId,
            ref:'users'
        },
        password:{
            type:String,
            default:null
        },
        suspended_by:{
            type:Number,
            default:0
        },
        is_deleted:{type:Boolean,default:false},
        extension_id:{
            type:Schema.Types.ObjectId,
            ref:'extensions'
        },
        broadcast_status: {
            type:Boolean,
            default:false
        },
        password_reset_token: {
            type:String,
            default:""
        }, 
        last_video_notification_id: {
            type:Schema.Types.ObjectId,
            ref:'videos',
            default: null
        },
        // broadcast_status_text : {
        //     /**
        //      * upcomming
        //      * processing
        //      * processed
        //      */
        //     type: String,
        //     default : null
        // },
        // broadcast_url : {
        //     type: String,
        //     default: null
        // }
        subscription_object : {
            type: Object,
            default: null
        }
    }],
    first_loggedin_time:{
        type:Date,
        default:null
    }
},{
    timestamps:true
});

module.exports = mongoose.model("extensionusers",extensionusersSchema);
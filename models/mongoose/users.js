const mongoose = require("mongoose");
var Schema = mongoose.Schema;

let usersSchenma = new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        default:null
    },
    name:{
        first_name:{
            type:String,
            default:null,
            required:false
        },
        last_name:{
            type:String,
            default:null,
            required:false
        }
    },
    // 1 = Super admin,2= admin,3= Extension owner
    user_type:{
        type:Number,
        default:null
    },
    associated_admin_id:{
        type:Schema.Types.ObjectId,
        default:null,
        ref:'users'
    },
    balance:{
        type:Number,
        default:null
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    manage_banner:{
        type:Boolean,
        default:false
    },
    password_reset_token: {
        type: String,
        default:""
    },
    //o :neutral/default , 1: super admin , 2 : admin , 3 : extension owner
    suspended_by:{
        type:Number,
        default:0,
    }
},{
    timestamps:true
});

module.exports = mongoose.model("users",usersSchenma);
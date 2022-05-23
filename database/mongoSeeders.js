/**
 * Name : users.seeder.js
 * Purpose: create an admin for the application
 */
const userModel = require('../models/mongoose/users')
const categoryModel =  require('../models/mongoose/categories')
// const jwt = require('jsonwebtoken');

// let superAdmin = new userModel({
//     "name" : {
//         "first_name" : "Super",
//         "last_name" : "User"
//     } ,
//     "email" : "super@user.in",
//     "password" : "$2b$10$3LA.y/JSRcUYSAwNRuTLf.rSBU6pdZQyNkjt.b2IVQuxkXxxXuFDC",
//     "user_type" : 1,
//     "associated_admin_id" : null,
//     "balance" : 0,
//     "is_deleted" : false,
//     "manage_banner" : false,
//     "suspended_by" : 0,
// });

// superAdmin.save().then((doc)=>{
//     console.log("saved",doc)
//     process.exit(1);
// }).catch((err)=>{
//     console.log(err);
//     process.exit(1);
// })







// let category = new categoryModel({
//     "name" : {
//         "first_name" : "Super",
//         "last_name" : "User"
//     } ,
//     "email" : "super@user.in",
//     "password" : "$2b$10$3LA.y/JSRcUYSAwNRuTLf.rSBU6pdZQyNkjt.b2IVQuxkXxxXuFDC",
//     "user_type" : 1,
//     "associated_admin_id" : null,
//     "balance" : 0,
//     "is_deleted" : false,
//     "manage_banner" : false,
//     "suspended_by" : 0,
// });

// category.save().then((doc)=>{
//     console.log("saved",doc)
//     process.exit(1);
// }).catch((err)=>{
//     console.log(err);
//     process.exit(1);
// })





//Function call 
// categoryModel.insertMany([ 
//     { name: 'Global' }, 
//     { name: 'BJJ Gym' }, 
//     { name: 'MMA Gym (non-bjj)' }, 
//     { name: 'Tier5 Partner' }, 
//     { name: 'Affilaite Marketer' }, 
//     { name: 'Influencer' } 
// ]).then(function(){ 
//     console.log("Default category inserted")  // Success 
// }).catch(function(error){ 
//     console.log(error)      // Failure 
// }); 
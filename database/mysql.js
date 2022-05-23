const config                  = require('config')

const Sequelize               = require('sequelize')

const db_name  = config.get('database.Mysql.db_name')
const dialect  = config.get('database.Mysql.dialect')
const username = config.get('database.Mysql.username')
const password = config.get('database.Mysql.password')
const host     = config.get('database.Mysql.host')


const sequelize = new Sequelize(db_name,username,password, {
    host: host,
    dialect: dialect,
    // pool: {
    //   max: 10,
    //   min: 0,
    //   acquire: 30000,
    //   idle: 10000
    // }
  })

  module.exports = { sequelize, Sequelize}
  
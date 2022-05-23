var Sequelize = require('sequelize');
const Op = Sequelize.Op;  
module.exports.manager = async(agentId) => {
    const {User, UserRelationship} = require('../../models/sequelise/sequelize')
    var attributes = ['id', 'reportsTo', 'userId', 'userRoleId'];
    var attributesUser = ['id','firstName','lastName','email'];
    var attributesManager = ['id','firstName','lastName','email'];
    return new Promise((resolve, reject) => { 
        UserRelationship.findAll({
        attributes:['reportsTo'],    
            where: {
                userId: agentId},
        include:[{model:User,as:'manager',attributes:attributesManager}
        ]})
        .then((data)=>{
            resolve (data)
                
        })
        .catch(error=>{
            reject(error)
        })

        
    })    

}
module.exports.agents = async(managerId) =>{
    const {User, UserRelationship,Image} = require('../../models/sequelise/sequelize')
    var attributesAgents = ['id','firstName','lastName','email'];
    return new Promise((resolve, reject) => { 
        UserRelationship.findAll({
        attributes:['reportsTo','imageId'],    
            where: {
                reportsTo: managerId},
        include:[{model:User,attributes:attributesAgents},{model:Image,attributes:['id','path']}
        ]})
        .then((data)=>{
            resolve (data)
                
        })
        .catch(error=>{
            reject(error)
        })

        
    }) 
}
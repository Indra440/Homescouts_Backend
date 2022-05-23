
module.exports.SectionWithPermission = async(userRoleId) => {
    //return ("i m in helper nupur",userRoleId)
    const {Role,SectionPermissionRelationship,Section,Permission} = require('../../models/sequelise/sequelize')
    
    let Validationrulles = []
    return new Promise((resolve, reject) => { 
        Role.count({where:{id:userRoleId}})
        .then((data)=>{
            if(data === 0){
                resolve ({
                    code     : 3,
                    message  : "Please put correct UserRoleId",
                    payload  : {}
                })
            }
            else{
                
                SectionPermissionRelationship.findAll({
                    where:{userRoleId:userRoleId},
                    include: [Section,Permission]           
                })
                .then(secprem => {
                    let AllSecPrem = JSON.stringify(secprem)
                    let result = JSON.parse(AllSecPrem)
                    let dataObject = {}
                    let permissions = []
                    let priority   = []
                    if(result.length === 0){
                        resolve ({
                            code     : 3,
                            message  : "This UserRoleID not present in sectionpermission table",
                            payload  : {}
                        })
                    }
                    Section.findAll({attributes:['name','slug'],raw:true})
                    .then(async sectiondata=>{
                        sectiondata.map((sectiondata)=>{
                            console.log(sectiondata)
                            result.map(val =>{
                                
                                if(val.section.name == sectiondata.name){
                                    
                                    if(!dataObject[val.section.name]){
                                        dataObject[val.section.name]={}
                                        permissions = []
                                        priority   = []
                                         
                                    }
                                    permissions.push(val.permission.type)
                                    dataObject[val.section.name]["permissions"] = permissions
                                    dataObject[val.section.name]["priority"]    =val.priority
                                    dataObject[val.section.name]["slug"]    =sectiondata.slug

                                    //dataObject[val.section.name].push(val.permission.id)
                                    // obj1['permission'].push(val.permission.type
                                }
                                })
                        })
                            
                        //res.send(dataObject)
                        //console.log('outsideloop',dataObject)
                        resolve (dataObject)
                        
                    })
                            
                
                })
             

            }   
        })
        .catch(error=>{
            reject(error)
        })

        
    })    

}


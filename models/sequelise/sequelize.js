// const {sequelize, Sequelize}  = require('../../database/mysql')
// const _helpers = require('../../Helpers/helpers')

// const UserModel                          = require('./users')
// const BusinessModel                      = require('./business')
// const FbPagesModel                       = require('./fbPages')
// const FbUsersModel                       = require('./fbUsers')
// const FilesModel                         = require('./files')
// const KbModel                            = require('./kb')
// const KbFilesModel                       = require('./kbFiles')
// const KbTaggingModel                     = require('./kbTagging')
// const KeywordsModel                      = require('./keywords')
// const MembershipPlansModel               = require('./membershipPlans')
// const MessagesModel                      = require('./messages')
// const PageRelationshipModel              = require('./pageRelationship')
// const PriorityModel                      = require('./priority')
// const ProductDetailsModel                = require('./productDetails')
// const ProductWebhooksModel               = require('./productWebhooks')
// const ProfileModel                       = require('./profile')
// const StatusModel                        = require('./status')
// const TaggingModel                       = require('./tagging')
// const UserRelationshipModel              = require('./userRelationship')
// const UserRoleModel                      = require('./userRole')
// const WebhookDetailsModel                = require('./webhookDetails')
// const SectionModel                       = require('./section')
// const PermissionModel                    = require('./permission')
// const SectionPermissionRelationshipModel = require('./sectionPermissionRelationship')
// const ImageModel                         = require('./image')
// const FbInfoModel                        = require('./fbInfo')



// const User                          = UserModel(sequelize, Sequelize)
// const Role                          = UserRoleModel(sequelize,Sequelize)
// const UserRelationship              = UserRelationshipModel(sequelize,Sequelize)
// const Profile                       = ProfileModel(sequelize,Sequelize)
// const Business                      = BusinessModel(sequelize,Sequelize)
// const FbPages                       = FbPagesModel(sequelize,Sequelize)
// const PageRelationship              = PageRelationshipModel(sequelize,Sequelize)
// const Section                       = SectionModel(sequelize,Sequelize)
// const Permission                    = PermissionModel(sequelize,Sequelize)
// const SectionPermissionRelationship = SectionPermissionRelationshipModel(sequelize,Sequelize)
// const Image                         = ImageModel(sequelize,Sequelize)
// const FbInfo                        = FbInfoModel(sequelize,Sequelize)


// User.hasOne(UserRelationship)
// UserRelationship.belongsTo(User)
// //UserRelationship.hasMany(UserRelationship)
// Role.hasMany(UserRelationship)
// UserRelationship.belongsTo(Role)
// Profile.hasOne(UserRelationship)
// UserRelationship.belongsTo(Profile)
// Business.hasOne(UserRelationship)
// UserRelationship.belongsTo(Business)
// FbPages.hasMany(PageRelationship)
// PageRelationship.belongsTo(FbPages)
// User.hasMany(PageRelationship)
// PageRelationship.belongsTo(User)
// Role.hasMany(SectionPermissionRelationship)
// SectionPermissionRelationship.belongsTo(Role)
// Image.hasMany(UserRelationship)
// UserRelationship.belongsTo(Image)
// UserRelationship.belongsTo(User,{as:'manager',foreignKey:'reportsTo'})
// UserRelationship.belongsTo(User,{as:'admin',foreignKey:'adminId'})
// UserRelationship.belongsTo(
//   FbInfo,
//   {   as:'fbinfo',
//       foreignKey: 'userId',
//       targetKey: 'userId',
//   }
// )

// Section.hasMany(SectionPermissionRelationship)

// SectionPermissionRelationship.belongsTo(Section)

// Permission.hasMany(SectionPermissionRelationship)

// SectionPermissionRelationship.belongsTo(Permission)

// FbInfo.belongsTo(User)
// sequelize.sync({alter:true})
//   .then(() => {
//     console.log(`Database & tables created!`)
//   })

// module.exports = {
//   User,
//   Role,
//   Profile,
//   Business,
//   Image,
//   UserRelationship,
//   FbPages,
//   PageRelationship,
//   Section,
//   Permission,
//   SectionPermissionRelationship,
//   FbInfo

// }
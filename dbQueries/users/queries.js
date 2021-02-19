const { executeGetQuery, executeGetParamsQuery, executePostOrUpdateQuery } = require('../../utils/functions.js');
let usersQueries = {}

usersQueries.getUsers = async (callback) => {
    let query = "SELECT u.userId,u.userName,u.address,u.RoleId,u.isActive,u.emailid,u.mobileNumber,d.departmentName from usermaster u LEFT JOIN departmentmaster d ON u.departmentId=d.departmentId where u.deleted='0' ORDER BY u.createdDateTime DESC";
    return executeGetQuery(query, callback)
}
usersQueries.getUsersBydepartmentType = async (departmentType, callback) => {
    let query = "SELECT u.userId,u.userName,u.emailid,u.mobileNumber,r.RoleId as roleId from usermaster u INNER JOIN rolemaster r on u.RoleId=r.RoleId where u.RoleId=? AND u.deleted='0' ORDER BY createdDateTime DESC";
    return executeGetParamsQuery(query, [departmentType == "MotherPlant" ? '2' : '3'], callback)
}
usersQueries.getUsersByRole = async (roleName, callback) => {
    let query = "SELECT u.userId,u.userName,u.emailid,u.mobileNumber,r.RoleId as roleId,r.RoleName from usermaster u INNER JOIN rolemaster r on u.RoleId=r.RoleId where r.RoleName=? AND u.deleted='0' ORDER BY createdDateTime DESC";
    return executeGetParamsQuery(query, [roleName], callback)
}
usersQueries.getUsersById = async (userId, callback) => {
    let query = "SELECT u.*,s.adharNo as dependentAdharNo,s.adhar_frontside as dependentFrontProof,s.adhar_backside as dependentBackProof,JSON_OBJECT('name',s.name,'userId',s.userId,'dob',s.dob,'gender',s.gender,'mobileNumber',s.mobileNumber,'relation',s.relation,'dependentId',s.dependentId) dependentDetails from usermaster u INNER JOIN staffDependentDetails s on u.userId=s.userId where u.userId=" + userId;
    return executeGetQuery(query, callback)
}
usersQueries.saveDependentDetails = (input, tableName, callback) => {
    let query = `insert into ${tableName} (name,dob,gender,adhar_frontside,adhar_backside,mobileNumber,relation,userId,createdDateTime,adharNo) values(?,?,?,?,?,?,?,?,?,?)`;
    const { name, dob, gender, adharProof, adharNo, mobileNumber, relation, userId } = input
    let adhar_front = Buffer.from(adharProof.Front.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let adhar_back = Buffer.from(adharProof.Back.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let requestBody = [name, dob, gender, adhar_front, adhar_back, mobileNumber, relation, userId, new Date(), adharNo]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
usersQueries.updateDependentDetails = (input, tableName, callback) => {
    let query = `update ${tableName} set name=?,dob=?,gender=?,adhar_frontside=?,adhar_backside=?,mobileNumber=?,relation=?,adharNo=? where dependentId=?`;
    const { name, dob, gender, adharProof, mobileNumber, relation, dependentId, adharNo } = input
    let adhar_front = Buffer.from(adharProof.Front.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let adhar_back = Buffer.from(adharProof.Back.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let requestBody = [name, dob, gender, adhar_front, adhar_back, mobileNumber, relation, adharNo, dependentId]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
//Update Request Methods
usersQueries.updateUserDepartment = (input, callback) => {
    const { departmentId, userId, removedAdminId } = input
    if (removedAdminId) {
        let query1 = "update usermaster set departmentId=? where userId=?";
        executePostOrUpdateQuery(query1, [null, removedAdminId])
    }
    let query = "update usermaster set departmentId=? where userId=?";
    let requestBody = [departmentId, userId];
    return executePostOrUpdateQuery(query, requestBody, callback)
}
usersQueries.deleteWebUser = (userId, callback) => {
    let query = "update usermaster set deleted=? where userId=?"
    let requestBody = [1, userId];
    return executePostOrUpdateQuery(query, requestBody, callback)
}
usersQueries.updateWebUserActiveStatus = (input, callback) => {
    const { userId, status } = input
    let query = "update usermaster set isActive=? where userId=?"
    let requestBody = [status, userId];
    return executePostOrUpdateQuery(query, requestBody, callback)
}
usersQueries.removeDepartmentAdmin = async (departmentId) => {
    let query = "UPDATE departmentmaster SET adminId=? WHERE departmentId=?";
    return executeGetParamsQuery(query, [null, departmentId])
}
module.exports = usersQueries
const { executeGetQuery, executeGetParamsQuery, executePostOrUpdateQuery } = require('../../utils/functions.js');
let usersQueries = {}

usersQueries.getUsers = async (callback) => {
    let query = "SELECT userId,userName,RoleId,emailid,mobileNumber from usermaster ORDER BY createdDateTime DESC";
    return executeGetQuery(query, callback)
}
usersQueries.getUsersBydepartmentType = async (departmentType, callback) => {
    let query = "SELECT u.userId,u.userName,u.emailid,u.mobileNumber,r.RoleName as role from usermaster u INNER JOIN rolemaster r on u.RoleId=r.RoleId where u.RoleId=? ORDER BY createdDateTime DESC";
    return executeGetParamsQuery(query, [departmentType == "MotherPlant" ? '2' : '3'], callback)
}
usersQueries.getUsersById = async (userId, callback) => {
    let query = "SELECT userId,userName,RoleId,emailid,mobileNumber from usermaster where userId=" + userId;
    return executeGetQuery(query, callback)
}
//Update Request Methods
usersQueries.updateUserDepartment = (input, callback) => {
    const { departmentId, userId } = input
    let query = "update usermaster set departmentId=? where userId=?";
    let requestBody = [departmentId, userId];
    executePostOrUpdateQuery(query, requestBody, callback)
}
module.exports = usersQueries
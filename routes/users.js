var express = require('express');
var router = express.Router();
const db = require('../config/db.js')
var bcrypt = require("bcryptjs");
const usersQueries = require('../dbQueries/users/queries.js');
const { dbError, createHash } = require('../utils/functions.js');
const auditQueries = require('../dbQueries/auditlogs/queries.js');
const { compareWebUserData, compareWebUserDependentDetails } = require('./utils/users.js');
let userId, adminUserName, userRole;

router.use(function timeLog(req, res, next) {
  userId = req.headers['userid']
  adminUserName = req.headers['username']
  userRole = req.headers['userrole']
  next();
});

router.post('/createWebUser', (req, res) => {
  // Generates hash using bCrypt

  let query = "insert into usermaster (userName,roleId,emailid,password,departmentId,mobileNumber,joinedDate,parentName,gender,dob,adharNo,address,permanentAddress,adhar_frontside,adhar_backside,accountNo,bankName,branchName,ifscCode,recommendedBy,recruitedBy,bloodGroup) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  const { userName, roleId, emailid, password = "Bibo@123", privilegeDetails = [], departmentId, mobileNumber, joinedDate, parentName, gender, dob, adharNo, address, permanentAddress, adharProof, accountNo, bankName, branchName, ifscCode, recommendedBy, recruitedBy, dependentDetails, bloodGroup } = req.body
  let adhar_frontside = adharProof && adharProof.Front && Buffer.from(adharProof.Front.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  let adhar_backside = adharProof && adharProof.Back && Buffer.from(adharProof.Back.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  let insertQueryValues = [userName, roleId, emailid, createHash(password), departmentId, mobileNumber, joinedDate, parentName, gender, dob, adharNo, address, permanentAddress, adhar_frontside, adhar_backside, accountNo, bankName, branchName, ifscCode, recommendedBy, recruitedBy, bloodGroup]
  db.query(query, insertQueryValues, (err, results) => {
    if (err) res.status(500).json(dbError(err));
    else {
      let updateQuery = 'UPDATE usermaster SET loginId=? WHERE userId=?';
      let idValue = userName.substring(0, 3) + results.insertId
      let updateValues = [idValue, results.insertId];
      db.query(updateQuery, updateValues, (updateErr, updateResults) => {
        if (updateErr) console.log(updateErr);
      })
      let obj = { ...dependentDetails, userId: results.insertId }
      const staffId = results.insertId
      usersQueries.saveDependentDetails(obj, "staffDependentDetails", (err, success) => {
        if (err) console.log("Staff Dependent Err", err)
      })
      auditQueries.createLog({ userId, description: `Staff created by ${userRole} <b>(${adminUserName})</b>`, staffId, type: "staff" })
      if (privilegeDetails.length) {
        for (let i of privilegeDetails) {
          let privilegeQuery = "insert into userPrivilegesMaster (privilegeId,privilegeActions,userId) values(?,?,?)";
          let queryValues = [i.privilegeId, i.privilegeActions.join(), results.insertId]
          db.query(privilegeQuery, queryValues, (privilegeErr, results) => {
            if (privilegeErr) res.status(500).json(dbError(privilegeErr));
            else {
              res.json({ status: 200, message: "User Added Successfully" });
            }
          })
        }
      } else res.json({ status: 200, message: "User Added Successfully" });
    }
  });
});
router.get('/getUsers', (req, res) => {
  usersQueries.getUsers((err, results) => {
    if (err) res.json(err);
    else res.json(results)
  })
})
router.get('/getUsersBydepartmentType/:departmentType', (req, res) => {
  usersQueries.getUsersBydepartmentType(req.params.departmentType, (err, results) => {
    if (err) res.json(err);
    else res.json(results)
  })
})
router.delete('/deleteWebUser/:userId', (req, res) => {
  usersQueries.deleteWebUser(req.params.userId, (err, results) => {
    if (err) res.json(err);
    else {
      auditQueries.createLog({ userId, description: `Staff deleted by ${userRole} <b>(${adminUserName})</b>`, staffId: req.params.userId, type: "staff" })
      res.json(results)
    }
  })
})
router.get('/getUsersByRole/:roleName', (req, res) => {
  usersQueries.getUsersByRole(req.params.roleName, (err, results) => {
    if (err) res.json(err);
    else res.json(results)
  })
})
router.get('/getUser/:userId', (req, res) => {
  usersQueries.getUsersById(req.params.userId, (err, results) => {
    if (err) res.json(err);
    else res.json(results)
  })
})
router.put('/updateUserStatus', (req, res) => {
  const { status } = req.body
  usersQueries.updateWebUserActiveStatus(req.body, (err, results) => {
    if (err) res.json(err);
    else {
      auditQueries.createLog({ userId, description: `Staff status changed to ${status == 1 ? 'Active' : 'Draft'} by ${userRole} <b>(${adminUserName})</b>`, staffId: req.params.userId, type: "staff" })
      res.json(results)
    }
  })
})
router.post('/updateWebUser', async (req, res) => {
  let query = "UPDATE usermaster SET userName=?,roleId=?,departmentId=?,emailid=?, mobileNumber=?, joinedDate=?, parentName=?, gender=?, dob=?, adharNo=?, address=?, permanentAddress=?,adhar_frontside=?,adhar_backside=?,accountNo=?,bankName=?,branchName=?,ifscCode=?,recommendedBy=?,recruitedBy=?,bloodGroup=?  where userId=?";
  const { userName, roleId, departmentId, emailid, mobileNumber, userId: webUserId, joinedDate, parentName, gender, dob, adharNo, address, permanentAddress, adharProof, dependentDetails, accountNo, bankName, branchName, ifscCode, recommendedBy, recruitedBy, removedDepartmentId, bloodGroup } = req.body
  let adhar_frontside = adharProof && adharProof.Front && Buffer.from(adharProof.Front.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  let adhar_backside = adharProof && adharProof.Back && Buffer.from(adharProof.Back.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  let insertQueryValues = [userName, roleId, departmentId, emailid, mobileNumber, joinedDate, parentName, gender, dob, adharNo, address, permanentAddress, adhar_frontside, adhar_backside, accountNo, bankName, branchName, ifscCode, recommendedBy, recruitedBy, bloodGroup, webUserId]
  const logs = await compareWebUserData({ userName, roleId, departmentId, emailid, mobileNumber, joinedDate, parentName, gender, dob, adharNo, address, permanentAddress, adhar_frontside, adhar_backside, accountNo, bankName, branchName, ifscCode, recommendedBy, recruitedBy, bloodGroup }, { staffId: webUserId, userId, userRole, adminUserName })
  db.query(query, insertQueryValues, async (err, results) => {
    if (err) res.send(err);
    else {
      if (removedDepartmentId) {
        usersQueries.removeDepartmentAdmin(removedDepartmentId)
      }
      if (logs.length) {
        auditQueries.createLog(logs, (err, data) => {
          if (err) console.log('log error', err)
          else console.log('log data', data)
        })
      }
      // auditQueries.createLog({ userId, description: `Staff Updated`, staffId: webUserId, type: "staff" })
      usersQueries.addDepartmentAdmin({ userId: webUserId, departmentId })
      const { name, dob, gender, adharProof, mobileNumber, relation, dependentId, adharNo } = dependentDetails
      const dependentlogs = await compareWebUserDependentDetails({ name, dob, gender, adharProof, mobileNumber, relation, adharNo }, { staffId: webUserId,dependentId, userId, userRole, adminUserName })
      usersQueries.updateDependentDetails(dependentDetails, "staffDependentDetails", (err, success) => {
        if (err) console.log("Update Staff Dependent Err", err)
        else{
          if (dependentlogs.length) {
            auditQueries.createLog(dependentlogs, (err, data) => {
              if (err) console.log('log error', err)
              else console.log('log data', data)
            })
          }
        }
      })
      // for (let i of userDetails.privilegeDetails) {
      //   let privilegeQuery = "UPDATE userPrivilegesMaster SET privilegeActions=? where privilegeId=? AND userId=?";
      //   let queryValues = [i.privilegeActions.join(), i.privilegeId, userDetails.userId]
      //   db.query(privilegeQuery, queryValues, (err, results) => {
      //     if (err) res.send(err);
      //     else {
      res.send("record updated")
      // }
      // })
      // }
    }
  });
});

router.post('/updatePassword', (req, res) => {
  // Generates hash using bCrypt
  var createHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
  }
  let query = "Update usermaster set password=? where userId=?";
  let userDetails = req.body;
  let updateQueryValues = [createHash(userDetails.password), userDetails.userId]
  db.query(query, updateQueryValues, (err, results) => {
    if (err) res.send(err);
    else {
      res.send("Password updated")
    }
  });
});



module.exports = router;

const { executeGetQuery, executeGetParamsQuery, executePostOrUpdateQuery } = require('../../utils/functions.js');
const GETDISPATCHQUERY = "SELECT d.dispatchType,d.dispatchAddress,d.DCNO,d.batchId,d.product20L,d.product1L,d.product500ML,d.product250ML,d.driverName,d.dispatchTo,d.dispatchedDate,v.vehicleType,v.vehicleNo from dispatches d INNER JOIN VehicleDetails v ON d.vehicleNo=v.vehicleId ORDER BY d.dispatchedDate DESC";
var motherPlantDbQueries = {}
motherPlantDbQueries.getProductionDetails = async (callback) => {
    let query = "select * from production ORDER BY productionDate DESC";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getProductsByBatch = async (batchId, callback) => {
    let query = `SELECT SUM(p.product20L) AS product20LCount,SUM(p.product1L) AS product1LCount,SUM(p.product500ML) product500MLCount,SUM(p.product250ML) product250MLCount FROM production p WHERE  batchId=?`;
    return executeGetParamsQuery(query, [batchId], callback)
}
motherPlantDbQueries.getBatchNumbers = async (callback) => {
    let query = "select batchId from production";
    return executeGetQuery(query, callback)
}

motherPlantDbQueries.getVehicleDetails = async (callback) => {
    let query = "select * from VehicleDetails";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getDispatchDetails = async (callback) => {
    return executeGetQuery(GETDISPATCHQUERY, callback)
}
motherPlantDbQueries.getAllQCDetails = async (callback) => {
    let query = "select * from qualitycontrol";
    return executeGetQuery(query, callback)
}

motherPlantDbQueries.getInternalQualityControl = async (callback) => {
    let query = "select * from internalqualitycontrol";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getNatureOfBussiness = async (callback) => {
    let query = "SELECT SUBSTRING(COLUMN_TYPE,5) AS natureOfBussiness FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customerorderdetails' AND COLUMN_NAME = 'isDelivered'";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getRMDetails = async (callback) => {
    let query = "select * from requiredrawmaterial";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getRMReceiptDetails = async (callback) => {
    let query = "select * from rawmaterialreceipt";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getDepartmentsList = async (deptType, callback) => {
    let query = `select * from departmentmaster where departmentType="${deptType}"`
    return executeGetQuery(query, callback)
}

motherPlantDbQueries.getCurrentProductionDetailsByDate = async (inputDate, callback) => {
    let query = "SELECT SUM(p.product20L) AS total20LCans,SUM(p.product1L) AS total1LBoxes,SUM(p.product500ML) total500MLBoxes,SUM(p.product250ML) total250MLBoxes FROM production p WHERE  DATE(`productionDate`)<='" + inputDate + "'";
    return executeGetQuery(query, callback)
}
motherPlantDbQueries.getCurrentDispatchDetailsByDate = async (input, callback) => {
    let query = "SELECT SUM(d.product20L) AS total20LCans,SUM(d.product1L) AS total1LBoxes,SUM(d.product500ML) total500MLBoxes,SUM(d.product250ML) total250MLBoxes FROM dispatches d WHERE dispatchTo='" + input.departmentId + "'AND DATE(`dispatchedDate`)<='" + input.currentDate + "'";
    return executeGetQuery(query, callback)
}


//POST Request Methods
motherPlantDbQueries.createQC = async (input, callback) => {
    let query = "insert into qualitycontrol (reportdate,batchId,testType,reportImage,description) values(?,?,?,?,?)";
    let reportImage = Buffer.from(input.reportImage.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let requestBody = [input.reportdate, input.batchId, input.testType, reportImage, input.description]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.createInternalQC = async (input, callback) => {
    let query = "insert into internalqualitycontrol (productionDate,batchId,testType,description) values(?,?,?,?,?)";
    let requestBody = [input.productionDate, input.batchId, input.testType, input.description]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.addProductionDetails = async (input, callback) => {
    let query = "insert into production (productionDate,phLevel,TDS,ozoneLevel,product20L, product1L, product500ML, product250ML,managerName,createdBy,shiftType) values(?,?,?,?,?,?,?,?,?,?,?)";
    let productionDate = new Date()
    let requestBody = [productionDate, input.phLevel, input.TDS, input.ozoneLevel, input.product20L, input.product1L, input.product500ML, input.product250ML, input.managerName, input.createdBy, input.shiftType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.addVehicleDetails = async (input, callback) => {
    let query = "insert into VehicleDetails (vehicleNo,vehicleType) values(?,?)";
    let requestBody = [input.vehicleNo, input.vehicleType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.addDispatchDetails = async (input, callback) => {
    let query = "insert into dispatches (vehicleNo,driverId,driverName,dispatchTo,batchId,product20L,product1L,product500ML,product250ML,dispatchAddress, dispatchType) values(?,?,?,?,?,?,?,?,?,?,?)";
    let requestBody = [input.vehicleNo, input.driverId, input.driverName, input.dispatchTo, input.batchId, input.product20L, input.product1L, input.product500ML, input.product250ML, input.dispatchAddress, input.dispatchType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.createRM = async (input, callback) => {
    let query = "insert into requiredrawmaterial (itemName,description,recordLevel,minOrderLevel,itemCode,vendorName) values(?,?,?,?,?,?)";
    let requestBody = [input.itemName, input.description, input.recordLevel, input.minOrderLevel, input.itemCode, input.vendorName]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.createRMReceipt = async (input, callback) => {
    let query = "insert into rawmaterialreceipt (receiptdate,receivedFromParty,invoiceNo,itemreceived,price,qtyReceived,tax,invoiceValue,rawmaterialId,invoiceDate) values(?,?,?,?,?,?,?,?,?,?)";
    let requestBody = [input.receiptdate, input.receivedFromParty, input.invoiceNo, input.itemreceived, input.price, input.qtyReceived, input.tax, input.invoiceValue, input.rawmaterialId, input.invoiceDate]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.updateProductionDetails = async (input, callback) => {
    let query = `update production set batchId=?,productionDate=?,phLevel=?,TDS=?,ozoneLevel=?,product20L=?,product1L=?,product500ML=?,product250ML=?,managerName=?,shiftType=? where productionid=${input.productionid}`;
    let requestBody = [input.batchId, input.productionDate, input.phLevel, input.TDS, input.ozoneLevel, input.product20L, input.product1L, input.product500ML, input.product250ML, input.managerName, input.shiftType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.updateRMDetails = async (input, callback) => {
    let query = `update requiredrawmaterial set orderId=?,itemName=?,description=?,recordLevel=?,minOrderLevel=?,itemCode=?,vendorName=? where rawmaterialid=${input.rawmaterialid}`;
    let requestBody = [input.orderId, input.itemName, input.description, input.recordLevel, input.minOrderLevel, input.itemCode, input.vendorName]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
motherPlantDbQueries.updateDispatchDetails = async (input, callback) => {
    let query = `update dispatches SET DCNO=?,vehicleNo=?,driverId=?,driverName=?,dispatchTo=?,batchId=?,product20L=?,product1L=?,product500ML=?,product250ML=?,managerName=?,dispatchAddress=? where dispatchId="${input.dispatchId}"`;
    let requestBody = [input.DCNO, input.vehicleNo, input.driverId, input.driverName, input.dispatchTo, input.batchId, input.product20L, input.product1L, input.product500ML, input.product250ML, input.managerName, input.dispatchAddress]
    executePostOrUpdateQuery(query, requestBody, (err, data) => {
        if (err) callback(err, data)
        else {
            let getQuery = `SELECT d.dispatchAddress,d.dispatchType,d.DCNO,d.batchId,d.product20L,d.product1L,d.product500ML,d.product250ML,d.driverName,d.dispatchTo,d.dispatchedDate,v.vehicleType,v.vehicleNo,m.departmentName from dispatches d INNER JOIN VehicleDetails v ON d.vehicleNo=v.vehicleId INNER JOIN departmentmaster m ON d.dispatchTo=m.departmentId WHERE dispatchId=${input.dispatchId}`
            executeGetQuery(getQuery, callback)
        }
    })
}
module.exports = motherPlantDbQueries
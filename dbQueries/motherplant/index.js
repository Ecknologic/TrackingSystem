const { executeGetQuery, executePostOrUpdateQuery } = require('../../utils/functions.js');

const getProductionDetails = async (callback) => {
    let query = "select * from production";
    return executeGetQuery(query, callback)

}
const getVehicleDetails = async (callback) => {
    let query = "select * from vehicleDetails";
    return executeGetQuery(query, callback)
}
const getDispatchDetails = async (callback) => {
    let query = "select * from dispatches";
    return executeGetQuery(query, callback)
}
const getAllQCDetails = async (callback) => {
    let query = "select * from qualitycontrol";
    return executeGetQuery(query, callback)
}

const getInternalQualityControl = async (callback) => {
    let query = "select * from internalqualitycontrol";
    return executeGetQuery(query, callback)
}
const getNatureOfBussiness = async (callback) => {
    let query = "SELECT SUBSTRING(COLUMN_TYPE,5) AS natureOfBussiness FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'customerorderdetails' AND COLUMN_NAME = 'isDelivered'";
    return executeGetQuery(query, callback)
}
const getRMDetails = async (callback) => {
    let query = "select * from requiredrawmaterial";
    return executeGetQuery(query, callback)
}
const getRMReceiptDetails = async (callback) => {
    let query = "select * from rawmaterialreceipt";
    return executeGetQuery(query, callback)
}




//POST Request Methods
const createQC = async (input, callback) => {
    let query = "insert into qualitycontrol (reportdate,batchNo,testType,reportImage,description) values(?,?,?,?,?)";
    let reportImage = Buffer.from(input.reportImage.replace(/^data:image\/\w+;base64,/, ""), 'base64')
    let requestBody = [input.reportdate, input.batchNo, input.testType, reportImage, input.description]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const createInternalQC = async (input, callback) => {
    let query = "insert into internalqualitycontrol (productionDate,batchNo,testType,description) values(?,?,?,?,?)";
    let requestBody = [input.productionDate, input.batchNo, input.testType, input.description]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const addProductionDetails = async (input, callback) => {
    let query = "insert into production (productionDate,phLevel,TDS,ozoneLevel,product20L, product1L, product500ML, product250ML,managerName,createdBy,shiftType) values(?,?,?,?,?,?,?,?,?,?,?)";
    let productionDate = new Date()
    let requestBody = [productionDate, input.phLevel, input.TDS, input.ozoneLevel, input.product20L, input.product1L, input.product500ML, input.product250ML, input.managerName, input.createdBy, input.shiftType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const addVehicleDetails = async (input, callback) => {
    let query = "insert into VehicleDetails (vehicleNo,vehicleType) values(?,?)";
    let requestBody = [input.vehicleNo, input.vehicleType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const addDispatchDetails = async (input, callback) => {
    let query = "insert into dispatches (dispatchId,dispatchedDate,DCNO,vehicleNo,driverName,dispatchTo,itemDispatched,qtyDispatched,batchNo) values(?,?,?,?,?,?,?,?,?)";
    let requestBody = [input.dispatchId, input.dispatchedDate, input.DCNO, input.vehicleNo, input.driverName, input.dispatchTo, input.itemDispatched, input.qtyDispatched, input.batchNo]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const createRM = async (input, callback) => {
    let query = "insert into requiredrawmaterial (itemName,description,recordLevel,minOrderLevel) values(?,?,?,?)";
    let requestBody = [input.itemName, input.description, input.recordLevel, input.minOrderLevel]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const createRMReceipt = async (input, callback) => {
    let query = "insert into rawmaterialreceipt (receiptdate,receivedFromParty,invoiceNo,itemreceived,price,qtyReceived,tax,invoiceValue,rawmaterialId,invoiceDate) values(?,?,?,?,?,?,?,?,?,?)";
    let requestBody = [input.receiptdate, input.receivedFromParty, input.invoiceNo, input.itemreceived, input.price, input.qtyReceived, input.tax, input.invoiceValue, input.rawmaterialId, input.invoiceDate]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
const updateProductionDetails = async (input, callback) => {
    let query = "update production set batchNo=?,productionDate=?,phLevel=?,TDS=?,ozoneLevel=?,product20L=?,product1L=?,product500ML=?,product250ML=?,managerName=?,shiftType=? where productionid=" + input.productionid;
    let requestBody = [input.batchNo, input.productionDate, input.phLevel, input.TDS, input.ozoneLevel, input.product20L, input.product1L, input.product500ML, input.product250ML, input.managerName, input.shiftType]
    return executePostOrUpdateQuery(query, requestBody, callback)
}
module.exports = {
    getProductionDetails, getVehicleDetails, getDispatchDetails, getAllQCDetails, createQC,
    getInternalQualityControl, createInternalQC, addProductionDetails, addVehicleDetails, getNatureOfBussiness,
    addDispatchDetails, createRM, createRMReceipt, getRMDetails, getRMReceiptDetails, updateProductionDetails
}
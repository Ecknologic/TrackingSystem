const { executeGetQuery, executeGetParamsQuery, executePostOrUpdateQuery } = require('../../utils/functions.js');
let reportsQueries = {}

reportsQueries.getNewCustomerBTDetails = async (input, callback) => {
    const { fromDate, toDate, fromStart } = input;
    let query = `SELECT c.customerNo,IFNULL(c.organizationName,c.customerName) as customerName,u.userName AS salesAgent,
    c.depositAmount,IFNULL(c.dispenserCount,0)AS dispenserCount ,SUM(cp.noOfJarsTobePlaced) quantity,
    CAST(cp.productPrice AS DECIMAL(10,2)) productPrice
    FROM customerdetails c INNER JOIN usermaster u ON c.salesAgent=u.userId INNER JOIN customerproductdetails cp ON c.customerId=cp.customerId WHERE cp.customerType='customer' AND cp.productName='20L' GROUP BY cp.customerId,cp.productPrice
     ORDER BY c.registeredDate DESC`;

    if (fromStart != 'true') {
        query = `SELECT c.customerNo,IFNULL(c.organizationName,c.customerName) as customerName,u.userName AS salesAgent,
         c.depositAmount,IFNULL(c.dispenserCount,0)AS dispenserCount ,SUM(cp.noOfJarsTobePlaced) quantity,
         CAST(cp.productPrice AS DECIMAL(10,2)) productPrice
         FROM customerdetails c INNER JOIN usermaster u ON c.salesAgent=u.userId INNER JOIN customerproductdetails cp ON c.customerId=cp.customerId WHERE cp.customerType='customer' AND cp.productName='20L' AND  DATE(c.registeredDate) BETWEEN ? AND ? GROUP BY cp.customerId,cp.productPrice
         ORDER BY c.registeredDate DESC`;
        options = [fromDate, toDate]
        return executeGetParamsQuery(query, options, callback)
    }

    return executeGetQuery(query, callback)

}

reportsQueries.getEnquiriesCountBySalesAgent = async (input, callback) => {
    const { startDate, endDate, fromStart } = input
    let query = `SELECT COUNT(c.salesAgent) AS totalCustomersCount,u.userName FROM 
    customerenquirydetails c RIGHT JOIN usermaster u ON c.salesAgent=u.userId WHERE u.RoleId=5 AND DATE(registeredDate)<=? GROUP BY c.salesAgent,u.userName`;
    let options = [endDate]

    if (fromStart != 'true') {
        query = `SELECT COUNT(c.salesAgent) AS totalCustomersCount,u.userName FROM 
        customerenquirydetails c RIGHT JOIN usermaster u ON c.salesAgent=u.userId WHERE u.RoleId=5 AND DATE(c.registeredDate) BETWEEN ? AND ? GROUP BY c.salesAgent,u.userName`;
        options = [startDate, endDate]
    }
    return executeGetParamsQuery(query, options, callback)
}

reportsQueries.getVisitedCustomersReport = async (input, callback) => {
    const { startDate, endDate, fromStart } = input
    let query = `SELECT COUNT(*) AS visitedCustomers,  SUM(revisitDate IS NOT NULL AND EmailId NOT IN (SELECT EmailId FROM customerdetails )) AS revisitCustomers
    FROM customerenquirydetails WHERE DATE(registeredDate)<=?`;
    let options = [endDate]

    if (fromStart != 'true') {
        query = `SELECT COUNT(*) AS visitedCustomers,  IFNULL(SUM(revisitDate IS NOT NULL AND EmailId NOT IN (SELECT EmailId FROM customerdetails )),0) AS revisitCustomers
        FROM customerenquirydetails WHERE  DATE(registeredDate) BETWEEN ? AND ?`;
        options = [startDate, endDate]
    }
    return executeGetParamsQuery(query, options, callback)
}

reportsQueries.getVisitedCustomersReportByStatus = async (input, callback) => {
    const { startDate, endDate, fromStart } = input
    let query = ` SELECT COUNT(*) AS customersCount,cd.isApproved FROM customerenquirydetails c
    LEFT JOIN customerdetails cd ON c.EmailId=cd.EmailId
    WHERE c.EmailId  IN (SELECT EmailId FROM customerdetails ) GROUP BY cd.isApproved`;
    let options = [endDate]

    if (fromStart != 'true') {
        query = `SELECT COUNT(*) AS customersCount,cd.isApproved FROM customerenquirydetails c
        LEFT JOIN customerdetails cd ON c.EmailId=cd.EmailId
        WHERE c.EmailId  IN (SELECT EmailId FROM customerdetails ) AND  DATE(c.registeredDate) BETWEEN ? AND ? GROUP BY cd.isApproved`;
        options = [startDate, endDate]
    }
    return executeGetParamsQuery(query, options, callback)
}

reportsQueries.getDispensersViabilityReport = async (callback) => {
    let query = `SELECT IFNULL(c.organizationName,c.customerName)AS customerName,c.customerId,
    IFNULL(c.dispenserCount,0)AS dispenserCount,MAX(cp.productPrice) AS price, 
    CAST(SUM(co.20LCans*cp.productPrice+(cp.productPrice*12/100))AS DECIMAL(10,2)) AS  invoiceAmount
     FROM customerdetails c INNER JOIN customerproductdetails cp ON c.customerId=cp.customerId INNER JOIN 
     customerorderdetails co ON c.customerNo=co.existingCustomerId
     WHERE cp.customerType='customer' AND cp.productName='20L' AND co.deliveredDate BETWEEN '2021-05-01' AND '2021-06-31'  GROUP BY c.customerId ORDER BY c.customerId
     `;
    return executeGetQuery(query, callback)
}

reportsQueries.getClosedCustomersReport = async (callback) => {
    let query = `SELECT co.existingCustomerId AS customerId,IFNULL(c.organizationName,c.customerName) AS customerName,
    IFNULL(SUM(co.20LCans-returnEmptyCans),0) AS  noOfBottlesWithCustomer,IFNULL(c.depositAmount,0) AS depositAmount,
    IFNULL(CAST(SUM(i.pendingAmount)AS DECIMAL(10,2)),0) AS pendingAmount
    FROM customerorderdetails co INNER JOIN customerdetails c ON c.customerId=co.existingCustomerId LEFT JOIN Invoice i ON 
    i.customerId=co.existingCustomerId WHERE deliveredDate BETWEEN '2021-05-01' AND '2021-06-31' GROUP BY co.existingCustomerId`;
    return executeGetQuery(query, callback)
}

reportsQueries.getInActiveCustomersReport = async (callback) => {
    let query = `SELECT co.existingCustomerId,IFNULL(c.customerName,c.organizationName) AS customerName,
    SUM(co.20LCans) AS  lastmonthQuantity,  SUM(co.20LCans*co.price20L+(co.price20L*12/100)) AS  lastmonthAmount,
    MAX(co.deliveredDate) AS lastdeliveredDate
    FROM customerorderdetails co INNER JOIN customerdetails c ON c.customerId=co.existingCustomerId
    WHERE deliveredDate BETWEEN '2021-04-01' AND '2021-04-30' GROUP BY
    co.existingCustomerId`;
    return executeGetQuery(query, callback)
}
module.exports = reportsQueries
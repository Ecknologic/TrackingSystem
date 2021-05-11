var customerQueries = require("../../dbQueries/Customer/queries");

const compareCustomerData = (data, { userId, userRole, userName }) => {
    const { customerId } = data
    return new Promise((resolve) => {
        customerQueries.getCustomerDetails(customerId, (err, results) => {
            if (err) resolve([])
            else if (results.length) {
                const oldData = results[0]
                const records = []
                const createdDateTime = new Date()
                Object.entries(data).map(([key, updatedValue]) => {
                    const oldValue = oldData[key]
                    if (oldValue != updatedValue && key != 'salesAgentName' && key != 'idProofs' && key != 'gstProof') {
                        records.push({
                            oldValue,
                            updatedValue,
                            createdDateTime,
                            userId,
                            description: `Updated Customer ${key} by ${userRole} <b>(${userName})</b>`,
                            customerId,
                            type: "customer"
                        })
                    }
                })
                resolve(records)
            }
            else {
                resolve([])
            }
        })
    })
}


const compareCustomerDeliveryData = (data, { deliveryDetailsId, customerId, userId, userRole, userName }) => {
    return new Promise((resolve) => {
        customerQueries.getDeliveryDetailsById({ deliveryDetailsId }).then(results => {
            if (results.length) {
                const oldData = results[0]
                const records = []
                const createdDateTime = new Date()
                Object.entries(data).map(([key, updatedValue]) => {
                    const oldValue = oldData[key]
                    if (oldValue != updatedValue && key != 'idProofs' && key != 'gstProof') {
                        records.push({
                            oldValue,
                            updatedValue,
                            createdDateTime,
                            userId,
                            description: `Updated Customer Delivery Details ${key} by ${userRole} <b>(${userName})</b>`,
                            customerId,
                            type: "customer"
                        })
                    }
                })
                resolve(records)
            }
            else {
                resolve([])
            }
        })
    })
}

const compareProductsData = (data, { type = "customer", customerId, userId, userRole, userName }) => {
    const { productId, productName } = data;
    return new Promise((resolve) => {
        customerQueries.getProductDetailsById(productId, (err, results) => {
            if (err) resolve([])
            else if (results.length) {
                const oldData = results[0]
                const records = []
                const createdDateTime = new Date()
                Object.entries(data).map(([key, updatedValue]) => {
                    const oldValue = oldData[key]
                    if (oldValue != updatedValue && key != 'idProofs' && key != 'gstProof') {
                        records.push({
                            oldValue,
                            updatedValue,
                            createdDateTime,
                            userId,
                            description: `Updated ${type == 'customer' ? 'Customer' : 'Distributor'} product ${getProductKeyName(productName, key)} by ${userRole} <b>(${userName})</b>`,
                            customerId,
                            type
                        })
                    }
                })
                resolve(records)
            }
            else {
                resolve([])
            }
        })
    })
}
const compareOrderData = (data, { departmentId, transactionId, userId, userRole, userName }) => {
    return new Promise((resolve) => {
        customerQueries.getOrderDetails(transactionId, (err, results) => {
            if (err) resolve([])
            else if (results.length) {
                const oldData = results[0]
                const records = []
                const createdDateTime = new Date()
                Object.entries(data).map(([key, updatedValue]) => {
                    let oldValue = oldData[key]
                    if (oldValue != updatedValue && key != 'routeName' && key != 'driverName' && key != 'idProofs' && key != 'gstProof') {
                        const { routeName, driverName } = data
                        const { routeName: route, driverName: driver } = oldData
                        oldValue = key == 'routeId' ? route : driver
                        updatedValue = key == 'routeId' ? routeName : driverName
                        records.push({
                            oldValue,
                            updatedValue,  //Need routeName and driverName from frontEnd
                            createdDateTime,
                            userId,
                            description: `Updated DC ${getDCKeyName(key)} by ${userRole} <b>(${userName})</b>`,
                            transactionId,
                            departmentId,
                            type: 'warehouse', subType: 'delivery'
                        })
                    }
                })
                resolve(records)
            }
            else {
                resolve([])
            }
        })
    })
}

const compareCustomerOrderData = (data, { departmentId, transactionId, userId, userRole, userName }) => {
    return new Promise((resolve) => {
        customerQueries.getOrderDetailsById(transactionId, (err, results) => {
            if (err) resolve([])
            else if (results.length) {
                const oldData = results[0]
                const records = []
                const createdDateTime = new Date()
                Object.entries(data).map(([key, updatedValue]) => {
                    let oldValue = oldData[key]
                    if (oldValue != updatedValue && key != 'routeName' && key != 'vehicleName' && key != 'driverName') {
                        const { routeName, driverName, vehicleName } = data
                        const { routeName: route, driverName: driver, vehicleName: vehicle } = oldData
                        updatedValue = key == 'routeId' ? routeName : key == 'driverId' ? driverName : vehicleName
                        oldValue = key == 'routeId' ? route : key == 'driverId' ? driver : vehicle
                        records.push({
                            oldValue,
                            updatedValue,  //Need routeName and driverName from frontEnd
                            createdDateTime,
                            userId,
                            description: `Updated order ${getDCKeyName(key)} by ${userRole} <b>(${userName})</b>`,
                            transactionId,
                            departmentId,
                            type: 'warehouse', subType: 'order'
                        })
                    }
                })
                resolve(records)
            }
            else {
                resolve([])
            }
        })
    })
}

const getProductKeyName = (productName, key) => {
    if (key == 'noOfJarsTobePlaced') return `${productName} quantity`
    else if (key == 'productPrice') return `${productName} price`
}

const getDCKeyName = (key) => {
    if (key == 'routeId') return `route`
    else if (key == 'driverId') return `driver`
    else if (key == 'vehicleId') return `vehicle`
}
module.exports = { compareCustomerData, compareCustomerOrderData, compareProductsData, compareCustomerDeliveryData, compareOrderData }
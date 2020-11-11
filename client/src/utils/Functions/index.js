export const editData = (updatedItem, data, idField) => {
    return new Promise(resolve => {
        if (data.length) {
            const updatedData = []
            data.map(item => {
                if (item[idField] === updatedItem[idField]) {
                    item = updatedItem
                }
                updatedData.push(item)
            })
            resolve(updatedData)
        } else resolve([])
    })
}
export const blobToBase64 = (blob) => {
    const content = new Uint8Array(blob);

    return URL.createObjectURL(
        new Blob([content.buffer], { type: 'image/png' })
    );
}
// export const blobToBase64 = (blob, callback) => {
// var reader = new FileReader();
// const modified = new Blob(blob)
// reader.readAsDataURL(modified);
// reader.onloadend = function () {
//     var base64data = reader.result;
//     console.log("base64data", base64data)
//     return base64data
// }
// const content = new Uint8Array(blob);
// var newBlob = URL.createObjectURL(
//     new Blob([content.buffer], { type: 'image/png' })
// );
// // var newBlob = new Blob([blob], { type: 'image/png' });

// // Define the FileReader which is able to read the contents of Blob
// var reader = new FileReader();
// reader.readAsDataURL(newBlob)
// // The magic always begins after the Blob is successfully loaded
// reader.onload = function () {
//     // Since it contains the Data URI, we should remove the prefix and keep only Base64 string
//     var b64 = reader.result
//     // .replace(/^data:.+;base64,/, '');
//     // console.log(b64); //-> "V2VsY29tZSB0byA8Yj5iYXNlNjQuZ3VydTwvYj4h"
//     callback(b64)
//     // Decode the Base64 string and show result just to make sure that everything is OK
//     // var html = atob(b64);
//     // console.log(html); //-> "Welcome to <b>base64.guru</b>!"
// };

// Since everything is set up, let’s read the Blob and store the result as Data URI
// reader.readAsDataURL(blob);
// }
export const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}
export const stringToHslColor = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    var h = hash % 360;
    return 'hsl(' + h + ', 45%, 45%)';
}
export const getCleanObject = (data) => {
    return Object.entries(data).reduce((a, [k, v]) => (v === null ? a : (a[k] = v, a)), {})
}

export const getSideMenuKey = (path) => {
    switch (path) {
        case '/bibowarehouse':
            return '/dashboard'
        default:
            return path
    }
}

export const deepClone = (data) => {
    return JSON.parse(JSON.stringify(data))
}

export const getIdProofName = (type) => {
    switch (type) {
        case 'adharNo':
            return 'Aadhar Number'
        case 'panNo':
            return 'PAN Number'
        case 'dlNo':
            return 'Driving License Number'
        case 'passportNo':
            return 'Passport Number'
    }
}

export const getIdProofKey = (data) => {
    const { panNo, adharNo, dlNo, passportNo } = data

    if (panNo) return 'panNo'
    if (adharNo) return 'adharNo'
    if (dlNo) return 'dlNo'
    if (passportNo) return 'passportNo'
}

export const getDeliveryDays = (data = []) => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    const daysObj = {}
    days.map((day) => {
        if (data.includes(day)) {
            daysObj[day] = 1
        } else daysObj[day] = 0
    })
    return daysObj
}
export const getDevDays = (data = {}) => {
    const days = []
    const { SUN, MON, TUE, WED, THU, FRI, SAT } = data
    if (Number(SUN)) days.push('SUN')
    if (Number(MON)) days.push('MON')
    if (Number(TUE)) days.push('TUE')
    if (Number(WED)) days.push('WED')
    if (Number(THU)) days.push('THU')
    if (Number(FRI)) days.push('FRI')
    if (Number(SAT)) days.push('SAT')

    return days
}
export const getProductsForDB = ({ product20L, price20L, product1L, price1L, product500ML, price500ML }) => {
    const products = []
    const item1 = { productName: '20L', productPrice: price20L, noOfJarsTobePlaced: product20L }
    const item2 = { productName: '1L', productPrice: price1L, noOfJarsTobePlaced: product1L }
    const item3 = { productName: '500ML', productPrice: price500ML, noOfJarsTobePlaced: product500ML }
    if (price20L && product20L) products.push(item1)
    if (price1L && product1L) products.push(item2)
    if (price500ML && product500ML) products.push(item3)

    return products
}

export const getIdProofsForDB = (data) => {
    const { Front, Back } = data
    const idProofs = [Front, Back]

    return idProofs
}
export const getDevDaysForDB = (data = []) => {
    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    const daysObj = {}
    days.map((day) => {
        if (data.includes(day)) {
            daysObj[day] = 1
        } else daysObj[day] = 0
    })
    return daysObj
}

export const extractGADeliveryDetails = ({ address, depositAmount, mobileNumber, contactPerson }) => {
    return { address, depositAmount, phoneNumber: mobileNumber, contactPerson }
}

export const extractGADetails = ({ gstNo, customerName, registeredDate,
    invoicetype, EmailId, idProofType, gstProof, referredBy, address }) => {
    return {
        gstNo, customerName, registeredDate, invoicetype, EmailId,
        idProofType, gstProof, referredBy, Address1: address
    }
}

export const getAddressesForDB = (data) => {
    return data.map((address) => {
        const { devDays, product20L, price20L, product1L, price1L, product500ML, price500ML, ...rest } = address
        const products = getProductsForDB({ product20L, price20L, product1L, price1L, product500ML, price500ML })
        const deliveryDays = getDevDaysForDB(devDays)
        return { products, deliveryDays, ...rest }
    })
}
import dayjs from 'dayjs';

export const TRACKFORM = 'trackForm'
export const MANDATORY = "Mandatory Field";
export const MARKETINGADMIN = 'SalesAndMarketing'
export const MARKETINGMANAGER = 'MarketingManager'
export const WAREHOUSEADMIN = 'WarehouseAdmin'
export const SUPERADMIN = 'SuperAdmin'
export const ACCOUNTSADMIN = 'Accounts'
export const MOTHERPLANTADMIN = 'MotherPlantAdmin'
export const TODAYDATE = dayjs().format('YYYY-MM-DD')

export const getUserId = () => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) return user.USERID
    return 1
}

export const getRole = () => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) return user.ROLE
    return null
}

export const getWarehoseId = () => {
    const user = JSON.parse(sessionStorage.getItem('user'))
    if (user) return user.WAREHOUSEID
    return 1
}

export const getRoutesByRole = (role) => {
    switch (role) {
        case MARKETINGADMIN:
            return ['/add-customer', '/manage-accounts', '/invoices']

        case MARKETINGMANAGER:
            return ['/add-customer', '/manage-accounts', '/invoices']

        case SUPERADMIN:
            return ['/customers', '/materials', '/motherplants', '/warehouses', '/staff', '/drivers',
                '/products', '/routes', '/distributors', '/invoices', '/roles']

        case ACCOUNTSADMIN:
            return ['/customers', '/invoices']

        case WAREHOUSEADMIN:
            return ['/manage-stock', '/manage-routes', '/manage-empty-cans', '/drivers', '/manage-invoices']

        case MOTHERPLANTADMIN:
            return ['/manage-production', '/manage-dispatches', '/manage-materials', '/manage-qc', '/manage-return-cans']

        default:
            return ['']
    }
}
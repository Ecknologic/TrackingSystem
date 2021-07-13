import axios from 'axios';
import dayjs from 'dayjs';
import { message } from 'antd';
import { useParams } from 'react-router-dom';
import React, { Fragment, useEffect, useState, useMemo } from 'react';
import AccountView from '../../views/Account';
import { http } from '../../../../modules/http'
import ClosureForm from '../../forms/Closure';
import Spinner from '../../../../components/Spinner';
import ScrollUp from '../../../../components/ScrollUp';
import NoContent from '../../../../components/NoContent';
import { DATEFORMAT } from '../../../../utils/constants';
import CustomButton from '../../../../components/CustomButton';
import { validateEnquiryValues, validateNumber, validateIFSCCode } from '../../../../utils/validations';
import { getCustomerIdOptions, getDepartmentOptions, getLocationOptions, getRouteOptions } from '../../../../assets/fixtures';
import { isEmpty, showToast, getProductsWithIdForDB, extractProductsFromForm, resetTrackForm } from '../../../../utils/Functions';
import '../../../../sass/employees.scss'

const ManageClosedCustomer = ({ setHeaderContent, onGoBack }) => {
    const { closingId } = useParams()
    const [formData, setFormData] = useState({})
    const [accData, setAccData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [accErrors, setAccErrors] = useState({})
    const [loading, setLoading] = useState(true)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [editMode, setEditMode] = useState('')
    const [shake, setShake] = useState(false)
    const [customerList, setCustomerList] = useState([])
    const [warehouseList, setWarehouseList] = useState([])
    const [locationList, setLocationList] = useState([])
    const [routeList, setRouteList] = useState([])

    const routeOptions = useMemo(() => getRouteOptions(routeList), [routeList])
    const warehouseOptions = useMemo(() => getDepartmentOptions(warehouseList), [warehouseList])
    const customerOptions = useMemo(() => getCustomerIdOptions(customerList), [customerList])
    const locationOptions = useMemo(() => getLocationOptions(locationList), [locationList])
    const source = useMemo(() => axios.CancelToken.source(), []);
    const config = { cancelToken: source.token }

    useEffect(() => {
        getClosedCustomer()

        return () => {
            http.ABORT(source)
        }
    }, [])

    useEffect(() => {
        if (editMode) {
            getRouteList()
            getCustomerList()
            getWarehouseList()
        }
    }, [editMode])

    const getCustomerList = async () => {
        const url = 'customer/getCustomerIdsByAgent'

        try {
            const data = await http.GET(axios, url, config)
            setCustomerList(data)
        } catch (error) { }
    }

    const getRouteList = async () => {
        const url = `customer/getRoutes/0`

        try {
            const data = await http.GET(axios, url, config)
            setRouteList(data)
        } catch (error) { }
    }

    const getDeliveryLocations = async (id) => {
        const url = `customer/getCustomerDeliveryIds?customerId=${id}`

        try {
            const data = await http.GET(axios, url, config)
            setLocationList(data)
        } catch (error) { }
    }

    const getDeliveryDetails = async (id) => {
        const url = `customer/getDepositDetailsByDeliveryId?deliveryId=${id}`

        try {
            const [data] = await http.GET(axios, url, config)
            setFormData(prev => ({ ...prev, ...data, totalAmount: data.balanceAmount }))
        } catch (error) { }
    }

    const getWarehouseList = async () => {
        const url = 'bibo/getDepartmentsList?departmentType=Warehouse'

        try {
            const data = await http.GET(axios, url, config)
            setWarehouseList(data)
        } catch (error) { }
    }

    const getClosedCustomer = async () => {
        const url = `customer/getCustomerClosingDetails/${closingId}`

        try {
            const [data] = await http.GET(axios, url, config)
            const { accountDetails, ...rest } = data
            const { customerName } = rest

            setHeaderContent({ title: customerName })
            setFormData(rest)
            setAccData(accountDetails)
            setLoading(false)
        } catch (error) { }
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'customerId') {
            const [{ customerName }] = customerList.filter(item => item.customerId === value)
            setFormData(prev => ({ ...prev, customerName }))
            resetDeliveryDetails()
            getDeliveryLocations(value)
        }
        else if (key === 'deliveryDetailsId') {
            getDeliveryDetails(value)
        }
        else if (numerics.includes(key)) {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))

            if (!error) {
                if (key === 'pendingAmount') {
                    const balanceAmount = Number(value) + Number(formData.depositAmount || 0)
                    const totalAmount = balanceAmount + Number(formData.missingCansAmount || 0)
                    setFormData(prev => ({ ...prev, balanceAmount, totalAmount }))
                }
                else if (key === 'depositAmount') {
                    const balanceAmount = Number(value) + Number(formData.pendingAmount || 0)
                    const totalAmount = balanceAmount + Number(formData.missingCansAmount || 0)
                    setFormData(prev => ({ ...prev, balanceAmount, totalAmount }))
                }
                else if (key === 'balanceAmount') {
                    const totalAmount = Number(value) + Number(formData.missingCansAmount || 0)
                    setFormData(prev => ({ ...prev, totalAmount }))
                }
                else if (key === 'missingCansAmount') {
                    const totalAmount = Number(value) + Number(formData.balanceAmount || 0)
                    setFormData(prev => ({ ...prev, totalAmount }))
                }
            }
        }
    }

    const handleAccChange = (value, key) => {
        setAccData(data => ({ ...data, [key]: value }))
        setAccErrors(errors => ({ ...errors, [key]: '' }))
    }

    const handleAccBlur = (value, key) => {

        // Validations
        if (key === 'ifscCode') {
            const error = validateIFSCCode(value, true)
            setAccErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleUpdate = async () => {
        const formErrors = validateEnquiryValues(formData)

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }

        const productsUI = extractProductsFromForm(formData)
        const products = getProductsWithIdForDB(productsUI)
        const revisitDate = formData.revisitDate ? dayjs(formData.revisitDate).format(DATEFORMAT) : null

        let body = { ...formData, revisitDate, products }
        const url = 'customer/updateCustomerClosingDetails'
        const options = { item: 'Customer Closure', v1Ing: 'Updating', v2: 'updated' }

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.PUT(axios, url, body, config)
            showToast(options)
            resetTrackForm()
            setEditMode(false)
            setBtnDisabled(false)
        } catch (error) {
            message.destroy()
            if (!axios.isCancel(error)) {
                setBtnDisabled(false)
            }
        }
    }

    const resetDeliveryDetails = () => {
        const data = {
            deliveryDetailsId: null,
            depositAmount: null, noOfCans: null,
            pendingAmount: null, totalAmount: null
        }
        setFormData(prev => ({ ...prev, ...data }))
    }

    const handleEdit = () => {
        setEditMode(true)
    }

    return (
        <Fragment>
            <ScrollUp dep={editMode} />
            <div className='app-manage-content employee-manage-content p-0'>
                {
                    loading
                        ? <NoContent content={<Spinner />} />
                        : <>
                            <div className='employee-title-container'>
                                <span className='title'>Enquiry Details</span>
                            </div>
                            {
                                editMode ? (
                                    <>
                                        <ClosureForm
                                            data={formData}
                                            accData={accData}
                                            errors={formErrors}
                                            accErrors={accErrors}
                                            onAccBlur={handleAccBlur}
                                            onChange={handleChange}
                                            onAccChange={handleAccChange}
                                            routeOptions={routeOptions}
                                            customerOptions={customerOptions}
                                            locationOptions={locationOptions}
                                            warehouseOptions={warehouseOptions}
                                        />
                                    </>
                                ) :
                                    <>
                                        <AccountView data={formData} accData={accData} />
                                    </>
                            }
                            <div className={`app-footer-buttons-container ${editMode ? 'edit' : 'view'}`}>
                                <CustomButton onClick={onGoBack} className='app-cancel-btn footer-btn' text='Cancel' />
                                {
                                    editMode
                                        ? <CustomButton onClick={handleUpdate} className={`app-create-btn footer-btn ${btnDisabled && 'disabled'} ${shake && 'app-shake'} `} text='Update' />
                                        : (
                                            <div className='multi-buttons-container'>
                                                <CustomButton onClick={handleEdit} className='footer-btn' text='Edit' />
                                            </div>
                                        )
                                }
                            </div>
                        </>
                }
            </div>
        </Fragment>
    )
}
const numerics = [
    'pendingAmount', 'depositAmount', 'balanceAmount',
    'missingCansAmount', 'noOfCans', 'collectedCans',
    'missingCansCount', 'missingCansAmount', 'totalAmount'
]
export default ManageClosedCustomer

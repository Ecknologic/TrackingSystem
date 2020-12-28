import { Tabs } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { getRouteOptions, WEEKDAYS } from '../../../assets/fixtures';
import ConfirmMessage from '../../../components/ConfirmMessage';
import { DocIconWhite } from '../../../components/SVG_Icons';
import CustomButton from '../../../components/CustomButton';
import CustomModal from '../../../components/CustomModal';
import QuitModal from '../../../components/CustomModal';
import NoContent from '../../../components/NoContent';
import DeliveryDetails from './tabs/DeliveryDetails';
import AccountOverview from './tabs/AccountOverview';
import { TRACKFORM } from '../../../utils/constants';
import DeliveryForm from '../add/forms/Delivery';
import { http } from '../../../modules/http';
import Header from './header';
import { validateDeliveryValues, validateDevDays, validateIDNumbers, validateMobileNumber, validateNames, validateNumber } from '../../../utils/validations';
import { extractDeliveryDetails, getProductsForDB, extractProductsFromForm, isEmpty, getDevDaysForDB, getBase64, resetTrackForm, showToast } from '../../../utils/Functions';

const ViewAccount = () => {
    const history = useHistory()
    const { accountId } = useParams()
    const [account, setAccount] = useState({ loading: true })
    const [headerContent, setHeaderContent] = useState({ loading: true })
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [viewModal, setViewModal] = useState(false)
    const [devDays, setDevDays] = useState([])
    const [devDaysError, setDevDaysError] = useState({})
    const [routes, setRoutes] = useState([])
    const [recentDelivery, setRecentDelivery] = useState({})
    const [btnDisabled, setBtnDisabled] = useState(false)
    const routeOptions = useMemo(() => getRouteOptions(routes), [routes])
    const [confirmModal, setConfirmModal] = useState(false)
    const [shake, setShake] = useState(false)
    const [navigateTo, setNavigateTo] = useState('')

    useEffect(() => {
        getAccount()
        getRoutes()
    }, [])

    const getAccount = async () => {
        const url = `/customer/getCustomerDetailsById/${accountId}`
        try {
            const { data: [data = {}] } = await http.GET(url)
            const { customerName, organizationName, Address1 } = data
            setAccount({ ...data, loading: false })
            setHeaderContent({
                title: organizationName || customerName,
                address: Address1, loading: false
            })
        } catch (error) { }
    }

    const getRoutes = async () => {
        try {
            const data = await http.GET('/motherPlant/getDepartmentsList?departmentType=warehouse')
            setRoutes(data)
        } catch (ex) { }
    }

    const handleDevDaysSelect = (value) => {
        setDevDaysError({ devDays: '' })
        if (value == 'ALL') setDevDays(WEEKDAYS)
        else {
            const clone = [...devDays]
            clone.push(value)
            setDevDays(clone)
        }
    }

    const handleDevDaysDeselect = (value) => {
        if (value == 'ALL') setDevDays([])
        else {
            const filtered = devDays.filter(day => day !== value && day !== "ALL")
            setDevDays(filtered)
        }
    }

    const handleProofUpload = (file, name) => {
        getBase64(file, async (buffer) => {
            setFormData(data => ({ ...data, [name]: buffer }))
            setFormErrors(errors => ({ ...errors, [name]: '' }))
        })
    }

    const handleProofRemove = (name) => {
        setFormData(data => ({ ...data, [name]: '' }))
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'gstNo') {
            const error = validateIDNumbers(key, value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        if (key === 'deliveryLocation') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'phoneNumber') {
            const error = validateMobileNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'depositAmount') {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'contactPerson') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key.includes('price') || key.includes('product')) {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, productNPrice: error }))
        }
    }

    const handleBlur = (value, key) => {
        // Validations
        if (key === 'gstNo') {
            const error = validateIDNumbers(key, value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'phoneNumber') {
            const error = validateMobileNumber(value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleCreate = async () => {
        const deliveryErrors = validateDeliveryValues(formData)
        const devDaysError = validateDevDays(devDays)

        if (!isEmpty(deliveryErrors) || !isEmpty(devDaysError)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(deliveryErrors)
            setDevDaysError(devDaysError)
            return
        }

        const productsUI = extractProductsFromForm(formData)
        const products = getProductsForDB(productsUI)
        const deliveryDays = getDevDaysForDB(devDays)
        const formValues = extractDeliveryDetails(formData)
        const body = [{ ...formValues, isNew: true, delete: 0, isActive: 0, products, deliveryDays, customer_Id: accountId }]

        const url = '/customer/updateDeliveryDetails'
        try {
            setBtnDisabled(true)
            showToast('Delivery details', 'loading')
            let { data: [data = {}] } = await http.POST(url, body)
            setRecentDelivery(data)
            showToast('Delivery details', 'success')
            onModalClose(true)
        } catch (error) {
            setBtnDisabled(false)
        }
    }

    const onAddNewDelivery = useCallback(() => {
        setViewModal(true)
    }, [])

    const handleBack = () => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged) {
            setConfirmModal(true)
            setNavigateTo('back')
        }
        else history.push('/manage-accounts')
    }

    const onModalClose = (hasSaved) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged && !hasSaved) {
            return setConfirmModal(true)
        }
        setViewModal(false)
        setBtnDisabled(false)
        setFormData({})
        setDevDays([])
        setFormErrors({})
        setDevDaysError({})
        resetTrackForm()

        if (navigateTo === 'back') {
            history.push('/manage-accounts')
        }
    }

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false);
        resetTrackForm()
        onModalClose()
    }, [navigateTo])

    const handleAccountUpdate = useCallback((title, address) => {
        setHeaderContent({ title, address })
    }, [])

    const handleConfirmModalCancel = useCallback(() => {
        setConfirmModal(false)
        setNavigateTo('')
    }, [])

    const handleModalCancel = useCallback(() => onModalClose(), [])

    return (
        <Fragment>
            <Header data={headerContent} onClick={handleBack} />
            <div className='account-view-content'>
                <div className='app-tabs-container'>
                    <Tabs
                        tabBarExtraContent={
                            <CustomButton
                                className='extra-btn'
                                onClick={onAddNewDelivery}
                                icon={<DocIconWhite />}
                                text='Add new Delivery address' />
                        }
                    >
                        <TabPane tab="Account Overview" key="1">
                            <AccountOverview data={account} routeOptions={routeOptions} onUpdate={handleAccountUpdate} />
                        </TabPane>
                        <TabPane tab="Delivery Details" key="2">
                            <DeliveryDetails recentDelivery={recentDelivery} routeOptions={routeOptions} />
                        </TabPane>
                        <TabPane tab="Invoice" key="3">
                            <NoContent content='Design in progress' />
                        </TabPane>
                        <TabPane tab="Report Log" key="4">
                            <NoContent content='Design in progress' />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
            <CustomModal
                className={`app-form-modal ${shake ? 'app-shake' : ''}`}
                visible={viewModal}
                btnDisabled={btnDisabled}
                onOk={handleCreate}
                onCancel={handleModalCancel}
                title='Add New Delivery Address'
                okTxt='Save'
            >
                <DeliveryForm
                    data={formData}
                    errors={formErrors}
                    devDays={devDays}
                    devDaysError={devDaysError}
                    routeOptions={routeOptions}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    onUpload={handleProofUpload}
                    onRemove={handleProofRemove}
                    onSelect={handleDevDaysSelect}
                    onDeselect={handleDevDaysDeselect}
                />
            </CustomModal>
            <QuitModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </QuitModal>
        </Fragment>
    )
}
const { TabPane } = Tabs;
export default ViewAccount

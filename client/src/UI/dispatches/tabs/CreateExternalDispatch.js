import { message, Radio } from 'antd';
import React, { useState, useCallback, useEffect } from 'react';
import CustomButton from '../../../components/CustomButton';
import FormHeader from '../../../components/FormHeader';
import ExternalDispatchForm from '../forms/ExternalDispatch';
import ConfirmModal from '../../../components/CustomModal';
import { TRACKFORM } from '../../../utils/constants';
import ConfirmMessage from '../../../components/ConfirmMessage';
import InputLabel from '../../../components/InputLabel';
import { http } from '../../../modules/http';
import { extractValidProductsForDB, isEmpty, removeFormTracker, resetTrackForm, showToast, trackAccountFormOnce } from '../../../utils/Functions';
import { validateExternalDispatchValues, validateMobileNumber, validateNames, validateNumber } from '../../../utils/validations';

const CreateExternalDispatch = ({ goToTab, driverList, ...rest }) => {
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [currentStock, setCurrentStock] = useState({})
    const [shake, setShake] = useState(false)

    useEffect(() => {
        resetTrackForm()
        trackAccountFormOnce()

        return () => {
            removeFormTracker()
        }
    }, [])

    const getCurrentStock = async (batchId) => {
        const data = await http.GET(`/motherPlant/getProductByBatch/${batchId}`)
        setCurrentStock(data)
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        if (key === 'batchId') getCurrentStock(value)

        // Validations
        if (key === 'driverId') {
            let selectedDriver = driverList.find(driver => driver.driverId === Number(value))
            let { driverName = null, mobileNumber = null } = selectedDriver || {}
            setFormData(data => ({ ...data, driverName, mobileNumber }))
            setFormErrors(errors => ({ ...errors, mobileNumber: '' }))
        }
        if (key === 'managerName') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'mobileNumber') {
            const error = validateMobileNumber(value)
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
        if (key === 'mobileNumber') {
            const error = validateMobileNumber(value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleSubmit = async () => {
        const formErrors = validateExternalDispatchValues(formData, currentStock)

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }
        const products = extractValidProductsForDB(formData)

        let body = {
            ...formData, dispatchType: 'External', dispatchTo: 3, ...products
        }
        const url = '/motherPlant/addDispatchDetails'
        try {
            setBtnDisabled(true)
            showToast('Dispatch', 'loading')
            await http.POST(url, body)
            message.destroy()
            goToTab('1')
            showToast('Dispatch', 'success')
        } catch (error) {
            message.destroy()
            setBtnDisabled(false)
        }
    }

    const onModalClose = (hasSaved) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged && !hasSaved) {
            return setConfirmModal(true)
        }
        setBtnDisabled(false)
        setFormData({})
        setFormErrors({})
    }

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false);
        resetTrackForm()
        onModalClose()
    }, [])
    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])

    return (
        <>
            <FormHeader title='Create Dispatch DC (Outside)' />
            <ExternalDispatchForm
                track
                data={formData}
                errors={formErrors}
                onChange={handleChange}
                onBlur={handleBlur}
                {...rest}
            />
            {/* <div className='input-container'>
                <InputLabel name='Select Payment Mode' mandatory />
                <Radio.Group size='large' options={plainOptions} onChange={() => { }} />
            </div> */}
            <div className='app-footer-buttons-container'>
                <CustomButton
                    onClick={handleSubmit}
                    className={`
                    app-create-btn footer-btn ${btnDisabled ? 'disabled' : ''} 
                    ${shake ? 'app-shake' : ''}
                `}
                    text='Create'
                />
            </div>
            <ConfirmModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </ConfirmModal>
        </>
    )
}
const plainOptions = ['Add Debit/Credit/ATM Card', 'Add Net Banking', 'Pay on Delivery (Cash/UPI/Card)'];
export default CreateExternalDispatch
import { message } from 'antd';
import React, { useState } from 'react';
import ProductForm from '../forms/Product';
import { http } from '../../../modules/http';
import { validateIntFloat, validateNumber } from '../../../utils/validations';
import CustomButton from '../../../components/CustomButton';
import { isAlphaNum, isEmpty, resetTrackForm, showToast } from '../../../utils/Functions';

const CreateProduct = ({ goToTab }) => {
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [shake, setShake] = useState(false)

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'productName') {
            const isValid = isAlphaNum(value)
            if (!isValid) setFormErrors(errors => ({ ...errors, [key]: 'Enter aphanumeric only' }))
        }
        else if (key === 'tax') {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'price') {
            const error = validateIntFloat(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleBlur = (value, key) => {

        // Validations
        if (key === 'price') {
            const error = validateIntFloat(value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleSubmit = async () => {
        const formErrors = {}
        const { productName, price, tax } = formData
        if (!price) formErrors.price = 'Required'
        else {
            const error = validateIntFloat(price, true)
            if (error) formErrors.price = error
        }
        if (!tax) formErrors.tax = 'Required'
        else {
            const error = validateNumber(tax)
            if (error) formErrors.tax = error
        }
        if (!productName) formErrors.productName = 'Required'
        else {
            const isValid = isAlphaNum(productName)
            if (!isValid) formErrors.productName = 'Enter aphanumeric only'
        }

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }

        let body = { ...formData }
        const url = '/products/createProduct'
        const options = { item: 'Product', v1Ing: 'Adding', v2: 'added' }

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.POST(url, body)
            showToast(options)
            goToTab('1')
            resetForm()
        } catch (error) {
            message.destroy()
            setBtnDisabled(false)
        }
    }

    const resetForm = () => {
        setBtnDisabled(false)
        resetTrackForm()
        setFormData({})
        setFormErrors({})
    }

    return (
        <>
            <div className='employee-title-container'>
                <span className='title'>New Product Details</span>
            </div>
            <ProductForm
                data={formData}
                errors={formErrors}
                onChange={handleChange}
                onBlur={handleBlur}
            />
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
        </>
    )
}

export default CreateProduct
import dayjs from 'dayjs';
import { message } from 'antd';
import React, { useEffect, useState } from 'react';
import { http } from '../../../../modules/http';
import { base64String, extractCADetails, extractGADetails, getBase64, getIdProofsForDB, isEmpty, removeFormTracker, resetTrackForm, showToast, trackAccountFormOnce } from '../../../../utils/Functions';
import CustomButton from '../../../../components/CustomButton';
import CorporateAccountForm from '../../add/forms/CorporateAccount';
import NoContent from '../../../../components/NoContent';
import Spinner from '../../../../components/Spinner';
import { validateIDProofs, validateAccountValues, validateIDNumbers, validateMobileNumber, validateNames, validateEmailId, validateNumber } from '../../../../utils/validations';
import GeneralAccountForm from '../../add/forms/GeneralAccount';
import { WEEKDAYS } from '../../../../assets/fixtures';

const AccountOverview = ({ data, warehouseOptions, onUpdate }) => {
    const { gstProof, idProof_backside, idProof_frontside, isActive, registeredDate,
        customertype, Address1, loading } = data

    const [btnDisabled, setBtnDisabled] = useState(false)
    const [accountValues, setAccountValues] = useState({})
    const [accountErrors, setAccountErrors] = useState({})
    const [IDProofs, setIDProofs] = useState({})
    const [IDProofErrors, setIDProofErrors] = useState({})
    const [devDays, setDevDays] = useState([])
    const [devDaysError, setDevDaysError] = useState({})
    const [shake, setShake] = useState(false)

    useEffect(() => {
        if (!loading) {
            const gst = base64String(gstProof?.data)
            const Front = base64String(idProof_frontside?.data)
            const Back = base64String(idProof_backside?.data)

            const newData = {
                ...data, gstProof: gst, address: Address1,
                registeredDate: dayjs(registeredDate).format('YYYY-MM-DD')
            }
            setIDProofs({ Front, Back })
            setAccountValues(newData)
        }
    }, [loading])

    useEffect(() => {
        resetTrackForm()
        trackAccountFormOnce()

        return () => resetTrackForm()
    }, [])

    const handleChange = (value, key) => {
        setAccountValues(data => ({ ...data, [key]: value }))
        setAccountErrors(errors => ({ ...errors, [key]: '' }))

        if (value === 'adharNo' || value === 'panNo') {
            setAccountValues(data => ({ ...data, [value]: '' }))
            setAccountErrors(errors => ({ ...errors, [value]: '' }))
        }

        // Validations
        if (key === 'adharNo' || key === 'panNo' || key === 'gstNo') {
            const error = validateIDNumbers(key, value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'organizationName' || key === 'customerName' || key === 'referredBy') {
            const error = validateNames(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'mobileNumber') {
            const error = validateMobileNumber(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'creditPeriodInDays') {
            const error = validateNumber(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'EmailId') {
            const error = validateEmailId(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
    }
    const handleBlur = (value, key) => {
        // Validations
        if (key === 'adharNo' || key === 'panNo' || key === 'gstNo') {
            const error = validateIDNumbers(key, value, true)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'mobileNumber') {
            const error = validateMobileNumber(value, true)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleProofUpload = (file, name) => {
        getBase64(file, async (buffer) => {
            if (name === 'gstProof') {
                setAccountValues(data => ({ ...data, [name]: buffer }))
                setAccountErrors(errors => ({ ...errors, [name]: '' }))
            }
            else if (name === 'idProofs') {
                const clone = { ...IDProofs }
                const { Front } = clone
                if (Front) {
                    clone.Back = buffer
                    setIDProofErrors(errors => ({ ...errors, Back: '' }))
                }
                else {
                    clone.Front = buffer
                    setIDProofErrors(errors => ({ ...errors, Front: '' }))
                }
                setIDProofs(clone)
            }
            else if (name === 'Front' || name === 'Back') {
                setIDProofErrors(errors => ({ ...errors, [name]: '' }))
                const clone = { ...IDProofs }
                clone[name] = buffer
                setIDProofs(clone)
            }
        })
    }

    const handleDevDaysSelect = (value) => {
        setDevDaysError({ devDays: '' })
        if (value == 'ALL') setDevDays(WEEKDAYS)
        else {
            const clone = [...devDays]
            clone.push(value)
            if (clone.length === 7) clone.push('ALL')
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

    const handleProofRemove = (name) => {
        if (name === 'gstProof') setAccountValues(data => ({ ...data, [name]: '' }))
        else if (name === 'Front') setIDProofs(data => ({ ...data, Front: '' }))
        else if (name === 'Back') setIDProofs(data => ({ ...data, Back: '' }))
    }

    const renderFooter = () => {
        return (<div className='app-footer-buttons-container footer'>
            {/* <CustomButton
                className='app-cancel-btn footer-btn'
                text='Cancel'
            /> */}
            <CustomButton
                onClick={handleAccountUpdate}
                className={`
                app-create-btn footer-btn ${btnDisabled ? 'disabled' : ''} 
                ${shake ? 'app-shake' : ''}
                `}
                text='Update Account'
            />
        </div>)
    }

    const handleAccountUpdate = async () => {
        const { idProofType } = accountValues
        const IDProofError = validateIDProofs(IDProofs, idProofType)
        const accountErrors = validateAccountValues(accountValues, customertype, true)

        if (!isEmpty(accountErrors) || !isEmpty(IDProofError)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setIDProofErrors(IDProofError)
            setAccountErrors(accountErrors)
            return
        }
        const idProofs = getIdProofsForDB(IDProofs, idProofType)
        const account = customertype === 'Corporate' ? extractCADetails(accountValues) : extractGADetails(accountValues)

        const url = '/customer/updateCustomer'
        const body = { ...account, idProofs }
        const options = { item: 'Customer', v1Ing: 'Updating', v2: 'updated' }

        const { Address1, organizationName } = account

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.POST(url, body)
            setBtnDisabled(false)
            resetTrackForm()
            onUpdate(organizationName, Address1)
            showToast(options)
        } catch (error) {
            setBtnDisabled(false)
            message.destroy()
        }
    }

    return (

        <div className='account-view-account-overview'>
            {
                loading ? <NoContent content={<Spinner />} />
                    : <>
                        {
                            customertype === 'Corporate' ?
                                <CorporateAccountForm
                                    data={accountValues}
                                    errors={accountErrors}
                                    IDProofs={IDProofs}
                                    IDProofErrors={IDProofErrors}
                                    onUpload={handleProofUpload}
                                    onRemove={handleProofRemove}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isActive}
                                />
                                : <GeneralAccountForm
                                    data={accountValues}
                                    errors={accountErrors}
                                    IDProofs={IDProofs}
                                    IDProofErrors={IDProofErrors}
                                    devDays={devDays}
                                    devDaysError={devDaysError}
                                    warehouseOptions={warehouseOptions}
                                    onUpload={handleProofUpload}
                                    onRemove={handleProofRemove}
                                    onSelect={handleDevDaysSelect}
                                    onDeselect={handleDevDaysDeselect}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    disabled={isActive}
                                    accountOnly
                                />
                        }
                        {
                            !isActive && renderFooter()
                        }
                    </>
            }

        </div>
    )
}


export default AccountOverview
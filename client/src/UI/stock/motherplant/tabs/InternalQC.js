import axios from 'axios';
import { message } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import InternalQCForm from '../forms/InternalQC';
import { http } from '../../../../modules/http';
import CustomButton from '../../../../components/CustomButton';
import FormHeader from '../../../../components/FormHeader';
import ConfirmModal from '../../../../components/CustomModal';
import ConfirmMessage from '../../../../components/ConfirmMessage';
import { shiftOptions } from '../../../../assets/fixtures';
import { isEmpty, resetTrackForm, showToast } from '../../../../utils/Functions';
import { validateQCValues, validateIntFloat, validateNames } from '../../../../utils/validations';

const InternalQC = () => {
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [shake, setShake] = useState(false)

    const source = useMemo(() => axios.CancelToken.source(), []);
    const config = { cancelToken: source.token }

    useEffect(() => {
        return () => {
            http.ABORT(source)
        }
    }, [])

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'managerName') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'phLevel' || key === 'ozoneLevel' || key === 'TDS') {
            const error = validateIntFloat(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleBlur = (value, key) => {
        // Validations
        if (key === 'phLevel' || key === 'ozoneLevel' || key === 'TDS') {
            const error = validateIntFloat(value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleSubmit = async () => {
        const formErrors = validateQCValues(formData)

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }

        const url = 'motherPlant/createProductionQC'
        const body = {
            ...formData
        }
        const options = { item: 'QC Request', v1Ing: 'Sending', v2: 'sent' }

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.POST(axios, url, body, config)
            resetForm()
            showToast(options)
        } catch (error) {
            message.destroy()
            if (!axios.isCancel(error)) {
                setBtnDisabled(false)
            }
        }
    }

    const resetForm = () => {
        setBtnDisabled(false)
        resetTrackForm()
        setFormData({})
        setFormErrors({})
    }

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false);
        resetTrackForm()
        resetForm()
    }, [])
    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])

    return (
        <>
            <FormHeader title='Add Request Quality Control (Internal)' />
            <InternalQCForm
                track
                data={formData}
                errors={formErrors}
                shiftOptions={shiftOptions}
                onChange={handleChange}
                onBlur={handleBlur}
            />
            <div className='app-footer-buttons-container'>
                <CustomButton
                    onClick={handleSubmit}
                    disabled={btnDisabled}
                    className={`
                        app-create-btn footer-btn
                        ${shake ? 'app-shake' : ''}
                    `}
                    text='Send'
                />
            </div>
            <ConfirmModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure you want to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </ConfirmModal>
        </>
    )
}

export default InternalQC
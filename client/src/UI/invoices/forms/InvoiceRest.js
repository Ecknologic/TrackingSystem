import React, { useEffect } from 'react';
import InputLabel from '../../../components/InputLabel';
import CustomTextArea from '../../../components/CustomTextArea';
import { resetTrackForm, trackAccountFormOnce } from '../../../utils/Functions';
import InputValue from '../../../components/InputValue';

const InvoiceRestForm = ({ data, billingAddress, errors, onChange }) => {

    const { TAndC } = data
    const { emailLabel } = billingAddress

    useEffect(() => {
        resetTrackForm()
        trackAccountFormOnce()

        return () => {
            resetTrackForm()
        }
    }, [])

    return (
        <div className='app-form-container invoice-form-container'>
            <div className='row'>
                <div className='input-container stretch'>
                    <InputLabel name='Terms & Conditions' error={errors.TAndC} mandatory />
                    <CustomTextArea maxLength={100} error={errors.TAndC} placeholder='Add Terms & Conditions' value={TAndC}
                        maxRows={4} onChange={(value) => onChange(value, 'TAndC')}
                    />
                </div>
            </div>
            <div className='row'>
                <div className='input-container stretch'>
                    <InputLabel name='Email To' error={errors.emailId} />
                    <InputValue size='large' value={emailLabel} />
                </div>
            </div>
        </div>
    )
}
export default InvoiceRestForm
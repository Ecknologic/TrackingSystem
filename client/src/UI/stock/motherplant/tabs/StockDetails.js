import React from 'react';
import CASMPPanel from '../../../../components/CASMPPanel';
import CustomButton from '../../../../components/CustomButton';
import FormHeader from '../../../../components/FormHeader';
import BatchForm from '../forms/BatchForm';

const StockDetails = () => {

    const { btnDisabled, shake, handleAccountUpdate } = {}
    return (
        <>
            <CASMPPanel data={{}} />
            <FormHeader title='Create Production Batch' showShift />
            <BatchForm data={{}} errors={{}} />
            <div className='app-footer-buttons-container'>
                <CustomButton
                    onClick={handleAccountUpdate}
                    className={`
                    app-create-btn footer-btn ${btnDisabled ? 'disabled' : ''} 
                    ${shake ? 'app-shake' : ''}
                `}
                    text='Create Batch'
                />
            </div>
        </>
    )
}

export default StockDetails
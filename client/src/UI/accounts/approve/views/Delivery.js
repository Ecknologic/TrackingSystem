import React from 'react';
import InputValue from '../../../../components/InputValue';
import UploadPreviewer from '../../../../components/UploadPreviewer';
import InputLabel from '../../../../components/InputLabel';

const DeliveryView = ({ data }) => {

    const {
        gstNo, gstProof, departmentName, devDays, phoneNumber, contactPerson, routeName, product20L, price20L,
        product2L, product1L, price2L, price1L, product500ML, price500ML, product300ML, price300ML
    } = data

    const days = devDays.includes('ALL') ? ['All Days'] : devDays
    return (
        <>
            <div className='app-view-info'>
                {
                    gstNo && gstProof && (
                        <div className='row half-stretch'>
                            <div className='input-container'>
                                <InputValue size='smaller' value='GST Number' />
                                <InputValue size='large' value={gstNo} />
                            </div>
                            <div className='input-container'>
                                <InputValue size='smaller' value='GST Proof' />
                                <div className='upload-preview-container'>
                                    <UploadPreviewer value={gstProof} disabled />
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className='row half-stretch'>
                    <div className='input-container'>
                        <InputValue size='smaller' value='Warehouse' />
                        <InputValue size='large' value={departmentName} />
                    </div>
                    <div className='input-container'>
                        <InputValue size='smaller' value='Route' />
                        <InputValue size='large' value={routeName} />
                    </div>
                </div>
                <div className='row half-stretch'>
                    <div className='input-container'>
                        <InputValue size='smaller' value='Delivery Days' />
                        <InputValue size='large' value={days.join(', ')} />
                    </div>
                </div>
                <div className='columns'>
                    <InputLabel name='Stock Particulars' />
                    <div className='columns-container'>
                        <div className='column'>
                            <div className='input-container'>
                                <InputLabel name='20 Ltrs' />
                                <InputValue value={product20L} />
                            </div>
                            <div className='input-container'>
                                <InputLabel name='Unit Price' />
                                <InputValue value={price20L} />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='input-container'>
                                <InputLabel name='1 Ltrs (Box-1&times;12)' />
                                <InputValue value={product2L} />
                            </div>
                            <div className='input-container'>
                                <InputLabel name='Unit Price' />
                                <InputValue value={price2L} />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='input-container'>
                                <InputLabel name='1 Ltrs (Box-1&times;12)' />
                                <InputValue value={product1L} />
                            </div>
                            <div className='input-container'>
                                <InputLabel name='Unit Price' />
                                <InputValue value={price1L} />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='input-container'>
                                <InputLabel name='500 Ml (Box-1&times;24)' />
                                <InputValue value={product500ML} />
                            </div>
                            <div className='input-container'>
                                <InputLabel name='Unit Price' />
                                <InputValue value={price500ML} />
                            </div>
                        </div>
                        <div className='column'>
                            <div className='input-container'>
                                <InputLabel name='300 Ml (Box-1&times;30)' />
                                <InputValue value={product300ML} />
                            </div>
                            <div className='input-container'>
                                <InputLabel name='Unit Price' />
                                <InputValue value={price300ML} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='row half-stretch'>
                    <div className='input-container'>
                        <InputValue size='smaller' value='Contact Person' />
                        <InputValue size='large' value={contactPerson} />
                    </div>
                    <div className='input-container'>
                        <InputValue size='smaller' value='Contact Number' />
                        <InputValue size='large' value={phoneNumber} />
                    </div>
                </div>
            </div>
        </>
    )
}
export default DeliveryView
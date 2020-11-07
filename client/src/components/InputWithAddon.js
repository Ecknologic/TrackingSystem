import { Input } from 'antd';
import React from 'react';

const InputWithAddon = ({ label, placeholder, onChange }) => {
    return (
        <Input
            className='input-has-addon'
            size='large'
            placeholder={placeholder}
            addonAfter={<AddOnBtn label={label} />}
            onChange={onChange}
        />
    )
}

const AddOnBtn = ({ label }) => {
    return (
        <div className='app-input-addon-button'>
            <span>{label}</span>
        </div>
    )
}
export default InputWithAddon
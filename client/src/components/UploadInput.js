import React from 'react';
import { Upload } from 'antd'

const UploadInput = ({ onUpload, disabled, children }) => {

    const props = {
        accept: ".png,.jpg,.jpeg",
        customRequest: (e) => onUpload(e.file),
        className: `upload-input-container ${disabled ? 'disabled' : ''}`,
        showUploadList: false,
        disabled
    }

    return (
        <Upload {...props}>
            {children}
        </Upload>
    )
}

export default UploadInput
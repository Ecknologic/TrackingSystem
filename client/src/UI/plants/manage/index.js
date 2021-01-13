import { message } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import React, { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import Header from './header';
import AccountView from '../views/Account';
import { http } from '../../../modules/http'
import PlantForm from '../forms/CreatePlant';
import Spinner from '../../../components/Spinner';
import ScrollUp from '../../../components/ScrollUp';
import NoContent from '../../../components/NoContent';
import QuitModal from '../../../components/CustomModal';
import IDProofInfo from '../../../components/IDProofInfo';
import CustomButton from '../../../components/CustomButton';
import ConfirmMessage from '../../../components/ConfirmMessage';
import { getRoleOptions, getStaffOptions } from '../../../assets/fixtures';
import { isEmpty, showToast, base64String, getMainPathname, getBase64, getValidDate, getPlantValuesForDB } from '../../../utils/Functions';
import { TRACKFORM } from '../../../utils/constants';
import {
    validateIDNumbers, validateNames, validateMobileNumber, validateEmailId, validateIDProofs,
    validateEmployeeValues,
    validatePinCode,
    validatePlantValues
} from '../../../utils/validations';
import '../../../sass/plants.scss'
const DATEFORMAT = 'YYYY-MM-DD'

const ManagePlant = () => {
    const { plantId } = useParams()
    const history = useHistory()
    const { pathname } = useLocation()
    const [accountValues, setAccountValues] = useState({ loading: true })
    const [headerContent, setHeaderContent] = useState({})
    const [loading, setLoading] = useState(true)
    const [gstProof, setGstProof] = useState({})
    const [confirmModal, setConfirmModal] = useState(false)
    const [accountErrors, setAccountErrors] = useState({})
    const [editMode, setEditMode] = useState(false)
    const [shake, setShake] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [plantType, setPlantType] = useState('')
    const [staffList, setStaffList] = useState([])
    const [admin, setAdmin] = useState({})

    const isDriver = plantType === 'Driver'
    const mainUrl = useMemo(() => getMainPathname(pathname), [pathname])
    const staffOptions = useMemo(() => getStaffOptions(staffList), [staffList])

    useEffect(() => {
        getPlantType()
        getPlant()
    }, [])

    const getPlant = async () => {
        const url = `${getUrl(mainUrl)}/${plantId}`

        const [data] = await http.GET(url)
        const { gstProof: gst, userName, mobileNumber, emailid, ...rest } = data
        const { departmentName, gstNo } = rest
        const gstProof = base64String(gst?.data)

        setGstProof({ Front: gstProof, idProofType: 'gstNo', gstNo })
        setHeaderContent({ title: departmentName })
        setAccountValues(rest)
        setAdmin({ userName, mobileNumber, emailid })
        setLoading(false)
    }

    const getPlantType = () => {
        const type = mainUrl === '/warehouses' ? 'Warehouse' : 'MotherPlant'
        setPlantType(type)
        return type
    }

    const getStaffList = async (type) => {
        const data = await http.GET(`/users/getUsersBydepartmentType/${type}`)
        setStaffList(data)
    }

    const handleChange = (value, key) => {
        setAccountValues(data => ({ ...data, [key]: value }))
        setAccountErrors(errors => ({ ...errors, [key]: '' }))

        if (key === 'adminId') {
            const admin = staffList.find(staff => staff.userId === value)
            setAdmin(admin)
        }

        // Validations
        if (key === 'gstNo') {
            const error = validateIDNumbers(key, value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'departmentName' || key === 'city' || key === 'state') {
            const error = validateNames(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'pinCode') {
            const error = validatePinCode(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'phoneNumber') {
            const error = validateMobileNumber(value)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleBlur = (value, key) => {
        // Validations

        if (key === 'gstNo') {
            const error = validateIDNumbers(key, value, true)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'pinCode') {
            const error = validatePinCode(value, true)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'phoneNumber') {
            const error = validateMobileNumber(value, true)
            setAccountErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleUpload = (file) => {
        getBase64(file, async (buffer) => {
            setAccountValues(data => ({ ...data, gstProof: buffer }))
            setAccountErrors(errors => ({ ...errors, gstProof: '' }))
        })
    }

    const handleRemove = () => setAccountValues(data => ({ ...data, gstProof: '' }))

    const handleUpdate = async () => {
        const formErrors = validatePlantValues(accountValues)

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setAccountErrors(formErrors)
            return
        }

        const motherplant = getPlantValuesForDB(accountValues)
        let body = {
            ...motherplant
        }
        const url = `${mainUrl.slice(0, -1)}/create${plantType}`
        const options = { item: plantType, v1Ing: 'Adding', v2: 'added' }


        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.POST(url, body)
            showToast(options)
            goBack()
        } catch (error) {
            message.destroy()
            setBtnDisabled(false)
        }
    }

    const handleEdit = () => {
        getStaffList(plantType)
        setEditMode(true)
    }

    const onAccountCancel = useCallback(() => goBack(), [])
    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])
    const handleConfirmModalOk = useCallback(() => { setConfirmModal(false); goBack() }, [])

    const handleBack = () => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged) {
            setConfirmModal(true)
        }
        else goBack()
    }

    const goBack = () => history.push(mainUrl)

    return (
        <Fragment>
            <ScrollUp dep={editMode} />
            <Header data={headerContent} onClick={handleBack} />
            <div className='app-manage-content plant-manage-content'>
                {
                    loading
                        ? <NoContent content={<Spinner />} />
                        : <>
                            <div className='plant-title-container'>
                                <span className='title'>{plantType} Details</span>
                            </div>
                            {
                                editMode
                                    ? (
                                        <PlantForm
                                            admin={admin}
                                            title={plantType}
                                            data={accountValues}
                                            errors={accountErrors}
                                            staffOptions={staffOptions}
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                            onUpload={handleUpload}
                                            onRemove={handleRemove}
                                        />
                                    )
                                    : <>
                                        <IDProofInfo data={gstProof} />
                                        <AccountView
                                            admin={admin}
                                            data={accountValues}
                                        />
                                    </>
                            }
                            <div className={`app-footer-buttons-container ${editMode ? 'edit' : 'view'}`}>
                                <CustomButton onClick={onAccountCancel} className='app-cancel-btn footer-btn' text='Cancel' />
                                {
                                    editMode
                                        ? <CustomButton onClick={handleUpdate} className={`app-create-btn footer-btn ${btnDisabled && 'disabled'} ${shake && 'app-shake'}`} text='Update' />
                                        : (
                                            <div className='multi-buttons-container'>
                                                <CustomButton onClick={handleEdit} className='footer-btn' text='Edit' />
                                            </div>
                                        )
                                }
                            </div>
                        </>
                }
            </div>
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

const getUrl = (url) => {
    const mpUrl = '/motherPlant/getMotherPlantById'
    const whUrl = '/warehouse/getWarehouseById'

    if (url === '/motherplants') return mpUrl
    return whUrl
}

const updateUrl = (url) => {
    const staffUrl = '/users/updateWebUser'
    const driverUrl = '/driver/updateDriver'

    if (url === '/staff') return staffUrl
    return driverUrl
}

export default ManagePlant

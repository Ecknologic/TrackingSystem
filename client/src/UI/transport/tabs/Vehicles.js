import axios from 'axios';
import { Menu, message, Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import VehicleForm from '../forms/Vehicle';
import { http } from '../../../modules/http'
import Actions from '../../../components/Actions';
import Spinner from '../../../components/Spinner';
import useUser from '../../../utils/hooks/useUser';
import CustomModal from '../../../components/CustomModal';
import { vehicleColumns } from '../../../assets/fixtures';
import DeleteModal from '../../../components/CustomModal';
import ConfirmModal from '../../../components/CustomModal';
import { validateNames } from '../../../utils/validations';
import ConfirmMessage from '../../../components/ConfirmMessage';
import { SUPERADMIN, TRACKFORM } from '../../../utils/constants';
import CustomPagination from '../../../components/CustomPagination';
import { EditIconGrey, TrashIconGrey } from '../../../components/SVG_Icons';
import { deepClone, isAlphaNum, isEmpty, resetTrackForm, showToast } from '../../../utils/Functions';

const VehiclesDashboard = ({ reFetch }) => {
    const { ROLE } = useUser()
    const [vehicles, setVehicles] = useState([])
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(12)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalCount, setTotalCount] = useState(null)
    const [editModal, setEditModal] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [shake, setShake] = useState(false)
    const [modalDelete, setModalDelete] = useState(false)
    const [currentId, setCurrentId] = useState('')

    const isSuperAdmin = useMemo(() => ROLE === SUPERADMIN, [])
    const options = useMemo(() => getOptions(isSuperAdmin), [])
    const source = useMemo(() => axios.CancelToken.source(), []);
    const config = { cancelToken: source.token }

    useEffect(() => {
        return () => {
            http.ABORT(source)
        }
    }, [])

    useEffect(() => {
        setLoading(true)
        getVehicles()
    }, [reFetch])

    const getVehicles = async () => {
        const url = 'bibo/getVehicleDetails'

        try {
            const data = await http.GET(axios, url, config)
            setVehicles(data)
            setTotalCount(data.length)
            setLoading(false)
        } catch (error) { }
    }

    const handlePageChange = (number) => {
        setPageNumber(number)
    }

    const handleSizeChange = (number, size) => {
        setPageSize(size)
        setPageNumber(number)
    }

    const handleMenuSelect = (key, data) => {
        if (key === 'edit') {
            setFormData(data)
            setEditModal(true)
        }
        else if (key === 'delete') {
            setModalDelete(true)
            setCurrentId(data.vehicleId)
        }
    }

    const handleDelete = async (id) => {
        const options = { item: 'Vehicle', v1Ing: 'Deleting', v2: 'deleted' }
        const url = `motherPlant/deleteVehicle/${id}`

        try {
            showToast({ ...options, action: 'loading' })
            await http.DELETE(axios, url, config)
            optimisticDelete(id)
            showToast(options)
        } catch (error) {
            message.destroy()
        }
    }

    const optimisticDelete = (id) => {
        const filtered = vehicles.filter(item => item.vehicleId !== id)
        setVehicles(filtered)
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'vehicleName' || key === 'vehicleType') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'vehicleNo') {
            const isValid = isAlphaNum(value)
            if (!isValid) setFormErrors(errors => ({ ...errors, [key]: 'Enter aphanumeric only' }))
        }
    }

    const handleSubmit = async () => {
        const formErrors = {}
        const { vehicleName, vehicleType, vehicleNo } = formData

        if (!vehicleType) formErrors.vehicleType = 'Required'
        else {
            const error = validateNames(vehicleType)
            if (error) formErrors.vehicleType = error
        }
        if (!vehicleName) formErrors.vehicleName = 'Required'
        else {
            const error = validateNames(vehicleName)
            if (error) formErrors.vehicleName = error
        }
        if (!vehicleNo) formErrors.vehicleNo = 'Required'
        else {
            const isValid = isAlphaNum(vehicleNo)
            if (!isValid) formErrors.vehicleNo = 'Enter aphanumeric only'
        }

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }

        let body = { ...formData }
        const url = 'motherPlant/updateVehicle'
        const options = { item: 'Vehicle', v1Ing: 'Updating', v2: 'updated' }

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            await http.POST(axios, url, body, config)
            showToast(options)
            optimisticUpdate(formData)
            onModalClose(true)
        } catch (error) {
            message.destroy()
            if (!axios.isCancel(error)) {
                setBtnDisabled(false)
            }
        }
    }

    const onModalClose = (hasUpdated) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged && !hasUpdated) {
            return setConfirmModal(true)
        }
        setEditModal(false)
        setFormData({})
        setFormErrors({})
        resetTrackForm()
        setBtnDisabled(false)
    }

    const optimisticUpdate = (data) => {
        let clone = deepClone(vehicles);
        const index = clone.findIndex(item => item.vehicleId === data.vehicleId)
        clone[index] = data;
        setVehicles(clone)
    }

    const dataSource = useMemo(() => vehicles.map((transport) => {
        const { vehicleId: key, vehicleName, vehicleNo, vehicleType } = transport

        return {
            key,
            vehicleName,
            vehicleNo,
            vehicleType,
            action: <Actions options={options} onSelect={({ key }) => handleMenuSelect(key, transport)} />
        }
    }), [vehicles])

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false)
        resetTrackForm()
        onModalClose()
    }, [])
    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])
    const handleModalCancel = useCallback(() => onModalClose(), [])
    const handleDeleteModalOk = useCallback(() => {
        setModalDelete(false);
        handleDelete(currentId)
    }, [currentId])

    const handleDeleteModalCancel = useCallback(() => {
        setModalDelete(false)
    }, [])

    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize

    return (
        <div className='product-container employee-manager-content'>
            <div className='app-table dispatch-table'>
                <Table
                    loading={{ spinning: loading, indicator: <Spinner /> }}
                    dataSource={dataSource.slice(sliceFrom, sliceTo)}
                    columns={vehicleColumns}
                    pagination={false}
                    scroll={{ x: true }}
                />
            </div>
            {
                !!totalCount && (
                    <CustomPagination
                        total={totalCount}
                        pageSize={pageSize}
                        current={pageNumber}
                        onChange={handlePageChange}
                        pageSizeOptions={['10', '20', '30', '40', '50']}
                        onPageSizeChange={handleSizeChange}
                    />)
            }
            <CustomModal
                okTxt='Update'
                title='Vehicle Details'
                visible={editModal}
                btnDisabled={btnDisabled}
                onOk={handleSubmit}
                onCancel={handleModalCancel}
                className={`app-form-modal ${shake ? 'app-shake' : ''}`}
            >
                <VehicleForm
                    data={formData}
                    errors={formErrors}
                    onChange={handleChange}
                />
            </CustomModal>
            <ConfirmModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure you want to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </ConfirmModal>
            <DeleteModal
                visible={modalDelete}
                onOk={handleDeleteModalOk}
                onCancel={handleDeleteModalCancel}
                title='Are you sure you want to delete?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='This action cannot be undone.' />
            </DeleteModal>
        </div>
    )
}

const getOptions = (isSuperAdmin) => {
    const options = [
        <Menu.Item key="edit" icon={<EditIconGrey />}>Edit</Menu.Item>,
        <Menu.Item key="delete" icon={<TrashIconGrey />}>Delete</Menu.Item>
    ]

    if (!isSuperAdmin) options.pop()
    return options
}

export default VehiclesDashboard

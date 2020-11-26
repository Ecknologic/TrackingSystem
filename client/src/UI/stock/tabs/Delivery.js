import { Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { http } from '../../../modules/http';
import SelectInput from '../../../components/SelectInput';
import { deliveryColumns, getRouteOptions, getDriverOptions } from '../../../assets/fixtures';
import CustomButton from '../../../components/CustomButton';
import SearchInput from '../../../components/SearchInput';
import { PlusIcon, LinesIconGrey } from '../../../components/SVG_Icons';
import Spinner from '../../../components/Spinner';
import TableAction from '../../../components/TableAction';
import CustomModal from '../../../components/CustomModal';
import DCForm from '../forms/DCForm';
import QuitModal from '../../../components/CustomModal';
import ConfirmMessage from '../../../components/ConfirmMessage';
import { validateMobileNumber, validateNames, validateNumber, validateDCValues } from '../../../utils/validations';
import { isEmpty, resetTrackForm, getDCValuesForDB, showToast, deepClone } from '../../../utils/Functions';
import { getWarehoseId, TRACKFORM } from '../../../utils/constants';
import CustomPagination from '../../../components/CustomPagination';

const Delivery = ({ date }) => {
    const warehouseId = getWarehoseId()
    const [routes, setRoutes] = useState([])
    const [selectedRoutes, setSelectedRoutes] = useState([])
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [deliveriesClone, setDeliveriesClone] = useState([])
    const [deliveries, setDeliveries] = useState([])
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [DCModal, setDCModal] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [shake, setShake] = useState(false)

    const routeOptions = useMemo(() => getRouteOptions(routes), [routes])
    const driverOptions = useMemo(() => getDriverOptions(drivers), [drivers])

    const customerOrderIdRef = useRef()
    const DCFormTitleRef = useRef()
    const DCFormBtnRef = useRef()

    useEffect(() => {
        getRoutes()
        getDrivers()
    }, [])

    useEffect(() => {
        getDeliveries()
    }, [date])

    useEffect(() => {
        if (!selectedRoutes.length) {
            setDeliveries(deliveriesClone)
            setTotalCount(deliveriesClone.length)
        }
        else {
            const filtered = deliveriesClone.filter((item) => selectedRoutes.includes(item.routeId))
            setDeliveries(filtered)
            setTotalCount(filtered.length)
        }
    }, [selectedRoutes])

    const getRoutes = async () => {
        const data = await http.GET('/warehouse/getroutes')
        setRoutes(data)
    }

    const getDrivers = async () => {
        const url = `/warehouse/getdriverDetails/${warehouseId}`
        const data = await http.GET(url)
        setDrivers(data)
    }

    const getDeliveries = async () => {
        setLoading(true)
        const url = `/warehouse/deliveryDetails/${date}`
        const data = await http.GET(url)
        setTotalCount(data.length)
        setDeliveriesClone(data)
        setDeliveries(data)
        setLoading(false)
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'customerName') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'mobileNumber') {
            const error = validateMobileNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key.includes('box') || key.includes('can')) {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, stockDetails: error }))
        }
    }

    const handleBlur = (value, key) => {
        // Validations
        if (key === 'mobileNumber') {
            const error = validateMobileNumber(value, true)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleRouteSelect = (value) => {
        const clone = [...selectedRoutes]
        clone.push(value)
        setSelectedRoutes(clone)
    }

    const handleRouteDeselect = (value) => {
        const filtered = selectedRoutes.filter(routeId => routeId !== value)
        setSelectedRoutes(filtered)
    }

    const handleMenuSelect = (key, data) => {
        if (key === 'view') {
            customerOrderIdRef.current = data.customerOrderId
            DCFormTitleRef.current = `DC - ${data.customerName}`
            DCFormBtnRef.current = 'Update'
            setFormData(data)
            setDCModal(true)
        }
    }

    const handlePageChange = (number) => {
        setPageNumber(number)
    }

    const handleSizeChange = (number, size) => {
        setPageSize(size)
        setPageNumber(number)
    }

    const handleSaveDC = async () => {
        const dcErrors = validateDCValues(formData)

        if (!isEmpty(dcErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(dcErrors)
            return
        }

        const dcValues = getDCValuesForDB(formData)
        const customerOrderId = customerOrderIdRef.current

        let url = '/warehouse/createDC'
        let method = 'POST'
        if (customerOrderId) {
            url = '/warehouse/updateDC'
            method = 'PUT'
        }

        const body = {
            ...dcValues, warehouseId, customerOrderId
        }

        try {
            setBtnDisabled(true)
            showToast('DC', 'loading', method)
            let { data: [data] } = await http[method](url, body)
            showToast('DC', 'success', method)
            optimisticUpdate(data, method)
            onModalClose(true)
        } catch (error) {
            setBtnDisabled(false)
        }
    }

    const optimisticUpdate = (data, method) => {
        if (method === 'PUT') {
            const clone = deepClone(deliveries)
            const dc = clone.find(dc => dc.dcNo === data.dcNo)
            const index = clone.indexOf(dc)
            clone[index] = data
            setDeliveries(clone)
        }
        else setDeliveries([data, ...deliveries])
    }

    const onModalClose = (hasSaved) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged && !hasSaved) {
            return setConfirmModal(true)
        }
        customerOrderIdRef.current = undefined
        setDCModal(false)
        setBtnDisabled(false)
        setFormData({})
        setFormErrors({})
    }

    const dataSource = useMemo(() => deliveries.map((delivery) => {
        const { dcNo, address, RouteName, driverName, isDelivered } = delivery
        return {
            key: dcNo,
            dcnumber: dcNo,
            shopAddress: address,
            route: RouteName,
            driverName: driverName,
            orderDetails: renderOrderDetails(delivery),
            status: renderStatus(isDelivered),
            action: <TableAction onSelect={({ key }) => handleMenuSelect(key, delivery)} />
        }
    }), [deliveries])

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false);
        resetTrackForm()
        onModalClose()
    }, [])

    const onCreateDC = useCallback(() => {
        DCFormTitleRef.current = 'Add New DC'
        DCFormBtnRef.current = 'Save'
        setDCModal(true)
    }, [])

    const handleDCModalCancel = useCallback(() => onModalClose(), [])
    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])

    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize

    return (
        <div className='stock-delivery-container'>
            <div className='header'>
                <div className='left'>
                    <SelectInput
                        mode='multiple'
                        placeholder='Select Routes'
                        className='filter-select'
                        suffixIcon={<LinesIconGrey />}
                        value={selectedRoutes} options={routeOptions}
                        onSelect={handleRouteSelect}
                        onDeselect={handleRouteDeselect}
                    />
                    <CustomButton text='Create New DC' onClick={onCreateDC} className='app-add-new-btn' icon={<PlusIcon />} />
                </div>
                <div className='right'>
                    <SearchInput
                        placeholder='Search Delivery Challan'
                        className='delivery-search'
                        width='50%'
                        onSearch={() => { }}
                        onChange={() => { }}
                    />
                </div>
            </div>
            <div className='stock-delivery-table'>
                <Table
                    loading={{ spinning: loading, indicator: <Spinner /> }}
                    dataSource={dataSource.slice(sliceFrom, sliceTo)}
                    columns={deliveryColumns}
                    pagination={false}
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
                className={`app-form-modal ${shake ? 'app-shake' : ''}`}
                visible={DCModal}
                btnDisabled={btnDisabled}
                onOk={handleSaveDC}
                onCancel={handleDCModalCancel}
                title={DCFormTitleRef.current}
                okTxt={DCFormBtnRef.current}
                track
            >
                <DCForm
                    track
                    data={formData}
                    errors={formErrors}
                    driverOptions={driverOptions}
                    routeOptions={routeOptions}
                    onChange={handleChange}
                    onBlur={handleBlur}
                />
            </CustomModal>
            <QuitModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </QuitModal>
        </div>
    )
}

const renderStatus = (delivered) => {
    const color = delivered === 'Inprogress' ? '#A10101' : '#0EDD4D'
    const text = delivered === 'Inprogress' ? 'Pending' : 'Delivered'
    return (
        <div className='status'>
            <span className='dot' style={{ background: color }}></span>
            <span className='status-text'>{text}</span>
        </div>
    )
}

const renderOrderDetails = ({ cans20L, boxes1L, boxes500ML, boxes250ML }) => {
    return `
    20 lts - ${cans20L}, 1 ltr - ${boxes1L} boxes, 
    500 ml - ${boxes500ML} boxes, 250 ml - ${boxes250ML} boxes
    `
}
export default Delivery
import axios from 'axios';
import dayjs from 'dayjs';
import { message, Table } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { http } from '../../../../modules/http';
import Spinner from '../../../../components/Spinner';
import ConfirmModal from '../../../../components/CustomModal';
import { EyeIconGrey, ScheduleIcon } from '../../../../components/SVG_Icons';
import SearchInput from '../../../../components/SearchInput';
import ConfirmMessage from '../../../../components/ConfirmMessage';
import { TODAYDATE, TRACKFORM } from '../../../../utils/constants';
import CustomPagination from '../../../../components/CustomPagination';
import { getRMColumns } from '../../../../assets/fixtures';
import { base64String, deepClone, disableFutureDates, doubleKeyComplexSearch, getBase64, isEmpty, resetTrackForm, showToast } from '../../../../utils/Functions';
import CustomModal from '../../../../components/CustomModal';
import MaterialReceivedForm from '../forms/MaterialReceived';
import { validateNames, validateNumber, validateReceivedMaterialValues } from '../../../../utils/validations';
import DateValue from '../../../../components/DateValue';
import CustomDateInput from '../../../../components/CustomDateInput';
const fn = () => { }
const DATEFORMAT = 'DD-MM-YYYY'
const format = 'YYYY-MM-DD'

const AddMaterials = ({ onUpdate = fn }) => {
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({})
    const [formErrors, setFormErrors] = useState({})
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [modal, setModal] = useState(false)
    const [confirmModal, setConfirmModal] = useState(false)
    const [selectedDate, setSelectedDate] = useState(TODAYDATE)
    const [filteredClone, setFilteredClone] = useState([])
    const [shake, setShake] = useState(false)
    const [open, setOpen] = useState(false)
    const [RM, setRM] = useState([])
    const [RMClone, setRMClone] = useState([])
    const [currentRMId, setCurrentRMId] = useState('')
    const [hideCancel, setHideCancel] = useState(false)
    const [formDisabled, setFormDisabled] = useState(false)
    const [resetSearch, setResetSearch] = useState(false)
    const [searchON, setSeachON] = useState(false)
    const [filterON, setFilterON] = useState(false)
    const [okTxt, setOkText] = useState('Confirm Details')
    const [formTitle, setFormTitle] = useState('')

    const RMColumns = useMemo(() => getRMColumns('add'), [])
    const toastLoading = { v1Ing: 'Fetching', action: 'loading' }
    const source = useMemo(() => axios.CancelToken.source(), []);
    const config = { cancelToken: source.token }

    useEffect(() => {
        getRM()

        return () => {
            http.ABORT(source)
        }
    }, [])

    const getRM = async () => {
        const url = 'motherPlant/getRMDetails?status=Approved'

        try {
            const data = await http.GET(axios, url, config)
            setRM(data)
            setRMClone(data)
            setTotalCount(data.length)
            setLoading(false)
        } catch (error) { }
    }

    const getRMReceipt = async (RMId) => {
        const url = `motherPlant/getReceiptDetails/${RMId}`

        try {
            showToast(toastLoading)
            const [data = {}] = await http.GET(axios, url, config)
            const receiptImage = base64String(data?.receiptImage?.data)
            setFormData(prev => ({ ...prev, ...data, receiptImage }))
            message.destroy()
        } catch (error) {
            message.destroy()
        }
    }

    const datePickerStatus = (status) => {
        !status && setOpen(false)
    }

    const handleDateSelect = (value) => {
        setOpen(false)
        setSelectedDate(dayjs(value).format(format))
        const filtered = RMClone.filter(item => dayjs(value).format(DATEFORMAT) == dayjs(item.approvedDate).format(DATEFORMAT))
        setRM(filtered)
        setFilteredClone(filtered)
        setPageNumber(1)
        setFilterON(true)
        searchON && setResetSearch(!resetSearch)
    }

    const handlePageChange = (number) => {
        setPageNumber(number)
    }

    const handleSizeChange = (number, size) => {
        setPageSize(size)
        setPageNumber(number)
    }

    const handleChange = (value, key) => {
        setFormData(data => ({ ...data, [key]: value }))
        setFormErrors(errors => ({ ...errors, [key]: '' }))

        // Validations
        if (key === 'managerName') {
            const error = validateNames(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
        else if (key === 'taxAmount' || key === 'receiptNo' ||
            key === 'invoiceAmount' || key === 'invoiceNo') {
            const error = validateNumber(value)
            setFormErrors(errors => ({ ...errors, [key]: error }))
        }
    }

    const handleUpload = (file) => {
        getBase64(file, async (buffer) => {
            setFormData(data => ({ ...data, receiptImage: buffer }))
            setFormErrors(errors => ({ ...errors, receiptImage: '' }))
        })
    }

    const handleRemove = () => setFormData(data => ({ ...data, receiptImage: '' }))

    const handleUpdate = async () => {
        const { status } = formData
        if (status === 'Confirmed') {
            onModalClose(true)
            return
        }

        const formErrors = validateReceivedMaterialValues(formData)

        if (!isEmpty(formErrors)) {
            setShake(true)
            setTimeout(() => setShake(false), 820)
            setFormErrors(formErrors)
            return
        }

        const url = 'motherPlant/createRMReceipt'
        const body = { ...formData, rawmaterialid: currentRMId }
        const otherUrl = 'motherPlant/updateRMStatus'
        const otherBody = { rawmaterialid: currentRMId, status: 'Confirmed' }
        const options = { item: 'Received Materials', v1Ing: 'Adding', v2: 'added' }

        try {
            setBtnDisabled(true)
            showToast({ ...options, action: 'loading' })
            const p1 = http.POST(axios, url, body, config)
            const p2 = http.PUT(axios, otherUrl, otherBody, config)
            await Promise.all([p1, p2])
            optimisticUpdate(currentRMId)
            showToast(options)
            onUpdate()
            onModalClose(true)
            setBtnDisabled(false)
        } catch (error) {
            message.destroy()
            if (!axios.isCancel(error)) {
                setBtnDisabled(false)
            }
        }
    }

    const onModalClose = (hasSaved) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged && !hasSaved) {
            return setConfirmModal(true)
        }
        setModal(false)
        setBtnDisabled(false)
        setFormData({})
        setFormErrors({})
        resetTrackForm()
    }

    const optimisticUpdate = (id) => {
        let clone = deepClone(RM);
        const index = clone.findIndex(item => item.rawmaterialid === id)
        clone[index].status = 'Confirmed';
        setRM(clone)
    }

    const renderStatus = (status, item) => {
        let text = status === 'Approved' ? 'Confirm' : status

        const style = {
            color: status === 'Approved' ? '#007AFF' : '',
            fontFamily: status === 'Approved' ? 'PoppinsSemiBold600' : 'PoppinsMedium500'
        }

        return (
            <div className='eye-container'>
                <span style={style}>{text}</span>
                <EyeIconGrey className='eye' onClick={() => onConfirm(item)} />
            </div>
        )
    }

    const onConfirm = (data) => {
        setCurrentRMId(data.rawmaterialid)
        configureModalUI(data)
        setFormData(data)
    }

    const configureModalUI = async (data) => {
        setFormTitle(`Received Material Details - ${data.orderId}`)
        if (data.status === 'Confirmed') {
            setFormDisabled(true)
            setOkText('Close')
            setHideCancel(true)
            await getRMReceipt(data.rawmaterialid)
        }
        else {
            setOkText('Confirm Details')
            setHideCancel(false)
            setFormDisabled(false)
        }
        setModal(true)
    }

    const handleSearch = (value) => {
        setPageNumber(1)
        if (value === "") {
            setTotalCount(RMClone.length)
            setRM(RMClone)
            setSeachON(false)
            return
        }
        const data = filterON ? filteredClone : RMClone
        const result = doubleKeyComplexSearch(data, value, 'orderId', 'itemName')
        setTotalCount(result.length)
        setRM(result)
        setSeachON(true)
    }

    const dataSource = useMemo(() => RM.map((item) => {
        const { rawmaterialid: key, orderId, itemQty, itemName, approvedDate, reorderLevel,
            minOrderLevel, vendorName, status } = item
        return {
            key,
            orderId,
            itemQty,
            reorderLevel,
            vendorName,
            minOrderLevel,
            itemName,
            dateAndTime: dayjs(approvedDate).format('DD/MM/YYYY'),
            status: renderStatus(status, item)
        }
    }), [RM])

    const handleConfirmModalOk = useCallback(() => {
        setConfirmModal(false)
        resetTrackForm()
        onModalClose()
    }, [])

    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])
    const handleModalCancel = useCallback(() => onModalClose(), [])

    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize

    return (
        <div className='stock-delivery-container'>
            <div className='header'>
                <div className='left'>
                    <DateValue date={selectedDate} />
                    <div className='app-date-picker-wrapper'>
                        <div className='date-picker' onClick={() => setOpen(true)}>
                            <ScheduleIcon />
                            <span>Select Date</span>
                        </div>
                        <CustomDateInput // Hidden in the DOM
                            open={open}
                            style={{ left: 0 }}
                            value={selectedDate}
                            className='app-date-panel-picker'
                            onChange={handleDateSelect}
                            onOpenChange={datePickerStatus}
                            disabledDate={disableFutureDates}
                        />
                    </div>
                </div>
                <div className='right'>
                    <SearchInput
                        placeholder='Search Material'
                        className='delivery-search'
                        reset={resetSearch}
                        onChange={handleSearch}
                        width='50%'
                    />
                </div>
            </div>
            <div className='app-table dispatch-table'>
                <Table
                    loading={{ spinning: loading, indicator: <Spinner /> }}
                    dataSource={dataSource.slice(sliceFrom, sliceTo)}
                    columns={RMColumns}
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
                okTxt={okTxt}
                visible={modal}
                title={formTitle}
                hideCancel={hideCancel}
                btnDisabled={btnDisabled}
                onOk={handleUpdate}
                onCancel={handleModalCancel}
                className={`app-form-modal ${shake ? 'app-shake' : ''}`}
                track
            >
                <MaterialReceivedForm
                    data={formData}
                    errors={formErrors}
                    disabled={formDisabled}
                    onChange={handleChange}
                    onUpload={handleUpload}
                    onRemove={handleRemove}
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
        </div>
    )
}

export default AddMaterials
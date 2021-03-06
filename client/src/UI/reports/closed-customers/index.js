import axios from 'axios';
import { Table } from 'antd';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { http } from '../../../modules/http';
import Spinner from '../../../components/Spinner';
import useUser from '../../../utils/hooks/useUser';
import { TODAYDATE } from '../../../utils/constants';
import DateValue from '../../../components/DateValue';
import Header from '../../../components/SimpleHeader';
import SearchInput from '../../../components/SearchInput';
import DateDropdown from '../../../components/DateDropdown';
import CustomButton from '../../../components/CustomButton';
import { doubleKeyComplexSearch } from '../../../utils/Functions';
import CustomDateInput from '../../../components/CustomDateInput';
import CustomPagination from '../../../components/CustomPagination';
import CustomRangeInput from '../../../components/CustomRangeInput';
import { closedCustomersReportColumns } from '../../../assets/fixtures';
const APIDATEFORMAT = 'YYYY-MM-DD'

const ClosedCustomersReport = () => {
    const { WAREHOUSEID } = useUser()
    const [customerList, setCustomerList] = useState([])
    const [loading, setLoading] = useState(true)
    const [customerIds, setCustomerIds] = useState([])
    const [filterBtnDisabled, setFilterBtnDisabled] = useState(true)
    const [clearBtnDisabled, setClearBtnDisabled] = useState(true)
    const [reports, setReports] = useState([])
    const [reportsClone, setReportsClone] = useState([])
    const [pageSize, setPageSize] = useState(10)
    const [totalCount, setTotalCount] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)
    const [startDate, setStartDate] = useState(TODAYDATE)
    const [endDate, setEndDate] = useState(TODAYDATE)
    const [selectedDate, setSelectedDate] = useState(TODAYDATE)
    const [selectedRange, setSelectedRange] = useState([])
    const [resetSearch, setResetSearch] = useState(false)
    const [searchON, setSeachON] = useState(false)
    const [dateOpen, setDateOpen] = useState(false)
    const [rangeOpen, setRangeOpen] = useState(false)

    const source = useMemo(() => axios.CancelToken.source(), []);
    const config = { cancelToken: source.token }

    useEffect(() => {
        setLoading(true)
        getReports({ fromStart: true })
        getCustomerList()

        return () => {
            http.ABORT(source)
        }
    }, [])

    const getCustomerList = async () => {
        const url = `customer/getCustomerNames`

        try {
            const data = await http.GET(axios, url, config)
            setCustomerList(data)
        } catch (error) { }
    }

    const getReports = async ({ fromStart = true }) => {
        const url = `reports/getClosedCustomersReport?fromDate=${startDate}&toDate=${endDate}&fromStart=${fromStart}&departmentId=${WAREHOUSEID}&customerIds=${customerIds}`

        try {
            const data = await http.GET(axios, url, config)
            setPageNumber(1)
            setLoading(false)
            setTotalCount(data.length)
            setReportsClone(data)
            setReports(data)
            searchON && setResetSearch(!resetSearch)
        } catch (error) { }
    }

    const datePickerStatus = (status) => {
        !status && setDateOpen(false)
        !status && setRangeOpen(false)
    }

    const handleRangeSelect = (selected) => {
        const [from, to] = selected
        setStartDate(from.format(APIDATEFORMAT))
        setEndDate(to.format(APIDATEFORMAT))
        setRangeOpen(false)
        setSelectedRange(selected)
        setTimeout(() => setSelectedRange([]), 820)
        setPageNumber(1)
        setFilterBtnDisabled(false)
    }

    const handleDateSelect = (value) => {
        setStartDate(value.format(APIDATEFORMAT))
        setEndDate(value.format(APIDATEFORMAT))
        setDateOpen(false)
        setSelectedDate(value)
        setPageNumber(1)
        setFilterBtnDisabled(false)
    }

    const onDateOptionSelect = ({ key }) => {
        if (key === 'range') {
            setRangeOpen(true)
        }
        else setDateOpen(true)
    }

    const handleFilter = () => {
        setClearBtnDisabled(false)
        setFilterBtnDisabled(true)
        setLoading(true)
        getReports({ fromStart: false })
    }

    const handleFilterClear = async () => {
        setClearBtnDisabled(true)
        setFilterBtnDisabled(true)
        setCustomerIds([])
        setCustomerList([])
        setSelectedDate(TODAYDATE)
        setStartDate(TODAYDATE)
        setEndDate(TODAYDATE)
        setLoading(true)
        await getReports({ fromStart: true })
        setCustomerList(customerList)
    }

    const handlePageChange = (number) => {
        setPageNumber(number)
    }

    const handleSizeChange = (number, size) => {
        setPageSize(size)
        setPageNumber(number)
    }

    const handleSearch = (value) => {
        setPageNumber(1)
        if (value === "") {
            setTotalCount(reportsClone.length)
            setReports(reportsClone)
            setSeachON(false)
            return
        }
        const result = doubleKeyComplexSearch(reportsClone, value, 'customerNo', 'customerName')
        setTotalCount(result.length)
        setReports(result)
        setSeachON(true)
    }

    const dataSource = useMemo(() => reports.map((dc, index) => ({ ...dc, closureStatus: dc.closureStatus || '-', sNo: index + 1 })), [reports])

    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize

    return (
        <Fragment>
            <Header title='Closed Customers Report' />
            <div className='stock-manager-content'>

                <div className='stock-delivery-container'>
                    <div className='header'>
                        <div className='left fit'>
                            <DateValue date={startDate} to={endDate} />
                            <div className='app-date-picker-wrapper'>
                                <DateDropdown onSelect={onDateOptionSelect} />
                                <CustomButton
                                    style={{ marginLeft: '1em' }}
                                    className={`${filterBtnDisabled ? 'disabled' : ''}`}
                                    text='Apply'
                                    onClick={handleFilter}
                                />
                                <CustomButton
                                    style={{ marginLeft: '1em' }}
                                    className={`app-cancel-btn border-btn ${clearBtnDisabled ? 'disabled' : ''}`}
                                    text='Clear'
                                    onClick={handleFilterClear}
                                />
                                <CustomRangeInput // Hidden in the DOM
                                    open={rangeOpen}
                                    value={selectedRange}
                                    style={{ left: 0 }}
                                    className='app-date-panel-picker'
                                    onChange={handleRangeSelect}
                                    onOpenChange={datePickerStatus}
                                />
                                <CustomDateInput // Hidden in the DOM
                                    open={dateOpen}
                                    value={selectedDate}
                                    style={{ left: 0 }}
                                    className='app-date-panel-picker'
                                    onChange={handleDateSelect}
                                    onOpenChange={datePickerStatus}
                                />
                            </div>
                        </div>
                        <div className='right more'>
                            <SearchInput
                                placeholder='Search Report'
                                className='delivery-search'
                                width='50%'
                                reset={resetSearch}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <div className='app-table delivery-table'>
                        <Table
                            loading={{ spinning: loading, indicator: <Spinner /> }}
                            dataSource={dataSource.slice(sliceFrom, sliceTo)}
                            columns={closedCustomersReportColumns}
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
                </div>
            </div>
        </Fragment>
    )
}

export default ClosedCustomersReport
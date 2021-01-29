import { Col, message, Row } from 'antd';
import { useHistory } from 'react-router-dom';
import React, { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Header from './header';
import { http } from '../../modules/http'
import Spinner from '../../components/Spinner';
import { getRole, SUPERADMIN } from '../../utils/constants';
import NoContent from '../../components/NoContent';
import AccountCard from '../../components/AccountCard';
import DeleteModal from '../../components/CustomModal';
import ConfirmMessage from '../../components/ConfirmMessage';
import CustomPagination from '../../components/CustomPagination';
import { complexDateSort, complexSort, doubleKeyComplexSearch, filterAccounts, showToast } from '../../utils/Functions'
import '../../sass/customers.scss'

const Customers = () => {
    const history = useHistory()
    const [accountsClone, setAccountsClone] = useState([])
    const [filteredClone, setFilteredClone] = useState([])
    const [cardBtnTxt, setCardBtnTxt] = useState('Manage Account')
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(12)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalCount, setTotalCount] = useState(null)
    const [filterON, setFilterON] = useState(false)
    const [searchON, setSeachON] = useState(false)
    const [sortBy, setSortBy] = useState('NEW')
    const [activeTab, setActiveTab] = useState('1')
    const [modalDelete, setModalDelete] = useState(false)
    const [currentId, setCurrentId] = useState('')

    const pageSizeOptions = useMemo(() => generatePageSizeOptions(), [window.innerWidth])
    const isSuperAdmin = useMemo(() => getRole() === SUPERADMIN, [])

    useEffect(() => {
        setLoading(true)
        getAccounts()
    }, [activeTab])

    const getAccounts = async () => {
        const url = `/customer/${getUrl(activeTab)}`

        const data = await http.GET(url)
        setAccountsClone(data)
        setAccounts(data)
        setTotalCount(data.length)
        setLoading(false)
    }

    const getUrl = (tab) => {
        if (tab === '1') return `getCustomerDetailsByType/Corporate`
        else if (tab === '2') return `getCustomerDetailsByType/Individual`
        else if (tab === '3') return `getCustomerDetailsByStatus/0`
    }

    const handleSearch = (value) => {
        setPageNumber(1)
        if (value === "") {
            setTotalCount(accountsClone.length)
            setAccounts(accountsClone)
            setSeachON(false)
            return
        }
        const result = doubleKeyComplexSearch(accountsClone, value, 'organizationName', 'customerName')
        setTotalCount(result.length)
        setAccounts(result)
        setSeachON(true)
    }

    const onSort = (type) => {
        handleSort(type, filterON)
    }

    const handleSort = (type, filterON) => {
        const clone = [...(filterON ? filteredClone : accountsClone)]

        if (type === 'Z - A') {
            complexSort(clone, 'organizationName', 'desc')
        }
        else if (type === 'A - Z') {
            complexSort(clone, 'organizationName')
        }
        else if (type === 'OLD') {
            complexDateSort(clone, 'approvedDate')
        }
        else {
            complexDateSort(clone, 'approvedDate', 'desc')
        }

        filterON ? setFilteredClone(clone) : setAccountsClone(clone)
        setTotalCount(clone.length)
        setAccounts(clone)
        setSortBy(type)
    }

    const handlePageChange = (number) => {
        const clone = filterON ? filteredClone : accountsClone
        setPageNumber(number)
        setAccounts(clone)
    }

    const handleSizeChange = (number, size) => {
        const clone = filterON ? filteredClone : accountsClone
        setPageSize(size)
        setPageNumber(number)
        setAccounts(clone)
    }

    const handleTabChange = (key) => {
        setActiveTab(key)
        if (key === '3') {
            setCardBtnTxt('View Details')
        } else setCardBtnTxt('Manage Account')
    }

    const handleFilter = (filterInfo) => {
        const filtered = filterAccounts(accountsClone, filterInfo)
        setFilterON(true)
        setPageNumber(1)
        setAccounts(filtered)
        setFilteredClone(filtered)
        setTotalCount(filtered.length)
    }

    const handleFilterClear = () => {
        setPageNumber(1)
        setAccounts(accountsClone)
        setTotalCount(accountsClone.length)
        setFilteredClone([])
        setFilterON(false)
        handleSort(sortBy, false)
    }

    const onFilterChange = (data) => {
        const { business, status, account } = data
        if (!business.length && !status.length && !account.length) handleFilterClear()
        else handleFilter(data)
    }

    const handleManageAccount = (id) => {
        if (activeTab === '3') {
            return history.push(`/customers/approval/${id}`)
        }
        return history.push(`/customers/manage/${id}`)
    }

    const handleMenuSelect = (key, id) => {
        if (key === 'Active') {
            handleStatusUpdate(id, 1)
        }
        else if (key === 'Draft') {
            handleStatusUpdate(id, 0)
        }
        else if (key === 'Delete') {
            setCurrentId(id)
            setModalDelete(true)
        }
    }

    const handleStatusUpdate = async (customerId, status) => {
        const options = { item: 'Customer status', v1Ing: 'Updating', v2: 'updated' }
        const url = `/customer/updateCustomerStatus`
        const body = { status, customerId }
        try {
            showToast({ ...options, action: 'loading' })
            await http.PUT(url, body)
            optimisticUpdate(customerId)
            showToast(options)
        } catch (error) {
            message.destroy()
        }
    }

    const handleDelete = async (id) => {
        const options = { item: 'Customer', v1Ing: 'Deleting', v2: 'deleted' }
        const url = `/customer/deleteCustomer/${id}`

        try {
            showToast({ ...options, action: 'loading' })
            await http.DELETE(url)
            optimisticUpdate(id)
            showToast(options)
        } catch (error) {
            message.destroy()
        }
    }

    const optimisticUpdate = (id) => {
        if (filterON || searchON) {
            const filtered = accountsClone.filter(item => item.customerId !== id)
            setAccountsClone(filtered)
        }
        const filtered = accounts.filter(item => item.customerId !== id)
        setAccounts(filtered)
        setTotalCount(filtered.length)
    }

    const handleDeleteModalOk = useCallback(() => {
        setModalDelete(false);
        handleDelete(currentId)
    }, [currentId])

    const handleDeleteModalCancel = useCallback(() => {
        setModalDelete(false)
    }, [])

    const goToAddAccount = () => history.push('/customers/add-account')
    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize
    const noPageSize = filterON || searchON

    return (
        <Fragment>
            <Header onSearch={handleSearch} onSort={onSort} onFilter={onFilterChange} onChange={handleTabChange} onClick={goToAddAccount} />
            <div className='account-manager-content'>
                <Row gutter={[{ lg: 32, xl: 16 }, { lg: 32, xl: 32 }]}>
                    {
                        loading ? <NoContent content={<Spinner />} />
                            : accounts.length ? accounts.slice(sliceFrom, sliceTo).map((account) => (
                                <Col lg={{ span: 12 }} xl={{ span: 8 }} xxl={{ span: 6 }} key={account.customerId}>
                                    <AccountCard
                                        data={account}
                                        btnTxt={cardBtnTxt}
                                        isSuperAdmin={isSuperAdmin}
                                        onSelect={handleMenuSelect}
                                        onClick={handleManageAccount}
                                    />
                                </Col>
                            )) : <NoContent content='No accounts to show' />
                    }
                </Row>
                {
                    !!totalCount && (
                        <CustomPagination
                            total={totalCount}
                            pageSize={pageSize}
                            current={pageNumber}
                            onChange={handlePageChange}
                            pageSizeOptions={noPageSize ? [] : pageSizeOptions}
                            onPageSizeChange={handleSizeChange}
                        />)
                }
            </div>
            <DeleteModal
                visible={modalDelete}
                onOk={handleDeleteModalOk}
                onCancel={handleDeleteModalCancel}
                title='Are you sure to Delete?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='This action cannot be undone.' />
            </DeleteModal>
        </Fragment>
    )
}

const generatePageSizeOptions = () => {
    if (window.innerWidth < 1200) return ['12', '16', '20', '24', '28']
    if (window.innerWidth >= 1200) return ['12', '15', '18', '21', '24']
    if (window.innerWidth >= 1600) return ['12', '16', '20', '24', '28']
    return ['12', '15', '18', '21', '24']
}
export default Customers

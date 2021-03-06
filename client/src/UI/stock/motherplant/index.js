import axios from 'axios';
import { Tabs } from 'antd';
import React, { Fragment, useMemo, useRef, useCallback, useState } from 'react';
import Production from './tabs/Production';
import InternalQC from './tabs/InternalQC';
import { http } from '../../../modules/http';
import StockDetails from './tabs/StockDetails';
import DamagedStock from './tabs/DamagedStock';
import DamagedStockWH from './tabs/DamagedStockWH';
import AddDamagedStock from './tabs/AddDamaged';
import NoContent from '../../../components/NoContent';
import Header from '../../../components/ContentHeader';
import { resetTrackForm } from '../../../utils/Functions';
import ConfirmModal from '../../../components/CustomModal';
import ConfirmMessage from '../../../components/ConfirmMessage';
import { TODAYDATE, TRACKFORM } from '../../../utils/constants';
import DatePickerPanel from '../../../components/DatePickerPanel';
import ReportsDropdown from '../../../components/ReportsDropdown';

const MotherplantStock = () => {

    const [activeTab, setActiveTab] = useState('1')
    const [selectedDate, setSelectedDate] = useState(TODAYDATE)
    const [confirm, setConfirm] = useState(false)
    const clickRef = useRef('')
    const source = useMemo(() => axios.CancelToken.source(), [selectedDate, activeTab]);

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    const handleGoToTab = (key) => {
        setActiveTab(key)
    }

    const handleTabClick = (key) => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged) {
            clickRef.current = key
            setConfirm(true)
        }
        else setActiveTab(key)
    }

    const showDatePicker = useMemo(() => {
        return activeTab === '1'
    }, [activeTab])

    const handleConfirmCancel = useCallback(() => setConfirm(false), [])
    const handleConfirmOk = useCallback(() => {
        setConfirm(false)
        resetTrackForm()
        const value = clickRef.current
        setActiveTab(value)
    }, [])

    const handleDateSelect = () => http.ABORT(source)

    return (
        <Fragment>
            <Header />
            <div className='stock-manager-content'>
                <div className='app-tabs-container app-hidden-panes'>
                    <Tabs
                        tabBarExtraContent={<ReportsDropdown />}
                        onChange={handleTabClick}
                        activeKey={activeTab}
                    >
                        <TabPane tab="Stock Details" key="1" />
                        <TabPane tab="Production" key="2" />
                        <TabPane tab="Quality Control (Internal)" key="3" />
                        <TabPane tab="Add Damaged Stock" key="4" />
                        <TabPane tab="Damaged Stock" key="5" />
                        <TabPane tab="Damaged Stock (WH)" key="6" />
                    </Tabs>
                </div>
                {
                    showDatePicker && (
                        <div className='date-picker-panel'>
                            <DatePickerPanel onChange={handleDateChange} onSelect={handleDateSelect} />
                        </div>
                    )
                }
                {
                    activeTab === '1' ? <StockDetails goToTab={handleGoToTab} date={selectedDate} source={source} />
                        : activeTab === '2' ? <Production />
                            : activeTab === '3' ? <InternalQC />
                                : activeTab === '4' ? <AddDamagedStock goToTab={handleGoToTab} />
                                    : activeTab === '5' ? <DamagedStock />
                                        : activeTab === '6' ? <DamagedStockWH />
                                            : <NoContent content='Design is in progress' />
                }
            </div>
            <ConfirmModal
                visible={confirm}
                onOk={handleConfirmOk}
                onCancel={handleConfirmCancel}
                title='Are you sure you want to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </ConfirmModal>
        </Fragment>
    )
}
const { TabPane } = Tabs;
export default MotherplantStock
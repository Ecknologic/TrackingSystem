import { Tabs } from 'antd';
import React, { Fragment, useState } from 'react';
import Header from './header';
import Delivery from './tabs/Delivery';
import StockDetails from './tabs/StockDetails';
import { TODAYDATE } from '../../../utils/constants';
import NoContent from '../../../components/NoContent';
import ReportsDropdown from '../../../components/ReportsDropdown';
import DatePickerPanel from '../../../components/DatePickerPanel';

const WarehouseStock = () => {

    const [activeTab, setActiveTab] = useState('1')
    const [selectedDate, setSelectedDate] = useState(TODAYDATE)

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    return (
        <Fragment>
            <Header />
            <div className='stock-manager-content'>
                <div className='app-tabs-container app-hidden-panes'>
                    <Tabs
                        tabBarExtraContent={<ReportsDropdown />}
                        onChange={(key) => setActiveTab(key)}
                    >
                        <TabPane tab="Stock Details" key="1" />
                        <TabPane tab="Delivery" key="2" />
                        <TabPane tab="Orders" key="3" />
                        <TabPane tab="Staff" key="4" />
                        <TabPane tab="Settings" key="5" />
                    </Tabs>
                </div>
                <div className='date-picker-panel'>
                    <DatePickerPanel onChange={handleDateChange} />
                </div>
                {
                    activeTab === '1' ? <StockDetails date={selectedDate} />
                        : activeTab === '2' ? <Delivery date={selectedDate} />
                            : <NoContent content='Design is in progress' />
                }
            </div>
        </Fragment>
    )
}
const { TabPane } = Tabs;
export default WarehouseStock
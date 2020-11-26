import { Tabs } from 'antd';
import React, { Fragment, useEffect, useState } from 'react';
import Header from './header';
import Spinner from '../../components/Spinner';
import StockDetails from './tabs/StockDetails';
import NoContent from '../../components/NoContent';
import ReportsDropdown from '../../components/ReportsDropdown';
import Delivery from './tabs/Delivery';
import { TODAYDATE } from '../../utils/constants';
import DatePickerPanel from '../../components/DatePickerPanel';

const Stock = () => {

    const [activeTab, setActiveTab] = useState('1')
    const [selectedDate, setSelectedDate] = useState(TODAYDATE)

    const handleDateChange = (date) => {
        setSelectedDate(date)
    }

    return (
        <Fragment>
            <Header />
            <div className='stock-manager-content'>
                <div className='tabs-container stock-manager-tabs'>
                    <Tabs
                        tabBarGutter={40}
                        tabBarExtraContent={<ReportsDropdown />}
                        onTabClick={(key) => setActiveTab(key)}
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
                            : null
                }

            </div>
        </Fragment>
    )
}
const { TabPane } = Tabs;
export default Stock
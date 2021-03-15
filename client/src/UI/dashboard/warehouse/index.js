import React, { Fragment } from 'react';
import TodaysOrders from './panels/TodaysOrders';
import SalesResults from './panels/SalesResults';
import Header from '../../../components/ContentHeader';
import InvoiceOverview from './panels/InvoiceOverview';
import StockStatus from './panels/StockStatus';
import CustomersOverview from './panels/CustomersOverview';
import { getWarehoseId } from '../../../utils/constants';

const WarehouseDashboard = () => {
    const departmentId = getWarehoseId()

    return (
        <Fragment>
            <Header />
            <div className='dashboard-content-outer'>
                <div className='left-content'>
                    <div className='dashboard-content'>
                        <StockStatus />
                        <div className='dashboard-content-inner'>
                            <div className='left-panel'>
                                <SalesResults depId={departmentId} />
                            </div>
                            <div className='right-panel'>
                                <InvoiceOverview />
                            </div>
                        </div>
                        <CustomersOverview />
                    </div>
                </div>
                <div className='right-content'>
                    <TodaysOrders />
                </div>
            </div>
        </Fragment>
    )
}

export default WarehouseDashboard
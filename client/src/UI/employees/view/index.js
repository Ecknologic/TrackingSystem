import { Tabs } from 'antd';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import React, { Fragment, useCallback, useMemo, useState } from 'react';
import Header from './header';
import AccountOverview from './tabs/AccountOverview';
import { TRACKFORM } from '../../../utils/constants';
import QuitModal from '../../../components/CustomModal';
import { getMainPathname } from '../../../utils/Functions';
import ConfirmMessage from '../../../components/ConfirmMessage';
import ActivityLogDetails from '../../../components/ActivityLogDetails';

const ManageEmployee = ({ isDriver }) => {
    const history = useHistory()
    const { employeeId } = useParams()
    const { pathname, state } = useLocation()
    const [headerContent, setHeaderContent] = useState({})
    const [confirmModal, setConfirmModal] = useState(false)
    const mainUrl = useMemo(() => getMainPathname(pathname), [pathname])
    const type = isDriver ? 'driver' : 'staff'

    const handleBack = () => {
        const formHasChanged = sessionStorage.getItem(TRACKFORM)
        if (formHasChanged) {
            setConfirmModal(true)
        }
        else goBack()
    }

    const handleConfirmModalCancel = useCallback(() => setConfirmModal(false), [])
    const handleConfirmModalOk = useCallback(() => { setConfirmModal(false); goBack() }, [])
    const goBack = () => {
        const { tab = 1, page = 1 } = state || {}
        const path = `${mainUrl}/${tab}/${page}`
        history.push(path)
    }

    return (
        <Fragment>
            <Header data={headerContent} onClick={handleBack} />
            <div className='account-view-content'>
                <div className='app-tabs-container'>
                    <Tabs>
                        <TabPane tab="Account Overview" key="1">
                            <AccountOverview
                                isDriver={isDriver}
                                setHeaderContent={setHeaderContent}
                                onGoBack={handleBack}
                            />
                        </TabPane>
                        <TabPane tab="Activity Log Details" key="2">
                            <ActivityLogDetails type={type} id={employeeId} />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
            <QuitModal
                visible={confirmModal}
                onOk={handleConfirmModalOk}
                onCancel={handleConfirmModalCancel}
                title='Are you sure you want to leave?'
                okTxt='Yes'
            >
                <ConfirmMessage msg='Changes you made may not be saved.' />
            </QuitModal>
        </Fragment>
    )
}
const { TabPane } = Tabs;
export default ManageEmployee

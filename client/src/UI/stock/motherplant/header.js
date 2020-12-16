import React, { useEffect, useState } from 'react';
import Spinner from '../../../components/Spinner';
import { MoreIconGrey } from '../../../components/SVG_Icons'
import { getWarehoseId } from '../../../utils/constants';
import { http } from '../../../modules/http';
import '../../../sass/stock.scss'

const Header = () => {

    const warehouseId = getWarehoseId()
    const [loading, setLoading] = useState(true)
    const [title, setTitle] = useState('')
    const [address, setAddress] = useState('')

    useEffect(() => {
        getWarehouseInfo()
    }, [])

    const getWarehouseInfo = async () => {
        const url = `/warehouse/getWarehouseDetails/${warehouseId}`
        const { data: { departmentName, address } } = await http.GET(url)
        setLoading(false)
        setTitle(departmentName)
        setAddress(address)
    }

    return (
        <div className='stock-header'>
            {
                loading ? <Spinner />
                    : (
                        <div className='heading-container'>
                            <div className='titles-container'>
                                <span className='title'>{title}</span>
                                <span className='address'>{address}</span>
                            </div>
                            <div className='three-dot-menu'>
                                <MoreIconGrey />
                            </div>
                        </div>
                    )
            }
        </div>
    )

}

export default Header
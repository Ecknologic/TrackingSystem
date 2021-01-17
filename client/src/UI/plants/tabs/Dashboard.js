import { Col, Row } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { http } from '../../../modules/http'
import Spinner from '../../../components/Spinner';
import NoContent from '../../../components/NoContent';
import MotherplantCard from '../../../components/PlantCard';
import CustomPagination from '../../../components/CustomPagination';
import { getMainPathname } from '../../../utils/Functions';

const Dashboard = ({ reFetch }) => {
    const history = useHistory()
    const { pathname } = useLocation()
    const [plants, setPlants] = useState([])
    const [loading, setLoading] = useState(true)
    const [pageSize, setPageSize] = useState(12)
    const [pageNumber, setPageNumber] = useState(1)
    const [totalCount, setTotalCount] = useState(null)
    const [plantType, setPlantType] = useState('')

    const mainUrl = useMemo(() => getMainPathname(pathname), [pathname])
    const pageSizeOptions = useMemo(() => generatePageSizeOptions(), [window.innerWidth])

    useEffect(() => {
        setLoading(true)
        const type = getPlantType()
        getPlants(type)
    }, [reFetch])

    const getPlants = async (plantType) => {
        const url = `${mainUrl.slice(0, -1)}/get${plantType}List`

        const data = await http.GET(url)
        setPlants(data)
        setTotalCount(data.length)
        setLoading(false)
    }

    const getPlantType = () => {
        const type = mainUrl === '/warehouses' ? 'Warehouse' : 'MotherPlant'
        setPlantType(type)
        return type
    }

    const handlePageChange = (number) => {
        setPageNumber(number)
    }

    const handleSizeChange = (number, size) => {
        setPageSize(size)
        setPageNumber(number)
    }

    const goToManageEmployee = (id) => history.push(`${mainUrl}/manage/${id}`)

    const sliceFrom = (pageNumber - 1) * pageSize
    const sliceTo = sliceFrom + pageSize

    return (
        <Fragment>
            <div className='plant-manager-content'>
                <Row gutter={[{ lg: 32, xl: 16 }, { lg: 32, xl: 32 }]}>
                    {
                        loading ? <NoContent content={<Spinner />} />
                            : plants.length ? plants.slice(sliceFrom, sliceTo).map((plant) => (
                                <Col lg={{ span: 12 }} xl={{ span: 8 }} xxl={{ span: 6 }} key={plant.departmentId}>
                                    <MotherplantCard data={plant} onClick={() => goToManageEmployee(plant.departmentId)} />
                                </Col>
                            )) : <NoContent content={`No ${plantType}s to show`} />
                    }
                </Row>
                {
                    !!totalCount && (
                        <CustomPagination
                            total={totalCount}
                            pageSize={pageSize}
                            current={pageNumber}
                            onChange={handlePageChange}
                            pageSizeOptions={pageSizeOptions}
                            onPageSizeChange={handleSizeChange}
                        />)
                }
            </div>
        </Fragment>
    )
}

const generatePageSizeOptions = () => {
    if (window.innerWidth < 1200) return ['12', '16', '20', '24', '28']
    if (window.innerWidth >= 1200) return ['12', '15', '18', '21', '24']
    if (window.innerWidth >= 1600) return ['12', '16', '20', '24', '28']
    return ['12', '15', '18', '21', '24']
}
export default Dashboard
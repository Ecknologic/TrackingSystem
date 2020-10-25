import React, { useState, useEffect } from "react";
import { Row, Col, Button, Select, Form, Input, Checkbox, DatePicker, Collapse, message, Upload, Modal } from 'antd';
import '../css/styles.css'
import LayoutPage from '../UI/Layout';
import CustomSelectComponent from '../components/selectComponent'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { getAPI } from "../utils/apis";
import { getBase64 } from '../utils/Functions'
import UploadImage from '../components/UploadImage';
import InputField from '../components/inputField';
import { WAREHOUSEID, USERID, USERNAME, TODAYDATE } from '../utils/constants'
const { Option } = Select;
const FormItem = Form.Item;
const { Panel } = Collapse;

const AddCustomer = (props) => {
    const [visible, setVisible] = useState(false)
    const [corpCustomer, setCorpCustomer] = useState(true)
    const [otherCustomer, setOtherCustomer] = useState(false)
    const [errors, setErrors] = useState({})
    const [disabled, setDisabled] = useState(false)
    const [inputData, setInputData] = useState({
    })
    const [routeId, setRouteId] = useState('')
    const [routesInfo, setRoutesInfo] = useState([]);
    // const [deliveryData, setDeliveryData] = useState([]);
    const [frontImage, setFrontImage] = useState('')
    const [backImage, setBackImage] = useState('')
    const idProofs = ["Aadhar", 'Pan']
    const invoiceTypes = ["General", 'Complementary'];
    const natureOfBussiness = ['Hospital', 'College', 'Office']
    const [deliveryDetails, setDeliveryDetails] = useState([{}])
    const [deliveryInputData, setDeliveryInputData] = useState({})
    const [deliveryDays, setDeliveryDays] = useState({
        "SUN": 0,
        "MON": 0,
        "TUE": 0,
        "WED": 0,
        "THU": 0,
        "FRI": 0,
        "SAT": 0
    })
    const children = [];
    for (let i = 10; i < 36; i++) {
        children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
    }
    useEffect(() => {
        getRoutes();
    }, []);
    const getRoutes = () => {
        getAPI('/warehouse/getroutes')
            .then(response => {
                setRoutesInfo(response);
            })
            .catch(error => {
                message.error("Error in getting routes", error)
                console.log(error)
            });
    }


    const customImageUpload = (file, name) => {
        getBase64(file, async (BitImageUrl) => {
            if (name == 'frontImage') setFrontImage(BitImageUrl)
            else setBackImage(BitImageUrl)
        })
    }
    const handleChange = (value) => {
        console.log(`selected ${value}`);
    }

    const onTabChange = (type) => {
        if (type == "corpCustomer") {
            setOtherCustomer(false); setCorpCustomer(true)
        } else {
            setOtherCustomer(true); setCorpCustomer(false)
        }
    }
    const onChange = (date, dateString) => {
        console.log(date, dateString);
    }
    const inputChange = (e) => {
        setInputData({ ...inputData, [e.target.name]: e.target.value })
    }
    const dropDownChange = (e, name, state) => {
        if (state == 'customerData') setInputData({ ...inputData, [name]: e })
        else if (name == 'deliveryDays') {
            let obj = {}
            Object.entries(deliveryDays).map(([key]) => {
                if (e.includes(key)) obj[`${key}`] = 1
                else obj[`${key}`] = 0
            })
            setDeliveryDays(obj)
        }
        else setDeliveryInputData({ ...deliveryInputData, [name]: e })
    }
    const deliveryInputChange = (e) => {
        setDeliveryInputData({ ...deliveryInputData, [e.target.name]: e.target.value })
    }
    const saveDeliveryDetails = (index) => {
        let arr = deliveryDetails;
        arr[index] = deliveryInputData
        arr[index].deliveryDays = deliveryDays
        setDeliveryDetails(arr)
    }
    const saveOrUpdate = () => {
        let obj = {
            customertype: corpCustomer ? "Corporate" : 'Others',
            idProofs: [frontImage, backImage],
            idProofType: inputData.idProofType,
            gstNo: inputData.gstNo,
            Address1: inputData.address,
            EmailId: inputData.email,
            mobileNumber: inputData.phoneNumber,
            contactperson: inputData.contactPerson,
            creditPeriodInDays: inputData.creditPeriodInDays,
            invoicetype: inputData.invoicetype,
            referredBy: inputData.referredBy,
            natureOfBussiness: inputData.natureOfBussiness,
            departmentId: WAREHOUSEID,
            referredBy: USERNAME,
            registeredDate: TODAYDATE,
            createdBy: USERID,
            deliveryDetails
        }
        console.log('Obj', obj)
    }
    const fileList = [];
    const idProofsList = idProofs.length && idProofs.map(item => <Option key={item} value={item}>{item}</Option>)
    const natureOfBussinessList = natureOfBussiness.length && natureOfBussiness.map(item => <Option key={item} value={item}>{item}</Option>)
    const invoiceTypeList = invoiceTypes.length && invoiceTypes.map(item => <Option key={item} value={item}>{item}</Option>)
    const deliveryDaysList = Object.entries(deliveryDays).map(([key, value]) => <Option key={key} value={key}>{key}</Option>)
    const routesOptions = routesInfo.length && routesInfo.map((element, index) => (
        <Option key={index} value={element.RouteId}>{element.RouteName}</Option>
    ))
    return (
        <div>
            <LayoutPage>
                <div className="addcustomerheader">
                    <Row>
                        <Col span={20}>
                            <h1><span>Back</span> <span>Create Account</span></h1>
                        </Col>
                        <Col span={4}>
                            <h5>help</h5>
                        </Col>
                    </Row>
                </div>
                <div className="addCustomerBody">
                    <Row>
                        <Col span={24}>
                            <Button type="primary" className={corpCustomer ? 'ActivenumTab' : 'normalnumTab'} onClick={() => onTabChange("corpCustomer")}>Corporate Customers</Button>
                            <Button type="primary" className={otherCustomer ? 'ActivenumTab' : 'normalnumTab'} onClick={() => onTabChange("otherCustomer")}>Other Customers</Button>
                        </Col>
                    </Row>
                    <Form>
                        {corpCustomer ?
                            <div>
                                <Row>
                                    <CustomSelectComponent
                                        onChange={(e) => dropDownChange(e, 'idProofType', 'customerData')}
                                        label="Select Id Proof"
                                        value={inputData.idProofType}
                                        colSpan={10}
                                        options={idProofsList}
                                        error={errors.idProofType}
                                    // disabled={disabled}
                                    />
                                </Row>
                                <Row>
                                    <UploadImage
                                        onUpload={customImageUpload}
                                        error={errors.frontImage}
                                        imageValue={frontImage}
                                        name='frontImage'
                                        colSpan={3}
                                    />
                                    <UploadImage
                                        onUpload={customImageUpload}
                                        error={errors.backImage}
                                        imageValue={backImage}
                                        name='backImage'
                                        colSpan={3}
                                    />
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <div>
                                            <h4>Please help us verify your identity</h4>
                                        </div>
                                        <p>(kindly upload the documents either in JPEG,PNG,PDF format. The file should be lessthan 5MB) Need to be upload front and back.</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <InputField colSpan={10} error={errors.gstNo} label="GST NUMBER" disabled={disabled} placeholder="Add GST No" name="gstNo" value={inputData.gstNo} onChange={inputChange} /><Button type="default">Verify</Button>
                                    <InputField offset={1} colSpan={10} error={errors.organizationName} label="ORGANIZATION NAME" disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                </Row>
                                <Row>
                                    <InputField colSpan={21} label="ADDRESS" disabled={disabled} error={errors.address} placeholder="Add Address" name="address" value={inputData.address} onChange={inputChange} />
                                </Row>
                                <Row>
                                    <InputField colSpan={10} label="PHONE NUMBER" disabled={disabled} error={errors.phoneNumber} placeholder="Add Phone Number" name="phoneNumber" value={inputData.phoneNumber} onChange={inputChange} />
                                    <InputField colSpan={10} offset={1} label="EMAIL" disabled={disabled} error={errors.email} placeholder="Add Email" name="email" value={inputData.email} onChange={inputChange} />
                                </Row>
                                <Row>
                                    <InputField colSpan={10} label='CONTACT PERSON' disabled={disabled} error={errors.contactPerson} placeholder="Add Contact Person" name="contactPerson" value={inputData.contactPerson} onChange={inputChange} />
                                    <CustomSelectComponent
                                        onChange={(e) => dropDownChange(e, 'natureOfBussiness', 'customerData')}
                                        label="NATURE OF BUSINESS"
                                        value={inputData.natureOfBussiness}
                                        offset={1}
                                        colSpan={10}
                                        options={natureOfBussinessList}
                                        error={errors.natureOfBussiness}
                                    // disabled={disabled}
                                    />
                                </Row>
                                <Row>
                                    <InputField colSpan={10} label='REGISTERED DATE' error={errors.registeredDate} disabled={disabled} placeholder="YYYY-MM-DD" name="registeredDate" value={inputData.organizationName} onChange={inputChange} />
                                    <CustomSelectComponent
                                        onChange={(e) => dropDownChange(e, 'invoicetype', 'customerData')}
                                        label="Select Invoice Type"
                                        value={inputData.invoicetype}
                                        colSpan={10}
                                        offset={1}
                                        options={invoiceTypeList}
                                        error={errors.invoicetype}
                                    // disabled={disabled}
                                    />
                                </Row>
                                <Row>
                                    <InputField colSpan={10} error={errors.creditPeriodInDays} disabled={disabled} label='Credit Period' placeholder="No of days" name="creditPeriodInDays" value={inputData.creditPeriodInDays} onChange={inputChange} />
                                    <InputField colSpan={10} offset={1} error={errors.referredBy} disabled={disabled} label='REFERED BY' placeholder="Name" name="referredBy" value={inputData.referredBy} onChange={inputChange} />
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <FormItem>
                                            <Checkbox>Delivery to same address</Checkbox>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <div>

                                    <Row>
                                        <Col span={24}>
                                            <h1><span>Delivery Details</span> <span> <Button type="default" onClick={() => setDeliveryDetails([...deliveryDetails, ''])}> <span><PlusOutlined /></span> Add New</Button></span></h1>
                                        </Col>

                                    </Row>
                                    {deliveryDetails.length ? deliveryDetails.map((delivery, i) =>
                                        <Collapse defaultActiveKey={['0']} accordion key={i}>
                                            <Panel header={"Delivery Address"} key={String(i)}>
                                                <Row>
                                                    <InputField colSpan={10} label='DELIVERY LOCATION' disabled={disabled} placeholder="Add Delivery Location" name="address" value={delivery.address} onChange={deliveryInputChange} />
                                                    <CustomSelectComponent
                                                        onChange={(e) => dropDownChange(e, 'routingId')}
                                                        label="Select Route"
                                                        offset={1}
                                                        value={delivery.routingId}
                                                        colSpan={10}
                                                        options={routesOptions}
                                                        error={errors.routingId}
                                                        disabled={disabled}
                                                    />
                                                </Row>
                                                <Row>
                                                    <InputField colSpan={21} label='ADDRESS' disabled={disabled} placeholder="Add Address" name="address" value={delivery.address} onChange={deliveryInputChange} />
                                                </Row>
                                                <Row>
                                                    <InputField colSpan={10} label='PHONE NUMBER' disabled={disabled} placeholder="Add Phone Number" name="phoneNumber" value={delivery.phoneNumber} onChange={deliveryInputChange} />
                                                    <InputField colSpan={10} offset={1} label='CONTACT PERSON' disabled={disabled} placeholder="Contact Person Name" name="contactPerson" value={delivery.contactPerson} onChange={deliveryInputChange} />
                                                </Row>
                                                <Row>
                                                    <CustomSelectComponent
                                                        onChange={(e) => dropDownChange(e, 'productIds')}
                                                        label="PRODUCTS"
                                                        mode="multiple"
                                                        value={delivery.productIds}
                                                        colSpan={10}
                                                        options={children}
                                                        error={errors.products}
                                                        disabled={disabled}
                                                    />
                                                    <CustomSelectComponent
                                                        onChange={(e) => dropDownChange(e, 'deliveryDays')}
                                                        label="DELIVERY DAYS"
                                                        mode="multiple"
                                                        offset={1}
                                                        value={delivery.deliveryDays}
                                                        colSpan={10}
                                                        options={deliveryDaysList}
                                                        error={errors.deliveryDays}
                                                        disabled={disabled}
                                                    />
                                                </Row>
                                                <Row>
                                                    <InputField colSpan={10} label='PRICE' disabled={disabled} placeholder="Price" name="price" value={delivery.price} onChange={deliveryInputChange} />
                                                    <InputField colSpan={10} offset={1} label='DEPOSIT AMOUNT' disabled={disabled} placeholder="Amount" name="depositAmount" value={delivery.depositAmount} onChange={deliveryInputChange} />

                                                    {/* <CustomSelectComponent
                                                        // onChange={(e) => dropDownChange(e, 'routeId')}
                                                        label="PRICE"
                                                        mode="multiple"
                                                        value={delivery.price}
                                                        colSpan={10}
                                                        options={children}
                                                        error={errors.products}
                                                        disabled={disabled}
                                                    />
                                                    <CustomSelectComponent
                                                        onChange={(e) => dropDownChange(e, 'depositAmount')}
                                                        label="DEPOSIT AMOUNT"
                                                        mode="multiple"
                                                        value={delivery.depositAmount}
                                                        colSpan={10}
                                                        options={children}
                                                        error={errors.products}
                                                        disabled={disabled}
                                                        offset={1}
                                                    /> */}
                                                </Row>
                                                <Button onClick={() => saveDeliveryDetails(i)}>Save Details</Button>
                                            </Panel>
                                        </Collapse>
                                    ) : null}
                                </div>
                            </div> :

                            <div>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">select id proof</h5>
                                            <Select defaultValue="lucy" style={{ width: '100%' }}>
                                                <Option value="jack">Jack</Option>
                                                <Option value="lucy">Lucy</Option>
                                                <Option value="disabled" disabled>
                                                    Disabled
                                        </Option>
                                                <Option value="Yiminghe">yiminghe</Option>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <Upload
                                                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                                listType="picture"
                                                defaultFileList={[...fileList]}
                                            >
                                                <Button icon={<UploadOutlined />}>Upload</Button>
                                            </Upload>
                                        </FormItem>
                                    </Col>
                                    <Col span={10}>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={24}>
                                        <h4>Please help us verify your identity</h4>
                                        <p>(kindly upload the documents either in JPEG,PNG,PDF format. The file should be lessthan 5MB) Need to be upload front and back.</p>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">GST NUMBER</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} /><Button type="default">Verify</Button>
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1}>
                                        <FormItem>
                                            <h5 className="form_modal_label">NAME</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={21}>
                                        <FormItem>
                                            <h5 className="form_modal_label">ADDRESS</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">PHONE NUMBER</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1}>
                                        <FormItem>
                                            <h5 className="form_modal_label">EMAIL</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">DELIVERY DAYS</h5>
                                            <Select
                                                mode="multiple"
                                                allowClear
                                                style={{ width: '100%' }}
                                                placeholder="Please select"
                                                defaultValue={['a10', 'c12']}
                                                onChange={handleChange}
                                            >
                                                {children}
                                            </Select>
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1}>
                                        <FormItem>
                                            <h5 className="form_modal_label">REGISTERED DATE</h5>
                                            <DatePicker onChange={onChange} />
                                        </FormItem>

                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">ADD PRODUCTS</h5>
                                            <Select defaultValue="lucy" style={{ width: '100%' }}>
                                                <Option value="jack">Jack</Option>
                                                <Option value="lucy">Lucy</Option>
                                                <Option value="disabled" disabled>
                                                    Disabled
                                        </Option>
                                                <Option value="Yiminghe">yiminghe</Option>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1}>
                                        <FormItem>
                                            <h5 className="form_modal_label">DEPOSIT AMOUNT</h5>
                                            <Select defaultValue="lucy" style={{ width: '100%' }}>
                                                <Option value="jack">Jack</Option>
                                                <Option value="lucy">Lucy</Option>
                                                <Option value="disabled" disabled>
                                                    Disabled
                                        </Option>
                                                <Option value="Yiminghe">yiminghe</Option>
                                            </Select>
                                        </FormItem>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">PHONE NUMBER</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                    <Col span={10} offset={1}>
                                        <FormItem>
                                            <h5 className="form_modal_label">EMAIL</h5>
                                            <Input disabled={disabled} placeholder="Add organization Name" name="organizationName" value={inputData.organizationName} onChange={inputChange} />
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={10}>
                                        <FormItem>
                                            <h5 className="form_modal_label">INVOICE TYPE</h5>
                                            <Select defaultValue="lucy" style={{ width: '100%' }}>
                                                <Option value="jack">Jack</Option>
                                                <Option value="lucy">Lucy</Option>
                                                <Option value="disabled" disabled>
                                                    Disabled
                                        </Option>
                                                <Option value="Yiminghe">yiminghe</Option>
                                            </Select>
                                        </FormItem>
                                    </Col>
                                </Row>

                            </div>}
                    </Form>
                </div>
                <div className="addcustomerfooter">
                    <Row>
                        <Col span={10}>
                            <Button type="default">CANCEL</Button>
                        </Col>
                        <Col span={10} offset={1}>
                            <Button type="primary" onClick={() => saveOrUpdate()}>CREATE ACCOUNT</Button>
                        </Col>
                    </Row>

                </div>
                <div>
                    <Modal
                        title="Basic Modal"
                        visible={visible}
                        onOk={() => { setVisible(false) }}
                        onCancel={() => { setVisible(false) }}
                    >
                        <h1>sucessfully done</h1>
                    </Modal>
                </div>
            </LayoutPage >
        </div >
    )
}

export default AddCustomer;
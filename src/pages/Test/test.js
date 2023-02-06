import React, { useState } from 'react'
import Dropdown from '../../components/Dropdown/Dropdown'
import { Alert, Button, Footer, Header, Input, LandingTile, Table } from '../../components';
import access from "../../assets/images/access.png";
import {useGetAllProcurementsQuery} from '../../services/procurement.services'
const Test = () => {
    const tableData =[
        [{
            id: new Date().toISOString(),
            value: "Last Procured on",
            isSortable: true,
            sortBy:"lastProcuredOn"
        },
        {
            value: "Plant Name",
            isSortable: true,
            sortBy:"plantName"
        }],
    [{
        value: "03 Jan 2022",
    },
    {
        value: "Areca",
    }],
    [{
        value: "04 Jan 2022",
    },
    {
        value: "Coffee",
    }],
    [{
        value: "05 Jan 2022",
    },
    {
        value: "tea",
    }]
    ]
    const [isSkip, setSkip] = useState(true)
    const res = useGetAllProcurementsQuery({}, {skip: isSkip})
    console.log(res)
    const options = [
        { value: "id1", label: "option1" },
        { value: "id2", label: "option2" },
    ];

    const onChangeHandler = (value) => {
        // update the state as required
        console.log(value);
    };
    return (
        <>
        <div><Header /></div>
        <div style={{ maxWidth: "500px", padding: "10px 20px" }}>
            <p>fetch from api dropdown</p>
            <Dropdown onChange={onChangeHandler} url="dsadf" />

            <p>fetch from api dropdown with multiselect</p>
            <Dropdown
                onChange={onChangeHandler}
                url="dsadf"
                isMultiEnabled={true}
                isClearable={true}
            />

            <p>creatable dropdown with multiselect</p>
            <Dropdown
                canCreate={true}
                data={options}
                onChange={onChangeHandler}
                isMultiEnabled={true}
                isClearable={true}
            />

            <p>creatable dropdown without multi select</p>
            <Dropdown canCreate={true} data={options} onChange={onChangeHandler} />

            <p>select with single option dropdown</p>
            <Dropdown
                data={options}
                onChange={onChangeHandler}
                isMultiEnabled={true}
                isClearable={true}
            />

            <p>select with single option dropdown</p>
            <Dropdown data={options} onChange={onChangeHandler} />

            <div style={{ height: 300, width: 400, margin: "15px" }}>
                <LandingTile image={access} title="Access Management" isDisabled={false} />
            </div>
            <div style={{ width: 300, margin: "15px" }}>
                <Input title="User Name" required={false} id="name" errorMessage="Invalid Input" />
            </div>
            <div style={{ width: 300, margin: "15px" }}>
                <Button type="primary" title="API check" onClick={()=> setSkip(false)} />
            </div>
            <div style={{ height: 250, width: 600, margin: "15px" }}>
                <Alert />
            </div>
            <div>

            </div>

        </div>
        <div>
            <Table data={tableData} onSortBy={(sort)=> console.log(sort)}/>
        </div>
        <Footer />

        </>
    )
}

export default Test
import React, { useState } from "react";
import {
  Alert,
  Button,
  Footer,
  Header,
  Input,
  LandingTile,
  Table,
  Dropdown,
  Filters,
} from "../../components";
import access from "../../assets/images/access.png";
import {
  useGetAllProcurementsQuery,
  useSearchProductsQuery,
} from "../../services/procurement.services";
import { Link } from "react-router-dom";
const Test = () => {
  const tableData = [
    [
      {
        id: new Date().toISOString(),
        value: "Last Procured on",
        isSortable: true,
        sortBy: "lastProcuredOn",
      },
      {
        value: "Plant Name",
        isSortable: true,
        sortBy: "plantName",
      },
    ],
    [
      {
        value: "03 Jan 2022",
      },
      {
        value: "Areca",
      },
    ],
    [
      {
        value: "04 Jan 2022",
      },
      {
        value: "Coffee",
      },
    ],
    [
      {
        value: "05 Jan 2022",
      },
      {
        value: "tea",
      },
    ],
  ];
  const [isSkip, setSkip] = useState(true);
  const res = useGetAllProcurementsQuery({}, { skip: isSkip });
  const options = [
    { value: "id1", label: "option1" },
    { value: "id2", label: "option2" },
  ];

  const onChangeHandler = (value) => {
    // update the state as required
  };
  const onSubmitHandler = (value) => {
    // update the state as required
  };
  return (
    <>
      {/* added this link to verify the page as the auth state is not persisted in refresh */}
      <Link to="/authorised/add-employee">Add Employee page</Link>
      <div>
      <Link to="/authorised/add-procurement">Add Procurement page</Link>
      </div>
      <Filters onChange={onChangeHandler} onSubmit={onSubmitHandler} />
      <div style={{ maxWidth: "500px", padding: "10px 20px" }}>
        <p>fetch from api dropdown</p>
        <Dropdown
          onChange={onChangeHandler}
          url="/api/procurements/getAll?isList=true"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
        />

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
          <LandingTile
            image={access}
            title="Access Management"
            isDisabled={false}
          />
        </div>
        <div style={{ width: 300, margin: "15px" }}>
          <Input
            title="User Name"
            required={false}
            id="name"
            errorMessage="Invalid Input"
          />
        </div>
        <div style={{ width: 300, margin: "15px" }}>
          <Button
            type="primary"
            title="API check"
            onClick={() => setSkip(false)}
          />
        </div>
        <div style={{ height: 250, width: 600, margin: "15px" }}>
          <Alert />
        </div>
        <div></div>
      </div>
      <div>
        <Table data={tableData} onSortBy={(sort) => {}} />
      </div>
    </>
  );
};

export default Test;

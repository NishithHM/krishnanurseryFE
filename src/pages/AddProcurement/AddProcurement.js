import React, { useEffect, useMemo, useState } from "react";
import { Button, Dropdown, Input, Table, Toaster } from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import { useUpdateProcurementsMutation } from "../../services/procurement.services";
import { useCreateProcurementsMutation } from "../../services/procurement.services";
import _ from "lodash";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { getTableBody } from "./helper";
import { toast } from "react-toastify";

const tableHeader = [
  [
    {
      id: new Date().toISOString(),
      value: "Procured On",
    },
    {
      value: "Quantity",
    },
    {
      value: "Vendor Name",
    },
    {
      value: "Vendor Contact",
    },
    {
      value: "Price Per Plant ₹",
    },
  ],
];

const AddProcurement = () => {
  const initialState = {
    totalQuantity: "",
    totalAmount: "",
    description: "",
    addPlantName: {},
    addPlantCategory: [],
    addVendorName: {},
    addVendorContact: "",
    addPlantKannada: "",
    disabledVendorContact: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: false
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [
    updateProcurements,
    {
      isLoading: isLoadingUpdate,
      isError: isErrorUpdate,
      isSuccess: isSuccessUpdate,
    },
  ] = useUpdateProcurementsMutation();
  const [createProcurements, { isLoading, isError, isSuccess }] =
    useCreateProcurementsMutation();

  const inputChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const dropDownChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event,
      };
    });
  };

  useEffect(() => {
    let plantCategories;
    if (!state.addPlantName?.__isNew__) {
      plantCategories =
        state.addPlantName?.meta?.categories?.map((ele) => {
          return {
            label: ele.name,
            value: ele._id,
          };
        }) || [];
    }
    setState((prev) => ({
      ...prev,
      isNameInKannada: state.addPlantName?.__isNew__,
      addPlantCategory: state.addPlantName?.__isNew__
        ? prev.addPlantCategory
        : plantCategories,
    }));
  }, [state.addPlantName?.value]);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      addVendorContact: state.addVendorName?.meta?.contact,
      disabledVendorContact: state.addVendorName?.__isNew__ ? false : true,
    }));
  }, [state.addVendorName?.value]);

  const onSubmitHandler = async () => {
    const body = {};
    body.totalQuantity = +state.totalQuantity;
    body.totalPrice = +state.totalAmount;
    body.description = state.description;
    body.vendorName = state.addVendorName.label;
    body.vendorContact = state.addVendorContact;
    if(!state.addVendorName?.__isNew__){
        body.vendorId = state.addVendorName?.value;
    }
    body.categories = state.addPlantCategory.map((ele) => {
      return {
        _id: ele.value,
        name: ele.label,
      };
    });
    setState((prev)=>{
      return{
        ...prev,
        submitDisabled: true
      }
    })
    if (state.addPlantName?.__isNew__) {
      body.nameInKannada = state.addPlantKannada;
      body.nameInEnglish = state.addPlantName.label;

      const res = await createProcurements({ body });

      if (res.error) {
        toast.error("Unable to Add...");
        setState((prev) => {
          return {
            ...prev,
            addProcurementError: _.isArray(res.error?.data)
              ? res.error?.data
              : [res.error?.data?.error],
              submitDisabled:false
          };
        });
      } else {
        toast.success("Procurement Created Successfully!");

        setState((prev) => {
          return {
            ...prev,
            addProcurementError: [],
          };
        });
        setTimeout(() => {
          navigate("../dashboard");
        }, 3000);
      }

      // call create api
    } else {
      const id = state.addPlantName?.value;
      const res = await updateProcurements({ body, id });

      if (res.error) {
        toast.error("Unable to Add...");
        setState((prev) => {
          return {
            ...prev,
            addProcurementError: _.isArray(res.error?.data)
              ? res.error?.data
              : [res.error?.data?.error],
            submitDisabled:false
          };
        });
      } else {
        toast.success("Procurement Created Successfully!");
        setTimeout(() => {
          navigate("../dashboard");
        }, 3000);
      }
    }
  };

  const onError = ({ id, isError }) => {
    if (isError) {
      setState((prev) => ({
        ...prev,
        errorFields: _.uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = state.errorFields.filter((ele) => id != ele);
      setState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };
  const tableBody = useMemo(
    () => getTableBody(state.addPlantName),
    [state.addPlantName?.value]
  );

  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div className={styles.outerWrapper}>
        <h1 className={styles.header}>Add Procurement</h1>
        <div className={styles.innerWrapper}>
          <Dropdown
            url="/api/procurements/getAll"
            id="addPlantName"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Name"
            onChange={dropDownChangeHandler}
            value={state.addPlantName}
            canCreate
            required
          />
          {state.isNameInKannada && (
            <Input
              value={state.addPlantKannada}
              id="addPlantKannada"
              type="text"
              onChange={inputChangeHandler}
              title="Plant Name in Kannada"
              required
              onError={onError}
              validation={(text) => text.length > 0}
              errorMessage="Please Enter new Plant in Kannada"
            />
          )}

          <Dropdown
            url="/api/category/getAll"
            id="addPlantCategory"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Category"
            onChange={dropDownChangeHandler}
            value={state.addPlantCategory}
            required
            isMultiEnabled
          />
          <Dropdown
            url="/api/vendors/getAll"
            id="addVendorName"
            apiDataPath={{ label: "name", value: "_id" }}
            title="Vendor Name"
            onChange={dropDownChangeHandler}
            value={state.addVendorName}
            canCreate
            required
          />
          <Input
            value={state.addVendorContact}
            id="addVendorContact"
            type="number"
            onChange={inputChangeHandler}
            title="Contact Number"
            required
            disabled={state.disabledVendorContact}
            validation={(number) => {
              return number.length === 10;
            }}
            onError={onError}
            errorMessage="Please Enter a Valid Number"
          />
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.totalQuantity}
                id="totalQuantity"
                type="number"
                onChange={inputChangeHandler}
                title="Total Quantity"
                required
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.totalAmount}
                id="totalAmount"
                type="number"
                onChange={inputChangeHandler}
                title="Total Amount"
                required
              />
            </div>
          </div>
          <TextArea
            value={state.description}
            id="description"
            onChange={inputChangeHandler}
            title="Description"
            rows={4}
            name="description"
          />
          <div className={styles.formbtn}>
            <Button
              onClick={onSubmitHandler}
              loading={isLoading || isLoadingUpdate}
              disabled={
                isEmpty(state.addPlantCategory) ||
                isEmpty(state.addPlantName) ||
                isEmpty(state.addVendorName) ||
                isEmpty(state.totalAmount) ||
                isEmpty(state.totalQuantity)||
                state.errorFields.length > 0 ||
                state.submitDisabled

              }
              type="primary"
              title="Save"
            />
          </div>
          <span style={{ color: "red" }}>
            {state.addProcurementError.map((msg) => (
              <p>{msg}</p>
            ))}
          </span>
        </div>
      </div>
      <div className={styles.tableWrapper}>
        {tableBody.length > 0 && (
          <>
            <span className={styles.historyheader}>Procurement history</span>
            <Table
              data={[...tableHeader, ...tableBody]}
              onSortBy={(sort) => console.log(sort)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default AddProcurement;

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Dropdown,
  Input,
  Table,
  Toaster,
  BackButton,
  Dropzone,
} from "../../components";
import TextArea from "../../components/TextArea";
import styles from "./AddProcurement.module.css";
import {
  usePlaceOrderMutation,
  useUpdateProcurementsMutation,
} from "../../services/procurement.services";
import { useCreateProcurementsMutation } from "../../services/procurement.services";
import _ from "lodash";
import { isEmpty } from "lodash";
import { useNavigate } from "react-router-dom";
import { getTableBody } from "./helper";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery } from "../../services/categories.services";
import { MIME_TYPES } from "@mantine/dropzone";
import { AiOutlineClose } from "react-icons/ai";

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

export const PlaceOrder = () => {
  const initialState = {
    totalQuantity: 0,
    totalPrice: 0,
    description: "",
    addPlantName: {},
    addPlantCategory: [],
    addVendorName: {},
    addVendorContact: "",
    addPlantKannada: "",
    expectedDeliveryDate: "",
    currentPaidAmount: 0,
    disabledVendorContact: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: false,
  };

  const navigate = useNavigate();
  const [state, setState] = useState(initialState);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [plantImages, setPlantImages] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);
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
  const categories = useGetAllCategoriesQuery({ sortType: 1 });

  const [PlaceOrder, { isLoading: isOrderLoading }] = usePlaceOrderMutation();

  const formatCategoryData = (data) => {
    const res = data.map((item) => ({
      value: item._id,
      label: item.names.en.name,
    }));
    return res;
  };

  useEffect(() => {
    if (categories.status === "fulfilled" && firstLoad) {
      setFirstLoad(false);
      setCategoryList(formatCategoryData(categories.data));
    }
  }, [categories]);

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

  const onError = (error) => {
    toast.error(error);
  };

  const onSubmitHandler = async () => {
    const body = {
      nameInEnglish: state.addPlantName.meta.names.en.name,
      nameInKannada: state.addPlantName.meta.names.ka.name,
      vendorName: state.addVendorName.label,
      vendorContact: state.addVendorContact,
      vendorId: state.addVendorName.value,
      totalQuantity: state.totalQuantity,
      totalPrice: state.totalPrice,
      description: state.description,
      categories: state.addPlantCategory,
      expectedDeliveryDate: state.expectedDeliveryDate,
      id: "643eb2b414555c3870b6d15c",
      procurementId: state.addPlantName.value,
      currentPaidAmount: state.currentPaidAmount,
    };

    console.log(body);
    const response = await PlaceOrder({ body });
    toast.success(response.data.message);
    setTimeout(() => {
      navigate("../dashboard/orders");
    }, 1000);
  };

  const tableBody = useMemo(
    () => getTableBody(state.addPlantName),
    [state.addPlantName?.value]
  );

  console.log(tableBody);
  return (
    <div className={styles.addProcurementPage}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>

      <div className={styles.outerWrapper}>
        {/* <h1 className={styles.header}>Place Order</h1> */}
        <div className={styles.innerWrapper}>
          <Dropdown
            url="/api/procurements/getAll"
            id="addPlantName"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Name"
            onChange={dropDownChangeHandler}
            value={state.addPlantName}
            canCreate={false}
            required
          />
          <Input
            value={state?.addPlantName?.meta?.names?.ka?.name || ""}
            id="addPlantKannada"
            type="text"
            onChange={inputChangeHandler}
            title="Plant Name in Kannada"
            required
            onError={onError}
            validation={(text) => text.length > 0}
            errorMessage="Please Enter new Plant in Kannada"
            disabled={true}
          />

          <div style={{ pointerEvents: "none" }}>
            <Dropdown
              // url="/api/category/getAll"
              id="addPlantCategory"
              title="Plant Category"
              // onChange={dropDownChangeHandler}

              value={state.addPlantCategory}
              required
              isMultiEnabled
              data={categoryList}
            />
          </div>
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
                min={0}
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.totalPrice}
                id="totalPrice"
                type="number"
                onChange={inputChangeHandler}
                title="Total Price"
                onBlur={(e) => {
                  if (e.target.value < 0) {
                    toast.error("Total Price shouldn't be negative number");
                  }
                }}
                required
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.currentPaidAmount}
                id="currentPaidAmount"
                type="number"
                onChange={inputChangeHandler}
                title="Current Paid Amount"
                onBlur={(e) => {
                  if (e.target.value < 0) {
                    toast.error("Total Price shouldn't be negative number");
                  }
                }}
                required
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.expectedDeliveryDate}
                id="expectedDeliveryDate"
                type="date"
                onChange={inputChangeHandler}
                title="Expected Delivery Date"
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
              loading={isOrderLoading}
              disabled={
                isEmpty(state.addPlantName) ||
                isEmpty(state.addVendorName) ||
                isEmpty(state.totalPrice) ||
                isEmpty(state.currentPaidAmount) ||
                isEmpty(state.totalQuantity) ||
                isEmpty(state.description) ||
                isEmpty(state.expectedDeliveryDate)
              }
              type="primary"
              title="Save"
            />
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
    </div>
  );
};

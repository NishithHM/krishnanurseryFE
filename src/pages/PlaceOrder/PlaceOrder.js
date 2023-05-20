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
  useGetProcurementMutation,
  usePlaceOrderMutation,
  useGetOrderIdMutation
} from "../../services/procurement.services";
import _ from "lodash";
import { isEmpty } from "lodash";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getTableBody } from "./helper";
import { toast } from "react-toastify";
import { useGetAllCategoriesQuery} from "../../services/categories.services";
import dayjs from "dayjs";

/* /api/procurements/vendor-orders/:id GET --> [1235353, 345345455, 34534354]  ---> [{label:1235353, value: 1235353}]
*/

export const PlaceOrder = () => {
  const initialState = {
    totalQuantity: 0,
    totalPrice: 0,
    description: "",
    addPlantName: {},
    addPlantCategory: [],
    addVendorName: {},
    addVendorContact: "",
    vendorDeviation: "",
    addPlantKannada: "",
    expectedDeliveryDate: "",
    currentPaidAmount: 0,
    disabledVendorContact: false,
    errorFields: [],
    isNameInKannada: false,
    addProcurementError: [],
    submitDisabled: false,
    orderId: {},
    orderDropdownValues: []
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [search] = useSearchParams();
  const procId = search.get("id");
  const requestedQuantity = search.get("requestedQuantity");
  const [getProcurement] = useGetProcurementMutation();
  const [state, setState] = useState(initialState);
  const [categoryList, setCategoryList] = useState([]);
  const [firstLoad, setFirstLoad] = useState(true);

  const categories = useGetAllCategoriesQuery({ sortType: 1 });
  const [getOrderId] = useGetOrderIdMutation()

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

  useEffect(() => {
    if (location.state) {
      setState((prev) => ({
        ...prev,
        addVendorName: {
          label: location.state?.label,
          value: location.state?.value,
          meta: { contact: location?.state?.vendorContact },
        },
      }));
    }
  }, [location.state]);

  const inputChangeHandler = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const inputChangeHandlerNumber = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: parseInt(event.target.value, 10),
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
    console.log(state);
    setState((prev) => ({
      ...prev,
      addVendorContact: state.addVendorName?.meta?.contact,
      vendorDeviation:
        state.addVendorName?.meta?.deviation === undefined
          ? ""
          : state.addVendorName?.meta?.deviation &&
            state.addVendorName?.meta?.deviation < 0
          ? `${state.addVendorName.label || ""} owes you ${Math.abs(
              state.addVendorName?.meta?.deviation
            )}`
          : `You owe ${state.addVendorName.label || ""} ${Math.abs(
              state.addVendorName?.meta?.deviation
            )} `,
      disabledVendorContact: state.addVendorName?.__isNew__ ? false : true,
    }));
    getOrderId({id:state.addVendorName?.value})
    .then((res) => {
      if(state.addVendorName?.value){
      const data = res?.data;
      const orderMap = data.map((ele)=>{
        return {
          label: ele,
          value: ele
        }
      })
      setState((prev) => ({
        ...prev,
        orderDropdownValues: orderMap,
      }))} else{
        return {}
      }
    }).catch((err) => {
      console.log(err);
    });
  }, [state.addVendorName?.value]);

  const onError = (error) => {
    toast.error(error);
  };

  const onSubmitHandler = async () => {
    // console.log(state);

    const body = {
      nameInEnglish: state.addPlantName?.label,
      nameInKannada:
        state.addPlantName?.meta?.names?.ka?.name || state.addPlantKannada,
      vendorName: state.addVendorName.label,
      vendorContact: state.addVendorContact,
      totalQuantity: state.totalQuantity,
      totalPrice: state.totalPrice,
      description: state.description,
      categories: state.addPlantCategory,
      expectedDeliveryDate: state.expectedDeliveryDate,
      currentPaidAmount: state.currentPaidAmount,
      orderId: state.orderId?.value
    };

    if (search.get("orderId")) {
      body.id = search.get("orderId");
    }
    if (!state?.addVendorName?.__isNew__) {
      body.vendorId = state.addVendorName.value;
    }
    if (!state?.addPlantName?.__isNew__) {
      body.procurementId = state.addPlantName.value;
    }
    const categories = body.categories.map((c) => ({
      name: c.label,
      _id: c.value,
    }));
    body.categories = categories;
    // console.log(state);

    console.log(body);
    const response = await PlaceOrder({ body });
    if (response["error"] !== undefined) {
      console.log(response);
      return toast.error(response.error.data.error);
    }
    toast.success(response.data.message);
    setTimeout(() => {
      navigate("../dashboard/orders");
    }, 1000);
  };

  useEffect(() => {
    if (procId) {
      getProcurement({ id: procId })
        .then((res) => {
          const data = res.data;
          console.log(data);
          const plantData = {
            label: data?.names?.en?.name,
            value: data?._id,
            meta: { ...data },
          };
          setState((prev) => ({
            ...prev,
            addPlantName: plantData,
          }));
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [procId]);

  useEffect(() => {
    setState((prev) => {
      return { ...prev, totalQuantity: requestedQuantity || 0 };
    });
  }, [requestedQuantity]);

  console.log(state);

  const isInhouseOrder =
    state.addVendorContact && state.addVendorContact === "9999999999";

  const isSubmitDisabled =
    isEmpty(state.addPlantName) ||
    isEmpty(state.addVendorName) ||
    isEmpty(state.totalPrice.toString()) ||
    isEmpty(state.totalQuantity.toString()) ||
    isEmpty(state.description) ||
    isEmpty(state.expectedDeliveryDate);

  const isSubmitDisabledWithInHouse =
    isEmpty(state.addPlantName) ||
    isEmpty(state.addVendorName) ||
    isEmpty(state.totalQuantity.toString()) ||
    isEmpty(state.description);

  useEffect(() => {
    if (isInhouseOrder)
      setState((prev) => ({
        ...prev,
        expectedDeliveryDate: dayjs().format("YYYY-MM-DD"),
      }));
  }, [isInhouseOrder]);
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
            url="/api/procurements/getAll?isList=true&isAll=true"
            id="addPlantName"
            apiDataPath={{ label: "names.en.name", value: "_id" }}
            title="Plant Name"
            onChange={dropDownChangeHandler}
            value={state.addPlantName}
            canCreate={true}
            required
          />
          <Input
            value={
              state?.addPlantName?.meta?.names?.ka?.name ||
              state.addPlantKannada
            }
            id="addPlantKannada"
            type="text"
            onChange={inputChangeHandler}
            title="Plant Name in Kannada"
            required
            onError={onError}
            validation={(text) => text.length > 0}
            errorMessage="Please Enter new Plant in Kannada"
            disabled={state?.addPlantName?.meta?.names?.ka?.name}
          />

          <div>
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
            disabled={isInhouseOrder}
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
          {state.vendorDeviation !== "" && (
            <Input
              value={state.vendorDeviation || ""}
              id="vendorDeviation"
              onChange={() => {}}
              title="Vendor Deviation Amount"
              required
              disabled={true}
            />
          )}
          <Dropdown
      
            id="orderId"
            data={state.orderDropdownValues}
            title="Select Order Id"
            onChange={dropDownChangeHandler}
            value={state.orderId}
            required
          />
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.totalQuantity}
                id="totalQuantity"
                type="number"
                onChange={inputChangeHandlerNumber}
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
                onChange={inputChangeHandlerNumber}
                title="Total Price"
                onBlur={(e) => {
                  if (e.target.value < 0) {
                    toast.error("Total Price shouldn't be negative number");
                  }
                }}
                disabled={isInhouseOrder}
                {...(isInhouseOrder
                  ? { required: !isInhouseOrder }
                  : { required: true })}
              />
            </div>
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.inputdiv}>
              <Input
                value={state.currentPaidAmount}
                id="currentPaidAmount"
                type="number"
                disabled={isInhouseOrder}
                onChange={(e) => {
                  if (e.target.value > state.totalPrice) {
                    toast.error("Adavnce should not be more than total price");
                  }
                  const value = Math.max(
                    0,
                    Math.min(state.totalPrice, Number(e.target.value))
                  );
                  setState((prev) => ({
                    ...prev,
                    currentPaidAmount: parseInt(value, 10),
                  }));
                }}
                title="Advance Paid"
                max={state.totalPrice}
                onBlur={(e) => {
                  if (e.target.value < 0) {
                    toast.error("Total Price shouldn't be negative number");
                  }
                }}
                {...(isInhouseOrder
                  ? { required: !isInhouseOrder }
                  : { required: true })}
              />
            </div>
            <div className={styles.secondinputdiv}>
              <Input
                value={state.expectedDeliveryDate}
                id="expectedDeliveryDate"
                type="date"
                onChange={inputChangeHandler}
                title="Expected Delivery Date"
                min={dayjs().format("YYYY-MM-DD")}
                disabled={isInhouseOrder}
                {...(isInhouseOrder
                  ? { required: !isInhouseOrder }
                  : { required: true })}
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
            required
          />
          <div className={styles.formbtn}>
            <Button
              onClick={onSubmitHandler}
              loading={isOrderLoading}
              disabled={
                isInhouseOrder ? isSubmitDisabledWithInHouse : isSubmitDisabled
              }
              type="primary"
              title="Save"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

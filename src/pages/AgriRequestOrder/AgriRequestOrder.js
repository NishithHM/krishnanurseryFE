import React, { useEffect, useMemo, useState } from "react";
import {
  AgriVarinatsAddition,
  BackButton,
  Button,
  Dropdown,
  Input,
} from "../../components";
import TextArea from "../../components/TextArea";
import {
  usePlaceAgriOrderMutation,
  useRequestAgriOrderMutation,
  useGetOrderIdMutation,
  useGetInvoiceMutation
} from "../../services/agrivariants.services";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import styles from './AgriRequestOrder.css'
import { isEmpty } from "lodash";


const AgriRequesrOrder = () => {
  const [orderData, setOrderData] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [description, setDescription] = useState("");
  const [isVariantAdded, setIsVariantAdded] = useState(false)
  const [state, setState] = useState({
    vendorName: "",
    vendorContact: "",
    expectedDeliveryDate: "",
    currentPaidAmount: "",
    isNewVendor: false,
    orderDropdownValues: [],
    orderId: "",
    orderDetails: [],
    disableExpectedDate: false,
    vendorDeviation: ""
  });
  const navigate = useNavigate();

  const location = useLocation();
  const isPlaceOrder = location?.state?.placeOrder || false;
  const [getOrderId] = useGetOrderIdMutation();

  const [requestOrder] = useRequestAgriOrderMutation();
  const [placeOrder] = usePlaceAgriOrderMutation();
  const [getInvoice] = useGetInvoiceMutation()
  const placeOrderVariantsData = useMemo(() => {

    // hardcoding 0 temporarily ( need to conver to array)
    const variants = location?.state?.data;
    return variants?.map(variant => ({
      type: { label: variant.type, value: variant.type },
      name: { label: variant.names, value: variant.names },
      options: variant.variant.map((option) => {
        return {
          optionName: option.optionName,
          optionValues: [option.value],
          value: { label: option.optionValue, value: option.optionValue },
        };
      }),
      totalQuantity: variant.requestedQuantity,
      price: 0,
    }))
  }, [JSON.stringify(location?.state?.data)]);
  const handleRequestOrder = async () => {
    const transformedData = orderData.map((item) => {
      const variant = item.options.map((option) => ({
        optionName: option.optionName,
        optionValue: option.value.value,
      }));

      return {
        totalQuantity: parseInt(item.totalQuantity),
        type: item.type.label,
        name: item.name.label,
        variant: variant,
      };
    });

    const data = { orders: transformedData, description };
    const res = await requestOrder(data);
    if(res.error?.data?.error) {
      if(res.error?.data?.error === "") {
        return toast.error("Something went wrong, Please try again")
      }else {
        return toast.error(res.error?.data?.error)
      }
    }
    toast.success(res.data.message);
    navigate("../dashboard/agri-orders");
  };


  useEffect(() => {
    const getOrderDetails = async () => {
      if (state.orderId?.value) {
        const { data } = await getInvoice({
          id: state.orderId?.value,
          page: "placeOrder",
        });
        setState((prev) => ({
          ...prev,
          orderDetails: data,
          expectedDeliveryDate: dayjs(data?.expectedDeliveryDate).format(
            "YYYY-MM-DD"
          ),
          disableExpectedDate: data?.expectedDeliveryDate ? true : false,
        }));
      }
    };
    getOrderDetails();
  }, [state.orderId?.value]);
  const handleCreateOrder = async () => {
    const transformedData = orderData.map((item, index) => {
      const variant = item.options.map((option) => ({
        optionName: option.optionName,
        optionValue: option.value.value,
      }));

      return {
        totalQuantity: parseInt(item.totalQuantity),
        type: item.type.label,
        name: item.name.label,
        variant: variant,
        totalPrice: parseInt(item.totalQuantity) * parseInt(item.price),
        id: location?.state?.data?.[index]?._id
      };
    });
    const order = { orders: transformedData, description, ...state };
    delete order.isNewVendor;
    delete order.orderId;
    delete order.orderDropdownValues;
    delete order.vendorName;
    delete order.orderDetails
    delete order.disableExpectedDate
    delete order.vendorDeviation
    order.vendorName = state.vendorName.label;
    ;
    order.orderId = state.orderId.value;
    if (!state.isNewVendor) {
      order.vendorId = state.vendorName?.value
    }

    const res = await placeOrder(order);
    if(res.error?.data?.error) {
        if(res.error?.data?.error === "") {
          return toast.error("Something went wrong, Please try again")
        }else {
          return toast.error(res.error?.data?.error)
        }
    } 
    toast.success(res.data.message);
    navigate("../dashboard/agri-orders");
  };
  const getDevitaionAmount = (event) => {
    if (event?.meta?.deviation < 0) {
      return `${event.label || ""} owes you ${Math.abs(
        event?.meta?.deviation
      )}`
    } else if (event?.meta?.deviation > 0) {
      return `You owe ${event.label || ""} ${Math.abs(
        event?.meta?.deviation
      )} `
    }
    return ""
  }

  const vendorChangeHandler = (event, id) => {

    setState((prev) => {
      return {
        ...prev,
        [id]: event,
        vendorContact: event?.meta?.contact || "",
        isNewVendor: event?.__isNew__ || false,
        vendorDeviation: getDevitaionAmount(event),
      };
    });
  };
  const orderIdChangeHandler = (event, id) => {

    setState((prev) => {
      return {
        ...prev,
        orderId: event,
      };
    });
  };
  useEffect(() => {
    if (state?.vendorName?.label) {
      getOrderId({ id: state?.vendorName?.value })
        .then((res) => {
          if (state?.vendorName?.label) {
            const data = res?.data;
            const orderMap = data.map((ele, index) => {
              const isLast = index === data.length - 1 ? "(new)" : "";
              return {
                label: `${ele} ${isLast}`,
                value: ele,
              };
            });
            setState((prev) => ({
              ...prev,
              orderDropdownValues: orderMap,
            }));
          } else {
            return {};
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [state.vendorName.label]);
  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard/agri-orders"} />
      </div>
      <AgriVarinatsAddition
        isPlaceOrder={(location?.state && location?.state?.placeOrder) || false}
        onChange={(e) => {
          setOrderData(e);
        }}
        allowNew={isEmpty(placeOrderVariantsData)}
        value={placeOrderVariantsData}
        isFormValid={(e) => setIsFormValid(!e)}
        setIsVariantAdded={setIsVariantAdded}
      />
      <div
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {isPlaceOrder && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxWidth: "40rem",
            }}
          >
            <Dropdown
              url="/api/vendors/getAll?type=AGRI"
              id="vendorName"
              apiDataPath={{ label: "name", value: "_id" }}
              title="Vendor Name"
              onChange={vendorChangeHandler}
              value={state.vendorName}
              required
              minInputToFireApi={3}
              canCreate
            />

            <Input
              value={state.vendorContact}
              id="vendorContact"
              type="number"
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  vendorContact: e.target.value,
                }));
              }}
              title="Contact Number"
              required
              disabled={!state.isNewVendor}
              validation={(number) => {
                return number.length === 10;
              }}
              onError={({id, isError}) => {
                console.log("ID & ISERROR",id + " " + isError)
              }}
              errorMessage= {"Please Enter a Valid Number"}
            />
            {state.vendorDeviation !== "" && (
              <Input
                value={state.vendorDeviation || ""}
                id="vendorDeviation"
                onChange={() => { }}
                title="Vendor Deviation Amount"
                required
                disabled={true}
              />
            )}

            <Dropdown
              id="orderId"
              data={state.orderDropdownValues}
              title="Select Order Id"
              onChange={orderIdChangeHandler}
              value={state.orderId}
              required
            />
            {state.orderDetails?.items?.length > 0 && (
              <div>
                <span className={styles.orderLabel}>Previous Order Details:</span>
                {state.orderDetails.items.map((ele, ind) => {
                  return (
                    <div className={styles.orderItems}>
                      {`${ind + 1}) ${ele?.names}    X   ${ele.orderedQuantity
                        }   =   ${ele.totalPrice}`}
                    </div>
                  );
                })}
                <div className={styles.orderItems}>
                  Total Advance amount: {state.orderDetails.advanceAmount}
                </div>
                <div className={styles.orderItems}>
                  Total amount: {state.orderDetails.totalAmount}
                </div>
              </div>
            )}
            <Input
              value={state.currentPaidAmount}
              id="currentPaidAmount"
              type="number"
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  currentPaidAmount: parseInt(e.target.value),
                }));
              }}
              title="Advance Paid"
              max={state.totalPrice}
              onBlur={(e) => {
                if (e.target.value < 0) {
                  toast.error("Total Price shouldn't be negative number");
                }
              }}
              required={true}
            />
            <Input
              value={state.expectedDeliveryDate}
              id="expectedDeliveryDate"
              type="date"
              disabled={state.disableExpectedDate}
              onChange={(e) => {
                setState((prev) => ({
                  ...prev,
                  expectedDeliveryDate: e.target.value,
                }));
              }}
              title="Expected Delivery Date"
              min={dayjs().format("YYYY-MM-DD")}
            />
          </div>
        )}
        <div style={{ maxWidth: "25rem" }}>
          <TextArea
            title="Description"
            rows={4}
            value={description}
            required
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ width: "fit-content" }}>
          <Button
            title="Place Order"
            disabled={
              isPlaceOrder
                ? !isVariantAdded || !isFormValid ||
                description === "" ||
                !state.vendorName ||
                state.vendorContact === "" ||
                !state.orderId ||
                !state.expectedDeliveryDate
                : !isFormValid || description === ""
            }
            onClick={isPlaceOrder ? handleCreateOrder : handleRequestOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default AgriRequesrOrder;

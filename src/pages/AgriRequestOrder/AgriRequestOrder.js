import React, { useEffect, useState } from "react";
import {
  AgriVarinatsAddition,
  Button,
  Dropdown,
  Input,
} from "../../components";
import TextArea from "../../components/TextArea";
import {
  usePlaceAgriOrderMutation,
  useRequestAgriOrderMutation,
} from "../../services/agrivariants.services";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useGetOrderIdMutation } from "../../services/procurement.services";

const AgriRequesrOrder = () => {
  const [orderData, setOrderData] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [description, setDescription] = useState("");
  const [state, setState] = useState({
    vendorName: "",
    vendorContact: "",
    expectedDeliveryDate: "",
    currentPaidAmount: "",
    isNewVendor: false,
    orderDropdownValues: [],
    orderId: "",
  });
  const navigate = useNavigate();

  const location = useLocation();
  const isPlaceOrder = location?.state?.placeOrder || false;
  const [getOrderId] = useGetOrderIdMutation();

  const [requestOrder] = useRequestAgriOrderMutation();
  const [placeOrder] = usePlaceAgriOrderMutation();
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
    toast.success(res.data.message);
    navigate("../dashboard");
  };
  const handleCreateOrder = async () => {
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
        totalPrice: parseInt(item.totalQuantity) * parseInt(item.price),
      };
    });
    const order = { orders: transformedData, description, ...state };
    delete order.isNewVendor;
    delete order.orderId;
    delete order.orderDropdownValues;
    delete order.vendorName;
    order.vendorName = state.vendorName.label;
    console.log(location.state);
    order.orderId = state.orderId.value;

    const res = await placeOrder(order);
    toast.success(res.data.message);
    navigate("../dashboard");
  };

  const vendorChangeHandler = (event, id) => {
    console.log(event);

    setState((prev) => {
      return {
        ...prev,
        [id]: event,
        vendorContact: event?.meta?.contact || "",
        isNewVendor: event?.__isNew__ || false,
      };
    });
  };
  const orderIdChangeHandler = (event, id) => {
    console.log(event);

    setState((prev) => {
      return {
        ...prev,
        orderId: event,
      };
    });
  };
  useEffect(() => {
    if (state?.vendorName?.label) {
      getOrderId({ id: state?.vendorName?.label })
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
      <AgriVarinatsAddition
        isPlaceOrder={(location?.state && location?.state?.placeOrder) || false}
        onChange={(e) => {
          console.log(e);
          setOrderData(e);
        }}
        isFormValid={(e) => setIsFormValid(!e)}
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
              errorMessage="Please Enter a Valid Number"
            />

            <Dropdown
              id="orderId"
              data={state.orderDropdownValues}
              title="Select Order Id"
              onChange={orderIdChangeHandler}
              value={state.orderId}
              required
            />

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
              onChange={(e) => {
                console.log(e);
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
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div style={{ width: "fit-content" }}>
          <Button
            title="Place Order"
            disabled={
              isPlaceOrder
                ? !isFormValid ||
                  description === "" ||
                  !state.vendorName ||
                  state.vendorContact === "" ||
                  !state.orderId ||
                  !state.currentPaidAmount ||
                  state.currentPaidAmount <= 0 ||
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

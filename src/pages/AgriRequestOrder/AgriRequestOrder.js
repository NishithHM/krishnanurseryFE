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
  });
  const navigate = useNavigate();

  const location = useLocation();
  const isPlaceOrder = location?.state?.placeOrder || false;

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
    delete order.vendorName;
    order.vendorName = state.vendorName.label;

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
        isNewVendor: event?.isNew || false,
      };
    });
  };
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
          <div>
            <Dropdown
              url="/api/vendors/getAll"
              id="vendorName"
              apiDataPath={{ label: "name", value: "_id" }}
              title="Vendor Name"
              onChange={vendorChangeHandler}
              value={state.vendorName}
              canCreate
              required
              minInputToFireApi={3}
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
            disabled={!isFormValid || description === ""}
            onClick={isPlaceOrder ? handleCreateOrder : handleRequestOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default AgriRequesrOrder;

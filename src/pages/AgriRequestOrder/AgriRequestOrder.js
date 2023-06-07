import React, { useEffect, useState } from "react";
import { AgriVarinatsAddition, Button } from "../../components";
import TextArea from "../../components/TextArea";
import { useRequestAgriOrderMutation } from "../../services/agrivariants.services";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const AgriRequesrOrder = () => {
  const [orderData, setOrderData] = useState([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  //   useEffect(() => {
  //     console.log(orderData);
  //   }, [orderData]);

  // useEffect(() => {
  //   console.log(isFormValid);
  // }, [isFormValid]);

  const [requestOrder] = useRequestAgriOrderMutation();
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
      };
    });

    const data = { orders: transformedData, description };
    const res = await requestOrder(data);
    toast.success(res.data.message);
    navigate("../dashboard");
  };

  return (
    <div>
      <AgriVarinatsAddition
        onChange={(e) => setOrderData(e)}
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
            onClick={handleCreateOrder}
          />
        </div>
      </div>
    </div>
  );
};

export default AgriRequesrOrder;

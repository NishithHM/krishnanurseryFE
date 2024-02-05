import dayjs from "dayjs";
import _ from "lodash";
import { toast } from "react-toastify";
import styles from "./UnderMaintenance.module.css";
import { useState } from "react";
import { Button } from "../../components";
import QuantityInput from "./QuantityInput";

const requiredData = [
  "plantName",
  "remainingQuantity",
  "underMaintenanceQuantity",
  "save",
];

const ViewDetials = ({ onDetailClick, id }) => {
  return (
    <span
      onClick={(e) => onDetailClick(id)}
      style={{ color: "#038819 ", fontWeight: "600", cursor: "pointer" }}
    >
      View Details
    </span>
  );
};
export const getProcurementListTableBody = (data, onDetailClick) => {
  if (_.isEmpty(data)) {
    return [];
  } else {
    const history = data?.map((ele) => {
      const res = requiredData?.map((res) => {
        if (res === "plantName") {
          return { value: ele?.names?.en?.name };
        } else if (res === "underMaintenanceQuantity") {
          return {
            value: (
              <QuantityInput
                id={ele._id}
                val={ele.underMaintenanceQuantity}
                maxValue={ele.remainingQuantity}
              />
            ),
          };
        } else {
          return { value: ele[res] };
        }
      });
      return res;
    });
    return history;
  }
};

const requiredDataHistory = [
  "procuredOn",
  "quantity",
  "vendorName",
  "vendorContact",
  "totalPrice",
  "images",
  "invoice",
];

const handleDownload = (fileUrl) => {
  if (!fileUrl || fileUrl === "null") return toast.error("No File Available");
  let name = fileUrl.split("/");
  name = name[name.length - 1];
  fetch(`${process.env.REACT_APP_BASE_URL}/api/download?path=${fileUrl}`, {
    headers: { Authorization: sessionStorage.getItem("authToken") },
  })
    .then((response) => response.blob())
    .then((blob) => {
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = name;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => console.error("Error downloading file:", error));
};
const handleImageOpen = (data) => {
  const images = data.images;
  if (images.length === 0)
    return toast.error("No Images found for this procurement!");
};
export const getTableBody = (data, imagesHandler) => {
  const result = data?.map((ele) => {
    const data = requiredDataHistory.map((data) => {
      if (data === "procuredOn") {
        return {
          value: dayjs(ele[data] || ele?.createdAt).format("DD/MM/YYYY"),
        };
      } else if (data === "totalPrice") {
        return { value: (ele[data] / ele.quantity).toFixed(2) };
      } else if (data === "invoice") {
        return {
          value: (
            <p
              onClick={() => handleDownload(ele?.invoice || "")}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#302c2c",
              }}
            >
              View
            </p>
          ),
        };
      } else if (data === "images") {
        return {
          value: (
            <p
              onClick={async () => {
                imagesHandler(ele);
              }}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#302c2c",
              }}
            >
              View
            </p>
          ),
        };
      } else if (data === "createdBy") {
        return {
          value: <p>{ele["createdBy"]?.name}</p>,
        };
      } else {
        return { value: ele[data] };
      }
    });
    return data;
  });
  return result;
};
export const variantHeaders = [
  "Variant's Name (English)",
  "Variant's Name (Kannada)",
  "Max Price",
  "Min Price",
];

export const rowInitState = [
  { id: "variantNameInEnglish", type: "text", value: "" },
  { id: "variantNameInKannada", type: "text", value: "" },
  { id: "maxPrice", type: "number", value: "" },
  { id: "minPrice", type: "number", value: "" },
];

export const InputCell = ({ id, onInputChange, value, type }) => {
  return (
    <>
      <input
        className={styles.tableInput}
        id={id}
        onChange={(e) => onInputChange(e.target.value)}
        value={value}
        type={type}
      />
    </>
  );
};

import dayjs from "dayjs";
import { get, isEmpty } from "lodash";
import warning from "../../assets/images/warning.png";
import { toast } from "react-toastify";

export const addTitle = {
  procurement: "Place Order",
  sales: "Request Order",
};

export const addLink = {
  procurement: "place-order",
  sales: "request-order",
};

export const ROLE_TABLE_HEADER = {
  admin: [
    {
      value: "Name",
      isSortable: true,
      sortBy: "plantName",
    },
    {
      value: "Created On",
      isSortable: true,
      sortBy: "createdAt",
    },
    {
      value: "Vendor Name",
    },
    {
      value: "Vendor Contact",
    },
    {
      value: "Total Amount",
    },
    {
      value: "Amount Paid",
    },
    {
      value: "Requested By",
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Order Id",
    },
    {
      value: "Quantities",
    },
    {
      value: "Placed By",
    },
    {
      value: "Expected Delivery",
    },
    {
      value: "Proc Desc",
    },
    {
      value: "Status",
    },
    {
      value: "Action",
    },
  ],
  procurement: [
    {
      value: "Name",
      isSortable: true,
      sortBy: "plantName",
    },
    {
      value: "Created On",
      isSortable: true,
      sortBy: "createdAt",
    },
    {
      value: "Vendor Name",
    },
    {
      value: "Vendor Contact",
    },
    {
      value: "Total Amount",
    },
    {
      value: "Amount Paid",
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Order Id",
    },
    {
      value: "Quantities",
    },
    {
      value: "Placed By",
    },
    {
      value: "Expected Delivery",
    },
    {
      value: "Status",
    },
    {
      value: "Action",
    },
  ],
  sales: [
    {
      value: "Name",
      isSortable: true,
      sortBy: "plantName",
    },
    {
      value: "Created On",
      isSortable: true,
      sortBy: "createdAt",
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Quantities",
    },
    {
      value: "Expected Delivery",
    },
    {
      value: "Proc Desc",
    },
    {
      value: "Status",
    },
    {
      value: "Action",
    },
  ],
};

const roleRows = {
  admin: [
    { value: "names.en.name" },
    { value: "createdAt" },
    { value: "vendorName" },
    { value: "vendorContact" },
    { value: "totalPrice" },
    { value: "currentPaidAmount" },
    { value: "requestedBy.name" },
    { value: "descriptionSales" },
    { value: "orderId" },
    { value: "quantities" },
    { value: "placedBy.name" },
    { value: "expectedDeliveryDate" },
    { value: "descriptionProc" },
    { value: "status" },
  ],
  procurement: [
    { value: "names.en.name" },
    { value: "createdAt" },
    { value: "vendorName" },
    { value: "vendorContact" },
    { value: "totalPrice" },
    { value: "currentPaidAmount" },
    { value: "descriptionSales" },
    { value: "orderId" },
    { value: "quantities" },
    { value: "placedBy.name" },
    { value: "expectedDeliveryDate" },
    { value: "status" },
  ],
  sales: [
    { value: "names.en.name" },
    { value: "createdAt" },
    { value: "descriptionSales" },
    { value: "quantities" },
    { value: "expectedDeliveryDate" },
    { value: "descriptionProc" },
    { value: "status" },
  ],
};

const getStatusColor = {
  VERIFIED: "green",
  PLACED: "blue",
  REJECTED: "red",
  REQUESTED: "black",
};
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

export const formatOrdersData = ({ data, role, onAction }) => {

  const formatted = data.map((order) => {
    console.log("ORDERED INVOICE", order.invoice)
    const rowData = roleRows[role].map((ele) => {
      let value;
      if (ele.value === "createdAt" || ele.value === "expectedDeliveryDate") {
        value = dayjs(get(order, `${ele.value}`, "")).format("YYYY-MM-DD");
        value = value === "Invalid Date" ? "---" : value;
      } else if (ele.value === "status") {
        value = (
          <span
            style={{
              color: getStatusColor[get(order, `${ele.value}`, "")],
              fontWeight: "600",
              textTransform: "capitalize",
            }}
          >
            {get(order, `${ele.value}`, "").toLowerCase()}
          </span>
        );
      } else if (ele.value === "quantities") {
        value = (
          <>
            <span>{`${order.requestedQuantity} (Req)`}</span>
            <br />
            <span>{`${order.orderedQuantity} (Ord)`}</span>
            <br />
            <span
              style={{
                color: order.quantity !== order.orderedQuantity && "red",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span>{`${order.quantity} (Arr)`}</span>
              {order.quantity !== order.orderedQuantity && (
                <img
                  src={warning}
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                  alt="warning"
                />
              )}
            </span>
          </>
        );
      } else if (
        ele.value === "descriptionProc" ||
        ele.value === "descriptionSales"
      ) {
        value = (
          <span style={{ maxWidth: "200px", display: "block" }}>
            {get(order, `${ele.value}`, "")}
          </span>
        );
      } else {
        value = get(order, `${ele.value}`, "");
      }
      value = value || "--";
      return { value };
    });


    if (role === "procurement" || role === "admin") {
      if (order.status === "REQUESTED" && role === "procurement") {
        const rejectOrder = {
          value: (
            <>
              <span
                style={{ color: "red", fontWeight: "600", cursor: "pointer" }}
                onClick={() => {
                  onAction({ id: order._id, action: "reject", data: order });
                }}
              >
                Reject
              </span>
              /&nbsp;
              <span
                style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                onClick={() => {
                  onAction({
                    id: order.procurementId,
                    action: "accept",
                    data: order,
                    orderId: order._id,
                  });
                }}
              >
                Accept
              </span>
            </>
          ),
        };

        rowData.push(rejectOrder);
      } else if (
        order.invoice === "" &&
        ["PLACED", "VERIFIED"].includes(order.status) &&
        order.vendorContact !== "9999999999" && role === "procurement"
      ) {
        const AddInvoice = {
          value: (
            <span
              style={{ color: "red", fontWeight: "600", cursor: "pointer" }}
              onClick={() => {
                onAction({ id: order._id, action: "addInvoice", data: order });
              }}
            >
              Add Invoice
            </span>
          ),
        };
        rowData.push(AddInvoice);
      } else {
        if (order.invoice && order.invoice !== "") {
          const viewInvoice = {
            value: (
              <span
                style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                onClick={() => handleDownload(order.invoice)}
              >
                View Invoice
              </span>
            ),
          };
          rowData.push(viewInvoice);
        } else {
          rowData.push({ value: "---" });
        }
      }
    }

    if (role === "sales") {
      if (order.status === "PLACED") {
        const verifyOrder = {
          value: (
            <span
              style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
              onClick={() => {
                onAction({ id: order._id, action: "verify", data: order });
              }}
            >
              Verify
            </span>
          ),
        };
        rowData.push(verifyOrder);
      } else {
        rowData.push({ value: "---" });
      }
    }

    return rowData;
  });

  return formatted;
};

export const formatFilter = (filters) => {
  const data = {
    vendors: filters?.vendors.map((ele) => ele.value),
    status: filters?.status.map((ele) => ele.value),
  };
  if (filters.start_date) {
    data.startDate = dayjs(filters.start_date).format("YYYY-MM-DD");
  }
  if (filters.end_date) {
    data.endDate = dayjs(filters.end_date).format("YYYY-MM-DD");
  }
  return data;
};

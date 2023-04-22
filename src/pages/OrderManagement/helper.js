import dayjs from "dayjs";
import { get, isEmpty } from "lodash";

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
    },
    {
      value: "Created On",
      isSortable: true,
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
      value: "Advance Amount",
    },
    {
      value: "Requested By",
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Requested Qty",
    },
    {
      value: "Ordered Qty",
    },
    {
      value: "Arrived Qty",
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
  ],
  procurement: [
    {
      value: "Name",
      isSortable: true,
    },
    {
      value: "Created On",
      isSortable: true,
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
      value: "Advance Amount",
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Requested Qty",
    },
    {
      value: "Ordered Qty",
    },
    {
      value: "Arrived Qty",
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
    },
    {
      value: "Created On",
      isSortable: true,
    },
    {
      value: "Sales Desc",
    },
    {
      value: "Requested Qty",
    },
    {
      value: "Ordered Qty",
    },
    {
      value: "Arrived Qty",
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
    { value: "requestedQuantity" },
    { value: "orderedQuantity" },
    { value: "quantity" },
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
    { value: "requestedQuantity" },
    { value: "orderedQuantity" },
    { value: "quantity" },
    { value: "placedBy.name" },
    { value: "expectedDeliveryDate" },
    { value: "status" },
  ],
  sales: [
    { value: "names.en.name" },
    { value: "createdAt" },
    { value: "descriptionSales" },
    { value: "requestedQuantity" },
    { value: "orderedQuantity" },
    { value: "quantity" },
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

export const formatOrdersData = ({ data, role, onAction }) => {
  console.log(data);
  console.log(role);

  const formatted = data.map((order) => {
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
      } else {
        value = get(order, `${ele.value}`, "");
      }
      value = value || "--";
      return { value };
    });

    if (role === "procurement") {
      if (order.status === "REQUESTED") {
        const rejectOrder = {
          value: (
            <>
              <span
                style={{ color: "red", fontWeight: "600", cursor: "pointer" }}
                onClick={() => {
                  onAction({ id: order._id, action: "reject" });
                }}
              >
                Reject
              </span>
              /&nbsp;
              <span
                style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                onClick={() => {
                  onAction({ id: order._id, action: "accept" });
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
        ["PLACED", "VERIFIED"].includes(order.status)
      ) {
        const AddInvoice = {
          value: (
            <span
              style={{ color: "red", fontWeight: "600", cursor: "pointer" }}
              onClick={() => {
                onAction({ id: order._id, action: "addInvoice" });
              }}
            >
              Add Invoice
            </span>
          ),
        };
        rowData.push(AddInvoice);
      } else {
        rowData.push({ value: "---" });
      }
    }

    if (role === "sales") {
      if (order.status === "PLACED") {
        const verifyOrder = {
          value: (
            <span
              style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
              onClick={() => {
                onAction({ id: order._id, action: "verify" });
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

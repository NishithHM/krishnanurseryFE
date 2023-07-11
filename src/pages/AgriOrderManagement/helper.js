import dayjs from "dayjs";
import { get, isEmpty } from "lodash";
import { Checkbox } from "../../components";
import warning from "../../assets/images/warning.png"

export const addTitle = {
  procurement: "Place Order",
  sales: "Request Order",
};

export const addLink = {
  procurement: "../dashboard/orders-agri/request-order",
  sales: "../dashboard/orders-agri/request-order",
};

export const ROLE_TABLE_HEADER = {
  admin: [
    {
      value: "Name",
      isSortable: true,
      sortBy: "names",
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
  ],
  procurement: [
    {
      value: "Name",
      isSortable: true,
      sortBy: "names",
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
  ],
};

const roleRows = {
  admin: [
    { value: "names" },
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
    { value: "names" },
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
    { value: "names" },
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

export const formatOrdersData = ({ data, role, onAction }) => {
  const formatted = data.map((order) => {
    const rowData = roleRows[role].map((ele) => {
      let value;
      if (ele.value === "createdAt" || ele.value === "expectedDeliveryDate") {
        value = dayjs(get(order, `${ele.value}`, "")).format("DD-MM-YYYY");
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
          <div style={{ display : "flex", flexDirection : "column" , justifyContent : "space-between"}}>
                        <span>{`${order.requestedQuantity} (Req)`}
                        </span>
                        <br />
                        <span style={{
                            color : (order.requestedQuantity !== order.orderedQuantity && order.status === "PLACED") && "red",
                            display : "flex",
                            justifyContent : "center",
                            alignItems  : "center"
                        }} >
                        <span> {`${order.orderedQuantity} (Ord)`} </span>
                        { (order.requestedQuantity !== order.orderedQuantity && order.status === "PLACED") && <img src={warning} style={{
                            width : "15px",
                            height : "15px",
                        }} alt="warning" /> }  
                        </span>
                        <br />
                        <span style={{
                            color : (order.quantity !== order.orderedQuantity && order.status === "VERIFIED") && "red",
                            display : "flex",
                            justifyContent : "center",
                            alignItems  : "center"
                        }} >
                        <span>{`${order.quantity} (Arr)`}</span>
                        { (order.quantity !== order.orderedQuantity && order.status === "VERIFIED") && <img src={warning} style={{
                            width : "15px",
                            height : "15px",
                        }} alt="warning" /> }
                        </span>
                    </div>
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
      value = typeof value === "number" ? String(value) : value || "--";
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
                  onAction({ id: order._id, action: "reject", data: order });
                }}
              >
                Reject
              </span>
              /&nbsp;
              <Checkbox
                label={"Accept"}
                onChange={(e) => {
                  onAction({
                    id: order._id,
                    action: "placeOrder",
                    data: order,
                    isChecked: e,
                  });
                }}
              >
                Accept
              </Checkbox>
            </>
          ),
        };

        rowData.push(rejectOrder);
      } else if (
        order.invoice === "" &&
        ["PLACED", "VERIFIED"].includes(order.status) &&
        order.vendorContact !== "9999999999"
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
        rowData.push({ value: "---" });
      }
    }
    if (role === "sales") {
      if (order.status === "PLACED") {
        const verifyOrder = {
          value: (
            <>
              <span
                style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                onClick={() => {
                  onAction({ id: order._id, action: "verify", data: order });
                }}
              >
                Verify Order
              </span>
            </>
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

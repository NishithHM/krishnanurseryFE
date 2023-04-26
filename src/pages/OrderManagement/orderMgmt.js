import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./orderMgmt.module.css";
import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Table,
  Spinner,
  BackButton,
  Modal,
  Alert,
  AlertMessage,
  Dropzone,
  Input,
} from "../../components";

import {
  useAddOrderInvoiceMutation,
  useGetOrdersMutation,
  useRejectOrderMutation,
  useVerifyOrderMutation,
} from "../../services/procurement.services";

import { ImSearch } from "react-icons/im";
import { AuthContext } from "../../context";
import {
  addLink,
  addTitle,
  formatOrdersData,
  ROLE_TABLE_HEADER,
} from "./helper";
import { get } from "lodash";
import TextArea from "../../components/TextArea";
import { Textarea } from "@mantine/core";
import { toast } from "react-toastify";
import { MIME_TYPES } from "@mantine/dropzone";
import { AiOutlineClose } from "react-icons/ai";
const OrderMgmt = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [user] = useContext(AuthContext);
  const [sort, setSort] = useState({sortBy:'createdAt', sortType:'-1'})
  const [plantImage, setPlantImage] = useState(null);
  const [orderInvoiceFile, setOrderInvoiceFile] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [rejectOrder, setRejectOrder] = useState({
    isActive: false,
    id: null,
    reason: "",
  });
  const [verifyOrder, setVerifyOrder] = useState({
    isActive: false,
    id: null,
    data: null,
    quantity: 0,
  });
  const [addInvoice, setAddInvoice] = useState({
    isActive: false,
    id: null,
  });
  const [RejectOrder, { isLoading: isRejectLoading }] =
    useRejectOrderMutation();
  const [VerifyOrder, { isLoading: isVerifyLoading }] =
    useVerifyOrderMutation();

  const [AddOrderInvoice, { isLoading: isAddInvoiceLoading }] =
    useAddOrderInvoiceMutation();

  const [getOrders, { isLoading, isError, isSuccess }] = useGetOrdersMutation();
  const onAction = ({ id, action, data, orderId }) => {
    const functionObj = {
      reject: () => {
        setRejectOrder({ isActive: true, id: id, reason: "" });
      },
      accept: () => {
        console.log("accept", id, data);
        navigate(`./place-order?id=${id}&orderId=${orderId}` );
      },
      verify: () => {
        setVerifyOrder({ isActive: true, id, data, quantity: 0 });
      },
      addInvoice: () => {
        console.log("add invoice", id);
        setAddInvoice({ isActive: true, id });
      },
    };
    functionObj[action]();
  };
  const loadInitialOrders = async (page, sortData) => {
    const countBody = {
      isCount: true,
      sortBy: sortData.sortBy,
      sortType: sortData.sortType,
    };
    const listBody = {
      pageNumber: page,
      sortBy: sortData.sortBy,
      sortType: sortData.sortType,
    };
    if(page===1){
        const counts = await getOrders({ body: { ...countBody } });
        setOrdersCount(get(counts, "data[0].count", 0));
    }
    const list = await getOrders({ body: { ...listBody } });
    const formattedData = formatOrdersData({
      data: list.data,
      role: user.role,
      onAction,
    });
    console.log(formattedData);
    setData(formattedData);
  };

  useEffect(() => {
    loadInitialOrders(page, sort);
  }, [page, sort]);


  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      const res = await getOrders({ body: { search: query } });
      const counts = await getOrders({
        body: { search: query, isCount: true },
      });
      setOrdersCount(get(counts, "data[0].count", 0));
      const list = formatOrdersData({
        data: res.data,
        role: user.role,
        onAction,
      });
      setData(list);
    } else if (query.length === 0) {
      loadInitialOrders(1, sort);
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  const onSortClickHandler = (val) => {
    const  newSort = {
        sortBy: val,
        sortType: sort.sortType === "1" ? "-1" : "1",
    }
    setSort(newSort)
    setPage(1)
  };

  console.log(sort)

  const TABLE_HEADER = ROLE_TABLE_HEADER[user.role];

  return (
    <>
      <div>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>
        <div className={styles.wrapper}>
          {/* search */}
          <div className={styles.searchContainer}>
            <input
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search for an Order..."
              className={styles.searchInput}
            />
            <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
          </div>
          {/* pagination */}
          <div className={styles.paginationContainer}>
            {["procurement", "sales"].includes(user.role) && (
              <Link to={addLink[user.role]}>
                <div>
                  <Button title={addTitle[user.role]} />
                </div>
              </Link>
            )}
            <div className={styles.paginationInner}>
              {/* count */}
              <span>{`${page === 1 ? "1" : (page - 1) * 10}-${
                page * 10 > ordersCount ? ordersCount : page * 10
              } of ${ordersCount}`}</span>
              {/* controls */}
              <button
                onClick={() => setPage((e) => e - 1)}
                disabled={page === 1}
                className={styles.paginationControls}
              >
                <FaChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((e) => e + 1)}
                disabled={
                  (page * 10 > ordersCount ? ordersCount : page * 10) >=
                  ordersCount
                }
                className={styles.paginationControls}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          isSuccess && <Table data={[TABLE_HEADER, ...data]} onSortBy={onSortClickHandler} />
        )}

        {isError && (
          <p className={styles.errorMessage}>Unable to load Users Data</p>
        )}
      </div>

      {/* reject order modal */}
      <Modal isOpen={rejectOrder.isActive} contentLabel="Reject Order">
        <Alert
          message={`Are you sure to cancel this order?`}
          subMessage={""}
          cancelBtnLabel={"Close"}
          confirmBtnLabel={"Cancel Order"}
          successLoading={isRejectLoading}
          handleCancel={() => {
            setRejectOrder({ isActive: false, id: null });
          }}
          handleConfirm={async () => {
            if (!rejectOrder.reason)
              return toast.error("Reason for rejecting required!");
            const data = {
              description: rejectOrder.reason,
              id: rejectOrder.id,
            };
            // return console.log(data);
            const res = await RejectOrder(data);
            toast.success("Order Updated!");
            setRejectOrder({ isActive: false, id: null, reason: "" });
            loadInitialOrders(1, sort);
          }}
        >
          <Textarea
            value={rejectOrder.reason}
            onChange={(e) =>
              setRejectOrder((prev) => ({ ...prev, reason: e.target.value }))
            }
            minRows={3}
            size="md"
            label="Reason For Rejecting this order."
            style={{
              margin: "30px 0 0 0",
              textAlign: "start",
            }}
          />
        </Alert>
      </Modal>

      {/* verify order modal */}
      <Modal isOpen={verifyOrder.isActive} contentLabel="Verify Order">
        <AlertMessage
          message={`Verify the order of ${
            verifyOrder?.data?.names?.en?.name || "Plants"
          }.`}
          confirmBtnType="primary"
          subMessage={""}
          cancelBtnLabel={"Close"}
          confirmBtnLabel={"Verify Order"}
          successLoading={isVerifyLoading}
          handleCancel={() => {
            setVerifyOrder({
              data: null,
              isActive: false,
              id: null,
              quantity: 0,
            });
            setPlantImage(null);
          }}
          handleConfirm={async () => {
            if (!plantImage) return toast.error("Select Plant Image");
            if (verifyOrder.quantity <= 0)
              return toast.error("Quantity cannot be less than one.");

            const data = new FormData();
            data.append("images", plantImage);
            data.append(
              "body",
              JSON.stringify({
                id: verifyOrder.data._id,
                quantity: verifyOrder.quantity,
              })
            );

            const res = await VerifyOrder(data);
            toast.success("Order Verify Success!");
            setVerifyOrder({
              data: null,
              isActive: false,
              id: null,
              quantity: 0,
            });
            setPlantImage(null);

            loadInitialOrders(1, sort);
          }}
        >
          <div
            style={{
              margin: "20px 0",
              textAlign: "start",
            }}
          >
            {plantImage ? (
              <div>
                <p style={{ fontSize: "18px" }}>Image Selected</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "2px dashed black",
                    borderRadius: "7px",
                    padding: "10px",
                    margin: 0,
                  }}
                >
                  <span>{plantImage.name}</span>

                  <AiOutlineClose onClick={() => setPlantImage(null)} />
                </div>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "18px",
                    lineHeight: "35px",
                    margin: 0,
                  }}
                >
                  Image{" "}
                  <span
                    style={{
                      color: "red",
                    }}
                  >
                    *
                  </span>
                </p>
                <Dropzone
                  onDrop={(files) => {
                    console.log(files);
                    setPlantImage(files[0]);
                  }}
                  onReject={(files) =>
                    toast.error(files[0].errors[0].code.replaceAll("-", " "))
                  }
                  maxSize={3 * 1024 ** 2}
                  maxFiles="1"
                  multiple={false}
                  accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
                  maxFileSize="5"
                />
              </>
            )}
          </div>

          <div className={styles.inputdiv}>
            <Input
              value={verifyOrder.quantity}
              id="totalQuantity"
              type="number"
              onChange={(e) => {
                setVerifyOrder((prev) => ({
                  ...prev,
                  quantity: e.target.value,
                }));
              }}
              title="Total Quantity"
              required
            />
          </div>
        </AlertMessage>
      </Modal>

      {/* Add Invoice modal */}
      <Modal isOpen={addInvoice.isActive} contentLabel="Add invoice">
        <AlertMessage
          message={`Add invoice for the order`}
          confirmBtnType="primary"
          subMessage={""}
          cancelBtnLabel={"Close"}
          confirmBtnLabel={"Add Invoice"}
          successLoading={isAddInvoiceLoading}
          handleCancel={() => {
            setAddInvoice({ isActive: false, id: null });
            setOrderInvoiceFile(null);
          }}
          handleConfirm={async () => {
            if (!orderInvoiceFile)
              return toast.error("Please Select Invoice File");

            const data = new FormData();
            data.append("invoice", orderInvoiceFile);

            const res = await AddOrderInvoice({
              id: addInvoice.id,
              body: data,
            });
            toast.success("Invoice Updated!");
            setAddInvoice({ isActive: false, id: null });
            setOrderInvoiceFile(null);
            loadInitialOrders(1, sort);
          }}
        >
          <div
            style={{
              margin: "20px 0",
              textAlign: "start",
            }}
          >
            {orderInvoiceFile ? (
              <div>
                <p style={{ fontSize: "18px" }}>Invoice Selected</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "2px dashed black",
                    borderRadius: "7px",
                    padding: "10px",
                    margin: 0,
                  }}
                >
                  <span>{orderInvoiceFile.name}</span>

                  <AiOutlineClose onClick={() => setOrderInvoiceFile(null)} />
                </div>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "18px",
                    lineHeight: "35px",
                    margin: 0,
                  }}
                >
                  Invoice{" "}
                  <span
                    style={{
                      color: "red",
                    }}
                  >
                    *
                  </span>
                </p>
                <Dropzone
                  onDrop={(files) => {
                    console.log(files);
                    setOrderInvoiceFile(files[0]);
                  }}
                  onReject={(files) =>
                    toast.error(files[0].errors[0].code.replaceAll("-", " "))
                  }
                  maxSize={3 * 1024 ** 2}
                  maxFiles="1"
                  multiple={false}
                  accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
                  maxFileSize="5"
                />
              </>
            )}
          </div>
        </AlertMessage>
      </Modal>
    </>
  );
};

export default OrderMgmt;

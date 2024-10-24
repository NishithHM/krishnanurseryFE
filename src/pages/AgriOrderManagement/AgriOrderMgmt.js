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
  AddInvoiceModal,
  Filters,
} from "../../components";

import { ImSearch } from "react-icons/im";
import { AuthContext } from "../../context";
import {
  addLink,
  addTitle,
  formatFilter,
  formatOrdersData,
  ROLE_TABLE_HEADER,
} from "./helper";
import { get, cloneDeep } from "lodash";
import { Textarea } from "@mantine/core";
import { toast } from "react-toastify";
import { MIME_TYPES } from "@mantine/dropzone";
import { AiOutlineClose } from "react-icons/ai";
import DropZone from "../../components/Dropzone/Dropzone";
import {
  useGetOrdersMutation,
  useAddOrderInvoiceMutation,
  useGetInvoiceMutation,
  useVerifyOrderMutation,
  useRejectOrderMutation,
} from "../../services/agrivariants.services";
import { useDownloadOrderExcelMutation } from "../../services/common.services";
// import { useRejectOrderMutation, useVerifyOrderMutation } from "../../services/procurement.services";

const AgriOrderMgmt = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [excelPage, setExcelPage] = useState(1);
  const [isNextExcelAvailable, setNextExcelAvailable] = useState(true)
  const [data, setData] = useState([]);
  const [user] = useContext(AuthContext);
  const [sort, setSort] = useState({ sortBy: "createdAt", sortType: "-1" });
  const [searchInput, setSearchInput] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState([]);

  const [addInvoice, setAddInvoice] = useState({
    isActive: false,
    id: null,
    data: null,
  });
  const [rejectOrder, setRejectOrder] = useState({
    isActive: false,
    id: null,
    reason: "",
  });
  const [filters, setFilters] = useState({
    status: [],
    vendors: [],
    startData: "",
    endData: "",
  });

  const [plantImages, setPlantImages] = useState([]);

  const [verifyOrder, setVerifyOrder] = useState({
    isActive: false,
    id: null,
    data: null,
    quantity: 0,
  });

  const [getOrders, { isLoading, isError, isSuccess }] = useGetOrdersMutation();
  const [AddOrderInvoice, { isLoading: isAddInvoiceLoading }] =
    useAddOrderInvoiceMutation();
  const [getInvoice] = useGetInvoiceMutation();
  const [downloadOrderExcel] = useDownloadOrderExcelMutation()
  const [RejectOrder, { isLoading: isRejectLoading }] =
    useRejectOrderMutation();
  const [VerifyOrder, { isLoading: isVerifyLoading }] =
    useVerifyOrderMutation();

  const onAction = ({ id, action, data, isChecked }) => {
    const functionObj = {
      placeOrder: () => {
        if (isChecked) {
          setSelectedOrder((prev) => {
            const updatedData = [...prev];
            updatedData.push(data);
            console.log(updatedData);
            return updatedData;
          });
        } else {
          setSelectedOrder((prev) => {
            const updatedData = prev.filter((ele) => ele._id !== id);
            console.log(updatedData);
            return updatedData;
          });
        }
      },
      addInvoice: () => {
        setAddInvoice({ isActive: true, id, data });
      },
      verify: () => {
        setVerifyOrder({ isActive: true, id, data, quantity: 0 });
      },
      reject: () => {
        setRejectOrder({ isActive: true, id: id, reason: "" });
      },
    };
    functionObj[action]();
  };
  const loadInitialOrders = async (page, sortData) => {
    const countBody = {
      isCount: true,
      sortBy: sortData.sortBy,
      sortType: sortData.sortType,
      ...formatFilter(filters),
    };
    const listBody = {
      pageNumber: page,
      sortBy: sortData.sortBy,
      sortType: sortData.sortType,
      ...formatFilter(filters),
    };
    if (page === 1) {
      const counts = await getOrders({ body: { ...countBody } });
      setOrdersCount(get(counts, "data[0].count", 0));
    }
    const list = await getOrders({ body: { ...listBody } });
    const formattedData = formatOrdersData({
      data: list.data,
      role: user.role,
      onAction,
    });
    setData(formattedData);
  };

  useEffect(() => {
    loadInitialOrders(page, sort);
  }, [page, sort]);

  const searchHandler = debounce(async (query) => {
    setSearch(query);
    if (query.length >= 2) {
      const res = await getOrders({ body: { search: query } });
      const counts = await getOrders({});
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
    const newSort = {
      sortBy: val,
      sortType: sort.sortType === "1" ? "-1" : "1",
    };
    setSort(newSort);
    setPage(1);
  };

  const handleFilterChange = async (filters) => {
    const formattedFilter = formatFilter(filters);
    setPage(() => 1)

    setFilters(filters);
    setNextExcelAvailable(true)

    const res = await getOrders({
      body: {
        search: search,
        ...formattedFilter,
        sortBy: sort.sortBy,
        sortType: sort.sortType,
      },
    });
    const counts = await getOrders({
      body: { search: search, isCount: true, ...formattedFilter },
    });
    setOrdersCount(get(counts, "data[0].count", 0));
    const list = formatOrdersData({
      data: res.data,
      role: user.role,
      onAction,
    });
    setData(list);
  };

  const handleExcelDownload = async (filterDates)=>{
    const res= await downloadOrderExcel({pageNumber:excelPage, startDate: dayjs(filterDates.startDate).format('YYYY-MM-DD'), endDate:dayjs(filterDates.endDate).format('YYYY-MM-DD')})
    const {isNext, response} = res.data
    setNextExcelAvailable(isNext==='true')
    if(isNext==="true"){
      setExcelPage((prev)=> prev+1)
    }
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(response)
    link.download = 'Orders.xlsx'
    link.click()
  }

  const TABLE_HEADER = ROLE_TABLE_HEADER[user.role];

  const onPlaceOrder = () => {
    navigate(addLink[user.role], {
      state: { placeOrder: user.role === "procurement", data: selectedOrder },
    });
  };

  const handlePlantimageSelect = (file) => {
    setPlantImages((prev) => {
      let updated = [...prev, ...file];

      const uniqueArr = Array.from(new Set(updated.map((a) => a.path))).map(
        (path) => {
          return updated.find((a) => a.path === path);
        }
      );
      return uniqueArr;
    });
  };

  const handlePlantImageRemove = (index) => {
    setPlantImages((prev) => {
      let updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  return (
    <>
      <div>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} tabType="AGRI" />
        </div>
        <Filters
          config={{ isVendor: true, orderStatus: true, vendorType: "AGRI", excelDownload: user.role==='admin', isNextExcelAvailable, excelPage }}
          onSubmit={handleFilterChange}
          onExcelDownload={handleExcelDownload} resetExcelPage={()=> setExcelPage(1)} setNextExcelAvailable={setNextExcelAvailable}
        />
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
              <div>
                <Button title={addTitle[user.role]} onClick={onPlaceOrder} />
              </div>
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
          isSuccess && (
            <Table
              data={[TABLE_HEADER, ...data]}
              onSortBy={onSortClickHandler}
            />
          )
        )}

        {isError && (
          <p className={styles.errorMessage}>Unable to load Users Data</p>
        )}
      </div>

      {/* reject order modal */}
      <Modal isOpen={rejectOrder.isActive} contentLabel="Reject Order">
        <Alert
          message={`Are you sure to reject this order?`}
          subMessage={""}
          cancelBtnLabel={"Close"}
          confirmBtnLabel={"Reject Order"}
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
            const res = await RejectOrder({ body: data, id: rejectOrder.id });
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
            verifyOrder?.data?.names?.en?.name || "Agri's"
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
            setPlantImages([]);
          }}
          handleConfirm={async () => {
            if (verifyOrder.quantity < 0)
              return toast.error("Quantity cannot be less than one.");

            const data = new FormData();
            plantImages.forEach((img) => {
              data.append("images", img);
            });

            data.append(
              "body",
              JSON.stringify({ quantity: verifyOrder.quantity })
            );

            const res = await VerifyOrder({
              id: verifyOrder.data._id,
              body: data,
            });
            toast.success("Order Verify Success!");
            setVerifyOrder({
              data: null,
              isActive: false,
              id: null,
              quantity: 0,
            });
            setPlantImages([]);

            loadInitialOrders(1, sort);
          }}
        >
          <div
            style={{
              margin: "20px 0",
              textAlign: "start",
            }}
          >
            {plantImages.map((image, index) => {
              return (
                <div key={index}>
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
                    <span>{image.name}</span>

                    <AiOutlineClose
                      onClick={() => handlePlantImageRemove(index)}
                    />
                  </div>
                </div>
              );
            })}
            {plantImages.length < 3 && (
              <DropZone
                onDrop={(files) => {
                  handlePlantimageSelect(files);
                }}
                onReject={(files) => {
                  toast.error(files[0].errors[0].code.replaceAll("-", " "));
                }}
                maxSize={3 * 1024 ** 2}
                maxFiles="3"
                multiple={true}
                accept={[MIME_TYPES.png, MIME_TYPES.jpeg]}
                maxFileSize="5"
              />
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
              title="Total Quantity Arrived"
              required
            />
          </div>
        </AlertMessage>
      </Modal>

      {/* Add Invoice modal */}
      {addInvoice.isActive && (
        <AddInvoiceModal
          addInvoice={addInvoice}
          setAddInvoice={setAddInvoice}
          AddOrderInvoice={AddOrderInvoice}
          isAddInvoiceLoading={isAddInvoiceLoading}
          loadInitialOrders={loadInitialOrders}
          sort={sort}
          toast={toast}
          orderId={addInvoice?.data?.orderId}
          getInvoice={getInvoice}
          type="AGRI"
          isInvoice
        />
      )}
    </>
  );
};

export default AgriOrderMgmt;

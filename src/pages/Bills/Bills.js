import dayjs, { Dayjs } from "dayjs";
import debounce from "lodash/debounce";
import styles from "./Bills.module.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Modal,
  Table,
  Alert,
  Spinner,
  BackButton,
  Filters,
  Toaster,
} from "../../components";

import { ImSearch } from "react-icons/im";
import {
  useGetAllPurchasesCountQuery,
  useGetAllPurchasesQuery,
  useSearchPurchaseMutation,
  useGetApproveMutation,
} from "../../services/bills.service";
import {
  InvoicePreview,
  InvoiceSection,
} from "../../components/InvoicePreviewModal/InvoicePreview";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { AuthContext } from "../../context";
import { useDownloadBillingExcelMutation } from "../../services/common.services";

const getRoundedDates = () => {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = today.getMonth() + 1;
  let dd = today.getDate();

  if (mm < 10) {
    mm = `0${mm}`;
  }

  if (dd < 10) {
    dd = `0${dd}`;
  }
  let formattedDate = `${yyyy}-${mm}-${dd}`;

  let roundedDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let roundedYYYY = roundedDate.getFullYear();
  let roundedMM = roundedDate.getMonth() + 1;
  let roundedDD = roundedDate.getDate();
  if (roundedMM < 10) {
    roundedMM = `0${roundedMM}`;
  }

  if (roundedDD < 10) {
    roundedDD = `0${roundedDD}`;
  }

  let formattedRoundedDate = `${roundedYYYY}-${roundedMM}-${roundedDD}`;
  return { start_date: formattedRoundedDate, end_date: formattedDate };
};

const Bills = ({ type }) => {
  const [page, setPage] = useState(1);
  const [excelPage, setExcelPage] = useState(1);
  const [isNextExcelAvailable, setNextExcelAvailable] = useState(true);
  const [data, setData] = useState([]);
  const location = useLocation();
  const [user] = useContext(AuthContext);
  const [filterDates, setFilterDates] = useState({
    start_date: null,
    end_date: null,
  });

  const [searchInput, setSearchInput] = useState("");
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [sort, setSort] = useState({ sortBy: "billedDate", sortType: "desc" });
  const printRef = useRef();
  // billing modal
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  useEffect(() => {}, [filterDates]);

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const value = searchParams.get("search");
    setSearchInput(value);
    searchHandler(value);
  }, []);

  const dates = {};

  if (filterDates.start_date && filterDates.end_date) {
    dates.startDate = dayjs(filterDates.start_date).format("YYYY-MM-DD");
    dates.endDate = dayjs(filterDates.end_date).format("YYYY-MM-DD");
  }
  
  // requests
  const purchaseData = useGetAllPurchasesQuery({
    pageNumber: page,
    sortBy: sort.sortBy,
    sortType: sort.sortType === "asc" ? 1 : -1,
    type: location.pathname.substring(22) === "bills" ? "NURSERY" : "AGRI",
    ...dates,
  });

  const purchaseCountReq = useGetAllPurchasesCountQuery({
    search: searchQuery,
    type: location.pathname.substring(22) === "bills" ? "NURSERY" : "AGRI",
    ...dates,
  });

  const [searchPurchase] = useSearchPurchaseMutation();
  const [approveButton] = useGetApproveMutation();

  const [downloadBillingExcel] = useDownloadBillingExcelMutation();
  // const approve = useGetApproveQuery
  // ({
  //   customerId:purchaseData?._id
  // });

  const formatPurchasesData = (data) => {
    const formatted = data.map((purchase) => {
      const date = {
        value: dayjs(purchase.billedDate || purchase.updatedAt).format(
          "DD-MM-YYYY"
        ),
      };

      const openModal = {
        value: (
          <span
            style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
            onClick={() => {
              setShowPreview(true);
              setInvoiceDetail(purchase);
            }}
          >
            View Details
          </span>
        ),
      };

      const approve = {
        value:
          purchase.isApproved === false &&
          purchase.status === "CART" &&
          user.role === "admin" ? (
            <span
              style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
              onClick={async () => {
                const res = await approveButton({
                  billId: purchase?._id,
                });
                toast.success("Bill Successfully Approved");
              }}
            >
              Approve
            </span>
          ) : (
            <></>
          ),
      };

      let paymentThrough = `Cash: ${purchase?.cashAmount ?? 0}, Online: ${
        purchase?.onlineAmount ?? 0
      }`;

      const data = [
        date,
        { value: purchase.invoiceId },
        { value: paymentThrough },
        { value: purchase.customerName },
        {
          value: new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "INR",
          }).format(purchase.totalPrice),
        },
        openModal,
        approve,
      ];
      return data;
    });

    return formatted;
  };

  const searchHandler = debounce(async (query) => {
    if (query?.length >= 3) {
      const res = await searchPurchase({
        search: query,
        type,
        ...dates,
      });
      setSearchQuery(query);
      const purchases = formatPurchasesData(res.data);
      setData(purchases);
    } else {
      setSearchQuery(null);
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  useEffect(() => {
    if (purchaseCountReq.status !== "fulfilled") return;
    setPurchaseCount(purchaseCountReq.data[0]?.count);
  }, [purchaseCountReq]);

  useEffect(() => {
    if (purchaseData.status !== "fulfilled") return;
    const purchases = formatPurchasesData(purchaseData.data);
    setData(purchases);
  }, [purchaseData, searchInput]);

  const TABLE_HEADER = [
    {
      value: "Date",
      isSortable: true,
      sortBy: "billedDate",
    },

    {
      value: " Bill Number",
      isSortable: false,
    },
    {
      value: "Payment Through",
      isSortable: false,
    },
    {
      value: "Customer Name",
      isSortable: false,
    },
    {
      value: "Total Bill",
      isSortable: true,
      sortBy: "totalPrice",
    },
    {
      value: "",
      isSortable: false,
    },
  ];

  const handleFilterChange = (filterDates) => {
    setFilterDates(filterDates);
    setNextExcelAvailable(true);
  };

  const handleFilterReset = () => {
    setFilterDates(getRoundedDates());
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const sortData = (sortVal) => {
    setSort((prev) => ({
      sortBy: sortVal,
      sortType: prev.sortType === "asc" ? "desc" : "asc",
    }));
  };
  const formatInvoiceItems = (data) => {
    console.log(data);
    return data.map((item) => ({
      procurementLabel:
        type === "NURSERY"
          ? `${item.procurementName.en.name}(${item?.procurementName?.ka?.name}) ${item?.variant?.en?.name} (${item?.variant?.ka?.name})`
          : `${item.procurementName.en.name}`,
      price: item.rate,
      quantity: item.quantity,
      mrp: item.mrp,
      rateWithGst: item.rateWithGst,
      gstAmount: item.gstAmount,
      gst: item.gst,
      hsnCode: item.hsnCode,
    }));
    // return data;
  };

  const handleExcelDownload = async (filterDates) => {
    const res = await downloadBillingExcel({
      pageNumber: excelPage,
      startDate: dayjs(filterDates.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(filterDates.endDate).format("YYYY-MM-DD"),
    });
    const { isNext, response } = res.data;
    setNextExcelAvailable(isNext === "true");
    if (isNext === "true") {
      setExcelPage((prev) => prev + 1);
    }
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(response);
    link.download = "billing.xlsx";
    link.click();
  };

  return (
    <div>
      <div>
        <BackButton
          navigateTo={"/authorised/dashboard"}
          tabType={type === "AGRI" ? "AGRI" : undefined}
        />
        <Toaster />
      </div>
      <Filters
        config={{
          excelDownload: user.role === "admin" || "sales",
          isNextExcelAvailable,
          excelPage,
        }}
        resetExcelPage={() => setExcelPage(1)}
        setNextExcelAvailable={setNextExcelAvailable}
        onSubmit={handleFilterChange}
        onReset={handleFilterReset}
        onExcelDownload={handleExcelDownload}
      />
      <div className={styles.wrapper}>
        {/* search */}
        <div className={styles.searchContainer}>
          <input
            value={searchInput}
            onChange={handleSearchInputChange}
            placeholder="Search for an customer..."
            className={styles.searchInput}
          />
          <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
        </div>
        {/* pagination */}
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInner}>
            {/* count */}
            <span>{`${page === 1 ? "1" : (page - 1) * 10}-${
              page * 10 > purchaseCount ? purchaseCount : page * 10
            } of ${purchaseCount}`}</span>
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
                (page * 10 > purchaseCount ? purchaseCount : page * 10) >=
                purchaseCount
              }
              className={styles.paginationControls}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {purchaseData.isLoading ? (
        <Spinner />
      ) : (
        purchaseData.status === "fulfilled" && (
          <Table data={[TABLE_HEADER, ...data]} onSortBy={sortData} />
        )
      )}

      {purchaseData.isError && (
        <p className={styles.errorMessage}>Unable to load Users Data</p>
      )}

      {showPreview && invoiceDetail && (
        <div style={{ display: "none" }}>
          <div ref={printRef}>
            <InvoiceSection
              clientDetails={{
                name: invoiceDetail?.customerName,
                phoneNumber: invoiceDetail?.customerNumber,
              }}
              cartData={formatInvoiceItems(invoiceDetail?.items)}
              cartResponse={{
                discount: invoiceDetail?.discount,
                roundOff: invoiceDetail?.roundOff,
                totalPrice: invoiceDetail?.totalPrice,
                gstAmount: invoiceDetail?.gstAmount,
              }}
              infoSheetPrice={invoiceDetail?.infoSheetPrice}
              invoiceNumber={invoiceDetail.invoiceId}
              printEnabled={true}
              roundOff={invoiceDetail?.roundOff}
              invoiceDetails={{
                invoiceDate: invoiceDetail?.billedDate,
                billedBy: invoiceDetail?.billedBy?.name,
                soldBy: invoiceDetail?.soldBy?.name,
                cashAmount: invoiceDetail?.cashAmount,
                onlineAmount: invoiceDetail?.onlineAmount,
              }}
              type={type}
            />
          </div>
        </div>
      )}
      {showPreview && invoiceDetail && (
        <InvoicePreview
          infoSheetPrice={invoiceDetail?.infoSheetPrice}
          showPreview={showPreview}
          onClose={() => setShowPreview(!showPreview)}
          clientDetails={{
            name: invoiceDetail.customerName,
            phoneNumber: invoiceDetail.customerNumber,
          }}
          invoiceDetails={{
            invoiceDate: invoiceDetail?.billedDate,
            billedBy: invoiceDetail?.billedBy?.name,
            soldBy: invoiceDetail?.soldBy?.name,
            paymentType: invoiceDetail?.paymentType,
            paymentInfo: invoiceDetail?.paymentInfo,
            cashAmount: invoiceDetail?.cashAmount,
            onlineAmount: invoiceDetail?.onlineAmount,
          }}
          cartData={formatInvoiceItems(invoiceDetail.items)}
          cartResponse={{
            discount: invoiceDetail.discount,
            roundOff: invoiceDetail.roundOff,
            totalPrice: invoiceDetail.totalPrice,
            gstAmount: invoiceDetail?.gstAmount,
            customerAddress: invoiceDetail?.customerAddress,
            customerGst: invoiceDetail?.customerGst,
          }}
          invoiceNumber={invoiceDetail.invoiceId}
          setInvoiceNumber={() => {}}
          handlePrintClick={handlePrint}
          type={type}
        />
      )}
    </div>
  );
};

export default Bills;

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
  useReturnEditorMutation,
  useLazyGetReturnQuery
} from "../../services/bills.service";
import {
  InvoicePreview,
  InvoiceSection,
} from "../../components/InvoicePreviewModal/InvoicePreview";
import ReturnModal from "../../components/returnModal/returnModal"; // Import the ReturnModal component
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
import { AuthContext } from "../../context";
import { useDownloadBillingExcelMutation } from "../../services/common.services";
import { use } from "react";
import { AiOutlineConsoleSql } from "react-icons/ai";

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

const Bills = ({type}) => {
  const [page, setPage] = useState(1);
  const [excelPage, setExcelPage] = useState(1);
  const [isNextExcelAvailable, setNextExcelAvailable] = useState(true)
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
  const [showReturnModal, setShowReturnModal] = useState(false); // State for return modal
  const [invoiceDetail, setInvoiceDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState(null);
  const [getReturnData] = useLazyGetReturnQuery();
  const [returnData, setReturnData] = useState([]);
  
  useEffect(() => {
  }, [filterDates]);

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
  const [returnEditor] = useReturnEditorMutation();

  const [downloadBillingExcel] = useDownloadBillingExcelMutation();

  // Handle make return function - updated to prevent event bubbling
  const handleMakeReturn = (purchase, event) => {
    if (event) {
      event.stopPropagation(); // Prevent event bubbling
    }
    setInvoiceDetail(purchase);
    
    getReturnData({ invoiceId: purchase._id }).then((resp) => {
      setReturnData(resp.data.data || []);
    });
    setShowReturnModal(true);
  };

  const handleSubmitReturn = async (returnData) => {
    try {
      const response = await returnEditor(returnData);
      
      if (response.data) {
        toast.success("Return processed successfully");
        setShowReturnModal(false);
        purchaseData.refetch();
      } else {
        toast.error("Error processing return");
      }
    } catch (error) {
      toast.error("Error: " + (error.message || "Unknown error"));
    }
  };

  const formatPurchasesData = (data) => {
    const formatted = data.map((purchase) => {
      const date = { value: dayjs(purchase.billedDate || purchase.updatedAt).format("DD-MM-YYYY") };

      const openModal = {
        value: (
          <span
            style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
            onClick={(e) => {
              setShowPreview(true);
              setInvoiceDetail(purchase);
            }}
          >
            View Details
          </span>
        ),
      };

      const makeReturn = {
        value: (
          <span
            style={{ color: "blue", fontWeight: "600", cursor: "pointer" }}
            onClick={(e) => {
              handleMakeReturn(purchase, e);
            }}
          >
            Return
          </span>
        ),
      };

      let paymentThrough = `Cash: ${purchase?.cashAmount ?? 0}, Online: ${
        purchase?.onlineAmount ?? 0
      }`;

      const data = [
        date,
        { value: purchase?.invoiceId || "--" },
        { value: paymentThrough },
        { value: purchase?.comment || "--" },
        { value: purchase.customerName },
        {
          value: new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "INR",
          }).format(purchase.totalPrice),
        },
        openModal,
        // makeReturn
      ];
      if (type !== 'AGRI'){
        data.push(makeReturn);
      }

      return data;
    });

    return formatted;
  };

  const extractDigit = (str) => {
    let digstr = '';
    for (let chr of str){
      if ('0123456789'.indexOf(chr) >= 0)
        digstr += chr;
    }
    return digstr? parseInt(digstr) : 0;
  }

  const searchHandler = debounce(async (query) => {
    // const origQuery = query;
    // let retbool = false;

    if (query?.length >= 3) {
      // if (query.toLowerCase().substring(0,3) === 'ret'){
      //   query = 'nur';
      //   retbool = true;
      // }
      const res = await searchPurchase({
        search: query,
        type,
        ...dates,
      });

      setSearchQuery(query);
      let allData = res.data;

      // if(retbool){
      //   const key = extractDigit(origQuery);
      //   allData = allData.filter((obj) => {
          
      //     if(obj.returnItems?.length > 0)
      //     {
      //       for (const item of obj.returnItems){
      //       if (item.returnId && item.returnId === key){
      //         return obj;
      //       }
      //     }
      //     }
      //     return null;
      //   })
      // }

      const purchases = formatPurchasesData(allData);
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

  // Updated TABLE_HEADER to match the data array length
  const TABLE_HEADER = [
    {
      value: "Date",
      isSortable: true,
      sortBy: "billedDate",
    },
    {
      value: "Bill Number",
      isSortable: false,
    },
    {
      value: "Payment Through",
      isSortable: false,
    },
    {
      value: "Comment",
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
      value: "Details", // Changed from empty string for clarity
      isSortable: false,
    }
  ];

  if (type !== 'AGRI'){
    TABLE_HEADER.push(
      {
        value: "Return", // Changed from empty string for clarity
        isSortable: false,
      } 
    )
  }

  const handleFilterChange = (filterDates) => {
    setFilterDates(filterDates);
    setNextExcelAvailable(true)
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
    return data.map((item) => ({
      procurementId: item.procurementId || item._id, // Ensure procurement ID is included
      procurementLabel: type === 'NURSERY' ? `${item.procurementName.en.name}(${item?.procurementName?.ka?.name}) ${item?.variant?.en?.name} (${item?.variant?.ka?.name})` : `${item.procurementName.en.name}`,
      price: item.rate,
      quantity: item.quantity,
      mrp: item.mrp,
      rateWithGst: item.rateWithGst,
      gstAmount: item.gstAmount,
      gst: item.gst,
      hsnCode: item.hsnCode
    }));
  };

  const formatReturnInvoiceItems = (data) => {
    return data.map((item) => ({
      procurementId: item.procurementId || item._id, // Ensure procurement ID is included
      procurementLabel: type === 'NURSERY' ? `${item.procurementName.en.name}(${item?.procurementName?.ka?.name}) ${item?.variant?.en?.name} (${item?.variant?.ka?.name})` : `${item.procurementName.en.name}`,
      price: item.rate,
      quantity: item.quantity,
      mrp: item.mrp,
      rateWithGst: item.rateWithGst,
      gstAmount: item.gstAmount,
      gst: item.gst,
      hsnCode: item.hsnCode,
      _id: item._id
    }));
  };

  const handleExcelDownload = async (filterDates)=>{
    const res= await downloadBillingExcel({pageNumber:excelPage, startDate: dayjs(filterDates.startDate).format('YYYY-MM-DD'), endDate:dayjs(filterDates.endDate).format('YYYY-MM-DD'), type})
    const {isNext, response} = res.data
    setNextExcelAvailable(isNext==='true')
    if(isNext==="true"){
      setExcelPage((prev)=> prev+1)
    }
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(response)
    link.download = 'billing.xlsx'
    link.click()
  }

  // Add console logs for debugging
  useEffect(() => {
    console.log("Return Modal State:", showReturnModal);
    console.log("Invoice Detail State:", invoiceDetail);
  }, [showReturnModal, invoiceDetail]);

  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} tabType={type === "AGRI" ? "AGRI" : undefined} />
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
        <div
            className={styles.searchContainer}
            // onMouseEnter={() => toast.info("Start search with 'ret' to search for returns")}
          >
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

      {/* Invoice Preview Modal */}
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
                gstAmount: invoiceDetail?.gstAmount
              }}
              invoiceNumber={invoiceDetail.invoiceId}
              printEnabled={true}
              roundOff={invoiceDetail?.roundOff}
              invoiceDetails={{
                invoiceDate: invoiceDetail?.billedDate,
                billedBy: invoiceDetail?.billedBy?.name,
                soldBy: invoiceDetail?.soldBy?.name,
                cashAmount: invoiceDetail?.cashAmount,
                onlineAmount: invoiceDetail?.onlineAmount,
                paymentType: invoiceDetail?.paymentType,
                paymentInfo: invoiceDetail?.paymentInfo,
              }}
              type={type}
            />
          </div>
        </div>
      )}
      
      {showPreview && invoiceDetail && (
        <InvoicePreview
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
            onlineAmount: invoiceDetail?.onlineAmount
          }}
          cartData={formatInvoiceItems(invoiceDetail.items)}
          cartResponse={{
            discount: invoiceDetail.discount,
            roundOff: invoiceDetail.roundOff,
            totalPrice: invoiceDetail.totalPrice,
            gstAmount: invoiceDetail?.gstAmount,
            customerAddress: invoiceDetail?.customerAddress,
            customerGst: invoiceDetail?.customerGst
          }}
          invoiceNumber={invoiceDetail.invoiceId}
          setInvoiceNumber={() => {}}
          handlePrintClick={handlePrint}
          type={type}
        />
      )}
      
      {showReturnModal && invoiceDetail && (
        <ReturnModal
          showModal={showReturnModal}
          onClose={() => setShowReturnModal(false)}
          clientDetails={{
            name: invoiceDetail.customerName,
            phoneNumber: invoiceDetail.customerNumber,
          }}
          invoiceDetails={{
            invoiceDate: invoiceDetail?.billedDate,
            billedBy: invoiceDetail?.billedBy?.name,
            soldBy: invoiceDetail?.soldBy?.name,
          }}
          cartData={formatReturnInvoiceItems(invoiceDetail.items)}
          cartResponse={{
            discount: invoiceDetail.discount,
            roundOff: invoiceDetail.roundOff,
            totalPrice: invoiceDetail.totalPrice,
          }}
          invoiceId={invoiceDetail._id}
          invoiceNumber={invoiceDetail.invoiceId}
          handleSubmitReturn={handleSubmitReturn}
          type={type}
          previousReturns={returnData}
          returnId={invoiceDetail.returnId || null}
        />
      )}
    </div>
  );
};

export default Bills;
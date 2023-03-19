import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./Bills.module.css";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Modal,
  Table,
  Alert,
  Spinner,
  BackButton,
  Filters,
} from "../../components";

import { ImSearch } from "react-icons/im";
import {
  useGetAllPurchasesCountQuery,
  useGetAllPurchasesQuery,
  useSearchPurchaseMutation,
} from "../../services/bills.service";
import { InvoicePreview } from "../../components/InvoicePreviewModal/InvoicePreview";

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
  return { startDate: formattedRoundedDate, endDate: formattedDate };
};

const Bills = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);

  const [filterDates, setFilterDates] = useState(getRoundedDates());

  const [searchInput, setSearchInput] = useState("");
  const [purchaseCount, setPurchaseCount] = useState(0);

  const [sort, setSort] = useState({ sortBy: "updatedAt", sortType: "asc" });

  // billing modal
  const [showPreview, setShowPreview] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState(null);

  // requests
  const purchaseData = useGetAllPurchasesQuery({
    page,
    startDate: filterDates.startDate,
    endDate: filterDates.endDate,
    sortBy: sort.sortBy,
    sortType: sort.sortType === "asc" ? 1 : -1,
  });
  const purchaseCountReq = useGetAllPurchasesCountQuery({
    startDate: filterDates.startDate,
    endDate: filterDates.endDate,
  });
  const [searchPurchase] = useSearchPurchaseMutation();

  console.log(purchaseCountReq);
  const formatPurchasesData = (data) => {
    const formatted = data.map((purchase) => {
      const date = { value: dayjs(purchase.createdAt).format("DD-MM-YYYY") };

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
      const data = [
        date,
        { value: purchase._id },
        { value: purchase.customerName },
        {
          value: new Intl.NumberFormat("ja-JP", {
            style: "currency",
            currency: "INR",
          }).format(purchase.totalPrice),
        },
        openModal,
      ];
      return data;
    });

    return formatted;
  };

  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      const res = await searchPurchase({
        search: query,
        startDate: filterDates.startDate,
        endDate: filterDates.endDate,
      });
      console.log(res);
      const purchases = formatPurchasesData(res.data);
      setData(purchases);
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
      sortBy: "updatedAt",
    },

    {
      value: " Bill Number",
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
  };

  const handleFilterReset = () => {
    setFilterDates(getRoundedDates());
  };

  const sortData = (sortVal) => {
    console.log(sortVal);
    setSort((prev) => ({
      sortBy: sortVal,
      sortType: prev.sortType === "asc" ? "desc" : "asc",
    }));
  };
  const formatInvoiceItems = (data) => {
    return data.map((item) => ({
      procurementLabel: item.procurementName.en.name,
      price: item.rate,
      quantity: item.quantity,
    }));
    // return data;
  };

  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>
      <Filters onSubmit={handleFilterChange} onReset={handleFilterReset} />
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

      {/* <Modal isOpen={deleteUser} contentLabel="Delete User">
        <Alert
          handleCancel={closeDeleteModalHandler}
          handleConfirm={() => deleteUserHandler(deleteUserUid)}
        />
      </Modal> */}

      {showPreview && invoiceDetail && (
        <InvoicePreview
          showPreview={showPreview}
          onClose={() => setShowPreview(!showPreview)}
          clientDetails={{
            name: invoiceDetail.customerName,
            phoneNumber: invoiceDetail.customerNumber,
          }}
          invoiceDetails={{
            invoiceDate: invoiceDetail.createdAt,
            billedBy: invoiceDetail.soldBy.name,
          }}
          cartData={formatInvoiceItems(invoiceDetail.items)}
          cartResponse={{
            discount: invoiceDetail.discount,
            roundOff: invoiceDetail.roundOff,
            totalPrice: invoiceDetail.totalPrice,
          }}
          invoiceNumber={"123"}
          setInvoiceNumber={() => {}}
          handlePrintClick={null}
        />
      )}
    </div>
  );
};

export default Bills;

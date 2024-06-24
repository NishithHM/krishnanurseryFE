import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./Vendor.module.css";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Modal,
  Table,
  Alert,
  Spinner,
  BackButton,
} from "../../components";


import { ImSearch } from "react-icons/im";
import { useGetVendorQuery, useSearchVendorMutation } from "../../services/vendor.services";

const Vendor = () => {
  const [data, setData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);


  const [searchInput, setSearchInput] = useState("");
  const [viewPayment, setViewPayment] = useState(false);
  const tableRef = useRef(null);

  // requests
  const vendorData = useGetVendorQuery("NURSERY");
  const [searchVendor] = useSearchVendorMutation();

  const onViewPaymentClick = (data) => {
    setViewPayment(true)
    paymentFormattedData(data.paymentTypes)

  }



  const paymentFormattedData = (data) => {
    const formatted = data?.map((ele) => {
      const cashAmt = ele?.cashAmount
      const comments = ele?.comments
      const date = dayjs(ele.date).format("DD-MM-YYYY");
      const orderId = ele?.orderId;
      const onlineAmount = ele?.onlineAmount;
      const totalAmount = ele?.totalAmount;
      return [ { value: date }, { value: orderId },{value: comments }, { value: cashAmt }, {value: onlineAmount },  { value: totalAmount }]
    })
    setPaymentData(formatted)

    return formatted;
  };

  const vendorFormattedData = (data) => {
    const formatted = data.map((vendor) => {
      const name = { value: vendor?.name };
      const createdAt = { value: dayjs(vendor.createdAt).format("DD-MM-YYYY") };
      const phoneNumber = {
        value: vendor?.contact,
      };
      const deviation = { value: vendor?.deviation }
      const viewPayments = {
        value: (
          <span
            style={{ color: vendor?.paymentTypes?.length === 0 ? "gray" : "#038819", fontWeight: "600", cursor: vendor?.paymentTypes?.length === 0 ? "not-allowed" : "pointer" }}
            onClick={() => vendor?.paymentTypes?.length !== 0 && onViewPaymentClick(vendor)}
            aria-disabled={vendor?.paymentTypes?.length === 0}
          >
            View Payments
          </span>
        ),
      };

      const data = [name, createdAt, phoneNumber, deviation, viewPayments];
      return data;
    });

    return formatted;
  };


  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      const res = await searchVendor(query);
      const vendors = vendorFormattedData(res?.data);
      setData(vendors);
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  useEffect(() => {
    if (vendorData.status !== "fulfilled") return;
    const vendors = vendorFormattedData(vendorData.data);
    setData(vendors);
  }, [vendorData, searchInput]);

  useEffect(() => {
    if (viewPayment && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewPayment, paymentData]);

  const TABLE_HEADER = [
    {
      // id: new Date().toISOString(),
      value: "Name",
      isSortable: false,
    },

    {
      value: "Created Date",
      isSortable: false,
    },
    {
      value: "Contact",
      isSortable: false,
    },
    {
      value: "Deviation",
      isSortable: false,
    },
    {
      value: "",
      isSortable: false,
    },
  ];
  const PAYMENT_HEADER = [
    {
      value: "Date",
      isSortable: false,
    },
    {
      value: "Order Id",
      isSortable: false,
    },
    {
      value: "Comments",
      isSortable: false,
    },
    {
      // id: new Date().toISOString(),
      value: "Cash Amount",
      isSortable: false,
    },
    {
      value: "Online Amount",
      isSortable: false,
    },
    
    {
      value: "Total Amount",
      isSortable: false,
    },
    {
      value: "",
      isSortable: false,
    },
  ];

  return (
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
            placeholder="Search for a Vendor..."
            className={styles.searchInput}
          />
          <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
        </div>
      </div>
      <div style={{ display: "flex", width: "100%" }}>
        {vendorData.isLoading ? (
          <Spinner />
        ) : (
          vendorData.status === "fulfilled" && (
            <div style={{ flex: 1 }}>
              <Table data={[TABLE_HEADER, ...data]} />
            </div>
          )
        )}

        {vendorData.isError && (
          <p className={styles.errorMessage}>Unable to load vendor Data</p>
        )}
        {viewPayment &&
          <div ref={tableRef} style={{ flex: 1 }}>
            <Table data={[PAYMENT_HEADER, ...paymentData]} />
          </div>
        }
      </div>

    </div>
  );
};

export default Vendor;

import debounce from "lodash/debounce";
import dayjs from "dayjs";
import styles from "./Payments.module.css";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import {
  Button,
  Modal,
  Table,
  Alert,
  Spinner,
  BackButton,
  Input,
  Dropdown,
  Filters,
} from "../../components";

import { ImSearch } from "react-icons/im";
import get from "lodash/get";
import { Modal as MantineModal } from "@mantine/core";
import { AuthContext } from "../../context";
import {
  useGetAllPaymentsByPhoneNumberQuery,
  useGetAllPaymentsQuery,
  useGetInfoMutation,
} from "../../services/payments.services";
import { toast } from "react-toastify";
import { useCreatePaymentMutation } from "../../services/payments.services";
import { useGetAllPaymentsCountQuery } from "../../services/payments.services";
import { useSearchPaymentMutation } from "../../services/payments.services";
import { useDownloadPaymentsExcelMutation } from "../../services/common.services";

const Payments = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [newPaymenModal, setNewPaymentModal] = useState(false);
  const [isNextExcelAvailable, setNextExcelAvailable] = useState(true);
  const [excelPage, setExcelPage] = useState(1);

  const [newPayment, setNewPayment] = useState({
    type: null,
  });
  const [paymentMode, setPaymentMode] = useState({ type: null });
  const [filterDates, setFilterDates] = useState({});

  const [type, setType] = useState();

  const [searchInput, setSearchInput] = useState("");
  const [usersCount, setUsersCount] = useState(0);

  const dates = {};
  const paymentMadeBy = ["SALARY", "OTHERS", "CAPITAL", "VENDOR"];
  const businessType = "NURSERY";

  if (Object.keys(filterDates)?.length) {
    if (filterDates?.start_date && filterDates?.end_date) {
      dates.startDate = dayjs(filterDates?.start_date).format("YYYY-MM-DD");
      dates.endDate = dayjs(filterDates?.end_date).format("YYYY-MM-DD");
    }
    dates.type = filterDates?.type?.value;
    dates.vendorId = filterDates?.vendors[0]?.value;
  }

  // requests
  const paymentsData = useGetAllPaymentsQuery({ page, ...dates, businessType });
  const [downloadPaymentsExcel] = useDownloadPaymentsExcelMutation();
  const [paymentData] = useGetInfoMutation();

  // const dataFromPhoneNumber = useGetAllPaymentsByPhoneNumberQuery(
  //   newPayment?.phone
  // );

  const paymentsCountReq = useGetAllPaymentsCountQuery({
    search: searchInput,
    ...dates,
    businessType,
  });
  const [searchPayment] = useSearchPaymentMutation();
  const [mutate] = useCreatePaymentMutation();

  // console.log(dataFromPhoneNumber, "data phone");

  const handleViewBill = (id) => {};

  const handleFilterChange = async (filterDates) => {
    console.log(filterDates, "filterDates......");
    setFilterDates(filterDates);
    await paymentsCountReq.refetch();
    setNextExcelAvailable(true);
  };

  const formatPaymentsData = (data) => {
    const formatted = data.map((item) => {
      const name = { value: item.name };
      let paymentInfo = `Cash: ${item?.cashAmount ?? 0}, Online: ${
        item?.onlineAmount ?? 0
      }`;

      const type = {
        value: item.type,
      };

      let paymentThrough = {
        value: paymentInfo,
      };
      let comment = {
        value: item?.comment || "---",
      };
      const createdAt = { value: dayjs(item.createdAt).format("DD-MM-YYYY") };
      const amount = {
        value: item.amount,
      };
      const invoiceId = {
        value: item.invoiceId || "---",
      };
      const action = {
        value:
          item.invoiceId &&
          item.type === "BROKER" &&
          user_role !== "procurement" ? (
            <Link
              to={`/authorised/dashboard/bills?search=${item.invoiceId}`}
              style={{
                fontWeight: "bold",
                color: "#038819 ",
                cursor: "pointer",
              }}
            >
              View Bill
            </Link>
          ) : (
            <span>--</span>
          ),
      };

      const data = [
        name,
        createdAt,
        paymentThrough,
        comment,
        type,
        amount,
        invoiceId,
        action,
      ];
      return data;
    });

    return formatted;
  };

  const handleExcelDownload = async (filterDates) => {
    const res = await downloadPaymentsExcel({
      pageNumber: excelPage,
      type: "NURSERY",
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

  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      const res = await searchPayment(query);
      const payments = formatPaymentsData(res.data);
      setData(payments);
    }
  }, 500);

  const onNumberChange = async (num) => {
    setNewPayment((prev) => ({
      ...prev,
      phone: num.target.value,
    }));
    if (num.target.value.length === 10) {
      const res = await paymentData(num.target.value);
      const paymentInfo = res?.data;
      setNewPayment((prev) => ({
        ...prev,
        name: paymentInfo?.name,
        accountNumber: paymentInfo?.accountNumber,
        ifscCode: paymentInfo?.ifscCode,
        bankName: paymentInfo?.bankName,
      }));
    }
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  const getUserCount = () => {
    setUsersCount(paymentsCountReq?.data?.data[0]?.count || 0);
  };

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

  const handleFilterReset = () => {
    setFilterDates(getRoundedDates());
  };

  useEffect(() => {
    if (paymentsCountReq.status !== "fulfilled") return;
    getUserCount();
  }, [paymentsCountReq]);

  useEffect(() => {
    if (paymentsData.status === "fulfilled") {
      const payments = formatPaymentsData(paymentsData?.data?.data);
      setData(payments);
    }
  }, [paymentsData, searchInput]);

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
      value: "Payment Through",
      isSortable: false,
    },
    {
      value: "Comment",
      isSortable: false,
    },
    {
      value: "Type",
      isSortable: false,
    },

    {
      value: "Amount Paid",
      isSortable: false,
    },
    {
      value: "Bill Number",
      isSortable: false,
    },
    {
      value: "Action",
      isSortable: false,
    },
  ];

  const [values] = useContext(AuthContext);
  const user_role = values.role;
  const PAYMENT_TYPES = [
    { value: "BROKER", label: "Brokerage" },
    { value: "SALARY", label: "Salaries" },
    { value: "OTHERS", label: "Others" },
    { value: "CAPITAL", label: "Capital" },
    { value: "VENDOR", label: "Vendor" },
  ];

  const PAYMENT_MODES = [
    { value: "CASH", label: "Cash" },
    { value: "ONLINE", label: "Online" },
    { value: "BOTH", label: "Both" },
  ];

  let filtered_payment_types = [];

  if (user_role === "admin") {
    filtered_payment_types = PAYMENT_TYPES;
  } else if (user_role === "sales") {
    filtered_payment_types = [PAYMENT_TYPES[0], PAYMENT_TYPES[2]];
  } else if (user_role === "procurement") {
    filtered_payment_types = [PAYMENT_TYPES[1], PAYMENT_TYPES[2]];
  }

  const handleCreatePayment = async () => {
    const data = newPayment;

    if (newPayment.type.value === "BROKER") {
      if (!data.broker) return toast.error("Broker Name cannot be empty");

      if (!data.brokerPhone || String(data.brokerPhone).length !== 10)
        return toast.error("Invalid Broker Phone Number");

      if (!data.amount && data.amount === "" && data.amount >= 0)
        return toast.error("Amount Should not be empty or less than 0");

      if (!data.invoiceId) return toast.error("Invalid Invoice Id");

      const res = {
        type: data.type.value,
        amount: data.amount,
        invoiceId: String(data.invoiceId).trim(),
        brokerName: data.broker.label,
        brokerNumber: data.brokerPhone,
        brokerId: data.broker.value || null,
      };

      const resp = await mutate(res);
      if (resp["error"] !== undefined) {
        return toast.error(resp.error.data.message);
      }
      setNewPaymentModal(false);
      setNewPayment({ type: null });
      toast.success(resp.data.message);
    } else {
      if (!data.name && data.name === "")
        return toast.error("Payment Name cannot be empty");

      if (!data.amount && data.amount === "" && data.amount >= 0)
        return toast.error("Amount Should not be empty or less than 0");
      // if (data.type.value === "OTHERS" && !data.invoiceId)
      //   return toast.error("Invalid Invoice Id");
      if (paymentMode.type === "BOTH") {
        if (
          data.amountPaidCash &&
          data.amountPaidOnline &&
          Number(data.amount) !==
            Number(data.amountPaidOnline) + Number(data.amountPaidCash)
        )
          return toast.error(
            "Total amount should be equal to sum of cash and online amount",
            {
              position: "bottom-right",
              autoClose: 5000,
            }
          );
      }

      const res = {
        type: data?.type?.value,
        empName: data?.name,
        amount: data?.amount,
        phoneNumber: data?.phone || "",
        transferType: paymentMode?.type || "CASH",
        accountNumber: data?.accountNumber,
        ifscCode: data?.ifscCode,
        bankName: data?.bankName,
        comment: data?.comment,
        cashAmount:
          paymentMode?.type === "CASH"
            ? data?.amount
            : data?.amountPaidCash || 0,
        onlineAmount:
          paymentMode?.type === "ONLINE"
            ? data?.amount
            : data?.amountPaidOnline || 0,
      };
      if (data.type.value === "OTHERS") res.invoiceId = data.invoiceId;

      const resp = await mutate(res, businessType);
      console.log(resp, "resp");
      if (resp["error"] !== undefined) {
        return toast.error(resp?.error?.data?.error ?? "Something went wrong");
      }
      setNewPaymentModal(false);
      setNewPayment({ type: null });
      toast.success(resp.data.message);
    }
  };

  return (
    <>
      <div>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>

        <Filters
          config={{
            isNextExcelAvailable,
            excelPage,
            vendorType: "NURSERY", // added this as vendor type because , api requires this as nursery or agri
          }}
          resetExcelPage={() => setExcelPage(1)}
          setNextExcelAvailable={setNextExcelAvailable}
          onReset={handleFilterReset}
          onExcelDownload={handleExcelDownload}
          onSubmit={handleFilterChange}
        >
          {filterDates?.type?.value === "CAPITAL" && (
            <>
              <Filters.Column
                columHeading="Total Investment"
                value={paymentsData?.data?.sum}
              />
              <Filters.Column
                columHeading="Remaining"
                value={paymentsData?.data?.remainingCapital}
              />
            </>
          )}
          {filterDates?.type?.value === "OTHERS" && (
            <>
              <Filters.Column
                columHeading="Total Amount"
                value={paymentsData?.data?.sum}
              />
            </>
          )}
          {filterDates?.type?.value === "SALARY" && (
            <>
              <Filters.Column
                columHeading="Salary Paid"
                value={paymentsData?.data?.sum}
              />
            </>
          )}
        </Filters>

        <div className={styles.wrapper}>
          {/* search */}
          <div className={styles.searchContainer}>
            <input
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search for an Payment..."
              className={styles.searchInput}
            />
            <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
          </div>
          {/* pagination */}
          <div className={styles.paginationContainer}>
            <div>
              <Button
                title="Add Payment"
                onClick={() => setNewPaymentModal(true)}
              />
            </div>
            <div className={styles.paginationInner}>
              {/* count */}
              <span>{`${page === 1 ? "1" : (page - 1) * 10}-${
                page * 10 > usersCount
                  ? usersCount
                  : data?.length > 10
                  ? page * 10
                  : data?.length
              } of ${usersCount}`}</span>
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
                  (page * 10 > usersCount ? usersCount : page * 10) >=
                  usersCount
                }
                className={styles.paginationControls}
              >
                <FaChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {paymentsData.isLoading ? (
          <Spinner />
        ) : (
          paymentsData.status === "fulfilled" && (
            <Table data={[TABLE_HEADER, ...data]} />
          )
        )}

        {paymentsData.isError && (
          <p className={styles.errorMessage}>Unable to load Users Data</p>
        )}
      </div>

      <MantineModal
        opened={newPaymenModal}
        onClose={() => {
          setNewPaymentModal(false);
          setNewPayment({ type: null });
          setPaymentMode({ type: null });
        }}
        size={"700px"}
        title="Add New Payment"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "30px",
            marginTop: "20px",
          }}
        >
          <Dropdown
            required
            title="Payment Type"
            data={filtered_payment_types}
            value={newPayment?.type}
            onChange={(e) => setNewPayment((prev) => ({ ...prev, type: e }))}
          />
          {newPayment.type && newPayment.type.value === "BROKER" ? (
            <>
              <Dropdown
                url="/api/brokers/getAll"
                minInputToFireApi={3}
                id="addVendorName"
                apiDataPath={{ label: "name", value: "_id" }}
                title="Broker Name"
                onChange={(e) => {
                  if (e?.meta?.contact) {
                    setNewPayment((prev) => ({
                      ...prev,
                      broker: { ...e, __isNew__: true, disabled: true },
                      brokerPhone: e.meta.contact,
                    }));
                  } else
                    setNewPayment((prev) => ({
                      ...prev,
                      broker: e,
                      brokerPhone: "",
                    }));
                }}
                value={newPayment?.broker || ""}
                canCreate
                required
              />
              {newPayment?.broker?.__isNew__ && (
                <Input
                  title="Phone Number"
                  required
                  disabled={newPayment?.broker?.disabled || false}
                  type="number"
                  value={newPayment?.brokerPhone}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      brokerPhone: e.target.value,
                    }))
                  }
                />
              )}
              <Input
                required
                title="Bill Number"
                value={newPayment?.invoiceId}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    invoiceId: e.target.value,
                  }))
                }
              />

              <Input
                required
                title="Amount Paid"
                type="number"
                value={newPayment?.amount}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
            </>
          ) : newPayment.type ? (
            <>
              {paymentMadeBy.includes(newPayment.type.value) && (
                <Input
                  required
                  title="Phone Number"
                  type="number"
                  value={newPayment?.phone}
                  onChange={(e) => onNumberChange(e)}
                />
              )}
              <Input
                required
                title="Name"
                type="text"
                value={newPayment?.name}
                onChange={(e) =>
                  setNewPayment((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              {/* {newPayment.type.value === "SALARY" && (
                <Input
                  required
                  title="Amount Paid"
                  type="number"
                  value={newPayment?.amount}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      amount: e.target.value,
                    }))
                  }
                />
              )} */}
              {paymentMadeBy.includes(newPayment.type.value) && (
                <React.Fragment>
                  <Input
                    required
                    title="Account Number"
                    type="number"
                    value={newPayment?.accountNumber}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        accountNumber: e.target.value,
                      }))
                    }
                  />
                  <Input
                    required
                    title="IFSC code"
                    type="text"
                    value={newPayment?.ifscCode}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        ifscCode: e.target.value,
                      }))
                    }
                  />

                  <Input
                    required
                    title="Bank name"
                    type="text"
                    value={newPayment?.bankName}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        bankName: e.target.value,
                      }))
                    }
                  />
                  <Input
                    required
                    title="Total Amount Paid"
                    type="number"
                    value={newPayment?.totalAmount}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                  <div>
                    <Dropdown
                      required
                      title="Payment Mode"
                      id="DropDownPaymentMode"
                      data={PAYMENT_MODES}
                      value={paymentMode?.type?.value}
                      onChange={(e) => {
                        setPaymentMode((prev) => ({
                          ...prev,
                          type: e?.value,
                        }));
                        setNewPayment((prev) => ({
                          ...prev,
                          amountPaidOnline: 0,
                          amountPaidCash: 0,
                        }));
                      }}
                    />
                  </div>
                  <Input
                    required
                    title="Comment"
                    type="text"
                    value={newPayment?.comment}
                    onChange={(e) =>
                      setNewPayment((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                  />

                  {paymentMode.type === "BOTH" && (
                    <PaymentModeBoth
                      newPayment={newPayment}
                      setNewPayment={setNewPayment}
                    />
                  )}
                </React.Fragment>
              )}
            </>
          ) : (
            <></>
          )}
          <Button title="Submit" onClick={handleCreatePayment} />
        </div>
      </MantineModal>
    </>
  );
};

const PaymentModeCash = ({ value, setNewPayment, totalAmountPaid }) => {
  return (
    <>
      <Input
        min={0}
        required
        type="number"
        title="Amount that is paid in cash"
        value={value}
        onChange={(e) => {
          setNewPayment((prev) => ({
            ...prev,
            amountPaidCash: e.target.value,
          }));
        }}
      />
    </>
  );
};

const PaymentModeOnline = ({ value, setNewPayment, disabled }) => {
  return (
    <>
      <Input
        min={0}
        required
        disabled={disabled}
        type="number"
        title="Amount that is paid online"
        value={value}
        onChange={(e) =>
          setNewPayment((prev) => ({
            ...prev,
            amountPaidOnline: e.target.value,
          }))
        }
      />
    </>
  );
};
const PaymentModeBoth = ({ newPayment, setNewPayment }) => {
  useEffect(() => {
    setNewPayment((prev) => ({
      ...prev,
      amountPaidOnline: newPayment?.amount - newPayment?.amountPaidCash || 0,
    }));
  }, [newPayment?.amount, newPayment?.amountPaidCash]);
  return (
    <>
      <PaymentModeCash
        totalAmountPaid={newPayment.amount}
        value={newPayment.amountPaidCash}
        setNewPayment={setNewPayment}
      />
      <PaymentModeOnline
        disabled={true}
        value={newPayment?.amount - newPayment?.amountPaidCash || 0}
        setNewPayment={setNewPayment}
      />
    </>
  );
};

export default Payments;

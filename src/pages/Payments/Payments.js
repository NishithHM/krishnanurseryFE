import dayjs from "dayjs";
import debounce from "lodash/debounce";
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
} from "../../components";

import { ImSearch } from "react-icons/im";
import get from "lodash/get";
import { Modal as MantineModal } from "@mantine/core";
import { AuthContext } from "../../context";
import { useGetAllPaymentsQuery } from "../../services/payments.services";
import { toast } from "react-toastify";
import { useCreatePaymentMutation } from "../../services/payments.services";
import { useGetAllPaymentsCountQuery } from "../../services/payments.services";
import { useSearchPaymentMutation } from "../../services/payments.services";

const Payments = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [newPaymenModal, setNewPaymentModal] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: null });

  const [searchInput, setSearchInput] = useState("");
  const [usersCount, setUsersCount] = useState(0);

  // requests
  const paymentsData = useGetAllPaymentsQuery(page);
  const paymentsCountReq = useGetAllPaymentsCountQuery({ search: searchInput });
  const [searchPayment] = useSearchPaymentMutation();
  const [mutate] = useCreatePaymentMutation();

  const handleViewBill = (id) => {
  
  };

  const formatPaymentsData = (data) => {
    const formatted = data.map((item) => {
      const name = { value: item.name };
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

      const data = [name, createdAt, amount, invoiceId, action];
      return data;
    });

    return formatted;
  };

  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      const res = await searchPayment(query);
      const payments = formatPaymentsData(res.data);
      setData(payments);
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  useEffect(() => {
    if (paymentsCountReq.status !== "fulfilled") return;
    setUsersCount(paymentsCountReq.data[0].count || 0);
  }, [paymentsCountReq]);

  useEffect(() => {
    if (paymentsData.status === "fulfilled") {
      const payments = formatPaymentsData(paymentsData.data);
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
      if (data.type.value === "OTHERS" && !data.invoiceId)
        return toast.error("Invalid Invoice Id");

      const res = {
        type: data.type.value,
        empName: data.name,
        amount: data.amount,
      };
      if (data.type.value === "OTHERS") res.invoiceId = data.invoiceId;

      const resp = await mutate(res);
      if (resp["error"] !== undefined) {
        return toast.error(resp.error.data.message);
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
                page * 10 > usersCount ? usersCount : page * 10
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
        }}
        size={"md"}
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
            value={newPayment.type}
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
                  value={newPayment.brokerPhone}
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
                value={newPayment.invoiceId}
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
                value={newPayment.amount}
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
              <Input
                required
                title="Name"
                value={newPayment.name}
                onChange={(e) =>
                  setNewPayment((prev) => ({ ...prev, name: e.target.value }))
                }
              />
              {newPayment.type.value === "OTHERS" && (
                <Input
                  required
                  title="Bill Number"
                  value={newPayment.invoiceId}
                  onChange={(e) =>
                    setNewPayment((prev) => ({
                      ...prev,
                      invoiceId: e.target.value,
                    }))
                  }
                />
              )}
              <Input
                required
                title="Amount Paid"
                type="number"
                value={newPayment.amount}
                onChange={(e) =>
                  setNewPayment((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
              />
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

export default Payments;

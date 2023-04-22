import dayjs from "dayjs";
import debounce from "lodash/debounce";
import styles from "./orderMgmt.module.css";
import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Button, Table, Spinner, BackButton } from "../../components";

import { useGetOrdersMutation } from "../../services/procurement.services";

import { ImSearch } from "react-icons/im";
import { AuthContext } from "../../context";
import {
  addLink,
  addTitle,
  formatOrdersData,
  ROLE_TABLE_HEADER,
} from "./helper";
import { get } from "lodash";

const OrderMgmt = () => {
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [user] = useContext(AuthContext);
  const [searchInput, setSearchInput] = useState("");
  const [ordersCount, setOrdersCount] = useState(0);
  const [getOrders, { isLoading, isError, isSuccess }] = useGetOrdersMutation();
  const onAction = ({ id, action }) => {
    const functionObj = {
      reject: () => {
        console.log(id);
      },
      accept: () => {
        console.log(id);
      },
      verify: () => {
        console.log(id);
      },
      addInvoice: () => {
        console.log(id);
      },
    };
    functionObj[action]();
  };
  const loadInitialOrders = async () => {
    const countBody = {
      isCount: true,
      sortBy: "plantName",
      sortType: -1,
    };
    const listBody = {
      pageNumber: 1,
      sortBy: "plantName",
      sortType: -1,
    };

    const counts = await getOrders({ body: { ...countBody } });
    const list = await getOrders({ body: { ...listBody } });
    setOrdersCount(get(counts, "data[0].count", 0));
    const formattedData = formatOrdersData({
      data: list.data,
      role: user.role,
      onAction,
    });
    console.log(formattedData);
    setData(formattedData);
  };

  useEffect(() => {
    loadInitialOrders();
  }, []);

  const searchHandler = debounce(async (query) => {
    console.log("search triggered", query);
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
      loadInitialOrders();
    }
  }, 500);

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };

  const TABLE_HEADER = ROLE_TABLE_HEADER[user.role];

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
        isSuccess && <Table data={[TABLE_HEADER, ...data]} />
      )}

      {isError && (
        <p className={styles.errorMessage}>Unable to load Users Data</p>
      )}
    </div>
  );
};

export default OrderMgmt;

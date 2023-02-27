import React, { useMemo, useState } from "react";
import { Filters, Search, Table } from "../../components";
import { useGetProcurementsQuery } from "../../services/procurement.services";
import {useGetProcurementHistoryQuery} from "../../services/procurement.services"
import { getProcurementListTableBody } from "./helper";
import styles from "./ProcurementList.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import _ from "lodash";
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";
import { getTableBody } from "../AddProcurement/helper";

const tableHeader = [
  [
    {
      id: new Date().toISOString(),
      value: " Last Procured On",
    },
    {
      value: "Plant Name",
    },
    {
      value: "Total Quantity ₹",
    },
    {
      value: "Remaining Quantity ₹",
    },
    {
      value: "",
    },
  ],
];

const tableHeaderHistory = [
  [
    {
      id: new Date().toISOString(),
      value: "Procured On",
    },
    {
      value: "Total Quantity ₹",
    },
    {
      value: "Vendor Name",
    },
    {
      value: "Vendor Contact",
    },
    {
      value: "Price Per Plant ₹",
    }
  ],
];

const ProcurementList = () => {
  const [page, setPage] = useState(1);
  const [procurementListHistory, setProcurementListHistory] = useState([])
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDeb, setSearchInputDeb] = useState("");
  // const [usersCount, setUsersCount] = useState(0);
  console.log(procurementListHistory, "here")
  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
  });
  const getProcurementCount = useGetProcurementsQuery({ isCount: true });

  const count = _.get(getProcurementCount, "data[0].count", 0);

  // const{data} = useGetProcurementHistoryQuery()
  // console.log(data)

  const searchHandler = debounce(async (query) => {
    console.log("search triggered", query);
    if (query.length >= 3) {
      setSearchInputDeb(query);
    } else {
      setSearchInputDeb("");
    }
  }, 500);

  const onDetailClick = (id) => {
    console.log("clicked", id);
    const procurementData = getProcurements.data.find((ele) => ele._id === id);
    const history = procurementData?.procurementHistory;
    const data ={
      meta:{
        procurementHistory: history
      } 
    }
    const body = getTableBody(data)
    console.log(body, "body")
    setProcurementListHistory(body)
  };

  const handleSearchInputChange = (event) => {
    setSearchInput(event.target.value);
    searchHandler(event.target.value);
  };
  const tableBody = useMemo(() => {
    return getProcurementListTableBody(getProcurements.data, onDetailClick);
  }, [JSON.stringify(getProcurements.data)]);

  const onIncrementPage = () => {
    setPage(page + 1);
  };
  const onDecrementPage = () => {
    setPage(page - 1);
  };
  
  const onChangeHandler = ()=>{
    console.log("change")
  }

  const onSubmitHandler = ()=>{
    console.log("submit")
  }
  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div>
          <Search
            value={searchInput}
            title="Search for a Plant..."
            onChange={handleSearchInputChange}
          />
        </div>
        <div className={styles.paginationContainer}>
          <div className={styles.paginationInner}>
            <button
              disabled={page === 1}
              className={styles.btnControls}
              onClick={onDecrementPage}
            >
              <FaChevronLeft size={16} />
            </button>
            <span>{`${page === 1 ? "1" : page - 1 + 1}-${
              page * 10 > count ? count : page * 10
            } of ${count}`}</span>
            <button
              disabled={(page * 10 > count ? count : page * 10) >= count}
              className={styles.btnControls}
              onClick={onIncrementPage}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className={styles.tablewrapper}>
          <Table
            data={[...tableHeader, ...tableBody]}
            onSortBy={(sort) => console.log(sort)}
          />
        </div>
      </div>
      {/* <div className={styles.paginationContainer}>
          <div className={styles.paginationInner}>
            <button
              disabled={page === 1}
              className={styles.btnControls}
              onClick={onDecrementPage}
            >
              <FaChevronLeft size={16} />
            </button>
            <span>{`${page === 1 ? "1" : page - 1 + 1}-${
              page * 10 > count ? count : page * 10
            } of ${count}`}</span>
            <button
              disabled={(page * 10 > count ? count : page * 10) >= count}
              className={styles.btnControls}
              onClick={onIncrementPage}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
        </div> */}
        <div>
        {procurementListHistory.length!==0 && <div>
          <Filters onChange={onChangeHandler} onSubmit={onSubmitHandler}/>
        </div>}
    {procurementListHistory.length!==0 && <div className={styles.tableProcurementListData}>
        <Table data={[...tableHeaderHistory, ...procurementListHistory]} />
      </div>}
      </div>
    </div>
  );
};

export default ProcurementList;

import React, { useMemo, useState } from "react";
import { Filters, Search, Spinner, Table } from "../../components";
import { useGetProcurementsQuery } from "../../services/procurement.services";
import {useGetProcurementHistoryMutation} from "../../services/procurement.services"
import { getProcurementListTableBody } from "./helper";
import styles from "./ProcurementList.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import _ from "lodash";
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";
import { getTableBody } from "../AddProcurement/helper";
import dayjs from 'dayjs'

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
      value: "Total Quantity",
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
      value: "Total Quantity",
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
  const [pageFilter, setPageFilter] = useState(1);
  const [procurementListHistory, setProcurementListHistory] = useState([])
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDeb, setSearchInputDeb] = useState("");
  const[startDate, setStartDate] = useState(null)
  const[endDate, setEndDate] = useState(null)
  const[id, setId] = useState(null)
  const[historyCount, setHistoryCount] = useState(0)

  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
  });

const[getProcurementHistory] = useGetProcurementHistoryMutation()

  const getProcurementCount = useGetProcurementsQuery({ isCount: true });

  const count = _.get(getProcurementCount, "data[0].count", 0);

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
    
    const body = getTableBody(history)
    setProcurementListHistory(body)
    setHistoryCount(body.length)
    setId(id)
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

  const onIncrementPageFilter = ()=>{
    setPageFilter(pageFilter + 1)
  }
  const onDecrementPage = () => {
    setPage(page - 1);
  };

  const onDecrementPageFilter = () => {
    setPageFilter(pageFilter - 1)
  };
  
  const onChangeHandler = (e)=>{
   setStartDate(e.start_date)
   setEndDate(e.end_date)
  }

  const onSubmitHandler = async(e)=>{
    console.log("clicked", id);
    // const procurementData = getProcurementHistory.find((ele) => ele._id === id);
    const res = await getProcurementHistory({
      startDate:dayjs(startDate).format("YYYY-MM-DD"),
      endDate:dayjs(endDate).format("YYYY-MM-DD"),
      id:id,
      pageNumber: pageFilter
    })
    const resCount = await getProcurementHistory({
      startDate:dayjs(startDate).format("YYYY-MM-DD"),
      endDate:dayjs(endDate).format("YYYY-MM-DD"),
      id:id,
      isCount:true
    })
    setHistoryCount(resCount.data[0].count)
    console.log(resCount)
    // console.log(res.data)

    if(res){
      const body =await getTableBody(res.data)
      console.log(body)
      setProcurementListHistory(body)
    } else{
      <p>{res.error}</p>
    }
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
      <div>
     {procurementListHistory.length!==0 && <div className={styles.paginationContainerFilter}>
          <div className={styles.paginationInnerFilter}>
            <button
              disabled={page === 1}
              className={styles.btnControls}
              onClick={onDecrementPageFilter}
            >
              <FaChevronLeft size={16} />
            </button>
            <span>{`${pageFilter === 1 ? "1" : pageFilter - 1 + 1}-${
              pageFilter * 9 > historyCount ? historyCount : pageFilter * 9
            } of ${historyCount}`}</span>
            <button
              disabled={(pageFilter * 9 > historyCount ? historyCount : pageFilter * 9) >= historyCount}
              className={styles.btnControls}
              onClick={onIncrementPageFilter}
            >
              <FaChevronRight size={16} />
            </button>
          </div>
          </div>}
        <div>
        {procurementListHistory.length!==0 && <div className={styles.tableProcurementListData}>
          <Filters onChange={onChangeHandler} onSubmit={onSubmitHandler}/>
          {/* <Table data={[...tableHeaderHistory, ...procurementListFilter]} /> */}
        </div>}
    {procurementListHistory.length!==0 && <div className={styles.tableProcurementListData}>
        <Table data={[...tableHeaderHistory, ...procurementListHistory]} />
      </div>}
      </div>
      </div>
    </div>
  );
};

export default ProcurementList;

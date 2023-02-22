import React, { useMemo, useState } from "react";
import { Search, Table } from "../../components";
import { useGetProcurementsQuery } from "../../services/procurement.services";
import { getProcurementListTableBody } from "./helper";
import styles from "./ProcurementList.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import _ from "lodash";
import debounce from "lodash/debounce";
import { Link } from "react-router-dom";

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
      value: "Remaining Quantity",
    },
  ],
];
const ProcurementList = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDeb, setSearchInputDeb] = useState("");
  // const [usersCount, setUsersCount] = useState(0);
  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
  });
  const getProcurementCount = useGetProcurementsQuery({ isCount: true });

  const count = _.get(getProcurementCount, "data[0].count", 0);

  const searchHandler = debounce(async (query)=>{
      console.log("search triggered", query)
      if(query.length >= 3){
       setSearchInputDeb(query)
      } else{
        setSearchInputDeb("")
      }
  },500)

    const handleSearchInputChange = (event)=>{
        setSearchInput(event.target.value)
        searchHandler(event.target.value)
    }
  const tableBody = useMemo(() => {
    return getProcurementListTableBody(getProcurements.data);
  }, [JSON.stringify(getProcurements.data)]);

  const onIncrementPage = () => {
    setPage(page + 1);
  };
  const onDecrementPage = () => {
    setPage(page - 1);
  };
  return (
    <div>
      <div>
        <Search value={searchInput} title="Search for a Plant..." onChange={handleSearchInputChange}/>
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
          <span>{`${page === 1 ? "1" : (page - 1) + 1}-${
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
  );
};

export default ProcurementList;

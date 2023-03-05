import React, { useContext, useMemo, useState } from "react";
import {
  Filters,
  Search,
  Table,
  BackButton,
  Button,
  Input,
} from "../../components";
import {
  useGetProcurementsQuery,
  useGetProcurementHistoryMutation,
  useAddProcurementVariantsMutation,
  useAddMinimumQuantityMutation,
} from "../../services/procurement.services";
import {
  getProcurementListTableBody,
  getTableBody,
  InputCell,
  rowInitState,
  variantHeaders,
} from "./helper";
import styles from "./ProcurementList.module.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import _, { cloneDeep } from "lodash";
import debounce from "lodash/debounce";
import dayjs from "dayjs";
import { AuthContext } from "../../context";

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
    },
  ],
];

const ProcurementList = () => {
  const [page, setPage] = useState(1);
  const [pageFilter, setPageFilter] = useState(1);
  const [procurementListHistory, setProcurementListHistory] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchInputDeb, setSearchInputDeb] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [id, setId] = useState(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [variantRows, setVariantRows] = useState([rowInitState]);
  const [quantity, setQuantity] = useState("");

  const [values] = useContext(AuthContext);
  const role = values.role
  const getProcurements = useGetProcurementsQuery({
    pageNumber: page,
    search: searchInputDeb,
  });

  const [getProcurementHistory] = useGetProcurementHistoryMutation();
  const [addProcurementVariants] = useAddProcurementVariantsMutation();
  const [addMinimumQuantity] = useAddMinimumQuantityMutation();

  const getProcurementCount = useGetProcurementsQuery({ isCount: true });

  const count = _.get(getProcurementCount, "data[0].count", 0);

  const searchHandler = debounce(async (query) => {
    if (query.length >= 3) {
      setSearchInputDeb(query);
    } else {
      setSearchInputDeb("");
    }
  }, 500);

  const onDetailClick = (id) => {
    const procurementData = getProcurements.data.find((ele) => ele._id === id);
    const history = procurementData?.procurementHistory;
    const variants = procurementData?.variants;
    console.log(variants);
    setQuantity(procurementData?.minimumQuantity);
    if (variants.length > 0) {
      const mappedVariants = variants.map((ele) => {
        const row = [];
        row.push({
          value: ele.names.en.name,
          id: "variantNameInEnglish",
          type: "text",
        });
        row.push({
          value: ele.names.ka.name,
          id: "variantNameInKannada",
          type: "text",
        });
        row.push({ value: ele.maxPrice, id: "maxPrice", type: "number" });
        row.push({ value: ele.minPrice, id: "maxPrice", type: "number" });
        return row;
      });
      setVariantRows(mappedVariants);
    } else {
      setVariantRows([rowInitState]);
    }
    const body = getTableBody(history);
    setProcurementListHistory(body);
    setHistoryCount(body.length);
    setId(id);
    setStartDate("");
    setEndDate("");
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



  const onHistoryPageChange = async (isAdd) => {
    const page = isAdd ? pageFilter + 1 : pageFilter - 1;

    setPageFilter(page);
    const res = await getProcurementHistory({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      id: id,
      pageNumber: page,
    });

    if (res) {
      const body = await getTableBody(res.data);
      setProcurementListHistory(body);
    }
  };
  const onDecrementPage = () => {
    setPage(page - 1);
  };

  const onChangeHandler = (e) => {
    setStartDate(e.start_date);
    setEndDate(e.end_date);
  };

  const onSubmitHandler = async (e) => {
    const res = await getProcurementHistory({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      id: id,
      pageNumber: 1,
    });
    const resCount = await getProcurementHistory({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      id: id,
      isCount: true,
    });
    setHistoryCount(resCount.data[0]?.count);

    if (res) {
      const body = await getTableBody(res.data);
      setProcurementListHistory(body);
    }
  };

  const onVariantInputChange = ({ val, cIndex, rIndex }) => {
    if (cIndex > 1) {
      val = +val;
    }
    const oldRow = cloneDeep(variantRows);
    const cellData = oldRow[rIndex][cIndex];
    cellData.value = val;
    oldRow[rIndex][cIndex] = cellData;
    setVariantRows(oldRow);
  };

  const onVariantSubmitHandler = async () => {
    const variants = variantRows.map((ele) => {
      return ele.reduce((acc, val) => {
        const obj = { [val.id]: val.value };
        return { ...acc, ...obj };
      }, {});
    });
    const res = await addProcurementVariants({
      id: id,
      body: { variants },
    });
    getProcurements.refetch();
  };

  const onQuantityChangeHandler = (e) => {
    setQuantity(+e.target.value);
  };

  const onQuantitySubmitHandler = async () => {
    const obj = { minimumQuantity: quantity };
    const res = await addMinimumQuantity({
      id: id,
      body: obj,
    });
    getProcurements.refetch();
  };

  const disabledVariantsSubmit = useMemo(()=>{
    const flattenedArray = variantRows.flatMap((ele)=> {
      return ele
    })
     return flattenedArray.some((ele)=> !ele.value)
  
  }, [JSON.stringify(variantRows)])
  


  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>
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
            <span>{`${page === 1 ? "1" : (page - 1) * 10 + 1}-${
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
      {id && 
        <div className={styles.tableProcurementListData}>
          {procurementListHistory?.length !== 0 && (
            <div className={styles.paginationContainerFilter}>
              <div className={styles.paginationInnerFilter}>
                <button
                  disabled={page === 1}
                  className={styles.btnControls}
                  onClick={() => onHistoryPageChange(false)}
                >
                  <FaChevronLeft size={16} />
                </button>
                <span>{`${pageFilter === 1 ? "1" : (pageFilter - 1) * 10 + 1}-${
                  pageFilter * 10 > historyCount
                    ? historyCount
                    : pageFilter * 10
                } of ${historyCount}`}</span>
                <button
                  disabled={
                    (pageFilter * 10 > historyCount
                      ? historyCount
                      : pageFilter * 10) >= historyCount
                  }
                  className={styles.btnControls}
                  onClick={() => onHistoryPageChange(true)}
                >
                  <FaChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
          <div>
            {id && (
              <div>
                <Filters
                  startDateInput={startDate}
                  endDateInput={endDate}
                  onChange={onChangeHandler}
                  onSubmit={onSubmitHandler}
                />
                {/* <Table data={[...tableHeaderHistory, ...procurementListFilter]} /> */}
              </div>
            )}
            {procurementListHistory?.length !== 0 ? (
              <div>
                <Table
                  data={[...tableHeaderHistory, ...procurementListHistory]}
                />
              </div>
            ) : (
              id && (
                <div className={styles.noDataDisplayText}>
                  {" "}
                  <span>There's nothing to display!</span>{" "}
                </div>
              )
            )}
           
           {role==="admin" &&
           <>
              <div>
                <div
                  className={styles.addButton}
                  onClick={() => setVariantRows([...variantRows, rowInitState])}
                >
                  <div className={styles.plusIcon}> +</div>
                </div>
                <table className={styles.tableVariants}>
                  <thead>
                    {variantHeaders.map((ele) => (
                      <th key={ele}>{ele}</th>
                    ))}
                  </thead>
                  <tbody>
                    {variantRows.map((row, rIndex) => (
                      <tr key={rIndex}>
                        {row.map((cell, cIndex) => (
                          <td key={cell.id + cIndex}>
                            <InputCell
                              {...cell}
                              rIndex={rIndex}
                              cIndex={cIndex}
                              onInputChange={(val) =>
                                onVariantInputChange({ val, cIndex, rIndex })
                              }
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.submitWrapper}>
                <div className={styles.submitBtn}>
                  <Button
                    type="primary"
                    title="Submit Variants"
                    onClick={onVariantSubmitHandler}
                    disabled={disabledVariantsSubmit}
                  />
                </div>
              </div>
              <div className={styles.quantityWrapper}>
                <div>
                  <Input
                    id="quantity"
                    type="number"
                    title="Minimum Quantity"
                    onChange={onQuantityChangeHandler}
                    value={quantity}
                  />
                </div>
                <div className={styles.submitQuantity}>
                  <Button
                    type="primary"
                    title="Submit Quantity"
                    onClick={onQuantitySubmitHandler}
                    disabled={!quantity}
                  />
                </div>
              </div>
            </>}
          </div>
        </div>
      }
    </div>
  );
};

export default ProcurementList;

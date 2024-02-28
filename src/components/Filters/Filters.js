import React, { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import "./Calendar.css";
import "./DatePicker.css";
import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { cloneDeep, isEmpty } from "lodash";
import { faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { CSVLink } from "react-csv";
import axios from "axios";
import * as XLSX from "xlsx";
import { CSVLink } from "react-csv";
import Spinner from "../Spinner/Spinner";
const Filters = ({
  onSubmit = () => {},
  onReset = () => {},
  config = {},
  page,
  purchaseCount,
  apiEndpoint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [excelData, setExcelData] = useState([]);
  // const [nurseryData, setNurseryData] = useState(null);
  const [isNext, setIsNext] = useState(null);
  const [totalTableData, setTotalTableData] = useState(null);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(1000);
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("2023-01-01");
  const [endDate, setEndDate] = useState("2024-02-02");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filterDates, setFilterDates] = useState({
    start_date: null,
    end_date: null,
  });
  const [filters, setFilters] = useState({ vendors: [], status: [] });

  const csvLinkStyle = {
    height: "25px",
    width: "100px",
    border: "1px solid white",
    textAlign: "center",
    borderRadius: "10px",
    padding: "10px 20px",
    cursor: "pointer",
    display: `${excelData.length !== 0 ? "flex" : "none"}`,
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "#038819",
    color: "white",
    whiteSpace: "nowrap",
  };

  const baseUrl = "http://15.207.187.17:8000";

  const token = `${sessionStorage.getItem('authToken')}`;
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: token,
      };


      const response = await axios.get(
        `${baseUrl}${apiEndpoint}?pageNumber=1&startDate=${startDate}&endDate=${endDate}`,
        { headers, responseType: "arraybuffer" }
      );
      const linkHeader = response.headers.link;
      const isNextValue = linkHeader
        ? linkHeader.includes('rel="next"')
        : false;
      setIsNext(isNextValue);

      const workbook = XLSX.read(response.data, { type: "array" });

      const tableData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]],
        { rawNumbers: true }
      );

      setTotalTableData(tableData);
      setData(
        tableData.length > 1000
          ? tableData.slice(startIndex, startIndex + 1000)
          : tableData.slice(startIndex)
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(true)
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  useEffect(() => {
    if (data.length !== 0) {
      const tableData = data.map((curelem) => {
        const date = curelem["billed date"];
        const dateObj = new Date(Math.round((date - 25569) * 86400) * 1000);
        const formattedDate = dateObj.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        const updatedData = { ...curelem, "billed date": formattedDate };
        return updatedData;
      });

      setExcelData(tableData);
    } else {
      setExcelData([]);
    }
  }, [data, setExcelData]);

  const handleSubmitFilter = () => {
    const updatedFilterDates = {
      start_date: startDate,
      end_date: endDate,
    };
    setFilterDates(updatedFilterDates);
    onSubmit({...updatedFilterDates, ...filters});
    setStartIndex(1);
    setEndIndex(1000);
    fetchData();
  };

  const handleClearFilters = async () => {
    setFilterDates(() => ({
      start_date: null,
      end_date: null,
    }));
    setStartDate(null)
    setEndDate(null)
    setFilters(() => ({
      vendors: [],
      status: [],
    }));
    await onSubmit({
      start_date: null,
      end_date: null,
      vendors: [],
      status: [],
    });
  };

  const dropDownChangeHandler = (e, id) => {
    const newFilter = cloneDeep(filters);
    newFilter[id] = e;
    setFilters(newFilter);
  };

  const HandleDownload = () => {
    if (excelData.length !== 0) {
      fetchData();
      if (isNext) {
        const remainingDataLength = totalTableData.length - endIndex;
        setStartIndex((prevIndex) =>
          prevIndex + totalTableData.length > 1000 ? 1000 : 0
        );
        setEndIndex((prevIndex) =>
          prevIndex + totalTableData.length > 1000
            ? 1000
            : totalTableData.length
        );
        if (remainingDataLength < 1000) {
          setExcelData(totalTableData);
        } else {
          setExcelData(excelData.slice(0, 1000));
        }
      } else {
        setExcelData(totalTableData);
      }
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <h3 className={styles.title}>Filters</h3>
        <FaFilter />
        <div className={styles.controlBtn} onClick={() => setIsOpen((e) => !e)}>
          <FaChevronDown size={15} />
        </div>
      </div>
      {isOpen && (
        <div className={styles.wrapperFilter}>
          <Datefilter
            closeFilters={() => setIsOpen(false)}
            onChange={(date) => {
              setStartDate(date.startDate);
              setEndDate(date.endDate);
              setFilterDates(date);
            }}
            startDateInput={startDate}
            endDateInput={endDate}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
          />
          {config.isVendor && (
            <div style={{ width: "200px" }}>
              <Dropdown
                url={`/api/vendors/getAll?type=${config?.vendorType}`}
                id="vendors"
                apiDataPath={{ label: "name", value: "_id" }}
                title="Vendor Name"
                onChange={dropDownChangeHandler}
                value={filters.vendors}
                isMultiEnabled
                minInputToFireApi={3}
              />
            </div>
          )}
          {config.orderStatus && (
            <Dropdown
              id="status"
              title="Order Status"
              onChange={dropDownChangeHandler}
              value={filters.status}
              isMultiEnabled
              data={[
                { label: "placed", value: "PLACED" },
                { label: "requested", value: "REQUESTED" },
                { label: "rejected", value: "REJECTED" },
                { label: "verified", value: "VERIFIED" },
              ]}
            />
          )}
          <div className={styles.buttonWrapper}>
            <div className={styles.btnSubWrapper}>
              <Button title="Submit" onClick={handleSubmitFilter} />
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <div className={styles.btnSubWrapper}>
              <Button title="Clear" onClick={handleClearFilters} />
            </div>
          </div>
          <div className={styles.buttonWrapper}>
            <div className={styles.btnSubWrapper}>
             {error ? '' : 
              <CSVLink
                onClick={HandleDownload}
                data={excelData}
                style={csvLinkStyle}
                icon={faFileExcel}
              >
                {loading ? (
                  <Spinner />
                ) : (
                  `${startIndex}-${
                    totalTableData.length > 1000
                      ? endIndex
                      : totalTableData.length
                  } of ${totalTableData.length}`
                )}
                <FontAwesomeIcon icon={faFileExcel} />
              </CSVLink>} 
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [nurseryData, setNurseryData] = useState(null);
  const [filterDates, setFilterDates] = useState({
    start_date: null,
    end_date: null,
  });
  const [filters, setFilters] = useState({ vendors: [], status: [] });
  const handleSubmitFilter = () => {
    onSubmit({ ...filterDates, ...filters });
  };
  const csvLinkStyle = {
    height: "30px",
    width: "100px",
    border: "1px solid white",
    textAlign: "center",
    borderRadius: "10px",
    padding: "10px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    background: "#038819",
    color: "white",
    whiteSpace: "nowrap",
  };

  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDk0NzM2ZWUwNjE1ZWY2Mzc3MjU2MyIsIm5hbWUiOiJhZG1pbjEiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDg2NzE1NDUsImV4cCI6MTcwODc1Nzk0NX0.fY3ZfvsXtKSm49-IJFsarmCJUu5jriUIVnvq4sLifcE";
  const baseUrl = "http://15.207.187.17:8000"; // Replace this with your actual base URL

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = {
        Authorization: `${token}`,
      };

      const response = await axios.get(
        `${baseUrl}/api/excel/billing?pageNumber=1&startDate=2023-01-01&endDate=2024-02-02`,
        { headers, responseType: "arraybuffer" }
      );

      const workbook = XLSX.read(response.data, { type: "array" });
      

      const tableData = XLSX.utils.sheet_to_json(
        workbook.Sheets[workbook.SheetNames[0]]
      );

      setData(tableData.slice(startIndex, endIndex));
      setStartIndex((prevIndex) => prevIndex + 10);
      setEndIndex((prevIndex) => prevIndex + 10);
      console.log(startIndex, endIndex);
      console.log(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClearFilters = async () => {
    setFilterDates(() => ({
      start_date: null,
      end_date: null,
    }));
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
            onChange={(date) => setFilterDates(date)}
            startDateInput={filterDates.start_date}
            endDateInput={filterDates.end_date}
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
              <CSVLink
                onClick={fetchData}
                data={data}
                style={csvLinkStyle}
                icon={faFileExcel}
              >
                {loading ? <Spinner /> : `${startIndex}-${endIndex} of 158`}
                <FontAwesomeIcon icon={faFileExcel} />
              </CSVLink>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;

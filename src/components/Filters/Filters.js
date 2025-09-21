import React, { useContext, useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import "./Calendar.css";
import "./DatePicker.css";
import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { cloneDeep } from "lodash";
import { AuthContext } from "../../context";

const Filters = ({
  onSubmit = () => {},
  onReset = () => {},
  config = {},
  onExcelDownload = () => {},
  onXmlDownload = () => {},
  resetExcelPage,
  setNextExcelAvailable,
  children,
  typeFilterVisible = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isParentSet, setParentSet] = useState(false);
  const [filterDates, setFilterDates] = useState({
    startDate: null,
    endDate: null,
  });
  const [filters, setFilters] = useState({ vendors: [], status: [], type: "" });
  console.log("Filters config", filterDates);
  const handleSubmitFilter = () => {
    const updatedFilterDates = {
      start_date: filterDates.startDate,
      end_date: filterDates.endDate,
    };
    onSubmit({ ...updatedFilterDates, ...filters });
  };

  const [user] = useContext(AuthContext);

  let typeDropDownData = [
    { label: "capital", value: "CAPITAL" },
    { label: "vendor", value: "VENDOR" },
    { label: "salary", value: "SALARY" },
    { label: "others", value: "OTHERS" },
    { label: "brokerage", value: "BROKERAGE" },
  ];

  typeDropDownData = typeDropDownData.filter((item) => {
    if (user?.role === "sales") {
      if (item.value === "VENDOR") return false;
    }
    return true;
  });

  const handleExcelDownload = () => {
    onExcelDownload({ ...filterDates });
  };

  const handleXmlDownload = () => {
    onXmlDownload({ ...filterDates });
  }

  const handleClearFilters = async () => {
    setFilterDates(() => ({
      startDate: null,
      endDate: null,
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
    setParentSet(false);
  };

  const dropDownChangeHandler = (e, id) => {
    const newFilter = cloneDeep(filters);
    newFilter[id] = e;
    setFilters(newFilter);
  };

  console.log("Filters config", config, filters);

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
              setFilterDates(date);
              resetExcelPage?.();
              setNextExcelAvailable?.(true);
            }}
            setParentSet={setParentSet}
            isParentSet={isParentSet}
            startDateInput={filterDates.startDate}
            endDateInput={filterDates.endDate}
          />

          {typeFilterVisible && (
            <div style={{ width: "200px" }}>
              <Dropdown
                id="type"
                title="Type"
                onChange={dropDownChangeHandler}
                value={filters.type}
                data={typeDropDownData}
              />
            </div>
          )}

          {(config.isVendor ||
            filters?.type?.value === "VENDOR") && (
              <div style={{ width: "300px" }}>
                <Dropdown
                  url={`/api/vendors/getAll?type=${config?.vendorType}`}
                  id="vendors"
                  apiDataPath={{ label: "name", value: "_id" }}
                  title="Vendor Name"
                  onChange={e => dropDownChangeHandler([e], "vendors")}
                  value={filters.vendors}
                  // isMultiEnabled
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
            {config.excelPage && (
              <div className={styles.btnSubWrapper}>
                <Button
                  title={`Excel Download page ${config.excelPage}`}
                  onClick={handleExcelDownload}
                  disabled={
                    !(filterDates.endDate && filterDates.startDate) ||
                    !config.isNextExcelAvailable
                  }
                />
              </div>
            )}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {config.onXmlDownload && (
              <div className={styles.btnSubWrapper}>
                <Button
                  title={`XML Download`}
                  onClick={handleXmlDownload}
                  disabled={!(filterDates.endDate && filterDates.startDate)}
                />
              </div>
            )}
          </div>
          {children}
        </div>
      )}
    </div>
  );
};

const AnotherColumn = ({ columHeading, value }) => {
  return (
    <div className={styles.buttonWrapper}>
      <div className={styles.btnSubWrapper}>
        <p
          style={{
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {columHeading}: {value}
        </p>
      </div>
    </div>
  );
};

Filters.Column = AnotherColumn;

export default Filters;

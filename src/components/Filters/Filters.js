import React, { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import "./Calendar.css";
import "./DatePicker.css";
import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { cloneDeep } from "lodash";

const Filters = ({
  onSubmit = () => {},
  onReset = () => {},
  config = {},
  onExcelDownload = () => {},
  resetExcelPage,
  setNextExcelAvailable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isParentSet, setParentSet] = useState(false);
  const [filterDates, setFilterDates] = useState({
    start_date: null,
    end_date: null,
  });
  const [filters, setFilters] = useState({ vendors: [], status: [] });
  const handleSubmitFilter = () => {
    const updatedFilterDates = {
      start_date: filterDates.startDate,
      end_date: filterDates.endDate,
    };
    onSubmit({ ...updatedFilterDates, ...filters });
  };

  const handleExcelDownload = () => {
    onExcelDownload({ ...filterDates });
  };

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
    setParentSet(false);
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
            onChange={(date) => {
              setFilterDates(date);
              resetExcelPage?.();
              setNextExcelAvailable?.(true);
            }}
            setParentSet={setParentSet}
            isParentSet={isParentSet}
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
            {config.excelPage && <div className={styles.btnSubWrapper}>
              <Button
                title={`Excel Download page ${config.excelPage}`}
                onClick={handleExcelDownload}
                disabled={
                  !(filterDates.endDate && filterDates.startDate) ||
                  !config.isNextExcelAvailable
                }
              />
            </div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Filters;

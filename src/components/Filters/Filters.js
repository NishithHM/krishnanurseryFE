import React, { useEffect, useState } from "react";
import { FaFilter, FaChevronDown } from "react-icons/fa";
import "./Calendar.css";
import "./DatePicker.css";
import styles from "./filters.module.css";
import Datefilter from "./Datefilter";
import Button from "../Button";
import Dropdown from "../Dropdown";
import { cloneDeep, isEmpty } from "lodash";

const Filters = ({ onSubmit = () => { }, onReset = () => { }, config = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterDates, setFilterDates] = useState({
        start_date: null,
        end_date: null,
    });
    const [filters, setFilters] = useState({ vendors: [], status: [] })
    const handleSubmitFilter = () => {
        onSubmit({ ...filterDates, ...filters });
    };

    const dropDownChangeHandler = (e, id) => {
        const newFilter = cloneDeep(filters)
        newFilter[id] = e
        setFilters(newFilter)
    }

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
                        onChange={(date => setFilterDates(date))}
                    />
                    {config.isVendor &&
                        <Dropdown
                            url="/api/vendors/getAll"
                            id="vendors"
                            apiDataPath={{ label: "name", value: "_id" }}
                            title="Vendor Name"
                            onChange={dropDownChangeHandler}
                            value={filters.vendors}
                            isMultiEnabled
                        />
                    }
                    {config.orderStatus && <Dropdown
                        id="status"
                        title="Order Status"
                        onChange={dropDownChangeHandler}
                        value={filters.status}
                        isMultiEnabled
                        data={[{ 'label': "placed", value: "PLACED" }, { 'label': "requested", value: "REQUESTED" }, { 'label': "rejected", value: "REJECTED" }, { 'label': "verified", value: "VERIFIED" }]}
                    />}
                    <div className={styles.buttonWrapper}>
                        <div className={styles.btnSubWrapper}>
                            <Button
                                title="Submit"
                                onClick={handleSubmitFilter}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filters;

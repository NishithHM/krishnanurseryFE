import React, { useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Creatable from "react-select/creatable";
import debounce from "lodash/debounce";
import cx from "classnames";

import styles from "./dropdown.module.css";
import { useSearchProductsQuery } from "../../services/procurement.services";
const Dropdown = ({
  data,
  url = null,
  isMultiEnabled = false,
  isClearable = false,
  canCreate,
  onChange,
  title = "",
  placeholder = "Select",
  required = false,
  error = null,
  errorMessage = null,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState(data || []);
  const [loading, setLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onChange(selectedOption);
  };

  // const { data: searchData, runQuery } = useSearchProductsQuery();

  // const searchProducts = useSearchProductsQuery("tea");
  // console.log(searchProducts);

  const loadOptions = debounce(async (inputValue, callback) => {
    if (!url || inputValue.length < 3) return [];
    setSearchQuery(inputValue);
    setLoading(true);

    // const data = await searchData("tea");
    //   data fetching logic is added here and filter data and send to callback
    //   here dummy data is sent for testing
    callback([
      { value: "tea1", label: "tea 1" },
      { value: "tea2", label: "tea 2" },
    ]);
    setLoading(false);
  }, 500);

  const DropdownStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      border: "none",
      borderBottom:
        error && !state.isFocused ? "1px solid red" : "1px solid gray",
      borderRadius: "0px",
      outline: "none",
    }),
    indicatorSeparator: (baseStyles, state) => ({
      display: "none",
    }),
  };
  if (url) {
    return (
      <div>
        <div className={styles.label}>
          <label>{title}</label>
          {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )}
        </div>
        <AsyncSelect
          value={selectedOption}
          onChange={handleChange}
          loadOptions={loadOptions}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          isLoading={loading}
          styles={DropdownStyles}
        />
        {error && (
          <div className={styles.errortext}>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  } else if (canCreate) {
    return (
      <div>
        <div className={styles.label}>
          <label>{title}</label>
          {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )}
        </div>{" "}
        <Creatable
          value={selectedOption}
          onChange={handleChange}
          options={options}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          styles={DropdownStyles}
        />
        {error && (
          <div className={styles.errortext}>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div>
        <div className={styles.label}>
          <label>{title}</label>
          {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )}
        </div>
        <Select
          value={selectedOption}
          onChange={handleChange}
          options={options}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          placeholder={placeholder}
          styles={DropdownStyles}
        />
        {error && (
          <div className={styles.errortext}>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }
};

export default Dropdown;

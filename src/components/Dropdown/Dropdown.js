import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import AsyncSelectCreatable from "react-select/async-creatable";
import Creatable from "react-select/creatable";
import debounce from "lodash/debounce";
import cx from "classnames";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import styles from "./dropdown.module.css";
import axios from "axios";
import { StylesConfig } from "react-select";
import { min } from "lodash";
const include_headers = Boolean(process.env.REACT_APP_HEADER_AUTHORIZATION);
const Dropdown = ({
  data,
  url = null,
  isMultiEnabled = false,
  isClearable = false,
  canCreate = false,
  onChange,
  title = "",
  placeholder = "Select",
  required = false,
  error = null,
  errorMessage = null,
  apiDataPath = {},
  disabled = false,
  id,
  value,
  minInputToFireApi = 3,
  onCreateOption = () => {},
}) => {
  const [selectedOption, setSelectedOption] = useState({});
  const [options, setOptions] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onChange(selectedOption, id);
  };

  useEffect(() => {
    setSelectedOption(value);
  }, [value]);

  useEffect(() => {
    setOptions(data);
  }, [JSON.stringify(data)]);

  const loadOptions = async (inputValue, callback) => {
    if (!url || inputValue.length < minInputToFireApi) return [];
    setSearchQuery(inputValue);
    setLoading(true);
    let config;
    if (include_headers) {
      config = {
        headers: {
          Authorization: sessionStorage.getItem("authToken"),
        },
      };
    }
    const res = await axios.get(
      url.includes("?")
        ? `${process.env.REACT_APP_BASE_URL}${url}&search=${inputValue}`
        : `${process.env.REACT_APP_BASE_URL}${url}?search=${inputValue}`,
      config
    );

    const optionsVal = res.data.map((opt) => ({
      label: get(opt, apiDataPath.label, opt),
      value: get(opt, apiDataPath.value, opt),
      meta: { ...opt },
    }));
    setOptions(optionsVal);
    setLoading(false);
    callback(optionsVal);
  };

  const DropdownStyles = {
    control: (baseStyles, state) => ({
      ...baseStyles,
      border: "none",
      minHeight: "none",
      borderBottom:
        error && !state.isFocused ? "1px solid red" : "1px solid gray",
      borderRadius: "0px",
      outline: "none",
      "&:hover": {
        border: "1px solid #038819 ",
        boxShadow: "0px 0px 1px #038819 ",
      },
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 999,
    }),
    indicatorSeparator: (baseStyles, state) => ({
      display: "none",
    }),
  };
  if (url && !canCreate) {
    return (
      <div>
        <div className={styles.label}>
          <label>{title}</label>
          {/* {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )} */}
        </div>
        <AsyncSelect
          cacheOptions
          value={selectedOption === undefined ? "" : selectedOption}
          defaultOptions={options}
          // onInputChange={handleChange}

          isDisabled={disabled}
          onChange={handleChange}
          loadOptions={loadOptions}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          isLoading={loading}
          styles={DropdownStyles}
          menuPosition="fixed"
        />
        {error && (
          <div className={styles.errortext}>
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  } else if (url && canCreate) {
    return (
      <div>
        <div className={styles.label}>
          <label>{title}</label>
          {/* {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )} */}
        </div>
        <AsyncSelectCreatable
          value={selectedOption}
          cacheOptions
          defaultOptions={options}
          onChange={handleChange}
          loadOptions={loadOptions}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          isLoading={loading}
          styles={DropdownStyles}
          isDisabled={disabled}
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
          {/* {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )} */}
        </div>{" "}
        <Creatable
          value={selectedOption}
          onChange={handleChange}
          options={options}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          styles={DropdownStyles}
          isDisabled={disabled}
          onCreateOption={onCreateOption}
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
          {/* {required && (
            <span className={cx({ [`${styles.asterick}`]: required })}>*</span>
          )} */}
        </div>
        <Select
          maxMenuHeight={150}
          value={selectedOption === undefined ? "" : selectedOption}
          onChange={handleChange}
          options={options}
          isClearable={isClearable}
          isMulti={isMultiEnabled}
          placeholder={placeholder}
          styles={DropdownStyles}
          isDisabled={disabled}
          menuPosition={title === "Payment Type" ? "absolute" : "fixed"}
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

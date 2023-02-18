import React, { useCallback, useEffect, useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Creatable from "react-select/creatable";
import debounce from "lodash/debounce";
import cx from "classnames";
import isEmpty  from "lodash/isEmpty";
import get  from "lodash/get";
import styles from "./dropdown.module.css";
import axios from "axios";
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
  apiDataPath = {}
}) => {
  const [selectedOption, setSelectedOption] = useState("");
  const [options, setOptions] = useState(data || []);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onChange(selectedOption);
  };

  useEffect(()=>{
    setSelectedOption(selectedOption);
  },[selectedOption])
  

  const loadOptions = debounce( async (inputValue, callback) => {
    if (!url || inputValue.length < 3) return [];
    setSearchQuery(inputValue);

    setLoading(true);

   const res = await axios.get(`${process.env.REACT_APP_BASE_URL}${url}?search=${inputValue}`)
   console.log(res.data, "res")
   const optionsVal = res.data.map(opt=> ({label:get(opt, apiDataPath.label), value: get(opt, apiDataPath.value)}))
   console.log(optionsVal, 'options')
   setLoading(false);
 callback(optionsVal)
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
          defaultOptions
          onInputChange={handleChange}
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

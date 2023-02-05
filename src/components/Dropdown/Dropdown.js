import React, { useState } from "react";
import Select from "react-select";
import AsyncSelect from "react-select/async";
import Creatable from "react-select/creatable";
import debounce from "lodash/debounce";

const Dropdown = ({
  data,
  url = null,
  isMultiEnabled = false,
  isClearable = false,
  canCreate,
  onChange,
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState(data || []);
  const [loading, setLoading] = useState(false);

  const handleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    onChange(selectedOption);
  };

  const loadOptions = debounce(async (inputValue, callback) => {
    if (!url || inputValue.length < 3) return [];
    setLoading(true);
    //   data fetching logic is added here and filter data and send to callback

    //   here dummy data is sent for testing
    callback([
      { value: "tea1", label: "tea 1" },
      { value: "tea2", label: "tea 2" },
    ]);
    setLoading(false);
  }, 500);

  if (url) {
    return (
      <AsyncSelect
        value={selectedOption}
        onChange={handleChange}
        loadOptions={loadOptions}
        isClearable={isClearable}
        isMulti={isMultiEnabled}
        isLoading={loading}
      />
    );
  } else if (canCreate) {
    return (
      <Creatable
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isClearable={isClearable}
        isMulti={isMultiEnabled}
      />
    );
  } else {
    return (
      <Select
        value={selectedOption}
        onChange={handleChange}
        options={options}
        isClearable={isClearable}
        isMulti={isMultiEnabled}
      />
    );
  }
};

export default Dropdown;

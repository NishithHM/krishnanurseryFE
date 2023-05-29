import React, { useEffect, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Dropdown from "../Dropdown";

const AddNewVariantsSelect = ({ preselectedOption, options, setOptions }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [fullOptionList, setFullOptionList] = useState([]);
  const [selectedMultiOptions, setSelectedMultiOptions] = useState([]);

  useEffect(() => {
    if (preselectedOption) {
      const initialOption = {
        value: preselectedOption,
        label: preselectedOption,
      };
      setSelectedOption(initialOption);
      handleOptionChange(initialOption);
    }
  }, [preselectedOption, options]);

  const handleOptionChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    const matchingOption = options.find(
      (option) => option.optionName === selectedOption.value
    );
    if (matchingOption) {
      const newFullOptionList = matchingOption.optionValues.map((value) => ({
        value,
        label: value,
      }));
      setFullOptionList(newFullOptionList);
      setSelectedMultiOptions(newFullOptionList); // Preselect all options
    }
  };

  const handleMultiOptionChange = (selectedOptions) => {
    setSelectedMultiOptions(selectedOptions);

    setOptions(
      options.map((option) =>
        option.optionName === selectedOption.value
          ? {
              ...option,
              optionValues: selectedOptions.map(
                (selectedOption) => selectedOption.value
              ),
            }
          : option
      )
    );
  };

  const handleNewOptionCreate = (inputValue) => {
    // Create a new option
    const newOption = { value: inputValue, label: inputValue };

    // Add the new option to the fullOptionList and selectedMultiOptions
    setFullOptionList((prevOptions) => [...prevOptions, newOption]);
    setSelectedMultiOptions((prevOptions) => [...prevOptions, newOption]);

    // Update the options in the parent component
    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.optionName === selectedOption.value
          ? {
              ...option,
              optionValues: [...option.optionValues, inputValue],
            }
          : option
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: "20px",
        maxWidth: "50rem",
      }}
    >
      <div style={{ flex: "1" }}>
        <Dropdown
          onChange={handleOptionChange}
          data={options.map((option) => ({
            value: option.optionName,
            label: option.optionName,
          }))}
          value={selectedOption}
        />
      </div>
      <div style={{ flex: "2" }}>
        <Dropdown
          isMultiEnabled={true}
          isClearable
          isSearchable
          canCreate={true}
          onCreateOption={handleNewOptionCreate}
          onChange={handleMultiOptionChange}
          data={fullOptionList}
          value={selectedMultiOptions}
        />
      </div>
    </div>
  );
};

export default AddNewVariantsSelect;

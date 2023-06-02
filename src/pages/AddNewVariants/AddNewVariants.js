import React, { Fragment, useEffect, useState } from "react";
import Styles from "./AgriVariants.module.css";
import {
  AddNewVariantsSelect,
  BackButton,
  Button,
  Input,
  Spinner,
} from "../../components";
import { Divider, Modal } from "@mantine/core";
import { cloneDeep } from "lodash";
import {
  useGetAgriOptionValuesMutation,
  useGetAgriOptionsQuery,
  useGetAgriVariantQuery,
  useUpdateAgriOptionValuesMutation,
} from "../../services/agrivariants.services";
import { useSearchParams } from "react-router-dom";

const AddNewVariants = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [jsonData, setJsonData] = useState({});

  const [optionOptionsData, setOptionOptionsData] = useState([]);
  const [options, setOptions] = useState([]);

  const { data, isLoading: isGetOptionsLoading } = useGetAgriOptionsQuery();
  const optionsType = data || [];

  const [typeOptions, setTypeOptions] = useState(optionsType);

  const [getOptionValues] = useGetAgriOptionValuesMutation();

  const editId = searchParams.get("editId");
  const { data: agriVariantData } = useGetAgriVariantQuery({
    id: editId,
  });

  const [updateAgriVariantOptions] = useUpdateAgriOptionValuesMutation();

  useEffect(() => {
    console.log(agriVariantData);
    setJsonData(agriVariantData);
    setOptions(agriVariantData?.options || []);
  }, [agriVariantData]);

  useEffect(() => {
    const promises = [];
    const data = {};

    if (optionsType.length > 0) {
      optionsType.forEach((optionType) => {
        promises.push(getOptionValues({ type: optionType }));
      });

      Promise.all(promises).then((responses) => {
        responses.forEach((response, index) => {
          const optionType = optionsType[index];
          data[optionType] = response.data;
        });

        setOptionOptionsData(data); // Access the data object here or perform further operations
      });
    }
  }, [optionsType]);

  useEffect(() => {
    const newtypeOptions = optionsType.filter(
      (opt) => options.findIndex((ele) => ele.optionName === opt) === -1
    );
    // console.log(newtypeOptions);
    setTypeOptions(newtypeOptions);
  }, [options, optionsType]);

  // comes from backend types api

  const handleButtonClick = async () => {
    const data = options.map((option) => ({
      optionName: option.optionName,
      optionValues: option.values,
    }));

    const res = await updateAgriVariantOptions({
      id: editId,
      body: { options: data },
    });
    console.log(res);
  };

  const addNewOption = () => {
    const newOptions = cloneDeep(options);
    newOptions.push({ optionName: null, optionValues: [] });
    setOptions(newOptions);
  };

  const onTypeChange = ({ index, value, isNew, category }) => {
    const newOption = cloneDeep(options[index]);
    if (category === "type") {
      newOption.optionName = value;
      if (isNew) {
        newOption.optionValues = [];
      } else {
        const newOptioValues =
          cloneDeep(options).find((ele) => ele.optionName === value)
            ?.optionValues ||
          cloneDeep(jsonData.options).find((ele) => ele.optionName === value)
            ?.optionValues ||
          [];
        newOption.optionValues = newOptioValues;
      }
    }
    if (category === "options") {
      newOption.optionValues = [...value];
    }
    // newOption.optionOptions = [];

    const newOptions = [
      ...options.slice(0, index),
      newOption,
      ...options.slice(index + 1),
    ];
    setOptions(newOptions);
  };

  const handleDeleteType = (type) => {
    setOptions((prev) => {
      const filteredOptionsArray = prev.filter(
        (option) => option.optionName !== type
      );
      return filteredOptionsArray;
    });
  };

  if (isGetOptionsLoading) {
    return (
      <div>
        <Spinner />
      </div>
    );
  }
  return (
    <>
      <div className={Styles.agriContainer}>
        <div className={Styles.innerAgriContainer}>
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>

          <div>
            <Button title="Add" onClick={addNewOption} />
            {options.map((option, index) => {
              return (
                <AddNewVariantsSelect
                  key={option.optionName}
                  type={option.optionName}
                  typeValues={option.optionValues}
                  typeOptionsValues={typeOptions}
                  typeOptionOptions={optionOptionsData[option.optionName] || []}
                  onTypeChange={onTypeChange}
                  index={index}
                  deleteTypeHandler={handleDeleteType}
                />
              );
            })}
          </div>
          <button onClick={handleButtonClick}>Save</button>
        </div>
      </div>
    </>
  );
};

export default AddNewVariants;

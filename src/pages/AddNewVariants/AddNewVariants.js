import React, { Fragment, useEffect, useState } from "react";
import Styles from "./AgriVariants.module.css";
import {
  AddNewVariantsSelect,
  BackButton,
  Button,
  Dropdown,
  Input,
  Spinner,
} from "../../components";
import { Divider, Modal } from "@mantine/core";
import { cloneDeep } from "lodash";
import {
  useGetAgriOptionValuesMutation,
  useGetAgriOptionsQuery,
  useGetAgriVariantMutation,
  useUpdateAgriOptionValuesMutation,
} from "../../services/agrivariants.services";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const AddNewVariants = () => {
  let [searchParams, setSearchParams] = useSearchParams();
  const [variantTypeOptions, setVariantTypeOptions] = useState([]);
  const [jsonData, setJsonData] = useState({});

  const [optionOptionsData, setOptionOptionsData] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [variantName, setVariantName] = useState("");

  const { data, isLoading: isGetOptionsLoading } = useGetAgriOptionsQuery();
  const optionsType = data || [];

  const [typeOptions, setTypeOptions] = useState(optionsType);

  const [getOptionValues] = useGetAgriOptionValuesMutation();

  const editId = searchParams.get("editId");
  const [agriVariantData] = useGetAgriVariantMutation();

  const [updateAgriVariantOptions] = useUpdateAgriOptionValuesMutation();

  useEffect(() => {
    async function getVariantOptions() {
      const res = await getOptionValues({ type: "type" });
      setVariantTypeOptions(
        res.data.map((option) => ({
          label: option,
          value: option,
        }))
      );
    }
    getVariantOptions();
  }, []);

  useEffect(() => {
    console.log(variantTypeOptions);
  }, [variantTypeOptions]);

  useEffect(() => {
    async function getData() {
      const res = await agriVariantData({
        id: editId,
      });
      console.log(res.data);
      setJsonData(res.data);
      setSelectedVariant({ label: res.data.type, value: res.data.type });
      setVariantName(res.data.name);

      setOptions(res.data?.options || []);
    }

    if (editId) getData();
  }, [editId]);

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
    if (options.length === 0) {
      return toast.error("Empty Options Not allowed!");
    }
    var emptyOptions = false;
    const data = options.map((option) => {
      if (option.optionValues.length === 0 || !option.optionName) {
        emptyOptions = true;
      }
      return {
        optionName: option.optionName,
        optionValues: option.optionValues,
      };
    });

    if (emptyOptions) {
      return toast.error("Invalid Options!");
    }
    if (editId) {
      await updateAgriVariantOptions({
        id: editId,
        body: { options: data },
      });
      toast.success("Variant Options Updated");
    } else {
      console.log({ selectedVariant, variantName, options });
    }
  };

  const addNewOption = () => {
    const newOptions = cloneDeep(options);
    newOptions.push({ optionName: null, optionValues: [] });
    setOptions(newOptions);
  };

  const onTypeChange = ({ index, value, isNew, category }) => {
    const newOption = cloneDeep(options[index]);
    console.log(newOption);
    if (category === "type") {
      newOption.optionName = value;
      if (isNew) {
        newOption.optionValues = [];
      } else {
        const newOptioValues =
          cloneDeep(options)?.find((ele) => ele.optionName === value)
            ?.optionValues ||
          cloneDeep(jsonData.options)?.find((ele) => ele.optionName === value)
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
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
              }}
            >
              <div className={Styles.variantsControlContainer}>
                <div style={{ width: "100%" }}>
                  <Dropdown
                    title="Type"
                    disabled={editId}
                    data={variantTypeOptions}
                    value={selectedVariant}
                    onChange={(e) => {
                      setSelectedVariant(e);
                    }}
                  />
                </div>

                <div style={{ width: "100%" }}>
                  <Input
                    title="Variant Name"
                    value={variantName}
                    disabled={editId}
                    onChange={(e) => setVariantName(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ width: "fit-content" }}>
                <Button title="Add" onClick={addNewOption} />
              </div>
            </div>

            <div
              style={{
                boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
                padding: "10px",
                margin: "20px 0",
              }}
            >
              {options.length === 0 && (
                <h4 style={{ textAlign: "center" }}>No Options</h4>
              )}
              {options.map((option, index) => {
                return (
                  <AddNewVariantsSelect
                    key={option.optionName}
                    type={option.optionName}
                    typeValues={option.optionValues}
                    typeOptionsValues={typeOptions}
                    typeOptionOptions={
                      optionOptionsData[option.optionName] || []
                    }
                    onTypeChange={onTypeChange}
                    index={index}
                    deleteTypeHandler={handleDeleteType}
                  />
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", width: "fit-content" }}>
            <Button title="Save" onClick={handleButtonClick} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AddNewVariants;

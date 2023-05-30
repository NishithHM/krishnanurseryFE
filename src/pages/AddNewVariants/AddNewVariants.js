import React, { Fragment, useEffect, useState } from "react";
import Styles from "./AgriVariants.module.css";
import {
  AddNewVariantsSelect,
  BackButton,
  Button,
  Input,
} from "../../components";
import { Divider, Modal } from "@mantine/core";
import { cloneDeep } from "lodash";

const AddNewVariants = () => {
  
  const jsonData = {
    _id: "64719ba09c45ffa439f34771",
    type: "pot",
    name: "test pot",
    options: [
      {
        optionName: "color",
        optionValues: ["red", "green", "yellow"],
        _id: "6471b7a7524d957e8cfc2535",
      },
      {
        optionName: "liters",
        optionValues: ["1", "2"],
        _id: "6471b7a7524d957e8cfc2536",
      },
    ],
  };
  const optionsType = ['color', 'liters', 'size']

  const [options, setOptions] = useState(jsonData.options)
  const [typeOptions, setTypeOptions] = useState(optionsType)

  useEffect(()=>{
     const newtypeOptions = optionsType.filter(opt=> options.findIndex(ele=> ele.optionName === opt) ===-1)
     console.log(newtypeOptions)
     setTypeOptions(newtypeOptions)
  }, [JSON.stringify(options), JSON.stringify(optionsType)])

  // comes from backend types api

  const handleButtonClick =()=>{
    console.log(options)
  }

  const addNewOption =()=>{
    const newOptions = cloneDeep(options)
    newOptions.push({optionName:null, optionValues:[]})
    setOptions(newOptions)
  }

  const onTypeChange =({index, value, isNew, category})=>{
    console.log(value)
    const newOption = cloneDeep(options[index])
    if(category === 'type'){
      newOption.optionName = value
      if(isNew){
        newOption.optionValues = []
      }else{
        const newOptioValues = cloneDeep(options).find(ele=>ele.optionName===value)?.optionValues || cloneDeep(jsonData.options).find(ele=>ele.optionName===value)?.optionValues || []
        newOption.optionValues = newOptioValues
      }
    }
    if(category === 'options'){
      newOption.optionValues = [...value]
    }
    
    const newOptions = [
      ...options.slice(0, index),
      newOption,
      ...options.slice(index+1)
    ]
    setOptions(newOptions)
  }

  return (
    <>
      <div className={Styles.agriContainer}>
        <div className={Styles.innerAgriContainer}>
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>

          <div>
            <Button
              title="Add"
              onClick={addNewOption}
            />
            {options.map((option, index) => {
              return (
                  <AddNewVariantsSelect
                    key={option.optionName}
                    type={option.optionName}
                    typeValues={option.optionValues}
                    typeOptions={typeOptions}
                    onTypeChange={onTypeChange}
                    index={index}
                  />
              );
            })}
          </div>
          <button onClick={handleButtonClick}>Log Data</button>
        </div>
      </div>
    </>
  );
};

export default AddNewVariants;

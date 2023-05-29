import React, { useState } from "react";
import Styles from "./AgriVariants.module.css";
import {
  AddNewVariantsSelect,
  BackButton,
  Button,
  Input,
} from "../../components";
import { Divider, Modal } from "@mantine/core";

const AddNewVariants = () => {
  const [newVariantInput, setNewVariantInput] = useState({
    opened: false,
    value: "",
  });
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

  const [options, setOptions] = useState(jsonData.options);

  const addNewOption = (value) => {
    setOptions((prev) => {
      return [...prev, { optionName: value, optionValues: [] }];
    });
  };

  const handleButtonClick = () => {
    console.log({
      ...options,
    });
  };

  return (
    <>
      <div className={Styles.agriContainer}>
        <div className={Styles.innerAgriContainer}>
          <div>
            <BackButton navigateTo={"/authorised/dashboard"} />
          </div>

          <div>
            <Button
              title="Add New"
              onClick={() =>
                setNewVariantInput((prev) => ({ ...prev, opened: true }))
              }
            />
            {options.map((option) => {
              return (
                <>
                  <AddNewVariantsSelect
                    key={option.optionName}
                    options={options}
                    setOptions={setOptions}
                    preselectedOption={option.optionName}
                  />
                </>
              );
            })}
          </div>
          <button onClick={handleButtonClick}>Log Data</button>
        </div>
      </div>
      <Modal opened={newVariantInput.opened} title="Add New Option">
        <Input
          title="Add New"
          value={newVariantInput.value}
          onChange={(e) =>
            setNewVariantInput((prev) => ({ ...prev, value: e.target.value }))
          }
        />

        <Button
          title="Add"
          onClick={() => {
            addNewOption(newVariantInput.value);
            setNewVariantInput({
              opened: false,
              value: "",
            });
          }}
        />
      </Modal>
    </>
  );
};

export default AddNewVariants;

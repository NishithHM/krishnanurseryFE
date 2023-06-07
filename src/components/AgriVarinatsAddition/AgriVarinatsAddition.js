import React, { useEffect, useState } from "react";
import styles from "./AgriVarinatsAddition.module.css";
import cx from "classnames";
import Dropdown from "../Dropdown";
import { cloneDeep } from "lodash";
import { useGetAgriVariantByIdMutation } from "../../services/agrivariants.services";
import { formatDropOptions } from "../../pages/AddNewVariants/helper";
import Input from "../Input";
import Button from "../Button";
import { BiTrash } from "react-icons/bi";
const initialState = {
  variants: [{ type: {}, name: {}, options: [], totalQuantity: "" }],
};
const AgriVarinatsAddition = ({
  onChange = () => null,
  isFormValid = () => null,
}) => {
  const [{ variants }, setState] = useState(initialState);
  const [getAgriVariantById] = useGetAgriVariantByIdMutation();
  const dropDownChangeHandler = async (event, id, index, optIndex) => {
    const variant = cloneDeep(variants[index]);
    variant[id] = event;
    if (id === "name") {
      const res = await getAgriVariantById({ id: event.value });
      variant.options = res.data?.options || [];
    }
    if (optIndex > -1) {
      const newVariantOptions = cloneDeep(variant.options);
      newVariantOptions[optIndex] = {
        ...newVariantOptions[optIndex],
        value: event,
      };
      variant.options = newVariantOptions;
    }
    const newOptions = [
      ...variants.slice(0, index),
      variant,
      ...variants.slice(index + 1),
    ];
    setState((prev) => ({
      ...prev,
      variants: newOptions,
    }));
  };

  useEffect(() => {
    onChange(variants);
    isFormValid(
      variants.some((ele) => !ele.totalQuantity || ele.totalQuantity <= 0)
    );
  }, [JSON.stringify(variants)]);

  const onAddVariant = () => {
    const newVariants = cloneDeep(variants);
    newVariants.push(...cloneDeep(initialState.variants));
    setState((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const onDeleteVariant = (indexToRemove) => {
    console.log(variants);
    setState((prev) => ({
      ...prev,
      variants: prev.variants.filter(
        (element, index) => index !== indexToRemove
      ),
    }));
  };

  return (
    <div className={styles.variantsAddWrapper}>
      <div className={styles.buttonWrapper}>
        <div className={styles.dropDownWrapper}>
          <Button
            onClick={onAddVariant}
            title="Add Variant"
            disabled={variants.some(
              (ele) => !ele.totalQuantity || ele.totalQuantity <= 0
            )}
          />
        </div>
      </div>
      {variants.map((ele, index) => {
        return (
          <div key={index} className={styles.wrapper}>
            <div className={styles.variantsRow}>
              <div className={styles.dropDownWrapper}>
                <Dropdown
                  url="/api/agri/type-options?type=type"
                  id="type"
                  apiDataPath={{ label: "", value: "" }}
                  title="Type"
                  onChange={(e, id) => dropDownChangeHandler(e, id, index)}
                  value={ele.type}
                  minInputToFireApi={1}
                />
              </div>
              {Boolean(ele?.type?.label) && (
                <div className={styles.dropDownWrapper}>
                  <Dropdown
                    url={`/api/agri/variants?type=${ele?.type?.label}`}
                    id="name"
                    apiDataPath={{ label: "name", value: "_id" }}
                    title="Name"
                    onChange={(e, id) => dropDownChangeHandler(e, id, index)}
                    value={ele.name}
                    minInputToFireApi={1}
                  />
                </div>
              )}
              {ele?.options.length > 0 &&
                ele?.options?.map((opt, jIndex) => {
                  return (
                    <div
                      className={styles.dropDownWrapper}
                      key={opt.optionName}
                    >
                      <Dropdown
                        onChange={(e, id) =>
                          dropDownChangeHandler(e, id, index, jIndex)
                        }
                        title={opt.optionName}
                        id={opt.optionName}
                        data={formatDropOptions(opt.optionValues)}
                        value={opt.value}
                      />
                    </div>
                  );
                })}
              {ele.options.length > 0 &&
                ele?.options.every((opt) => !!opt.value) && (
                  <div
                    className={cx(styles.dropDownWrapper, styles.inputDropDown)}
                  >
                    <Input
                      value={ele.totalQuantity}
                      id="totalQuantity"
                      type="number"
                      onChange={(e, id) =>
                        dropDownChangeHandler(e?.target?.value, id, index)
                      }
                      title="Total Quantity"
                      required
                      min={0}
                    />
                  </div>
                )}
            </div>
            <div>
              <Button
                type="alert"
                title={<BiTrash />}
                onClick={() => onDeleteVariant(index)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AgriVarinatsAddition;
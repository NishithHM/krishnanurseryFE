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
import { useLocation } from "react-router-dom";
const initialState = {
  variants: [
    {
      type: {},
      name: {},
      options: [],
      totalQuantity: 1,
      price: 0,
      isTouched: false,
      isFetched: false,
    },
  ],
};
const AgriBillingItem = ({
  onChange = () => null,
  isFormValid = () => null,
  value = [],
  allowNew,
  setIsVariantAdded,
  placeOrder = false,
  state = {},
  setState = () => {},
}) => {
  const { variants } = state;
  // const [{ variants }, setState] = useState(initialState);
  const location = useLocation();
  const isPlaceOrder = location?.state?.placeOrder || placeOrder;
  useEffect(() => {
    if (isPlaceOrder) {
      onChange({ variants: [...value] });
      setState({ variants: [...value] });
    }
  }, []);
  const [getAgriVariantById] = useGetAgriVariantByIdMutation();

  const dropDownChangeHandler = async (event, id, index, optIndex) => {
    const variant = cloneDeep(variants[index]);
    variant[id] = event;
    if (id === "name") {
      const res = await getAgriVariantById({ id: event.value });
      variant.options = res.data?.options || [];
    }
    if (id === "type") {
      variant.options = [];
      variant.name = "";
    }
    if (optIndex > -1) {
      const newVariantOptions = cloneDeep(variant.options);
      newVariantOptions[optIndex] = {
        ...newVariantOptions[optIndex],
        value: event,
      };
      variant.options = newVariantOptions;
      variant.isTouched = true;
      if (variant.isTouched && variant.isFetched) {
        variant.isFetched = false;
      }
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
      isPlaceOrder
        ? variants.some(
            (ele) =>
              !ele.totalQuantity ||
              ele.totalQuantity <= 0 ||
              !ele.price ||
              ele.price <= 0
          )
        : variants.some((ele) => !ele.totalQuantity || ele.totalQuantity <= 0)
    );
  }, [JSON.stringify(variants)]);

  const onAddVariant = () => {
    setIsVariantAdded(true);
    const newVariants = cloneDeep(variants);
    newVariants.push(...cloneDeep(initialState.variants));
    setState((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  };

  const onDeleteVariant = (indexToRemove) => {
    setIsVariantAdded(false);
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
        <h3>Items List</h3>
        <div className={styles.dropDownWrapper}>
          <Button
            onClick={onAddVariant}
            title="New Item"
            disabled={variants.some(
              (ele) => !ele.totalQuantity || ele.totalQuantity <= 0
            )}
            small={true}
          />
        </div>
      </div>
      {variants.length === 0 && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <h2>No Items</h2>
        </div>
      )}

      {variants.map((ele, index) => {
        return (
          <div key={ele?.procurementId} className={styles.wrapper}>
            <div className={styles.variantsRow}>
              <div className={styles.dropDownWrapper}>
                <Dropdown
                  disabled={!allowNew}
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
                    disabled={!allowNew}
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
                        disabled={!allowNew}
                        title={opt.optionName}
                        id={opt.optionName}
                        data={formatDropOptions(opt?.optionValues || [])}
                        value={opt.value}
                      />
                    </div>
                  );
                })}
              {ele.options.length > 0 &&
                ele?.options.every((opt) => !!opt.value) && (
                  <>
                    <div
                      className={cx(
                        styles.dropDownWrapper,
                        styles.inputDropDown
                      )}
                    >
                      <Input
                        value={ele.totalQuantity}
                        id="totalQuantity"
                        type="number"
                        onChange={(e, id) => {
                          if (e.target.value <= 0) {
                            return dropDownChangeHandler(1, id, index);
                          }
                          dropDownChangeHandler(e?.target?.value, id, index);
                        }}
                        title="Total Quantity"
                        required
                        min={0}
                      />
                    </div>

                    {isPlaceOrder && (
                      <>
                        <div
                          className={cx(
                            styles.dropDownWrapper,
                            styles.inputDropDown
                          )}
                        >
                          <Input
                            value={ele.price}
                            id="price"
                            type="number"
                            onChange={(e, id) => {
                              if (
                                Number(e.target.value) > 0 ||
                                e.target.value === ""
                              ) {
                                dropDownChangeHandler(
                                  e?.target?.value,
                                  id,
                                  index
                                );
                              }
                            }}
                            title="Price"
                            required
                            min={ele?.minPrice || 0}
                            max={ele?.maxPrice || 0}
                          />
                        </div>
                        <div
                          className={cx(
                            styles.dropDownWrapper,
                            styles.inputDropDown
                          )}
                        >
                          <Input
                            value={ele.totalQuantity * ele.price}
                            disabled
                            id="subTotal"
                            type="number"
                            onChange={(e, id) => {}}
                            title="Sub Total"
                            required
                            min={0}
                            max={ele?.remainingQuantity || 0}
                          />
                        </div>
                      </>
                    )}
                  </>
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

export default AgriBillingItem;

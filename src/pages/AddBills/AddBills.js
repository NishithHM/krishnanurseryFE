import React, { useState, useEffect, useRef, useContext } from "react";
import { Input, Button, Toaster, BackButton } from "../../components";
import styles from "./AddBills.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BillDetails, CartTableHeader, CartTableRow } from "./CartTableRow";
import _ from "lodash";
import { useLazyGetCustomerByPhoneQuery } from "../../services/customer.service";
import {
  useCheckoutCartMutation,
  useSubmitCartMutation,
  useUpdateCartMutation,
  useLazyGetCustomerCartQuery,
} from "../../services/bills.service";
import { DatePicker } from "@mantine/dates";
import { toast } from "react-toastify";
import ScrollTable from "../../components/Table/ScrollTable";
import { InvoicePreview, InvoiceSection } from "./InvoicePreview";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "../../context";
export default function AddBills() {
  const [userCtx, setContext] = useContext(AuthContext);

  const tableRowBlank = {
    id: new Date().toISOString(),
    procurementId: "",
    procurementLabel: "",
    procurementLabelKa: "",
    variants: [],
    variantId: "",
    variantLabel: "",
    mrp: 0,
    price: 0,
    quantity: 1,
    minPrice: 0,
  };

  const billingHistoryHeader = [
    { value: "Item", width: "25%" },
    { value: "Purchase Date", width: "50%" },
    { value: "Quantity", width: "25%" },
  ];

  const defaultDate = new Date(1960,0,1)


  const initialState = {
    customerNumber: "",
    customerDetails: {},
    customerName: "",
    nameDisabled: true,
    showDOB: false,
    dateOfBirth: defaultDate,
    newCustomer: false,
    billingHistory: [],
    errorFields: [],
    priceError: {
      isExist: false,
      error: "Price can not be less then minimum price",
    },
    checkoutSuccess: { isExist: false, msg: "" },
    cartResponse: {},
    roundOff: 0,
    submitError: { isExist: false, error: "" },
    submitSuccess: { isExist: false, msg: "" },
    checkOutDone: false,
    submitDisable: false,
    invoiceNumber: "",
  };
  const [tableRowData, setTableRowData] = useState([tableRowBlank]);
  const [state, setState] = useState(initialState);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();
  // const invoiceRef = useRef();
  const printEnabled = true;

  const [getCustomerByPhone] = useLazyGetCustomerByPhoneQuery();
  const [checkoutCart, { isLoading: checkOutLoading }] =
    useCheckoutCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const [submitCart, { isLoading: submitLoading }] = useSubmitCartMutation();
  const [getCustomerCart] = useLazyGetCustomerCartQuery();
  const [auth] = useContext(AuthContext);

  const handleAddItem = () => {
    setTableRowData([...tableRowData, tableRowBlank]);
    setState((prev) => ({
      ...prev,
      checkOutDone: false,
    }));
  };

  const handleRemoveItem = (index) => {
    setTableRowData((prev) => prev.filter((v, i) => i !== index));
    setState((prev) => ({
      ...prev,
      checkOutDone: false,
    }));
  };

  const inputChangeHanlder = (event, id) => {
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
  };

  const dateChangeHandler = (event) => {
    setState((prev) => {
      return {
        ...prev,
        dateOfBirth: event,
      };
    });
  };

  const onError = ({ id, isError }) => {
    if (isError) {
      setState((prev) => ({
        ...prev,
        errorFields: _.uniq([...prev.errorFields, id]),
      }));
    } else {
      const newErrorFields = state.errorFields.filter((ele) => id != ele);
      setState((prev) => ({
        ...prev,
        errorFields: newErrorFields,
      }));
    }
  };

  const fetchCustomerInfo = async () => {
    const customerDetails = await getCustomerByPhone(state.customerNumber);

    if (customerDetails.error) {
      setState((prev) => ({
        ...prev,
        errorFields: customerDetails.error,
      }));
      return;
    }
    if (customerDetails.data) {
      let billingData = [];

      customerDetails.data.billingHistory.forEach((history) => {
        history.items.forEach((item) => {
          let val = [];
          val.push({
            value: `${item.procurementName.en.name} (${item.procurementName.ka.name})`,
          });
          val.push({
            value: new Date(history.billedDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          });
          val.push({ value: item.quantity });
          billingData.push(val);
        });
      });

      const customerCart = await getCustomerCart(customerDetails.data._id);

      if (customerCart.data) {
        let cartRows = [];
        customerCart.data.items.forEach((item) => {
          cartRows.push({
            id: new Date().toISOString() + Math.random(),
            procurementId: item.procurementId,
            procurementLabel: `${item.procurementName.en.name}(${item.procurementName.ka.name}) `,
            variants: [
              {
                label: `${item.variant.en.name}(${item.variant.ka.name})`,
                value: item.variant.variantId,
                maxPrice: item.mrp,
                minPrice: item.mrp,
              },
            ],
            variantId: item.variant.variantId,
            variantLabel: `${item.variant.en.name}(${item.variant.ka.name})`,
            mrp: item.mrp,
            price: item.rate,
            quantity: item.quantity,
            minPrice: item.minPrice,
          });
        });

        if (cartRows.length === 0) {
          setTableRowData([tableRowBlank]);
        } else {
          setTableRowData(cartRows);
        }

        setState((prev) => ({
          ...prev,
          cartResponse: customerCart.data,
          customerDetails: customerDetails.data,
          billingHistory: [...billingData],
          nameDisabled: true,
          showDOB: false,
          newCustomer: false,
          checkOutDone: false,
          roundOff: 0,
        }));
        return;
      }
      setTableRowData([tableRowBlank]);
      setState((prev) => ({
        ...prev,
        customerDetails: customerDetails.data,
        billingHistory: [...billingData],
        nameDisabled: true,
        showDOB: false,
        newCustomer: false,
        roundOff: 0,
        checkOutDone: false,
        cartResponse: {},
      }));
    } else {
      setTableRowData([tableRowBlank]);
      setState((prev) => ({
        ...prev,
        customerDetails: {},
        billingHistory: [],
        nameDisabled: false,
        showDOB: true,
        newCustomer: true,
        roundOff: 0,
        checkOutDone: false,
        cartResponse: {},
      }));
    }
  };

  useEffect(() => {
    if (state.customerNumber.length === 10) {
      fetchCustomerInfo();
    }
  }, [state.customerNumber]);

  const tableInputChange = (value, name, index) => {
    let tableDataClone = [...tableRowData];
    let tableRowClone = { ...tableDataClone[index] };

    setState((prev) => ({
      ...prev,
      checkOutDone: false,
    }));
    if (name === "procurementId") {
      tableRowClone.procurementId = value.value;
      tableRowClone.procurementLabel = `${value.meta.names.en.name} (${value.meta.names.ka.name})`;
      let tempVariant = [];
      value.meta.variants.forEach((el) => {
        tempVariant.push({
          label: `${el.names.en.name} (${el.names.ka.name})`,
          value: el._id,
          maxPrice: el.maxPrice,
          minPrice: el.minPrice,
        });
      });
      tableRowClone.variants = tempVariant;
      /**Reset on plant selection */
      tableRowClone.variantId = "";
      tableRowClone.variantLabel = "";
      tableRowClone.mrp = 0;
      tableRowClone.minPrice = 0;
      tableRowClone.price = 0;
      tableRowClone.quantity = 1;
    }

    if (name === "variantId") {
      tableRowClone.variantId = value.value;
      tableRowClone.variantLabel = value.label;
      tableRowClone.mrp = value.maxPrice;
      tableRowClone.minPrice = value.minPrice;
      tableRowClone.price = value.maxPrice;
    }

    if (name === "price") tableRowClone.price = value;

    if (name === "quantity") tableRowClone.quantity = value;

    tableDataClone[index] = tableRowClone;
    setTableRowData(tableDataClone);
  };

  const onBlur = (e, name, index) => {
    let tableDataClone = [...tableRowData];
    let tableRowClone = { ...tableDataClone[index] };
    const { value } = e.target;
    setState((prev) => ({
      ...prev,
      checkOutDone: false,
    }));

    if (name === "price") {
      if (value < tableRowClone.minPrice) {
        setState((prev) => ({
          ...prev,
          priceError: {
            error: "Price can not be less then minimum price",
            isExist: true,
          },
        }));
        tableRowClone.price = tableRowClone.mrp;
        tableDataClone[index] = tableRowClone;
        setTableRowData(tableDataClone);
        return;
      }

      if (value > tableRowClone.mrp) {
        setState((prev) => ({
          ...prev,
          priceError: {
            error: "Price can not be greater then maximum price",
            isExist: true,
          },
        }));
        tableRowClone.price = tableRowClone.mrp;
        tableDataClone[index] = tableRowClone;
        setTableRowData(tableDataClone);
        return;
      }

      setState((prev) => ({
        ...prev,
        priceError: { error: "", isExist: false },
      }));
    }

    if (name === "quantity" && value <= 0) {
      tableRowClone.quantity = 1;
      tableDataClone[index] = tableRowClone;
      setTableRowData(tableDataClone);
      setState((prev) => ({
        ...prev,
        priceError: { error: "Quantity should be minimum 1", isExist: true },
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      priceError: { error: "", isExist: false },
    }));
  };

  const handleCheckout = async () => {
    const items = [];

    tableRowData.forEach((el) => {
      const { procurementId, variantId, quantity, price } = el;
      items.push({ procurementId, variantId, quantity, price });
    });

    const cartPayload = {
      customerNumber: state.newCustomer
        ? `${state.customerNumber}`
        : `${state.customerDetails.phoneNumber}`,
      customerName: state.newCustomer
        ? state.customerName
        : state.customerDetails.name,
      customerDob: state.newCustomer
        ? state.dateOfBirth
        : state.customerDetails.dob,
      ...(!state.newCustomer && { customerId: state.customerDetails._id }),
      items,
    };

    let checkout = null;

    if (state.cartResponse._id) {
      const payload = { items: items };
      checkout = await updateCart({
        cartId: state.cartResponse._id,
        updatedCartData: payload,
      });
    } else {
      checkout = await checkoutCart(cartPayload);
    }

    if (checkout.error) {
      setState((prev) => ({
        ...prev,
        priceError: { isExist: true, error: checkout.error.data.error },
      }));
    }

    if (checkout.data) {
      if (!state.customerDetails.name) {
        setState((prev) => ({
          ...prev,
          customerDetails: {
            name: checkout.data.customerName,
            phoneNumber: checkout.data.customerNumber,
          },
        }));
      }
      setState((prev) => ({
        ...prev,
        cartResponse: checkout.data,
        priceError: { isExist: false, error: "" },
        checkoutSuccess: { isExist: true, msg: "Checkout is successful" },
        checkOutDone: true,
      }));
      toast.success("Checkout is successful!");
    }
  };

  const handleReset = () => {
    setTableRowData([tableRowBlank]);
    setState(initialState);
    setShowPreview(false);
  };

  const handleSubmit = async () => {
    const payload = {
      roundOff: state.roundOff,
    };

    const confirmCart = await submitCart({
      cartId: state.cartResponse._id,
      cartRoundOff: payload,
    });

    if (confirmCart.error) {
      setState((prev) => ({
        ...prev,
        submitError: { isExist: true, error: confirmCart.error.data.error },
      }));
      toast.error(confirmCart.error.data.error)
    }

    if (confirmCart.data) {
      setState((prev) => ({
        ...prev,
        submitResponse: confirmCart.data,
        submitError: { isExist: false, error: "" },
        submitSuccess: { isExist: true, msg: "Billing is successful" },
      }));

      // added this set timeout because print is being called before the state is updated so, to add some delay...
      setTimeout(() => {
        handlePrint();
      }, 1000);
      // toast.success("Billing is successful!");
      // handleReset();
    }
  };

  const handleRoundOff = (e) => {
    if (e > 0) return toast.error("Round Off Should not be less than 0");

    if (!state.cartResponse) {
      return;
    }

    let roundOff = e.target.value;
    const roundOffLimit = Math.min(500, state.cartResponse.totalPrice * 0.1);

    const correctValue = roundOff <= roundOffLimit;

    if (!correctValue) {
      setState((prev) => ({
        ...prev,
        submitError: {
          isExist: true,
          error: `Round Off limit exceeded`,
        },
      }));
    } else {
      setState((prev) => ({
        ...prev,
        submitError: { isExist: false, error: `` },
      }));
    }
  };

  const handleRoundOffValue = (e) => {
    handleRoundOff(e);
    setState((prev) => ({ ...prev, roundOff: e.target.value }));
  };

  const isRowValid = (row) => {
    const price = row.price >= row.minPrice && row.price <= row.mrp;

    if (row.procurementId && row.variantId && price && row.quantity >= 1) {
      return true;
    }
    return false;
  };

  const isTableValid = () => {
    let output = true;

    for (let i = 0; i < tableRowData.length; i++) {
      if (!isRowValid(tableRowData[i])) {
        output = false;
        break;
      }
    }

    return output;
  };

  const shouldCheckoutDisable = () => {
    if (
      state.errorFields.length > 0 ||
      !isTableValid() ||
      tableRowData.length === 0
    ) {
      return true;
    }

    return false;
  };

  const shouldSubmitDisable = () => {
    if (state.checkOutDone && !state.submitError.isExist) {
      return shouldCheckoutDisable();
    }
    return true;
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast.success("Invoice Print Success");
      handleReset();
    },
  });

  const today = new Date();

  const name =
    state.customerDetails && state.customerDetails.name
      ? state.customerDetails.name
      : state.customerName;

  return (
    <div className={styles.addBillsWrapper}>
      <Toaster />
      <div>
        <BackButton navigateTo={"/authorised/dashboard"} />
      </div>

      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>Generate Bill</h1>
      </div>

      <div className={styles.billWrapper}>
        <div className={styles.billGenerator}>
          <div className={styles.customerDetails}>
            <h3 style={{ paddingLeft: "10px" }}>Customer Details</h3>
            <div className={styles.formWrapper}>
              <>
                <Input
                  value={state.customerNumber}
                  id="customerNumber"
                  type="number"
                  errorMessage="Invalid Customer Number"
                  required
                  validation={(number) => number.length === 10}
                  onChange={inputChangeHanlder}
                  onError={onError}
                  title="Customer Number:"
                />
                <Input
                  value={name}
                  id="customerName"
                  type="text"
                  title="Customer Name:"
                  onChange={inputChangeHanlder}
                  disabled={state.nameDisabled}
                />
              </>
              <>
                {state.showDOB && (
                  <DatePicker
                    defaultValue={defaultDate}
                    placeholder="dd-mm-yyyy"
                    label="Date Of Birth"
                    inputFormat="DD/MM/YYYY"
                    labelFormat="MMMM - YYYY"
                    size="sm"
                    withAsterisk={false}
                    value={state.dateOfBirth}
                    onChange={dateChangeHandler}
                    clearable={false}
                    maxDate={new Date(today.setDate(today.getDate() - 1))}
                    styles={{
                      label: {
                        fontSize: "18px",
                        marginBottom: "2px",
                        fontFamily: "sans-serif",
                        fontWeight: 500,
                      },
                      input: {
                        border: "none",
                        borderBottom: "1.5px solid black",
                        borderRadius: 0,
                        fontSize: "18px",
                        fontWeight: 400,
                      },
                    }}
                  />
                )}
              </>
            </div>
          </div>
          <div className={styles.itemList}>
            <div className={styles.itemTitleWrap}>
              <h3>Items List</h3>
              <button
                className={styles.iconButton}
                disabled={!isTableValid()}
                onClick={handleAddItem}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div>
              <div className={styles.cartTableContainer}>
                <table className={styles.cartTable}>
                  <CartTableHeader />
                  <tbody>
                    {tableRowData.map((el, index) => {
                      return (
                        <CartTableRow
                          key={el.id}
                          item={el}
                          handleRemoveItem={() => handleRemoveItem(index)}
                          onInputChange={(value, name) =>
                            tableInputChange(value, name, index)
                          }
                          onBlur={(e, name) => onBlur(e, name, index)}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className={styles.checkOutWrapper}>
                <div>
                  {state.priceError.isExist && (
                    <div className={styles.error}>{state.priceError.error}</div>
                  )}
                </div>
                <Button
                  type="primary"
                  title="Checkout"
                  buttonType="submit"
                  onClick={handleCheckout}
                  disabled={shouldCheckoutDisable()}
                  loading={checkOutLoading}
                />
              </div>
            </div>
          </div>
          <div className={styles.finalSubmissionMobile}>
            <BillDetails
              roundOff={state.roundOff}
              cartResponse={state.cartResponse}
              onRoundOff={handleRoundOffValue}
              onBlur={(e) => handleRoundOff(e)}
            />
            <div className={styles.submitWrapper}>
              <div>
                {state.submitError.isExist && (
                  <div className={styles.error}>{state.submitError.error}</div>
                )}
              </div>

              {userCtx.role === "sales" && (
                <div className={styles.submitBtnWrapper}>
                  <Button
                    type="primary"
                    title="Preview Invoice"
                    buttonType="submit"
                    onClick={() => {
                      setShowPreview(!showPreview);
                    }}
                    disabled={shouldSubmitDisable()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.billHistory}>
          <ScrollTable
            thead={billingHistoryHeader}
            tbody={state.billingHistory}
          />
        </div>
      </div>

      <div className={styles.finalSubmission}>
        <BillDetails
          roundOff={state.roundOff}
          cartResponse={state.cartResponse}
          onRoundOff={handleRoundOffValue}
          onBlur={(e) => handleRoundOff(e)}
        />
        <div className={styles.submitWrapper}>
          <div>
            {state.submitError.isExist && (
              <div className={styles.error}>{state.submitError.error}</div>
            )}
          </div>

          {userCtx.role === "sales" && (
            <div className={styles.submitBtnWrapper}>
              <Button
                type="primary"
                title="Preview Invoice"
                buttonType="submit"
                onClick={() => setShowPreview(!showPreview)}
                disabled={shouldSubmitDisable()}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoiceSection
            clientDetails={state.customerDetails}
            cartData={tableRowData}
            cartResponse={state.cartResponse}
            invoiceNumber={state?.submitResponse?.invoiceId}
            printEnabled={printEnabled}
            roundOff={state.roundOff}
            data={state}
            billedBy={auth.name}
          />
        </div>
      </div>

      <InvoicePreview
        showPreview={showPreview}
        onClose={() => setShowPreview(!showPreview)}
        clientDetails={state.customerDetails}
        cartData={tableRowData}
        cartResponse={state?.cartResponse}
        invoiceNumber={state?.submitResponse?.invoiceId}
        roundOff={state.roundOff}
        handlePrintClick={handleSubmit}
        billedBy={auth.name}
      >
        {/* <Button
          type="primary"
          title="Submit"
          buttonType="submit"
          onClick={handleSubmit}
          disabled={shouldSubmitDisable()}
          loading={submitLoading}
        /> */}
      </InvoicePreview>
    </div>
  );
}

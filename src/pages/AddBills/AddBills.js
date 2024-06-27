import React, { useState, useEffect, useRef, useContext } from "react";

import { Input, Button, Toaster, BackButton, Checkbox } from "../../components";
import styles from "./AddBills.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import Datepicker from "../../components/Datepicker/Datepicker";
import { createBlobURL, downloadFile } from "../../services/helper";
export default function AddBills() {
  const [userCtx, setContext] = useContext(AuthContext);
  const approveRef = useRef();

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

  const defaultDate = new Date(1960, 0, 1);

  const initialState = {
    customerNumber: "",
    customerDetails: {},
    customerName: "",
    customerAddress: "",
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
    isWholeSale: false,
    isPamphletDataNeededInBill: false,
    isApproved: false,
    paymentType: "",
    paymentInfo: "",
    cashAmount: null,
    onlineAmount: null,
  };
  const [tableRowData, setTableRowData] = useState([tableRowBlank]);
  const [state, setState] = useState(initialState);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Nursery")
  const [pamphlet, setPamphlet] = useState([]);
  const [pamphletData, setPamphletData] = useState(null);
  const [selectedPamphlet, setSelectedPamphlet] = useState([]);

  const printRef = useRef();
  // const invoiceRef = useRef();
  const blobUrl = useRef();
  const printEnabled = true;

  const [getCustomerByPhone] = useLazyGetCustomerByPhoneQuery();
  const [checkoutCart, { isLoading: checkOutLoading }] =
    useCheckoutCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const [submitCart, { isLoading: submitLoading }] = useSubmitCartMutation();
  

  const [getCustomerCart] = useLazyGetCustomerCartQuery();

  const [auth] = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setButtonDisabled] = useState(false);
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
          // console.log("item", item?.procurementName?.ka?.name)
          let val = [];
          val.push({
            value: `${item.procurementName.en.name} (${
              item?.procurementName?.ka?.name || ""
            })`,
            type:
              item?.procurementName?.ka?.name === undefined
                ? "Agri"
                : "Nurssery",
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
            procurementLabel: `${item.procurementName.en.name}(${item?.procurementName?.ka?.name || ""
              }) `,
            variants: [
              {
                label: `${item.variant.en.name}(${item?.variant?.ka?.name || ""
                  })`,
                value: item.variant.variantId,
                maxPrice: item.mrp,
                minPrice: item.mrp,
              },
            ],
            variantId: item.variant.variantId,
            variantLabel: `${item.variant.en.name}(${item?.variant?.ka?.name || ""
              })`,
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
        if (customerCart.data.isApproved && approveRef.current) {
          clearInterval(approveRef.current);
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
          // roundOff: 0,
          isApproved: customerCart.data.isApproved,
          isWholeSale: customerCart.data.isWholeSale || false,
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

    setPamphlet((pre) => {
      if (value?.meta?.pamphlet) return [...pre, value?.meta?.pamphlet];
      return pre;
    });

    console.log("value", value?.meta);

    setState((prev) => ({
      ...prev,
      checkOutDone: false,
    }));
    if (name === "procurementId") {
      tableRowClone.procurementId = value.value;
      tableRowClone.procurementLabel = `${value.meta.names.en.name} (${value?.meta?.names?.ka?.name || ""
        })`;
      let tempVariant = [];
      value.meta.variants.forEach((el) => {
        tempVariant.push({
          label: `${el.names.en.name} (${el?.names?.ka?.name || ""})`,
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
      if (value < tableRowClone.minPrice && !state.isWholeSale) {
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

  const handlePamphletDownload = async (e, index) => {
    try {
      if (e) {
        setSelectedPamphlet((pre) => {
          return [...pre, pamphlet[index]];
        });
      } else
        setSelectedPamphlet((pre) => {
          return pre.filter((el) => el !== pamphlet[index]);
        });
    } catch (error) {
      console.log("error", error);
      toast.error("Error in downloading pamphlet");
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setButtonDisabled(true);
    const items = [];

    tableRowData.forEach((el, index) => {
      const { procurementId, variantId, quantity, price } = el;

      const infoSheetFileName = selectedPamphlet[index]?.split("phamphlet-")[1];

      items.push({
        procurementId,
        variantId,
        quantity,
        price,
        isInfoSheet: infoSheetFileName?.includes(procurementId) || false,
      });
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
      isWholeSale: state.isWholeSale,
    };

    let checkout = null;

    if (state.cartResponse._id) {
      const payload = { items: items, isWholeSale: state.isWholeSale };
      checkout = await updateCart({
        cartId: state.cartResponse._id,
        updatedCartData: payload,
      });
    } else {
      checkout = await checkoutCart(cartPayload);
      console.log("checkout cart response", checkout?.data);
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
        isWholeSale: checkout.data.isWholeSale || false,
        isApproved: checkout.data.isApproved,
        paymentType: '',
        paymentInfo: '',
        cashAmount: null,
        onlineAmount: null
      }));
      console.log("checkout.....", checkout.data);
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
      paymentType: state.paymentType,
      paymentInfo: state.paymentInfo,
      cashAmount: state.cashAmount,
      onlineAmount: state.onlineAmount,
    };

    const confirmCart = await submitCart({
      cartId: state.cartResponse._id,
      cartRoundOff: payload,
    });

    if (confirmCart.error) {
      setState((prev) => ({
        ...prev,
        submitError: { isExist: true, error: confirmCart?.error?.data?.error },
      }));
      toast.error(confirmCart?.error?.data?.error);
    }

    if (confirmCart.data) {
      const pdfUrl = createBlobURL(confirmCart?.data?.infoBuffer?.data);
      setState((prev) => ({
        ...prev,
        submitResponse: confirmCart.data,
        submitError: { isExist: false, error: "" },
        submitSuccess: { isExist: true, msg: "Billing is successful" },
      }));
      blobUrl.current = pdfUrl;

      handlePrint();
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
    const price =
      (row.price >= row.minPrice || state.isWholeSale) && row.price <= row.mrp;

    if (row.procurementId && row.variantId && price && row.quantity >= 1) {
      return true;
    }
    return false;
  };

  const isTableValid = () => {
    let table = true;

    for (let i = 0; i < tableRowData.length; i++) {
      if (!isRowValid(tableRowData[i])) {
        table = false;
        break;
      }
    }


    return { tableValid: table, all: table  }
  };

  const shouldCheckoutDisable = () => {
    if (
      state.errorFields.length > 0 ||
      !isTableValid().all ||
      tableRowData.length === 0
    ) {
      return true;
    }

    return false;
  };

  const shouldSubmitDisable = () => {
    let paymentValidation = true;
    if (state.paymentType === "BOTH") {
      paymentValidation = state.cashAmount && state.onlineAmount;
    } else {
      paymentValidation = Boolean(state.paymentType);
    }
    if (state.checkOutDone && !state.submitError.isExist && paymentValidation) {
      return shouldCheckoutDisable();
    }
    return true;
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onAfterPrint: () => {
      toast.success("Invoice Print Success");
      if (!!selectedPamphlet.length) window.open(blobUrl?.current, "_blank");

      handleReset();
    },
  });

  const today = new Date();

  const name =
    state.customerDetails && state.customerDetails.name
      ? state.customerDetails.name
      : state.customerName;

  const handleKeyPress = async (e) => {
    console.log(e.key);
    if (e.key === "Enter") {
      await handleCheckout();
    } else if (e.key === "Tab") {
      await handleAddItem();
    }
  };

  const formatedBillHistory = (prev) => {
    if (selectedTab === "Agri") {
      const newArray = prev.filter((curr, i) => {
        let pr = curr[0];
        if (pr.type === "Agri") {
          return true;
        } else {
          return false;
        }
      });
      return newArray;
    } else {
      const newArray = prev.filter((curr, i) => {
        let pr = curr[0];
        if (pr.value.substring(pr.value.length - 2) !== "()") {
          return true;
        } else {
          return false;
        }
      });
      return newArray;
    }
  };
  const onPreviewClick = () => {
    setShowPreview(!showPreview);
    if (state.isWholeSale) {
      const int = setInterval(() => {
        console.log("calling api");
        fetchCustomerInfo();
      }, 5000);
      approveRef.current = int;
    }
  };

  const onPreviewClose = () => {
    setShowPreview(!showPreview);
    clearInterval(approveRef.current);
  };

  const handlePaymentMode = (e, total) => {
    let cashAmount = 0;
    let onlineAmount = 0;
    if (e.value === "CASH") {
      cashAmount = total;
    }

    if (e.value === "ONLINE") {
      onlineAmount = total;
    }

    setState((prev) => ({
      ...prev,
      paymentType: e.value,
      cashAmount,
      onlineAmount,
    }));
  };

  const handleInputInfo = (e, id, total) => {
    setState((prev) => ({ ...prev, [id]: e.target.value }));
    if (id === "cashAmount") {
      setState((prev) => ({ ...prev, onlineAmount: total - e.target.value }));
    }
  };

  // console.log("state", state.billingHistory)
  const buttonDisable =
    !state.customerNumber ||
    !name ||
    !state.customerAddress ||
    !state.dateOfBirth;
  return (
    <div className={styles.addBillsWrapper}>
      <Toaster />

      <div className={styles.headerWrapper}>
        <div>
          <BackButton navigateTo={"/authorised/dashboard"} />
        </div>
        <h1 className={styles.header}>Generate Bill</h1>
        <h1
          className={styles.header}
          style={{
            marginRight: "-100px",
          }}
        >
          Purchase History
        </h1>
      </div>

      <div className={styles.billWrapper}>
        <div className={styles.billGenerator}>
          <div className={styles.customerDetails}>
            <h3 style={{ paddingLeft: "10px" }}>Customer Details</h3>
            <div className={styles.formWrapper}>
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
              {state.showDOB && (
                <Input
                  value={state.customerAddress}
                  id="customerAddress"
                  type="text"
                  title="Customer Address:"
                  onChange={inputChangeHanlder}
                  disabled={state.nameDisabled}
                />
              )}

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
                  maxDate={new Date(today.setDate(today.getDate() - 1))}
                  clearable={false}
                  styles={{
                    label: {
                      width: "60%",
                      fontSize: "18px",
                      marginBottom: "2px",
                      fontFamily: "sans-serif",
                      fontWeight: 500,
                    },
                    input: {
                      border: "none",
                      width: "60%",
                      borderBottom: "1.5px solid black",
                      borderRadius: 0,
                      fontSize: "18px",
                      // fontWeight: 400,
                      color: "#332b2b",
                    },
                  }}
                />
              )}
            </div>
          </div>
          <div className={styles.itemList} style={{ paddingLeft: "10px" }}>
            <h3>Select if Wholesaler</h3>
            <Checkbox
              value={state.isWholeSale}
              label={"wholesale"}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  isWholeSale: e,
                  checkOutDone: false,
                }))
              }
            />
          </div>
          <div className={styles.itemList}>
            <div className={styles.itemTitleWrap}>
              <h3>Items List</h3>

              <button
                className={styles.iconButton}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                disabled={!isTableValid().all}
                onClick={handleAddItem}
              >
                <FontAwesomeIcon
                  icon={faPlus}
                  style={{ marginLeft: "0.8px" }}
                />
              </button>
            </div>

            <div>
              <div className={styles.cartTableContainer}>
                <table className={styles.cartTable}>
                  <CartTableHeader />
                  <tbody>
                    {tableRowData.map((el, index) => {
                      return (
                        <tr key={el.id}>
                          <CartTableRow
                            key={el.id}
                            item={el}
                            handleRemoveItem={() => handleRemoveItem(index)}
                            onInputChange={(value, name) =>
                              tableInputChange(value, name, index)
                            }
                            handleKeyPress={handleKeyPress}
                            onBlur={(e, name) => onBlur(e, name, index)}
                          />

                          <td>
                            {pamphlet[index] && (
                              <Checkbox
                                onChange={(e) =>
                                  handlePamphletDownload(e, index)
                                }
                              />
                            )}
                          </td>
                        </tr>
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
              paymentInfo={state.paymentInfo}
              cashAmount={state.cashAmount}
              onlineAmount={state.onlineAmount}
              paymentType={state.paymentType}
              onPaymentChange={handlePaymentMode}
              handleInputInfo={handleInputInfo}
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
                    onClick={onPreviewClick}
                    disabled={shouldSubmitDisable()}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.billHistory} style={{ marginRight: "15px" }}>
          <div className={styles.historyTabContainer}>
            <div className={styles.singleTab}>
              <p
                style={{
                  width: "50%",
                  textAlign: "center",
                  cursor: "pointer",
                  color: "#038819",
                }}
                onClick={() => setSelectedTab("Nursery")}
              >
                Nursery
              </p>
              {selectedTab === "Nursery" && (
                <div
                  style={{
                    height: "4px",
                    width: "50%",
                    borderRadius: "10px",
                    background: "green",
                  }}
                ></div>
              )}
            </div>
            <div className={styles.singleTab}>
              <p
                style={{
                  width: "50%",
                  textAlign: "center",
                  cursor: "pointer",
                  color: "#038819",
                }}
                onClick={() => setSelectedTab("Agri")}
              >
                Agri
              </p>
              {selectedTab === "Agri" && (
                <div
                  style={{
                    height: "4px",
                    width: "50%",
                    borderRadius: "10px",
                    background: "green",
                  }}
                ></div>
              )}
            </div>
          </div>
          <ScrollTable
            thead={billingHistoryHeader}
            tbody={formatedBillHistory(state.billingHistory)}
          />
        </div>
      </div>

      <div className={styles.finalSubmission}>
        <BillDetails
          roundOff={state.roundOff}
          cartResponse={state.cartResponse}
          onRoundOff={handleRoundOffValue}
          onBlur={(e) => handleRoundOff(e)}
          paymentInfo={state.paymentInfo}
          cashAmount={state.cashAmount}
          onlineAmount={state.onlineAmount}
          paymentType={state.paymentType}
          onPaymentChange={handlePaymentMode}
          handleInputInfo={handleInputInfo}
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
                onClick={onPreviewClick}
                disabled={shouldSubmitDisable()}
              />
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <InvoiceSection
            selectedPamphlet={selectedPamphlet}
            clientDetails={state.customerDetails}
            cartData={tableRowData}
            cartResponse={state.cartResponse}
            invoiceNumber={state?.submitResponse?.invoiceId}
            printEnabled={printEnabled}
            roundOff={state.roundOff}
            data={state}
            billedBy={auth.name}
            type="NURSERY"
            isWholeSale={state.isWholeSale}
            paymentType={state.paymentType}
            paymentInfo={state.paymentInfo}
            cashAmount={state.cashAmount}
            onlineAmount={state.onlineAmount}
          />
        </div>
      </div>
      <InvoicePreview
        selectedPamphlet={selectedPamphlet}
        showPreview={showPreview}
        onClose={onPreviewClose}
        pamphletData={pamphletData}
        clientDetails={state.customerDetails}
        cartData={tableRowData}
        cartResponse={state?.cartResponse}
        invoiceNumber={state?.submitResponse?.invoiceId}
        roundOff={state.roundOff}
        handlePrintClick={handleSubmit}
        billedBy={auth.name}
        isWholeSale={state.isWholeSale}
        isApproved={state.isApproved}
        paymentType={state.paymentType}
        paymentInfo={state.paymentInfo}
        cashAmount={state.cashAmount}
        onlineAmount={state.onlineAmount}
        type="NURSERY"
      ></InvoicePreview>
    </div>
  );
}

import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Input,
  Button,
  Toaster,
  BackButton,
  AgriVarinatsAddition,
} from "../../components";
import styles from "./AddBills.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BillDetails, CartTableHeader, CartTableRow } from "./CartTableRow";
import _, { cloneDeep } from "lodash";
import { useLazyGetCustomerByPhoneQuery } from "../../services/customer.service";
import { DatePicker } from "@mantine/dates";
import { toast } from "react-toastify";
import ScrollTable from "../../components/Table/ScrollTable";
import { InvoicePreview, InvoiceSection } from "./InvoicePreview";
import { useReactToPrint } from "react-to-print";
import { AuthContext } from "../../context";
import {
  useCheckoutAgriCartMutation,
  useGetProductDetailsMutation,
  useLazyGetCustomerAgriCartQuery,
  useSubmitAgriCartMutation,
  useUpdateAgriCartMutation,
} from "../../services/agribilling.services";
import AgriBillingItem from "../../components/AgriBillingItem/AgriBillingItem";
export default function AgriAddBills() {
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

  const defaultDate = new Date(1960, 0, 1);

  const initialState = {
    customerNumber: "",
    customerDetails: {},
    customerGst: "",
    shippingAddress:'',
    customerName: "",
    customerAddress:  "",
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
    paymentType: '',
    paymentInfo: '',
    cashAmount: null,
    onlineAmount: null,
    isCustomerUpdate: false,
    lockCustomerFields: false
  };
  const agriBillingAddress = {
    companyName: "Agri Shopee",
    companyAddress: `No.188, Near airport, Santhekadur post, \n Shivamogga - 577222`,
    phoneNumber: "81471-92555",
    email: "agrishopee@gmail.com",
    GSTIN: "29ACCFA0434C1Z0",
  };
  const [tableRowData, setTableRowData] = useState([tableRowBlank]);
  const [state, setState] = useState(initialState);
  const [showPreview, setShowPreview] = useState(false);
  const [isCheckoutDone, setIsCheckoutDone] = useState(false);
  const printRef = useRef();
  // const invoiceRef = useRef();
  const printEnabled = true;
  const [selectedTab,setSelectedTab] = useState("Agri")

  const [getCustomerByPhone] = useLazyGetCustomerByPhoneQuery();
  const [checkoutCart, { isLoading: checkOutLoading }] =
    useCheckoutAgriCartMutation();
  const [updateCart] = useUpdateAgriCartMutation();
  const [submitCart, { isLoading: submitLoading }] =
    useSubmitAgriCartMutation();
  const [getCustomerCart] = useLazyGetCustomerAgriCartQuery();
  const [getProductDetail, { isLoading: getProductLoading }] =
    useGetProductDetailsMutation();
  const [auth] = useContext(AuthContext);

  // cart data
  const initialCartState = {
    variants: [
      {
        type: {},
        name: {},
        options: [],
        totalQuantity: 0,
        price: 0,
        isTouched: false,
        isFetched: false,
      },
    ],
  };
  const [cartData, setCartData] = useState(initialCartState);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  const updateCartItems=async()=>{
    if (!needsUpdate) return;
    if (isCheckoutDone) setIsCheckoutDone(false);

    const cartItems = cartData.variants;
    const updatedItems = [];

    for(let i=0; i< cartItems.length; i++) {
      const item = cartItems[i]
      if (
        item.options.length > 0 &&
        item?.options.every((opt) => !!opt.value)
      ) {
        // fetch price here

        if (item.isTouched && !item.isFetched) {
          const productData = {
            variant: item.options.map((option) => ({
              optionName: option.optionName,
              optionValue: option.value.label,
            })),
            name: item.name.label,
            type: item.type.label,
          };
          const productDetail = await getProductDetail({ productData });

          item.isFetched = true;
          item.isTouched = false;

          if (productDetail.error) {
            setState((prev) => ({
              ...prev,
              priceError: { isExist: true, error: "Product Search Not Found!" },
              errorFields: ["Invalid Product Details"],
            }));
            return;
          }
          if (!productDetail.data) {
            setState((prev) => ({
              ...prev,
              priceError: { isExist: true, error: "Product Search Not Found!" },
              errorFields: ["Invalid Product Details"],
            }));
            return;
          }
          if (state.priceError.isExist) {
            setState((prev) => ({
              ...prev,
              priceError: { isExist: false, error: "" },
              errorFields: [],
            }));
          }
          item.price = productDetail?.data?.maxPrice || 0;
          item.minPrice = productDetail?.data?.minPrice || 0;

          item.procurementId = productDetail?.data?._id || "";

          item.remainingQuantity = productDetail?.data?.remainingQuantity || 0;

          const data = { ...item, ...productDetail.data };
          updatedItems.push(data);
        }
      } else {
        updatedItems.push(item);
      }
    };
    if (updatedItems.length === cartItems.length) {
        setCartData((prev) => ({ ...prev, variants: cloneDeep([...updatedItems]) }));
        setNeedsUpdate(false);
    }
  }
  useEffect(() => {
    updateCartItems()
  }, [JSON.stringify(cartData), needsUpdate]);

  const inputChangeHanlder = (event, id) => {
    const isCustomerFeilds = ["customerAddress", "customerGst", "shippingAddress"].includes(id)
    setState((prev) => {
      return {
        ...prev,
        [id]: event.target.value,
      };
    });
    if(isCustomerFeilds){
      setState((prev) => {
        return {
          ...prev,
          isCustomerUpdate: isCustomerFeilds,
        };
      });
    }
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

  const formatCartData = (data) => {
    let newData = data.map((item) => {
      let temp = {};
      temp.type = { label: item.type, value: item.type };
      temp.name = { label: item.typeName, value: "649a64a1ab65b0e736013c32" }; // Assuming value is static
      temp.options = item.variant.map((variant) => {
        temp[variant.optionName] = {
          label: variant.optionValue,
          value: variant.optionValue,
        };
        return {
          optionName: variant.optionName,
          value: { label: variant.optionValue, value: variant.optionValue },
        };
      });
      temp.totalQuantity = item.quantity; // Assuming this value is static
      temp.price = item.mrp;
      temp.isTouched = false;
      temp.isFetched = false;
      temp.minPrice = item.mrp; // Assuming this value is static
      temp.procurementId = item.procurementId;
      temp.remainingQuantity = item.quantity; // Assuming this value is static
      return temp;
    });
    return newData;
  };

  const fetchCustomerInfo = async (isCheckout=false) => {
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
          if (item.procurementName?.ka?.name) {
            val.push({
              value: `${item.procurementName.en.name} (${item.procurementName.ka.name})`,
              type : "Nursery"
            });
          } else {
            val.push({
              value: `${item.procurementName.en.name}`,
              type:  "Agri"
            });
          }

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

      setState((prev) => ({
        ...prev,
        customerDetails: customerDetails.data,
        customerName: customerDetails.name,
        customerGst: customerDetails.data?.gst,
        customerAddress: customerDetails.data?.address,
        shippingAddress: customerDetails.data?.shippingAddress,
        billingHistory: [...billingData],
      }));

      const customerCart = await getCustomerCart(customerDetails.data._id);

      if (customerCart.data) {
        if (customerCart.data.items.length > 0) {
          const data = formatCartData(customerCart.data.items);
          setCartData((prev) => ({ ...prev, variants: data }));
          setState((prev) => ({
            ...prev,
            cartResponse: customerCart.data,
            customerDetails: customerDetails.data,
            nameDisabled: true,
            showDOB: false,
            newCustomer: false,
            checkOutDone: isCheckout,
            roundOff: 0,
            customerName: customerDetails.name,
          }));
          return;
        } else {
          setCartData((prev) => ({ ...prev, variants: [] }));

          setState((prev) => ({
            ...prev,
            customerDetails: customerDetails.data,
            nameDisabled: true,
            showDOB: false,
            newCustomer: false,
            roundOff: 0,
            checkOutDone: isCheckout,
            cartResponse: {},
          }));
        }
      }
    } else {
      // setTableRowData([tableRowBlank]);
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
      fetchCustomerInfo(false);
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

  const formatedBillHistory = (prev) => {
      const newArray = prev.filter((curr, i) => {
        let pr = curr[0];
        if(pr.type=== selectedTab){
        return true; 
        }else {
          return false;
        }
      })
      return newArray;
  }

  const handleCheckout = async () => {
    const items = [];

    console.log(cartData);
    cartData.variants.forEach((el) => {
      const { procurementId, totalQuantity, price } = el;
      items.push({
        procurementId,
        quantity: parseInt(totalQuantity),
        price,
      });
    });

    console.log(items);
    // return;
    console.log(state.customerDetails, state.newCustomer)
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
      customerAddress: state.isCustomerUpdate ? state.customerAddress : state.customerDetails.address,
      shippingAddress: state.isCustomerUpdate ? state.shippingAddress : state.customerDetails.shippingAddress,
      customerGst: state.isCustomerUpdate ? state.customerGst : state.customerDetails.gst,
      isCustomerUpdate: state.isCustomerUpdate,
      items,
    };

    let checkout = null;

    if (state.cartResponse._id) {
      const payload = { 
        items: items , 
        customerAddress: state.isCustomerUpdate ? state.customerAddress : state.customerDetails.address,
        shippingAddress: state.isCustomerUpdate ? state.shippingAddress : state.customerDetails.shippingAddress,
        customerGst: state.isCustomerUpdate ? state.customerGst : state.customerDetails.gst,
        isCustomerUpdate: state.isCustomerUpdate,};
      checkout = await updateCart({
        cartId: state.cartResponse._id,
        updatedCartData: payload,
      });
    } else {
      checkout = await checkoutCart(cartPayload);
    }
    await fetchCustomerInfo(true)


    if (!checkout) {
      return toast.error("Error Checkout");
    }
    if (checkout.error) {
      if (!checkout.error.data) return toast.error("Error Checkout");
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
        lockCustomerFields: true
      }));
      toast.success("Checkout is successful!");
      setIsCheckoutDone(true);
    }
  };

  const handleReset = () => {
    setTableRowData([tableRowBlank]);
    setCartData({ variants: [] });
    setState(initialState);
    setShowPreview(false);
  };

  const handleSubmit = async () => {
    const payload = {
      roundOff: state.roundOff,
      paymentType: state.paymentType,
      paymentInfo: state.paymentInfo,
      cashAmount: state.cashAmount,
      onlineAmount: state.onlineAmount
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
      toast.error(confirmCart.error.data.error);
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

    const roundOffLimit = 1

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

  const shouldCheckoutDisable = () => {
    if (
      state.errorFields.length < 0 ||
      cartData.variants.some(
        (ele) => !ele.totalQuantity || ele.totalQuantity <= 0
      ) ||
      cartData.variants.length <= 0
    ) {
      return true;
    }

    return false;
  };

  const shouldSubmitDisable = () => {
    let paymentValidation = true
    if(state.paymentType=== 'BOTH'){
      paymentValidation =  state.cashAmount && state.onlineAmount
    }else {
      paymentValidation = Boolean(state.paymentType)
    }
    if (state.checkOutDone && !state.submitError.isExist && isCheckoutDone && paymentValidation) {
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

  const handlePaymentMode =(e, total)=>{
    let cashAmount =0
    let onlineAmount=0
    if(e.value==='CASH'){
      cashAmount = total
    }

    if(e.value==='ONLINE'){
      onlineAmount = total
    }

    setState((prev)=>({...prev, paymentType:e.value, cashAmount, onlineAmount}))
  }

  const handleInputInfo =(e, id, total)=>{
    setState((prev)=>({...prev, [id]:e.target.value}))
    if(id==='cashAmount'){
      setState((prev)=>({...prev, onlineAmount:total - e.target.value}))
    }
  }

  const today = new Date();

  const name =
    state.customerDetails && state.customerDetails.name
      ? state.customerDetails.name
      : state.customerName;

  return (
    <div className={styles.addBillsWrapper}>
      <Toaster />
     <div style={{
        display : "flex",
        alignItems : "center",
        justifyContent : "space-between",
        width : "80%",
     }}>
        <div style={{
          display : "flex",
          alignSelf: "flex-end",
          marginTop : "3%",
        }}>
        <BackButton navigateTo={"/authorised/dashboard"} tabType="AGRI" />
        </div>
        <h1 className={styles.header}>Generate Bill</h1>
        <h1 className={styles.header} style={{
          marginRight : "-100px"
        }}>Purchase History</h1>
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
                  <Input
                  value={state.customerAddress}
                  id="customerAddress"
                  type="text"
                  title="Customer Address:"
                  onChange={inputChangeHanlder}
                  disabled={state.lockCustomerFields}
                />
                
                  <Input
                  value={state.shippingAddress}
                  id="shippingAddress"
                  type="text"
                  title="Shipping Address:"
                  onChange={inputChangeHanlder}
                  disabled={state.lockCustomerFields}
                />
                
                  <Input
                  value={state.customerGst}
                  id="customerGst"
                  type="text"
                  title="GST number"
                  onChange={inputChangeHanlder}
                  disabled={state.lockCustomerFields}
                />
                
              
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
              
            </div>
          </div>
          <div className={styles.itemList}>
            {/* <div className={styles.itemTitleWrap}>
              <h3>Items List</h3>
              <button
                className={styles.iconButton}
                disabled={!isTableValid()}
                onClick={handleAddItem}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div> */}
            <div >
              <div className={styles.agriAddBillWrapper}>
                <AgriBillingItem
                  placeOrder={true}
                  onChange={(e) => {
                    setNeedsUpdate(true);
                  }}
                  allowNew={true}
                  // value={cartData}
                  // isFormValid={(e) => setIsFormValid(!e)}
                  setIsVariantAdded={(e) => console.log(e)}
                  state={cartData}
                  setState={setCartData}
                />
              </div>

              {/* <div className={styles.cartTableContainer}>
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
              </div> */}
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
                  disabled={
                    cartData.variants.some(
                      (ele) => !ele.totalQuantity || ele.totalQuantity <= 0
                    ) ||
                    cartData.variants.length === 0 ||
                    state.errorFields.length > 0
                  }
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
        <div className={styles.billHistory} style={{marginRight : "10px"}}>
        <div className={styles.historyTabContainer}>
              <div className={styles.singleTab}>
               <p style={{
                     width : "50%",
                     textAlign : "center",
                     cursor : "pointer"
                }} onClick={() => setSelectedTab("Agri")}>
                  Agri
                </p>
                {
                  selectedTab === "Agri" && (
                    <div style={{
                  height : "4px",
                  width : "50%",
                  borderRadius : "10px",
                  background : "green"
                }}></div>
                  )
                }
              </div>
              <div className={styles.singleTab}>
                 <p style={{
                     width : "50%",
                     textAlign : "center",
                     cursor : "pointer"
                }}
                  onClick={() => setSelectedTab("Nursery")}>
                  Nursery
                </p>
              {
                selectedTab === "Nursery" && (
                  <div style={{
                  height : "4px",
                  width : "50%",
                  borderRadius : "10px",
                  background : "green"
                }}></div>
                )
              }
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
          paymentType={state.paymentType}
          onPaymentChange={handlePaymentMode}
          cashAmount={state.cashAmount}
          onlineAmount={state.onlineAmount}
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
            billAddress={agriBillingAddress}
            type="AGRI"
            clientDetails={state.customerDetails}
            cartData={state?.cartResponse?.items || []}
            cartResponse={state.cartResponse}
            invoiceNumber={state?.submitResponse?.invoiceId}
            printEnabled={printEnabled}
            roundOff={state.roundOff}
            data={state}
            billedBy={auth.name}
            paymentType={state.paymentType}
            paymentInfo={state.paymentInfo}
            cashAmount={state.cashAmount}
            onlineAmount={state.onlineAmount}
          />
        </div>
      </div>

      <InvoicePreview
        billAddress={agriBillingAddress}
        type="AGRI"
        showPreview={showPreview}
        onClose={() => setShowPreview(!showPreview)}
        clientDetails={state.customerDetails}
        cartData={state?.cartResponse?.items || []}
        cartResponse={state?.cartResponse}
        invoiceNumber={state?.submitResponse?.invoiceId}
        roundOff={state.roundOff}
        handlePrintClick={handleSubmit}
        billedBy={auth.name}
        paymentType={state.paymentType}
        paymentInfo={state.paymentInfo}
        cashAmount={state.cashAmount}
        onlineAmount={state.onlineAmount}
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

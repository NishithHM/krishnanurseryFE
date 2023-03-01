import React, { useState, useEffect } from 'react'
import { Input, Table, Button, Toaster } from '../../components';
import styles from "./AddBills.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BillDetails, CartTableHeader, CartTableRow } from './CartTableRow';
import _ from "lodash";
import { useLazyGetCustomerByPhoneQuery } from '../../services/customer.service';
import { useCheckoutCartMutation, useSubmitCartMutation, useUpdateCartMutation, useLazyGetCustomerCartQuery } from '../../services/bills.service';
import { DatePicker } from "@mantine/dates";
import { toast } from "react-toastify";

export default function AddBills() {

  const tableRowBlank = {
    id: new Date().toISOString(),
    procurementId: "",
    procurementLabel: "",
    variants: [],
    variantId: "",
    variantLabel: "",
    mrp: 0,
    price: 0,
    quantity: 1,
    minPrice: 0
  }

  const initialState = {
    customerNumber: "",
    customerDetails: {},
    customerName: "",
    nameDisabled: true,
    showDOB: false,
    dateOfBirth: "",
    newCustomer: false,
    billingHistory: [[
      { id: new Date().toISOString(), value: "Item" },
      { value: "Purchase Date" },
      { value: "Quantity" }
    ]],
    errorFields: [],
    priceError: { isExist: false, error: 'Price can not be less then minimum price' },
    checkoutSuccess: { isExist: false, msg: '' },
    cartResponse: {},
    roundOff: 0,
    submitError: { isExist: false, error: '' },
    submitSuccess: { isExist: false, msg: '' }
  };

  const [tableRowData, setTableRowData] = useState([tableRowBlank]);
  const [state, setState] = useState(initialState);


  const [getCustomerByPhone] = useLazyGetCustomerByPhoneQuery();
  const [checkoutCart, { isLoading: checkOutLoading }] = useCheckoutCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const [submitCart, { isLoading: submitLoading }] = useSubmitCartMutation();
  const [getCustomerCart] = useLazyGetCustomerCartQuery();

  const handleAddItem = () => {
    setTableRowData([...tableRowData, tableRowBlank])
  }

  console.log(`checkout loading ==>`, checkOutLoading)

  const handleRemoveItem = (index) => {
    setTableRowData((prev) => (
      //  ...prev.splice(index-1, 1)]
      prev.filter((v, i) => i !== index)
    ));
  }

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
        dateOfBirth: event.value,
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
        errorFields: customerDetails.error
      }))
      return;
    }

    if (customerDetails.data) {

      let billingData = [state.billingHistory[0]];

      customerDetails.data.billingHistory.forEach(history => {
        history.items.forEach((item) => {
          let val = []
          val.push({ value: item.procurementName.en.name })
          val.push({ value: new Date(history.billedDate).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' }) })
          val.push({ value: item.quantity })
          billingData.push(val)
        })
      });

      const customerCart = await getCustomerCart(customerDetails.data._id);

      console.log(`cusomer cart response ==>`, customerCart);


      if (customerCart.data) {
        let cartRows = [];
        customerCart.data.items.forEach((item) => {
          cartRows.push({
            id: new Date().toISOString(),
            procurementId: item.procurementId,
            procurementLabel: item.procurementName.en.name,
            variants: [{ label: item.variant.en.name, value: item.variant.variantId, maxPrice: item.mrp, minPrice: item.mrp }],
            variantId: item.variant.variantId,
            variantLabel: item.variant.en.name,
            mrp: item.mrp,
            price: item.rate,
            quantity: item.quantity,
            minPrice: item.mrp
          })
        })

        setTableRowData(cartRows)

        setState((prev) => ({
          ...prev,
          cartResponse: customerCart.data,
          customerDetails: customerDetails.data,
          billingHistory: [...billingData],
          nameDisabled: true,
          showDOB: false,
          newCustomer: false
        }))
        return;
      }

      setState((prev) => ({
        ...prev,
        customerDetails: customerDetails.data,
        billingHistory: [...billingData],
        nameDisabled: true,
        showDOB: false,
        newCustomer: false
      }))
    } else {
      setState((prev) => ({
        ...prev,
        customerDetails: {},
        billingHistory: [state.billingHistory[0]],
        nameDisabled: false,
        showDOB: true,
        newCustomer: true
      }))
    }
  }

  useEffect(() => {
    if (state.customerNumber.length === 10) {
      fetchCustomerInfo()
    }
  }, [state.customerNumber])

  const tableInputChange = (value, name, index) => {

    let tableDataClone = [...tableRowData];
    let tableRowClone = { ...tableDataClone[index] }

    if (name === 'procurementId') {
      tableRowClone.procurementId = value.value;
      tableRowClone.procurementLabel = value.label;
      let tempVariant = []
      value.meta.variants.forEach((el) => {
        tempVariant.push({ label: el.names.en.name, value: el._id, maxPrice: el.maxPrice, minPrice: el.minPrice });
      })
      tableRowClone.variants = tempVariant
    }

    if (name === 'variantId') {
      tableRowClone.variantId = value.value;
      tableRowClone.variantLabel = value.label;
      tableRowClone.mrp = value.maxPrice;
      tableRowClone.minPrice = value.minPrice;
      tableRowClone.price = value.maxPrice;
    }

    if (name === 'price') tableRowClone.price = value;

    if (name === 'quantity') tableRowClone.quantity = value;

    tableDataClone[index] = tableRowClone;
    setTableRowData(tableDataClone)
  }


  const onBlur = (e, name, index) => {
    let tableDataClone = [...tableRowData];
    let tableRowClone = { ...tableDataClone[index] }
    const { value } = e.target;

    if (name === 'price') {

      if (value < tableRowClone.minPrice) {
        setState((prev) => (
          { ...prev, priceError: { error: 'Price can not be less then minimum price', isExist: true } }
        ))
        tableRowClone.price = tableRowClone.mrp;
        tableDataClone[index] = tableRowClone;
        setTableRowData(tableDataClone)
        return;
      }

      if (value > tableRowClone.mrp) {
        setState((prev) => (
          { ...prev, priceError: { error: 'Price can not be greater then maximum price', isExist: true } }
        ))
        tableRowClone.price = tableRowClone.mrp;
        tableDataClone[index] = tableRowClone;
        setTableRowData(tableDataClone)
        return;
      }

      setState((prev) => (
        { ...prev, priceError: { error: '', isExist: false } }
      ))
    }

    if (name === 'quantity' && value <= 0) {
      tableRowClone.quantity = 1;
      tableDataClone[index] = tableRowClone;
      setTableRowData(tableDataClone)
      setState((prev) => (
        { ...prev, priceError: { error: 'Quantity should be minimum 1', isExist: true } }
      ))
      return;
    }

    setState((prev) => (
      { ...prev, priceError: { error: '', isExist: false } }
    ))
  }

  const handleCheckout = async () => {

    const items = [];

    tableRowData.forEach((el) => {
      const { procurementId, variantId, quantity, price } = el;
      items.push({ procurementId, variantId, quantity, price })
    })

    const cartPayload = {
      customerNumber: state.newCustomer ? `${state.customerNumber}` : `${state.customerDetails.phoneNumber}`,
      customerName: state.newCustomer ? state.customerName : state.customerDetails.name,
      customerDob: state.newCustomer ? state.dateOfBirth : state.customerDetails.dob,
      customerId: state.newCustomer ? `` : state.customerDetails._id,
      items
    }

    let checkout = null;


    if (state.cartResponse._id) {
      const payload = { items: items };
      console.log(`payload ===>`, payload)
      checkout = await updateCart({ cartId: state.cartResponse._id, updatedCartData: payload })
    } else {
      checkout = await checkoutCart(cartPayload);
    }

    if (checkout.error) {
      setState((prev) => ({
        ...prev,
        priceError: { isExist: true, error: checkout.error.data.error }
      }))
    }

    if (checkout.data) {
      console.log('checkout success -=->', checkout.data);
      setState((prev) => ({
        ...prev,
        cartResponse: checkout.data,
        priceError: { isExist: false, error: '' },
        checkoutSuccess: { isExist: true, msg: 'Checkout is successful' }
      }))
      toast.success("Checkout is successful!");
    }
  }

  const handleReset = () => {
    setTableRowData([tableRowBlank])
    setState(initialState)
  }

  const handleSubmit = async () => {
    const payload = {
      roundOff: state.roundOff
    }

    const confirmCart = await submitCart({ cartId: state.cartResponse._id, cartRoundOff: payload });
    console.log(confirmCart)
    if (confirmCart.error) {
      setState((prev) => ({
        ...prev,
        submitError: { isExist: true, error: confirmCart.error.data.error },
      }))
    }

    if (confirmCart.data) {
      setState((prev) => ({
        ...prev,
        submitResponse: confirmCart.data,
        submitError: { isExist: false, error: '' },
        submitSuccess: { isExist: true, msg: 'Billing is successful' }
      }))
      toast.success("Billing is successful!");
      handleReset()
    }
  }

  const handleRoundOff = (e) => {
    if (!state.cartResponse) {
      return;
    }

    let roundOff = e.target.value;
    const roundOffLimit = Math.min(500, state.cartResponse.totalPrice * 0.1);

    const correctValue = roundOff <= roundOffLimit;

    console.log(roundOffLimit, roundOff, correctValue)

    if (!correctValue) {
      setState((prev) => ({ ...prev, submitError: { isExist: true, error: `Round Off value is not correct.` } }))
    } else {
      setState((prev) => ({ ...prev, submitError: { isExist: false, error: `` } }))
    }

  }

  const name = state.customerDetails && state.customerDetails.name ? state.customerDetails.name : state.customerName;

  return (
    <div className={styles.addBillsWrapper}>
      <Toaster />
      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>Generate Bill</h1>
      </div>

      <div className={styles.billWrapper}>
        <div className={styles.billGenerator}>
          <div className={styles.customerDetails}>
            <h3>Customer Details</h3>
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
                {state.showDOB &&
                  <DatePicker
                    placeholder="dd-mm-yyyy"
                    label="Date Of Birth"
                    inputFormat="DD/MM/YYYY"
                    labelFormat="MMMM - YYYY"
                    size="sm"
                    withAsterisk={false}
                    value={state.dateOfBirth}
                    onChange={dateChangeHandler}
                    clearable={false}
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
                }
              </>
            </div>
          </div>
          <div className={styles.itemList}>
            <div className={styles.itemTitleWrap}>
              <h3>Items List</h3>
              <button className={styles.iconButton} onClick={handleAddItem}>
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
            <div>
              <table className={styles.cartTable} >
                <CartTableHeader />
                <tbody>
                  {tableRowData.map((el, index) => {
                    return <CartTableRow
                      key={el.id}
                      item={el}
                      handleRemoveItem={() => handleRemoveItem(index)}
                      onInputChange={(value, name) => tableInputChange(value, name, index)}
                      onBlur={(e, name) => onBlur(e, name, index)}
                    />
                  })}
                </tbody>
              </table>
              <div className={styles.checkOutWrapper}>
                <div>
                  {state.priceError.isExist && <div className={styles.error}>{state.priceError.error}</div>}
                </div>
                <Button
                  type="primary"
                  title="Checkout"
                  buttonType="submit"
                  onClick={handleCheckout}
                  disabled={false}
                  loading={checkOutLoading}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.billHistory}>
          <Table data={state.billingHistory} />
          {state.billingHistory.length === 1 && <div className={styles.noItemToDisplay}>No Items to display</div>}
        </div>
      </div>

      <div className={styles.finalSubmission}>
        <BillDetails
          roundOff={state.roundOff}
          cartResponse={state.cartResponse}
          onRoundOff={(e) => setState((prev) => ({ ...prev, roundOff: e.target.value }))}
          onBlur={(e) => handleRoundOff(e)}
        />
        <div className={styles.submitWrapper}>
          <div>
            {state.submitError.isExist && <div className={styles.error}>{state.submitError.error}</div>}
          </div>
          <Button
            type="primary"
            title="Submit"
            buttonType="submit"
            onClick={handleSubmit}
            disabled={false}
            loading={submitLoading}
          />
        </div>
      </div>
    </div>
  )
}

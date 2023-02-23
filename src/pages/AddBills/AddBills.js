import React, { useState, useEffect } from 'react'
import { Input, Table, Button } from '../../components';
import styles from "./AddBills.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { BillDetails, CartTableHeader, CartTableRow } from './CartTableRow';
import _ from "lodash";
import { useLazyGetCustomerByPhoneQuery } from '../../services/customer.service';
import { useCheckoutCartMutation, useSubmitCartMutation, useUpdateCartMutation } from '../../services/bills.service';

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
    quantity: 0,
    minPrice: 0
  }

  const initialState = {
    customerNumber: "",
    customerDetails: {},
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
  const [checkoutCart] = useCheckoutCartMutation();
  const [updateCart] = useUpdateCartMutation();
  const [submitCart] = useSubmitCartMutation();

  const handleAddItem = () => {
    setTableRowData([...tableRowData, tableRowBlank])
  }

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

      setState((prev) => ({
        ...prev,
        customerDetails: customerDetails.data,
        billingHistory: [...billingData]
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
      value.meta.variants.forEach((el) => {
        tableRowClone.variants.push({ label: el.names.en.name, value: el._id, maxPrice: el.maxPrice, minPrice: el.minPrice });
      })
    }

    if (name === 'variantId') {
      tableRowClone.variantId = value.value;
      tableRowClone.variantLabel = value.label;
      tableRowClone.mrp = value.maxPrice;
      tableRowClone.minPrice = value.minPrice;
    }

    if (name === 'price') tableRowClone.price = value;

    if (name === 'quantity') tableRowClone.quantity = value;

    tableDataClone[index] = tableRowClone;
    setTableRowData(tableDataClone)
  }


  const onBlur = (e, name, index) => {
    let tableDataClone = [...tableRowData];
    let tableRowClone = { ...tableDataClone[index] }

    if (name === 'price' && e.target.value < tableRowClone.minPrice) {
      setState((prev) => (
        { ...prev, priceError: { error: 'Price can not be less then minimum price', isExist: true } }
      ))
      tableRowClone.price = 0;
      tableDataClone[index] = tableRowClone;
      setTableRowData(tableDataClone)
    } else {
      setState((prev) => (
        { ...prev, priceError: { error: 'Price can not be less then minimum price', isExist: false } }
      ))
    }
  }

  const handleCheckout = async () => {

    const items = [];

    tableRowData.forEach((el) => {
      const { procurementId, variantId, quantity, price } = el;
      items.push({ procurementId, variantId, quantity, price })
    })

    const cartPayload = {
      customerNumber: `${state.customerDetails.phoneNumber}`,
      customerName: state.customerDetails.name,
      customerDob: state.customerDetails.dob,
      customerId: state.customerDetails._id,
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

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          checkoutSuccess: { isExist: false, msg: '' }
        }))
      }, 5000)
    }
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

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          submitSuccess: { isExist: false, msg: '' }
        }))
      }, 5000)
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
      setState((prev) => ({ ...prev, submitError: { isExist: true, error: `Round Off value can not be more then 500 or 10% of total value.` } }))
    } else {
      setState((prev) => ({ ...prev, submitError: { isExist: false, error: `` } }))
    }

  }

  const name = state.customerDetails && state.customerDetails.name ? state.customerDetails.name : '';

  return (
    <div className={styles.addBillsWrapper}>
      <div className={styles.headerWrapper}>
        <h1 className={styles.header}>Generate Bill</h1>
      </div>

      <div className={styles.billWrapper}>
        <div className={styles.billGenerator}>
          <div className={styles.customerDetails}>
            <h3>Customer Details</h3>
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
                onChange={() => { }}
                disabled={true}
              />
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
                  {state.checkoutSuccess.isExist && <div className={styles.success}>{state.checkoutSuccess.msg}</div>}
                </div>
                <Button
                  type="primary"
                  title="Checkout"
                  buttonType="submit"
                  onClick={handleCheckout}
                  disabled={false}
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.billHistory}>
          <Table data={state.billingHistory} />
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
            {state.submitSuccess.isExist && <div className={styles.success}>{state.submitSuccess.msg}</div>}
          </div>
          <Button
            type="primary"
            title="Submit"
            buttonType="submit"
            onClick={handleSubmit}
            disabled={false}
          />
        </div>
      </div>
    </div>
  )
}

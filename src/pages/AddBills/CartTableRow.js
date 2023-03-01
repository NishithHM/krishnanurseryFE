import React, { useState } from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Dropdown, Input } from "../../components"
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./AddBills.module.css";

export const CartTableRow = ({ onInputChange, handleRemoveItem, item, onBlur }) => {

  const onChangeHandler = (value, name) => {
    onInputChange(value, name)
  };

  const total = item.price * item.quantity;

  const selectedProcurement = { label: item.procurementLabel, value: item.procurementId };
  const selectedVariant = { label: item.variantLabel, value: item.variantId };


  console.log("selectedProcurement", selectedProcurement)
  console.log("selectedVariant", selectedVariant)
  console.log("item.variants", item.variants)

  const handleSelection = (e) => {
    const option = e.target.childNodes[e.target.selectedIndex].getAttribute('data-json');
    onChangeHandler(JSON.parse(option), 'variantId')
  }

  return (
    <tr>
      <td width={`120px`}>
        <Dropdown
          onChange={(value) => onChangeHandler(value, 'procurementId')}
          value={selectedProcurement}
          url="/api/procurements/getAll"
          // id="procurements"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
          id={`procurement_${item.id}`}
        />
      </td>
      <td>
        <Dropdown
          canCreate={false}
          value={{ label: item.variantLabel, value: item.variantId }}
          data={item.variants}
          // id="variants"
          onChange={(value) => onChangeHandler(value, 'variantId')}
          id={`variant_${item.id}`}
        />
        {/* <select value={item.variantId} onChange={handleSelection} className={styles.selectDropDown}>
          <option value="" data-json="">Select variant</option>
          {item.variants && item.variants.map((option) => (
            <option key={option.value} value={option.value} data-json={JSON.stringify(option)}>{option.label}</option>
          ))}
        </select> */}
      </td>
      <td>
        <div>{Number(item.mrp)}</div>
      </td>
      <td>
        <input
          value={item.price}
          name="price"
          type="number"
          className={styles.cartInput}
          onChange={(e) => onChangeHandler(e.target.value, 'price')}
          onBlur={(e) => onBlur(e, 'price')}
        />
      </td>
      <td>
        <input
          value={item.quantity}
          name="quantity"
          type="number"
          className={styles.cartInput}
          min="1"
          onChange={(e) => onChangeHandler(e.target.value, 'quantity')}
          onBlur={(e) => onBlur(e, 'quantity')} />
      </td>
      <td>
        <div>{isNaN(total) ? '' : total}</div>
      </td>
      <td align="center">
        <button className={styles.iconButton} onClick={handleRemoveItem}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </td>
    </tr>
  )
}

export const CartTableHeader = () => {
  return (
    <thead>
      <tr>
        <th>Plant Name</th>
        <th>Variant</th>
        <th>MRP</th>
        <th>Rate</th>
        <th>Quantity</th>
        <th>Total</th>
        <th>Delete</th>
      </tr>
    </thead>
  )
}

export const BillDetails = ({ roundOff, cartResponse, onRoundOff, onBlur }) => {

  let subTotal = 0;
  if (cartResponse.totalPrice) {
    subTotal = cartResponse?.totalPrice - roundOff;
  }

  return (
    <div className={styles.billDetails}>
      <div className={styles.billFigure}>
        <div>Sub Total</div>
        <span>&#x20B9;{cartResponse?.totalPrice}</span>
      </div>
      <div className={styles.billFigure}>
        <div>Discount</div>
        <span>&#x20B9;{cartResponse?.discount}</span>
      </div>
      <div className={styles.billFigure}>
        <div>Round Off</div>
        <span>&#x20B9;</span>
        <input
          value={roundOff}
          name="roundOff"
          type="number"
          className={styles.cartInput}
          onChange={onRoundOff}
          onBlur={onBlur}
        />
      </div>
      <div className={styles.billFigure}>
        <div>Total</div>
        <span>&#x20B9;{isNaN(subTotal) ? '' : subTotal}</span>
      </div>
    </div>
  )
}
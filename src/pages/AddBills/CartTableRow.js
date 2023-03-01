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

  return (
    <tr>
      <td>
        <Dropdown
          onChange={(value) => onChangeHandler(value, 'procurementId')}
          value={item.dropDownKey}
          url="/api/procurements/getAll"
          id="procurements"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
        />
      </td>
      <td>
        <Dropdown
          canCreate={false}
          value={{label:item.variantLabel, value:item.variantId}}
          data={item.variants}
          id="variants"
          onChange={(value) => onChangeHandler(value, 'variantId')}
        />
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
          onChange={(e) => onChangeHandler(e.target.value, 'quantity')} />
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
        <span>&#x20B9;{isNaN(subTotal) ? '' : subTotal}</span>
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
        <span>&#x20B9;{cartResponse?.totalPrice}</span>
      </div>
    </div>
  )
}
import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown } from "../../components";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./AddBills.module.css";
import { AuthContext } from "../../context";

export const CartTableRow = ({
  onInputChange,
  handleRemoveItem,
  item,
  onBlur,
}) => {
  const onChangeHandler = (value, name) => {
    onInputChange(value, name);
  };

  const total = item.price * item.quantity;

  const selectedProcurement = {
    label: item.procurementLabel,
    value: item.procurementId,
  };
  const selectedVariant = { label: item.variantLabel, value: item.variantId };

  return (
    <tr>
      <td>
        <Dropdown
          onChange={(value) => onChangeHandler(value, "procurementId")}
          value={selectedProcurement}
          url="/api/procurements/getAll"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
          id={`procurement_${item.id}`}
        />
      </td>
      <td>
        <Dropdown
          canCreate={false}
          value={selectedVariant}
          data={item.variants}
          onChange={(value) => onChangeHandler(value, "variantId")}
          id={`variant_${item.id}`}
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
          onChange={(e) => onChangeHandler(e.target.value, "price")}
          onBlur={(e) => onBlur(e, "price")}
        />
      </td>
      <td>
        <input
          value={item.quantity}
          name="quantity"
          type="number"
          className={styles.cartInput}
          min="1"
          onChange={(e) => onChangeHandler(e.target.value, "quantity")}
          onBlur={(e) => onBlur(e, "quantity")}
        />
      </td>
      <td>
        <div>{isNaN(total) ? "" : total}</div>
      </td>
      <td align="center">
        <button className={styles.iconButton} onClick={handleRemoveItem}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </td>
    </tr>
  );
};

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
  );
};

export const BillDetails = ({ roundOff, cartResponse, onRoundOff, onBlur }) => {
  const [userCtx, setContext] = useContext(AuthContext);

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
      {userCtx.role === "sales" && (
        <div className={styles.billFigure}>
          <div>Round Off</div>
          <span>&#x20B9;</span>
          <input
            // value={}
            name="roundOff"
            type="number"
            className={styles.cartInput}
            // onChange={onRoundOff}
            onBlur={onBlur}
            min="0"
            value={roundOff && Math.max(0, roundOff)}
            onChange={(e) => onRoundOff(e)}
          />
        </div>
      )}
      <div className={styles.billFigure}>
        <div>Total</div>
        <span>&#x20B9;{isNaN(subTotal) ? "" : subTotal}</span>
      </div>
    </div>
  );
};

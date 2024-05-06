import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dropdown, Input } from "../../components";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import styles from "./AddBills.module.css";
import { AuthContext } from "../../context";

export const CartTableRow = ({
  onInputChange,
  handleRemoveItem,
  item,
  onBlur,
  handleKeyPress
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
    <>

      <td style={{width : "20%"}}>
        <Dropdown
          onChange={(value) => onChangeHandler(value, "procurementId")}
          value={selectedProcurement}
          url="/api/procurements/getAll"
          apiDataPath={{ label: "names.en.name", value: "_id" }}
          id={`procurement_${item.id}`}
          minInputToFireApi={3}
        />
      </td>
      <td style={{width : "30%"}}>
        <Dropdown
          canCreate={false}
          value={selectedVariant}
          data={item.variants}
          onChange={(value) => onChangeHandler(value, "variantId")}
          id={`variant_${item.id}`}
        />
      </td>
      <td style={{width : "10%"}}>
        <div>{Number(item.mrp)}</div>
      </td>
      <td style={{width : "10%"}}>
        <input
          value={item.price}
          name="price"
          type="number"
          className={styles.cartInput}
          onChange={(e) => onChangeHandler(e.target.value, "price")}
          onBlur={(e) => onBlur(e, "price")}
        />
      </td>
      <td style={{width : "10%"}}>
        <input
          value={item.quantity}
          name="quantity"
          type="number"
          className={styles.cartInput}
          min="1"
          onKeyDown={handleKeyPress}
          onChange={(e) => onChangeHandler(e.target.value, "quantity")}
          onBlur={(e) => onBlur(e, "quantity")}
        />
      </td>
      <td style={{width  : "10%"}}>
        <div>{isNaN(total) ? "" : total}</div>
      </td>
      <td align="center">
        <button className={styles.iconButton} onClick={handleRemoveItem}>
          <FontAwesomeIcon icon={faTrash} />
        </button>
      </td>
    </>
  );
};

export const CartTableHeader = () => {
  return (
    <thead>
      <tr>
        <th>Include Pamphlet</th>
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

export const BillDetails = ({ roundOff, cartResponse, onRoundOff, onBlur, paymentType, onPaymentChange, cashAmount, onlineAmount, handleInputInfo,paymentInfo }) => {
  const [userCtx, setContext] = useContext(AuthContext);

  let subTotal = 0;
  if (cartResponse.totalPrice) {
    subTotal = cartResponse?.totalPrice - roundOff;
  }
  let totalQty = 0;
  if(cartResponse && Array.isArray(cartResponse.items) && cartResponse.items.length > 0){
    totalQty = cartResponse.items.reduce((acc, item) => {
      return acc + item.quantity
    }, totalQty)
    console.log("Total QTY", totalQty)
  }


  return (
    <>
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
      <div className={styles.billFigure}>
        <div>Total Quantity</div>
        <span>&#x20B9;{isNaN(totalQty) ? "" : totalQty}</span>
      </div>
    </div>
    <div>
      <div style={{flex:1, display:'flex'}}>
      <span style={{marginRight: "10px", marginLeft: '10px'}}>Payment Type *</span>
      <div  style={{width: '400px', display:'flex'}}>
          <Dropdown
            placeholder="Select Payment Type"
            required
            id="paymentType"
            data={[{label: 'CASH', value:'CASH'}, {label:'ONLINE', value:'ONLINE'}, {label: 'BOTH',value:'BOTH'}]}
            value={paymentType?{label:paymentType,value:paymentType} :null}
            onChange={(e)=>onPaymentChange(e, subTotal)}
          />
      </div>
      
        {paymentType==='BOTH' &&
        <>
        <div className={styles.billFigure}>
          <Input
            id={"cashAmount"}
            title="Cash Amount"
            type="Number"
            required
            max={subTotal}
            className={styles.cartInput}
            value={cashAmount}
            onChange={(e, id)=>handleInputInfo(e, id, subTotal)}
          />
        </div>
        <div className={styles.billFigure}>
          <Input
            id={"onlineAmount"}
            title="Online Amount"
            required
            type="Number"
            disabled
            className={styles.cartInput}
            value={onlineAmount}
          />
        </div>
        </>
        }
        <div className={styles.billFigure}>
          <Input
            id={"paymentInfo"}
            title="payment info"
            className={styles.cartInput}
            value={paymentInfo}
            onChange={handleInputInfo}
          />
        </div>
        </div>
    </div>
    </>
  );
};

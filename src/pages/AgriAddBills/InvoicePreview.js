import React, { useEffect, useState } from "react";
import { Modal } from "@mantine/core";
import styles from "./AddBills.module.css";
import ScrollTable from "../../components/Table/ScrollTable";
import { Button } from "../../components";
import dayjs from "dayjs";

export const InvoicePreview = (props) => {
  const { showPreview, onClose, children, handlePrintClick, cartData } = props;

  const printEnabled = false;

  return (
    <Modal
      opened={showPreview}
      onClose={onClose}
      centered
      size="auto"
      closeOnClickOutside={false}
      closeOnEscape={true}
    >
      <InvoiceSection {...props} printEnabled={printEnabled} />
      <div className={styles.thankYouNote}>
        Make sure to collect money before submitting!
      </div>
      <div className={styles.printButton}>
        <Button
          type="primary"
          title="Print & Submit"
          buttonType="submit"
          onClick={handlePrintClick}
        />
      </div>

      <div className={styles.modalAction}>{children}</div>
    </Modal>
  );
};

export const InvoiceSection = (props) => {
  const {
    clientDetails,
    cartData,
    cartResponse,
    invoiceNumber,
    printEnabled,
    roundOff,
    billedBy,
    data = {},
    billAddress,
    type,
  } = props;

  const [cartList, setCartList] = useState([]);
  const [invoiceHeader, setInvoiceHeader] = useState([]);
  const invoiceHeaderWithRate = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "20%" },
    { value: "HSN Code", width: "10%" },
    { value: "MRP", width: "10%" },
    { value: "Rate", width: "10%" },
    { value: "Quantity", width: "10%" },
    { value: "Amount", width: "5%" },
    { value: "GST", width: "5%" },
    { value: "Sub Total", width: "10%" },
  ];

  const invoiceHeaderWithOutRate = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "20%" },
    { value: "HSN Code", width: "10%" },
    { value: "MRP", width: "10%" },
    { value: "Quantity", width: "10%" },
    { value: "Amount", width: "10%" },
    { value: "GST", width: "10%" },
    { value: "Sub Total", width: "10%" },
  ];

  const scroll = false;

  useEffect(() => {
    let newCartList = [];
    let discounted = false;
    console.log(cartData, 'cart-data')
    for (let index = 0; index < cartData.length; index++) {
      if (cartData[index].mrp !== cartData[index].rate) {
        discounted = true;
        break;
      }
    }

    if (discounted) {
      setInvoiceHeader(invoiceHeaderWithRate);
    } else {
      setInvoiceHeader(invoiceHeaderWithOutRate);
    }

    cartData.forEach((el, index) => {
      let val = [];
      val.push({ value: index + 1 });
      if (type === "AGRI") {
        val.push({ value: `${el.procurementName.en.name}` });
      } else val.push({ value: `${el.procurementLabel} ${el.variantLabel}` });
      val.push({ value: el.hsnCode });
      val.push({ value: el.mrp });
      if (discounted) {
        val.push({ value: el.rate });
      }
      val.push({ value: el.quantity });
      val.push({value:(el.rateWithGst - el.gstAmount) * el.quantity})
      val.push({value:`${el.gstAmount} (${el.gst}%)`})
      if (type === "AGRI") {
        val.push({ value: el.rate * el.quantity  + el.gstAmount});
      }
      newCartList.push(val);
    });
    setCartList(newCartList);
  }, [JSON.stringify(cartData)]);
  console.log(cartResponse, 'test')
  return (
    <div className={styles.modalContent} id="modal-print-section">
      <div className="page-break" />
      <div className={styles.headerWrapperModal}>
        <h1 className={styles.headerModal}>Bill Invoice</h1>
      </div>

      <div className={styles.clientDetailsWrapper}>
        <div className={styles.companyDetails}>
          <div>Sold By</div>
          <div className={styles.addressDetails}>
            <b>{billAddress?.companyName}</b>
            <br></br>
            <span style={{ whiteSpace: "pre-line" }}>
              {billAddress?.companyAddress}
            </span>
          </div>
          <div>
            <strong>Phone Number</strong> : {billAddress?.phoneNumber}
          </div>
          <div>
            <strong>Email </strong>: {billAddress?.email}{" "}
          </div>
            <div>
              <strong>GSTIN </strong>: {billAddress?.GSTIN}{" "}
            </div>
        </div>

        <div className={styles.clientDetails}>
          <div className={styles.lableValueDetails}>
            <div className={styles.label}>Invoice Date:</div>
            <div className={styles.value}>
              {dayjs().format("DD/MM/YYYY HH:mm:ss A")}
            </div>
          </div>

          {invoiceNumber && invoiceNumber !== "" && (
            <div className={styles.lableValueDetails}>
              <div className={styles.label}>Invoice Number:</div>
              <div className={styles.value}>{invoiceNumber}</div>
            </div>
          )}

          <div className={styles.billedTo}>
            Billed To
            <br></br>
            <b>{clientDetails?.name}</b>
            <br></br>
            {clientDetails?.phoneNumber}
            <br></br>
            {cartResponse?.customerAddress &&
            <>
             <b>Billing Address </b><div style={{ whiteSpace: "pre-line", maxWidth:'300px', wordWrap:'break-word' }}>{cartResponse?.customerAddress} </div> 
            <br></br>
             </>
             }
             {cartResponse?.customerGst &&
            <>
            <b>GST: </b>
            {cartResponse?.customerGst}
            </>
             }
            <br></br>
          </div>
        </div>
      </div>

      {!printEnabled && (
        <div>
          {invoiceHeader && invoiceHeader.length > 0 && (
            <ScrollTable thead={invoiceHeader} tbody={cartList} />
          )}
        </div>
      )}
      {printEnabled && (
        <div>
          {invoiceHeader && invoiceHeader.length > 0 && (
            <ScrollTable
              thead={invoiceHeader}
              tbody={cartList}
              scroll={false}
            />
          )}
        </div>
      )}

      <div className={styles.invoiceSummary}>
        <div className={styles.lableValueDetails}>
          <div className={styles.label}>Billed By:</div>
          <div className={styles.value}>{billedBy}</div>
        </div>

        <div className={styles.dicountDetails}>
          <div className={styles.lableValueDetails}>
            {cartResponse.discount + roundOff > 0 && (
              <div className={styles.label}>Discount Price: </div>
            )}
            <div className={styles.label}>Total Price: </div>
            {cartResponse?.customerGst?.startsWith("29") || !cartResponse?.customerGst ?
            <>
            <div className={styles.label}>CGST </div>
            <div className={styles.label}>SGST </div>
            </>
          : <div className={styles.label}>IGST </div>}
          </div>

          <div className={styles.lableValueDetails}>
            {cartResponse.discount + roundOff > 0 && (
              <div className={styles.discountValue}>
                <b>&#x20B9;{cartResponse.discount + parseInt(roundOff, 10)}</b>
              </div>
            )}
            <div className={styles.discountValue}>
              <b>&#x20B9;{cartResponse.totalPrice - roundOff}</b>
            </div>
            {cartResponse?.customerGst?.startsWith("29") || !cartResponse?.customerGst ?
            <>
            <div className={styles.discountValue}>
              <b>&#x20B9;{cartResponse.gstAmount/2}</b>
            </div>
            <div className={styles.discountValue}>
              <b>&#x20B9;{cartResponse.gstAmount/2}</b>
            </div>
            </>
          :<div className={styles.discountValue}>
          <b>&#x20B9;{cartResponse.gstAmount}</b>
        </div>}
          </div>
        </div>
      </div>
      <div className={styles.credits}>Innovative IT solutions by Coden</div>
    </div>
  );
};

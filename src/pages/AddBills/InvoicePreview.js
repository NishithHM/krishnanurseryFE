import React, { useEffect, useState } from "react";
import { Modal } from "@mantine/core";
import styles from "./AddBills.module.css";
import ScrollTable from "../../components/Table/ScrollTable";
import { Button } from "../../components";
import dayjs from "dayjs";

const billConfig = {
  NURSERY: {
    name: "Shree Krishna Nursery",
    email: "mailus.skn@gmail.com",
    gst: "29ACCFA0434C1Z0",
  },
  AGRI: {
    name: "Agri Shopee",
    email: "agrishopee@gmail.com",
    gst: "29ACCFA0434C1Z0",
  },
};

export const InvoicePreview = (props) => {
  const {
    showPreview,
    onClose,
    children,
    handlePrintClick,
    cartResponse,
    cartData,
    type,
    isWholeSale,
  } = props;

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
          loading={!cartResponse.isApproved && isWholeSale}
          buttonType="submit"
          onClick={handlePrintClick}
          disabled={!cartResponse.isApproved && isWholeSale}
        />
        {!cartResponse.isApproved && isWholeSale && (
          <p>Waiting for admin approval</p>
        )}
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
    type,
    pamphletData,
    paymentType,
    paymentInfo,
    cashAmount,
    onlineAmount,
    selectedPamphlet,
  } = props;

  const [cartList, setCartList] = useState([]);
  const [invoiceHeader, setInvoiceHeader] = useState([]);

  const invoiceHeaderWithRate = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "40%" },
    { value: "MRP", width: "10%" },
    { value: "Rate", width: "10%" },
    { value: "Quantity", width: "10%" },
    { value: "Sub Total", width: "20%" },
  ];

  const invoiceHeaderWithOutRate = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "40%" },
    { value: "MRP", width: "15%" },
    { value: "Quantity", width: "15%" },
    { value: "Sub Total", width: "20%" },
  ];

  const scroll = false;

  useEffect(() => {
    let newCartList = [];
    let discounted = false;

    for (let index = 0; index < cartData.length; index++) {
      if (cartData[index].mrp != cartData[index].price) {
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
      val.push({ value: `${el.procurementLabel} ${el.variantLabel}` });
      val.push({ value: el.mrp });
      if (discounted) {
        val.push({ value: el.price });
      }
      val.push({ value: el.quantity });
      val.push({ value: el.price * el.quantity });
      newCartList.push(val);
    });
    setCartList(newCartList);
  }, [JSON.stringify(cartData)]);

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
            <b>{billConfig[type].name}</b>
            <br></br>
            No.188, Near airport, Santhekadur post,
            <br></br>
            Shivamogga - 577222
          </div>
          <div>
            <strong>Phone Number</strong> : 81051-73777
          </div>
          <div>
            <strong>Email </strong>: {billConfig[type].email}
          </div>
          {type !== "NURSERY" && (
            <div>
              <strong>GSTIN </strong>: {billConfig[type].gst}
            </div>
          )}
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
          </div>
          {paymentType && (
            <>
              <br />
              <b>Payment Details: </b>
              {paymentType} :-{" "}
              {paymentType === "BOTH" && (
                <span>
                  ₹{cashAmount}(cash) ₹{onlineAmount}(online){" "}
                </span>
              )}
              <br />
              <b>Payment Info:- </b>
              {paymentInfo ? `${paymentInfo}` : ""}
            </>
          )}
        </div>
      </div>

      {!printEnabled && (
        <div>
          {invoiceHeader && invoiceHeader.length > 0 && (
            <ScrollTable
              thead={invoiceHeader}
              tbody={cartList}
              selectedPamphlet={selectedPamphlet}
            />
          )}
        </div>
      )}
      {printEnabled && (
        <div>
          {invoiceHeader && invoiceHeader.length > 0 && (
            <ScrollTable
              selectedPamphlet={selectedPamphlet}
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
          </div>

          <div className={styles.lableValueDetails}>
            {cartResponse.discount + roundOff > 0 && (
              <div className={styles.discountValue}>
                <b>&#x20B9;{cartResponse.discount + parseInt(roundOff, 10)}</b>
              </div>
            )}
            <div className={styles.discountValue}>
              <b>
                &#x20B9;
                {(cartResponse?.totalPrice + selectedPamphlet?.length * 2 ??
                  0) - roundOff}
              </b>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.credits}>Innovative IT solutions by Coden.</div>
    </div>
  );
};

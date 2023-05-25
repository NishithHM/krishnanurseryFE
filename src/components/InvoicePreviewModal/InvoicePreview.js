import React, { useEffect, useState } from "react";
import { Modal } from "@mantine/core";
import styles from "./InvoicePreview.module.css";
import ScrollTable from "../Table/ScrollTable";
import Button from "../Button";
import dayjs from "dayjs";

export const InvoicePreview = (props) => {
  const {
    showPreview,
    onClose,
    children,
    handlePrintClick,
    cartData,
    setInvoiceNumber,
  } = props;

  useEffect(() => {
    const invoiceNum = Math.floor(10000000 + Math.random() * 90000000);
    setInvoiceNumber(invoiceNum);
  }, [cartData]);

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
      {handlePrintClick && (
        <div className={styles.printButton}>
          <Button
            type="primary"
            title="Print"
            buttonType="submit"
            onClick={handlePrintClick}
          />
        </div>
      )}
      <InvoiceSection {...props} printEnabled={printEnabled} />
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
    invoiceDetails,
  } = props;
  const [cartList, setCartList] = useState();
  const [invoiceHeader, setInvoiceHeader] = useState([]);

  const invoiceHeaderWithMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "40%" },
    { value: "MRP", width: "10%" },
    { value: "Rate", width: "10%" },
    { value: "Quantity", width: "10%" },
    { value: "Sub Total", width: "20%" },
  ];

  const invoiceHeaderWithOutMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item Purchased", width: "40%" },
    { value: "Rate", width: "15%" },
    { value: "Quantity", width: "15%" },
    { value: "Sub Total", width: "20%" },
  ];

  const scroll = false;

  useEffect(() => {
    let newCartList = [];
    let showMRPTemp = false;

    for (let index = 0; index < cartData.length; index++) {
      if (cartData[index].mrp !== cartData[index].price) {
        showMRPTemp = true;
        break;
      }
    }

    if (showMRPTemp) {
      setInvoiceHeader(invoiceHeaderWithOutMRP);
    } else {
      setInvoiceHeader(invoiceHeaderWithMRP);
    }

    cartData.forEach((el, index) => {
      let val = [];
      val.push({ value: index + 1 });
      val.push({ value: el.procurementLabel });
      if (!showMRPTemp) {
        val.push({ value: el.mrp });
      }
      val.push({ value: el.price });
      val.push({ value: el.quantity });
      val.push({ value: el.price * el.quantity });
      newCartList.push(val);
    });
    setCartList(newCartList);
  }, [cartData]);

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
            <b>Shree Krishna Nursery</b>
            <br></br>
            Santhekadur post
            <br></br>
            Shivamogga, 577222
          </div>
        </div>

        <div className={styles.clientDetails}>
          <div className={styles.lableValueDetails}>
            <div className={styles.label}>Invoice Date:</div>
            <div className={styles.value}>
              {dayjs(new Date(invoiceDetails?.invoiceDate)).format('DD/MM/YYYY HH:mm:ss A')}
            </div>
          </div>

          <div className={styles.lableValueDetails}>
            <div className={styles.label}>Invoice Number:</div>
            <div className={styles.value}>{invoiceNumber}</div>
          </div>

          <div className={styles.billedTo}>
            Billed To
            <br></br>
            <b>{clientDetails?.name}</b>
            <br></br>
            {clientDetails?.phoneNumber}
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
              scroll={scroll}
            />
          )}
        </div>
      )}

      <div className={styles.invoiceSummary}>
        <div className={styles.lableValueDetails}>
          <div className={styles.label}>Billed By:</div>
          <div className={styles.value}>{invoiceDetails.billedBy}</div>
          <div className={styles.label}>Sold By:</div>
          <div className={styles.value}>{invoiceDetails.soldBy}</div>
        </div>

        <div className={styles.dicountDetails}>
          <div className={styles.lableValueDetails}>
            {cartResponse.discount + cartResponse.roundOff > 0 && (
              <div className={styles.label}>Discount Price: </div>
            )}
            <div className={styles.label}>Total Price: </div>
          </div>

          <div className={styles.lableValueDetails}>
            {cartResponse.discount + cartResponse.roundOff > 0 && (
              <div className={styles.discountValue}>
                <b>&#x20B9;{cartResponse.discount + cartResponse.roundOff}</b>
              </div>
            )}
            <div className={styles.discountValue}>
              <b>&#x20B9;{cartResponse.totalPrice}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


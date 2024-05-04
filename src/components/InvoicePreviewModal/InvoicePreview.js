import React, { useEffect, useState } from "react";
import { Modal } from "@mantine/core";
import styles from "./InvoicePreview.module.css";
import ScrollTable from "../Table/ScrollTable";
import Button from "../Button";
import dayjs from "dayjs";

const billConfig = {
  NURSERY:{
    name:'Shree Krishna Nursery',
    email:"mailus.skn@gmail.com",
    phoneNumber:"81051-73777",
    GSTIN: "29ACCFA0434C1Z0",
  },
  AGRI:{
    name:'Agri Shopee',
    email:'agrishopee@gmail.com',
    phoneNumber:'81471-92555',
    GSTIN: "29ACCFA0434C1Z0",
  }
}

export const InvoicePreview = (props) => {
  const {
    showPreview,
    onClose,
    children,
    handlePrintClick,
    cartData,
    setInvoiceNumber,
    type
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
      style={{overflow:'scroll'}}
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
    type
  } = props;
  console.log(cartResponse, 'cr')
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

  if(type==='AGRI'){
    invoiceHeaderWithOutMRP.splice(2,0, { value: "HSN Code", width: "15%" })
    invoiceHeaderWithOutMRP.splice(5,0, { value: "Amount", width: "15%" })
    invoiceHeaderWithOutMRP.splice(6,0, { value: "GST", width: "15%" })
    invoiceHeaderWithMRP.splice(2,0, { value: "Amount", width: "15%" })
    invoiceHeaderWithMRP.splice(6,0, { value: "Amount", width: "15%" })
    invoiceHeaderWithMRP.splice(7,0, { value: "GST", width: "15%" })
  }

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
      setInvoiceHeader(invoiceHeaderWithMRP);
    } else {
      setInvoiceHeader(invoiceHeaderWithOutMRP);
    }

    cartData.forEach((el, index) => {
      let val = [];
      val.push({ value: index + 1 });
      val.push({ value: el.procurementLabel });
      if(type==='AGRI'){
        val.push({ value: el.hsnCode });
      }
      if (showMRPTemp) {
        val.push({ value: el.mrp });
      }
      val.push({ value: el.price });
      val.push({ value: el.quantity });
      if(type==='AGRI'){
        val.push({value:(el.rateWithGst - el.gstAmount)* el.quantity})
        val.push({value:`${el.gstAmount} (${el.gst}%)`})
      }
      if(type==='AGRI'){
        val.push({ value: el.price * el.quantity + el.gstAmount });
      }else{
        val.push({ value: el.price * el.quantity });

      }
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
            <b>{billConfig[type].name}</b>
            <br></br>
            No.188, Near airport, Santhekadur post, 
            <br></br>
            Shivamogga - 577222
          </div>
          <div><strong>Phone Number</strong> : {billConfig[type].phoneNumber}</div>
          <div><strong>Email </strong>: {billConfig[type].email} </div>
           {
            type !== 'NURSERY' && (
              <div><strong>GSTIN </strong>: {billConfig[type].GSTIN} </div>
            )
           }
          
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
             {invoiceDetails?.paymentType &&
            <>
            <br/>
            <b>Payment Details: </b>
              {invoiceDetails?.paymentType} {invoiceDetails?.paymentInfo ? `/${invoiceDetails?.paymentInfo}` : ''}
              {invoiceDetails?.paymentType==="BOTH" && <span>₹{invoiceDetails?.cashAmount}(cash) ₹{invoiceDetails?.onlineAmount}(online) </span> }
            </>
             }
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
           {type==='AGRI' && <>
            {cartResponse?.customerGst?.startsWith("29") || !cartResponse?.customerGst ?
            <>
            <div className={styles.label}>CGST </div>
            <div className={styles.label}>SGST </div>
            </>
          : <div className={styles.label}>IGST </div>}
          </>}
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
            {type==='AGRI' && <>
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
        </>}
          </div>
        </div>
      </div>
    </div>
  );
};


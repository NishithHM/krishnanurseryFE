import React, { useState, useEffect } from "react";
import { Modal } from "@mantine/core";
import styles from "./returnModal.module.css";
import ScrollTable from "../Table/ScrollTable";
import Button from "../Button";
import dayjs from "dayjs";

const ReturnHistoryModal = ({ showModal, onClose, invoiceNumber, previousReturns, type }) => {
  const invoiceHeaderWithMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item", width: "30%" },
    { value: "Rate", width: "10%" },
    { value: "Return Qty", width: "15%" },
    { value: "Return Amount", width: "15%" },
  ];

  const invoiceHeaderWithOutMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item", width: "30%" },
    { value: "Rate", width: "10%" },
    { value: "Return Qty", width: "15%" },
    { value: "Return Amount", width: "15%" },
  ];

  if(type === 'AGRI'){
    invoiceHeaderWithOutMRP.splice(2, 0, { value: "HSN Code", width: "10%" });
    invoiceHeaderWithOutMRP.splice(6, 0, { value: "GST", width: "10%" });
    invoiceHeaderWithMRP.splice(3, 0, { value: "HSN Code", width: "10%" });
    invoiceHeaderWithMRP.splice(8, 0, { value: "GST", width: "10%" });
  }

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    const buildTableData = () => {
      let data = [];
      previousReturns.forEach((item, index) => {
        let row = [];

        row.push({ value: index + 1 }); // S. No.
        row.push({ value: item.procurementName.en.name + " (" + (item.procurementName.ka.name || "") + ")" });
        row.push({ value: item.mrp });

        row.push({ value: item.quantity });
        // row.push({ value: item.returnQuantity });

        const returnAmount = item.quantity * item.mrp;

        row.push({ value: returnAmount.toFixed(2) });

        data.push(row);
      });
      setTableData(data);
    };

    buildTableData();
  }, [previousReturns]);

  const calculateTotalReturnAmount = () => {
    return previousReturns.reduce((total, item) => {
      const amount = item.quantity * item.mrp;
      return total + amount;
    }, 0);
  };

  const handlePrint = () => {
    window.print(); // Triggers browser print dialog
  };

  if (!showModal) return null;

  return (
    <Modal
      opened={showModal}
      onClose={onClose}
      centered
      size="auto"
      closeOnClickOutside={false}
      closeOnEscape={true}
      style={{ overflow: 'scroll' }}
    >
      <div className={styles.modalContent}>
        <div className={styles.headerWrapperModal}>
          <h1 className={styles.headerModal}>Return History - Invoice #{invoiceNumber}</h1>
        </div>

        <ScrollTable thead={invoiceHeaderWithMRP.some(h => h.value === "MRP") ? invoiceHeaderWithMRP : invoiceHeaderWithOutMRP} tbody={tableData} />

        <div className={styles.returnSummary}>
          <div className={styles.lableValueDetails}>
            <div className={styles.label}>Total Returned:</div>
            <div className={styles.value}>₹ {calculateTotalReturnAmount().toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.modalAction}>
          <Button type="primary" title="Print" onClick={handlePrint} />
          <Button type="secondary" title="Close" onClick={onClose} />
        </div>
      </div>
    </Modal>
  );
};

const ReturnModal = ({
  showModal,
  onClose,
  clientDetails,
  invoiceDetails,
  cartData,
  invoiceId,
  invoiceNumber,
  handleSubmitReturn,
  type,
  previousReturns
}) => {
  const [returnItems, setReturnItems] = useState(
    cartData.map(item => ({
      ...item,
      returnQuantity: 0
    }))
  );

  const [tableData, setTableData] = useState([]);
  const [invoiceHeader, setInvoiceHeader] = useState([]);

  const invoiceHeaderWithMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item", width: "30%" },
    { value: "MRP", width: "10%" },
    { value: "Rate", width: "10%" },
    { value: "Original Qty", width: "10%" },
    { value: "Return Qty", width: "15%" },
    { value: "Return Amount", width: "15%" },
  ];

  const invoiceHeaderWithOutMRP = [
    { value: "S. No.", width: "10%" },
    { value: "Item", width: "30%" },
    { value: "Rate", width: "10%" },
    { value: "Original Qty", width: "10%" },
    { value: "Return Qty", width: "15%" },
    { value: "Return Amount", width: "15%" },
  ];

  if(type === 'AGRI'){
    invoiceHeaderWithOutMRP.splice(2, 0, { value: "HSN Code", width: "10%" });
    invoiceHeaderWithOutMRP.splice(6, 0, { value: "GST", width: "10%" });
    invoiceHeaderWithMRP.splice(3, 0, { value: "HSN Code", width: "10%" });
    invoiceHeaderWithMRP.splice(8, 0, { value: "GST", width: "10%" });
  }

  useEffect(() => {
    let showMRPTemp = false;

    for (let index = 0; index < returnItems.length; index++) {
      if (returnItems[index].mrp !== returnItems[index].price) {
        showMRPTemp = true;
        break;
      }
    }

    if (showMRPTemp) {
      setInvoiceHeader(invoiceHeaderWithMRP);
    } else {
      setInvoiceHeader(invoiceHeaderWithOutMRP);
    }

    updateTableData();
  }, [returnItems]);

  const updateTableData = () => {
    let newTableData = [];
    const showMRP = invoiceHeader === invoiceHeaderWithMRP;

    returnItems.forEach((item, index) => {
      let row = [];
      row.push({ value: index + 1 });

      if(type === 'AGRI'){
        const [baseName, metaName] = `${item.procurementLabel}.`?.split('-');
        const [companyName, otherNames] = `${metaName}.`?.split('(');
        const finalName = `${item.procurementLabel}.`?.replace(`-${companyName}`, '');
        row.push({ value: finalName });
      } else {
        row.push({ value: item.procurementLabel });
      }

      if(type === 'AGRI'){
        row.push({ value: item.hsnCode });
      }

      if (showMRP) {
        row.push({ value: item.mrp });
      }

      row.push({ value: item.price });
      row.push({ value: item.quantity });

      row.push({
        value: (
          <input
            type="number"
            min="0"
            max={item.quantity}
            value={item.returnQuantity}
            onChange={(e) => handleQuantityChange(index, e.target.value)}
            className={styles.quantityInput}
          />
        )
      });

      if(type === 'AGRI'){
        row.push({ value: `${item.gstAmount} (${item.gst}%)` });
      }

      const returnAmount = type === 'AGRI'
        ? (item.price * item.returnQuantity) + ((item.gstAmount / item.quantity) * item.returnQuantity)
        : (item.price * item.returnQuantity);

      row.push({ value: returnAmount.toFixed(2) });

      newTableData.push(row);
    });

    setTableData(newTableData);
  };

  const handleQuantityChange = (index, value) => {
    const newValue = parseInt(value) || 0;
    const updatedItems = [...returnItems];

    if (newValue > updatedItems[index].quantity) return;

    updatedItems[index].returnQuantity = newValue;
    setReturnItems(updatedItems);
  };

  const calculateReturnTotal = () => {
    return returnItems.reduce((total, item) => {
      const amount = type === 'AGRI'
        ? (item.price * item.returnQuantity) + ((item.gstAmount / item.quantity) * item.returnQuantity)
        : (item.price * item.returnQuantity);
      return total + amount;
    }, 0);
  };

  const handleReturn = () => {
    const itemsToReturn = returnItems
      .filter(item => item.returnQuantity > 0)
      .map(item => ({
        procurementId: item.procurementId,
        quantity: item.returnQuantity,
        _id: item._id
      }));

    if (itemsToReturn.length === 0) {
      alert("Please select at least one item to return");
      return;
    }

    handleSubmitReturn({
      invoiceId: invoiceId,
      items: itemsToReturn
    });
  };

  // If there are previous returns, show non-editable history
  if (previousReturns.length > 0 && showModal) {
    return (
      <ReturnHistoryModal
        showModal={showModal}
        onClose={onClose}
        invoiceNumber={invoiceNumber}
        previousReturns={previousReturns}
        type={type}
      />
    );
  }

  // Else show the editable return modal
  if (!showModal) return null;

  return (
    <Modal
      opened={showModal}
      onClose={onClose}
      centered
      size="auto"
      closeOnClickOutside={false}
      closeOnEscape={true}
      style={{overflow:'scroll'}}
    >
      <div className={styles.modalContent}>
        <div className={styles.headerWrapperModal}>
          <h1 className={styles.headerModal}>Return Items - Invoice #{invoiceNumber}</h1>
        </div>

        <div className={styles.clientDetailsWrapper}>
          <div className={styles.clientDetails}>
            <div className={styles.lableValueDetails}>
              <div className={styles.label}>Customer:</div>
              <div className={styles.value}>{clientDetails?.name}</div>
            </div>
            <div className={styles.lableValueDetails}>
              <div className={styles.label}>Phone:</div>
              <div className={styles.value}>{clientDetails?.phoneNumber}</div>
            </div>
          </div>

          <div className={styles.invoiceDetails}>
            <div className={styles.lableValueDetails}>
              <div className={styles.label}>Date:</div>
              <div className={styles.value}>
                {dayjs(new Date(invoiceDetails?.invoiceDate)).format('DD/MM/YYYY')}
              </div>
            </div>
            <div className={styles.lableValueDetails}>
              <div className={styles.label}>Billed By:</div>
              <div className={styles.value}>{invoiceDetails?.billedBy}</div>
            </div>
          </div>
        </div>

        <ScrollTable thead={invoiceHeader} tbody={tableData} />

        <div className={styles.returnSummary}>
          <div className={styles.lableValueDetails}>
            <div className={styles.label}>Return Total:</div>
            <div className={styles.value}>₹{calculateReturnTotal().toFixed(2)}</div>
          </div>
        </div>

        <div className={styles.modalAction}>
          <Button
            type="primary"
            title="Submit Return"
            buttonType="submit"
            onClick={handleReturn}
            disabled={calculateReturnTotal() <= 0}
          />
          <Button
            type="secondary"
            title="Cancel"
            onClick={onClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ReturnModal;
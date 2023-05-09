import React, { useEffect, useState } from "react";
import AlertMessage from "../AlertMessage";
import { AiOutlineClose } from "react-icons/ai";
import DropZone from "../Dropzone/Dropzone";
import { MIME_TYPES } from "@mantine/dropzone";
import Modal from "../Modal";
import Input from "../Input";
import styles from "./AddInvoiceModal.module.css";
import { useGetVendorMutation } from "../../services/common.services";

const AddInvoiceModal = ({
  addInvoice,
  setAddInvoice,
  AddOrderInvoice,
  isAddInvoiceLoading,
  loadInitialOrders,
  sort,
  toast,
}) => {
  console.log(addInvoice);
  const [orderInvoiceFile, setOrderInvoiceFile] = useState(null);

  const [getVendor] = useGetVendorMutation();

  const [state, setState] = useState({
    totalAmount: 0,
    invoiceAmount: 0,
    advanceAmount: 0,
    deviation: 0,
    invoiceTotal: 0,
    totalToPay: 0,
  });

  function convertNumber(num) {
    if (num >= 0) {
      return -num;
    } else {
      return Math.abs(num);
    }
  }

  const totalAmount = addInvoice.data.totalPrice;
  const currentPaidAmount = addInvoice.data.currentPaidAmount;
  const deviationAmount = 0;

  useEffect(() => {
    async function get(id) {
      const res = await getVendor({ id });
      setState((prev) => ({ ...prev, deviation: res.data.deviation }));
    }

    get(addInvoice.data.vendorId);
    // get();
  }, []);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      totalAmount: totalAmount,
      advanceAmount: currentPaidAmount,
      deviation: deviationAmount,
    }));
  }, []);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      invoiceTotal:
        prev.totalAmount - prev.advanceAmount + convertNumber(prev.deviation),
      totalToPay:
        prev.totalAmount - prev.advanceAmount + convertNumber(prev.deviation),
    }));
  }, []);

  return (
    <Modal isOpen={addInvoice.isActive} contentLabel="Add invoice">
      <AlertMessage
        message={`Add invoice for the order`}
        confirmBtnType="primary"
        subMessage={""}
        cancelBtnLabel={"Close"}
        confirmBtnLabel={"Submit"}
        successLoading={isAddInvoiceLoading}
        handleCancel={() => {
          setAddInvoice({ isActive: false, id: null });
          setOrderInvoiceFile(null);
        }}
        handleConfirm={async () => {
          if (!orderInvoiceFile)
            return toast.error("Please Select Invoice File");
          if (state.invoiceAmount <= 0)
            return toast.error("Invoice Amount should not be less than 0");

          if (state.totalToPay <= 0)
            return toast.error("Invoice Amount should not be less than 0");
          const data = new FormData();
          data.append("invoice", orderInvoiceFile);
          data.append("finalInvoiceAmount", state.invoiceAmount);
          data.append("finalAmountPaid", state.totalToPay);

          const res = await AddOrderInvoice({
            id: addInvoice.id,
            body: data,
          });
          toast.success("Invoice Updated!");
          setAddInvoice({ isActive: false, id: null });
          setOrderInvoiceFile(null);
          loadInitialOrders(1, sort);
        }}
      >
        <div
          style={{
            display: "flex",
            maxWidth: "60vw",
            justifyContent: "space-between",
            gap: "2rem",
          }}
        >
          <div
            style={{
              margin: "20px 0",
              textAlign: "start",
              width: "50%",
              maxWidth: "25rem",
            }}
          >
            {orderInvoiceFile ? (
              <div>
                <p style={{ fontSize: "18px" }}>Invoice Selected</p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "2px dashed black",
                    borderRadius: "7px",
                    padding: "10px",
                    margin: 0,
                  }}
                >
                  <span>{orderInvoiceFile.name}</span>

                  <AiOutlineClose onClick={() => setOrderInvoiceFile(null)} />
                </div>
              </div>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "18px",
                    lineHeight: "35px",
                    margin: 0,
                  }}
                >
                  Invoice{" "}
                  <span
                    style={{
                      color: "red",
                    }}
                  >
                    *
                  </span>
                </p>
                <DropZone
                  onDrop={(files) => {
                    console.log(files);
                    setOrderInvoiceFile(files[0]);
                  }}
                  onReject={(files) =>
                    toast.error(files[0].errors[0].code.replaceAll("-", " "))
                  }
                  maxSize={3 * 1024 ** 2}
                  maxFiles="1"
                  multiple={false}
                  accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
                  maxFileSize="5"
                />
              </>
            )}

            <div
              style={{
                marginTop: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "40px",
              }}
            >
              <Input
                value={state.invoiceAmount}
                id="invoiceAmount"
                type="number"
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    invoiceAmount: e.target.value,
                  }))
                }
                title="Invoice Amount"
                required
              />

              <Input
                value={state.totalToPay}
                id="totalToPay"
                type="number"
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    totalToPay: e.target.value,
                  }))
                }
                title="Total Amount to be paid"
                required
              />
            </div>
          </div>

          <div
            style={{
              width: "50%",
              maxWidth: "25rem",
              display: "flex",
              flexDirection: "column",
              textAlign: "start",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                maxWidth: "20rem",
                marginTop: "3rem",
              }}
            >
              <div className={styles.invoiceItem}>
                <span>Total Amount : </span>
                <span>{state.totalAmount}</span>
              </div>

              <div className={styles.invoiceItem}>
                <span>Advance Paid : </span>
                <span>{state.advanceAmount}</span>
              </div>

              <div className={styles.invoiceItem}>
                <span>
                  {state.deviationAmount > 0 ? "You Lent :" : "You Borrowed"}
                </span>
                <span>{state.deviation}</span>
              </div>

              <hr />
              <div className={styles.invoiceItem}>
                <span>Total : </span>
                <span>{state.invoiceTotal}</span>
              </div>
            </div>

            <p>
              {state.invoiceTotal > state.totalToPay && (
                <span>
                  <span style={{ color: "#ea8c10" }}>You Borrowed</span>{" "}
                  {Math.abs(state.totalToPay - state.invoiceTotal)}₹ in this
                  transaction!
                </span>
              )}{" "}
              {state.invoiceTotal < state.totalToPay && (
                <span>
                  {" "}
                  <span style={{ color: "red" }}>You Lent </span>
                  {state.totalToPay - state.invoiceTotal}₹ in this transaction!
                </span>
              )}
            </p>
          </div>
        </div>
      </AlertMessage>
    </Modal>
  );
};

export default AddInvoiceModal;

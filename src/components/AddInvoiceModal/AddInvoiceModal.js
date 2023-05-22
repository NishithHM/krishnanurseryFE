import React, { useEffect, useState } from "react";
import AlertMessage from "../AlertMessage";
import { AiOutlineClose } from "react-icons/ai";
import DropZone from "../Dropzone/Dropzone";
import { MIME_TYPES } from "@mantine/dropzone";
import Modal from "../Modal";
import Input from "../Input";
import styles from "./AddInvoiceModal.module.css";
import { useGetVendorMutation } from "../../services/common.services";
import {useGetInvoiceMutation} from "../../services/procurement.services";

const AddInvoiceModal = ({
  addInvoice,
  setAddInvoice,
  AddOrderInvoice,
  isAddInvoiceLoading,
  loadInitialOrders,
  sort,
  toast,
  orderId
}) => {
  const [orderInvoiceFile, setOrderInvoiceFile] = useState(null);


  const [getVendor] = useGetVendorMutation();
  const [getInvoice] = useGetInvoiceMutation();

  const [state, setState] = useState({
    advanceAmount: 0,
    deviation: 0,
    invoiceTotal: 0,
    totalToPay: 0,
    orderVal: {
      items:[],
      totalAmount:0,
      advanceAmount:0
    },
  });

  useEffect(() => {
    async function get(id) {
      const res = await getVendor({ id });
      const invoiceRes = await getInvoice({id:orderId, page:'orders'});
      console.log(invoiceRes, 'invoice')
      setState((prev) => ({ ...prev, 
        deviation: res.data.deviation,
        orderVal: invoiceRes?.data, 
        advanceAmount: invoiceRes?.data?.advanceAmount
      }));
    }

    get(addInvoice.data.vendorId);
    // get();
  }, []);

  useEffect(() => {
    setState((prev) => ({
      ...prev,
      invoiceTotal: state?.orderVal?.totalAmount - state.advanceAmount + state.deviation,
      totalToPay: state?.orderVal?.totalAmount - state.advanceAmount + state.deviation,
    }));
  }, [state?.orderVal?.totalAmount, state.deviation, state.advanceAmount]);

  const onItemChange=(e, id)=>{
    const newOrderData = {...state.orderVal}
    const mewItems = newOrderData.items.map(ele=> {
      const newEle = {...ele}
      if(ele._id === id){
        newEle.totalPrice =  parseInt(e?.target?.value || 0, 10)
      }
      return newEle
    })
    newOrderData.items = mewItems
    newOrderData.totalAmount = mewItems.reduce((acc, ele)=> acc+ele.totalPrice, 0)
    setState(prev=>({
      ...prev,
      orderVal: newOrderData
    }))
  }

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

          if (state.totalToPay <= 0)
            return toast.error("Invoice Amount should not be less than 0");
          const data = new FormData();
          data.append("invoice", orderInvoiceFile);
          data.append(
            "body",
            JSON.stringify({
              orderData:  state.orderVal,
              finalAmountPaid:
                parseInt(state.totalToPay, 10) +
                parseInt(state.advanceAmount, 10),
            })
          );

          const res = await AddOrderInvoice({
            id: addInvoice?.data?.orderId,
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
                value={state.totalToPay}
                id="totalToPay"
                type="number"
                onChange={(e) =>
                  setState((prev) => ({
                    ...prev,
                    totalToPay: parseInt(e.target.value),
                  }))
                }
                title="Amount paid to vendor"
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
               {state.orderVal?.items.map((ele) => {
                  return (
                    <div className={styles.invoiceItem}>
                       <span>{`${ele?.names?.en?.name} x ${ele?.orderedQuantity}`}</span>
                       <div style={{width:'100px'}}>
                      <Input type="number" onChange={e=> onItemChange(e, ele._id)} style={{width:'100px'}} value={ele?.totalPrice}/>
                      </div>
                    </div>
                  );
                })}
              
              <div className={styles.invoiceItem}>
                <span>Total Amount (invoice)</span>
                <span>{state.orderVal.totalAmount}</span>
              </div>

              <div className={styles.invoiceItem}>
                <span>Advance Paid : </span>
                <span>{state.orderVal?.advanceAmount}</span>
              </div>

              <div className={styles.invoiceItem}>
                <span>
                  {state.deviationAmount < 0 ? "You Lent :" : "You Borrowed"}
                </span>
                <span>{Math.abs(state.deviation)}</span>
              </div>

              <hr />
              <div className={styles.invoiceItem}>
                <span>Total : </span>
                <span>{state.invoiceTotal}</span>
              </div>
            </div>

            <div>
              {state.invoiceTotal - state.totalToPay > 0 && (
                <span>
                  <span style={{ color: "#ea8c10" }}>You Borrowed</span>{" "}
                  {Math.abs(state.invoiceTotal - state.totalToPay)}₹ in this
                  transaction!
                </span>
              )}
              {state.invoiceTotal - state.totalToPay < 0 && (
                <span>
                  {" "}
                  <span style={{ color: "red" }}>You Lent </span>
                  {Math.abs(state.invoiceTotal - state.totalToPay)}₹ in this
                  transaction!
                </span>
              )}
            </div>
          </div>
        </div>
      </AlertMessage>
    </Modal>
  );
};

export default AddInvoiceModal;

import { useEffect, useState } from 'react';
import styles from './onlineOrder.module.css'
import dayjs from 'dayjs';
import { Modal } from '@mantine/core';
import { Button, Input } from '../../components';
import ScrollTable from '../../components/Table/ScrollTable';

const billConfig = {
    NURSERY: {
        name: 'Shree Krishna Nursery',
        email: "mailus.skn@gmail.com",
        phoneNumber: "81051-73777",
        GSTIN: "29ACCFA0434C1Z0",
    },
    AGRI: {
        name: 'Agri Shopee',
        email: 'agrishopee@gmail.com',
        phoneNumber: '81471-92555',
        GSTIN: "29ACCFA0434C1Z0",
    }
}

export const OnlineInvoicePreview = (props) => {
    const {
        showPreview,
        onClose,
        handlePrintClick,
        onSubmit
    } = props;

    // useEffect(() => {
    //   const invoiceNum = Math.floor(10000000 + Math.random() * 90000000);
    //   setInvoiceNumber(invoiceNum);
    // }, [cartData]);

    const printEnabled = false;

    return (
        <Modal
            opened={showPreview}
            onClose={onClose}
            centered
            size="auto"
            closeOnClickOutside={false}
            closeOnEscape={true}
            style={{ overflow: 'scroll' }}
        >
            <InvoiceSectionOnline {...props} printEnabled={printEnabled} />
    
            <div className={styles.thankYouNote}>
                Make sure to collect money before submitting!
            </div>
            <div className={styles.printButton}>
                <Button
                    type="primary"
                    title="Print & Submit"
                    buttonType="submit"
                    onClick={onSubmit}
                />
            </div>
        </Modal>
    );

};

export const InvoiceSectionOnline = (props) => {
    const {
        clientDetails,
        cartResponse,
        invoiceId,
        printEnabled,
        invoiceDetails,
        onDeliveryFee,
        extraFee,
        disableExtraFee
    } = props;
    const [cartList, setCartList] = useState([]);

    const invoiceHeaderWithMRP = [
        { value: "S. No.", width: "10%" },
        { value: "Item Purchased", width: "40%" },
        { value: "MRP", width: "10%" },
        { value: "Rate", width: "10%" },
        { value: "Quantity", width: "10%" },
        { value: "Sub Total", width: "20%" },
    ];

    const scroll = false;
    useEffect(() => {
        let newCartList = [];
        cartResponse?.items?.forEach((el, index) => {
            let val = [];
            val.push({ value: index + 1 });
            val.push({ value: el.name?.customer?.name });
            val.push({ value: el.price });
            val.push({ value: el.discountedPrice });
            val.push({ value: el.qty });
            val.push({ value: el.price * el.qty });

            newCartList.push(val);
        });
        setCartList(newCartList);
    }, [cartResponse]);


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
                        <b>{billConfig.NURSERY.name}</b>
                        <br></br>
                        No.188, Near airport, Santhekadur post,
                        <br></br>
                        Shivamogga - 577222
                    </div>
                    <div><strong>Phone Number</strong> : {billConfig.NURSERY.phoneNumber}</div>
                    <div><strong>Email </strong>: {billConfig.NURSERY.email} </div>

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
                        <div className={styles.value}>{invoiceId}</div>
                    </div>

                    <div className={styles.billedTo}>
                        Billed To
                        <br></br>
                        <b>{clientDetails?.name}</b>
                        <br></br>
                        {clientDetails?.phoneNumber}
                        <br></br>
                        {cartResponse?.customerAddress && (
                            <>
                                <b>Billing Address </b>
                                <div
                                    style={{
                                        whiteSpace: "pre-line",
                                        maxWidth: "300px",
                                        wordWrap: "break-word",
                                    }}
                                >
                                    {cartResponse?.customerAddress}{" "}
                                </div>
                                <br></br>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {!printEnabled && (
                <div>
                    <ScrollTable thead={invoiceHeaderWithMRP} tbody={cartList} />
                </div>
            )}

            {printEnabled && (
                <div>
                    <ScrollTable
                        thead={invoiceHeaderWithMRP}
                        tbody={cartList}
                        scroll={scroll}
                    />
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
                        {cartResponse.offerDiscount + cartResponse.totalDiscount > 0 && (
                            <div className={styles.label}>Discount Price: </div>
                        )}
                        <div className={styles.label}>Total Price: </div>
                    </div>

                    <div className={styles.lableValueDetails}>
                        {cartResponse.totalDiscount + cartResponse.offerDiscount > 0 && (
                            <div className={styles.discountValue}>
                                <b>&#x20B9;{cartResponse.totalDiscount + cartResponse.offerDiscount}</b>
                            </div>
                        )}
                        <div className={styles.discountValue}>
                            <b>&#x20B9;{cartResponse.totalAmount + parseInt(extraFee, 10)}</b>
                        </div>
                    </div>
                </div>
            </div>
            {!disableExtraFee && <div className={styles.dicountDetails}>
            <Input title="Delvery fee" type="number" onChange={onDeliveryFee}/>
            </div>}
            <div className={styles.credits}>Innovative IT solutions by Coden</div>
        </div>
    );
};
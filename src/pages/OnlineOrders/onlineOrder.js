
import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../context';
import { useApproveOnlineOrderMutation, useGetAllOnlineOrdersQuery } from '../../services/onlineOrder.services';
import { BackButton, Spinner, Table, Toaster } from '../../components';
import styles from './onlineOrder.module.css'
import { ImSearch } from 'react-icons/im';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { InvoiceSectionOnline, OnlineInvoicePreview } from './helper';
import { isEmpty } from 'lodash';
import { useReactToPrint } from 'react-to-print';
const OnlineOrderPage = () => {
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [user] = useContext(AuthContext);
    const [searchInput, setSearchInput] = useState("");
    const [sort, setSort] = useState({ sortBy: "updatedAt", sortType: "desc" });
    const [invoiceId, setInvoice] = useState(null);
    const [purchaseCount, setPurchaseCount] = useState(0);
    const [showInvoice, setShowInvoice] = useState({})
    const [extraFee, setExtraFee] = useState(0)
    const printRef = useRef();
    const onlineOrdersData = useGetAllOnlineOrdersQuery({
        pageNumber: page,
        sortBy: sort.sortBy,
        sortType: sort.sortType === "asc" ? 1 : -1,
        search: searchInput
    })

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };
    const [approveOnlineOrder]  = useApproveOnlineOrderMutation()


    const purchaseCountReq = useGetAllOnlineOrdersQuery({
        search: searchInput,
        isCount: true
    });

    useEffect(() => {
        if (purchaseCountReq.status !== "fulfilled") return;
        setPurchaseCount(purchaseCountReq.data?.count);
    }, [purchaseCountReq]);

    const TABLE_HEADER = [
        {
            value: "Date",
            isSortable: true,
            sortBy: "updatedAt",
        },

        {
            value: "Customer Name",
            isSortable: false,
        },
        {
            value: "Customer Phone",
            isSortable: false,
        },
        {
            value: "Customer City",
            isSortable: false,
        },
        {
            value: "Customer Pincode",
            isSortable: false,
        },
        {
            value: "Total Bill",
            isSortable: true,
            sortBy: "totalAmpunt",
        },
        {
            value: "",
            isSortable: false,
        },
        {
            isSortable: false,
        },
    ];

    const sortData = (sortVal) => {
        setSort((prev) => ({
            sortBy: sortVal,
            sortType: prev.sortType === "asc" ? "desc" : "asc",
        }));
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });


    useEffect(() => {
        if (onlineOrdersData.status !== "fulfilled") return;
        const purchases = formatPurchasesData(onlineOrdersData.data?.data);
        setData(purchases);
    }, [onlineOrdersData, searchInput]);

    const onSubmit=async()=>{
        const res = await approveOnlineOrder({uuid: showInvoice?.uuid, extraFee });
        const invoice = res.data?.cart?.invoiceId
        setInvoice(invoice)
        setTimeout(()=>{
            handlePrint()

        }, 2000)
    }

    const formatPurchasesData = (data) => {
        const formatted = data.map((purchase) => {
            const date = { value: dayjs(purchase.updatedAt).format("DD-MM-YYYY") };

            const openModal = {
                value: (
                    <a
                        style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                        href={`${process.env.REACT_APP_CUSTOMER_URL}/cart?cartId=${purchase.uuid}`}
                        target='_blank'
                    >
                        View Details
                    </a>
                ),
            };

            const approve = {
                value: (
                    <span
                        style={{ color: "green", fontWeight: "600", cursor: "pointer" }}
                        onClick={async () => {
                            setShowInvoice(purchase)
                        }}

                    >
                        Approve
                    </span>
                )
            };



            const data = [
                date,
                { value: purchase?.customer?.name },
                { value: `${purchase?.customer?.phone} / ${purchase?.customer?.alternateMobileNumber} ` },
                { value: purchase?.customer?.city || "--" },
                { value: purchase.customer?.pinCode },
                {
                    value: new Intl.NumberFormat("ja-JP", {
                        style: "currency",
                        currency: "INR",
                    }).format(purchase.totalAmount),
                },
                openModal,
                approve
            ];
            return data;
        });

        return formatted;
    };
    return (
        <div>
            <div>
                <BackButton navigateTo={"/authorised/dashboard"} />
                <Toaster />
            </div>
            <div className={styles.wrapper}>
                {/* search */}
                <div className={styles.searchContainer}>
                    <input
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        placeholder="Search for an customer..."
                        className={styles.searchInput}
                    />
                    <ImSearch size={22} color="#4f4e4e" className={styles.searchIcon} />
                </div>
                <div className={styles.paginationContainer}>
                    <div className={styles.paginationInner}>
                        {/* count */}
                        <span>{`${page === 1 ? "1" : (page - 1) * 10}-${page * 10 > purchaseCount ? purchaseCount : page * 10
                            } of ${purchaseCount}`}</span>
                        {/* controls */}
                        <button
                            onClick={() => setPage((e) => e - 1)}
                            disabled={page === 1}
                            className={styles.paginationControls}
                        >
                            <FaChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setPage((e) => e + 1)}
                            disabled={
                                (page * 10 > purchaseCount ? purchaseCount : page * 10) >=
                                purchaseCount
                            }
                            className={styles.paginationControls}
                        >
                            <FaChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
            {onlineOrdersData.isLoading ? (
                <Spinner />
            ) : (
                onlineOrdersData.status === "fulfilled" && (
                    <Table data={[TABLE_HEADER, ...data]} onSortBy={sortData} />
                )
            )}

            {onlineOrdersData.isError && (
                <p className={styles.errorMessage}>Unable to load Orders Data</p>
            )}

            {!isEmpty(showInvoice) &&
                <OnlineInvoicePreview
                    showPreview={!isEmpty(showInvoice)}
                    onClose={() => setShowInvoice({})}
                    clientDetails={{ name: showInvoice?.customer?.name, phoneNumber: showInvoice?.customer?.phone }}
                    invoiceDetails={{
                        billedBy: user.name,
                        soldBy: user.name,
                        invoiceDate: showInvoice?.updatedAt,
                    }}
                    cartResponse={showInvoice}
                    onSubmit={onSubmit}
                    handlePrintClick={handlePrint}
                    onDeliveryFee={e=> setExtraFee(e.target.value)}
                    extraFee={extraFee}
                    invoiceId={invoiceId}
                />}
            {!isEmpty(showInvoice) && (
                <div style={{ display: "none" }}>
                    <div ref={printRef}>
                        <InvoiceSectionOnline 
                            clientDetails={{ name: showInvoice?.customer?.name, phoneNumber: showInvoice?.customer?.phone }}
                            invoiceDetails={{
                                billedBy: user.name,
                                soldBy: user.name,
                                invoiceDate: showInvoice?.updatedAt,
                            }}
                            cartResponse={showInvoice}
                            extraFee={extraFee}
                            disableExtraFee={true}
                            invoiceId={invoiceId}
                        />
                    </div>
                </div>

            )}
        </div>
    );
};

export default OnlineOrderPage;


import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import ScrollTable from "../Table/ScrollTable";

const ReturnPrintModal = ({
    invoiceNumber,
    previousReturns,
    clientDetails,
    invoiceDetails,
}) => {
    console.log(previousReturns);
    let returnId = ""
    if (previousReturns){
        let retId = previousReturns[0].returnId;
        if (retId && retId < 10){
            returnId = `RET_NUR_00${retId}`
        }
        else if (retId){
            returnId = `RET_NUR_${retId}`
        }
    }

    // const [returnList, setReturnList] = useState([]);

    const returnHeader = [
        { value: "S. No.", width: "10%" },
        { value: "Item Returned", width: "40%" },
        { value: "Rate", width: "15%" },
        { value: "Quantity", width: "15%" },
        { value: "Sub Total", width: "20%" },
    ];
    const returnList = [];
    
    let val = [];
    previousReturns.forEach((item, idx) => {
        
        val.push({value: idx + 1});
        let label = String(item.procurementName?.en?.name || item.procurementLabel) + ` (${item.procurementName?.ka?.name || ""})`;
        val.push({value: label});
        val.push({value: item.mrp});
        val.push({value: item.quantity});
        let returnAmount = item.quantity * item.mrp;
        val.push({value: returnAmount});
    });
    // setReturnList()
    returnList.push(val);

    const calculateTotalReturnAmount = () => {
        return previousReturns.reduce((total, item) => {
            const amount = item.quantity * item.mrp;
            return total + amount;
        }, 0);
    };

    const printStyles = {
        container: {
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            backgroundColor: 'white',
            color: 'black',
            maxWidth: '800px',
            margin: '0 auto'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px'
        },
        title: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#4CAF50',
            margin: '0 0 20px 0'
        },
        section: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px'
        },
        leftSection: {
            flex: 1,
            paddingRight: '20px'
        },
        rightSection: {
            flex: 1,
            paddingLeft: '20px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '10px'
        },
        detailRow: {
            display: 'flex',
            marginBottom: '5px'
        },
        label: {
            fontWeight: 'bold',
            minWidth: '120px',
            fontSize: '12px'
        },
        value: {
            fontSize: '12px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
            border: '1px solid #ddd'
        },
        tableHeader: {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            fontSize: '12px',
            padding: '8px',
            textAlign: 'center',
            border: '1px solid #ddd'
        },
        tableCell: {
            padding: '8px',
            fontSize: '11px',
            border: '1px solid #ddd',
            textAlign: 'center'
        },
        itemCell: {
            textAlign: 'left'
        },
        totalSection: {
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '20px'
        },
        totalLabel: {
            fontSize: '14px',
            fontWeight: 'bold',
            marginRight: '20px'
        },
        totalValue: {
            fontSize: '14px',
            fontWeight: 'bold'
        },
        footer: {
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between'
        },
        footerText: {
            fontSize: '12px'
        }
    };

    return (
        <div style={printStyles.container}>
            <div style={printStyles.header}>
                <h1 style={printStyles.title}>Return Invoice</h1>
            </div>

            <div style={printStyles.section}>
                <div style={printStyles.leftSection}>
                    <div style={printStyles.sectionTitle}>Sold By</div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.value}>
                            {invoiceDetails?.companyName || "Shree Krishna Nursery"}
                        </span>
                    </div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.value}>
                            {invoiceDetails?.companyAddress || "No.188, Near airport, Santhekadur post, Shivamogga - 577222"}
                        </span>
                    </div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.label}>Phone Number :</span>
                        <span style={printStyles.value}>
                            {invoiceDetails?.companyPhone || "81051-73777"}
                        </span>
                    </div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.label}>Email :</span>
                        <span style={printStyles.value}>
                            {invoiceDetails?.companyEmail || "mailus.skn@gmail.com"}
                        </span>
                    </div>
                </div>

                <div style={printStyles.rightSection}>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.label}>Return Date:</span>
                        <span style={printStyles.value}>
                            {dayjs().format('DD/MM/YYYY HH:mm:ss A')}
                        </span>
                    </div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.label}>Return Number:</span>
                        <span style={printStyles.value}>{returnId || "RET_" + invoiceNumber}</span>
                    </div>
                    <div style={printStyles.detailRow}>
                        <span style={printStyles.label}>Original Invoice:</span>
                        <span style={printStyles.value}>{invoiceNumber}</span>
                    </div>
                    
                    <div style={{ marginTop: '20px' }}>
                        <div style={printStyles.sectionTitle}>Billed To</div>
                        <div style={printStyles.detailRow}>
                            <span style={printStyles.value}>{clientDetails?.name}</span>
                        </div>
                        <div style={printStyles.detailRow}>
                            <span style={printStyles.value}>{clientDetails?.phoneNumber}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '15px' }}>
                        <div style={printStyles.detailRow}>
                            <span style={printStyles.label}>Payment Details:</span>
                            <span style={printStyles.value}>CASH</span>
                        </div>
                        <div style={printStyles.detailRow}>
                            <span style={printStyles.value}>Payment Info</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* <table style={printStyles.table}>
                <thead>
                    <tr>
                        <th style={printStyles.tableHeader}>S. No.</th>
                        <th style={printStyles.tableHeader}>Item Returned</th>
                        <th style={printStyles.tableHeader}>Rate</th>
                        <th style={printStyles.tableHeader}>Quantity</th>
                        <th style={printStyles.tableHeader}>Sub Total</th>
                    </tr>
                </thead>
                <tbody>
                    {previousReturns.map((item, index) => {
                        const returnAmount = item.quantity * item.mrp;
                        return (
                            <tr key={index}>
                                <td style={printStyles.tableCell}>{index + 1}</td>
                                <td style={{...printStyles.tableCell, ...printStyles.itemCell}}>
                                    {item.procurementName?.en?.name || item.procurementLabel} 
                                    {item.procurementName?.ka?.name && ` (${item.procurementName.ka.name})`}
                                </td>
                                <td style={printStyles.tableCell}>{item.mrp}</td>
                                <td style={printStyles.tableCell}>{item.quantity}</td>
                                <td style={printStyles.tableCell}>{returnAmount}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table> */}

            <ScrollTable
                thead={returnHeader}
                tbody={returnList}
            />

            <div style={printStyles.totalSection}>
                <span style={printStyles.totalLabel}>Total Price:</span>
                <span style={printStyles.totalValue}>₹{calculateTotalReturnAmount()}</span>
            </div>

            <div style={printStyles.footer}>
                <div style={printStyles.footerText}>
                    <strong>Billed By:</strong> {invoiceDetails?.billedBy || "sales-harish"}
                </div>
                <div style={printStyles.footerText}>
                    <strong>Sold By:</strong> {invoiceDetails?.soldBy || "sales-harish"}
                </div>
            </div>
        </div>
    );
};

export default ReturnPrintModal;
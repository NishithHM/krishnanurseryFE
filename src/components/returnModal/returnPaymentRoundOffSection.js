import React, { useState, useEffect } from 'react';
import styles from './returnPaymentRoundOff.module.css';
import { set } from 'lodash';

const PaymentRoundOffSection = ({ 
  returnTotal, 
  onPaymentChange, 
  onRoundOffChange,
  initialPaymentType = 'BOTH',
  initialRoundOff = 0,
  disabled = false
}) => {
  const [paymentType, setPaymentType] = useState(initialPaymentType);
  const [roundOff, setRoundOff] = useState(initialRoundOff);
  const [cashAmount, setCashAmount] = useState(0);
  const [onlineAmount, setOnlineAmount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDisabled, setDisabled] = useState(false);

  useEffect(() => {
    const totalAfterRoundOff = returnTotal + roundOff;
    setFinalTotal(totalAfterRoundOff);

    
    // Auto-calculate cash and online amounts based on payment type
    if (paymentType === 'CASH') {
      setCashAmount(totalAfterRoundOff);
      setOnlineAmount(0);
    } else if (paymentType === 'ONLINE') {
      setCashAmount(0);
      setOnlineAmount(totalAfterRoundOff);
    } else if (paymentType === 'BOTH') {
      // For BOTH, let user manually set amounts
      if (cashAmount + onlineAmount !== totalAfterRoundOff) {
        setCashAmount(totalAfterRoundOff / 2);
        setOnlineAmount(totalAfterRoundOff / 2);
      }
    }
  }, [returnTotal, roundOff, paymentType]);

  useEffect(() => {
    // Notify parent component about changes
    if (onPaymentChange) {
      onPaymentChange({
        paymentType,
        cashAmount,
        onlineAmount,
        finalTotal
      });
    }
  }, [paymentType, cashAmount, onlineAmount, finalTotal, onPaymentChange]);

  useEffect(() => {
    if (onRoundOffChange) {
      onRoundOffChange(roundOff);
    }
  }, [roundOff, onRoundOffChange]);

  const handlePaymentTypeChange = (e) => {
    setPaymentType(e.target.value);
  };

  const handleRoundOffChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    const roundOffLimit = Math.min(500, returnTotal * 0.1);

    const correctValue = value <= roundOffLimit;
    if (!correctValue) {
        setError(true);
        setErrorMessage("Round Off limit exceeded.");
        setCashAmount(0);
        setOnlineAmount(0);
        setDisabled(true);
    }
    else {
        setError(false);
        setDisabled(false);
    }
    setRoundOff(value);
  };

  const handleCashAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const correctValue = value <= finalTotal;
    if (!correctValue) {
        setError(true);
        setErrorMessage("Cash amount exceeded total amount.");
    }
    else {
        setError(false);
    }
    setCashAmount(correctValue? value : 0);
    
    if (paymentType === 'BOTH') {
      setOnlineAmount(correctValue? finalTotal - value : 0);
    }
  };

  const handleOnlineAmountChange = (e) => {
    const value = parseFloat(e.target.value) || 0;
    const correctValue = value <= finalTotal;
    if (!correctValue) {
        setError(true);
        setErrorMessage("Online amount exceeded total amount.");
    }
    else {
        setError(false);
    }
    setOnlineAmount(correctValue? value : 0);
    
    if (paymentType === 'BOTH') {
      setCashAmount(correctValue? finalTotal - value : 0);
    }
  };

  return (
    <div className={styles.paymentRoundOffSection}>
      {/* Summary Row */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Sub Total</span>
          <span className={styles.value}>₹{returnTotal.toFixed(2)}</span>
        </div>
        
        <div className={styles.summaryItem}>
          <span className={styles.label}>Round Off</span>
          <input
            type="number"
            step="1"
            min="0"
            value={roundOff}
            onChange={handleRoundOffChange}
            className={styles.roundOffInput}
            disabled={disabled}
          />
        </div>
        
        <div className={styles.summaryItem}>
          <span className={styles.label}>Total</span>
          <span className={styles.value}>₹{finalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Section */}
      <div className={styles.paymentSection}>
        <div className={styles.paymentTypeSection}>
          <span className={styles.label}>Payment Type *</span>
          <select 
            value={paymentType} 
            onChange={handlePaymentTypeChange}
            className={styles.paymentTypeSelect}
            disabled={disabled}
          >
            <option value="CASH">CASH</option>
            <option value="ONLINE">ONLINE</option>
            <option value="BOTH">BOTH</option>
          </select>
        </div>

        <div className={styles.amountInputs}>
          <div className={styles.amountInput}>
            <span className={styles.label}>Cash Amount *</span>
            <input
              type="number"
              step="1"
              value={errorDisabled? 0 : cashAmount}
              onChange={handleCashAmountChange}
              className={styles.amountField}
              disabled={disabled || paymentType === 'ONLINE' || errorDisabled}
              readOnly={paymentType === 'CASH'}
            />
          </div>

          <div className={styles.amountInput}>
            <span className={styles.label}>Online Amount *</span>
            <input
              type="number"
              step="0.01"
              value={errorDisabled? 0 : onlineAmount}
              onChange={handleOnlineAmountChange}
              className={styles.amountField}
              disabled={disabled || paymentType === 'CASH' || errorDisabled}
              readOnly={paymentType === 'ONLINE'}
            />
          </div>

          <div className={styles.paymentInfo}>
            <span className={styles.label}>Payment Info</span>
            <span className={styles.infoText}>
              {paymentType === 'CASH' && 'Cash Payment'}
              {paymentType === 'ONLINE' && 'Online Payment'}
              {paymentType === 'BOTH' && 'Mixed Payment'}
            </span>
          </div>
        </div>
      </div>

      {isError && (
          <div style={{ color: 'red', marginTop: '10px', fontSize: '14px' }}>
              {errorMessage}
          </div>
      )}
    </div>
  );
};

export default PaymentRoundOffSection;
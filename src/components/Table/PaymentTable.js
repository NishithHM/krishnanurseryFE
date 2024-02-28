import React, { useEffect, useState } from "react";
import styles from "./table.module.css";
import cx from "classnames";
import sort from "../../assets/images/sort.png";

const PaymentTable = ({ data, onSortBy }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const filteredData = windowWidth <= 600 ? data.slice(1) : data;
  
  if (data.length === 1) {
    return (
      <span
        style={{
          textAlign: "center",
          fontSize: "1.5rem",
        }}
      >
        <p>No Data</p>
      </span>
    );
  }

  return (
    <>
    {windowWidth < 600 ?
      (
        <div className="tableContainer">
          {filteredData.map((curelem, index) => {
            return (
              <div className="card" key={index}>
                <div className="values">
                <div className="leftValue">
                  <p>Date</p>
                  <p>Created Date</p>
                  <p>Amount Paid</p>
                  <p>Bill Number</p>
                </div>
                <div className="rightValue">
                  <p>{curelem[0].value}</p>
                  <p>{curelem[1].value}</p>
                  <p>{curelem[2].value}</p>
                  <p>{curelem[3].value}</p>
                  
                </div>
                </div>
                <p className="viewDetails">{curelem[4].value}</p>
              </div>
            );
          })}
        </div>
      ) : 
       (
      <>
    <div>
      <table className={styles.table}>
        <tbody>
          {data.map((rows, rIndex, id) => (
            <tr
              key={rIndex}
              className={cx(
                styles.tableCommon,
                { [`${styles.tableHeader}`]: rIndex === 0 },
                { [`${styles.tableDataCommon}`]: rIndex !== 0 },
                { [`${styles.tableColorWhite}`]: rIndex % 2 === 0 }
              )}
            >
              {rows.map((dataVal, dIndex) => (
                <td
                  className={cx({ [`${styles.tableHeader}`]: rIndex === 0 })}
                  key={dIndex}
                >
                  {dataVal.value}
                  {dataVal.isSortable && (
                    <img
                      onClick={() => onSortBy(dataVal.sortBy)}
                      className={styles.sort}
                      src={sort}
                      alt="sort"
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  )
  }
  </>)
};

export default PaymentTable;

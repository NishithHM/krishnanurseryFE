import React, { useEffect, useState } from "react";
import styles from "./table.module.css";
import cx from "classnames";
import sort from "../../assets/images/sort.png";

const OrderTable = ({ data, onSortBy }) => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showDetail, setShowDetail] = useState(false)
  const [cardData, setCardData] = useState({})
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

  const HandleViewDetails = (value1, value2, value3, value4, value5, value6, value7) => {
      setShowDetail(true)
      const newData = {
        Name: value1,
        CreatedOn: value2,
        SalesDesc: value3, 
        ExpectedDelivery: value4,
        ProcDesc: value5,
        Status: value6,
        Action: value7
      }

      setCardData(newData)
  }

  return (
    <>
    {windowWidth < 700 ?
      (
        <div className="tableContainer">
          {filteredData.map((curelem, index) => {
            return (
              <div className="card" key={index}>
                <div className="values">
                <div className="leftValue">
                  <p>Name</p>
                  <p>Created On</p>
                  <p>Sales Desc</p>
                  <p>Expected Delivery</p>
                  <p>Proc Desc</p>
                  <p>Status</p>
                  <p>Action</p>
                </div>
                <div className="rightValue">
                  <p>{curelem[0].value}</p>
                  <p>{curelem[1].value}</p>
                  <p>{curelem[2].value}</p>
                  <p>{curelem[4].value}</p>
                  <p>{curelem[5].value}</p>
                  <p>{curelem[6].value}</p>
                  <p>{curelem[7].value}</p>
                </div>
                </div>
                <p className="view" onClick={() => HandleViewDetails(curelem[0].value, curelem[1].value, curelem[2].value, curelem[4].value, curelem[5].value, curelem[6].value, curelem[7].value)}>View more</p>
              </div>
            );
          })}
          <div style={{display: showDetail ? 'grid' : 'none'}} className="viewDetail">
            <div className="popupCard">
            <div className="values">
                <div className="leftValue">
                  <p>Name</p>
                  <p>Created On</p>
                  <p>Sales Desc</p>
                  <p>Expected Delivery</p>
                  <p>Proc Desc</p>
                  <p>Status</p>
                  <p>Action</p>
                </div>
                <div className="rightValue">
                  <p>{cardData.Name}</p>
                  <p>{cardData.CreatedOn}</p>
                  <p>{cardData.SalesDesc}</p>
                  <p>{cardData.ExpectedDelivery}</p>
                  <p>{cardData.ProcDesc}</p>
                  <p>{cardData.Status}</p>
                  <p>{cardData.Action}</p>
                </div>
                </div>
                <p className="close" onClick={() => setShowDetail(false)}>Close</p>
            </div>
          </div>
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

export default OrderTable;

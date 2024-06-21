import React from "react";
import styles from "./table.module.css";
import cx from "classnames";
import sort from "../../assets/images/sort.png";

const Table = ({ data, onSortBy }) => {
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

  console.log(data, "data...");

  return (
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
  );
};

export default Table;

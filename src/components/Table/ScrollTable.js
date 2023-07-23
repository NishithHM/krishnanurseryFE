import React from "react";
import styles from "./table.module.css";
import cx from "classnames";

export default function ScrollTable({ thead, tbody, scroll = true }) {
  console.log(tbody);
  return (
    <div
      className={cx(styles.scrollTable, styles.scrollTableWrapper, {
        [`${styles.noScrollTable}`]: !scroll,
      })}
    >
      <table className={cx(styles.table, styles.printableTable)}>
        <thead>
          <tr className={styles.tableHeader}>
            {thead &&
              thead.map((item, index) => (
                <th
                  key={index}
                  // width={item.width}
                  className={styles.tableHeader}
                >
                  {item.value}
                </th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tbody.length > 0 &&
            tbody.map((item, index) => {
              return (
                <tr
                  key={index}
                  className={cx(styles.tableCommon, styles.tableDataCommon, {
                    [`${styles.tableColorWhite}`]: index % 2 == 0,
                  })}
                >
                  {item &&
                    item.map((row, i) => {
                      return <td key={i}>{row.value}</td>;
                    })}
                </tr>
              );
            })}
        </tbody>
      </table>
      {tbody.length === 0 && (
        <div className={styles.noItemToDisplay}>No Items to display</div>
      )}
    </div>
  );
}

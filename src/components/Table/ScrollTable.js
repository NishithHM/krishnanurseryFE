import React from "react";
import styles from "./table.module.css";
import cx from "classnames";

export default function ScrollTable({ thead, tbody, scroll = true }) {
  return (
    <>
      <div>
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              {thead &&
                thead.map((item, index) => (
                  <th
                    key={index}
                    width={item.width}
                    className={styles.tableHeader}
                  >
                    {item.value}
                  </th>
                ))}
            </tr>
          </thead>
        </table>
      </div>
      <div
        className={cx(styles.scrollTable, styles.scrollTableWrapper)}
        style={{
          maxHeight: scroll ? "426px" : "auto",
          overflow: scroll ? "auto" : "visible",
        }}
      >
        {tbody.length === 0 ? (
          <div className={styles.noItemToDisplay}>No Items to display</div>
        ) : (
          <table className={cx(styles.table, styles.printableTable)}>
            <tbody>
              {tbody &&
                tbody.map((item, index) => {
                  return (
                    <tr
                      key={index}
                      className={cx(
                        styles.tableCommon,
                        styles.tableDataCommon,
                        { [`${styles.tableColorWhite}`]: index % 2 == 0 }
                      )}
                    >
                      {item &&
                        item.map((row, i) => {
                          return (
                            <td width={thead[i].width} key={i}>
                              {row.value}
                            </td>
                          );
                        })}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

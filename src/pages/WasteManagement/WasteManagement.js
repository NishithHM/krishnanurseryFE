import React, { useState } from "react";
import styles from "./WasteManagement.module.css";
import { BackButton, Button, Dropdown, Input } from "../../components";
import { AiOutlineClose } from "react-icons/ai";
import DropZone from "../../components/Dropzone/Dropzone";

const WasteManagement = () => {
    const [invoiceFile, setInvoiceFile] = useState(null);
  return (
    <div>
      <div>
        <BackButton navigateTo={"/authorised/dashboard/access-management"} />
      </div>
      <div className={styles.wrapper}>
        <h1 className={styles.header}>Waste Management</h1>

        <form className={styles.innerWrapper}>
          <Dropdown title="Plant Name" placeholder="Select Role" />

          <Input title="Expected Remaining Quantity" type="number" />
          <Input title="Damaged Quantity" type="number" />
          <div>
            <div>
              <p style={{ fontSize: "22px", lineHeight: "35px", margin: 0 }}>
                Upload Image
                <span
                  style={{
                    color: "red",
                  }}
                >
                  *
                </span>
              </p>
            <p style={{ fontSize: "18px" }}>File Selected</p>
            {invoiceFile ? (
              <div>
                <p style={{ fontSize: "18px" }}>File Selected</p>
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
                  <span>{invoiceFile.name}</span>

                  <AiOutlineClose onClick={() => setInvoiceFile(null)} />
                </div>
              </div>
            ) : (
              <DropZone
                onDrop={(files) => {
                  console.log(files);
                }}
                maxSize={3 * 1024 ** 2}
                maxFiles="1"
                multiple={false}
                maxFileSize="5"
              />
            )}
               </div>
          </div>
          <div className={styles.formButton}>
            <Button type="primary" title="Save" buttonType="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default WasteManagement;

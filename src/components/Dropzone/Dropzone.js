import React, { useEffect, useState } from "react";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import {
  AiOutlineCloudUpload,
  AiOutlineClose,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { ImFilesEmpty } from "react-icons/im";
import { toast } from "react-toastify";

const DropZone = ({
  onDrop,
  onReject,
  maxSize,
  maxFiles,
  multiple,
  accept,
  maxFileSize,
}) => {
  // if (files) {
  //   return (
  //     <div>
  //       <p style={{ fontSize: "18px" }}>File Selected</p>
  //       <div
  //         style={{
  //           display: "flex",
  //           alignItems: "center",
  //           justifyContent: "space-between",
  //           border: "2px dashed black",
  //           borderRadius: "7px",
  //           padding: "10px",
  //           margin: 0,
  //         }}
  //       >
  //         <span>{files.name}</span>

  //         <AiOutlineClose onClick={() => setFile(null)} />
  //       </div>
  //     </div>
  //   );
  // }
  return (
    <Dropzone
      onDrop={onDrop}
      onReject={onReject}
      maxSize={maxSize}
      maxFiles={maxFiles}
      multiple={multiple}
      accept={accept}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
        }}
      >
        <Dropzone.Accept>
          <AiOutlineCloudUpload size="3.2rem" stroke={1.5} color={"#e2e2e2"} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <AiOutlineCloseCircle size="3.2rem" stroke={1.5} color={"red"} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <ImFilesEmpty size="3.2rem" stroke={1.5} />
        </Dropzone.Idle>

        <div style={{ color: "#8e8e8e" }}>
          <span>Drag images here or click to select files</span>
          <br />
          <span>File should not exceed {maxFileSize}mb</span>
          {maxFiles > 1 && (
            <span>
              <br />
              Maximum {maxFiles} are allowed
            </span>
          )}
        </div>
      </div>
    </Dropzone>
  );
};

export default DropZone;

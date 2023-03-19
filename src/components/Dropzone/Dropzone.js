import React, { useEffect, useState } from "react";
import { Dropzone, DropzoneProps, MIME_TYPES } from "@mantine/dropzone";
import {
  AiOutlineCloudUpload,
  AiOutlineClose,
  AiOutlineCloseCircle,
} from "react-icons/ai";
import { ImFilesEmpty } from "react-icons/im";
import { toast } from "react-toastify";

const DropZone = ({ getFile }) => {
  const [file, setFile] = useState(null);
  useEffect(() => {
    getFile(file);
  }, [file]);

  if (file) {
    return (
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
          <span>{file.name}</span>

          <AiOutlineClose onClick={() => setFile(null)} />
        </div>
      </div>
    );
  }
  return (
    <Dropzone
      onDrop={(files) => setFile(files[0])}
      onReject={(files) =>
        toast.error(files[0].errors[0].code.replaceAll("-", " "))
      }
      maxSize={3 * 1024 ** 2}
      maxFiles="1"
      multiple={false}
      accept={[MIME_TYPES.png, MIME_TYPES.jpeg, MIME_TYPES.pdf]}
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
          <span>file should not exceed 5mb</span>
        </div>
      </div>
    </Dropzone>
  );
};

export default DropZone;

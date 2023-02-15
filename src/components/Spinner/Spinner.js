import React from "react";
import { Loader } from "@mantine/core";

const Spinner = () => {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "Center",
        justifyContent: "center",
        margin: "2rem 0",
      }}
    >
      <Loader color="green" />
    </div>
  );
};

export default Spinner;

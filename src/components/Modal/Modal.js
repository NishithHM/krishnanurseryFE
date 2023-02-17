import React from "react";
import Modal from "react-modal";

const AppModal = ({ isOpen, children }) => {
  const customModalStyles = {
    content: {
      backgroundColor: "transparent",
      border: "none",
      overflow: "hidden",
    },
  };
  Modal.setAppElement("#modal");

  return (
    <Modal isOpen={isOpen} style={customModalStyles} contentLabel="Delete User">
      <div
        style={{
          // background: "red",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </Modal>
  );
};

export default AppModal;

import React, { useState } from "react";
import styled from "styled-components";
import { BiPowerOff } from "react-icons/bi";
import { Modal, Button as BootstrapButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const PopUpModal = ({
  bodyText,
  handleOnClick,
  submitButtonText,
  buttonIcon,
}) => {
  const [showModal, setShowModal] = useState(false);
  const renderButtonIcon = () => {
    if (buttonIcon) {
      // If a custom button icon is provided, use it
      return buttonIcon;
    }
    // Default to BiPowerOff icon if no custom icon is provided
    return <BiPowerOff />;
  };
  return (
    <>
      <Button onClick={() => setShowModal(true)}>{renderButtonIcon()}</Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body
          style={{
            backgroundColor: "#0d0d30",
            color: "white",
          }}
        >
          {bodyText}
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#0d0d30", color: "white" }}>
          <BootstrapButton
            className="cancel-btn"
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </BootstrapButton>
          <BootstrapButton
            className="logout-btn"
            style={{ backgroundColor: "#9a86f3", border: "none" }}
            variant="primary"
            onClick={() => {
              handleOnClick();
              setShowModal(false);
            }}
          >
            {submitButtonText}
          </BootstrapButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #9a86f3;
  border: none;
  cursor: pointer;
  svg {
    font-size: 1.3rem;
    color: #ebe7ff;
  }
`;

export default PopUpModal;

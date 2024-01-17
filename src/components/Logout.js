import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { BiPowerOff } from "react-icons/bi";
import { Modal, Button as BootstrapButton } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Logout = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        <BiPowerOff />
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Body
          style={{
            backgroundColor: "#0d0d30",
            color: "white",
          }}
        >
          Are you sure you want to logout?
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
              handleLogout();
              setShowModal(false);
            }}
          >
            Logout
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

export default Logout;

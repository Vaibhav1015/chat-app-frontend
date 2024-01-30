import React from "react";
import styled from "styled-components";
import Robot from "../assets/robot.gif";
const Welcome = ({ headerText, currentUser, bodyText }) => {
  return (
    <Container>
      <img src={Robot} alt="robot" />
      {headerText && (
        <h1>
          {headerText}
          <span>{currentUser}</span>
        </h1>
      )}
      {bodyText && <h3>{bodyText}</h3>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: white;
  img {
    height: 20rem;
  }
  span {
    color: #4e00ff;
  }
`;

export default Welcome;

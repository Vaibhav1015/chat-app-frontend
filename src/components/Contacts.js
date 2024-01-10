import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Logo from "../assets/logo.svg";
const Contacts = ({ contacts, changeChat }) => {
  const [currentUsername, SetCurrentUsername] = useState(undefined);
  const [currentUserImage, SetCurrentUserImage] = useState(undefined);
  const [currentSelected, SetCurrentSelected] = useState(undefined);
  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));

      SetCurrentUserImage(data.avatarImage);
      SetCurrentUsername(data.username);
    };
    fetchData();
  }, []);

  const changeCurrentChat = (index, contact) => {
    SetCurrentSelected(index);
    changeChat(contact);
  };
  return (
    <>
      {currentUserImage && currentUsername && (
        <Container>
          <div className="brand">
            <img src={Logo} alt="logo" className="main_logo" />
            <h3>chat-app</h3>
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  key={index}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt="avatar"
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
                className="user_img"
              />
            </div>
            <div className="username">
              <h2>{currentUsername}</h2>
            </div>
          </div>
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    justify-content: center;
    gap: 1rem;
    img {
      height: 2rem;
    }

    h3 {
      color: white;
      text-transform: uppercase;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    gap: 0.8rem;
    &::::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff39;
      min-height: 5rem;
      width: 90%;
      cursor: pointer;
      border-radius: 0.2rem;
      padding: 0.4rem;
      gap: 1rem;
      align-items: center;
      display: flex;
      transition: 0.5s ease-in-out;

      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
    .selected {
      background-color: #9186f3;
    }
  }
  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
  @media (max-width: 768px) {
    .contacts {
      width: 100%;
    }
    .brand {
      display: block;
    }

    .contact {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 5px !important;
    }

    h3 {
      white-space: nowrap;
      font-size: 17px;
    }
    .avatar img {
      height: 3rem !important;
    }
    .current-user {
      align-items: start !important;
      flex-direction: column;
      gap: 0;
    }
    .user_img {
      margin-left: 20px !important;
    }
    .username {
      margin-left: 10px;
    }
    .main_logo {
      width: 100%;
    }
  }
`;

export default Contacts;

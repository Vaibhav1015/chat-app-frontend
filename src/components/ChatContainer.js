import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import {
  deleteMessages,
  getAllMessageRoute,
  sendMessageRoute,
} from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";
import trashIcon from "../assets/trash.svg";
import PopUpModal from "./PopUpModal";
const ChatContainer = ({ currentChat, socket }) => {
  const [messages, SetMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

  const handleSelectMessage = (messageId) => {
    setSelectedMessages((prevSelected) => {
      const isSelected = prevSelected.includes(messageId);
      if (isSelected) {
        return prevSelected.filter((selectedId) => selectedId !== messageId);
      } else {
        return [...prevSelected, messageId];
      }
    });
  };

  // const canDeleteMessage = (message) => {
  //   // Allow deleting only if the message is sent by the current user
  //   return message.fromSelf;
  // };

  const handleDeleteSelectedMessages = async () => {
    try {
      // Send a DELETE request to the server
      await axios.delete(deleteMessages, {
        data: { messageIds: selectedMessages },
      });
      // Update the state to remove deleted messages
      const updatedMessages = messages.filter(
        (message) => !selectedMessages.includes(message._id)
      );
      SetMessages(updatedMessages);
      setSelectedMessages([]);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));
      if (currentChat) {
        const response = await axios.post(getAllMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        SetMessages(response.data);
      }
    };

    fetchData();
  }, [currentChat]);

  useEffect(() => {
    const getCurrentChat = async () => {
      if (currentChat) {
        await JSON.parse(localStorage.getItem("chat-app-user"))._id;
      }
    };
    getCurrentChat();
  }, [currentChat]);

  const handleSendMsg = async (msg, media, formData) => {
    const data = await JSON.parse(localStorage.getItem("chat-app-user"));

    try {
      formData = new FormData();
      formData.append("from", data._id);
      formData.append("to", currentChat._id);
      formData.append("media", media);
      formData.append("message", msg);

      if (media !== null && msg.length === 0) {
        socket.current.emit("send-media", {
          to: currentChat._id,
          from: data._id,
          media,
        });
      }

      if ((msg.length !== 0) & (media === null)) {
        socket.current.emit("send-msg", {
          to: currentChat._id,
          from: data._id,
          message: msg,
        });
      }

      const sendMessageData = await axios.post(sendMessageRoute, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const messageId = sendMessageData.data.data._id;

      const updatedMessages = [
        ...messages,
        {
          fromSelf: true,
          message: { text: msg, mediaUrl: media },
          _id: messageId,
        },
      ];
      SetMessages(updatedMessages);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const fetchData = () => {
      if (socket.current) {
        socket.current.on("msg-recieve", (msg) => {
          const newMsg = { text: msg };
          setArrivalMessage({ fromSelf: false, message: newMsg });
        });
      }

      socket.current.on("media-recieve", (mediaNew) => {
        setArrivalMessage({ fromSelf: false, message: mediaNew });
      });
    };
    fetchData();
  }, [socket]);

  useEffect(() => {
    const fetchData = () => {
      arrivalMessage && SetMessages((prev) => [...prev, arrivalMessage]);
    };
    fetchData();
  }, [arrivalMessage]);

  useEffect(() => {
    const fetchData = () => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    fetchData();
  }, [messages]);

  return (
    <>
      {currentChat && (
        <Container>
          <div className="chat-header">
            <div className="user-details">
              <div className="avatar">
                <img
                  src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
                  alt="avatar"
                />
              </div>
              <div className="username">
                <h3>{currentChat.username}</h3>
              </div>
            </div>
            {/* Delete button here */}
            {selectedMessages.length > 0 && (
              <PopUpModal
                bodyText="Are you sure you want to delete selected messages?"
                handleOnClick={handleDeleteSelectedMessages}
                submitButtonText="Delete"
                buttonIcon={
                  <img
                    src={trashIcon}
                    alt="trash-icon"
                    width="20"
                    height="20"
                  />
                }
              />
            )}
          </div>
          <div className="chat-messages">
            {messages.map((message) => {
              return (
                <div ref={scrollRef} key={uuidv4()}>
                  <div
                    className={`message ${
                      message.fromSelf ? "sended" : "received"
                    }`}
                  >
                    <div className="content">
                      {/* Display media content if it's a media message */}
                      {message.message.mediaUrl ? (
                        <img
                          src={message.message.mediaUrl}
                          alt="Media"
                          style={{ height: "200px", width: "200px" }}
                        />
                      ) : (
                        // Display text content if it's a text message
                        <p className="message-text">{message.message.text}</p>
                      )}
                      {/* Checkbox for selecting messages */}
                      {message.fromSelf && (
                        <input
                          type="checkbox"
                          className="checkbox-btn"
                          checked={selectedMessages.includes(message._id)}
                          onChange={() => handleSelectMessage(message._id)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <ChatInput handleSendMsg={handleSendMsg} />
        </Container>
      )}
    </>
  );
};

const Container = styled.div`
  padding-top: 1rem;
  display: grid;
  grid-template-rows: 10% 78% 12%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
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
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    .message {
      display: flex;
      align-items: center;
      .content {
        position: relative;
        display: flex;
        align-items: center;
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 0.5rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        .checkbox-btn {
          opacity: 0;
          transition: opacity 0.3s ease;
          margin: 10px;
        }
        .message-text {
          margin-bottom: 0rem;
        }
      }
      .content:hover .checkbox-btn,
      .checkbox-btn:checked {
        opacity: 1;
      }
    }

    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }

    .received {
      justify-content: flex-start;
    }
  }

  .trash-btn {
    background: transparent;
    border: none;
  }
`;

export default ChatContainer;

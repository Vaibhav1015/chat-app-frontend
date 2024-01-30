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
import moment from "moment";
import Searchbar from "./Searchbar";
import Welcome from "./Welcome";

const ChatContainer = ({ currentChat, socket }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();
  const [searchQuery, setSearchQuery] = useState("");

  const filterMessages = () => {
    return messages.filter((message) =>
      message.message.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const formatMessageTime = (createdAt) => {
    return moment(createdAt).format("h:mm A");
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await JSON.parse(localStorage.getItem("chat-app-user"));
      if (currentChat) {
        const response = await axios.post(getAllMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
        setMessages(response.data);
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
      setMessages(updatedMessages);
      setSelectedMessages([]);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

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
      const createdAt = sendMessageData.data.data.createdAt;

      const updatedMessages = [
        ...messages,
        {
          fromSelf: true,
          message: { text: msg, mediaUrl: media },
          _id: messageId,
          createdAt,
        },
      ];
      setMessages(updatedMessages);
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

        socket.current.on("media-recieve", (mediaNew) => {
          setArrivalMessage({ fromSelf: false, message: mediaNew });
        });
      }
    };
    fetchData();
  }, [socket]);

  useEffect(() => {
    const fetchData = () => {
      arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
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
            <div className="chat-functions">
              {selectedMessages.length === 0 && (
                <Searchbar setSearchQuery={setSearchQuery} />
              )}

              {/* Delete button here */}
              {selectedMessages.length > 0 && (
                <>
                  <div style={{ color: "#d1d1d1", fontSize: "16px" }}>
                    Selected {selectedMessages.length}
                  </div>
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
                </>
              )}
            </div>
          </div>

          {messages.length > 0 ? (
            <div className="chat-messages scrollbar" id="style-1">
              {filterMessages().map((message, index) => {
                const isToday = moment().isSame(
                  moment(message.createdAt),
                  "day"
                );
                const isNewDay =
                  index === 0 ||
                  !moment(messages[index - 1].createdAt).isSame(
                    moment(message.createdAt),
                    "day"
                  );

                return (
                  <div key={uuidv4()}>
                    {isNewDay && (
                      <div
                        style={{
                          color: "#d1d1d1",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        {isToday
                          ? "Today"
                          : moment(message.createdAt).isSame(
                              moment().subtract(1, "day"),
                              "day"
                            )
                          ? "Yesterday"
                          : moment(message.createdAt).format("DD-MM-YYYY")}
                      </div>
                    )}
                    <div ref={scrollRef}>
                      <div
                        className={`message ${
                          message.fromSelf ? "sended" : "received"
                        }`}
                      >
                        <div className="message-box">
                          {/* Display media content if it's a media message */}
                          {message.message.mediaUrl ? (
                            <img
                              src={message.message.mediaUrl}
                              alt="Media"
                              style={{ height: "200px", width: "200px" }}
                            />
                          ) : (
                            // Display text content if it's a text message
                            <div className="content">
                              <p className="message-text">
                                {message.message.text}
                              </p>
                            </div>
                          )}
                          {/* Checkbox for selecting messages */}
                          <div className="message-time">
                            {formatMessageTime(message.createdAt)}
                          </div>
                        </div>
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
          ) : (
            <Welcome bodyText={`Start chat with ${currentChat.username}`} />
          )}
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
    .chat-functions {
      display: flex;
      gap: 10px;
      align-items: center;
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
      .checkbox-btn {
        opacity: 0;
        transition: opacity 0.3s ease;
        margin: 0px 10px;
      }
      .content {
        position: relative;
        display: flex;
        align-items: center;

        overflow-wrap: anywhere;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;

        .message-text {
          margin-bottom: 0rem;
        }
      }

      .message-time {
        font-size: 10px;
        color: white;
        text-align: end;
        padding: 5px 0px 0px 25px;
      }
      .message-box {
        background-color: #ffffff34;
        border-radius: 5px;
        padding: 0px 10px 0px 5px;
        max-width: 70%;
      }
    }

    .sended:hover .checkbox-btn,
    .checkbox-btn:checked {
      opacity: 1;
    }
    .sended {
      justify-content: flex-end;
      display: flex;
      align-items: end;
    }

    .received {
      justify-content: flex-start;
    }
  }

  .trash-btn {
    background: transparent;
    border: none;
  }

  /* Hide scrollbar buttons (arrows) */
  #style-1::-webkit-scrollbar {
    width: 8px;
  }

  #style-1::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    background-color: #f5f5f5;
  }

  #style-1::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background-color: #555;
  }

  /* Additional styles for the scrollbar container */

  .force-overflow {
    min-height: 450px;
  }

  /* Additional styles for the scrollbar container in Firefox */
  .scrollbar::-webkit-scrollbar {
    width: 0.5em;
  }

  .scrollbar::-webkit-scrollbar-track {
    background: #f5f5f5;
  }

  .scrollbar::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 10px;
  }

  /* Additional styles for the wrapper to hide the default scrollbar */
  #wrapper {
    text-align: center;
    width: 500px;
    margin: auto;
    overflow: hidden; /* Hide the default scrollbar on the wrapper */
  }

  /* Hide scrollbar buttons (arrows) in WebKit */
  .scrollbar::-webkit-scrollbar-button {
    display: none;
  }
`;

export default ChatContainer;

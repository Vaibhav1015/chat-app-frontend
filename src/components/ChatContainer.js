import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import axios from "axios";
import { getAllMessageRoute, sendMessageRoute } from "../utils/APIRoutes";
import { v4 as uuidv4 } from "uuid";
const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const [messages, SetMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const scrollRef = useRef();

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

      await axios.post(sendMessageRoute, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedMessages = [
        ...messages,
        { fromSelf: true, message: { text: msg, mediaUrl: media } },
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
          console.log(msg, "msg from socket");
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
            {/* <Logout /> */}
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
                        <p>{message.message.text}</p>
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
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
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
`;

export default ChatContainer;

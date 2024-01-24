import React, { useState } from "react";
import styled from "styled-components";
import Picker from "emoji-picker-react";
import { IoMdSend } from "react-icons/io";
import { BsEmojiSmileFill } from "react-icons/bs";
import attachFile from "../assets/attachfile.svg";

const ChatInput = ({ handleSendMsg, formData }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [msg, setMsg] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleEmojiPickerHideShow = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiClick = (emoji) => {
    let message = msg;
    message += emoji.emoji;
    setMsg(message);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setSelectedFile(file);

    // Create a FileReader to read the image file and set the preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const sentChat = (e) => {
    e.preventDefault();

    if (msg.trim().length > 0 || selectedFile) {
      // Check if either message or file is present
      handleSendMsg(msg, selectedFile, formData);
      setMsg("");
      setSelectedFile(null); // Reset selected file after sending
      setImagePreview(null);
    }
  };

  return (
    <Container>
      <div className="button-container">
        <div className="emoji">
          <BsEmojiSmileFill onClick={handleEmojiPickerHideShow} />
          {showEmojiPicker && <Picker onEmojiClick={handleEmojiClick} />}
        </div>
      </div>
      <form className="input-container" onSubmit={(e) => sentChat(e)}>
        <div className="image-upload">
          <label htmlFor="file-input">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <img src={attachFile} alt="Attach File" />
            )}
          </label>
          <input id="file-input" type="file" onChange={handleFileChange} />
        </div>
        <input
          type="text"
          placeholder="Type your message here"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
        />
        <button className="submit">
          <IoMdSend />
        </button>
      </form>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 5% 95%;
  align-items: center;
  background-color: #080420;
  padding: 0.2rem;
  padding-bottom: 0.3rem;
  .button-container {
    margin: 10px;
    .emoji {
      position: relative;
      svg {
        font-size: 1.5rem;
        color: #9186f3;
        cursor: pointer;
        margin: 0px 05px;
      }
      .EmojiPickerReact {
        position: absolute;
        top: -465px;
        background-color: #080420;
        box-shadow: 0 5px 10px #9a86f3;
        border-color: #9a86f3;
        .emoji-scroll-wrapper::-webkit-scrollbar {
          background-color: #080420;
          width: 5px;
          &-thumb {
            background-color: #9186f3;
          }
        }
        .emoji-categories {
          button {
            filter: contrast(0);
          }
        }
        .emoji-search {
          background-color: transparent;
          border-color: #9186f3;
        }
        .emoji-group:before {
          background-color: #080420;
        }
      }
    }
  }

  .input-container {
    width: 100%;
    border-radius: 2rem;
    display: flex;
    align-items: center;
    background-color: #ffffff34;
    justify-content: space-between;
    input {
      width: 90%;
      background-color: transparent;
      color: white;
      border: none;
      padding-left: 1rem;
      font-size: 1.2rem;
      &::selection {
        background-color: #9186f3;
      }
      &:focus {
        outline: none;
      }
    }
    button {
      padding: 0.3rem 2rem;
      border-radius: 2rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #9a86f3;
      border: none;
      svg {
        font-size: 2rem;
        color: white;
      }
    }
  }
  .contacts {
    width: 65%;
  }
  .contact {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px !important;
  }

  h3 {
    white-space: nowrap;
  }
  .avatar img {
    height: 3rem !important;
  
    marg
  }
  .current-user {
    align-items: start !important;
    flex-direction: column;
    gap: 0;
  }
  .user_img{
    margin-left: 20px !important;
  }
  .username{
    margin-left: 10px;
  }
}
@media (max-width: 768px) {
  .input-container input {
    font-size: 15px !important;
    padding-left:2rem !important;
  }
}
 .input-container button {
  padding: 1.3px 0.5rem !important;
}
.input-container {
  gap: 0rem !important;
}


.image-upload{
  margin: 0px 15px;
}

.image-upload > input
{
    display: none;
}

.image-upload img
{
    width: 25px;
    height:25px;
    cursor: pointer;
    transform: rotate(-25deg);
}

`;

export default ChatInput;

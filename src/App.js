import React, { useState, useRef, useEffect } from "react";
import env from "./.env";
import {
  Modal,
  Button,
  Backdrop,
  Fade,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { Avatar } from "@mui/material";
import chatgptAvatar from "./chatgptAvatar.png";
import userAvatar from "./userAvatar.png";
import MinimizeIcon from "@mui/icons-material/Minimize";

const style = {
  position: "fixed",
  bottom: "24px",
  right: "24px",
  width: 320,
  maxHeight: "70vh",
  overflowY: "auto",
  bgcolor: "white",
  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  p: 1,
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
};

const buttonStyle = {
  fontWeight: "bold",
  padding: "8px 16px",
  // backgroundColor: "blue",
  color: "white",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  bottom: "24px",
  right: "24px",
  position: "inherit",
  marginLeft: 10,
};

const modalStyle = {
  fontWeight: "bold",
  padding: "8px 16px",
  backgroundColor: "#f2f2f2",
  color: "black",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  position: "fixed",
  bottom: "24px",
  right: "24px",
};

const messageStyle = {
  marginBottom: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  padding: "8px",
  borderRadius: "4px",
};

const userMessageStyle = {
  ...messageStyle,
  backgroundColor: "#f2f2f2",
  // color: "black",
};

const chatgptMessageStyle = {
  ...messageStyle,
  backgroundColor: "#f9f9f9",
  color: "#555555",
};

const apiKey = env.REACT_APP_API_KEY;
const apiUrl = env.REACT_APP_API_BASE;
const model = env.REACT_APP_API_MODEL;

function App() {
  const chatBoxRef = useRef(null);

  const [open, setOpen] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  useEffect(() => {
    chatBoxRef.current?.scrollTo({
      top: chatBoxRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    const newMessage = {
      role: "user",
      content: inputValue,
    };
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputValue("");

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [...chatMessages, { role: "user", content: inputValue }],
        }),
      });
      const data = await response.json();

      const assistantReply = data.choices[0]?.message?.content;
      if (assistantReply) {
        const assistantMessage = {
          role: "assistant",
          content: assistantReply,
        };
        setChatMessages((prevMessages) => [...prevMessages, assistantMessage]);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="App" style={{ backgroundColor: "black" }}>
      <Button onClick={handleOpen} style={modalStyle}>
        Talk to ChatGPT
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box
            sx={{ ...style, position: "fixed", height: "30%", width: "15%" }}
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                handleSendMessage();
              }
            }}
          >
            <div style={{ display: "flex" }}>
              <Typography fontSize="15px" fontWeight="bold" padding="5px">
                Ask ChatGPT
              </Typography>
              <Button
                onClick={handleClose}
                style={{
                  padding: 6,
                  margin: "0 auto",
                  left: 100,
                  right: 0,
                  top: 0,
                  height: "30px",
                  fontWeight: "bold",
                }}
              >
                <MinimizeIcon />
              </Button>
            </div>
            <div
              ref={chatBoxRef}
              style={{ flex: "1", overflowY: "auto", fontWeight: "normal" }}
            >
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "8px",
                  }}
                >
                  {message.role === "assistant" ? (
                    <Avatar
                      src={chatgptAvatar}
                      alt="ChatGPT Avatar"
                      sx={{
                        height: "25px",
                        width: "25px",
                        marginRight: "4px",
                        marginTop: "2px",
                      }}
                    />
                  ) : (
                    <Avatar
                      src={userAvatar}
                      alt="User Avatar"
                      sx={{
                        height: "25px",
                        width: "25px",
                        marginRight: "4px",
                        marginTop: "2px",
                      }}
                    />
                  )}
                  <Typography
                    style={
                      message.role === "user"
                        ? userMessageStyle
                        : chatgptMessageStyle
                    }
                  >
                    {message.role === "user" ? "You: " : "ChatGPT: "}
                    {message.content}
                  </Typography>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <TextField
                fullWidth
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Type your question here..."
                variant="outlined"
                size="small"
                autoComplete="off"
              />

              <Button
                onClick={handleSendMessage}
                style={buttonStyle}
                variant="contained"
              >
                Send
              </Button>
            </div>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}

export default App;

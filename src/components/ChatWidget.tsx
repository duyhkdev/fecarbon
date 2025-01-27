import React, { useState, useEffect, useRef } from "react";
import { Button, Card, List, Input, Spin } from "antd";
import { MessageOutlined, SendOutlined } from "@ant-design/icons";
import { sendMessage } from "../services/api";

const { TextArea } = Input;

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false); // Điều khiển popup
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Trạng thái đang soạn tin nhắn
  const [buttonPosition, setButtonPosition] = useState({
    x: window.innerWidth - 100,
    y: window.innerHeight / 2,
  }); // Vị trí nút chat

  // Ref để cuộn xuống danh sách tin nhắn
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const togglePopup = () => {
    setOpen(!open);

    // Khi mở popup, di chuyển nút chat lên đầu popup
    if (!open) {
      setButtonPosition({
        x: window.innerWidth - 324,
        y: window.innerHeight - 450,
      }); // Điều chỉnh vị trí để khớp với popup
    } else {
      // Khi đóng popup, đưa nút chat về vị trí ban đầu
      setButtonPosition({
        x: window.innerWidth - 100,
        y: window.innerHeight / 2,
      });
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "User", text: input }]);
    setInput("");
    setIsTyping(true); // Hiển thị trạng thái "Đang soạn tin nhắn"

    try {
      const response = await sendMessage(input);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: response.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "Bot", text: "Lỗi khi gửi tin nhắn." },
      ]);
    } finally {
      setIsTyping(false); // Ẩn trạng thái "Đang soạn tin nhắn"
    }
  };

  // Hàm cuộn xuống cuối danh sách
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Gọi scrollToBottom khi danh sách tin nhắn thay đổi
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <>
      {/* Nút hình tròn */}
      <Button
        type="primary"
        shape="circle"
        icon={<MessageOutlined />}
        size="large"
        style={{
          position: "fixed",
          left: `${window.innerWidth - 40}px`, // Sát với bên phải popup
          top: open ? `${buttonPosition.y - 5}px` : `${buttonPosition.y}px`, // Di chuyển lên khi popup mở
          zIndex: 1001, // Nút luôn nằm trên tiêu đề
          transform: "translate(-50%, -50%)", // Căn chỉnh chính xác
        }}
        onClick={togglePopup}
      />

      {/* Popup Chat */}
      {open && (
        <Card
          style={{
            position: "fixed",
            bottom: 80,
            right: 24,
            width: 300,
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: 8,
          }}
          bodyStyle={{
            padding: "0", // Loại bỏ padding của Card
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          {/* Header Tiêu Đề Cố Định */}
          <div
            style={{
              backgroundColor: "#0078d7",
              color: "#fff",
              textAlign: "center",
              padding: "10px",
              fontWeight: "bold",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
            }}
          >
            Chat Bot
          </div>

          {/* Nội dung chat */}
          <div
            style={{
              flex: 1,
              overflowY: "auto", // Kích hoạt scroll cho nội dung chat
              padding: "10px",
            }}
          >
            <List
              dataSource={[
                ...messages,
                ...(isTyping ? [{ sender: "Bot", text: "..." }] : []),
              ]}
              locale={{
                emptyText: (
                  <div style={{ textAlign: "center", color: "black" }}>
                    {/* <img
                      src="https://example.com/your-image.png"
                      alt="What can I help with?"
                      style={{ width: "100px", marginBottom: "10px" }}
                    /> */}
                    <h3>What can I help with?</h3>
                  </div>
                ),
              }}
              renderItem={(msg, index) => (
                <List.Item
                  key={index}
                  style={{
                    textAlign: msg.sender === "User" ? "right" : "left",
                    wordWrap: "break-word",
                  }}
                >
                  {msg.text === "..." && msg.sender === "Bot" ? (
                    <Spin size="small" /> // Hiển thị biểu tượng soạn tin nhắn
                  ) : (
                    <strong>{msg.sender}:</strong>
                  )}{" "}
                  {msg.text}
                </List.Item>
              )}
            />
            {/* Ref để cuộn tới cuối */}
            <div ref={messagesEndRef} />
          </div>
          {/* Input và nút gửi */}
          <div style={{ padding: "10px", borderTop: "1px solid #ddd" }}>
            <TextArea
              rows={2}
              placeholder="Nhập tin nhắn..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              style={{
                resize: "none",
              }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              style={{ marginTop: "10px", width: "100%" }}
            >
              Gửi
            </Button>
          </div>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;

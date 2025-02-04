import React, { useState, useEffect, useRef } from "react";
import { Input, Button, List, Tooltip, message, Spin } from "antd";
import { SendOutlined, PaperClipOutlined, FileOutlined, GlobalOutlined } from "@ant-design/icons";
import { sendMessage } from "../services/api";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css"; // Import KaTeX styles

const { TextArea } = Input;

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false); // Trạng thái đang soạn tin nhắn
  const [textareaRows, setTextareaRows] = useState(1); // Số dòng của TextArea
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref để cuộn xuống

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "User", text: input }]);
    setInput("");
    setTextareaRows(1); // Reset số dòng khi gửi xong
    setIsTyping(true);

    try {
      const response = await sendMessage(input);
      setMessages((prev) => [...prev, { sender: "TCCV Bot", text: response.response }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { sender: "TCCV Bot", text: "Lỗi khi gửi tin nhắn." }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Cuộn xuống cuối mỗi khi tin nhắn mới xuất hiện
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Hiển thị thông báo khi nhấn vào biểu tượng
  const handleIconClick = () => {
    message.info("Chức năng đang nâng cấp");
  };

  // Điều chỉnh số dòng TextArea khi nhập nội dung
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Tính số dòng cần thiết dựa trên nội dung
    const lineBreaks = value.split("\n").length;
    setTextareaRows(Math.min(5, lineBreaks)); // Giới hạn tối đa 5 dòng
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e", // Nền đen
        color: "#ffffff", // Màu chữ trắng
        height: "100vh", // Full chiều cao màn hình
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "10px",
        }}
      >
        <List
          dataSource={[...messages, ...(isTyping ? [{ sender: "TCCV Bot", text: "..." }] : [])]}
          locale={{
            emptyText: (
              <div style={{ textAlign: "center", color: "#fff" }}>
                {/* <img
                  src="https://example.com/your-image.png"
                  alt="What can I help with?"
                  style={{ width: "100px", marginBottom: "10px" }}
                /> */}
                <h2>What can I help with?</h2>
              </div>
            ),
          }}
          renderItem={(msg, index) => (
            <List.Item
              key={index}
              style={{
                display: "flex",
                justifyContent: msg.sender === "User" ? "flex-end" : "flex-start",
                margin: "5px 0",
              }}
            >
              <div
                style={{
                  backgroundColor: msg.sender === "User" ? "#0078d7" : "#333",
                  color: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  maxWidth: "70%",
                  wordWrap: "break-word",
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    backgroundColor: msg.sender === "User" ? "#005bb5" : "#444",
                    color: "#fff",
                    padding: "5px 10px",
                    borderRadius: "5px",
                    fontWeight: "bold",
                    display: "inline-block",
                    marginBottom: "5px",
                  }}
                >
                  {msg.sender === "User" ? "Bạn" : "TCCV Bot"}
                </div>
          
                <ReactMarkdown remarkPlugins={[remarkMath]}>{msg.text}</ReactMarkdown>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #333",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#333",
          borderRadius: "8px", // Bo góc cho toàn khung
          margin: "10px", // Khoảng cách với các cạnh
        }}
      >
        {/* Các biểu tượng bên trái */}
        <div style={{ display: "flex", gap: "10px", marginRight: "10px" }}>
          <Tooltip title="Đính kèm">
            <PaperClipOutlined
              style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
              onClick={handleIconClick}
            />
          </Tooltip>
          <Tooltip title="Gửi file">
            <FileOutlined
              style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
              onClick={handleIconClick}
            />
          </Tooltip>
          <Tooltip title="Ngôn ngữ">
            <GlobalOutlined
              style={{ fontSize: "18px", color: "#fff", cursor: "pointer" }}
              onClick={handleIconClick}
            />
          </Tooltip>
        </div>

        {/* TextArea */}
        <TextArea
          rows={textareaRows}
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          style={{
            resize: "none",
            flex: 1,
            border: "1px solid #555", // Border cho TextArea
            outline: "none",
            backgroundColor: "transparent",
            color: "#fff",
            borderRadius: "8px",
            padding: "10px",
          }}
        />

        {/* Nút gửi */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          style={{
            height: "40px",
            width: "40px",
            borderRadius: "50%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginLeft: "10px",
          }}
        />
      </div>
    </div>
  );
};

export default ChatBox;

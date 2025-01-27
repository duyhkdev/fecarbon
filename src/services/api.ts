import axios from "axios";

const API_URL = "https://carboncredits-tccv-edu-chatbot.hf.space/query"; // Thay bằng URL API của bạn

export interface ChatRequest {
  user_message: string;
}

export interface ChatResponse {
  response: string;
}

export const sendMessage = async (message: string): Promise<ChatResponse> => {
  const payload: ChatRequest = { user_message: message };
  const { data } = await axios.post<ChatResponse>(API_URL, payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return data;
};

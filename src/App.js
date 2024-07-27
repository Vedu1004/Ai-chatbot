import "./App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { useState, useEffect, useRef } from "react";
import loader from "./images/loader.gif";
const App = () => {
  const genAI = new GoogleGenerativeAI(
    "AIzaSyCkmvzY94R_T1AZdn88zS9xF3YuZj371bA"
  );
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const chatBoxRef = useRef(null);

  const { transcript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    setInputText(transcript);
  }, [transcript]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="error">Browser doesn't support speech recognition.</div>
    );
  }

  const sendToGemini = async () => {
    if (!inputText.trim()) return;
    const userMessage = { type: "user", content: inputText };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const result = await model.generateContent(userMessage.content);
      const response = await result.response;
      const text = response.text();
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "ai", content: text },
      ]);
    } catch (error) {
      console.error("Error sending to Gemini:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          type: "ai",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
    setIsLoading(false);
  };

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: true, language: "en-IN" });
    }
    setIsListening(!isListening);
  };

  return (
    <div className="app-container" src="/b1.jpg">
      <img id="myVideo" src="/b2.jpg"></img>
      {/* <video autoPlay muted loop id="myVideo">
        <source src="/b1.jpg" type="image/jpg" />
        Your browser does not support the video tag.
      </video> */}
      <div className="chat-container">
        <header>
          <h1>Gem-In-E (Speech to text)</h1>
        </header>
        <div className="chat-box" ref={chatBoxRef}>
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">{message.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-content"></div>
              <img src={loader} alt="Loading..." className="loader-gif" />
            </div>
          )}
        </div>
        <div className="input-area">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message..."
            onKeyPress={(e) => e.key === "Enter" && sendToGemini()}
          />
          <button
            onClick={toggleListening}
            className={`icon-button ${isListening ? "recording" : ""}`}
            title={isListening ? "Stop Recording" : "Start Recording"}
          >
            {isListening ? "◉" : "◯"}
          </button>
          <button
            onClick={sendToGemini}
            disabled={isLoading || !inputText.trim()}
            className="icon-button send"
            title="Send"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

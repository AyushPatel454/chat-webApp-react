import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import "./chat.css";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  // use useRef for scroll .chat to bottom
  const endRef = useRef(null);

  const { chatId } = useChatStore();

  useEffect(() => {
    // scroll chat to bottom.
    endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [])

  useEffect(() => {
    // Fetching realtime data from the firestore.
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub()
    };
  }, [chatId])

  console.log(chat);

  const handleEmoji = (e) => {
    console.log(e);
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  return (
    <div className="chat">
      {/* ---> Top (User avatar, name & icons [call, video, info]) */}
      <div className="top">
        <div className="user">
          <img src="./avatar.png" alt="" />
          <div className="texts">
            <span>Jane Doe</span>
            <p>Lorem ipsum dolor.</p>
          </div>
        </div>

        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>

      {/* ---> Chat */}
      <div className="center">
        {
          chat?.messages?.map((message) => (
              <div className="message own" key={message?.createAt}>
                <div className="texts">
                  {message.img && <img src={message.img} alt="" />}
                  <p>{message.text}</p>
                  {/* <span>1 min ago</span> */}
                </div>
              </div>
          ))
        }

        <div ref={endRef}></div>
      </div>

      {/* ---> Bottom (Icons [img, camera, mic], input, emoji picker & send button) */}
      <div className="bottom">
        <div className="icons">
          <img src="./img.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>

        <input
          type="text"
          value={text}
          placeholder="Type a message..."
          onChange={(e) => setText(e.target.value)}
        />

        <div className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <div className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} searchDisabled={true} />
          </div>
        </div>
        <button className="sendButton">Send</button>
      </div>
    </div>
  );
};

export default Chat;

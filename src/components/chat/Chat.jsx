import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import "./chat.css";
import upload from "../../lib/upload";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [chat, setChat] = useState();
  const [img, setImg] = useState({
    file: null,
    url: '',
  });
  // use useRef for scroll .chat to bottom
  const endRef = useRef(null);

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

  useEffect(() => {
    // Fetching realtime data from the firestore.
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub()
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    console.log(e);
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  function handleImage(e) {
    if(e.target.files[0]) {
        setImg({
            file: e.target.files[0],
            url: URL.createObjectURL(e.target.files[0]),
        });
    }
  }

  const handleSend = async () => {
    if(text === "" && !img.file) return;

    let imgUrl = null;

    // Send message to firestore.
    try {

      if(img.file) {
        imgUrl = await upload(img.file);
      }



      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createAt: new Date(),
          ...(imgUrl && {img: imgUrl}),
        })
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {

        const userChatsRef = doc(db, 'userchats', id);
        const userChatSnapshot = await getDoc(userChatsRef);

        if(userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex((chat) => chat.chatId === chatId);

          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updateAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });

    } catch (error) {
      console.log(error);
    }
    
    setImg({
      file: null,
      url: '',
    });
    setText("");
    // endRef.current.scrollIntoView({ behavior: "smooth" });
  }

  const handleMessageChange = (e) => {
    // if user press enter key then send message
    if(e.key === 'Enter') {
      handleSend();
    }
    setText(e.target.value)
  }

  return (
    <div className="chat">
      {/* ---> Top (User avatar, name & icons [call, video, info]) */}
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username || "You are Blocked"}</span>
            {/* <p>Lorem ipsum dolor.</p> */}
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
        {img.url && (
          <div className="message own">
            <div className="texts">
              <img src={img.url} alt="" />
              <p>Click on Send button for send image...</p>
              <p onClick={() => setImg({file: null, url: ''})} style={{cursor: 'pointer'}}>Or Click here to Cancel...</p>
            </div>
          </div>
        )}
        {
          chat?.messages?.map((message) => (
              <div 
                className={`message ${message.senderId === currentUser.id ? 'own' : ''}`} 
                key={message?.createAt}
              >
                <div className="texts">
                  {message.img && <img src={message.img} alt="" />}
                  <p>{message.text}</p>
                  {/* <span>1 min ago</span> */}
                </div>
              </div>
          )).reverse()
        }


        <div ref={endRef}></div>
      </div>

      {/* ---> Bottom (Icons [img, camera, mic], input, emoji picker & send button) */}
      <div className="bottom">  
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{display: 'none'}} onChange={handleImage} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>

        <input
          type="text"
          value={text}
          onKeyDown={(e) => handleMessageChange(e)}
          placeholder={
            (isCurrentUserBlocked || isReceiverBlocked) 
              ? "You can't send a message." 
              : "Type a message..."
          }
          onChange={(e) => handleMessageChange(e)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
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
        <button 
          className="sendButton" 
          onClick={handleSend}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;

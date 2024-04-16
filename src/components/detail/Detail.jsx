import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useChatStore } from '../../lib/chatStore';
import { auth, db } from '../../lib/firebase'
import { useUserStore } from '../../lib/userStore';
import './detail.css'
import { useEffect, useState } from 'react';

const Detail = () => {

  const [sharedImage, setSharedImage] = useState([]);
  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const [openImages, setOpenImages] = useState(true);

  useEffect(() => {
    // Fetching realtime data from the firestore.
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      // const { messages } = res.data();
      // const images = messages.filter((msg) => msg.img).map((msg) => msg.img);
      

      const { messages } = res.data();
      const images = messages.reduce((acc, msg) => {
        if (msg.img) {
          acc.push({url: msg.img, createAt: msg.createAt.seconds});
        }
        return acc;
      }, []);

      setSharedImage(images);
    });

    return () => {
      unSub()
    };
  }, [chatId]);

  // ---> Logout
  const handleLogout = () => {
    auth.signOut();
  }

  // ---> Block User
  const handleBlock = async () => {
    if(!user) return;
    const userDocRef = doc(db, 'users', currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id)
      });

      changeBlock(); // update isReceiverBlocked state
    } catch (error) {
      console.log(error);
    }
  }

  // ---> Toggle Images
  const toggleImages = () => {
    setOpenImages(!openImages);
  }

  // ---> Download Image
  const handleDownloadImage = async (img, name) => {
    var element = document.createElement("a");
    var file = new Blob(
      [
        img
      ],
      { type: "image/*" }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${name}.jpeg`;
    element.click();

    // const link = document.createElement('a');
    // link.href = img;
    // link.download = `${name}` + '.jpg';
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
  }

  return (
    <div className='detail'>
      {/* ---> User */}
      <div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username || 'Blocked User'}</h2>
        <p>{user?.email || ''}</p>
      </div>

      {/* ---> Info */}
      <div className="info">

        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & help</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <div className="option">
          <div className="title" onClick={toggleImages}>
            <span>Shared photos</span>
            <img src={openImages ? "./arrowDown.png" : "./arrowUp.png"} alt="" />
          </div>
          {openImages && <div className="photos">
            {sharedImage.map((img, index) => (
              <div className="photoItem" key={`${chatId}_${currentUser.id}_${index}`}>
                <div className="photoDetail">
                  <img src={img.url} alt="" />
                  <span>{img.createAt}.jpg</span>
                  {/* <span>photo_{index}.png</span> */}
                </div>
                <img src="./download.png" alt="" className='icon' onClick={() => handleDownloadImage(img.url, img.createAt)} />
            </div>
            )).reverse()}
          </div>}
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>

        <button onClick={handleBlock}>
          {
            isCurrentUserBlocked 
              ? "You are Blocked!" 
              : isReceiverBlocked 
              ? "User Blocked" 
              : 'Block User'
          }
          </button>
        <button className='logout' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  )
}

export default Detail

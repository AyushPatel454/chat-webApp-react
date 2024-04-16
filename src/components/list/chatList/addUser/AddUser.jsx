import { useState } from 'react';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { useUserStore } from '../../../../lib/userStore';
import './addUser.css'

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  // ---> Handle search by user name
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');


    try {
      const userRef = collection(db, 'users');

      // Create a query against the collection.
      const q = query(userRef, where('username' , '==' , username))

      const querySnapshot = await getDocs(q);

      if(!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleAdd = async () => {

    const chatRef = collection(db, 'chats');
    const userChatRef = collection(db, 'userchats');

    try {
      // Retrive the chat list of the current user & check if the user is already in the chat list
      const userDocRef = doc(db, 'userchats', currentUser.id); // userchats/uid
      const userDocSnap = await getDoc(userDocRef);
      
      // CHECK RECEIVER USER IS ALREADY IN CHAT LIST ?
      const isUserExist = userDocSnap.data().chats.some(chat => chat.receiverId === user.id);

      if(isUserExist) {
        console.log('User is already in the chat list');
        return;
      }


      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        })
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: '',
          receiverId: user.id,
          updatedAt: Date.now(),
        })
      });

    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text" placeholder='Username' name='username' />
        <button>Search</button>
      </form>

      {user && (
        <div className="user">
          <div className="detail">
              <img src={user.avatar || "./avatar.png"} alt="" />
              <h3>{user.username}</h3>
          </div>
          {user.id !== currentUser.id && <button onClick={handleAdd}>Add User</button>}
        </div>
      )}
    </div>
  )
}

export default AddUser

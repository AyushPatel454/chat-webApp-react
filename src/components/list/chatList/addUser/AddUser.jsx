import { collection, getDocs, query, where } from 'firebase/firestore';
import './addUser.css'
import { db } from '../../../../lib/firebase';
import { useState } from 'react';

const AddUser = () => {
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');

    try {
      const userRef = collection(db, 'users');

      // Create a query against the collection.
      const q = query(userRef, where('username' , '==' , username))

      const querySnapshot = await getDocs(q);
      console.log(querySnapshot);

      if(!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      }
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
          <button>Add User</button>
        </div>
      )}
    </div>
  )
}

export default AddUser

import { useEffect } from "react";
import Chat from "./components/chat/Chat"
import Detail from "./components/detail/Detail"
import List from "./components/list/List"
import Login from "./components/login/Login";
import Notifications from "./components/notifications/Notifications";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {

  const {currentUser, isLoading, fetchUserInfo} = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    // Clean up function.
    return () => {
      unSub();
    }
  }, [fetchUserInfo]);

  if(isLoading) {
    return (
      <div className='loading'>
        Loading...
      </div>
    )
  }

  return (
    <div className='container'>
      {
        currentUser ? (
          <>
            <List />
            {chatId && <><Chat /> <Detail /></> }
            
          </>
        ) : <Login />
      }
      <Notifications />
    </div>
  )
}

export default App
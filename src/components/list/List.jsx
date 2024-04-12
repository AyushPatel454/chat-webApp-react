import UserInfo from './userInfo/UserInfo'
import './list.css'
import ChatLIst from './chatList/ChatLIst'

const List = () => {
  return (
    <div className='list'>
      <UserInfo />
      <ChatLIst />
    </div>
  )
}

export default List

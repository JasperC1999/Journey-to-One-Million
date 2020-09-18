import React, { useState, useEffect, FC, useRef} from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { GlobalStyle, Main } from './app.styles';
// import Header from '../header';
import PlayerStats from './playerStats/playerStats';
import UserDeity from './userDeity/userDeity';
import TopUsers from './topUsers/topUsers';
// import UsernameForm from '../usernameForm/usernameForm';
import { animateCounter, numberToCommaSeperatedString } from '../helpers';
import Faker from 'faker';
import { UserContext } from './userContext';
import UserStar from './userStar/userStar';
import Header from '../header';


interface User {
  user_name: string;
  user_clicks: number;
  id: number;
}

let user_session_clicks: number = 0;
let global_session_clicks: number = 0;

const App: FC = () => {
  const [global_clicks, set_global_clicks] = useState<number>(0);
  const [user_name, set_user_name] = useState<string>('');
  const [user_clicks, set_user_clicks] = useState<number>(0);
  const [top_users, set_top_users] = useState<ReadonlyArray<User>>([]);
  const [user_id, set_user_id] = useState<number>(0);
  const [user_star_rect, set_user_star_rect] = useState<DOMRect>();

  const user_name_ref = useRef<string>('');
  user_name_ref.current = user_name;

  const user_session_clicks_ref = useRef<number>(0);
  user_session_clicks_ref.current = user_session_clicks;

  const global_session_clicks_ref = useRef<number>(0);
  global_session_clicks_ref.current = global_session_clicks;

  const global_clicks_ref = useRef<number>(0);
  global_clicks_ref.current = global_clicks;

  const user_clicks_ref = useRef<number>(0);
  user_clicks_ref.current = user_clicks;

  const user_id_ref = useRef<number>(0);
  user_id_ref.current = user_id;

  useEffect(() => {
    getGlobalClicks();
    getTopUsers();
    if (!localStorage.getItem('user_id')) {
      registerUser()
        .then(() => logInUser());
    } else {
      logInUser();
    }
    const timer = setInterval(() => clicksLifeCycle(), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.title = numberToCommaSeperatedString(global_clicks);
  }, [ global_clicks ]);

  const clicksLifeCycle = async () => {
    await updateGlobalClicks();
    await getGlobalClicks();
    await updateUserClicks();
    await getTopUsers();
  }

  const getGlobalClicks = async () => {
    const response = await axios.get('/global_clicks');
    const newClicks = response.data.rows[0].click_count;
    if (newClicks > global_clicks_ref.current) {
      // animateCounter(global_clicks_ref.current, newClicks, 3000, global_clicks_ref.current, set_global_clicks);
    }
  }

  const updateGlobalClicks = async () => {
    const clicks_to_update_global = global_session_clicks_ref.current;
    try {
      const response = await axios.put('/global_clicks', {
        clicks: clicks_to_update_global
      });
      global_session_clicks = global_session_clicks_ref.current - clicks_to_update_global;
      return response;
    } catch (err) {
      console.error(err);
    }
  }

  const registerUser = async () => {
    localStorage.clear();
    localStorage.setItem('user_name', Faker.name.firstName());
    try {
      const response = await axios.post('/user', { user_name: localStorage.getItem('user_name') });
      localStorage.setItem('user_id', response.data.id);
    } catch (err) {
      console.error(err);
    }
  }

  const logInUser = async () => {
    try {
      const response = await axios.get(`/user?id=${localStorage.getItem('user_id')}`);
      if (response.data === 'That user does not exist') {
        registerUser()
          .then(() => logInUser());
      } else {
        if (!localStorage.getItem('user_id')) localStorage.setItem('user_id', response.data.id);
        set_user_name(response.data.user_name);
        set_user_clicks(response.data.user_clicks);
        set_user_id(response.data.id);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const updateUserClicks = async () => {
    const clicks_to_update_user_total = user_session_clicks_ref.current;
    try {
      await axios.put('/user', {
        id: user_id_ref.current,
        clicks: clicks_to_update_user_total,
      });
      user_session_clicks = user_session_clicks_ref.current - clicks_to_update_user_total;
    } catch (err) {
      console.error(err);
    }
  }

  const getTopUsers = async () => {
    try {
      const response = await axios.get('/users');
      set_top_users(response.data);
    } catch (err) {
      console.error(err);
    }
  }

  const buttonClickHandler = (): void => {
    set_global_clicks(global_clicks + 1);
    set_user_clicks(user_clicks + 1);
    user_session_clicks++;
    global_session_clicks++;
  }



  return (
    <>
      <GlobalStyle />
      <UserContext.Provider value='test'>
        <Header />
        <Main >
          <UserStar user_star_rect={user_star_rect} user_clicks={user_clicks} set_user_star_rect={set_user_star_rect}/>
          <UserDeity user_star_rect={user_star_rect} user_id={user_id} set_user_name={set_user_name} user_name={user_name} buttonClickHandler={buttonClickHandler} />
        </Main>
        <TopUsers users={top_users}/>

      </UserContext.Provider>
    </>
  );
}


export default App;

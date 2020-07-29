import React, { useState, useEffect, FC, FormEvent, useRef} from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { GlobalStyle, All, Main, Counter, Greeting, UserClicksSubheading, BigButton } from './styles';
import NavBar from './navBar';
import LoginForm from './loginForm';
import SignUpForm from './signUpForm'
import TopUsers from './topUsers';
import { Button } from '@material-ui/core';

import Faker from 'faker';

// import { Switch, Route, useHistory } from 'react-router-dom';


interface User {
  readonly user_name: string;
  readonly user_clicks: number;
}

let session_clicks: number = 0;


const App: FC = () => {
  const [global_clicks, set_global_clicks] = useState<number>(0);
  const [user_name, set_user_name] = useState<string>('');
  const [user_clicks, set_user_clicks] = useState<number>(0);
  const [top_users, set_top_users] = useState<ReadonlyArray<User>>([]);
  const [user_id, set_user_id] = useState<number>();

  const user_name_ref = useRef<string>('');
  user_name_ref.current = user_name;

  const session_clicks_ref = useRef<number>(0);
  session_clicks_ref.current = session_clicks;

  const global_clicks_ref = useRef<number>(0);
  global_clicks_ref.current = global_clicks;

  useEffect(() => {
    getGlobalClicks();
    getTopUsers();
    console.log(localStorage.getItem('user_name'));
    if (!localStorage.getItem('user_name')) {
      localStorage.setItem('user_name', Faker.name.firstName());
      registerUser(localStorage.getItem('user_name')!)
        .then(() => logInUser(localStorage.getItem('user_name')!));
    } else {
      logInUser(localStorage.getItem('user_name')!);
    }
    const timer = setInterval(() => clicksLifeCycle(), 3000);
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    document.title = global_clicks.toString();
  }, [ global_clicks ]);

  const clicksLifeCycle = (): void => {
    updateGlobalClicks()
    .then(getGlobalClicks)
    .then(updateUserClicks)
    .then(getTopUsers);
  }

  const getGlobalClicks = (): Promise<void | AxiosResponse<any>> => {
    return axios.get('/global_clicks')
      .then((response: AxiosResponse) => {
        console.log(response);
        if (response.data.rows[0].click_count > global_clicks_ref.current) {
          animateCounter(global_clicks_ref.current, response.data.rows[0].click_count, 3000, set_global_clicks);
        }
      })
      .catch((err: AxiosError) => console.error(err));
  }

  const updateGlobalClicks = (): Promise<void | AxiosResponse<any>> => {
    return axios.put('/global_clicks', {
      clicks: session_clicks_ref.current
    })
    .catch((err) => console.error(err));
  }

  const registerUser = (user_name: string): Promise<any> => {
    return axios.post('/user', { user_name })
      .then((response: AxiosResponse) => {
        set_user_name(response.data.user_name);
        localStorage.setItem('user_id', response.data.id);
        set_user_id(response.data.id);
        session_clicks = 0;
    })
    .catch((err) => console.error(err));
  }

  const logInUser = (user_name: string): void => {
    axios.get(`/user?u=${user_name}`)
    .then((response: AxiosResponse) => {
      if (response.data === 'That user does not exist') {
        alert(response.data);
      } else {
        set_user_name(response.data.user_name);
        set_user_clicks(response.data.user_clicks);
      }
    })
    .catch((err: AxiosError) => console.error(err));
  }

  const updateUserClicks = (): Promise<void | number> => {
    return axios.put('/user', {
      user_name: user_name_ref.current,
      clicks: session_clicks_ref.current,
    })
    .then(() => session_clicks = 0)
    .catch((err: AxiosError) => console.error(err));
  }

  const getTopUsers = (): Promise<void> => {
    return axios.get('/users')
      .then((response: AxiosResponse) => set_top_users(response.data))
      .catch((err: AxiosError) => console.error(err));
  }

  // const loginSubmitHandler = (e: React.FormEvent): void => {
  //   e.preventDefault();
  //   logInUser(user_name);
  // }

  // const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  //   e.preventDefault();
  //   set_user_name(e.target.value);
  // }

  const buttonClickHandler = (): void => {
    set_global_clicks(global_clicks + 1);
    set_user_clicks(user_clicks + 1);
    session_clicks++;
  }

  const formatNumbers = (x: number): (string | number) => {
    if (x < 999) return x;
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const animateCounter = (start: number, end: number, duration: number, setter: React.Dispatch<React.SetStateAction<number>>): void => {
    const range = end - start;
    const startTime = new Date() as unknown as number;
    const timer = setInterval(() => {
        const timePassed = new Date() as unknown as number - startTime;
        let progress = timePassed / duration;
        if (progress > 1) progress = 1;
        setter(start + Math.round(progress * range));
        if (progress === 1) {
          clearInterval(timer);
        }
    }, 10);
  }

  return (
    <>
      <GlobalStyle />
      <NavBar user_name={user_name} user_clicks={formatNumbers(user_clicks)} />
      <All>
        <Main>
          {/* <Greeting>{`Hello, ${user_name}`}</Greeting> */}
          <Counter>
            {/* <span style={{fontSize: '48px'}}>Global:</span> */}
            {/* <br /> */}
            {formatNumbers(global_clicks)}
          </Counter>
          <UserClicksSubheading>
            your clicks: {formatNumbers(user_clicks)}
          </UserClicksSubheading>
          {/* <ButtonDiv>
          <Button onClick={buttonClickHandler}>Click Me!</Button>
          </ButtonDiv> */}
          {/* <div style={{ 'position': 'absolute'}}> */}
            <BigButton variant="outlined" onClick={buttonClickHandler}>Click Me!</BigButton>
          {/* </div> */}
        </Main>
        <TopUsers users={top_users} animateCount={animateCounter} formatNumbers={formatNumbers} />
      </All>
    </>
  );
}


export default App;
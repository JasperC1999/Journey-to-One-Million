import React, { useState, useEffect, FC, useRef, useContext} from 'react';
import axios from 'axios';
import { GlobalStyle } from './app.styles';
import Main from './main/main';
import TopUsers from './topUsers/topUsers';
import { numberToCommaSeperatedString } from '../helpers';
import { EnergyColorContext, UserContext, PlanetEnergyColorContext } from './contexts';
import Header from '../header';
import { useGlobalIntervalState } from './useGlobalIntervalState';
import { useAuth } from './useAuth';

let userSessionClicks = 0;
let globalSessionClicks = 0;

const App: FC = () => {
  const [userClicks, setUserClicks] = useState<number>(0);
  const [userPlanetRect, setUserPlanetRect] = useState<DOMRect>();
  const [energyColor, setEnergyColor] = useState<[number, number, number]>([64, 191, 255]);
  const [userPower, setUserPower] = useState<number>(1);
  const [planetEnergyColor, setPlanetEnergyColor] = useState<[number, number, number]>([0,0,0]);
  const { globalClicks, previousGlobalClicks, topUsers } = useGlobalIntervalState();
  const { username, setUsername, userId } = useAuth(setUserClicks);

   // -------REFS FOR CALLBACKS---------------\\
  const userSessionClicksRef = useRef<number>(0);
  userSessionClicksRef.current = userSessionClicks;

  const globalSessionClicksRef = useRef<number>(0);
  globalSessionClicksRef.current = globalSessionClicks;

  const planetEnergyColorRef = useRef(planetEnergyColor);
  planetEnergyColorRef.current = planetEnergyColor;

  const userIdRef = useRef<number>(0);
  userIdRef.current = userId;
  //-------------------------------------------//



  useEffect(() => {
    const timer = setInterval(() => clicksLifeCycle(), 3000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    document.title = numberToCommaSeperatedString(globalClicks);
  }, [ globalClicks ]);

  const clicksLifeCycle = async () => {
    await updateGlobalClicks();
    await updateUserData();
  }

  const updateGlobalClicks = async () => {
    const clicksToUpdateGlobal = globalSessionClicksRef.current;
    try {
      const response = await axios.put('/globalClicks', {
        clicks: clicksToUpdateGlobal
      });
      globalSessionClicks = globalSessionClicksRef.current - clicksToUpdateGlobal;
      return response;
    } catch (err) {
      console.error(err);
    }
  }

  const updateUserData = async () => {
    const clicksToUpdateUserTotal = userSessionClicksRef.current;
    try {
      await axios.put('/user', {
        id: userIdRef.current,
        energyColor: JSON.stringify(planetEnergyColorRef.current),
        clicks: clicksToUpdateUserTotal,
      });
      userSessionClicks = userSessionClicksRef.current - clicksToUpdateUserTotal;
    } catch (err) {
      console.error(err);
    }
  }

  const incrementClicks = (): void => {
    setUserClicks(userClicks + userPower);
    userSessionClicks += userPower;
    globalSessionClicks += userPower;
  }


  return (
    <>
      <GlobalStyle />
      <PlanetEnergyColorContext.Provider value={{ planetEnergyColor, setPlanetEnergyColor }}>
      <EnergyColorContext.Provider value={{ energyColor, setEnergyColor }} >
      <UserContext.Provider value={{ userClicks, username, userId, setUsername, userLvl: 1, userPower, setUserPower }} >
        <Header
          previousClicks={previousGlobalClicks}
          globalClicks={globalClicks}
        />
        <Main
          userPlanetRect={userPlanetRect}
          setUserPlanetRect={setUserPlanetRect}
          incrementClicks={incrementClicks}
        />
        <TopUsers users={topUsers} />
      </UserContext.Provider>
      </EnergyColorContext.Provider>
      </PlanetEnergyColorContext.Provider>

    </>
  );
}


export default App;

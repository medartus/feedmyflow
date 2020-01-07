import React, { useState, useMemo } from 'react';
import { BrowserRouter, Route, Switch,Redirect } from "react-router-dom";
import Menu from './view/menu/menu';
import Home from './view/home/home';
import Login from './view/login/login';
import MyCalendar from './view/calendar/calendar';
import ProtectedRoute from "./components/protectedRoute/protectedRoute";
import { AuthContext } from './context/authContext';

import './App.css';

export const App = () => {
const [authStatus,setAuthStatus] = useState({status:"disconnected",triedLogin:false});
const authProvider = useMemo(() => ({authStatus,setAuthStatus}), [authStatus,setAuthStatus])

  return (
    <BrowserRouter>
      <AuthContext.Provider value={authProvider}>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/login" component={Login} />
          <ProtectedRoute exact path="/dashboard" component={MyCalendar} />
          <Route path="*" component={()=>{return(<Redirect to='/'/>)}} />
        </Switch>
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;

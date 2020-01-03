import React from 'react';
import { BrowserRouter, Route, Switch,Redirect } from "react-router-dom";
import Menu from './view/menu/menu';
import Login from './view/login/login';
import MyCalendar from './view/calendar/calendar'
import ProtectedRoute from "./components/protectedRoute/protectedRoute";

import './App.css';

export const App = () => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={Login} />
        <ProtectedRoute exact path="/dashboard" component={MyCalendar} />
        <Route path="*" component={()=>{return(<Redirect to='/'/>)}} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;

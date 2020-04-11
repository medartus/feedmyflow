import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./view/home/home";
import Login from "./view/login/login";
import MyCalendar from "./view/calendar/calendar";
import About from "./view/about/about";
import RedirectedRoute from "./components/redirectedRoute/redirectedRoute";
import LoadingScreen from "./components/loadingScreen/loadingScreen";
import { ProvideAuth } from "./provider/auth.js";

import "./App.css";

export const App = () => (
  <BrowserRouter>
    <ProvideAuth>
      <LoadingScreen>
        <Switch>
            <RedirectedRoute exact path="/dashboard" comp={MyCalendar} connected redirect="/dashboard" needToBeConnected={true}/>
            <RedirectedRoute exact path="/" comp={Home} redirect="/dashboard" needToBeConnected={false}/>
            <Route exact path="/login" component={Login} />
            <Route exact path="/about" component={About} />
            <Route path="*" component={() => <Redirect to="/" />} />
        </Switch>
      </LoadingScreen>
    </ProvideAuth>
  </BrowserRouter>
);

export default App;

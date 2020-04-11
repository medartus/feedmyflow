import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import Home from "./view/home/home";
import Login from "./view/login/login";
import MyCalendar from "./view/calendar/calendar";
import About from "./view/about/about";
import ProtectedRoute from "./components/protectedRoute/protectedRoute";
import RedirectRoute from "./components/redirectRoute/redirectRoute";
import { ProvideAuth } from "./provider/auth.js";

import "./App.css";

export const App = () => (
  <BrowserRouter>
    <ProvideAuth>
      <Switch>
        <ProtectedRoute exact path="/dashboard" comp={MyCalendar} />
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/about" component={About} />
        <Route path="*" component={() => <Redirect to="/" />} />
      </Switch>
    </ProvideAuth>
  </BrowserRouter>
);

export default App;

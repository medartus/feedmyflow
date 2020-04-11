import React, { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";
import FeedLogo from "../feedlogo/feedlogo";

import "./redirectedRoute.css";

const RedirectedRoute = ({ path, comp: Component, redirect, needToBeConnected, ...rest }) => {
  const auth = useAuth();

  useEffect(()=>{
    if(needToBeConnected && !auth.authStatus.haveTriedLogin) auth.signIn(false,null)
},[])

  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.authStatus.haveTriedLogin && needToBeConnected) {
            console.log("check")
          return ( 
            <div className="center">
                <FeedLogo size={100} animated={true} isMonotone={false} />
            </div>
          )
        }
        else {
          if ((auth.authStatus.isConnected  && needToBeConnected) || (!auth.authStatus.isConnected && !needToBeConnected)) {
            console.log("1")
            return <Component {...props} />;
          } else {
              console.log("2",redirect)
            return (
              <Redirect
                to={{
                  pathname: redirect,
                  state: {
                    from: props.location
                  }
                }}
              />
            );
          }
        }
      }
      }
    />
  );
};

export default RedirectedRoute;

import React, { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";
import FeedLogo from "../feedlogo/feedlogo";

import "./protectedRoute.css";

const ProtectedRoute = ({ comp: Component, ...rest }) => {
  const auth = useAuth();

  useEffect(()=>{
    if(!auth.authStatus.haveTriedLogin) auth.signIn(false,null)
},[])

  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.authStatus.haveTriedLogin) {
          <div className="center">
            <FeedLogo size={100} animated={true} isMonotone={false} />
        </div>
        }
        else {
          if (auth.authStatus.isConnected) {
            return <Component {...props} />;
          } else {
            return (
              <Redirect
                to={{
                  pathname: "/",
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

export default ProtectedRoute;

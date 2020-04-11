import React from "react";
import { Route, Redirect } from "react-router-dom";
import AuthChecker from "../authChecker/authChecker";
import { useAuth } from "../../provider/auth";

const ProtectedRoute = ({ comp: Component, ...rest }) => {
  const auth = useAuth();

  return (
    <Route
      {...rest}
      render={props => {
        if (!auth.authStatus.haveTriedLogin) {
          return <AuthChecker {...props} />;
        }
        else {
          if (auth.authStatus.isConnected) {
            return <Component {...props} />;
          } else {
            return (
              <Redirect
                to={{
                  pathname: "/home",
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

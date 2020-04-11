import React from "react";
import AuthChecker from "../../components/authChecker/authChecker";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";

const Login = ({ component: Component, ...rest }) => {
  const auth = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!auth.authStatus.haveTriedLogin) {
          return <AuthChecker />;
        }
        return (
          <Redirect
            to={{
              pathname: auth.authStatus.isConnected ? "/dashboard" : "/",
              state: {
                from: props.location,
              },
            }}
          />
        );
      }}
    />
  );
};

export default Login;

import React, { useEffect } from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";
import FeedLogo from "../../components/feedlogo/feedlogo";

const Login = ({ component: Component, ...rest }) => {
  const auth = useAuth();
  const userCanceled = rest.location.search.includes("error=user_cancelled_login") || rest.location.search.includes("error=user_cancelled_authorize");

  useEffect(()=>{
    if(!auth.authStatus.haveTriedLogin && !userCanceled) auth.signIn(false,null)
  }, [auth, userCanceled])

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!auth.authStatus.haveTriedLogin && !userCanceled) {
          return (
            <div className="center">
              <FeedLogo size={100} animated={true} isMonotone={false} />
          </div>
          )
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

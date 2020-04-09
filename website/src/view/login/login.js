import React,{useState,useEffect, useContext} from "react";
import AuthChecker from "../../components/authChecker/authChecker";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";

const Login = ({component: Component,...rest}) => {
  const auth = useAuth();
  const userCanceled = rest.location.search.includes("error=user_cancelled_login");
  
  return (
      <Route
      {...rest}
      render={props => {
        if(!auth.authStatus.haveTriedLogin && !userCanceled){
          return <AuthChecker/>;
        }
        else{
        return (
            <Redirect
            to={{
                pathname: auth.authStatus.isConnected ? "/dashboard" : "/",
                state: {
                from: props.location
                }
            }}
            />
        );
        }}
      }
    />
  );
};

export default Login;

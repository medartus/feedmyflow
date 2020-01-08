import React,{useState,useEffect, useContext} from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import AuthChecker from "../../components/authChecker/authChecker";

const Login = ({component: Component,...rest}) => {
  const {authStatus} = useContext(AuthContext);
  return (
      <Route
      {...rest}
      render={props => {
        if(!authStatus.triedLogin){
          return <AuthChecker />;
        }
        else{
        return (
            <Redirect
            to={{
                pathname: authStatus.status === "connected" ? "/dashboard" : "/",
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

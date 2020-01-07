import React,{useContext} from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import AuthChecker from "../authChecker/authChecker";

const ProtectedRoute = ({component: Component,...rest}) => {
  const {authStatus} = useContext(AuthContext);
  return (
      <Route
      {...rest}
      render={props => {
        if(!authStatus.triedLogin){
          return <AuthChecker />;
        }
        else{
          if (authStatus.status === "connected") {
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
        }}
      }
    />
  );
};

export default ProtectedRoute;

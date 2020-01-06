import React,{useState,useEffect} from "react";
import { Route, Redirect } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import auth from "../../provider/auth";

const ProtectedRoute = ({component: Component,...rest}) => {
    const [checkLoging,setCheckingLogin] = useState(true);

    useEffect(()=>{
        if(auth.isAuthenticated()) setCheckingLogin(false);
        else {
          auth.login()
          .catch((err)=>console.log(err))
          .finally(()=>{setCheckingLogin(false)})
        };
    },[])

    return (
        <Route
        {...rest}
        render={props => {
            if(checkLoging){
                return <CircularProgress />;
            }
            else{
                if (auth.isAuthenticated()) {
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

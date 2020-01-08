import React,{useEffect, useContext} from "react";
import { Route, Redirect } from "react-router-dom";
import CircularProgress from '@material-ui/core/CircularProgress';
import { AuthContext } from "../../context/authContext";
import auth from "../../provider/auth";

const AuthChecker = (props) => {
    const {authStatus,setAuthStatus} = useContext(AuthContext);

    useEffect(()=>{
        if(authStatus.status === "disconnected" && !authStatus.triedLogin) {
            auth.loginWithCode(setAuthStatus)
            // auth.getToken()
            // .then(()=>{
            //     console.log('Good Auth Checker')
            //     setAuthStatus({status:"connected",triedLogin:true})
            // })
            // .catch((err)=>{
            //     console.log('Bad Auth Checker')
            //     console.log(err)
            //     setAuthStatus({status:"disconnected",triedLogin:true})
            // })
        }
        else{
            throw new Error("Tried access protected page with bad login")
        }
    },[])

    return (
        <CircularProgress />
    );
};

export default AuthChecker;

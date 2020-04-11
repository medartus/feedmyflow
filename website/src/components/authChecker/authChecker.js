import React,{useEffect} from "react";
import CircularProgress from '@material-ui/core/CircularProgress';
import {useAuth} from "../../provider/auth";

const AuthChecker = (props) => {
    const auth = useAuth();

    useEffect(()=>{
        
        if(auth.authStatus.firebaseTestLogin && !auth.authStatus.haveTriedLogin) auth.signIn(false,null)
    },[])

    return (
        <CircularProgress />
    );
};

export default AuthChecker;

import React, { useEffect } from "react";
import { useAuth } from "../../provider/auth";

import FeedLogo from "../feedlogo/feedlogo";
import "./authChecker.css"

const AuthChecker = () => {
    const auth = useAuth();

    useEffect(()=>{
        
        if(auth.authStatus.firebaseTestLogin && !auth.authStatus.haveTriedLogin) auth.signIn(false,null)
    },[])

    return (
        <div className="center">
            <FeedLogo size={100} animated={true} isMonotone={false} />
        </div>
    );
};

export default AuthChecker;

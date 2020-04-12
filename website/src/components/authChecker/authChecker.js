import React, { useEffect } from "react";
import { useAuth } from "../../provider/auth";

import FeedLogo from "../feedlogo/feedlogo";
import "./authChecker.css";

const LOGO_SIZE = 100;

const AuthChecker = () => {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.authStatus.haveTriedLogin) auth.signIn(false, null);
  }, [auth]);

  return (
    <div className="center">
      <FeedLogo size={LOGO_SIZE} animated={true} isMonotone={false} />
    </div>
  );
};

export default AuthChecker;

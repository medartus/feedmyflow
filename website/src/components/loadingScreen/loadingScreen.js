import React from "react";
import { useAuth } from "../../provider/auth";
import FeedLogo from "../feedlogo/feedlogo";

const LoadingScreen = (props) => {
  const auth = useAuth();
  return (
      <>
      {
        !auth.authStatus.firebaseTestLogin ?
        <div className="center">
            <FeedLogo size={100} animated={true} isMonotone={false} />
        </div>
        :
        <>
            {props.children}
        </>
      }
      </>
  );
};

export default LoadingScreen;

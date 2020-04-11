import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuth } from "../../provider/auth";

const RedirectRoute = ({ comp: Component, ...rest }) => {
    const auth = useAuth();

    return (
        <Route
            {...rest}
            render={props => {
                console.log(props, auth.authStatus)
                if (auth.authStatus.isConnected) {
                    return (
                        <Redirect
                            to={{
                                pathname: "/dashboard",
                                state: {
                                    from: props.location
                                }
                            }}
                        />
                    );
                } else {
                    return <Component {...props} />;
                }
            }
            }

        />
    );
};

export default RedirectRoute;
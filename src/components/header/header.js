import React, {useContext,useState} from "react";
import { AuthContext } from "../../context/authContext";
import {Toolbar,AppBar,Typography, Menu, MenuItem, IconButton} from '@material-ui/core';
import {AccountCircle,MailOutline} from '@material-ui/icons';

import "./header.css";
import auth from "../../provider/auth";

  
const Header = (props) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const {authStatus,setAuthStatus} = useContext(AuthContext);
  
    const isMenuOpen = Boolean(anchorEl);
  
    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };
  
    const handleDisconnect = () => {
        auth.logout(props,setAuthStatus);
    };

    const handleConnect = () => {
        auth.login(props,setAuthStatus);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSendMail = () =>  {
        window.location.href = "mailto:feedmyflow@gmail.com"
    }
  
    const menuId = 'account-menu';
    const renderMenu = (
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          id={menuId}
          keepMounted
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={isMenuOpen}
          onClose={handleMenuClose}
        >
            {authStatus.status==="disconnected" ?
                <MenuItem onClick={handleConnect}>Connect</MenuItem>
            :
                <MenuItem onClick={handleDisconnect}>Disconnect</MenuItem>
            }
        </Menu>
      );

  return (
    <>
        <AppBar position="static" color="default">
            <Toolbar>
                <Typography className="title" variant="h6">FeedMyFlow</Typography>
                <IconButton
                edge="end"
                aria-label="send mail to dev"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleSendMail}
                color="inherit"
                >
                    <MailOutline/>
                </IconButton>
                <IconButton
                edge="end"
                aria-label="account of current user"
                aria-controls={menuId}
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
                >
                    <AccountCircle />
                </IconButton>
            </Toolbar>
        </AppBar>
        {renderMenu}
    </>
  );
}

export default Header;
import React, {useContext,useState} from "react";
import { AuthContext } from "../../context/authContext";
import {Toolbar,AppBar,Typography, Menu, MenuItem, IconButton} from '@material-ui/core';
import {AccountCircle,MailOutline} from '@material-ui/icons';
import { useAuth } from "../../provider/auth";

import "./header.css";

  
const Header = (props) => {
    const auth = useAuth();

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
  
    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
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
            {auth.authStatus.isConnected ?
                <MenuItem onClick={() => auth.signOut(props)}>Disconnect</MenuItem>
            :
                <MenuItem onClick={() => auth.signIn(true,props)}>Connect</MenuItem>
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
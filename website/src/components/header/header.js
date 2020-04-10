import React, {useContext,useState} from "react";
import {Toolbar,AppBar,Typography, Menu, MenuItem, IconButton} from '@material-ui/core';
import {AccountCircle,MailOutline} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../provider/auth";
import Cookies from 'universal-cookie';

import "./header.css";

  
const Header = (props) => {
    const auth = useAuth();
    const { t, i18n } = useTranslation();

    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
  
    const cookies = new Cookies();

    // cookies.set('i18next','en');

    const handleProfileMenuOpen = event => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleSendMail = () =>  {
        window.location.href = "mailto:feedmyflow@gmail.com"
    }

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
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
                <MenuItem onClick={() => auth.signOut(props)}>{t('header.disconnect')}</MenuItem>
            :
                <MenuItem onClick={() => auth.signIn(true,props)}>{t('header.connect')}</MenuItem>
            }
            <MenuItem onClick={() => changeLanguage('fr')}>FR</MenuItem>
            <MenuItem onClick={() => changeLanguage('en')}>EN</MenuItem>
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
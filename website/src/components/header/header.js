import React, {useContext,useState, memo, useCallback } from "react";
import {Toolbar,AppBar,Typography, Menu, MenuItem, IconButton} from '@material-ui/core';
import {AccountCircle,MailOutline} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../provider/auth";
import Cookies from 'universal-cookie';

import "./header.css";
import FeedLogo from "../feedlogo/feedlogo";
import { Colors } from "../../Constants"

const handleSendMail = () => {
  window.location.href = "mailto:feedmyflow@gmail.com";
};
    const { t, i18n } = useTranslation();

const HeaderItem = memo(({ text, onClick }) => (
  <div onClick={onClick} className='header-item'>
    <p className='header-text'>{text}</p>
  </div>
));

const Header = memo((props) => {
  const auth = useAuth();

  const handleAbout = useCallback(() => props.history.push('/about'), [props])
    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    }

  const HeaderItems = () => (
    <div className="options-container">
      {auth.authStatus.isConnected ? (
        <HeaderItem text="Log Out" onClick={() => auth.signOut(props)} />
      ) : (
          <HeaderItem text="Sign In" onClick={() => auth.signIn(true, props)} />
        )}
      <HeaderItem text="Contact" onClick={handleSendMail} />
      <HeaderItem text="About" onClick={handleAbout} />
    </div>
  )

  return (
    <div className="header-container" style={{ backgroundColor: Colors.shade1 }}>
      <FeedLogo action={() => props.history.push('/')} />
      <HeaderItems />
    </div>
  );
});

export default Header;

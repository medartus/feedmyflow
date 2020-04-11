import React, { memo, useCallback } from "react";
import FeedLogo from "../feedlogo/feedlogo";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../provider/auth";
import { Colors } from "../../Constants"

import "./header.css";

const handleSendMail = () => {
  window.location.href = "mailto:feedmyflow@gmail.com";
};

const HeaderItem = memo(({ text, onClick }) => (
  <div onClick={onClick} className='header-item'>
    <p className='header-text'>{text}</p>
  </div>
));

const Header = memo((props) => {
  const auth = useAuth();
  
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
  }

  const handleAbout = useCallback(() => props.history.push('/about'), [props])

  const HeaderItems = () => (
    <div className="options-container">
      {auth.authStatus.isConnected ? (
        <HeaderItem text={t("header.disconnect")} onClick={() => auth.signOut(props)} />
      ) : (
          <HeaderItem text={t("header.connect")} onClick={() => auth.signIn(true, props)} />
        )}
        <HeaderItem text={t("header.about")} onClick={handleAbout} />   
        <HeaderItem text="Contact" onClick={handleSendMail} />
        <HeaderItem text="FR" onClick={() => changeLanguage('fr')}/>
        <HeaderItem text="EN" onClick={() => changeLanguage('en')}/>
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

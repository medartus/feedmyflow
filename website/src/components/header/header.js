import React, { memo, useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';

import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Menu } from '@material-ui/icons';
import { withStyles } from "@material-ui/core/styles";
import InputBase from "@material-ui/core/InputBase";

import { useAuth } from "../../provider/auth";

import "./header.css";
import FeedLogo from "../feedlogo/feedlogo";
import { Colors } from "../../Constants";

const BootstrapInput = withStyles((_) => ({
  input: {
    position: "relative",
    color: "white",
    border: "2px solid white",
    borderRadius: "4px",
    fontSize: 16,
    padding: "10px 26px 10px 12px",
    fontFamily: "Poppins",
    "&:focus": {
      borderRadius: 2,
      borderColor: Colors.light,
    },
  },
}))(InputBase);

const handleSendMail = () => {
  window.location.href = "mailto: feedmyflow@gmail.com";
};

const HeaderItem = memo(({ text, onClick }) => (
  <div onClick={onClick} className="header-item">
    <p className="header-text">{text}</p>
  </div>
));

const Header = memo((props) => {
  const auth = useAuth();

  const { t, i18n } = useTranslation();

  const handleDashboard = useCallback(() => props.history.push("/dashboard"), [props]);
  const handleHome = useCallback(() => props.history.push("/"), [props]);
  const handleAbout = useCallback(() => props.history.push("/about"), [props]);
  const onAuthOut = useCallback(() => auth.signOut(props), [auth, props]);
  const onAuthIn = useCallback(() => auth.signIn(true, props), [auth, props]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  }

  const [MobileNavVisible,SetMobileNavVisible] = useState(false);

  const toogleMobileNav = () => {
    SetMobileNavVisible(!MobileNavVisible)
  }

  const languageDic = window.innerWidth > 600 ? "header.language." : "header.language-small.";
  const logoSize = window.innerWidth > 600 ? 50 : 35;

  const LanguageItem = () => (
    <div className="header-item" id="language-selection">
      <FormControl variant="outlined">
        <Select
          native
          value={i18n.language}
          onChange={({ target: { value } }) => changeLanguage(value)}
          input={<BootstrapInput />}
          MenuProps={{
            icon: "white",
          }}
        >
          <option value="fr">{t(`${languageDic}french`)}</option>
          <option value="en">{t(`${languageDic}english`)}</option>
        </Select>
      </FormControl>
    </div>
  );

  const HeaderItems = () => (
    <div className="options-container">.
      <nav hidden={!MobileNavVisible}>
        {auth.authStatus.isConnected ? (
          <HeaderItem text={t("header.dashboard")} onClick={handleDashboard} />
          ) : (
          <HeaderItem text={t("header.home")} onClick={handleHome} />
        )}
        <HeaderItem text={t("header.about")} onClick={handleAbout} />
        <HeaderItem text={t("header.contact")} onClick={handleSendMail} />
        {auth.authStatus.isConnected ? (
          <HeaderItem text={t("header.disconnect")} onClick={onAuthOut} />
          ) : (
          <HeaderItem text={t("header.connect")} onClick={onAuthIn} />
        )}
      </nav>
      <LanguageItem />
    </div>
  );

  return (
    <div
      className="header-container"
      style={{ backgroundColor: Colors.shade1 }}
    >
      <Menu id="menu-button" onClick={()=>toogleMobileNav()}/>
      <FeedLogo size={logoSize} action={handleHome} />
      <HeaderItems />
    </div>
  );
});

export default Header;

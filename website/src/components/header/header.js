import React, { memo, useCallback, useState } from "react";
import { useTranslation } from 'react-i18next';

import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
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
  window.location.href = "mailto:feedmyflow@gmail.com";
};

const HeaderItem = memo(({ text, onClick }) => (
  <div onClick={onClick} className="header-item">
    <p className="header-text">{text}</p>
  </div>
));

const Header = memo((props) => {
  const auth = useAuth();

  const { t, i18n } = useTranslation();

  const handleAbout = useCallback(() => props.history.push("/about"), [props]);
  const backToHome = useCallback(() => props.history.push("/"), [props]);
  const onAuthOut = useCallback(() => auth.signOut(props), [auth, props]);
  const onAuthIn = useCallback(() => auth.signIn(true, props), [auth, props]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
}

  const LanguageItem = () => (
    <div className="header-item" style={{ marginRight: "20px" }}>
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
          <option value="fr">Français</option>
          <option value="en">English</option>
        </Select>
      </FormControl>
    </div>
  );

  const HeaderItems = () => (
    <div className="options-container">
      {auth.authStatus.isConnected ? (
        <HeaderItem text={t("header.disconnect")} onClick={onAuthOut} />
      ) : (
        <HeaderItem text={t("header.connect")} onClick={onAuthIn} />
      )}
      <HeaderItem text={t("header.contact")} onClick={handleSendMail} />
      <HeaderItem text={t("header.about")}  onClick={handleAbout} />
      <LanguageItem />
    </div>
  );

  return (
    <div
      className="header-container"
      style={{ backgroundColor: Colors.shade1 }}
    >
      <FeedLogo action={backToHome} />
      <HeaderItems />
    </div>
  );
});

export default Header;

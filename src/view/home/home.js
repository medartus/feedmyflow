import { makeStyles } from '@material-ui/core/styles';
import {Button} from '@material-ui/core';
import React, { useEffect, useContext } from 'react';
import { AuthContext } from '../../context/authContext';
import Header from '../../components/header/header';
import { useAuth } from "../../provider/auth";

const useStyles = makeStyles(theme => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const Home = (props) => {

  const auth = useAuth();

  return (
    <>
      <Header {...props}/>
      <Button onClick={() => auth.signIn(true,props)}>Sign In</Button>
    </>
  );
}

export default Home;
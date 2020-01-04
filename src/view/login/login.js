import { makeStyles } from '@material-ui/core/styles';
import {Container,Button} from '@material-ui/core';

import React, { useEffect } from 'react';
import auth from "../../provider/auth";

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

const Login = (props) => {
  const classes = useStyles();

  const onLogin = () => {
    // auth.login((err,res)=>{
    //   if(err === null) props.history.push('/dashboard')
    //   else console.log(err.toString())
    // })
    auth.login()
    .then(()=>props.history.push('/dashboard'))
    .catch((err)=>console.log(err))
  }

  useEffect(()=>{
    // auth.getToken((err,res)=>{
    //   if(err === null) props.history.push('/dashboard')
    //   else console.log(err.toString())
    // })
    auth.getToken()
    .then(()=>props.history.push('/dashboard'))
    .catch((err)=>console.log(err))
  },[])

  return (
    <Container>
      <Button onClick={onLogin}>Sign In</Button>
    </Container>
  );
}

export default Login;
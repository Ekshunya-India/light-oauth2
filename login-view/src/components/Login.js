import React, { useState } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { FacebookLoginButton, GoogleLoginButton, GithubLoginButton } from 'react-social-login-buttons';
import GoogleLogin from './GoogleLogin';
import FbLogin from './FbLogin';

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
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
  loginButtons: {
    width: '100%',
    marginTop: theme.spacing(1),
  }
}));


function Login() {
  const classes = useStyles();

  let search = window.location.search;

  //console.log("client_id = ", params.get('client_id'));
  const [error, setError] = useState('');
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [denyUrl, setDenyUrl] = useState(null);
  const [scopes, setScopes] = useState([]);


  const handleAccept = event => {
    event.preventDefault();
    //console.log("handleAccept is called");
    window.location.href = redirectUrl;
  }

  const handleCancel = event => {
    event.preventDefault();
    // here we use the redirectUrl to construct the deny url because the cookies
    // are saved to the redirect domain instead of signin.lightapi.net domain.
    //console.log("redirectUrl = ", redirectUrl);
    let pathArray = redirectUrl.split('/');
    let logoutPath = pathArray[0] + '//' + pathArray[2] + '/logout';
    //console.log("fetch url = ", logoutPath);
    // remove the server set cookies as the Javascript cannot access some of them. 
    fetch(logoutPath, { credentials: 'include' })
      .then(response => {
        if (response.ok) {
          window.location.href = denyUrl;
        } else {
          throw Error(response.statusText);
        }
      })
      .catch(error => {
        console.log("error=", error);
        setError(error.toString());
      });
  }

  function ScopeItems() {
    console.log("scopes =", scopes);
    return (
      <List component="nav" aria-label="secondary mailbox folders">
        {scopes.map((item, index) => (
          <ListItem key={index} button>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    )
  }

  const onGoogleSuccess = (res) => {
    console.log('Google Login Success: authorization code:', res.code);
    console.log('referrer: ', document.referrer);
    let pathArray = document.referrer.split('/');
    let host = pathArray[0] + '//' + pathArray[2];
    console.log('host = ', host);
    fetch(host + '/google?code=' + res.code, { redirect: 'follow', credentials: 'include' })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(data => {
        console.log("data =", data);
        setRedirectUrl(data.redirectUri);
        setDenyUrl(data.denyUri);
        setScopes(data.scopes);
      })
      .catch(err => {
        err.text().then(errorMessage => {
          setError(errorMessage);
        })
      });
  };

  const onFacebookSuccess = (res) => {
    console.log('Login Success: accessToken:', res.accessToken);
    console.log('referrer: ', document.referrer);
    let pathArray = document.referrer.split('/');
    let host = pathArray[0] + '//' + pathArray[2];
    console.log('host = ', host);
    fetch(host + '/facebook?accessToken=' + res.accessToken, { redirect: 'follow', credentials: 'include' })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then(data => {
        console.log("data =", data);
        setRedirectUrl(data.redirectUri);
        setDenyUrl(data.denyUri);
        setScopes(data.scopes);
      })
      .catch(err => {
        err.text().then(errorMessage => {
          setError(errorMessage);
        })
      });
  };

  const imageStyle = {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
    width: "50%",
    height: "50%"
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <div>
          <img src="https://user-images.githubusercontent.com/5641222/92555963-6c9d2980-f286-11ea-889e-18c20700c3b8.png"
            alt="Sahaay Logo" style={{ ...imageStyle }}></img>
          <h3 style={{ textAlign: "center" }}>Log Into Sahaay</h3>
        </div>
        <div className={classes.loginButtons}>
          <GoogleLogin onSuccess={onGoogleSuccess} />
          <FbLogin onSuccess={onFacebookSuccess} />
        </div>
      </div>
    </Container>
  );
}

export default Login;

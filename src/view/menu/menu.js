import React, { useState, useEffect } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {Grid,TextField,Container,Select,MenuItem,Toolbar,AppBar,Typography,Card,CardContent,Divider,Button} from '@material-ui/core';
import {ExpansionPanel,ExpansionPanelDetails,ExpansionPanelSummary} from '@material-ui/core';
import {MuiPickersUtilsProvider,KeyboardTimePicker,KeyboardDatePicker} from '@material-ui/pickers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Cookies from 'universal-cookie';
import fire from '../../provider/firebase';
import './menu.css';


const Menu = () => {

    
    const [publicationTime,setPublicationTime] = useState(new Date());
    const [shareCommentary,setShareCommentary] = useState('');
    const [shareMediaCategory,setShareMediaCategory] = useState('NONE');
    const [visibility,setVisibility] = useState('PUBLIC');
    const [mediaTitle,setMediaTitle] = useState('');
    const [mediaDescription,setMediaDescription] = useState('');
    const [mediaUrl,setMediaUrl] = useState('');
    const [expanded,setExpanded] = useState('');
    const [items,setItems] = useState([]);

    let cookies = new Cookies();
    let currentUser = undefined;
    let userUid = undefined;
    let db = fire.firestore();
    
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false)
    };

    const getURLParameter = (name) => {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
            [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    const firebaseInit = (token) => {
        fire.auth().signInWithCustomToken(token).then(() => {
            console.log(token)
            currentUser = fire.auth().currentUser;
            userUid = currentUser.uid;
            db.collection('user').doc(userUid).collection('post').onSnapshot((documents)=>{setItems(documents.docs)});
        })
        .catch(()=>{getToken()});
    }

    const get = async (url) => {
        try {
            let response = await fetch(url, {method: "GET"});
            const jsondata = await response.json();
            return jsondata;
        }
        catch (error) {
            throw error;
        }    
    }

    const getToken = async () => {
        var code = getURLParameter('code');
        var state = getURLParameter('state');
        // var error = this.getURLParameter('error');
        if(code!==null){
            // This is the URL to the HTTP triggered 'token' Firebase Function.
            var tokenFunctionURL = 'https://us-central1-feedmyflow.cloudfunctions.net/token';
            let url = tokenFunctionURL +
                '?code=' + encodeURIComponent(code) +
                '&state=' + encodeURIComponent(state);
            console.log('plop')
            console.log(code)
            console.log(state)
            let res = await get(url);
            if (res.token) {
                cookies.set('token', res.token.toString());
                firebaseInit(res.token)
            } else {
                document.body.innerText = 'Error in the token Function: ' + res.error;
            }
        }
    }
    
    

    const onSendData = () => {
        let linekdinPost = {
            "author":"urn:li:person:"+userUid.split(':')[1],
            "userUID":userUid,
            "publicationTime":publicationTime,
            "shareCommentary": shareCommentary,
            "visibility": visibility,
            "shareMediaCategory": shareMediaCategory,
            "rawDate" : publicationTime.getDate()+"/"+publicationTime.getMonth()+1+"/"+publicationTime.getFullYear(),
            "rawTime" : publicationTime.getHours()+":"+publicationTime.getMinutes()
        }
        if(shareMediaCategory !== "NONE" && mediaTitle!=="" && mediaDescription!=="" && mediaUrl!==""){
            linekdinPost["media"] = {
                "title":mediaTitle,
                "description":mediaDescription,
                "originalUrl":mediaUrl,
            }
        }
        db.collection('user').doc(userUid).collection('post').add(linekdinPost)
    }

    // const onLogin = () => {
    //     window.location.href = "https://us-central1-feedmyflow.cloudfunctions.net/redirect";
    // }

    const deletePost = (postId) => {
        db.collection('user').doc(this.userUid).collection('post').doc(postId).delete()
    }

    const mediaRender = () => {
        if (shareMediaCategory !== 'NONE'){
            return(
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField 
                            fullWidth
                            id="mediaTitle"
                            label="Titre"
                            value={mediaTitle}
                            onChange={e=>setMediaTitle(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="mediaDescription"
                            label="Description"
                            value={mediaDescription}
                            onChange={e=>setMediaDescription(e.target.value)}
                            multiline
                            />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="mediaUrl"
                            label="Url"
                            value={mediaUrl}
                            onChange={e=>setMediaUrl(e.target.value)}
                        />
                    </Grid>
                </Grid>
            )
        }
    }

    const postRender = () =>{
        return(
            <>
                {items.map(data => (
                    <ExpansionPanel expanded={expanded === data.id} onChange={handleChange(data.id)} key={data.id}>
                        <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                        >
                            <Typography>Post prévu pour le {data.data().rawDate} à {data.data().rawTime}        {data.data().shareMediaCategory === "NONE" ? "TEXTE" : data.data().shareMediaCategory} - {data.data().visibility}</Typography>
                        </ExpansionPanelSummary>
                        <ExpansionPanelDetails>
                            <Typography>Contenu: {data.data().shareCommentary}</Typography>
                            {
                            data.data().media && 
                            <div>
                                <Typography> Titre: {data.data().media.title}</Typography>
                                <Typography>Description: {data.data().media.description}</Typography>
                                <Typography>Url: {data.data().media.originalUrl}</Typography>
                            </div>
                            }
                            
                            <Button variant="contained" color="secondary" onClick={()=>{deletePost(data.id)}}>
                                Delete
                            </Button>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                ))}
            </>
        )
    }

    
    useEffect(()=>{
        let token = undefined;
        try {
            token = cookies.get('token');
        } catch (error) {console.log(error)} 
        if(token !== undefined){
            firebaseInit(token);
        }
        else{
            getToken();
        }
    },[])

    return (
        <div>
            <AppBar position="static" color="default">
                <Toolbar>
                    <Typography className="title" variant="h6">FeedMyFlow</Typography>
                </Toolbar>
            </AppBar>
            <Container className="menu">
                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h2">Create</Typography>
                        <Divider/>
                        <Grid container spacing={3}>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid item xs={12} md={2}>
                                    <KeyboardDatePicker
                                        margin="normal"
                                        id="date-picker-dialog"
                                        label="Date picker dialog"
                                        format="dd/MM/yyyy"
                                        value={publicationTime}
                                        onChange={e=>setPublicationTime(e)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <KeyboardTimePicker
                                        margin="normal"
                                        id="time-picker"
                                        label="Time picker"
                                        value={publicationTime}
                                        onChange={e=>setPublicationTime(e)}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change time',
                                        }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>
                            <Grid item xs={12} md={2}>
                                <Select
                                    labelId="Type de post"
                                    id="shareMediaCategory"
                                    value={shareMediaCategory}
                                    onChange={e=>setShareMediaCategory(e.target.value)}>
                                        <MenuItem value={'NONE'}>Juste Text</MenuItem>
                                        <MenuItem value={'ARTICLE'}>Avec Article</MenuItem>
                                        <MenuItem value={'IMAGE'}>Avec Image</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={12} md={2}>
                                <Select
                                    labelId="Visibilité"
                                    id="visibility"
                                    value={visibility}
                                    onChange={e=>setVisibility(e.target.value)}>
                                        <MenuItem value={'PUBLIC'}>Publique</MenuItem>
                                        <MenuItem value={'CONNECTIONS'}>connexions</MenuItem>
                                </Select>
                            </Grid>
                        </Grid>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth 
                                    label="Contenu du post" 
                                    id="shareCommentary"
                                    value={shareCommentary}
                                    onChange={e=>setShareCommentary(e.target.value)}
                                    multiline
                                />
                            </Grid>
                        </Grid>
                        {mediaRender()}
                        <Button variant="contained" color="primary" onClick={onSendData}>
                            Create
                        </Button>
                    </CardContent>
                </Card>
                {postRender()}
            </Container>
        </div>
    )
};

export default Menu;
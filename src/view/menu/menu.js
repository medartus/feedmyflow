import React, { Component } from 'react';
import DateFnsUtils from '@date-io/date-fns';
import {Grid,TextField,Container,Select,MenuItem,Toolbar,AppBar,Typography,Card,CardContent,Divider,Button} from '@material-ui/core';
import {ExpansionPanel,ExpansionPanelDetails,ExpansionPanelSummary} from '@material-ui/core';
import {MuiPickersUtilsProvider,KeyboardTimePicker,KeyboardDatePicker} from '@material-ui/pickers';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Cookies from 'universal-cookie';
import fire from '../../provider/firebase'
import './menu.css';


class Menu extends Component {
    constructor(props){
        super(props)
        this.cookies = new Cookies();
        this.state = {
            publicationTime:new Date(),
            shareCommentary:'',
            shareMediaCategory:'NONE',
            visibility:'PUBLIC',
            mediaTitle:'',
            mediaDescription:'',
            mediaUrl:'',
            expanded : '',
            setExpanded : false,
            items: [],
        }
        this.currentUser = undefined;
        this.userUid = undefined;
        this.db = fire.firestore();
    }
    
    handleChange = panel => (event, isExpanded) => {
        this.setState({expanded:isExpanded ? panel : false});
    };

    componentDidMount(){
        let token = undefined;
        try {
            token = this.cookies.get('token');
        } catch (error) {console.log(error)} 
        if(token !== undefined){
            this.firebaseInit(token);
        }
        else{
            this.getToken();
        }
    }

    getURLParameter(name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(window.location.href) ||
            [null, ''])[1].replace(/\+/g, '%20')) || null;
    }

    async getToken(){
        var code = this.getURLParameter('code');
        var state = this.getURLParameter('state');
        // var error = this.getURLParameter('error');
        if(code!==null){
            // This is the URL to the HTTP triggered 'token' Firebase Function.
            var tokenFunctionURL = 'https://us-central1-feedmyflow.cloudfunctions.net/token';
            let url = tokenFunctionURL +
                '?code=' + encodeURIComponent(code) +
                '&state=' + encodeURIComponent(state);
            let res = await this.get(url);
            if (res.token) {
                this.cookies.set('token', res.token.toString());
                this.firebaseInit(res.token)
            } else {
                document.body.innerText = 'Error in the token Function: ' + res.error;
            }
        }
    }
    
    firebaseInit(token){
        fire.auth().signInWithCustomToken(token).then(() => {
            this.currentUser = fire.auth().currentUser;
            this.userUid = this.currentUser.uid;
            this.db.collection('user').doc(this.userUid).collection('post').onSnapshot((documents)=>{this.setState({items:documents.docs})});
        })
        .catch(()=>{
            console.log("auth Error")
            this.getToken()
        });
        // .catch(()=>{this.getToken()});
    }
    
    async get(url){
        try {
            let response = await fetch(url, {method: "GET"});
            const jsondata = await response.json();
            return jsondata;
        }
        catch (error) {
            throw error;
        }    
    }
    

    onSendData = () => {
        // let tempTime = this.publicationTime.split(":")
        // this.date.setHours(parseInt(tempTime[0]))
        // this.date.setMinutes(parseInt(tempTime[1]))
        const {publicationTime,shareCommentary,visibility,shareMediaCategory,mediaTitle,mediaDescription,mediaUrl} = this.state;
        let linekdinPost = {
            "author":"urn:li:person:"+this.userUid.split(':')[1],
            "userUID":this.userUid,
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
        this.db.collection('user').doc(this.userUid).collection('post').add(linekdinPost)
    }

    onLogin(){
        window.location.href = "https://us-central1-feedmyflow.cloudfunctions.net/redirect";
    }

    deletePost = (postId) => {
        this.db.collection('user').doc(this.userUid).collection('post').doc(postId).delete()
    }

    mediaRender = () =>{
        const { shareMediaCategory, mediaTitle, mediaDescription, mediaUrl } = this.state
        if (shareMediaCategory !== 'NONE'){
            return(
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField 
                            fullWidth
                            id="mediaTitle"
                            label="Titre"
                            value={mediaTitle}
                            onChange={e=>this.setState({mediaTitle:e.target.value})}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="mediaDescription"
                            label="Description"
                            value={mediaDescription}
                            onChange={e=>this.setState({mediaDescription:e.target.value})}
                            multiline
                            />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="mediaUrl"
                            label="Url"
                            value={mediaUrl}
                            onChange={e=>this.setState({mediaUrl:e.target.value})}
                        />
                    </Grid>
                </Grid>
            )
        }
    }

    postRender = () =>{
        const { items, expanded } = this.state;
        return(
            <>
                {items.map(data => (
                    <ExpansionPanel expanded={expanded === data.id} onChange={this.handleChange(data.id)} key={data.id}>
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
                            
                            <Button variant="contained" color="secondary" onClick={()=>{this.deletePost(data.id)}}>
                                Delete
                            </Button>
                        </ExpansionPanelDetails>
                    </ExpansionPanel>
                ))}
            </>
        )
    }

    render(){
        const { shareCommentary, publicationTime, shareMediaCategory, visibility } = this.state;
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
                                            onChange={e=>this.setState({publicationTime:e})}
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
                                            onChange={e=>this.setState({publicationTime:e})}
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
                                        onChange={e=>this.setState({shareMediaCategory:e.target.value})}>
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
                                        onChange={e=>this.setState({visibility:e.target.value})}>
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
                                        onChange={e=>this.setState({shareCommentary:e.target.value})}
                                        multiline
                                    />
                                </Grid>
                            </Grid>
                            {this.mediaRender()}
                            <Button variant="contained" color="primary" onClick={()=>{this.onSendData()}}>
                                Create
                            </Button>
                        </CardContent>
                    </Card>
                    {this.postRender()}
                </Container>
            </div>
        )
    }
}

export default Menu;

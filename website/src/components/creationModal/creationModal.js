import React, {useState,useEffect,forwardRef,useImperativeHandle} from 'react';
import {Modal,Backdrop,Fade} from '@material-ui/core';
import {Grid,TextField,Select,MenuItem,Typography,Card,CardContent,Divider,Button} from '@material-ui/core';
import {MuiPickersUtilsProvider,KeyboardTimePicker,KeyboardDatePicker} from '@material-ui/pickers';
import { makeStyles } from '@material-ui/core/styles';
import DateFnsUtils from '@date-io/date-fns';
import fire from '../../provider/firebase';
import moment from 'moment';

  
const useStyles = makeStyles(theme => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}));

const CreationModal = forwardRef((props,ref) => {
  
  let isEvent = props.event != undefined;
  let isMedia = false;
  if(isEvent) isMedia = props.event.media != undefined;
  
  const db = fire.firestore();
  const userUid = fire.auth().currentUser.uid

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [haveModification, setHaveModification] = useState(false);
  const [canSave, setCanSave] = useState(false);

  let date = new Date()
  date.setMinutes(60)

  const [publicationDate,setPublicationDate] = useState(isEvent ? new Date(props.event.publicationTime.toDate()) : date);
  const [publicationTime,setPublicationTime] = useState(isEvent ? new Date(props.event.publicationTime.toDate()) : date);
  const [shareCommentary,setShareCommentary] = useState(isEvent ? props.event.shareCommentary : '');
  const [shareMediaCategory,setShareMediaCategory] = useState(isEvent ? props.event.shareMediaCategory : 'NONE');
  const [visibility,setVisibility] = useState(isEvent ? props.event.visibility : 'PUBLIC');
  const [mediaTitle,setMediaTitle] = useState(isEvent && isMedia ? props.event.media.title : '');
  const [mediaDescription,setMediaDescription] = useState(isEvent && isMedia ? props.event.media.description : '');
  const [mediaUrl,setMediaUrl] = useState(isEvent && isMedia ? props.event.media.originalUrl : '');
  
  useImperativeHandle(ref, () => ({
    handleOpen(){
      setOpen(true);
    }
  }))

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(()=>{
    if(shareCommentary !== ''){
      if(shareMediaCategory === 'NONE') setCanSave(true);
      else{
        if(mediaTitle !== '' && mediaDescription !== '' && mediaUrl !== '') setCanSave(true);
        else setCanSave(false);
      }
    }
    else setCanSave(false);
    return () => {
      setHaveModification(true)
    }
  },[publicationDate,publicationTime,shareCommentary,shareMediaCategory,visibility,mediaTitle,mediaDescription,mediaUrl])

  const formatData = () => {
    let rawDate = publicationDate.getDate()+"/"+publicationDate.getMonth()+1+"/"+publicationDate.getFullYear()
    let rawTime = publicationTime.getHours()+":"+publicationTime.getMinutes()
    let time = moment(rawDate+' '+rawTime+":00")
    console.log(time)
    let linekdinPost = {
        "author":"urn:li:person:"+userUid.split(':')[1],
        "userUID":userUid,
        "publicationTime":publicationTime,
        "shareCommentary": shareCommentary,
        "visibility": visibility,
        "shareMediaCategory": shareMediaCategory,
        "rawDate" : rawDate,
        "rawTime" : rawTime
    }
    if(shareMediaCategory !== "NONE" && mediaTitle!=="" && mediaDescription!=="" && mediaUrl!==""){
        linekdinPost["media"] = {
            "title":mediaTitle,
            "description":mediaDescription,
            "originalUrl":mediaUrl,
        }
    }
    return linekdinPost;
  }

  const validDate = () => {
    if(publicationDate.toString() === "Invalid Date" || publicationTime.toString()  === "Invalid Date"){
      alert("Merci de mettre une date valide")
      return false
    }
    let dateTocheck = new Date(publicationDate.getTime())
    dateTocheck.setHours(publicationTime.getHours(),publicationTime.getMinutes())
    if (dateTocheck < new Date()){
      alert("La date ne doit pas être antérieur à maintenant")
      return false
    }
    return true
  }

  const onSendData = () => {
    if(validDate()){
      const linekdinPost = formatData();
      db.collection('user').doc(userUid).collection('post').add(linekdinPost)
      handleClose()
      if(!isEvent){
        setPublicationDate(new Date());
        setPublicationTime(new Date());
        setShareCommentary('');
        setShareMediaCategory('NONE');
        setVisibility('PUBLIC');
        setMediaTitle('');
        setMediaDescription('');
        setMediaUrl('');
      }
    }
  }

  const onUpdateData = () => {
    if(validDate()){
      const linekdinPost = formatData();
      let postId = props.event.id
      db.collection('user').doc(userUid).collection('post').doc(postId).update(linekdinPost)
      handleClose()
      setHaveModification(false);
    }
  }

  const onDeleteData = () => {
    let postId = props.event.id
    if (window.confirm("Etes vous sur de vouloir supprimer ce post ?")) {
      db.collection('user').doc(userUid).collection('post').doc(postId).delete()
    } 
  }

  const configurePublicationTime = (dateTime) => {
    if(dateTime != null){
      let quarter = Math.floor(dateTime.getMinutes()/15)
      if(!isNaN(dateTime.getMinutes())){
        if(dateTime.getMinutes()%15!==0) alert("Les messages sont postés toutes les 15 minutes.")
        if(dateTime.getMinutes()%15>7) quarter += 1
      }
      dateTime.setMinutes(quarter*15)
    }
    setPublicationTime(dateTime)
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

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <Card>
          <CardContent>
            {isEvent ?
              <Typography variant="h5" component="h2">Post prévu pour le {props.event.rawDate} à {props.event.rawTime}</Typography>
            :
              <Typography variant="h5" component="h2">Create</Typography>
            }
            <Divider/>
            <Grid container spacing={3}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Grid item xs={12} md={3}>
                  <KeyboardDatePicker
                      margin="normal"
                      id="date-picker-dialog"
                      label="Date picker dialog"
                      format="dd/MM/yyyy"
                      value={publicationDate}
                      onChange={e=>setPublicationDate(e)}
                      KeyboardButtonProps={{
                          'aria-label': 'change date',
                      }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <KeyboardTimePicker
                      margin="normal"
                      id="time-picker"
                      label="Time picker"
                      value={publicationTime}
                      ampm={false}
                      minutesStep={15}
                      onChange={e=>configurePublicationTime(e)}
                      KeyboardButtonProps={{
                          'aria-label': 'change time',
                      }}
                  />
                </Grid>
              </MuiPickersUtilsProvider>
              <Grid item xs={12} md={3}>
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
              <Grid item xs={12} md={3}>
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
            {isEvent ?
              <>
                <Button variant="contained" color="primary" onClick={onDeleteData}>Delete</Button>
                <Button variant="contained" color="primary" onClick={onUpdateData} disabled={!haveModification}>Update</Button>
              </>
            :
              <Button variant="contained" color="primary" onClick={onSendData} disabled={!canSave}>Create</Button>
            }
          </CardContent>
        </Card>
      </Fade>
    </Modal>
  );
})
export default CreationModal;
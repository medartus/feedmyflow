import React, { useState, useEffect, useRef } from "react";
import {Calendar,momentLocalizer} from 'react-big-calendar';
import {Grid,Container,Toolbar,AppBar,Typography,Paper,Button} from '@material-ui/core';
import CreationModal from '../../components/creationModal/creationModal';
import fire from '../../provider/firebase';
import moment from "moment";
import 'moment/locale/fr';

import "./calendar.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment)
  
const Mycalendar = () => {

  const [eventsList,setEventsList] = useState([]);
  const creationModalRef = useRef();
  const eventsRef = useRef([]);

  let currentUser = undefined;
  let userUid = undefined;
  let db = fire.firestore();
  
  const firebaseInit = (token) => {
    fire.auth().signInWithCustomToken(token).then(() => {
        currentUser = fire.auth().currentUser;
        userUid = currentUser.uid;
        db.collection('user').doc(userUid).collection('post').onSnapshot((documents) => {
          let newEventsList = []
          documents.docs.map((query,i) => {
            let data = query.data()
            data["itemId"] = i
            data["id"] = query.id
            data["title"] = data.shareCommentary
            data["start"] = new Date(data.publicationTime.toDate())
            data["end"] =  moment(data.start).add(15, 'm').toDate()
            newEventsList.push(data)
          })
          newEventsList.sort((a,b)=>{return a.start - b.start})
          setEventsList(newEventsList)
        });
    })
}
  useEffect(()=>{
    // let token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTU3ODA0NzUwOSwiZXhwIjoxNTc4MDUxMTA5LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1zMWx3ZEBmZWVkbXlmbG93LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstczFsd2RAZmVlZG15Zmxvdy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6ImxpbmtlZGluOnFyQ1dUTXd5LVEifQ.bCfrus3QAtBkEgMQbGI5aRto9TMIbZl_vJsx0u620EPhWnKEkLKg4AcvBhAGbeJkVUnuPKBj2Zzfco2criZv0cJRD3uzs8ZheejFRZP9iOijYh0r8IhnIccg02IYCy0F-euZmenxP5jJ1tEpaxAzV0pXgk9W2sR6Lty6yiCSes_6uRHbNx6hubgZ64l5qaFJiY6MKbLXhfIN4U-VehqrqVl7qKWZDLHNo2RJNI1EfEMyPNQLl3M-p7lSBq5KsD0cR8uen_w-ImrnDQXjhxzSSzYZfrdywrbXkAbMHVWfqr7wZ6PaWYVQZ9AXp37rM1z2NTPLy4Q07SdY2zTcK6CFmg"
    // firebaseInit(token)
    currentUser = fire.auth().currentUser;
    userUid = currentUser.uid;
    db.collection('user').doc(userUid).collection('post').onSnapshot((documents) => {
      let newEventsList = []
      documents.docs.map((query,i) => {
        let data = query.data()
        data["itemId"] = i
        data["id"] = query.id
        data["title"] = data.shareCommentary
        data["start"] = new Date(data.publicationTime.toDate())
        data["end"] =  moment(data.start).add(15, 'm').toDate()
        newEventsList.push(data)
      })
      newEventsList.sort((a,b)=>{return a.start - b.start})
      setEventsList(newEventsList)
    });
  },[])

  useEffect(() => {
    eventsRef.current = eventsRef.current.slice(0, eventsList.length);
 }, [eventsList]);

  // useEffect(()=>{
  //   setEventsList([...eventsList.sort((a,b)=>{return a.start - b.start})])
  // },[])

  const nextPost = () => {
    return(
      <>
        {eventsList.map(event=>(
          <div key={event.id}>
            <p  onClick={()=>{eventsRef.current[event.itemId].handleOpen()}}>{event.rawDate + " " + event.rawTime + " : " + event.title}</p>
            <CreationModal ref={r => eventsRef.current[event.itemId] = r} event={event} />
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="App">
      <AppBar position="static" color="default">
        <Toolbar>
          <Typography className="title" variant="h6">FeedMyFlow</Typography>
        </Toolbar>
      </AppBar>
      <Container className="menu">
        <Grid container spacing={2}>
          <Grid item md={12} lg={8}>
            <Paper>
              <Calendar
                popup
                step={60}
                // showMultiDayTimes
                localizer={localizer}
                defaultDate={new Date()}
                defaultView="month"
                culture={'fr'}
                events={eventsList}
                drilldownView="week"
                style={{ height: "85vh" }}
                views={{ month: true, week: true }}
                onSelectEvent={(event,e)=>{eventsRef.current[event.itemId].handleOpen()}}
              />
            </Paper>
          </Grid>
          <Grid item md={12} lg={4}>
            <Button variant="contained" color="primary" onClick={()=>{creationModalRef.current.handleOpen()}}>Create</Button>
            <CreationModal ref={creationModalRef}/>
            <Paper>
              <Typography className="title" variant="h6">Next post...</Typography>
              {nextPost()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default Mycalendar;
import React, { useState, useEffect, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Grid, Container, Typography, Paper, Button } from "@material-ui/core";
import CreationModal from "../../components/creationModal/creationModal";
import Header from "../../components/header/header";
import fire from "../../provider/firebase";
import moment from "moment";
import "moment/locale/fr";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";

const localizer = momentLocalizer(moment);

const Mycalendar = (props) => {
  const [eventsList, setEventsList] = useState([]);
  const creationModalRef = useRef();
  const eventsRef = useRef([]);

  let currentUser = undefined;
  let userUid = undefined;
  let db = fire.firestore();

  useEffect(() => {
    currentUser = fire.auth().currentUser;
    userUid = currentUser.uid;
    var unsubscribeSnapshot = db
      .collection("user")
      .doc(userUid)
      .collection("post")
      .onSnapshot((documents) => {
        let newEventsList = [];
        documents.docs.map((query, i) => {
          let data = query.data();
          data["itemId"] = i;
          data["id"] = query.id;
          data["title"] = data.shareCommentary;
          data["start"] = new Date(data.publicationTime.toDate());
          data["end"] = moment(data.start).add(15, "m").toDate();
          newEventsList.push(data);
        });
        newEventsList.sort((a, b) => {
          return a.start - b.start;
        });
        setEventsList(newEventsList);
        return () => {
          unsubscribeSnapshot();
        };
      });
  }, []);

  useEffect(() => {
    eventsRef.current = eventsRef.current.slice(0, eventsList.length);
  }, [eventsList]);

  const nextPost = () => {
    return (
      <>
        {eventsList.map((event) => (
          <div key={event.id}>
            <p
              onClick={() => {
                eventsRef.current[event.itemId].handleOpen();
              }}
            >
              {event.rawDate + " " + event.rawTime + " : " + event.title}
            </p>
            <CreationModal
              ref={(r) => (eventsRef.current[event.itemId] = r)}
              event={event}
            />
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="App">
      <Header {...props} />
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
                culture="fr"
                events={eventsList}
                drilldownView="week"
                style={{ height: "85vh" }}
                views={{ month: true, week: true }}
                onSelectEvent={(event, e) => {
                  eventsRef.current[event.itemId].handleOpen();
                }}
              />
            </Paper>
          </Grid>
          <Grid item md={12} lg={4}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                creationModalRef.current.handleOpen();
              }}
            >
              Create
            </Button>
            <CreationModal ref={creationModalRef} />
            <Paper>
              <Typography className="title" variant="h6">
                Next post...
              </Typography>
              {nextPost()}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default Mycalendar;

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { Colors } from "../../Constants"

import CreationModal from "../../components/creationModal/creationModal";
import Header from "../../components/header/header";
import fire from "../../provider/firebase";
import moment from "moment";
import "moment/locale/fr";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import empty from "../../assets/empty.svg"

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

  const nextPost = () => (
    <div className="column">
      {eventsList.map((event) => (
        <div className="next-post" key={event.id} onClick={() => {
          eventsRef.current[event.itemId].handleOpen();
        }}>
          <p className="next-post-item">
            <span className="span-item">Date: </span>{event.rawDate + " " + event.rawTime}
          </p>
          <p className="next-post-item clipped">
            <span className="span-item">Content: </span>{event.title}
          </p>
          <CreationModal
            ref={(r) => (eventsRef.current[event.itemId] = r)}
            event={event}
          />
        </div>
      ))}
      {eventsList.length === 0 && <img src={empty} alt="empty" className="empty-img" />}
    </div>
  );

  const LeftPart = () => (
    <div className="column" style={{ alignItems: "flex-start" }}>
      <div className="column" style={{ alignItems: "flex-start" }}>
        <p className="important-text">Schedule your next post</p>
        <p className='second-text'>Automating your feed is just one click away</p>
      </div>
      <Calendar
        className="calendar"
        popup
        step={60}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        culture="fr"
        events={eventsList}
        drilldownView="week"
        style={{ height: "60vh", width: "100%" }}
        views={{ month: true, week: true }}
        selectable
        onSelectSlot={({ start }) => { creationModalRef.current.handleOpen(new Date(start)) }}
        onSelectEvent={(event, e) => { eventsRef.current[event.itemId].handleOpen() }}
      />
    </div >
  );

  const RightPart = () => (
    <div className='column' style={{ justifyContent: 'flex-start' }}>
      <div className="upcoming-container" style={{ backgroundColor: Colors.primary }}>
        <p className="upcoming-text">UPCOMING POSTS</p>
      </div>
      {nextPost()}
      <div
        className="cta-container"
        style={{ backgroundColor: Colors.shade1, margin: '20px' }}
        onClick={() => { creationModalRef.current.handleOpen() }}
      >
        <p style={{ fontSize: "16px" }} className="cta-text">CREATE POST</p>
      </div>
      <CreationModal ref={creationModalRef} />
    </div>
  )

  return (
    <>
      <Header {...props} />
      <div className="wrapper">
        <LeftPart />
        <RightPart />
      </div>
    </>
  );
};

export default Mycalendar;

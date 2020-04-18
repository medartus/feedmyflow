import React, { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CreationModal from "../../components/creationModal/creationModal";
import { Scrollbars } from "react-custom-scrollbars";
import Header from "../../components/header/header";
import { useTranslation } from "react-i18next";
import fire from "../../provider/firebase";

import { Colors } from "../../Constants";
import empty from "../../assets/empty.svg";
import "./calendar.css";

const useModalWithData = (initialMode = false, initialSelected = null) => {
  const [modalOpen, setModalOpen] = useState(initialMode);
  const [selected, setSelected] = useState(initialSelected);
  const setModalState = useCallback(
    (state) => {
      setModalOpen(state);
      if (state === false) {
        setSelected(null);
      }
    },
    [setModalOpen, setSelected]
  );
  const handleClose = useCallback(() => setModalState(false), [setModalState]);
  return {
    modalOpen,
    setModalOpen,
    selected,
    setSelected,
    setModalState,
    handleClose,
  };
};

const CALENDAR_STYLE = { height: "65vh", width: "100%" };
const CALENDAR_VIEWS = { month: true, week: true };

const localizer = momentLocalizer(moment);

const Mycalendar = (props) => {
  const [eventsList, setEventsList] = useState([]);
  const {
    modalOpen,
    selected,
    handleClose,
    setSelected,
    setModalState,
  } = useModalWithData();
  const { t, i18n } = useTranslation();
  if (eventsList.length > 0)
    console.log(new Date(eventsList[0].publicationTime.toDate()));

  useEffect(() => {
    const currentUser = fire.auth().currentUser;
    const userUid = currentUser.uid;
    const db = fire.firestore();
    var unsubscribeSnapshot = db
      .collection("user")
      .doc(userUid)
      .collection("post")
      .onSnapshot((documents) => {
        let newEventsList = documents.docs.map((query, i) => {
          let data = query.data();
          data["itemId"] = i;
          data["id"] = query.id;
          data["title"] = data.shareCommentary;
          data["start"] = new Date(data.publicationTime.toDate());
          data["end"] = moment(data.start).add(15, "m").toDate();
          return data;
        });
        newEventsList.sort((a, b) => a.start - b.start);
        setEventsList(newEventsList);
        return () => {
          unsubscribeSnapshot();
        };
      });
  }, []);

  const PostSummary = ({ rawDate, rawTime, title, id }) => (
    <div
      className="next-post"
      onClick={() => {
        setSelected(id);
        setModalState(true);
      }}
    >
      <p className="next-post-item">
        <span className="span-item">{t("calendar.date")}</span>
        {`${rawDate} ${rawTime}`}
      </p>
      <p className="next-post-item clipped">
        <span className="span-item">{t("calendar.content")}</span>
        {title}
      </p>
    </div>
  );

  const NextPosts = () => (
    <div className="column">
      {eventsList.length === 0 ? (
        <img src={empty} alt="empty" className="empty-img" />
      ) : (
        <Scrollbars
          style={{ width: "44vw", height: "27vw", marginTop: "50px" }}
        >
          {eventsList.map(({ itemId, ...data }) => (
            <PostSummary key={itemId} {...data} />
          ))}
        </Scrollbars>
      )}
    </div>
  );

  const HeaderText = () => (
    <div className="column" style={{ alignItems: "flex-start" }}>
      <p className="important-text">{t("calendar.schedule")}</p>
      <p className="second-text">{t("calendar.automate")}</p>
    </div>
  );

  const messageCalender = () => {
    return {
      allDay: t("calendar.messageCalendar.allDay"),
      previous: t("calendar.messageCalendar.previous"),
      next: t("calendar.messageCalendar.next"),
      today: t("calendar.messageCalendar.today"),
      month: t("calendar.messageCalendar.month"),
      week: t("calendar.messageCalendar.week"),
      day: t("calendar.messageCalendar.day"),
      agenda: t("calendar.messageCalendar.agenda"),
      date: t("calendar.messageCalendar.date"),
      time: t("calendar.messageCalendar.time"),
      event: t("calendar.messageCalendar.event"), // Or anything you want
      showMore: (total) => t("calendar.messageCalendar.showMore", { total }),
    };
  };

  const LeftPart = () => (
    <div className="column" style={{ alignItems: "flex-start" }}>
      <HeaderText />
      <Calendar
        messages={messageCalender()}
        className="calendar"
        popup
        step={60}
        localizer={localizer}
        defaultDate={new Date()}
        defaultView="month"
        culture={i18n.language}
        events={eventsList}
        drilldownView="week"
        style={CALENDAR_STYLE}
        views={CALENDAR_VIEWS}
        selectable
        onSelectSlot={({ start }) => setModalState(true)}
        onSelectEvent={(event, e) => {
          setSelected(event.id);
          setModalState(true);
        }}
      />
    </div>
  );

  const CreatePost = () => (
    <div
      className="cta-container"
      style={{ backgroundColor: Colors.shade1, margin: "20px" }}
      onClick={() => setModalState(true)}
    >
      <p style={{ fontSize: "16px" }} className="cta-text">
        {t("calendar.create")}
      </p>
    </div>
  );

  const UpcomingPosts = () => (
    <div
      className="upcoming-container"
      style={{ backgroundColor: Colors.primary }}
    >
      <p className="upcoming-text">{t("calendar.upcoming")}</p>
    </div>
  );

  const RightPart = () => (
    <div className="column" style={{ justifyContent: "flex-start" }}>
      <UpcomingPosts />
      <NextPosts />
      <CreatePost />
      <CreationModal
        isOpen={modalOpen}
        handleClose={handleClose}
        data={selected ? eventsList.filter((e) => e.id === selected)[0] : null}
      />
    </div>
  );

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

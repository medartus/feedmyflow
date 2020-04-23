import React, {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
  memo,
  useReducer,
} from "react";
import { Modal, Backdrop, Fade } from "@material-ui/core";
import { TextField, Select, MenuItem } from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import { ThemeProvider } from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";

import fire from "../../provider/firebase";
import { useTranslation } from "react-i18next";

import "./creationModal.css";
import {
  defaultAlertProps,
  getWarningProps,
  getDangerProps,
  isValidUrl,
} from "../../Constants";
import InfoAlert from "../InfoAlert/InfoAlert";
import PostPreview from "../PostPreview/PostPreview";
import { theme, ConfirmButton, DeleteButton, CloseIcon, useStyles } from "./styling";

const BACKDROP_PROPS = { timeout: 500, className: "backdrop" };
const descriptionPredicate = (hideDescription, isLinkValid) => {
  if (!isLinkValid || !hideDescription) return { display: "block" }
  return { display: "none" }
}

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_DATE":
      return { ...state, publicationDate: action.payload };
    case "SET_TIME":
      return { ...state, publicationTime: action.payload };
    case "SET_COMMENTARY":
      return { ...state, shareCommentary: action.payload };
    case "SET_CATEGORY":
      return { ...state, shareMediaCategory: action.payload };
    case "SET_VISIBILITY":
      return { ...state, visibility: action.payload };
    case "SET_TITLE":
      return { ...state, mediaTitle: action.payload };
    case "SET_DESCRIPTION":
      return { ...state, mediaDescription: action.payload };
    case "SET_HIDE_DESCRIPTION":
      return { ...state, hideDescription: action.payload };
    case "SET_URL":
      return { ...state, mediaUrl: action.payload };
    default:
      return state;
  }
};

const getInitialState = (props, isMedia, isEvent, date) => ({
  publicationDate: isEvent
    ? new Date(props.event.publicationTime.toDate())
    : date,
  publicationTime: isEvent
    ? new Date(props.event.publicationTime.toDate())
    : date,
  shareCommentary: isEvent ? props.event.shareCommentary : "",
  shareMediaCategory: isEvent ? props.event.shareMediaCategory : "NONE",
  visibility: isEvent ? props.event.visibility : "PUBLIC",
  mediaTitle: isEvent ? props.event.visibility : "PUBLIC",
  mediaDescription: isEvent && isMedia ? props.event.media.description : "",
  mediaUrl: isEvent && isMedia ? props.event.media.originalUrl : "",
  hideDescription: false
});

const CreationModal = memo(
  forwardRef((props, ref) => {
    // function variables
    let isEvent = props.event !== undefined;
    let isMedia = isEvent ? props.event.media !== undefined : false;
    const { t } = useTranslation();
    const db = fire.firestore();
    const userUid = fire.auth().currentUser.uid;
    const classes = useStyles();
    let date = new Date();
    date.setMinutes(60);

    // stateful values
    const [open, setOpen] = useState(false);
    const [haveModification, setHaveModification] = useState(false);
    const [canSave, setCanSave] = useState(false);
    const [alertProps, setAlertProps] = useState(defaultAlertProps);
    const [isLinkValid, setIsLinkValid] = useState(false);
    const [inPreviewMode, setPreviewMode] = useState(false);
    const [
      {
        publicationDate,
        publicationTime,
        shareCommentary,
        shareMediaCategory,
        visibility,
        mediaTitle,
        mediaDescription,
        mediaUrl,
        hideDescription
      },
      dispatch,
    ] = useReducer(reducer, getInitialState(props, isMedia, isEvent, date));

    // side-effects
    useEffect(() => {
      setIsLinkValid(isValidUrl(mediaUrl));
    }, [mediaUrl]);

    useEffect(() => {
      if (!open && !isEvent) {
        const date = new Date();
        dispatch({ type: "SET_DATE", payload: date });
        dispatch({ type: "SET_TIME", payload: date });
        dispatch({ type: "SET_COMMENTARY", payload: "" });
        dispatch({ type: "SET_CATEGORY", payload: "NONE" });
        dispatch({ type: "SET_VISIBILITY", payload: "PUBLIC" });
        dispatch({ type: "SET_TITLE", payload: "" });
        dispatch({ type: "SET_DESCRIPTION", payload: "" });
        dispatch({ type: "SET_URL", payload: "" });
      }
    }, [open, isEvent]);

    useEffect(() => {
      if (shareCommentary !== "") {
        if (shareMediaCategory === "NONE") setCanSave(true);
        else {
          if (mediaTitle !== "" && mediaDescription !== "" && mediaUrl !== "")
            setCanSave(true);
          else setCanSave(false);
        }
      } else setCanSave(false);
      return () => {
        setHaveModification(true);
      };
    }, [
      publicationDate,
      publicationTime,
      shareCommentary,
      shareMediaCategory,
      visibility,
      mediaTitle,
      mediaDescription,
      mediaUrl,
    ]);

    useImperativeHandle(ref, () => ({
      handleOpen(optDate = null) {
        if (optDate) {
          dispatch({ type: "SET_DATE", payload: optDate });
          dispatch({ type: "SET_TIME", payload: optDate });
        }
        setOpen(true);
      },
    }));

    // memoized functions
    const onCloseAlert = useCallback(
      () => setAlertProps({ ...alertProps, show: false }),
      [alertProps]
    );
    const setMediaTitleMemo = useCallback(
      (payload) => dispatch({ type: "SET_TITLE", payload }),
      []
    );
    const setHideDescriptionMemo = useCallback(
      (payload) => dispatch({ type: "SET_HIDE_DESCRIPTION", payload }),
      []
    );
    // helper functions
    const handleClose = () => {
      setOpen(false);
    };

    const formatData = () => {
      let rawDate = `${publicationDate.getDate()}/${
        publicationDate.getMonth() + 1
      }/${publicationDate.getFullYear()}`;
      let hours = publicationTime.getHours() == 0 ? "00" : publicationTime.getHours()
      let minutes = publicationTime.getMinutes() == 0 ? "00" : publicationTime.getMinutes()
      let rawTime = `${hours}:${minutes}`;
      let linekdinPost = {
        author: "urn:li:person:" + userUid.split(":")[1],
        userUID: userUid,
        publicationTime,
        shareCommentary,
        visibility,
        shareMediaCategory,
        rawDate,
        rawTime,
      };
      if (
        shareMediaCategory !== "NONE" &&
        mediaTitle !== "" &&
        mediaDescription !== "" &&
        mediaUrl !== ""
      ) {
        linekdinPost["media"] = {
          title: mediaTitle,
          description: mediaDescription,
          originalUrl: mediaUrl,
        };
      }
      return linekdinPost;
    };

    const validDate = () => {
      if (
        publicationDate.toString() === "Invalid Date" ||
        publicationTime.toString() === "Invalid Date"
      ) {
        setAlertProps(
          getWarningProps(t("creationModal.validDate.valid"), onCloseAlert)
        );
        return false;
      }
      let dateTocheck = new Date(publicationDate.getTime());
      dateTocheck.setHours(
        publicationTime.getHours(),
        publicationTime.getMinutes()
      );
      if (dateTocheck < new Date()) {
        setAlertProps(
          getWarningProps(t("creationModal.validDate.before"), onCloseAlert)
        );
        return false;
      }
      return true;
    };

    const configurePublicationTime = (dateTime) => {
      if (dateTime !== null) {
        let quarter = Math.floor(dateTime.getMinutes() / 15);
        if (!isNaN(dateTime.getMinutes())) {
          if (dateTime.getMinutes() % 15 !== 0)
            setAlertProps(
              getWarningProps(
                t("creationModal.publicationTime.quarter"),
                onCloseAlert
              )
            );
          if (dateTime.getMinutes() % 15 > 7) quarter += 1;
        }
        dateTime.setMinutes(quarter * 15);
      }
      dispatch({ type: "SET_TIME", payload: dateTime });
    };

    // Firebase functions
    const onSendData = () => {
      if (validDate()) {
        const linekdinPost = formatData();
        db.collection("user").doc(userUid).collection("post").add(linekdinPost);
      }
    };

    const onUpdateData = () => {
      if (validDate()) {
        const linekdinPost = formatData();
        let postId = props.event.id;
        db.collection("user")
          .doc(userUid)
          .collection("post")
          .doc(postId)
          .update(linekdinPost);
        handleClose();
        setHaveModification(false);
      }
    };

    const onDeleteData = () => {
      let postId = props.event.id;
      const onConfirm = () => {
        db.collection("user")
          .doc(userUid)
          .collection("post")
          .doc(postId)
          .delete();
      };
      setAlertProps(
        getDangerProps(
          t("creationModal.deleteDate.confirm"),
          t("creationModal.deleteDate.delete"),
          t("creationModal.deleteDate.cancel"),
          onConfirm,
          onCloseAlert
        )
      );
    };

    // render components
    const CustomAlert = () => (
      <>{alertProps.show && <InfoAlert {...alertProps} />}</>
    );

    const buttonSection = () =>
      isEvent ? (
        <div className="row">
          <DeleteButton onClick={onDeleteData}>
            {t("creationModal.button.delete")}
          </DeleteButton>
          <ConfirmButton onClick={onUpdateData} disabled={!haveModification}>
            {t("creationModal.button.update")}
          </ConfirmButton>
        </div>
      ) : (
          <ConfirmButton onClick={onSendData} disabled={!canSave}>
            {t("creationModal.button.create")}
          </ConfirmButton>
        );

    const topText = () => (
      <p
        className="important-text"
        id="creation-modal-toptext"
      >
        {isEvent
          ? t("creationModal.text.schedule", {
            rawDate: props.event.rawDate,
            rawTime: props.event.rawTime,
          })
          : t("creationModal.text.create")}
      </p>
    );

    const timeRow = () => (
      <div className="row" id="time-row">
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            required
            style={{ marginRight: "20px" }}
            id="date-picker-dialog"
            label={t("creationModal.input.date")}
            format="dd/MM/yyyy"
            value={publicationDate}
            onChange={(e) => dispatch({ type: "SET_DATE", payload: e })}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
          />
          <KeyboardTimePicker
            required
            id="time-picker"
            style={{ marginRight: "20px" }}
            label={t("creationModal.input.time")}
            value={publicationTime}
            ampm={false}
            minutesStep={15}
            onChange={(e) => configurePublicationTime(e)}
            KeyboardButtonProps={{
              "aria-label": "change time",
            }}
          />
          <div className="column" id="visibility-container" style={{ paddingTop: "16px" }}>
            <Select
              labelId={t("creationModal.input.visibility")}
              id="visibility"
              value={visibility}
              onChange={({ target: { value } }) =>
                dispatch({ type: "SET_VISIBILITY", payload: value })
              }
            >
              <MenuItem value="PUBLIC">
                {t("creationModal.input.visibilityValue.public")}
              </MenuItem>
              <MenuItem value="CONNECTIONS">
                {t("creationModal.input.visibilityValue.connexions")}
              </MenuItem>
            </Select>
          </div>
        </MuiPickersUtilsProvider>
      </div>
    );

    const contentRow = () => (
      <div className="row">
        <TextField
          fullWidth
          label={t("creationModal.input.shareCommentary")}
          id="shareCommentary"
          value={shareCommentary}
          onChange={({ target: { value } }) =>
            dispatch({ type: "SET_COMMENTARY", payload: value })
          }
          multiline
          rowsMax={4}
          required
        />
      </div>
    );

    const linkRow = () => (
      <div className="row">
        <TextField
          fullWidth
          id="mediaUrl"
          label={t("creationModal.input.mediaUrl")}
          value={mediaUrl}
          onChange={({ target: { value } }) =>
            dispatch({ type: "SET_URL", payload: value })
          }
        />
      </div>
    );

    const mediaTitleRow = () => (
      <div className="row">
        <TextField
          fullWidth
          id="mediaTitle"
          label={t("creationModal.input.mediaTitle")}
          value={mediaTitle}
          onChange={({ target: { value } }) =>
            dispatch({ type: "SET_TITLE", payload: value })
          }
        />
      </div>
    );

    const mediaDescriptionRow = () => (
      <div className="row" style={descriptionPredicate(hideDescription, isLinkValid)}>
        <TextField
          fullWidth
          id="mediaDescription"
          label={t("creationModal.input.mediaDescription")}
          value={mediaDescription}
          onChange={({ target: { value } }) =>
            dispatch({ type: "SET_DESCRIPTION", payload: value })
          }
          multiline
          rowsMax={4}
        />
      </div>
    );

    const closeButton = () => (
      <CloseIcon
        onClick={handleClose}
        className="close-icon"
      />
    );

    const phoneModeToggle = () => (
      <div id="phone-mode-toggle">
        <input type="radio" name="phonemode" id="edit" onClick={() => setPreviewMode(false)} checked={!inPreviewMode}/>
        <label for="edit" id="edit-label">Edit</label>
        <input type="radio" name="phonemode" id="preview" onClick={() => setPreviewMode(true)} checked={inPreviewMode}/>
        <label for="preview" id="preview-label">Preview</label>
      </div>
    )

    return (
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        id="modal"
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={BACKDROP_PROPS}
      >
        <Fade in={open}>
          <ThemeProvider theme={theme}>

            {phoneModeToggle()}

            <div id="creation-modal-container"
                 className = {inPreviewMode ? "card overflowable" : "card overflowable visible"}>
              {closeButton()}
              {topText()}
              {timeRow()}
              {contentRow()}
              {linkRow()}
              {mediaTitleRow()}
              {mediaDescriptionRow()}
              {buttonSection()}
            </div>
            <PostPreview
              inPreviewMode={inPreviewMode}
              photoUrl={fire.auth().currentUser.photoURL}
              displayName={fire.auth().currentUser.displayName}
              content={shareCommentary}
              title={mediaTitle}
              isLinkValid={isLinkValid}
              url={mediaUrl}
              description={mediaDescription}
              setTitle={setMediaTitleMemo}
              setHideDescription={setHideDescriptionMemo}
              hideDescription={hideDescription}
            />
            <CustomAlert />
          </ThemeProvider>
        </Fade>
      </Modal>
    );
  })
);

export default CreationModal;

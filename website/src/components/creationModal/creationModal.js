import React, {
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useImperativeHandle,
  memo,
} from "react";
import { Modal, Backdrop, Fade } from "@material-ui/core";
import {
  Grid,
  TextField,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
} from "@material-ui/core";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import {
  makeStyles,
  ThemeProvider,
  createMuiTheme,
  styled,
  withStyles,
} from "@material-ui/core/styles";
import DateFnsUtils from "@date-io/date-fns";
import fire from "../../provider/firebase";
import moment from "moment";
import "./creationModal.css";
import {
  Colors,
  defaultAlertProps,
  getWarningProps,
  getDangerProps,
  URL_REGEX,
} from "../../Constants";
import InfoAlert from "../InfoAlert/InfoAlert";
import PostPreview from "../PostPreview/PostPreview";

const theme = createMuiTheme({
  palette: {
    primary: {
      main: Colors.primary,
    },
  },
  overrides: {
    MuiFormLabel: {
      asterisk: {
        color: Colors.error,
        "&$error": {
          color: Colors.error,
        },
      },
    },
  },
});

const ConfirmButton = withStyles({
  root: {
    backgroundColor: Colors.shade1,
    marginTop: "20px",
    borderRadius: "100px",
    width: "15vw",
    "&:hover": {
      backgroundColor: Colors.primary,
    },
    "&:disabled": {
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
  },
  label: {
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
  },
})(Button);

const DeleteButton = withStyles({
  root: {
    backgroundColor: Colors.error,
    marginTop: "20px",
    borderRadius: "100px",
    width: "15vw",
    "&:hover": {
      backgroundColor: Colors.error,
    },
  },
  label: {
    color: "white",
    fontWeight: "bold",
    fontSize: "18px",
  },
})(Button);

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const CreationModal = memo(
  forwardRef((props, ref) => {
    let isEvent = props.event !== undefined;
    let isMedia = false;
    if (isEvent) isMedia = props.event.media !== undefined;

    const db = fire.firestore();
    const userUid = fire.auth().currentUser.uid;

    const classes = useStyles();
    const [open, setOpen] = React.useState(false);
    const [haveModification, setHaveModification] = useState(false);
    const [canSave, setCanSave] = useState(false);

    let date = new Date();
    date.setMinutes(60);

    const [publicationDate, setPublicationDate] = useState(
      isEvent ? new Date(props.event.publicationTime.toDate()) : date
    );
    const [publicationTime, setPublicationTime] = useState(
      isEvent ? new Date(props.event.publicationTime.toDate()) : date
    );
    const [shareCommentary, setShareCommentary] = useState(
      isEvent ? props.event.shareCommentary : ""
    );
    const [shareMediaCategory, setShareMediaCategory] = useState(
      isEvent ? props.event.shareMediaCategory : "NONE"
    );
    const [visibility, setVisibility] = useState(
      isEvent ? props.event.visibility : "PUBLIC"
    );
    const [mediaTitle, setMediaTitle] = useState(
      isEvent && isMedia ? props.event.media.title : ""
    );
    const [mediaDescription, setMediaDescription] = useState(
      isEvent && isMedia ? props.event.media.description : ""
    );
    const [mediaUrl, setMediaUrl] = useState(
      isEvent && isMedia ? props.event.media.originalUrl : ""
    );
    const [alertProps, setAlertProps] = useState(defaultAlertProps);
    const [isLinkValid, setIsLinkValid] = useState(false);

    useImperativeHandle(ref, () => ({
      handleOpen(optDate = null) {
        if (optDate) {
          setPublicationDate(optDate);
          setPublicationTime(optDate);
        }
        setOpen(true);
      },
    }));

    const handleClose = () => {
      setOpen(false);
    };
    const onCloseAlert = useCallback(
      () => setAlertProps({ ...alertProps, show: false }),
      [alertProps]
    );

    useEffect(() => {
      if (URL_REGEX.test(mediaUrl)) {
        setIsLinkValid(true);
      } else {
        setIsLinkValid(false);
      }
    }, [mediaUrl]);

    useEffect(() => {
      if (!open && !isEvent) {
        setPublicationDate(new Date());
        setPublicationTime(new Date());
        setShareCommentary("");
        setShareMediaCategory("NONE");
        setVisibility("PUBLIC");
        setMediaTitle("");
        setMediaDescription("");
        setMediaUrl("");
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

    const formatData = () => {
      let rawDate =
        publicationDate.getDate() +
        "/" +
        publicationDate.getMonth() +
        1 +
        "/" +
        publicationDate.getFullYear();
      let rawTime =
        publicationTime.getHours() + ":" + publicationTime.getMinutes();
      let time = moment(rawDate + " " + rawTime + ":00");
      console.log(time);
      let linekdinPost = {
        author: "urn:li:person:" + userUid.split(":")[1],
        userUID: userUid,
        publicationTime: publicationTime,
        shareCommentary: shareCommentary,
        visibility: visibility,
        shareMediaCategory: shareMediaCategory,
        rawDate: rawDate,
        rawTime: rawTime,
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
          getWarningProps("Please input a valid date.", onCloseAlert)
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
          getWarningProps("The date musn't be before now", onCloseAlert)
        );
        return false;
      }
      return true;
    };

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
          "Are you sure you want to delete that post ?",
          "delete post",
          "Cancel",
          onConfirm,
          onCloseAlert
        )
      );
    };

    const configurePublicationTime = (dateTime) => {
      if (dateTime != null) {
        let quarter = Math.floor(dateTime.getMinutes() / 15);
        if (!isNaN(dateTime.getMinutes())) {
          if (dateTime.getMinutes() % 15 !== 0)
            setAlertProps(
              getWarningProps(
                "Posts are scheduled every 15 minutes.",
                onCloseAlert
              )
            );
          if (dateTime.getMinutes() % 15 > 7) quarter += 1;
        }
        dateTime.setMinutes(quarter * 15);
      }
      setPublicationTime(dateTime);
    };

    const CustomAlert = () => (
      <>{alertProps.show && <InfoAlert {...alertProps} />}</>
    );

    const ButtonSection = () =>
      isEvent ? (
        <div className="row">
          <DeleteButton onClick={onDeleteData}>Delete</DeleteButton>
          <ConfirmButton onClick={onUpdateData} disabled={!haveModification}>
            Update
          </ConfirmButton>
        </div>
      ) : (
        <ConfirmButton onClick={onSendData} disabled={!canSave}>
          Create post
        </ConfirmButton>
      );

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
          className: "backdrop",
        }}
      >
        <Fade in={open}>
          <ThemeProvider theme={theme}>
            <div className="column card overflowable">
              <p
                className="important-text"
                style={{ fontSize: "22px", marginTop: "20px" }}
              >
                {isEvent
                  ? `Post scheduled for the ${props.event.rawDate} at ${props.event.rawTime}`
                  : "Create post"}
              </p>
              <div className="row">
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    margin="normal"
                    required
                    style={{ marginRight: "20px" }}
                    id="date-picker-dialog"
                    label="Date picker dialog"
                    format="dd/MM/yyyy"
                    value={publicationDate}
                    onChange={(e) => setPublicationDate(e)}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                  <KeyboardTimePicker
                    margin="normal"
                    required
                    id="time-picker"
                    style={{ marginRight: "20px" }}
                    label="Time picker"
                    value={publicationTime}
                    ampm={false}
                    minutesStep={15}
                    onChange={(e) => configurePublicationTime(e)}
                    KeyboardButtonProps={{
                      "aria-label": "change time",
                    }}
                  />
                  <div className="column" style={{ paddingTop: "24px" }}>
                    <Select
                      margin="normal"
                      labelId="Visibility"
                      id="visibility"
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value)}
                    >
                      <MenuItem value="PUBLIC">Public</MenuItem>
                      <MenuItem value="CONNECTIONS">Connexions</MenuItem>
                    </Select>
                  </div>
                </MuiPickersUtilsProvider>
              </div>
              <div className="row">
                <TextField
                  fullWidth
                  label="Content"
                  id="shareCommentary"
                  rowsMax={5}
                  value={shareCommentary}
                  onChange={(e) => setShareCommentary(e.target.value)}
                  multiline
                  required
                />
              </div>
              <div className="row">
                <TextField
                  fullWidth
                  id="mediaUrl"
                  label="Link"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
              <div
                className="row"
                style={{ display: isLinkValid ? "block" : "none" }}
              >
                <TextField
                  fullWidth
                  id="mediaTitle"
                  label="Title"
                  value={mediaTitle}
                  onChange={(e) => setMediaTitle(e.target.value)}
                />
              </div>
              <div
                className="row"
                style={{ display: isLinkValid ? "block" : "none" }}
              >
                <TextField
                  fullWidth
                  id="mediaDescription"
                  label="Description"
                  value={mediaDescription}
                  onChange={(e) => setMediaDescription(e.target.value)}
                  multiline
                />
              </div>
              <ButtonSection />
            </div>
            <PostPreview
              photoUrl={fire.auth().currentUser.photoURL}
              displayName={fire.auth().currentUser.displayName}
              content={shareCommentary}
              title={mediaTitle}
              isLinkValid={isLinkValid}
              url={mediaUrl}
              description={mediaDescription}
              setTitle={setMediaTitle}
              setDescription={setMediaDescription}
            />
            <CustomAlert />
          </ThemeProvider>
        </Fade>
      </Modal>
    );
  })
);
export default CreationModal;

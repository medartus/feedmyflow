import { Colors } from "../../Constants";
import {
  withStyles,
  Button,
  makeStyles,
  createMuiTheme,
} from "@material-ui/core";
import CancelIcon from "@material-ui/icons/Cancel";

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

const CloseIcon = withStyles({
  root: {
    fill: Colors.shade1
  }
})(CancelIcon);


const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export { theme, useStyles, DeleteButton, ConfirmButton, CloseIcon };

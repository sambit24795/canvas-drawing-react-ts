import React from "react";
import ReactDOM from "react-dom";

import classes from "./Modal.module.css";

interface IModalProps {}

const portalEl = document.getElementById("overlays");

const Backdrop: React.FunctionComponent = (props) => {
  return <div className={classes.backdrop}></div>;
};

const ModalOverlay: React.FunctionComponent = (props) => {
  return (
    <div className={classes.modal}>
      <div>{props.children}</div>
    </div>
  );
};

const Modal: React.FunctionComponent<IModalProps> = (props) => {
  return (
    <React.Fragment>
      {ReactDOM.createPortal(<Backdrop />, portalEl!)}
      {ReactDOM.createPortal(
        <ModalOverlay>{props.children}</ModalOverlay>,
        portalEl!
      )}
    </React.Fragment>
  );
};

export default Modal;

import React from "react";
import ReactModal, {Styles} from "react-modal";
import {
    StyledModalContent,
    StyledModalOverlay
} from "../styled";

ReactModal.setAppElement("#root");

interface ModalProps {
    children: React.ReactNode,
    isOpen: boolean,
    shouldCloseOnEsc: boolean,
    style?: Styles,
    onRequestClose?: () => void
}

const Modal: React.FC<ModalProps> = ({
    children,
    isOpen,
    shouldCloseOnEsc,
    style,
    onRequestClose
}) => {
    return <ReactModal
        style={style}
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        shouldCloseOnEsc={shouldCloseOnEsc}
        shouldCloseOnOverlayClick={false}
        className="_"
        overlayClassName="_"
        contentElement={(props, children) => <StyledModalContent {...props}>{children}</StyledModalContent>}
        overlayElement={(props, contentElement) => <StyledModalOverlay {...props}>{contentElement}</StyledModalOverlay>}
    >
        {children}
    </ReactModal>;
};

export default Modal;

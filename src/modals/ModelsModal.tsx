
import React from "react";

import {ArrowDownLeft01Icon} from "hugeicons-react";

import Modal from "../components/Modal";
import ModelCard from "../components/ModelCard";
import {useModel} from "../contexts/useModel";

import {
    StyledButtonWithIcon,
    StyledHeader1,
    StyledParagraph
} from "../styled";


interface ModelsModalProps {
    isOpen: boolean,
    onRequestClose: () => void
}

const ModelsModal: React.FC<ModelsModalProps> = ({isOpen, onRequestClose}) => {
    const {availableModels} = useModel();

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            shouldCloseOnEsc={true}
        >
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
            }}
            >
                <div>
                    <StyledHeader1 style={{marginTop: 0}}>
                        Models
                    </StyledHeader1>
                    <StyledParagraph>
                        A curated list of open source LLMs you can install on your laptop
                    </StyledParagraph>
                </div>
                <StyledButtonWithIcon
                    $type="secondary"
                    style={{width: "auto"}}
                    onClick={onRequestClose}
                >
                    <ArrowDownLeft01Icon />
                    <span>Back to document</span>
                </StyledButtonWithIcon>
            </div>
            <div style={{
                padding: "20px 8px 0 0",
                height: "calc(100vh - 235px)",
                overflowY: "scroll",
                boxSizing: "border-box"
            }}
            >
                <div style={{
                    display: "grid",
                    gridGap: 20,
                    gridTemplateColumns: "1fr 1fr 1fr"
                }}
                >
                    {
                        availableModels.map((model, i) => (
                            <div key={i}>
                                <ModelCard model={model} />
                            </div>
                        ))
                    }
                </div>
            </div>
        </Modal>
    );
};

export default ModelsModal;

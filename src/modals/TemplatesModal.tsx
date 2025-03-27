import React from "react";
import {ArrowDownLeft01Icon} from "hugeicons-react";

import Modal from "../components/Modal";
import TemplatesList from "../components/TemplatesList";

import {
    StyledButtonWithIcon,
    StyledHeader1,
    StyledParagraph
} from "../styled";

import {useDocument} from "../contexts/useDocument";
import {OpenTemplateModalAction} from "./TemplateModal";

interface TemplatesModalProps {
    isOpen: boolean,
    onTemplateSelected: (action: OpenTemplateModalAction) => void,
    onRequestClose: () => void
}

const TemplatesModal: React.FC<TemplatesModalProps> = ({
    isOpen,
    onTemplateSelected,
    onRequestClose
}) => {
    const {selectedDocument} = useDocument();

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
                        What do you want to write today?
                    </StyledHeader1>
                    <StyledParagraph>
                        Pre-written prompts you can customize to generate a first draft with AI
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
                padding: "20px 0 0 0",
                height: "calc(100vh - 240px)",
                boxSizing: "border-box"
            }}
            >
                <TemplatesList
                    onTemplateSelected={(templateId, templateName, templateDescription) => {
                        if (selectedDocument) {
                            onTemplateSelected({
                                documentId: selectedDocument.id,
                                type: "open_template_from_templates",
                                templateId,
                                templateName,
                                templateDescription
                            });
                        }
                    }}
                />
            </div>
        </Modal>
    );
};

export default TemplatesModal;

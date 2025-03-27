import {ArrowUpRight01Icon} from "hugeicons-react";
import {
    StyledHeader3,
    StyledParagraph,
    StyledTemplateCard
} from "../styled";
import {Template} from "../../types";

type TemplateCardProps = {
    template: Template,
    onClick: (templateId: string, templateName: string, templateDescription: string) => void
};

const TemplateCard: React.FC<TemplateCardProps> = ({template, onClick}) => {
    return (
        <StyledTemplateCard
            style={{
                cursor: "pointer",
                height: 140
            }}
            onClick={() => onClick(template.id, template.name, template.description)}
        >
            <StyledHeader3>
                { template.name }
                <ArrowUpRight01Icon className="right-arrow-icon" />
            </StyledHeader3>
            <StyledParagraph>
                { template.description }
            </StyledParagraph>
        </StyledTemplateCard>
    );
};

export default TemplateCard;

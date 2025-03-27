import {HugeiconsProps} from "hugeicons-react";
import {StyledEditorCommandsIcon} from "../../styled";

interface HugeiconsWrapperProps {
    icon: React.FC<Omit<HugeiconsProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
    size?: number
  }

export const EditorCommandsIconWrapper: React.FC<HugeiconsWrapperProps> = ({icon: IconComponent, size = 32}) => (
    <StyledEditorCommandsIcon>
        <IconComponent size={size} />
    </StyledEditorCommandsIcon>
);

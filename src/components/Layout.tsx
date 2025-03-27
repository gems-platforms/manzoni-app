import React from "react";
import {StyledLayout} from "../styled";

interface LayoutProps {
    children?: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({children}) => {
    return <StyledLayout>
        <div style={{flex: 1}}>
            { children }
        </div>
    </StyledLayout>;
};

export default Layout;

import React from "react";

import {ArrowLeft02Icon} from "hugeicons-react";
import {useNavigate} from "react-router-dom";
import ButtonTheme from "../components/ButtonTheme";

import {
    StyledButtonWithIcon,
    StyledHeader4,
    StyledParagraph
} from "../styled";
import {useTheme} from "../contexts/useTheme";
import Layout from "../components/Layout";

const Settings: React.FC = () => {
    const navigate = useNavigate();

    const {
        theme,
        toggleTheme
    } = useTheme();

    return (
        <Layout>
            <div style={{padding: 20}}>
                <div style={{
                    display: "flex",
                    alignItems: "flex-start"
                }}
                >
                    <StyledButtonWithIcon
                        $type="secondary"
                        onClick={() => navigate(-1)}
                        style={{width: "auto"}}
                    >
                        <ArrowLeft02Icon />
                        <span>Back to documents</span>
                    </StyledButtonWithIcon>
                </div>

                <StyledHeader4 style={{
                    textAlign: "center",
                    width: "100%"
                }}
                >
                    Customize your preferences for a more personalized experience
                </StyledHeader4>

                <div style={{
                    height: "100%",
                    boxSizing: "border-box",
                    maxWidth: 800,
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}
                    >
                        <StyledParagraph>
                            How Manzoni looks on your device
                        </StyledParagraph>
                        <ButtonTheme
                            theme={theme}
                            toggleTheme={toggleTheme}
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Settings;

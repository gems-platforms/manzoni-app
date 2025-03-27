import React from "react";
import {
    Route,
    Routes,
    Navigate,
    useLocation
} from "react-router-dom";
import {Toaster} from "sonner";

import {ThemeProvider} from "styled-components";
import Documents from "./views/Documents";

import {darkTheme, lightTheme} from "./theme";
import {StyledGlobal} from "./styled";

import {useDocument} from "./contexts/useDocument";
import {useTheme} from "./contexts/useTheme";
import Settings from "./views/Settings";

export const App: React.FC = () => {
    const {selectedDocument} = useDocument();
    const location = useLocation();

    const {theme} = useTheme();
    const currentTheme = theme === "light" ? lightTheme : darkTheme;

    return (
        <ThemeProvider theme={currentTheme}>
            <StyledGlobal />
            <Toaster
                richColors
                theme={theme === "light" ? "light" : "dark"}
                position="bottom-right"
            />
            <Routes location={location} key={location.pathname}>
                <Route
                    path="/documents/:documentId"
                    element={
                        <Documents />
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <Settings />
                    }
                />

                {/* Handle root `/` path by redirecting or showing a default element */}
                <Route
                    path="/"
                    element={
                        selectedDocument &&
                            selectedDocument.id ?
                            <Navigate
                                to={`/documents/${selectedDocument.id}`}
                            /> :
                            <div /> // Fallback content if no document is selected
                    }
                />

                {/* Redirect unknown paths to home */}
                {
                    selectedDocument &&
                        selectedDocument.id &&
                        <Route
                            path="*"
                            element={
                                selectedDocument && selectedDocument.id ? (
                                    <Navigate to={`/documents/${selectedDocument.id}`} />
                                ) : (
                                    <Navigate to="/" />
                                )
                            }
                        />
                }
            </Routes>
        </ThemeProvider>
    );
};

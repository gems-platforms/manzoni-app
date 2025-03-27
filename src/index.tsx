import {createRoot} from "react-dom/client";
import {HashRouter} from "react-router-dom";

import "@fontsource/inter/400.css"; // regular
import "@fontsource/inter/600.css"; // semibold

import {ModelProvider} from "./contexts/ModelProvider";
import {DocumentProvider} from "./contexts/DocumentProvider";

import {App} from "./app";
import {ThemeProvider} from "./contexts/ThemeProvider";

export const Index = () => {
    return (
        <ThemeProvider>
            <DocumentProvider>
                <ModelProvider>
                    <HashRouter future={{
                        // eslint-disable-next-line camelcase
                        v7_startTransition: true,
                        // eslint-disable-next-line camelcase
                        v7_relativeSplatPath: true
                    }}
                    >
                        <App />
                    </HashRouter>
                </ModelProvider>
            </DocumentProvider>
        </ThemeProvider>
    );
};

const container = document.getElementById("root");
if (container) {
    const root = createRoot(container);
    root.render(<Index />);
} else {
    console.error("Root container not found!");
}

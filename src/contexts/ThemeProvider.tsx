import {ReactNode, useState} from "react";
import {Theme, ThemeContext} from "./ThemeContext";

export function ThemeProvider({children}: {children: ReactNode}) {
    const [theme, setTheme] = useState<Theme>(localStorage.getItem("theme") as Theme || "light");

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

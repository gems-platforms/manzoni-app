import {Moon02Icon, Sun01Icon} from "hugeicons-react";
import {CSSProperties} from "react";
import {StyledButtonTheme} from "../styled";

interface ButtonThemeProps {
    theme: string,
    toggleTheme: () => void,
    style?: CSSProperties
}

const ButtonTheme: React.FC<ButtonThemeProps> = ({theme, toggleTheme, style}) => {
    return (
        <StyledButtonTheme onClick={toggleTheme} style={style}>
            {
                theme === "light" ? <>
                    <Moon02Icon fontWeight="bold" />
                </> : <>
                    <Sun01Icon />
                </>
            }
        </StyledButtonTheme>
    );
};

export default ButtonTheme;

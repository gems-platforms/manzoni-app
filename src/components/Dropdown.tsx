import {
    Add01Icon,
    ArrowTurnBackwardIcon,
    ArrowUpRight01Icon
} from "hugeicons-react";

import React, {LegacyRef} from "react";

import Select, {
    components,
    CSSObjectWithLabel,
    OptionProps,
    StylesConfig
} from "react-select";

import {darkTheme, lightTheme, ThemeType} from "../theme";
import {useTheme} from "../contexts/useTheme";

const customSelectStyles = (currentTheme: ThemeType, width: string | number): StylesConfig<any> => ({
    control: (base: CSSObjectWithLabel, state: any) => ({
        ...base,
        border: 0,
        outline: 0,
        backgroundColor: "transparent",
        padding: 0,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: width,
        boxShadow: "none"
    }),
    container: (base: CSSObjectWithLabel) => ({
        ...base,
        width: width
    }),
    menu: (base: CSSObjectWithLabel) => ({
        ...base,
        backgroundColor: currentTheme.dropdownBackground,
        border: `0.2px solid ${currentTheme.editorMenuContainerBorder}`,
        borderRadius: 10,
        padding: 5,
        boxShadow: "var(--shadow)"
    }),
    indicatorSeparator: () => ({
        display: "none"
    }),
    option: (base: CSSObjectWithLabel, state: any) => ({
        ...base,
        color: currentTheme.dropdownText,
        cursor: "pointer",
        borderRadius: 10,
        backgroundColor: state.isFocused
            ? currentTheme.dropdownBackgroundHover
            : currentTheme.dropdownBackground,
        "&:hover": {
            backgroundColor: currentTheme.dropdownBackgroundHover
        }
    }),
    group: (base: CSSObjectWithLabel) => ({
        ...base,
        padding: "5px 10px 0 10px",
        marginBottom: 5
    }),
    groupHeading: (base: CSSObjectWithLabel) => ({
        ...base,
        fontSize: 12,
        color: currentTheme.dropdownHeaderText,
        fontWeight: "bold",
        padding: "5px 10px" // Optional: adjust padding
    }),
    placeholder: (base: CSSObjectWithLabel) => ({
        ...base,
        color: currentTheme.dropdownText
    }),
    singleValue: (base: CSSObjectWithLabel) => ({
        ...base,
        color: currentTheme.dropdownText
    })
});

const CustomOption = (props: OptionProps<any>) => {
    const {isFocused, data} = props;

    return (
        <components.Option {...props}>
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 10,
                    padding: "5px",
                    cursor: "pointer"
                }}
            >
                <span>{data.label}</span>
                {
                    isFocused && (data.value === "custom" ?
                        <Add01Icon size={18} /> :
                        data.value === "explore_manage_models" ?
                            <ArrowUpRight01Icon size={18} /> :
                            <ArrowTurnBackwardIcon size={18} />)
                }
            </div>
        </components.Option>
    );
};

export interface DropdownOption {
    value: string,
    label: any
}

export interface DropdownGroup {
    label: string,
    options: DropdownOption[]
}

interface DropdownProps {
    width: string | number,
    placeholder: string,
    options: DropdownOption[] | DropdownGroup[],
    value?: DropdownOption,
    onChange: (selectedOption: DropdownOption) => void,
    refElement?: LegacyRef<any>,
    isDisabled?: boolean,
    menuIsOpen?: boolean,
    onMenuOpen?: () => void,
    onMenuClose?: () => void,
    onFocus?: () => void
}

const Dropdown: React.FC<DropdownProps> = ({
    width,
    placeholder,
    options,
    value,
    onChange,
    refElement,
    isDisabled,
    menuIsOpen,
    onMenuOpen,
    onMenuClose,
    onFocus
}) => {
    const {theme} = useTheme();
    const currentTheme: ThemeType = theme === "light" ? lightTheme : darkTheme;

    return (
        <Select
            ref={refElement}
            styles={customSelectStyles(currentTheme, width)}
            options={options}
            placeholder={placeholder}
            isSearchable={false}
            isDisabled={isDisabled}
            value={value}
            menuIsOpen={menuIsOpen}
            onChange={onChange}
            onMenuOpen={onMenuOpen}
            onMenuClose={onMenuClose}
            onFocus={onFocus}
            menuPlacement="auto"
            components={{
                Option: CustomOption
            }}
        />
    );
};


export default Dropdown;

import React from "react";
import {StyledLoadingIcon, StyledLoadingText} from "../styled";

type LoadingProps = {
    isLoading: boolean,
    message: string,
    children?: React.ReactNode
};

function Loading({
    isLoading,
    message,
    children
}: LoadingProps): JSX.Element {
    return (
        <>
            {
                isLoading ? (
                    <div style={{
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        alignItems: "center",
                        margin: 0,
                        width: "100%",
                        height: "100%"
                    }}
                    >
                        <StyledLoadingIcon size={10} />
                        <StyledLoadingText>
                            { message }
                        </StyledLoadingText>
                    </div>
                ) : (
                    <>
                        { children }
                    </>
                )
            }
        </>
    );
}

export default Loading;

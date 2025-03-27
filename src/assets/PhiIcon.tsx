interface PhiIconProps {
    width?: string | number,
    height?: string | number
}

export function PhiIcon({width = "100px", height = "100px"}: PhiIconProps) {
    return (
        <svg
            version="1.1"
            id="Layer_1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            viewBox="0 0 129 129"
            xmlSpace="preserve"
            width={width}
            height={height}
        >
            <style type="text/css">
                {`
                .st0{fill:#F25022;}
                .st1{fill:#7FBA00;}
                .st2{fill:#00A4EF;}
                .st3{fill:#FFB900;}
                `}
            </style>
            <path className="st0" d="M0,0h61.3v61.3H0V0z" />
            <path className="st1" d="M67.7,0H129v61.3H67.7V0z" />
            <path className="st2" d="M0,67.7h61.3V129H0V67.7z" />
            <path className="st3" d="M67.7,67.7H129V129H67.7V67.7z" />
        </svg>
    );
};

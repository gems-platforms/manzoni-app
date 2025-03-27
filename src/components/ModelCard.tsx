import {useState} from "react";

import {
    Cancel01Icon,
    Delete03Icon
} from "hugeicons-react";

import {useModel} from "../contexts/useModel";

import {
    StyledButton,
    StyledModelCard,
    StyledHeader2,
    StyledProgressBarPercent,
    StyledProgressBarStroke,
    StyledProgressBarTrail,
    StyledTable,
    StyledTableCell,
    StyledTableRow,
    StyledDeleteIcon,
    StyledDownloadIcon
} from "../styled";

import {Model} from "../../types";

import {getModelIcon} from "../assets";
import {Tooltip} from "./Tooltip";

type ModelCardProps = {
    model: Model
};

const ModelCard: React.FC<ModelCardProps> = ({model}) => {
    const {
        downloadProgress,
        downloadModel,
        deleteModel,
        cancelDownloadModel
    } = useModel();

    const [isDeleting, setIsDeleting] = useState(false);

    const handleDownload = async (model: Model) => {
        await downloadModel(model.name, model.id, model.downloadUrl);
    };

    const handleCancelDownloadModel = async (model: Model) => {
        await cancelDownloadModel(model.id);
    };

    const handleDelete = async (model: Model) => {
        await deleteModel(model.id);
        setIsDeleting(false);
    };

    const getParams = (params?: number): string => {
        if (params != null) {
            if (params >= 1_000_000_000) { // If it's 1 billion or more
                const billions = Math.floor(params / 1_000_000_000); // No decimals
                return `${billions} billion`;
            } else if (params >= 1_000_000) { // If it's 1 million or more but less than 1 billion
                const millions = Math.floor(params / 1_000_000); // No decimals
                return `${millions} million`;
            } else {
                return `${params}`; // If it's less than 1 million
            }
        }
        return "?";
    };

    const getSize = (megabytes?: number): string => {
        if (megabytes != null) {
            if (megabytes >= 1000) {
                const gigabytes = megabytes / 1000;
                return `${gigabytes.toFixed(2)} GB`;
            } else {
                return `${megabytes.toFixed(2)} MB`;
            }
        }
        return "?";
    };

    const getFlagEmojiFromLangCode = (langCode: string): string => {
        // Mapping the language code to the corresponding country code for flags
        const langToCountryCode: {[key: string]: string} = {
            en: "GB", // UK flag for English
            fr: "FR", // France
            de: "DE", // Germany
            es: "ES", // Spain
            it: "IT", // Italy
            pt: "PT", // Portugal
            ru: "RU", // Russia
            zh: "CN", // China
            ja: "JP", // Japan
            hi: "IN", // India for Hindi
            th: "TH", // Thailand for Thai
            ar: "SA", // Saudi Arabia for Arabic
            cs: "CZ", // Czech Republic for Czech
            ko: "KR", // South Korea for Korean
            nl: "NL" // Netherlands for Dutch
        };

        // Get the country code based on the language code
        const countryCode: string | undefined = langToCountryCode[langCode];
        if (!countryCode) {
            return ""; // Return empty string if no match
        }

        // Convert country code to flag emoji
        const flagEmoji: string = countryCode
            .toUpperCase()
            .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

        return flagEmoji;
    };

    const getLanguages = (languages?: string): JSX.Element => {
        if (languages != null) {
            // Split the input string into an array of language codes
            const langCodes: string[] = languages.split(",");

            // Map each language code to its corresponding flag emoji
            const flags: string[] = langCodes.map(getFlagEmojiFromLangCode);

            // Join the flags back into a space-separated string
            const visibleFlags = flags.slice(0, 2);
            const remainingCount = flags.length - 2;

            return (
                <>
                    {visibleFlags.join(" ")}
                    {remainingCount > 0 && (
                        <Tooltip
                            tooltipText={`${flags.slice(2).join("  ")}`}
                            delay={250}
                        >
                            <span
                                style={{
                                    marginLeft: 8,
                                    cursor: "pointer"
                                }}
                            >
                                {remainingCount}+
                            </span>
                        </Tooltip>
                    )}
                </>
            );
        }
        return <span>?</span>;
    };

    return (
        <StyledModelCard $isDeleting={isDeleting}>
            {
                downloadProgress[model.id] !== undefined && (
                    <div style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.85)", // semi-transparent overlay
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 10 // Make sure overlay is on top,
                    }}
                    >
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center"
                        }}
                        >
                            <div style={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: 150
                            }}
                            >
                                <StyledProgressBarStroke>
                                    <StyledProgressBarTrail
                                        style={{
                                            width: `${downloadProgress[model.id]}%`
                                        }}
                                    />
                                </StyledProgressBarStroke>
                                <StyledProgressBarPercent>
                                    { downloadProgress[model.id] }%
                                </StyledProgressBarPercent>
                            </div>
                            <StyledButton
                                $type="danger"
                                onClick={() => handleCancelDownloadModel(model)}
                            >
                                Cancel download
                            </StyledButton>
                        </div>
                    </div>
                )
            }

            <div style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 15
            }}
            >
                <div style={{
                    display: "flex",
                    alignItems: "center"
                }}
                >
                    {
                        model.type && getModelIcon(model.type, 25, 25)
                    }
                    <StyledHeader2 style={{margin: "5px 5px 5px 10px", fontSize: 18}}>
                        { model.name }
                    </StyledHeader2>
                </div>
                {
                    model.isDownloaded === 1 ? <>
                        {
                            isDeleting ? <>
                                <div style={{
                                    display: "flex"
                                }}
                                >
                                    <Tooltip
                                        tooltipText="Confirm"
                                    >
                                        <Delete03Icon
                                            style={{cursor: "pointer"}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(model);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip
                                        tooltipText="Cancel"
                                    >
                                        <Cancel01Icon
                                            style={{cursor: "pointer"}}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsDeleting(false);
                                            }}
                                        />
                                    </Tooltip>
                                </div>
                            </> : <Tooltip
                                tooltipText="Delete model"
                            >
                                <StyledDeleteIcon
                                    size={25}
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering openDocument on click
                                        setIsDeleting(true);
                                    }}
                                    $visible={true}
                                />
                            </Tooltip>
                        }
                    </> : <>
                        {
                            downloadProgress[model.id] === undefined && <Tooltip
                                tooltipText="Download model"
                            >
                                <StyledDownloadIcon
                                    size={25}
                                    onClick={() => handleDownload(model)}
                                />
                            </Tooltip>
                        }
                    </>
                }
            </div>
            <div style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between"
            }}
            >
                <div>
                    <StyledTable>
                        <tbody>
                            <StyledTableRow>
                                <StyledTableCell>
                                    <h4>Model size</h4>
                                    <p>{ getSize(model.size) }</p>
                                </StyledTableCell>
                                <StyledTableCell>
                                    <h4>Parameters</h4>
                                    <p>{ getParams(model.parameters) }</p>
                                </StyledTableCell>
                                <StyledTableCell style={{borderRight: "none"}}>
                                    <h4>Quantization</h4>
                                    <p>{ model.quantMethod || "?" }</p>
                                </StyledTableCell>
                            </StyledTableRow>
                            <StyledTableRow>
                                <StyledTableCell>
                                    <h4>Languages</h4>
                                    { getLanguages(model.languages) }
                                </StyledTableCell>
                                <StyledTableCell>
                                    <h4>License</h4>
                                    {
                                        model.licenseType != null ?
                                            model.licenseUrl != null ?
                                                <a href={model.licenseUrl} target="__blank">{model.licenseType}</a>
                                                : <p>{model.licenseType}</p>
                                            : <p>?</p>
                                    }
                                </StyledTableCell>
                                <StyledTableCell style={{borderRight: "none"}}>
                                    <h4>More info</h4>
                                    {
                                        model.moreInfoUrl != null ?
                                            <a href={model.moreInfoUrl} target="__blank">Click here</a>
                                            : <p>?</p>
                                    }
                                </StyledTableCell>
                            </StyledTableRow>
                        </tbody>
                    </StyledTable>
                </div>

            </div>
        </StyledModelCard>
    );
};

export default ModelCard;

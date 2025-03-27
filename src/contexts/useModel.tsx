import {useContext} from "react";
import {ModelContext, ModelContextType} from "./ModelContext";


export const useModel = (): ModelContextType => {
    const context = useContext(ModelContext);
    if (!context) {
        throw new Error("useDownload must be used within a ModelProvider");
    }
    return context;
};

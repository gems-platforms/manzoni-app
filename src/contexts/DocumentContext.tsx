import {
    createContext
} from "react";

import {Doc} from "../../types";

export interface DocumentContextType {
    documents: Doc[],
    selectedDocument?: Doc,
    openDocument: (docId: string) => Promise<Doc>,
    newDocument: () => Promise<Doc>,
    renameDocument: (docId: string, newName: string) => Promise<void>,
    updateDocumentModel: (modelId: string) => void,
    deleteDocument: (docToDelete: Doc) => Promise<Doc>
}

export const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

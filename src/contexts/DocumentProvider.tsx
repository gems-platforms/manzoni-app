import {ReactNode, useEffect, useState} from "react";
import {Doc} from "../../types";
import {DocumentContext} from "./DocumentContext";

export const DocumentProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [documents, setDocuments] = useState<Doc[]>([]);
    const [selectedDocument, setSelectedDocument] = useState<Doc | undefined>();

    const fetchDocuments = async () => {
        const docs: Doc[] = await window.electronAPI.fetchDocuments();
        if (docs && docs.length > 0) {
            setDocuments(docs);
            setSelectedDocument(docs[0]);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const openDocument = async (docId: string) => {
        const doc: Doc = await window.electronAPI.openDocument(docId);
        setSelectedDocument(doc);

        return doc;
    };

    const newDocument = async () => {
        const newDocument = await window.electronAPI.createDocument();
        setDocuments((prevDocuments) => {
            return [...prevDocuments, newDocument];
        });
        return newDocument;
    };

    const updateDocumentModel = (modelId: string) => {
        setSelectedDocument((prevDoc) => {
            if (prevDoc) {
                return {
                    ...prevDoc,
                    modelId: modelId
                };
            }
            return;
        });
    };

    const renameDocument = async (docId: string, newName: string) => {
        try {
            await window.electronAPI.renameDocument(docId, newName);
            const updatedDocuments = documents.map((doc) =>
                (doc.id === docId ? {
                    ...doc,
                    name: newName
                } : doc)
            );

            setSelectedDocument((prevDoc) => {
                if (prevDoc) {
                    return {
                        ...prevDoc,
                        name: newName
                    };
                }
                return;
            });

            setDocuments(updatedDocuments);
        } catch (error) {
            alert(error);
        }
    };

    const deleteDocument = async (docToDelete: Doc) => {
        const {
            deleted,
            createdNew,
            newDocument
        } = await window.electronAPI.deleteDocument(docToDelete.id);

        if (deleted) {
            const prevList = documents;
            const removedDocIndex = prevList.findIndex((doc) => doc.id === docToDelete.id);

            /*
           There always needs to be at least one document available.
           If the user deleted the last document in the app, the system deletes it an creates a new empty one.
           */
            if (createdNew) {
                await fetchDocuments();
            } else {
                setDocuments((prevDocuments) => {
                    return prevDocuments.filter((doc) => doc.id !== docToDelete.id);
                });
            }

            const doc = removedDocIndex > 0 ?
                prevList[removedDocIndex - 1] :
                prevList.length > 1 ?
                    prevList[removedDocIndex + 1] :
                    newDocument;
            return doc;
        }
    };

    return (
        <DocumentContext.Provider value={{
            documents,
            selectedDocument,
            openDocument,
            newDocument,
            renameDocument,
            updateDocumentModel,
            deleteDocument
        }}
        >
            {children}
        </DocumentContext.Provider>
    );
};

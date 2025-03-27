import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";

import DocumentList from "../components/DocumentList";
import Document from "../components/Document";
import Layout from "../components/Layout";

import {StyledDocumentList} from "../styled";

const Documents: React.FC = () => {
    const {documentId} = useParams();

    const [isDocumentListVisible, setIsDocumentListVisible] = useState<boolean>(
        JSON.parse(sessionStorage.getItem("isDocumentListVisible") || "true")
    );

    useEffect(() => {
        sessionStorage.setItem("isDocumentListVisible", JSON.stringify(isDocumentListVisible));
    }, [isDocumentListVisible]);

    return (
        <Layout>
            <div style={{display: "flex", height: "100%"}}>
                <StyledDocumentList
                    $visible={isDocumentListVisible}
                >
                    <DocumentList
                        documentId={documentId}
                    />
                </StyledDocumentList>
                {
                    documentId && <div style={{
                        flexGrow: 1 // This ensures it takes up the remaining space when DocumentList component is hidden
                    }}
                    >
                        <Document
                            documentId={documentId}
                            isDocumentListVisible={isDocumentListVisible}
                            onToggleDocsList={() => setIsDocumentListVisible(!isDocumentListVisible)}
                        />
                    </div>
                }
            </div>
        </Layout>
    );
};

export default Documents;

import {createDocumentsTable} from "../functions/createDocumentsTable";
import {createModelsTable} from "../functions/createModelsTable";
import {createTemplatesTable} from "../functions/createTemplatesTable";
import {cancelDownloadModel} from "./cancelDownloadModel";
import {createDocument} from "./createDocument";
import {deleteDocument} from "./deleteDocument";
import {deleteModel} from "./deleteModel";
import {downloadModel} from "./downloadModel";
import {fetchDocuments} from "./fetchDocuments";
import {fetchModel} from "./fetchModel";
import {fetchModels} from "./fetchModels";
import {fetchPromptForTemplate} from "./fetchPromptForTemplate";
import {fetchTemplates} from "./fetchTemplates";
import {fecthTemplatesRecentlyUsed} from "./fetchTemplatesRecentlyUsed";
import {fetchTemplatesSuggested} from "./fetchTemplatesSuggested";
import {abortTextGeneration, generateText} from "./generateText";
import {getAppVersion} from "./getAppVersion";
import {loadModel} from "./loadModel";
import {openDocument} from "./openDocument";
import {renameDocument} from "./renameDocument";
import {saveDocument} from "./saveDocument";
import {usedTemplate} from "./usedTemplate";

// Apply migrations (if needed) and create db tables
function applyMigrationsAndPopulate() {
    // Ensure to create the models table before the documents table
    createModelsTable();
    createDocumentsTable();
    createTemplatesTable();
};

export function setupIpcHandlers() {
    // Initialize the models database
    applyMigrationsAndPopulate();

    // ipcHandlers
    abortTextGeneration();
    fetchDocuments();
    fetchModels();
    generateText();
    loadModel();
    fecthTemplatesRecentlyUsed();
    fetchTemplatesSuggested();
    openDocument();
    fetchModel();
    downloadModel();
    cancelDownloadModel();
    deleteModel();
    saveDocument();
    createDocument();
    renameDocument();
    deleteDocument();
    fetchTemplates();
    fetchPromptForTemplate();
    usedTemplate();
    getAppVersion();
}

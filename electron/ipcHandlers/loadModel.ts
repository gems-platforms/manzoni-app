import fs from "fs";
import {ipcMain} from "electron";
import {getLlama, LlamaChatSession} from "node-llama-cpp";
import State from "../state";

/**
 * Loads a LLama Model
 */
export function loadModel() {
    ipcMain.handle("load-model", async (event, documentId, documentModelId, loadedModelId) => {
        try {
            const state = State.getInstance();
            const db = state.getDatabase();

            if (documentModelId != loadedModelId && documentId) {
                // Retrieve the model path from the database based on the documentModelId
                const modelRecord = db.prepare("SELECT modelPath FROM models WHERE id = ?").get(documentModelId) as {modelPath: string};

                // Check if the modelPath exists in the database
                if (!modelRecord || !modelRecord.modelPath) {
                    throw new Error(`No model found with id: ${documentModelId}`);
                }

                const modelPath = modelRecord.modelPath;

                // Check if the provided model path exists and is accessible
                if (!fs.existsSync(modelPath)) {
                    return false; // Return false if the model doesn't exist at the provided path
                }

                const llama = await getLlama();

                // Load the model using the provided path
                const model = await llama.loadModel({modelPath});

                // Initialize the model context
                const context = await model.createContext();
                state.setContext(context);

                const session = new LlamaChatSession({
                    contextSequence: context.getSequence()
                });
                state.setSession(session);

                const grammar = await llama.createGrammarForJsonSchema({
                    type: "object",
                    properties: {
                        generatedText: {
                            type: "string"
                        }
                    }
                });
                state.setGrammar(grammar);
            }

            // Update the documents table to store the selected documentModelId for the given documentId
            const result = db.prepare("UPDATE documents SET modelId = ? WHERE id = ?").run(documentModelId, documentId);

            if (result.changes === 0) {
                throw new Error(`Failed to update document with id: ${documentId}`);
            }

            const updatedRecord = db.prepare("SELECT * FROM models WHERE id = ?").get(documentModelId);
            return updatedRecord;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error loading model: ${error.message}`);
            } else {
                throw new Error("Unknown error occurred in load-model.");
            }
        }
    });
}

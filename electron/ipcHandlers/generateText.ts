import {ipcMain} from "electron";
import State from "../state";

let modelAbortController: AbortController | undefined;

// function that generates text
export function generateText() {
    ipcMain.handle("generate-text", async (event, userMessage) => {
        const state = State.getInstance();
        const modelGrammar = state.getGrammar();
        const modelContext = state.getContext();
        const modelSession = state.getSession();

        if (!modelSession) {
            throw new Error("Model not loaded");
        }

        // Initialize an accumulator to store all chunks for final parsing
        let accumulatedChunks = "";

        try {
            // Reset chat history. Answer without keeping in mind previous answers
            modelSession.resetChatHistory();

            // Create AbortController instance in case of abortion
            modelAbortController = new AbortController();

            if (modelAbortController) {
                const signal: AbortSignal = modelAbortController.signal;

                // Intercept the abort event
                signal.addEventListener("abort", () => {
                    event.sender.send("text-chunk-abort", "Text generation aborted.");
                });

                // stream text generation
                await modelSession.prompt(userMessage, {
                    temperature: 0.7,
                    topP: 0.9,
                    grammar: modelGrammar,
                    maxTokens: modelContext?.contextSize,
                    stopOnAbortSignal: true,
                    signal: signal,
                    onTextChunk(chunk) {
                        accumulatedChunks += chunk;
                        console.log(accumulatedChunks);
                        try {
                        // Try parsing the accumulatedChunks to see if it's valid
                            const parsedChunk = modelGrammar?.parse(accumulatedChunks + "\"}");
                            // If parsing is successful, send the parsed text to the renderer process
                            event.sender.send("text-chunk", parsedChunk?.generatedText);
                        } catch (error) {
                        // If parsing fails, we assume the chunk is not complete yet
                        // Do nothing and wait for more chunks to arrive
                            return;
                        }
                    }
                });
            }

            // dismiss AbortController instance
            modelAbortController = undefined;

            // Signal completion to the renderer process
            event.sender.send("text-chunk-success");
        } catch (error) {
            if (error instanceof Error) {
                console.error(`Error generating text: ${error.message}`);
                event.sender.send("text-chunk-error", "An error occurred during text generation.");
            } else {
                console.error("Unknown error occurred in generate-text.");
                event.sender.send("text-chunk-error", "An unknown error occurred.");
            }
        }
    });
}

// force stop of text generation
export function abortTextGeneration() {
    ipcMain.handle("abort-text-generation", () => {
        if (modelAbortController) {
            modelAbortController.abort();
            modelAbortController = undefined;
        }
    });
}

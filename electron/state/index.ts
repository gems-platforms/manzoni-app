/**
 * Structures required by LlamaModel for handling chat sessions. These get
 * created when the model is loaded.
 */
import path from "path";
import fs from "fs";
import {createRequire} from "module";
import {app} from "electron";
import {
    LlamaChatSession,
    LlamaContext,
    LlamaJsonSchemaGrammar
} from "node-llama-cpp";
import {Database} from "better-sqlite3";

const require = createRequire(import.meta.url);
const SQLiteDB = require("better-sqlite3");

class State {
    private static instance: State;

    // The model variables
    private modelGrammar: LlamaJsonSchemaGrammar<{
      type: "object",
      properties: {
        generatedText: {
          type: "string"
        }
      }
    }> | undefined = undefined;

    private modelContext: LlamaContext | undefined = undefined;
    private modelSession: LlamaChatSession | undefined = undefined;

    private db: Database;

    private activeDownloads: Map<string, {controller: AbortController, writer: fs.WriteStream, modelPath: string}> = new Map();

    // Private constructor ensures only one instance is created
    private constructor() {
        this.db = new SQLiteDB(path.join(app.getPath("userData"), "app.db"));
    }

    // Get the singleton instance of the state
    public static getInstance(): State {
        if (!State.instance) {
            State.instance = new State();
        }
        return State.instance;
    }

    // Getters and setters for model state
    public getGrammar(): LlamaJsonSchemaGrammar<{type: "object", properties: {generatedText: {type: "string"}}}> | undefined {
        return this.modelGrammar;
    }

    public setGrammar(grammar: LlamaJsonSchemaGrammar<{type: "object", properties: {generatedText: {type: "string"}}}> | undefined) {
        this.modelGrammar = grammar;
    }

    public getContext(): LlamaContext | undefined {
        return this.modelContext;
    }

    public setContext(context: LlamaContext | undefined) {
        this.modelContext = context;
    }

    public getSession(): LlamaChatSession | undefined {
        return this.modelSession;
    }

    public setSession(session: LlamaChatSession | undefined) {
        this.modelSession = session;
    }

    public getDatabase(): Database {
        return this.db;
    }

    // Methods for managing active downloads
    public hasActiveDownload(key: string): boolean {
        return this.activeDownloads.has(key);
    }

    public getActiveDownload(key: string): {controller: AbortController, writer: fs.WriteStream, modelPath: string} | undefined {
        return this.activeDownloads.get(key);
    }

    public getActiveDownloads(): Map<string, {controller: AbortController, writer: fs.WriteStream, modelPath: string}> {
        return this.activeDownloads; // Return the Map directly
    }

    public setActiveDownload(key: string, downloadInfo: {controller: AbortController, writer: fs.WriteStream, modelPath: string}) {
        this.activeDownloads.set(key, downloadInfo);
    }

    public deleteActiveDownload(key: string): boolean {
        return this.activeDownloads.delete(key);
    }
}

export default State;

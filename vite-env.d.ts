/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly GEMINI_API_KEY?: string;
    // Add more env variables here as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

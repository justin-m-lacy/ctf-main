declare global {
    namespace NodeJS {
        interface ProcessEnv {
            SERVER_PORT: string;
            MODE: 'development' | 'production' | undefined,

            /// Authentication and Db access.
            PROJECT_NAME: string,
            PUBLIC_KEY: string,
            SECRET_KEY: string,
            DB_PASS: string,
            PROJECT_ID: string,
            /// Safe in browser with row-level security.
            API_KEY?: string
        }
    }
}

export { }
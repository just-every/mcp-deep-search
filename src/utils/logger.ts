// Simple logger utility with debug levels
export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

class Logger {
    private level: LogLevel = LogLevel.INFO;

    setLevel(level: LogLevel): void {
        this.level = level;
    }

    error(message: string, ...args: any[]): void {
        if (this.level >= LogLevel.ERROR) {
            console.error(`[ERROR] ${message}`, ...args);
        }
    }

    warn(message: string, ...args: any[]): void {
        if (this.level >= LogLevel.WARN) {
            console.error(`[WARN] ${message}`, ...args);
        }
    }

    info(message: string, ...args: any[]): void {
        if (this.level >= LogLevel.INFO) {
            console.error(`[INFO] ${message}`, ...args);
        }
    }

    debug(message: string, ...args: any[]): void {
        if (this.level >= LogLevel.DEBUG) {
            console.error(`[DEBUG] ${message}`, ...args);
        }
    }
}

export const logger = new Logger();

// Set log level based on environment variable
const envLogLevel = process.env.LOG_LEVEL?.toUpperCase();
if (envLogLevel) {
    switch (envLogLevel) {
        case 'ERROR':
            logger.setLevel(LogLevel.ERROR);
            break;
        case 'WARN':
            logger.setLevel(LogLevel.WARN);
            break;
        case 'INFO':
            logger.setLevel(LogLevel.INFO);
            break;
        case 'DEBUG':
            logger.setLevel(LogLevel.DEBUG);
            break;
    }
}

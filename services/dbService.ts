// services/dbService.ts

// This is a singleton promise that will be shared across the entire application.
// It ensures that the database initialization logic runs only once.
const dbPromise = new Promise<any>((resolve, reject) => {
    // Check for the DB API every 100ms.
    const interval = setInterval(() => {
        if ((window as any).aistudio?.db) {
            clearInterval(interval);
            resolve((window as any).aistudio.db);
        }
    }, 100);

    // After a 5-second timeout, if the DB is still not available, reject the promise.
    setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Database API did not initialize within 5 seconds."));
    }, 5000);
});

/**
 * Returns a promise that resolves with the initialized database instance.
 * This function ensures all parts of the app use the same database connection promise.
 */
export const getDb = (): Promise<any> => {
    return dbPromise;
};

import { openDB } from "idb";

const DB_NAME = "ReportSessionDB";
const STORE_NAME = "sessionData";

const initDB = async () => {
    const db = await openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME);
        },
    });
    return db;
};

export const saveSession = async (key: string, value: any) => {
    const db = await initDB();
    await db.put(STORE_NAME, value, key);
};

export const loadSession = async (key: string) => {
    const db = await initDB();
    console.log(key)
    return await db.get(STORE_NAME, key);
};

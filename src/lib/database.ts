import { MainDatabase } from "./database/databaseInstance";

/**
 * This file contains the "public" interface for the Database Abstraction.
 * 
 * A consumer (= the View-Layer) should import Methods from here
 * 
 * 
 */
export const tricksDao = MainDatabase.instance.tricksDao;
export const combosDao = MainDatabase.instance.combosDao;

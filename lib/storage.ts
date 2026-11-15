import * as SQLite from 'expo-sqlite';
import { Data, Exercise, exercises, initialData, catalogVersion } from './data';
let db: Promise<SQLite.SQLiteDatabase> | undefined;
async function database() {
 if (!db) db = SQLite.openDatabaseAsync('form-workouts.db').then(async database => {
  await database.execAsync('CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY, json TEXT NOT NULL); CREATE TABLE IF NOT EXISTS exercises (id TEXT PRIMARY KEY, name TEXT NOT NULL, muscle TEXT NOT NULL, equipment TEXT NOT NULL, tutorial TEXT NOT NULL); CREATE TABLE IF NOT EXISTS catalog_metadata (id INTEGER PRIMARY KEY, version TEXT NOT NULL);');
  const existing = await database.getFirstAsync<{version: string}>('SELECT version FROM catalog_metadata WHERE id = 1');
  if (existing?.version !== catalogVersion) await database.withTransactionAsync(async () => {
   for (const exercise of exercises) await database.runAsync('INSERT OR REPLACE INTO exercises VALUES (?, ?, ?, ?, ?)', exercise.id, exercise.name, exercise.muscle, exercise.equipment, JSON.stringify(exercise));
   await database.runAsync('INSERT OR REPLACE INTO catalog_metadata VALUES (1, ?)', catalogVersion);
  });
  return database;
 }).catch(error => { db = undefined; throw error; });
 return db;
}
export async function loadExercises(): Promise<Exercise[]> {
 const rows = await (await database()).getAllAsync<{id: string; name: string; muscle: string; equipment: string; tutorial: string}>('SELECT * FROM exercises ORDER BY name COLLATE NOCASE');
 return rows.map(row => ({ id: row.id, name: row.name, muscle: row.muscle, equipment: row.equipment, ...JSON.parse(row.tutorial) }));
}
export async function load(): Promise<Data> { const row = await (await database()).getFirstAsync<{json: string}>('SELECT json FROM app_state WHERE id = 1'); return row ? JSON.parse(row.json) : initialData; }
export async function save(data: Data) { await (await database()).runAsync('INSERT OR REPLACE INTO app_state VALUES (1, ?)', JSON.stringify(data)); }

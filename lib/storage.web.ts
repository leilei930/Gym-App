import { Data, initialData } from './data';
export async function load(): Promise<Data> { const raw = globalThis.localStorage?.getItem('form-workouts-v1'); return raw ? JSON.parse(raw) : initialData; }
export async function save(data: Data) { globalThis.localStorage.setItem('form-workouts-v1', JSON.stringify(data)); }

export async function loadExercises() { return (await import('./data')).exercises; }

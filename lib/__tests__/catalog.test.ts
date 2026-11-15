import { exercises, importedExercises, legacyExercises, initialData, searchExercises } from '../data';
import source from '../../data/free-exercise-db/source.json';
test('imports a pinned complete catalog with unique permanent IDs and instructions', () => {
 expect(source.commit).toMatch(/^[a-f0-9]{40}$/);
 expect(importedExercises).toHaveLength(876);
 expect(new Set(exercises.map(e => e.id)).size).toBe(exercises.length);
 for (const e of importedExercises) {
  expect(e.id).toBe(`fedb:${e.sourceId}`);
  expect(Array.isArray(e.cues)).toBe(true);
  for (const uri of e.images || []) expect(uri).toContain(source.commit);
 }
});
test('keeps all original IDs, names, instructions and default plan references', () => {
 for (const old of legacyExercises) expect(exercises.find(e => e.id === old.id)).toMatchObject(old);
 for (const p of initialData.plans) for (const id of p.exerciseIds) expect(exercises.some(e => e.id === id)).toBe(true);
});
test('searches multiple terms, muscles and equipment together', () => {
 const results = searchExercises(exercises, 'bench dumbbell', 'Chest', 'dumbbell');
 expect(results.some(e => e.sourceId === 'Dumbbell_Bench_Press')).toBe(true);
 expect(results.every(e => e.muscle === 'Chest' && e.equipment === 'dumbbell')).toBe(true);
 expect(searchExercises(exercises, 'no-such-exercise-xyz')).toEqual([]);
 expect(searchExercises(exercises, 'abdominals', 'Core').length).toBeGreaterThan(0);
});

test('preserves upstream gaps without invented instructions or photos', () => {
 expect(importedExercises.filter(e => !e.cues.length)).toHaveLength(5);
 expect(importedExercises.filter(e => !e.images?.length)).toHaveLength(3);
});


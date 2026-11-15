const mockState = { plans: [{ id: 'custom', name: 'My plan', exerciseIds: ['bench'], sets: 4, reps: 8 }], history: [{ id: 'old-session', name: 'Saved', startedAt: 100, entries: [{ exerciseId: 'rdl', sets: [{ weight: '40', reps: '8', done: true }] }] }], active: null, restEnd: null };
let mockVersion: string | undefined;
const mockRows = new Map<string, any>();
const mockRun = jest.fn(async (sql: string, ...args: any[]) => {
 if (sql.includes('INTO exercises')) mockRows.set(args[0], { id: args[0], name: args[1], muscle: args[2], equipment: args[3], tutorial: args[4] });
 if (sql.includes('INTO catalog_metadata')) mockVersion = args[0];
});
jest.mock('expo-sqlite', () => ({ openDatabaseAsync: jest.fn(async () => ({
 execAsync: jest.fn(async () => {}), runAsync: mockRun,
 withTransactionAsync: jest.fn(async (fn: () => Promise<void>) => fn()),
 getFirstAsync: jest.fn(async (sql: string) => sql.includes('app_state') ? { json: JSON.stringify(mockState) } : mockVersion ? { version: mockVersion } : null),
 getAllAsync: jest.fn(async () => [...mockRows.values()]),
})) }));
import { load, loadExercises } from '../storage';
import { catalogVersion } from '../data';
test('seeds the catalog once and preserves pre-existing workout data', async () => {
 const [state, catalog] = await Promise.all([load(), loadExercises()]);
 expect(state).toEqual(mockState);
 expect(catalog).toHaveLength(884);
 expect(mockVersion).toBe(catalogVersion);
 expect(catalog.find(e => e.id === 'bench')?.name).toBe('Dumbbell bench press');
 expect(catalog.some(e => e.id === 'fedb:Dumbbell_Bench_Press')).toBe(true);
 expect(mockRun.mock.calls.some(([sql]) => /DELETE|DROP|INTO app_state/i.test(sql))).toBe(false);
 const count = mockRun.mock.calls.length;
 await loadExercises();
 expect(mockRun.mock.calls.length).toBe(count);
});

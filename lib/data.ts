import sourceData from '../data/free-exercise-db/exercises.json';
import provenance from '../data/free-exercise-db/source.json';
export type Exercise = { id: string; name: string; muscle: string; equipment: string; motion?: 'squat' | 'press' | 'hinge' | 'pull'; cues: string[]; images?: string[]; primaryMuscles?: string[]; secondaryMuscles?: string[]; level?: string; category?: string; sourceId?: string };
export const legacyExercises: Exercise[] = [
 { id: 'squat', name: 'Goblet squat', muscle: 'Legs', equipment: 'Dumbbell', motion: 'squat', cues: ['Hold a dumbbell close to your chest.', 'Sit down between your hips with heels grounded.', 'Stand tall, keeping knees in line with toes.'] },
 { id: 'bench', name: 'Dumbbell bench press', muscle: 'Chest', equipment: 'Dumbbells', motion: 'press', cues: ['Lie on a bench with feet planted.', 'Lower the weights beside your chest with wrists stacked.', 'Press upward with control.'] },
 { id: 'row', name: 'Bent-over row', muscle: 'Back', equipment: 'Dumbbells', motion: 'pull', cues: ['Hinge at your hips with a steady back.', 'Pull elbows toward your hips.', 'Lower slowly without swinging your torso.'] },
 { id: 'rdl', name: 'Romanian deadlift', muscle: 'Legs', equipment: 'Dumbbells', motion: 'hinge', cues: ['Stand with soft knees and weights near your thighs.', 'Push hips back, keeping the weights close.', 'Stand by driving through your feet.'] },
 { id: 'press', name: 'Shoulder press', muscle: 'Shoulders', equipment: 'Dumbbells', motion: 'press', cues: ['Start with weights at shoulder height.', 'Press overhead while keeping ribs down.', 'Lower smoothly to the starting position.'] },
 { id: 'pulldown', name: 'Lat pulldown', muscle: 'Back', equipment: 'Cable machine', motion: 'pull', cues: ['Sit tall with thighs secured under the pads.', 'Pull the bar toward your upper chest.', 'Return slowly without leaning back excessively.'] },
 { id: 'lunge', name: 'Reverse lunge', muscle: 'Legs', equipment: 'Bodyweight', motion: 'squat', cues: ['Stand with feet hip-width apart.', 'Step back and lower both knees.', 'Push through the front foot to return; alternate sides.'] },
 { id: 'curl', name: 'Biceps curl', muscle: 'Arms', equipment: 'Dumbbells', motion: 'pull', cues: ['Stand tall with elbows beside your ribs.', 'Curl the weights without swinging.', 'Lower slowly through a comfortable range.'] },
];
export type WorkoutSet = { weight: string; reps: string; done: boolean };
export type Entry = { exerciseId: string; sets: WorkoutSet[] };
export type Session = { id: string; name: string; startedAt: number; endedAt?: number; entries: Entry[] };
export type Plan = { id: string; name: string; exerciseIds: string[]; sets: number; reps: number };
export type Data = { plans: Plan[]; history: Session[]; active: Session | null; restEnd: number | null };
export const initialData: Data = { plans: [
 { id: 'full', name: 'Full body foundations', exerciseIds: ['squat', 'bench', 'row', 'rdl'], sets: 3, reps: 10 },
 { id: 'upper', name: 'Upper body strength', exerciseIds: ['bench', 'row', 'press', 'curl'], sets: 3, reps: 10 },
], history: [], active: null, restEnd: null };
export const volume = (session: Session) => session.entries.reduce((total, entry) => total + entry.sets.filter(s => s.done).reduce((sum, s) => sum + Number(s.weight) * Number(s.reps), 0), 0);
export const completedSets = (session: Session) => session.entries.reduce((n, e) => n + e.sets.filter(s => s.done).length, 0);

const muscleGroups: Record<string, string> = { abdominals: 'Core', abductors: 'Legs', adductors: 'Legs', calves: 'Legs', glutes: 'Legs', hamstrings: 'Legs', quadriceps: 'Legs', biceps: 'Arms', triceps: 'Arms', forearms: 'Arms', chest: 'Chest', lats: 'Back', 'middle back': 'Back', 'lower back': 'Back', traps: 'Back', shoulders: 'Shoulders', neck: 'Neck' };
export const catalogVersion = 'free-db-v1-' + provenance.commit;
export const importedExercises: Exercise[] = sourceData.map(e => ({
 id: 'fedb:' + e.id, sourceId: e.id, name: e.name,
 muscle: muscleGroups[e.primaryMuscles[0]] || 'Other', equipment: e.equipment || 'Not specified',
 cues: e.instructions, primaryMuscles: e.primaryMuscles, secondaryMuscles: e.secondaryMuscles,
 level: e.level, category: e.category,
 images: e.images.map(path => 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/' + provenance.commit + '/exercises/' + path.split('/').map(encodeURIComponent).join('/')),
}));
// Keep original IDs and instructions intact: old plans and history must not change meaning.
const legacyPhotoMatches: Record<string, string> = { squat: 'Goblet_Squat', bench: 'Dumbbell_Bench_Press', row: 'Bent_Over_Two-Dumbbell_Row', press: 'Dumbbell_Shoulder_Press', pulldown: 'Wide-Grip_Lat_Pulldown', curl: 'Dumbbell_Bicep_Curl' };
export const exercises: Exercise[] = [...legacyExercises.map(e => ({ ...e, images: importedExercises.find(x => x.sourceId === legacyPhotoMatches[e.id])?.images || [] })), ...importedExercises].sort((a, b) => a.name.localeCompare(b.name));
export function searchExercises(catalog: Exercise[], query: string, muscle = 'All', equipment = 'All') {
 const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
 return catalog.filter(e => (muscle === 'All' || e.muscle === muscle) && (equipment === 'All' || e.equipment === equipment) && terms.every(term => [e.name, e.equipment, e.muscle, ...(e.primaryMuscles || []), ...(e.secondaryMuscles || [])].join(' ').toLowerCase().includes(term)));
}

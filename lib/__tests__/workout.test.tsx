import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Pressable, TextInput } from 'react-native';
import App from '../../app/(tabs)/index';
import { load, save } from '../storage';
import { initialData } from '../data';
jest.mock('../storage', () => ({ loadExercises: jest.fn().mockImplementation(async () => jest.requireActual('../data').exercises), load: jest.fn(), save: jest.fn().mockResolvedValue(undefined) }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
let mounted: renderer.ReactTestRenderer | undefined;
afterEach(async () => { if (mounted) await act(async () => mounted!.unmount()); jest.restoreAllMocks(); });
const textOf = (node: renderer.ReactTestInstance): string => node.children.map(c => typeof c === 'string' ? c : textOf(c)).join('');
test('logs a set, starts rest, saves only completed sets and shows history', async () => {

 jest.spyOn(Date, 'now').mockReturnValue(1800000000000);
 (load as jest.Mock).mockResolvedValue(JSON.parse(JSON.stringify(initialData)));
 let tree!: renderer.ReactTestRenderer;
 await act(async () => { tree = renderer.create(<App/>); mounted = tree; });

 const press = async (label: string) => { const target = tree.root.findAll(n => typeof n.props.onPress === 'function').find(n => textOf(n).includes(label)); expect(target).toBeDefined(); await act(async () => target!.props.onPress()); };
 await press('Full body foundations');
 const weight = tree.root.findAll(n => typeof n.props.onChangeText === 'function').find(n => n.props.accessibilityLabel === 'Set 1 weight in kilograms');
 await act(async () => weight!.props.onChangeText('20'));
 const complete = tree.root.findAll(n => typeof n.props.onPress === 'function').find(n => n.props.accessibilityLabel === 'Complete set');
 await act(async () => complete!.props.onPress());
 expect(textOf(tree.root)).toContain('1:30');
 await press('Finish & save workout');
 const saved = (save as jest.Mock).mock.calls.at(-1)[0];
 expect(saved.active).toBeNull();
 expect(saved.history).toHaveLength(1);
 expect(saved.history[0].entries).toHaveLength(1);
 expect(saved.history[0].entries[0].sets).toEqual([{ weight: '20', reps: '10', done: true }]);
 expect(textOf(tree.root)).toContain('200 kg volume');
 await act(async () => tree.unmount());
 jest.restoreAllMocks();

});






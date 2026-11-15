import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Exercise } from '../lib/data';
import { bundledPhotos } from '../lib/bundledPhotos';
function Photo({ uri, name, index }: { uri: string; name: string; index: number }) {
 const [failed, setFailed] = useState(false);
 const [attempt, setAttempt] = useState(0);
 const key = decodeURIComponent(uri.split('/exercises/')[1] || '');
 return <View style={{ marginBottom: 16 }}><Text style={{ color: '#99a499', marginBottom: 8 }}>Photo {index + 1}</Text>{failed ? <Pressable accessibilityRole="button" onPress={() => { setAttempt(n => n + 1); setFailed(false); }} style={{ padding: 24, backgroundColor: '#1b201c', borderRadius: 14 }}><Text style={{ color: '#dcfa7b' }}>Photo unavailable. Connect to the internet and tap to retry.</Text></Pressable> : <Image key={attempt} source={bundledPhotos[key] || { uri }} accessibilityLabel={`${name}, demonstration photo ${index + 1}`} style={{ width: '100%', height: 270, borderRadius: 14, backgroundColor: '#eef0eb' }} contentFit="contain" cachePolicy="disk" onError={() => setFailed(true)}/>}</View>;
}
export function ExercisePhotos({ exercise }: { exercise: Exercise }) {
 if (!exercise.images?.length) return <Text style={{ color: '#99a499' }}>No tutorial photos are available for this exercise. Follow the written instructions below.</Text>;
 return <View>{exercise.images.map((uri, index) => <Photo key={uri} uri={uri} name={exercise.name} index={index}/>)}</View>;
}

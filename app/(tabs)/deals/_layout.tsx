import { Stack } from 'expo-router';
import { auth } from '../../../firebaseConfig';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function DealsLayout() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace('/(auth)/login');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Stack>
      <Stack.Screen 
        name="index"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="add"
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="[id]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

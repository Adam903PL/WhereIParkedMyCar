// import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Where I Parked My Car',
          }}
        />
        <Stack.Screen
          name="compass"
          options={{
            title: 'Compass Navigation',
          }}
        />
      </Stack>
    </>
  );
}

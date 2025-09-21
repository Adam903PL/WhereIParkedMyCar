// import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

export default function RootLayout() {

  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: 'Where I Parked My Car',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="compass"
          options={{
            title: 'Compass Navigation',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

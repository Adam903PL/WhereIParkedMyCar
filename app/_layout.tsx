import * as NavigationBar from 'expo-navigation-bar';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    // Configure navigation bar for dark theme
    NavigationBar.setBackgroundColorAsync('#000000');
    NavigationBar.setButtonStyleAsync('light');
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack>   
        <Stack.Screen 
          name="index" 
          options={{ 
            title: 'Where I Parked My Car',
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
}
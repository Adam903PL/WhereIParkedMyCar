// app/components/LanguageSelector.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getCurrentLanguage, onLanguageChange, setLanguage, SupportedLanguage } from '../../i18n';

const { width } = Dimensions.get('window');

// Language configuration
const languageConfig: Record<SupportedLanguage, { flag: string; name: string }> = {
  pl: { flag: '🇵🇱', name: 'Polski' },
  en: { flag: '🇺🇸', name: 'English' },
  uk: { flag: '🇺🇦', name: 'Українська' },
  es: { flag: '🇪🇸', name: 'Español' },
};

interface LanguageSelectorProps {
  style?: any;
}

export default function LanguageSelector({ style }: LanguageSelectorProps) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('pl');
  const [isOpen, setIsOpen] = useState(false);

  // Animation values
  const dropdownOpacity = useSharedValue(0);
  const dropdownScale = useSharedValue(0.95);
  const chevronRotation = useSharedValue(0);

  // Initialize current language
  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage());
    
    const unsubscribe = onLanguageChange((language) => {
      setCurrentLanguage(language);
    });
    return unsubscribe;
  }, []);

  // Handle dropdown toggle
  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);

    if (newIsOpen) {
      dropdownOpacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
      dropdownScale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.back(1.1)),
      });
      chevronRotation.value = withTiming(180, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    } else {
      dropdownOpacity.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
      dropdownScale.value = withTiming(0.95, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
      chevronRotation.value = withTiming(0, {
        duration: 150,
        easing: Easing.in(Easing.quad),
      });
    }
  };

  // Handle language selection
  const selectLanguage = async (language: SupportedLanguage) => {
    if (language === currentLanguage) {
      toggleDropdown();
      return;
    }

    try {
      console.log('Changing language from', currentLanguage, 'to', language);
      await setLanguage(language);
      console.log('Language changed successfully to', language);
      toggleDropdown();
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Animation styles
  const dropdownAnimatedStyle = useAnimatedStyle(() => ({
    opacity: dropdownOpacity.value,
    transform: [
      { scale: dropdownScale.value },
      { translateY: -5 }
    ],
  }));

  const chevronAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${chevronRotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Main Button */}
      <TouchableOpacity
        onPress={toggleDropdown}
        activeOpacity={0.8}
        style={styles.mainButton}
        testID="language-selector-button"
      >
        <Text style={styles.flag}>
          {languageConfig[currentLanguage].flag}
        </Text>
        <Text style={styles.languageCode}>
          {currentLanguage.toUpperCase()}
        </Text>
        <Animated.View style={chevronAnimatedStyle}>
          <Ionicons 
            name="chevron-down" 
            size={14} 
            color="#9CA3AF" 
          />
        </Animated.View>
      </TouchableOpacity>

      {/* Dropdown */}
      {isOpen && (
        <Animated.View style={[styles.dropdown, dropdownAnimatedStyle]}>
          {Object.entries(languageConfig).map(([code, config]) => (
            <TouchableOpacity
              key={code}
              onPress={() => selectLanguage(code as SupportedLanguage)}
              style={[
                styles.languageOption,
                currentLanguage === code && styles.selectedLanguageOption,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.optionFlag}>{config.flag}</Text>
              <Text style={[
                styles.optionText,
                currentLanguage === code && styles.selectedOptionText,
              ]}>
                {config.name}
              </Text>
              {currentLanguage === code && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color="#3B82F6" 
                />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={toggleDropdown}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.4)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 40,
    minWidth: 80,
  },
  flag: {
    fontSize: 16,
    marginRight: 6,
  },
  languageCode: {
    color: '#F9FAFB',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
    letterSpacing: 0.5,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 160,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(75, 85, 99, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
    overflow: 'hidden',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  optionFlag: {
    fontSize: 16,
    marginRight: 10,
  },
  optionText: {
    flex: 1,
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#93C5FD',
    fontWeight: '600',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: -1,
  },
});
// app/components/LanguageSelector.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import {
  getCurrentLanguage,
  getSupportedLanguages,
  setLanguage,
  SupportedLanguage,
  t,
} from '../../i18n';
import {
  ANIMATIONS,
  BORDER_RADIUS,
  COLORS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from '../../theme/designTokens';

const { width, height } = Dimensions.get('window');

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const languageFlags: Record<SupportedLanguage, string> = {
  pl: '🇵🇱',
  en: '🇺🇸',
  uk: '🇺🇦',
  es: '🇪🇸',
};

function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  const currentLanguage = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();
  
  // Debug log
  console.log('LanguageSelector debug:', { currentLanguage, supportedLanguages });

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, ANIMATIONS.spring.bouncy);
      modalOpacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      modalScale.value = withSpring(0.8, ANIMATIONS.spring.gentle);
      modalOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [visible, backdropOpacity, modalScale, modalOpacity]);

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
    opacity: modalOpacity.value,
  }));

  const handleLanguageSelect = async (language: SupportedLanguage) => {
    if (language !== currentLanguage) {
      await setLanguage(language);
    }
    onClose();
  };

  const handleBackdropPress = () => {
    onClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
              <Animated.View style={[styles.modal, modalAnimatedStyle]}>
                <BlurView intensity={80} style={styles.blurContainer}>
                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.title}>{t('language.selectLanguage')}</Text>
                    <TouchableOpacity
                      onPress={onClose}
                      style={styles.closeButton}
                      testID="close-language-selector"
                    >
                      <Ionicons name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Language Options */}
                  <ScrollView 
                    style={styles.languageList}
                    showsVerticalScrollIndicator={false}
                  >
                    {supportedLanguages ? Object.entries(supportedLanguages).map(([code, name]) => {
                      const languageCode = code as SupportedLanguage;
                      const isSelected = languageCode === currentLanguage;
                      
                      return (
                        <TouchableOpacity
                          key={languageCode}
                          onPress={() => handleLanguageSelect(languageCode)}
                          style={[
                            styles.languageOption,
                            isSelected && styles.selectedLanguageOption,
                          ]}
                          testID={`language-option-${languageCode}`}
                        >
                          <View style={styles.languageInfo}>
                            <Text style={styles.languageFlag}>
                              {languageFlags[languageCode]}
                            </Text>
                            <View style={styles.languageText}>
                              <Text style={[
                                styles.languageName,
                                isSelected && styles.selectedLanguageName,
                              ]}>
                                {name}
                              </Text>
                              <Text style={[
                                styles.languageCode,
                                isSelected && styles.selectedLanguageCode,
                              ]}>
                                {languageCode.toUpperCase()}
                              </Text>
                            </View>
                          </View>
                          
                          {isSelected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={24}
                              color={COLORS.success[500]}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }) : null}
                  </ScrollView>

                  {/* Footer */}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      {t('language.restartNote')}
                    </Text>
                  </View>
                </BlurView>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    width: '100%',
  },
  modal: {
    width: Math.min(width - SPACING.xl * 2, 400),
    height: Math.min(height * 0.7, 500),
    borderRadius: BORDER_RADIUS.xxl,
    overflow: 'hidden',
    backgroundColor: '#2a2a2a',
    borderWidth: 2,
    borderColor: '#444444',
    ...SHADOWS.xl,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: '#333333',
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#666666',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: '#555555',
  },
  languageList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    minHeight: 200,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: '#444444',
    borderWidth: 1,
    borderColor: '#666666',
    minHeight: 60,
  },
  selectedLanguageOption: {
    backgroundColor: '#4CAF50',
    borderColor: '#66BB6A',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  languageText: {
    flex: 1,
  },
  languageName: {
    fontSize: TYPOGRAPHY.fontSizes.lg,
    fontWeight: TYPOGRAPHY.fontWeights.medium as any,
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedLanguageName: {
    color: '#FFFFFF',
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  languageCode: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectedLanguageCode: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#666666',
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default LanguageSelector;
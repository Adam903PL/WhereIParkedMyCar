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

export default function LanguageSelector({ visible, onClose }: LanguageSelectorProps) {
  const backdropOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.8);
  const modalOpacity = useSharedValue(0);

  const currentLanguage = getCurrentLanguage();
  const supportedLanguages = getSupportedLanguages();

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
                    {Object.entries(supportedLanguages).map(([code, name]) => {
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
                    })}
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    ...SHADOWS.xl,
  },
  blurContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSizes.xl,
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
    color: COLORS.text.primary,
  },
  closeButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageList: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 60,
  },
  selectedLanguageOption: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: COLORS.success[500],
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
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  selectedLanguageName: {
    color: COLORS.success[400],
    fontWeight: TYPOGRAPHY.fontWeights.bold as any,
  },
  languageCode: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.tertiary,
  },
  selectedLanguageCode: {
    color: COLORS.success[300],
  },
  footer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSizes.sm,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

// Import translation files
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pl from './locales/pl.json';
import uk from './locales/uk.json';

// Define supported languages
export const supportedLanguages = {
  pl: 'Polski',
  en: 'English',
  uk: 'Українська',
  es: 'Español',
  de: 'Deutsch',
  fr: 'Français',
} as const;

export type SupportedLanguage = keyof typeof supportedLanguages;

// Translation resources
const resources = {
  pl,
  en,
  uk,
  es,
  de,
  fr,
};

// Language detection and storage
const LANGUAGE_STORAGE_KEY = 'app_language';

class CustomI18nManager {
  private currentLanguage: SupportedLanguage = 'pl';
  private listeners: ((language: SupportedLanguage) => void)[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeLanguage();
  }

  private async initializeLanguage() {
    try {
      // Try to get saved language from storage
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      
      if (savedLanguage && savedLanguage in supportedLanguages) {
        this.currentLanguage = savedLanguage as SupportedLanguage;
      } else {
        // Auto-detect language from device
        const deviceLanguage = this.detectDeviceLanguage();
        this.currentLanguage = deviceLanguage;
        // Save detected language
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, this.currentLanguage);
      }
    } catch (error) {
      console.error('Error initializing language:', error);
      // Fallback to Polish
      this.currentLanguage = 'pl';
    } finally {
      this.isInitialized = true;
    }
  }

  public async waitForInitialization(): Promise<void> {
    while (!this.isInitialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  private detectDeviceLanguage(): SupportedLanguage {
    const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
    
    // Extract language code (e.g., 'pl' from 'pl-PL')
    const languageCode = deviceLocale.split('-')[0].toLowerCase();
    
    // Check if device language is supported
    if (languageCode in supportedLanguages) {
      return languageCode as SupportedLanguage;
    }
    
    // Check for similar languages
    const languageMap: { [key: string]: SupportedLanguage } = {
      'pl': 'pl',
      'en': 'en',
      'uk': 'uk',
      'ua': 'uk', // Ukrainian alternative code
      'es': 'es',
      'es-ES': 'es',
      'es-MX': 'es',
      'de': 'de',
      'de-DE': 'de',
      'de-AT': 'de',
      'de-CH': 'de',
      'fr': 'fr',
      'fr-FR': 'fr',
      'fr-CA': 'fr',
      'fr-BE': 'fr',
      'fr-CH': 'fr',
    };
    
    if (deviceLocale in languageMap) {
      return languageMap[deviceLocale];
    }
    
    // Default fallback
    return 'pl';
  }

  async setLanguage(language: SupportedLanguage): Promise<void> {
    try {
      // Wait for initialization to complete
      await this.waitForInitialization();
      
      this.currentLanguage = language;
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      
      // Notify listeners
      this.listeners.forEach(listener => listener(language));
    } catch (error) {
      console.error('Error setting language:', error);
    }
  }

  getCurrentLanguage(): SupportedLanguage {
    // Return current language immediately, even if not fully initialized
    return this.currentLanguage;
  }

  async getCurrentLanguageAsync(): Promise<SupportedLanguage> {
    await this.waitForInitialization();
    return this.currentLanguage;
  }

  getSupportedLanguages(): typeof supportedLanguages {
    return supportedLanguages;
  }

  // Translation function
  t(key: string): string {
    const keys = key.split('.');
    let value: any = resources[this.currentLanguage];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Polish if key not found
        value = resources.pl;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found anywhere
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  }

  // Subscribe to language changes
  onLanguageChange(listener: (language: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Get all translations for current language
  getTranslations() {
    return resources[this.currentLanguage];
  }
}

// Create singleton instance
const i18n = new CustomI18nManager();

export default i18n;

// Export translation function for convenience
export const t = (key: string) => i18n.t(key);

// Export language management functions
export const setLanguage = (language: SupportedLanguage) => i18n.setLanguage(language);
export const getCurrentLanguage = () => i18n.getCurrentLanguage();
export const getSupportedLanguages = () => i18n.getSupportedLanguages();
export const onLanguageChange = (listener: (language: SupportedLanguage) => void) => i18n.onLanguageChange(listener);

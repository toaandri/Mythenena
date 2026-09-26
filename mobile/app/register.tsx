import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useI18n } from '@/lib/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [form, setForm] = useState({ name: '', identifier: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = form.identifier.includes('@');
  const isPhone = /^[\d\s+\-]{8,}$/.test(form.identifier);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess(false);

    if (!form.name.trim() || !form.identifier.trim() || !form.password || !form.confirmPassword) {
      setError(t('register.error.required'));
      return;
    }

    if (form.name.trim().length < 2) {
      setError(t('register.error.nameTooShort'));
      return;
    }

    if (!isEmail && !isPhone) {
      setError(t('register.error.invalidIdentifier'));
      return;
    }

    if (form.password.length < 6) {
      setError(t('register.error.passwordTooShort'));
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t('register.error.passwordMismatch'));
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.replace('/login'), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.backgroundBlobTop} />
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top + 8, 18) }]}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color="#23443c" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('register.title')}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.iconWrap}>
            <Ionicons name="person-add-outline" size={20} color="#2d9c86" />
          </View>
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

          {success && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#2d9c86" />
              <Text style={styles.successText}>{t('register.success')}</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#d65b5b" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.sectionLabel}>{t('register.nameLabel')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="person-outline" size={18} color="#7a8a85" />
            <TextInput
              value={form.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder={t('register.namePlaceholder')}
              placeholderTextColor="#7a8a85"
              autoCapitalize="none"
              style={styles.input}
              editable={!success}
            />
          </View>

          <Text style={styles.sectionLabel}>{t('register.identifierLabel')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name={isEmail ? 'mail-outline' : 'call-outline'} size={18} color="#7a8a85" />
            <TextInput
              value={form.identifier}
              onChangeText={(value) => handleChange('identifier', value)}
              placeholder={isEmail ? 'vous@exemple.com' : '+261 3X XX XX XX'}
              placeholderTextColor="#7a8a85"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType={isEmail ? 'email-address' : 'phone-pad'}
              style={styles.input}
              editable={!success}
            />
          </View>

          <Text style={styles.sectionLabel}>{t('register.passwordLabel')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color="#7a8a85" />
            <TextInput
              value={form.password}
              onChangeText={(value) => handleChange('password', value)}
              placeholder={t('register.passwordPlaceholder')}
              placeholderTextColor="#7a8a85"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.input, styles.inputWithAction]}
              editable={!success}
            />
            <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#6b7a76"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>{t('register.confirmPasswordLabel')}</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#7a8a85" />
            <TextInput
              value={form.confirmPassword}
              onChangeText={(value) => handleChange('confirmPassword', value)}
              placeholder={t('register.confirmPasswordPlaceholder')}
              placeholderTextColor="#7a8a85"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              style={[styles.input, styles.inputWithAction]}
              editable={!success}
            />
            <TouchableOpacity onPress={() => setShowPassword((value) => !value)} activeOpacity={0.8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#6b7a76"
              />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, (loading || success) && styles.primaryButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={loading || success}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? t('common.loading') : t('register.submit')}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={18} color="#ffffff" />}
        </TouchableOpacity>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>{t('register.hasAccount')}</Text>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.replace('/login')}>
            <Text style={styles.footerLink}>{t('register.loginLink')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.termsNote} activeOpacity={0.85} onPress={() => router.push('/settings/privacy')}>
          <Text style={styles.termsText}>{t('register.termsNote')}</Text>
        </TouchableOpacity>

        <Text style={styles.demoNote}>{t('register.demoNote')}</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#eef2ef',
  },
  backgroundBlobTop: {
    position: 'absolute',
    top: -80,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(45, 156, 134, 0.13)',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffffcc',
    borderWidth: 1,
    borderColor: '#d8e3de',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a2320',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#dfe9e5',
    shadowColor: '#22332d',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7f6f0',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a2320',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#61706b',
  },
  successBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e7f6f0',
    borderRadius: 12,
    padding: 12,
  },
  successText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#2d9c86',
  },
  errorBanner: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fdecec',
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#d65b5b',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2d9c86',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f4f8f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe9e5',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a2320',
    fontWeight: '600',
  },
  inputWithAction: {
    paddingRight: 4,
  },
  primaryButton: {
    flexDirection: 'row',
    marginTop: 18,
    backgroundColor: '#2d9c86',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#2d9c86',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#61706b',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2d9c86',
  },
  termsNote: {
    marginTop: 14,
    alignSelf: 'center',
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#2d9c86',
    fontWeight: '600',
  },
  demoNote: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 11,
    color: '#7a8a85',
  },
});

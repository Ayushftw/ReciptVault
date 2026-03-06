import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Switch } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../hooks/useTheme';
import { OCRScanner } from '../../components/OCRScanner';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { parseOCRText } from '../../utils/ocrParser';
import { addReceipt, generateReceiptId } from '../../services/receiptsService';
import { uploadReceiptImage } from '../../services/storageService';
import { scheduleWarrantyNotifications } from '../../services/notificationService';
import { todayISO } from '../../utils/dateHelpers';
import {
  FONTS,
  SPACING,
  BORDER_RADIUS,
  SHADOW,
  CATEGORY_ICONS,
  FREE_PLAN_LIMIT,
} from '../../utils/constants';
import { ReceiptCategory, Receipt, RECEIPT_CATEGORIES, WARRANTY_DURATIONS } from '../../types';

type AddStep = 'camera' | 'scanning' | 'form';

interface ReceiptForm {
  productName: string;
  storeName: string;
  purchaseDate: string;
  amount: string;
  category: ReceiptCategory;
  hasWarranty: boolean;
  warrantyMonths: number;
  warrantyExpiryManual: string;
  notes: string;
}

function isValidDateString(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(new Date(d).getTime());
}

function isTodayOrLater(d: string) {
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

export default function AddReceiptScreen() {
  const router = useRouter();
  const { currentUser, receipts } = useAppStore();
  const { colors } = useTheme();
  const [step, setStep] = useState<AddStep>('camera');
  const [imageUri, setImageUri] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const today = todayISO();

  const { control, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<ReceiptForm>({
      defaultValues: {
        productName: '',
        storeName: '',
        purchaseDate: today,
        amount: '',
        category: 'other',
        hasWarranty: false,
        warrantyMonths: 12,
        warrantyExpiryManual: '',
        notes: '',
      },
    });

  const hasWarranty = watch('hasWarranty');

  const handleImageCapture = useCallback(
    async (uri: string) => {
      setImageUri(uri);
      setStep('scanning');
      try {
        let rawText = '';
        try {
          const TextRecognition = require('@react-native-ml-kit/text-recognition');
          const result = await TextRecognition.default.recognize(uri);
          rawText = result?.text || '';
        } catch {
          console.log('ML Kit not available. Skipping OCR.');
        }
        if (rawText) {
          const parsed = parseOCRText(rawText);
          if (parsed.productName) setValue('productName', parsed.productName);
          if (parsed.storeName) setValue('storeName', parsed.storeName);
          if (parsed.purchaseDate) setValue('purchaseDate', parsed.purchaseDate);
          if (parsed.amount) setValue('amount', parsed.amount.toString());
        }
      } catch (err) {
        console.log('OCR failed:', err);
      }
      setStep('form');
    },
    [setValue]
  );

  const onSubmit = async (data: ReceiptForm) => {
    if (!currentUser) return Alert.alert('Error', 'You must be signed in.');
    if (currentUser.plan === 'free' && receipts.length >= FREE_PLAN_LIMIT) {
      return Alert.alert('Free Plan Limit', `You've reached ${FREE_PLAN_LIMIT} receipts. Upgrade to Pro!`);
    }

    try {
      setSaving(true);
      const receiptId = generateReceiptId();
      let downloadUrl = '';
      if (imageUri) downloadUrl = await uploadReceiptImage(currentUser.uid, receiptId, imageUri);

      const warrantyExpiry = data.hasWarranty ? data.warrantyExpiryManual : '';

      const receipt: Receipt = {
        id: receiptId,
        userId: currentUser.uid,
        productName: data.productName,
        storeName: data.storeName,
        purchaseDate: data.purchaseDate,
        amount: parseFloat(data.amount) || 0,
        currency: 'USD',
        hasWarranty: data.hasWarranty,
        warrantyMonths: data.hasWarranty ? data.warrantyMonths : 0,
        warrantyExpiryDate: warrantyExpiry,
        warrantyNotes: '',
        category: data.category,
        imageUri: downloadUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: data.notes,
      };

      if (receipt.hasWarranty && receipt.warrantyExpiryDate) {
        const notifIds = await scheduleWarrantyNotifications(receipt);
        receipt.notificationId30Days = notifIds.id30Days;
        receipt.notificationId7Days = notifIds.id7Days;
      }
      await addReceipt(currentUser.uid, receipt);
      Alert.alert('Saved! 🎉', 'Receipt added.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (step === 'camera') return <OCRScanner onCapture={handleImageCapture} onCancel={() => router.back()} />;
  if (step === 'scanning') return <View style={[styles.scanning, { backgroundColor: colors.background }]}><LoadingSpinner message="Reading your receipt..." /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={[styles.backBtn, { color: colors.primary }]}>← Back</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.textPrimary }]}>New Receipt</Text>
            <View style={{ width: 50 }} />
          </View>

          {/* Image */}
          {imageUri ? (
            <TouchableOpacity onPress={() => setStep('camera')} style={[styles.imageBox, { backgroundColor: colors.card }, SHADOW.sm]}>
              <Image source={{ uri: imageUri }} style={styles.previewImg} resizeMode="cover" />
              <View style={styles.retakeBar}><Text style={styles.retakeText}>📷 Retake</Text></View>
            </TouchableOpacity>
          ) : null}

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.sm]}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Product Details</Text>

            <Controller control={control} name="productName"
              rules={{ required: 'Product name is required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput label="Product Name" value={value} onChangeText={onChange} mode="outlined"
                  error={!!errors.productName} style={[styles.input, { backgroundColor: colors.inputBg }]}
                  outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary}
                  left={<TextInput.Icon icon="tag-outline" color={colors.textTertiary} />} />
              )} />
            {errors.productName && <Text style={[styles.error, { color: colors.danger }]}>{errors.productName.message}</Text>}

            <Controller control={control} name="storeName"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Store Name" value={value} onChangeText={onChange} mode="outlined"
                  style={[styles.input, { backgroundColor: colors.inputBg }]}
                  outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary}
                  left={<TextInput.Icon icon="store-outline" color={colors.textTertiary} />} />
              )} />

            <Controller control={control} name="purchaseDate"
              rules={{ required: 'Required' }}
              render={({ field: { onChange, value } }) => (
                <TextInput label="Purchase Date (YYYY-MM-DD)" value={value} onChangeText={onChange} mode="outlined"
                  placeholder="2024-03-15" style={[styles.input, { backgroundColor: colors.inputBg }]}
                  outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary}
                  left={<TextInput.Icon icon="calendar" color={colors.textTertiary} />} />
              )} />

            <Controller control={control} name="amount"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Amount" value={value} onChangeText={onChange} mode="outlined" keyboardType="decimal-pad"
                  left={<TextInput.Affix text="$" />}
                  style={[styles.input, { backgroundColor: colors.inputBg }]}
                  outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary} />
              )} />
          </View>

          {/* Category */}
          <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.sm]}>
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Category</Text>
            <Controller control={control} name="category"
              render={({ field: { onChange, value } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {RECEIPT_CATEGORIES.map((cat) => (
                    <TouchableOpacity key={cat.value}
                      style={[styles.chip, {
                        backgroundColor: value === cat.value ? colors.primary : colors.surfaceElevated,
                        borderColor: value === cat.value ? colors.primary : colors.border,
                      }]}
                      onPress={() => onChange(cat.value)}>
                      <Text style={styles.chipEmoji}>{CATEGORY_ICONS[cat.value]}</Text>
                      <Text style={[styles.chipText, { color: value === cat.value ? '#fff' : colors.textSecondary }]}>{cat.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )} />
          </View>

          {/* Warranty */}
          <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.sm]}>
            <View style={styles.warrantyToggle}>
              <Text style={[styles.sectionLabel, { color: colors.textPrimary, marginBottom: 0 }]}>Warranty</Text>
              <Controller control={control} name="hasWarranty"
                render={({ field: { onChange, value } }) => (
                  <Switch value={value} onValueChange={onChange} color={colors.primary} />
                )} />
            </View>

            {hasWarranty && (
              <View style={{ marginTop: SPACING.md }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Duration Quick Pick</Text>
                <Controller control={control} name="warrantyMonths"
                  render={({ field: { onChange, value } }) => (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                      {WARRANTY_DURATIONS.map((dur) => (
                        <TouchableOpacity key={dur.months}
                          style={[styles.chip, {
                            backgroundColor: value === dur.months ? colors.primary : colors.surfaceElevated,
                            borderColor: value === dur.months ? colors.primary : colors.border,
                          }]}
                          onPress={() => onChange(dur.months)}>
                          <Text style={[styles.chipText, { color: value === dur.months ? '#fff' : colors.textSecondary }]}>{dur.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )} />

                <Controller control={control} name="warrantyExpiryManual"
                  rules={{
                    required: hasWarranty ? 'Warranty expiry date is required' : false,
                    validate: (v) => {
                      if (!hasWarranty) return true;
                      if (!isValidDateString(v)) return 'Enter a valid date (YYYY-MM-DD)';
                      if (!isTodayOrLater(v)) return 'Warranty date must be today or later';
                      return true;
                    },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput label="Warranty Valid Until (YYYY-MM-DD)" value={value} onChangeText={onChange}
                      mode="outlined" placeholder={`${today}`}
                      error={!!errors.warrantyExpiryManual}
                      style={[styles.input, { backgroundColor: colors.inputBg, marginTop: SPACING.md }]}
                      outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary}
                      left={<TextInput.Icon icon="shield-check-outline" color={colors.textTertiary} />} />
                  )} />
                {errors.warrantyExpiryManual && (
                  <Text style={[styles.error, { color: colors.danger }]}>{errors.warrantyExpiryManual.message}</Text>
                )}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={[styles.formCard, { backgroundColor: colors.card }, SHADOW.sm]}>
            <Controller control={control} name="notes"
              render={({ field: { onChange, value } }) => (
                <TextInput label="Notes (optional)" value={value} onChangeText={onChange} mode="outlined"
                  multiline numberOfLines={3}
                  style={[styles.input, { backgroundColor: colors.inputBg, minHeight: 80 }]}
                  outlineColor={colors.border} activeOutlineColor={colors.primary} textColor={colors.textPrimary} />
              )} />
          </View>

          <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={saving} disabled={saving}
            style={styles.saveBtn} labelStyle={styles.saveBtnLabel} buttonColor={colors.primary}>
            {saving ? 'Saving...' : 'Save Receipt'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scanning: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: SPACING['3xl'] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  backBtn: { fontSize: FONTS.sizes.base, fontWeight: '600' },
  title: { fontSize: FONTS.sizes.xl, fontWeight: '800' },
  imageBox: { marginHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden', height: 180, marginBottom: SPACING.base },
  previewImg: { width: '100%', height: '100%' },
  retakeBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: SPACING.sm, alignItems: 'center' },
  retakeText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: '600' },
  formCard: { marginHorizontal: SPACING.xl, borderRadius: BORDER_RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.md },
  sectionLabel: { fontSize: FONTS.sizes.base, fontWeight: '700', marginBottom: SPACING.md },
  fieldLabel: { fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: SPACING.sm },
  input: { marginBottom: SPACING.sm },
  error: { fontSize: FONTS.sizes.xs, marginBottom: SPACING.sm, marginLeft: SPACING.xs },
  chips: { gap: SPACING.sm, paddingBottom: SPACING.xs },
  chip: { flexDirection: 'row', alignItems: 'center', borderRadius: BORDER_RADIUS.full, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderWidth: 1 },
  chipEmoji: { fontSize: 14, marginRight: 4 },
  chipText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
  warrantyToggle: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { marginHorizontal: SPACING.xl, marginTop: SPACING.md, borderRadius: BORDER_RADIUS.md, paddingVertical: 2 },
  saveBtnLabel: { fontSize: FONTS.sizes.lg, fontWeight: '700', paddingVertical: 4 },
});

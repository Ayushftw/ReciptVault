import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../hooks/useTheme';
import { FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FRAME_SIZE = SCREEN_WIDTH * 0.82;

interface OCRScannerProps {
  onCapture: (imageUri: string) => void;
  onCancel: () => void;
}

export function OCRScanner({ onCapture, onCancel }: OCRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isTaking, setIsTaking] = useState(false);
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Subtle pulse on the scan frame
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.02, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const takePhoto = async () => {
    if (!cameraRef.current || isTaking) return;
    try {
      setIsTaking(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8, base64: false });
      if (photo?.uri) {
        // Launch the built-in crop/editor
        const edited = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          // Pass the captured image — we use the gallery picker with the captured file
        });
        // If user canceled cropping, use the original photo
        if (!edited.canceled && edited.assets[0]) {
          onCapture(edited.assets[0].uri);
        } else {
          onCapture(photo.uri);
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to take photo.');
    } finally {
      setIsTaking(false);
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        onCapture(result.assets[0].uri);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to open gallery.');
    }
  };

  // Permission loading
  if (!permission) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.textSecondary }]}>Loading camera...</Text>
      </View>
    );
  }

  // Permission not granted
  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.permissionCard, { backgroundColor: colors.card }]}>
          <Text style={styles.permissionEmoji}>📷</Text>
          <Text style={[styles.permissionTitle, { color: colors.textPrimary }]}>
            Camera Access
          </Text>
          <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
            We need camera access to scan your receipts and extract product details automatically.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Allow Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.galleryAlt} onPress={pickFromGallery}>
            <Text style={[styles.galleryAltText, { color: colors.primary }]}>
              Choose from gallery instead
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.topTitle}>Scan Receipt</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Center frame */}
        <View style={styles.frameContainer}>
          <Animated.View style={[styles.scanFrame, { transform: [{ scale: pulseAnim }] }]}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
          </Animated.View>
          <View style={styles.hintPill}>
            <Text style={styles.hintText}>Align receipt within the frame</Text>
          </View>
        </View>
      </CameraView>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideButton} onPress={pickFromGallery}>
          <Text style={styles.sideIcon}>🖼️</Text>
          <Text style={[styles.sideLabel, { color: '#aaa' }]}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shutterOuter, isTaking && { opacity: 0.5 }]}
          onPress={takePhoto}
          disabled={isTaking}
          activeOpacity={0.8}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>

        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const CORNER_LEN = 28;
const CORNER_W = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  closeButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
  topTitle: { color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '700' },

  // Frame
  frameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scanFrame: { width: FRAME_SIZE, height: FRAME_SIZE * 1.35, position: 'relative' },
  corner: { position: 'absolute', width: CORNER_LEN, height: CORNER_LEN },
  tl: { top: 0, left: 0, borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W, borderColor: '#22c55e' },
  tr: { top: 0, right: 0, borderTopWidth: CORNER_W, borderRightWidth: CORNER_W, borderColor: '#22c55e' },
  bl: { bottom: 0, left: 0, borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W, borderColor: '#22c55e' },
  br: { bottom: 0, right: 0, borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W, borderColor: '#22c55e' },
  hintPill: {
    marginTop: SPACING.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  hintText: { color: '#fff', fontSize: FONTS.sizes.sm, fontWeight: '500' },

  // Controls
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING['3xl'] : SPACING.xl,
  },
  sideButton: { width: 56, alignItems: 'center' },
  sideIcon: { fontSize: 26 },
  sideLabel: { fontSize: FONTS.sizes.xs, marginTop: 4 },
  shutterOuter: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 4, borderColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
  },
  shutterInner: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff',
  },

  // Permission
  permissionContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl,
  },
  permissionCard: {
    borderRadius: BORDER_RADIUS.xl, padding: SPACING['2xl'],
    alignItems: 'center', width: '100%',
  },
  permissionEmoji: { fontSize: 56, marginBottom: SPACING.base },
  permissionTitle: { fontSize: FONTS.sizes.xl, fontWeight: '700', marginBottom: SPACING.sm },
  permissionDesc: { fontSize: FONTS.sizes.sm, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  permissionText: { fontSize: FONTS.sizes.base },
  permissionButton: {
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md,
  },
  permissionButtonText: { color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.base },
  galleryAlt: { marginTop: SPACING.base },
  galleryAltText: { fontSize: FONTS.sizes.sm, fontWeight: '600' },
});

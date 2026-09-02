import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebCamera } from "@/components/web-camera";
import { toImageBase64 } from "@/lib/device-location";

export type CapturedPhoto = {
  uri: string;
  base64: string;
};

type LiveCameraProps = {
  label: string;
  hint?: string;
  onCapture: (photo: CapturedPhoto) => void;
  onClose: () => void;
};

export function LiveCamera({ label, hint, onCapture, onClose }: LiveCameraProps) {
  if (Platform.OS === "web") {
    return (
      <WebCamera
        label={label}
        hint={hint}
        onCapture={(imageUri) => {
          onCapture({ uri: imageUri, base64: toImageBase64(imageUri) });
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <NativeLiveCamera label={label} hint={hint} onCapture={onCapture} onClose={onClose} />
  );
}

function NativeLiveCamera({ label, hint, onCapture, onClose }: LiveCameraProps) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  const handleShutter = async () => {
    if (!cameraRef.current || busy) return;
    try {
      setBusy(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });
      if (!photo?.uri || !photo.base64) {
        Alert.alert("촬영 실패", "사진을 저장하지 못했습니다. 다시 시도해주세요.");
        return;
      }
      onCapture({ uri: photo.uri, base64: photo.base64 });
    } catch (error) {
      console.error("촬영 오류:", error);
      Alert.alert("촬영 실패", "카메라를 사용할 수 없습니다.");
    } finally {
      setBusy(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.fallback}>
        <ActivityIndicator color="#2ECC71" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.fallbackTitle}>카메라 권한이 필요합니다</Text>
        <Text style={styles.fallbackHint}>
          실시간 촬영으로만 쓰레기 인증이 가능합니다. 갤러리 사진은 사용할 수 없어요.
        </Text>
        <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
          <Text style={styles.permissionBtnText}>권한 허용</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        onCameraReady={() => setReady(true)}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
          <Text style={styles.closeText}>닫기</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{label}</Text>
        </View>
        <View style={{ width: 48 }} />
      </View>

      {hint ? (
        <View style={styles.hintWrap}>
          <Text style={styles.hintText}>{hint}</Text>
        </View>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[styles.shutter, (!ready || busy) && styles.shutterDisabled]}
          onPress={handleShutter}
          disabled={!ready || busy}
        >
          <View style={styles.shutterInner} />
        </TouchableOpacity>
        <Text style={styles.shutterLabel}>{busy ? "촬영 중..." : "촬영"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  closeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  closeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  badge: {
    backgroundColor: "rgba(46,204,113,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  hintWrap: {
    position: "absolute",
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    borderRadius: 12,
    padding: 12,
  },
  hintText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "600",
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 5,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
  shutterLabel: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  fallback: {
    flex: 1,
    backgroundColor: "#0D1F14",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    gap: 12,
  },
  fallbackTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  fallbackHint: {
    color: "#ccc",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  permissionBtn: {
    marginTop: 8,
    backgroundColor: "#2ECC71",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  permissionBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  cancelText: {
    color: "#aaa",
    fontWeight: "600",
    marginTop: 8,
  },
});

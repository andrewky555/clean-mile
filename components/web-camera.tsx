import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface WebCameraProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
  label?: string;
  hint?: string;
}

export function WebCamera({ onCapture, onClose, label, hint }: WebCameraProps) {
  const colors = useColors();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream as any;
          videoRef.current.play().catch((err) => {
            console.error("Play error:", err);
          });
          setStreaming(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("카메라 접근 실패. 권한을 확인해주세요.");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert("카메라가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageUri = canvas.toDataURL("image/jpeg", 0.95);
      onCapture(imageUri);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    cameraContainer: {
      width: "100%",
      maxWidth: 500,
      aspectRatio: 9 / 16,
      backgroundColor: colors.foreground,
      borderRadius: 16,
      overflow: "hidden",
      position: "relative",
      marginBottom: 20,
    },
    video: {
      width: "100%" as any,
      height: "100%" as any,
      objectFit: "cover" as any,
    },
    controls: {
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
      width: "100%",
    },
    button: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 120,
    },
    captureBtn: {
      backgroundColor: colors.primary,
    },
    cancelBtn: {
      backgroundColor: colors.border,
    },
    buttonText: {
      fontWeight: "700",
      fontSize: 14,
    },
    captureBtnText: {
      color: colors.background,
    },
    cancelBtnText: {
      color: colors.foreground,
    },
    labelText: {
      color: colors.foreground,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 6,
      textAlign: "center",
    },
    hintText: {
      color: colors.muted,
      fontSize: 13,
      marginBottom: 12,
      textAlign: "center",
    },
    errorText: {
      color: colors.error,
      fontSize: 14,
      marginBottom: 12,
      textAlign: "center",
    },
    loadingText: {
      color: colors.muted,
      fontSize: 12,
      marginTop: 8,
      textAlign: "center",
    },
  });

  if (Platform.OS !== "web") {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>웹 환경에서만 사용 가능합니다.</Text>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
          <Text style={[styles.buttonText, styles.cancelBtnText]}>닫기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.labelText}>{label}</Text> : null}
      {hint ? <Text style={styles.hintText}>{hint}</Text> : null}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.cameraContainer}>
        <video
          ref={videoRef}
          style={styles.video}
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </View>

      {!streaming && <Text style={styles.loadingText}>카메라 준비 중...</Text>}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.button, styles.captureBtn]}
          onPress={handleCapture}
          disabled={!streaming}
        >
          <Text style={[styles.buttonText, styles.captureBtnText]}>
            {streaming ? "📸 촬영" : "준비 중..."}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onClose}>
          <Text style={[styles.buttonText, styles.cancelBtnText]}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

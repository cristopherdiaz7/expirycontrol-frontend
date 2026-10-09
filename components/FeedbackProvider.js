import { Feather } from "@expo/vector-icons";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import CustomButton from "./customButton";
import { colors, fonts, glass, radius, shadows, tones, type } from "../constants/theme";

const FeedbackContext = createContext(null);
const DEFAULT_DURATION = 4000;

const noticeIcons = { success: "check-circle", warning: "alert-triangle", danger: "x-circle" };

// Reemplaza a Alert.alert, que no hace nada en Expo Web.
// notify() muestra un aviso temporal y confirm() devuelve una promesa con la respuesta.
export function FeedbackProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const [dialog, setDialog] = useState(null);
  const timerRef = useRef(null);
  const resolveRef = useRef(null);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setNotice(null);
  }, []);

  const notify = useCallback((message, options = {}) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotice({ message, title: options.title, tone: options.tone || "success" });
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setNotice(null);
    }, options.duration || DEFAULT_DURATION);
  }, []);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolveRef.current = resolve;
    setDialog(options);
  }), []);

  const closeDialog = (accepted) => {
    if (resolveRef.current) resolveRef.current(accepted);
    resolveRef.current = null;
    setDialog(null);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const noticeTone = notice ? tones[notice.tone] : null;
  const dialogTone = dialog?.destructive ? tones.danger : tones.default;

  return (
    <FeedbackContext.Provider value={{ notify, confirm, dismiss }}>
      <View style={styles.root}>
        {children}

        {notice ? (
          <View style={styles.noticeLayer} pointerEvents="box-none">
            <Pressable onPress={dismiss} accessibilityRole="alert" style={[styles.notice, { borderColor: noticeTone.border }]}>
              <View style={[styles.noticeIcon, { backgroundColor: noticeTone.bg }]}>
                <Feather name={noticeIcons[notice.tone]} size={18} color={noticeTone.fg} />
              </View>
              <View style={styles.noticeCopy}>
                {notice.title ? <Text style={styles.noticeTitle}>{notice.title}</Text> : null}
                <Text style={styles.noticeText}>{notice.message}</Text>
              </View>
              <Feather name="x" size={16} color={colors.muted} />
            </Pressable>
          </View>
        ) : null}

        <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => closeDialog(false)}>
          <Pressable style={styles.backdrop} onPress={() => closeDialog(false)}>
            <Pressable style={styles.dialog} onPress={() => {}}>
              <View style={[styles.dialogIcon, { backgroundColor: dialogTone.bg }]}>
                <Feather name={dialog?.destructive ? "trash-2" : "help-circle"} size={22} color={dialogTone.fg} />
              </View>
              <Text style={styles.dialogTitle}>{dialog?.title}</Text>
              {dialog?.message ? <Text style={styles.dialogText}>{dialog.message}</Text> : null}
              <View style={styles.dialogActions}>
                <CustomButton title={dialog?.cancelText || "Cancelar"} onPress={() => closeDialog(false)} variant="secondary" style={styles.dialogButton} />
                <CustomButton title={dialog?.confirmText || "Aceptar"} onPress={() => closeDialog(true)} variant={dialog?.destructive ? "danger" : "primary"} style={styles.dialogButton} />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error("useFeedback debe usarse dentro de FeedbackProvider");
  }
  return context;
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background, flex: 1 },
  noticeLayer: { alignItems: "center", left: 0, padding: 16, position: "absolute", right: 0, top: 0, zIndex: 50 },
  notice: { ...glass.strong, ...shadows.floating, alignItems: "center", borderRadius: radius.lg, flexDirection: "row", gap: 12, maxWidth: 520, paddingHorizontal: 14, paddingVertical: 12, width: "100%" },
  noticeIcon: { alignItems: "center", borderRadius: radius.md, height: 36, justifyContent: "center", width: 36 },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.text, fontFamily: fonts.bold, fontSize: 14, marginBottom: 2 },
  noticeText: { ...type.body, fontSize: 13, lineHeight: 19 },
  backdrop: { alignItems: "center", backgroundColor: colors.overlay, flex: 1, justifyContent: "center", padding: 20 },
  dialog: { ...glass.strong, ...shadows.floating, borderRadius: radius.xl, maxWidth: 400, padding: 24, width: "100%" },
  dialogIcon: { alignItems: "center", borderRadius: radius.lg, height: 46, justifyContent: "center", marginBottom: 16, width: 46 },
  dialogTitle: { ...type.heading, marginBottom: 8 },
  dialogText: { ...type.body },
  dialogActions: { flexDirection: "row", gap: 10, marginTop: 24 },
  dialogButton: { flex: 1 },
});

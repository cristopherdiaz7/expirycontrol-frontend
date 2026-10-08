import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

const FeedbackContext = createContext(null);
const DEFAULT_DURATION = 4000;

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

  return (
    <FeedbackContext.Provider value={{ notify, confirm, dismiss }}>
      <View style={styles.root}>
        {children}

        {notice ? (
          <View style={styles.noticeLayer} pointerEvents="box-none">
            <Pressable onPress={dismiss} accessibilityRole="alert" style={[styles.notice, styles[notice.tone]]}>
              <View style={[styles.noticeMark, styles[`${notice.tone}Mark`]]} />
              <View style={styles.noticeCopy}>
                {notice.title ? <Text style={styles.noticeTitle}>{notice.title}</Text> : null}
                <Text style={styles.noticeText}>{notice.message}</Text>
              </View>
            </Pressable>
          </View>
        ) : null}

        <Modal visible={dialog !== null} transparent animationType="fade" onRequestClose={() => closeDialog(false)}>
          <Pressable style={styles.backdrop} onPress={() => closeDialog(false)}>
            <Pressable style={styles.dialog} onPress={() => {}}>
              <Text style={styles.dialogTitle}>{dialog?.title}</Text>
              {dialog?.message ? <Text style={styles.dialogText}>{dialog.message}</Text> : null}
              <View style={styles.dialogActions}>
                <Pressable onPress={() => closeDialog(false)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>{dialog?.cancelText || "Cancelar"}</Text>
                </Pressable>
                <Pressable onPress={() => closeDialog(true)} style={[styles.confirmButton, dialog?.destructive && styles.confirmDestructive]}>
                  <Text style={[styles.confirmText, dialog?.destructive && styles.confirmDestructiveText]}>{dialog?.confirmText || "Aceptar"}</Text>
                </Pressable>
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
  noticeLayer: { alignItems: "center", left: 0, padding: 16, position: "absolute", right: 0, top: 0 },
  notice: { alignItems: "center", borderRadius: 14, borderWidth: 1, flexDirection: "row", gap: 12, maxWidth: 520, paddingHorizontal: 16, paddingVertical: 13, width: "100%" },
  success: { backgroundColor: colors.successSoft, borderColor: "#397556" },
  warning: { backgroundColor: colors.warningSoft, borderColor: "#806632" },
  danger: { backgroundColor: colors.dangerSoft, borderColor: "#80434A" },
  noticeMark: { borderRadius: 4, height: 28, width: 4 },
  successMark: { backgroundColor: colors.success },
  warningMark: { backgroundColor: colors.warning },
  dangerMark: { backgroundColor: colors.danger },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginBottom: 2 },
  noticeText: { color: colors.softText, fontSize: 13, lineHeight: 19 },
  backdrop: { alignItems: "center", backgroundColor: "rgba(3, 10, 14, 0.72)", flex: 1, justifyContent: "center", padding: 20 },
  dialog: { backgroundColor: colors.card, borderColor: colors.border, borderRadius: 20, borderWidth: 1, maxWidth: 400, padding: 22, width: "100%" },
  dialogTitle: { color: colors.text, fontSize: 18, fontWeight: "800", marginBottom: 8 },
  dialogText: { color: colors.softText, fontSize: 14, lineHeight: 21 },
  dialogActions: { flexDirection: "row", gap: 10, justifyContent: "flex-end", marginTop: 22 },
  cancelButton: { borderColor: colors.borderStrong, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  cancelText: { color: colors.text, fontSize: 13, fontWeight: "800" },
  confirmButton: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  confirmText: { color: colors.primaryInk, fontSize: 13, fontWeight: "800" },
  confirmDestructive: { backgroundColor: colors.dangerSoft, borderColor: colors.danger, borderWidth: 1 },
  confirmDestructiveText: { color: colors.danger },
});

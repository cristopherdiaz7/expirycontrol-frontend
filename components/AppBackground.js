import { Platform, StyleSheet, View } from "react-native";
import { colors } from "../constants/theme";

// Fondo oscuro con manchas de color difusas: le dan profundidad a las superficies de vidrio.
export default function AppBackground() {
  return (
    <View style={styles.root} pointerEvents="none">
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobSide]} />
      <View style={[styles.blob, styles.blobBottom]} />
    </View>
  );
}

const blur = Platform.select({ web: { filter: "blur(90px)" }, default: {} });

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.background, overflow: "hidden" },
  blob: { borderRadius: 999, position: "absolute", ...blur },
  blobTop: { backgroundColor: "rgba(141, 219, 178, 0.16)", height: 420, left: -140, top: -180, width: 420 },
  blobSide: { backgroundColor: "rgba(72, 150, 170, 0.16)", height: 380, right: -160, top: 160, width: 380 },
  blobBottom: { backgroundColor: "rgba(141, 219, 178, 0.09)", bottom: -220, height: 460, left: "30%", width: 460 },
});

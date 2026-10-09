import { Platform } from "react-native";

// Sistema visual de ExpiryControl: todo color, tipografía, espaciado, radio y sombra sale de acá.

export const colors = {
  background: "#07131A",
  inputBackground: "rgba(8, 24, 29, 0.72)",
  borderStrong: "#3A6870",
  primary: "#8DDBB2",
  primaryInk: "#092018",
  primarySoft: "rgba(141, 219, 178, 0.14)",
  text: "#F4F7F1",
  softText: "#C5D6D0",
  muted: "#9EB4B3",
  danger: "#F28A82",
  dangerSoft: "rgba(242, 138, 130, 0.14)",
  dangerBorder: "rgba(242, 138, 130, 0.38)",
  warning: "#F5C56A",
  warningSoft: "rgba(245, 197, 106, 0.14)",
  warningBorder: "rgba(245, 197, 106, 0.38)",
  success: "#8DDBB2",
  successSoft: "rgba(141, 219, 178, 0.14)",
  successBorder: "rgba(141, 219, 178, 0.38)",
  glass: "rgba(18, 44, 49, 0.58)",
  glassStrong: "rgba(16, 40, 45, 0.86)",
  glassBorder: "rgba(190, 235, 220, 0.14)",
  overlay: "rgba(3, 10, 14, 0.72)",
  shadow: "#000000",
};

// Colores por estado: se usan en etiquetas, contadores, avisos y paneles.
export const tones = {
  default: { fg: colors.primary, bg: colors.primarySoft, border: colors.glassBorder },
  success: { fg: colors.success, bg: colors.successSoft, border: colors.successBorder },
  warning: { fg: colors.warning, bg: colors.warningSoft, border: colors.warningBorder },
  danger: { fg: colors.danger, bg: colors.dangerSoft, border: colors.dangerBorder },
};

export const spacing = {
  xxl: 28,
  section: 32,
  page: 20,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

// En web se agrega una pila de respaldo por si la fuente no llega a cargar.
function family(name) {
  return Platform.OS === "web" ? `${name}, system-ui, -apple-system, "Segoe UI", sans-serif` : name;
}

export const fonts = {
  regular: family("Inter_400Regular"),
  medium: family("Inter_500Medium"),
  semibold: family("Inter_600SemiBold"),
  bold: family("Inter_700Bold"),
  extrabold: family("Inter_800ExtraBold"),
};

export const type = {
  display: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 38, letterSpacing: -0.6, lineHeight: 44 },
  title: { color: colors.text, fontFamily: fonts.extrabold, fontSize: 28, letterSpacing: -0.4, lineHeight: 34 },
  heading: { color: colors.text, fontFamily: fonts.bold, fontSize: 19, letterSpacing: -0.2, lineHeight: 25 },
  subheading: { color: colors.text, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 21 },
  body: { color: colors.softText, fontFamily: fonts.regular, fontSize: 14, lineHeight: 21 },
  small: { color: colors.muted, fontFamily: fonts.regular, fontSize: 12.5, lineHeight: 18 },
  label: { color: colors.muted, fontFamily: fonts.semibold, fontSize: 11, letterSpacing: 0.7, textTransform: "uppercase" },
  kicker: { color: colors.primary, fontFamily: fonts.bold, fontSize: 11.5, letterSpacing: 1.3, textTransform: "uppercase" },
  button: { fontFamily: fonts.bold, fontSize: 14 },
};

export const shadows = {
  card: Platform.select({
    web: { boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)" },
    default: { elevation: 6, shadowColor: colors.shadow, shadowOffset: { height: 12, width: 0 }, shadowOpacity: 0.24, shadowRadius: 22 },
  }),
  floating: Platform.select({
    web: { boxShadow: "0 16px 44px rgba(0, 0, 0, 0.45)" },
    default: { elevation: 12, shadowColor: colors.shadow, shadowOffset: { height: 10, width: 0 }, shadowOpacity: 0.4, shadowRadius: 24 },
  }),
};

// Superficie de vidrio: translúcida en todas las plataformas, con desenfoque del fondo en web.
function glassSurface(backgroundColor, blur) {
  return {
    backgroundColor,
    borderColor: colors.glassBorder,
    borderWidth: 1,
    ...Platform.select({
      web: { backdropFilter: `blur(${blur}px) saturate(140%)` },
      default: {},
    }),
  };
}

export const glass = {
  surface: glassSurface(colors.glass, 18),
  strong: glassSurface(colors.glassStrong, 24),
};

export const breakpoints = {
  tablet: 640,
  desktop: 1120,
  wide: 1240,
};

export const layout = {
  maxWidth: 1180,
  navHeight: 68,
};

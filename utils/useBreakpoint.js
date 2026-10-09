import { useWindowDimensions } from "react-native";
import { breakpoints } from "../constants/theme";

// Tamaño de pantalla actual: móvil por defecto, tablet y PC según el ancho.
export default function useBreakpoint() {
  const { width } = useWindowDimensions();

  return {
    width,
    isTablet: width >= breakpoints.tablet,
    isDesktop: width >= breakpoints.desktop,
    isWide: width >= breakpoints.wide,
  };
}

import { Colors, useTheme as usePaperTheme } from "react-native-paper";
import { Theme as PaperTheme } from "react-native-paper/lib/typescript/types";
import Color from "color";

export interface Theme extends PaperTheme {
  colors: PaperTheme["colors"] & {
    accentText: string;
  };
}

export const mainColors = {
  primary: Colors.amber500,
  accent: Colors.lightBlueA700, // Not the real etesync theme but better for accessibility
};

export const extraColors = {
  accentText: Color(mainColors.accent).darken(0.2).rgb().string(),
};

export function useTheme() {
  return usePaperTheme() as Theme;
}
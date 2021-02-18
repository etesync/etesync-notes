import * as React from "react";
import { I18nManager, StyleSheet, TextInput } from "react-native";
import { Appbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MenuButton from "./MenuButton";

type PropsType = {
  value: string;
  onChangeText: (query: string) => void;
};

export default function SearchToolbar(props: PropsType) {
  const { value, onChangeText } = props;
  const theme = useTheme();
  const textColor = (theme.dark && theme.mode === "adaptive") ? theme.colors.onSurface : "#000000";
  const inputRef = React.useRef<TextInput>(null);
  const insets = useSafeAreaInsets();

  return (
    <Appbar.Header statusBarHeight={insets.top}>
      <MenuButton />
      <Appbar.Action
        disabled
        icon="magnify"
      />
      <TextInput
        ref={inputRef}
        placeholder="Search"
        value={value}
        onChangeText={onChangeText}
        autoFocus
        style={[styles.input, { color: textColor }]}
        placeholderTextColor={theme.colors.placeholder}
        selectionColor={theme.colors.accent}
        underlineColorAndroid="transparent"
        returnKeyType="search"
        keyboardAppearance={theme.dark ? "dark" : "light"}
        accessibilityTraits="search"
        accessibilityRole="search"
      />
      <Appbar.Action
        disabled={!value}
        icon="close"
        onPress={() => {
          inputRef.current?.clear();
          onChangeText("");
        }}
      />
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  input: {
    flex: 1,
    fontSize: 18,
    paddingLeft: 8,
    alignSelf: "stretch",
    textAlign: I18nManager.isRTL ? "right" : "left",
    minWidth: 0,
  },
});
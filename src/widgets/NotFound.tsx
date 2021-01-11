import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Subheading, Title, useTheme } from "react-native-paper";

interface PropsType {
  message?: string;
  help?: string;
}

export default function NotFound(props: PropsType) {
  const {
    message = "This notebook can't be found",
    help = "Go back or contact us if the problem persists",
  } = props ?? {};
  const theme = useTheme();

  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      <Title>{message}</Title>
      <Subheading>{help}</Subheading>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
});

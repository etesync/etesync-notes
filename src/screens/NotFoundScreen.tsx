import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Subheading, Title, useTheme } from "react-native-paper";
import { RouteProp, useNavigation } from "@react-navigation/native";

type NotFoundParamList = {
  "404": {
    title?: string;
    message?: string;
    help?: string;
  };
};

interface PropsType {
  route: RouteProp<NotFoundParamList, "404">;
}

export default function NotFound(props: PropsType) {
  const { title, message, help } = props.route.params ?? {};
  const navigation = useNavigation();
  const theme = useTheme();

  React.useEffect(() => {
    navigation.setOptions({
      title: title ?? "Page Not Found",
    });
  }, [navigation, title]);

  return (
    <View style={[{ backgroundColor: theme.colors.background }, styles.container]}>
      <Title>{message ?? "Sorry, we couldn't find this page"}</Title>
      <Subheading>{help ?? "Go back or contact us if the problem persists"}</Subheading>
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

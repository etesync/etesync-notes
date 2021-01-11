import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../RootStackParamList";
import NotFound from "../widgets/NotFound";

type NavigationProp = StackNavigationProp<RootStackParamList, "404">;

export default function NotFoundScreen() {
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    navigation.setOptions({
      title: "Page Not Found",
    });
  }, [navigation]);

  return (
    <NotFound
      message="Sorry, we couldn't find this page"
    />
  );
}

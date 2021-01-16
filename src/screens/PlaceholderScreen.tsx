import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../StacksParamList";
import NotFound from "../widgets/NotFound";

type NavigationProp = StackNavigationProp<MainStackParamList, "Home">;

export default function PlaceholderScreen() {
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    navigation.setOptions({
      title: "",
    });
  }, [navigation]);

  return (
    <NotFound
      message="Select a note on the left"
      help=""
    />
  );
}

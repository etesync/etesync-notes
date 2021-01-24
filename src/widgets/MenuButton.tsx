import * as React from "react";
import { useNavigation } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Appbar } from "react-native-paper";

const MenuButton = React.memo(function MenuButton() {
  const navigation = useNavigation() as DrawerNavigationProp<any>;
  return (
    <Appbar.Action icon="menu" accessibilityLabel="Main menu" onPress={() => navigation.openDrawer()} />
  );
});

export default MenuButton;

import * as React from "react";
import { StackHeaderProps } from "@react-navigation/stack";
import { Appbar as PaperAppbar } from "react-native-paper";

import MenuButton from "./MenuButton";

export default function Appbar(props: StackHeaderProps & { menuFallback: boolean }) {
  const { insets, menuFallback, navigation, previous, scene } = props;
  const { options } = scene.descriptor;
  const title = options.headerTitle ?? options.title ?? scene.route.name;
  let left: React.ReactNode = null;
  if (options.headerLeft) {
    left = options.headerLeft({});
  } else if (previous) {
    left = <PaperAppbar.BackAction onPress={navigation.goBack} />;
  } else if (menuFallback) {
    left = <MenuButton />;
  }
  const right = options.headerRight?.({});

  return (
    <PaperAppbar.Header statusBarHeight={insets.top}>
      {left}
      {(typeof title === "string") ? (
        <PaperAppbar.Content title={title} />
      ) : title({ onLayout: () => null })}
      {right}
    </PaperAppbar.Header>
  );
}

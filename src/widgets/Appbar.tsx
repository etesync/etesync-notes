import * as React from "react";
import { StackHeaderProps, StackHeaderTitleProps } from "@react-navigation/stack";
import { Appbar as PaperAppbar } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MenuButton from "./MenuButton";

type PropsType = {
  title: string | ((props: StackHeaderTitleProps) => React.ReactNode);
  left?: React.ReactNode;
  right?: React.ReactNode;
};

export default function Appbar(props: PropsType) {
  const { title, left, right } = props;
  const insets = useSafeAreaInsets();

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

export function NavigationAppbar(props: StackHeaderProps & { menuFallback: boolean }) {
  const { menuFallback, navigation, previous, scene } = props;
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
    <Appbar
      title={title}
      left={left}
      right={right}
    />
  );
}

import * as React from "react";
import { GestureResponderEvent, Linking } from "react-native";
import { NavigationAction, useLinkProps } from "@react-navigation/native";

type ChildProps = {
  href?: string;
  accessibilityRole?: "link";
  onPress?: (e?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent) => void;
};

type PropsType = {
  to: string;
  action?: NavigationAction;
  external?: boolean;
  onPress?: () => void;
  renderChild: (props: ChildProps) => React.ReactElement;
};

export default function Link(props: PropsType) {
  const { to, action, external, onPress: onPressProp, renderChild } = props;
  const linkProps = useLinkProps((!to || external) ? { to: "" } : { to, action });

  const onPress = (
    e?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
  ) => {
    onPressProp?.();

    if (external) {
      Linking.openURL(to);
    } else {
      linkProps.onPress(e);
    }
  };

  return renderChild({ ...linkProps, onPress });
}
import * as React from "react";
import { GestureResponderEvent, Linking } from "react-native";
import { List } from "react-native-paper";
import { NavigationAction, useLinkProps } from "@react-navigation/native";

type PropsType = React.ComponentProps<typeof List.Item> & {
  to?: string;
  action?: NavigationAction;
  external?: boolean;
};

export default function ListItem(props: PropsType) {
  const { to, action, external, ...rest } = props;
  const linkProps = useLinkProps((!to || external) ? { to: "" } : { to, action });

  const onPress = (
    e?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
  ) => {
    if ("onPress" in rest) {
      rest.onPress?.();
    }

    if (to) {
      if (external) {
        Linking.openURL(to);
      } else {
        linkProps.onPress(e);
      }
    }
  };

  if (to) {
    return (
      <List.Item
        {...linkProps}
        {...rest}
        onPress={onPress}
      />
    );
  }

  return (
    <List.Item
      {...rest}
    />
  );
}
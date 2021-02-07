import * as React from "react";
import { GestureResponderEvent } from "react-native";
import { List } from "react-native-paper";
import { NavigationAction, useLinkProps } from "@react-navigation/native";
import { useTheme } from "../theme";
import "../css/state.css";

type PropsType = React.ComponentProps<typeof List.Item> & {
  to?: string;
  action?: NavigationAction;
  external?: boolean;
};

export default function ListItem(props: PropsType) {
  const { to, action, external, ...rest } = props;
  const linkProps = useLinkProps((!to || external) ? { to: "" } : { to, action });
  const theme = useTheme();

  const onPress = (
    e?: React.MouseEvent<HTMLAnchorElement, MouseEvent> | GestureResponderEvent
  ) => {
    if ("onPress" in rest) {
      rest.onPress?.();
    }

    if (to && !external) {
      linkProps.onPress(e);
    }
  };

  if (to) {
    return (
      <a
        onClick={onPress}
        href={(external) ? to : linkProps.href}
        target={(external) ? "_blank" : undefined}
        className={`state ${theme.dark ? "dark" : "light"}`}
        style={{ textDecoration: "none" }}
      >
        <List.Item
          {...rest}
        />
      </a>
    );
  }

  return (
    <div className={`state ${theme.dark ? "dark" : "light"}`}>
      <List.Item
        {...rest}
      />
    </div>
  );
}
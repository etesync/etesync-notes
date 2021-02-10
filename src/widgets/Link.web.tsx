import * as React from "react";
import { GestureResponderEvent } from "react-native";
import { NavigationAction, useLinkProps } from "@react-navigation/native";
import Clickable from "./Clickable";

type ChildProps = {
  onPress?: () => void;
};

type PropsType = {
  to?: string;
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

    if (!external) {
      linkProps.onPress(e);
    }
  };

  return (
    <Clickable
      renderChild={(props) => (
        <a
          {...props}
          onClick={onPress}
          href={(external) ? to : linkProps.href}
          target={(external) ? "_blank" : undefined}
          style={{ textDecoration: "none" }}
        >
          {renderChild({})}
        </a>
      )}
    />
  );
}
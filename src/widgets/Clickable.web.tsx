import * as React from "react";
import { useTheme } from "../theme";
import "../css/state.css";

type ChildProps = {
  className?: string;
};

type PropsType = {
  renderChild: (props: ChildProps) => React.ReactElement;
};

export default function Clickable(props: PropsType) {
  const { renderChild } = props;
  const theme = useTheme();

  return renderChild({ className: `state ${theme.dark ? "dark" : "light"}` });
}
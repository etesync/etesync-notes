import * as React from "react";
import { useTheme } from "../theme";
import "../css/state.css";

type ChildProps = {
  className?: string;
};

type PropsType = {
  applyToChild?: boolean;
  renderChild: (props: ChildProps) => React.ReactElement;
};

export default function Clickable(props: PropsType) {
  const { applyToChild, renderChild } = props;
  const theme = useTheme();
  const className = `state ${theme.dark ? "dark" : "light"}`;

  if (applyToChild) {
    return renderChild({ className });
  }

  return (
    <div className={className}>
      {renderChild({})}
    </div>
  );
}
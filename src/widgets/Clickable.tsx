import * as React from "react";

type ChildProps = {
  className?: string;
};

type PropsType = {
  applyToChild?: boolean;
  renderChild: (props: ChildProps) => React.ReactElement;
};

export default function Clickable(props: PropsType) {
  const { renderChild } = props;

  return renderChild({});
}
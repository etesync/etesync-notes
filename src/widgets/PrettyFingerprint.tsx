// SPDX-FileCopyrightText: © 2017 EteSync Authors
// SPDX-License-Identifier: AGPL-3.0-only

import * as React from "react";
import { TextProps } from "react-native";
import * as Etebase from "etebase";

import { Paragraph } from "react-native-paper";

interface PropsType extends TextProps {
  publicKey: Uint8Array;
}

export default function PrettyFingerprint(props: PropsType) {
  const prettyFingerprint = Etebase.getPrettyFingerprint(props.publicKey);

  return (
    <Paragraph {...props} style={[props.style, { fontVariant: ["tabular-nums"] }]}>{prettyFingerprint}</Paragraph>
  );
}


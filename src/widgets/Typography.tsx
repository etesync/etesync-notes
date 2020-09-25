// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { Subheading as PaperSubheading, Title as PaperTitle, Headline as PaperHeadline } from "react-native-paper";

export const Subheading = React.memo(function Subheading(props: React.ComponentProps<typeof PaperSubheading>) {
  return (
    <PaperSubheading
      accessible
      accessibilityRole="header"
      {...props}
    />
  );
});

export const Title = React.memo(function Subheading(props: React.ComponentProps<typeof PaperTitle>) {
  return (
    <PaperTitle
      accessible
      accessibilityRole="header"
      {...props}
    />
  );
});

export const Headline = React.memo(function Subheading(props: React.ComponentProps<typeof PaperHeadline>) {
  return (
    <PaperHeadline
      accessible
      accessibilityRole="header"
      {...props}
    />
  );
});

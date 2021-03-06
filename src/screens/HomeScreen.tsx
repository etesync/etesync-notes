// SPDX-FileCopyrightText: Â© 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { BottomNavigation } from "react-native-paper";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../RootStackParamList";

import NoteListScreen from "./NoteListScreen";
import SearchScreen from "./SearchScreen";
import NotebookListScreen from "./NotebookListScreen";

interface PropsType {
  route: RouteProp<RootStackParamList, "Home"> | RouteProp<RootStackParamList, "Collection">;
}

const routes = [
  { key: "notes", title: "Notes", icon: "note-multiple" },
  { key: "search", title: "Search", icon: "magnify" },
  { key: "notebooks", title: "Notebooks", icon: "notebook-multiple" },
];

export default function HomeScreen(props: PropsType) {
  const [index, setIndex] = React.useState(0);
  const activeRoute = routes[index];
  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "notes":
        return <NoteListScreen active={activeRoute?.key === "notes"} />;
      case "search":
        return <SearchScreen active={activeRoute?.key === "search"} />;
      case "notebooks":
        return <NotebookListScreen colUid={colUid} active={activeRoute?.key === "notebooks"} />;
      default:
        return null;
    }
  };

  const colUid = props.route.params?.colUid || undefined;

  React.useEffect(() => {
    if (colUid) {
      setIndex(2);
    }
  }, []);

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
    />
  );
}

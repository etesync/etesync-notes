// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import moment from "moment";
import { FlatList, View } from "react-native";
import { Menu, Appbar, List, useTheme } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";

import { useSyncGate } from "../SyncGate";
import { DecryptedItem } from "../store";


type RootStackParamList = {
  NoteListScreen: {
    colUid?: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "NoteListScreen">;
}

export default function NoteListScreen(props: PropsType) {
  const navigation = useNavigation();
  const syncGate = useSyncGate();
  const theme = useTheme();

  React.useEffect(() => {
    function RightAction() {
      const [showMenu, setShowMenu] = React.useState(false);

      return (
        <View style={{ flexDirection: "row" }}>
          <Appbar.Action icon="sort" accessibilityLabel="Sort" onPress={() => setShowMenu(true)} />
          <Menu
            visible={showMenu}
            onDismiss={() => setShowMenu(false)}
            anchor={(
              <Appbar.Action icon="dots-vertical" accessibilityLabel="Menu" onPress={() => setShowMenu(true)} />
            )}
          >
            <Menu.Item icon="pencil" title="Edit"
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("CollectionEdit", { colUid });
              }}
            />
            <Menu.Item icon="account-multiple" title="Members"
              onPress={() => {
                setShowMenu(false);
                navigation.navigate("CollectionMembers", { colUid });
              }}
            />
          </Menu>
        </View>
      );
    }

    navigation.setOptions({
      headerRight: () => (
        <RightAction />
      ),
    });
  }, [navigation]);

  if (syncGate) {
    return syncGate;
  }

  const colUid = props.route.params?.colUid ?? "";

  const entriesList: any[] = [];

  function renderEntry(param: { item: DecryptedItem & { uid: string } }) {
    const item = param.item;
    const name = item.meta.name!;
    const mtime = (item.meta.mtime) ? moment(item.meta.mtime) : undefined;

    return (
      <List.Item
        key={item.uid}
        title={name}
        description={mtime?.format("llll")}
        onPress={() => { navigation.navigate("Note", { colUid, itemUid: item.uid }) }}
      />
    );
  }

  return (
    <>
      <FlatList
        style={[{ backgroundColor: theme.colors.background }, { flex: 1 }]}
        data={entriesList}
        keyExtractor={(item) => item.uid}
        renderItem={renderEntry}
        maxToRenderPerBatch={10}
      />
    </>
  );
}

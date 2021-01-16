// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { FlatList, View } from "react-native";
import { Divider, Appbar, Text, List, useTheme } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

import { useSyncGate } from "../SyncGate";
import { StoreState } from "../store";
import { CachedItem } from "../store/reducers";
import Container from "../widgets/Container";
import Menu from "../widgets/Menu";
import { Title } from "../widgets/Typography";
import NotFound from "../widgets/NotFound";

import { defaultColor } from "../helpers";
import { MainNavigationProp, MainStackParamList } from "../StacksParamList";

import ColorBox from "../widgets/ColorBox";

const iconDeleted = (props: any) => (<List.Icon {...props} color="#F20C0C" icon="delete" />);
const iconChanged = (props: any) => (<List.Icon {...props} color="#FEB115" icon="pencil" />);

type NavigationProp = StackNavigationProp<MainStackParamList, "CollectionChangelog">;

interface PropsType {
  route: RouteProp<MainStackParamList, "CollectionChangelog">;
}

export default function CollectionChangelogScreen(props: PropsType) {
  const navigation = useNavigation<NavigationProp>();
  const syncGate = useSyncGate();
  const theme = useTheme();
  const cachedCollections = useSelector((state: StoreState) => state.cache.collections);
  const cachedItems = useSelector((state: StoreState) => state.cache.items);

  const colUid = props.route.params.colUid ?? "";
  const cachedCollection = cachedCollections.get(colUid);
  const colCachedItems = cachedItems.get(colUid);

  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <RightAction colUid={colUid} />
      ),
    });
  }, [colUid]);

  if (syncGate) {
    return syncGate;
  }

  if (!cachedCollection || !colCachedItems) {
    return <NotFound />;
  }

  const { meta } = cachedCollection;

  const entriesList = Array.from(colCachedItems.entries()).map(([uid, val]) => ({ uid, ...val })).sort((a_, b_) => {
    const a = a_.meta.mtime ?? 0;
    const b = b_.meta.mtime ?? 0;
    return b - a;
  });

  function renderEntry(param: { item: CachedItem & { uid: string } }) {
    const item = param.item;

    const icon = (item.isDeleted) ? iconDeleted : iconChanged;

    const name = item.meta.name!;
    const mtime = (item.meta.mtime) ? moment(item.meta.mtime) : undefined;

    return (
      <List.Item
        key={item.uid}
        left={icon}
        title={name}
        description={mtime?.format("llll")}
        onPress={undefined /* FIXME: Actually do something on click */}
      />
    );
  }

  const collectionColorBox = (
    <ColorBox size={36} color={meta.color || defaultColor} />
  );

  return (
    <>
      <Container style={{ flexDirection: "row" }}>
        <View style={{ marginRight: "auto" }}>
          <Title>{meta.name}</Title>
          <Text>
            Change log items: {entriesList.length}
          </Text>
        </View>
        {collectionColorBox}
      </Container>
      <Divider />
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

function RightAction(props: { colUid: string }) {
  const [showMenu, setShowMenu] = React.useState(false);
  const navigation = useNavigation<MainNavigationProp>();
  const colUid = props.colUid;

  return (
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
  );
}

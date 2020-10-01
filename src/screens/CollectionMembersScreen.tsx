// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import * as Etebase from "etebase";
import { useSelector } from "react-redux";
import { View } from "react-native";
import { Avatar, List, Appbar, Paragraph, useTheme } from "react-native-paper";
import { useNavigation, RouteProp } from "@react-navigation/native";

import { useSyncGate } from "../SyncGate";
import { useCredentials } from "../credentials";
import { StoreState } from "../store";

import ScrollView from "../widgets/ScrollView";
import Container from "../widgets/Container";
import LoadingIndicator from "../widgets/LoadingIndicator";
import ConfirmationDialog from "../widgets/ConfirmationDialog";
import ErrorDialog from "../widgets/ErrorDialog";
import CollectionMemberAddDialog from "../components/CollectionMemberAddDialog";

type RootStackParamList = {
  CollectionMembersScreen: {
    colUid: string;
  };
};

interface PropsType {
  route: RouteProp<RootStackParamList, "CollectionMembersScreen">;
}


export default function CollectionMembersScreen(props: PropsType) {
  const [collection, setCollection] = React.useState<Etebase.Collection>();
  const [members, setMembers] = React.useState<Etebase.CollectionMember[]>();
  const [revokeUser, setRevokeUser] = React.useState<Etebase.CollectionMember>();
  const [addMemberOpen, setAddMemberOpen] = React.useState(false);
  const [inviteSuccessOpen, setInviteSuccessOpen] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const collections = useSelector((state: StoreState) => state.cache.collections);
  const syncGate = useSyncGate();
  const navigation = useNavigation();
  const theme = useTheme();
  const etebase = useCredentials()!;

  const revokeUserIsAdmin = revokeUser?.accessLevel === Etebase.CollectionAccessLevel.Admin;

  const { colUid } = props.route.params;

  async function fetchMembers() {
    const colMgr = etebase.getCollectionManager();
    const col = colMgr.cacheLoad(collections.get(colUid)!.cache);
    if (col.accessLevel !== Etebase.CollectionAccessLevel.Admin) {
      setError(`Only the owner of the collection can view and modify its members.`);
      return;
    }

    const memberManager = colMgr.getMemberManager(col);
    try {
      const ret: Etebase.CollectionMember[] = [];
      let iterator: string | null = null;
      let done = false;
      while (!done) {
        const members = await memberManager.list({ iterator, limit: 30 });
        iterator = members.iterator as string;
        done = members.done;

        for (const member of members.data) {
          ret.push(member);
        }
      }
      setCollection(col);
      setMembers(ret);
    } catch (e) {
      setError(e.toString());
    }
  }

  React.useEffect(() => {
    if (!etebase || !collection) {
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <RightAction onClick={() => setAddMemberOpen(true)} />
      ),
    });
  }, [etebase, collection]);

  React.useEffect(() => {
    fetchMembers();
  }, []);

  async function onMemberAdd(username: string, pubkey: Uint8Array, accessLevel: Etebase.CollectionAccessLevel) {
    const inviteMgr = etebase.getInvitationManager();
    await inviteMgr.invite(collection!, username, pubkey, accessLevel);
    await fetchMembers();
    setAddMemberOpen(false);
    setInviteSuccessOpen(true);
  }

  if (syncGate) {
    return syncGate;
  }

  if (error) {
    return (
      <ErrorDialog
        error={error}
        onOk={() => {
          navigation.goBack();
        }}
      />
    );
  }

  if (!members) {
    return (
      <LoadingIndicator />
    );
  }

  return (
    <ScrollView>
      <Container>
        {(members.length > 0) ?
          members.map((member) => (
            <List.Item
              key={member.username}
              title={member.username}
              right={(props: any) => (
                <View {...props} style={{ flexDirection: "row" }}>
                  {(member.accessLevel === Etebase.CollectionAccessLevel.ReadOnly) &&
                    <Avatar.Icon icon="eye" size={36} color={theme.colors.text} style={{ backgroundColor: "transparent" }} />
                  }
                </View>
              )}
              onPress={() => setRevokeUser(member)}
            />
          )) :
          (<Paragraph>No members</Paragraph>)
        }
      </Container>
      <ConfirmationDialog
        title="Remove member"
        visible={!!revokeUser}
        onOk={(revokeUserIsAdmin) ? () => setRevokeUser(undefined) : async () => {
          const colMgr = etebase.getCollectionManager();
          const memberManager = colMgr.getMemberManager(collection!);
          await memberManager.remove(revokeUser!.username);
          setRevokeUser(undefined);
          navigation.goBack();
        }}
        onCancel={() => {
          setRevokeUser(undefined);
        }}
      >
        {(revokeUserIsAdmin) ? (
          <Paragraph>
            Revoking admin access is not allowed.
          </Paragraph>
        ) : (
          <>
            <Paragraph>
              Would you like to revoke {revokeUser?.username}'s access?
            </Paragraph>
            <Paragraph>
              Please be advised that a malicious user would potentially be able to retain access to encryption keys. Please refer to the FAQ for more information.
            </Paragraph>
          </>
        )}
      </ConfirmationDialog>
      {addMemberOpen &&
        <CollectionMemberAddDialog
          onOk={onMemberAdd}
          onClose={() => setAddMemberOpen(false)}
        />
      }

      <ConfirmationDialog
        title="Invite user"
        labelOk="OK"
        visible={inviteSuccessOpen}
        onOk={() => setInviteSuccessOpen(false)}
      >
        <Paragraph>
          Invitation sent. User will be added once the invitation has been accepted.
        </Paragraph>
      </ConfirmationDialog>
    </ScrollView>
  );
}

function RightAction(props: { onClick: () => void }) {
  return (
    <>
      <Appbar.Action
        icon="account-plus"
        accessibilityLabel="Add member"
        onPress={() => {
          props.onClick();
        }}
      />
    </>
  );
}

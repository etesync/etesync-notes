// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { useSelector } from "react-redux";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { Image, Linking, View, StatusBar } from "react-native";
import { Divider, Drawer as PaperDrawer, Text, Paragraph } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { StoreState } from "./store";

import ScrollView from "./widgets/ScrollView";
import ConfirmationDialog from "./widgets/ConfirmationDialog";
import PrettyFingerprint from "./widgets/PrettyFingerprint";
import Container from "./widgets/Container";
import { Subheading } from "./widgets/Typography";
import DrawerItem from "./widgets/DrawerItem";

import LogoutDialog from "./components/LogoutDialog";

import * as C from "./constants";
import { useCredentials } from "./credentials";
import { RootStackParamList } from "./NavigationConfig";

type MenuItem = {
  title: string;
  path: keyof RootStackParamList;
  icon: string;
  link: string;
};

const menuItems: MenuItem[] = [
  {
    title: "Settings",
    path: "Settings",
    icon: "settings",
    link: "/settings",
  },
];

const externalMenuItems = [
  {
    title: "Report issue",
    link: C.reportIssue,
    icon: "bug",
  },
  {
    title: "Contact developer",
    link: `mailto:${C.contactEmail}`,
    icon: "email",
  },
];

if (!C.genericMode) {
  externalMenuItems.unshift(
    {
      title: "FAQ",
      link: C.faq,
      icon: "forum",
    }
  );
  externalMenuItems.unshift(
    {
      title: "Web site",
      link: C.homePage,
      icon: "home",
    }
  );
}

function FingerprintDialog(props: { visible: boolean, onDismiss: () => void }) {
  const etebase = useCredentials()!;

  if (!props.visible) {
    return null;
  }

  const inviteMgr = etebase.getInvitationManager();

  return (
    <ConfirmationDialog
      title="Security Fingerprint"
      visible={props.visible}
      onOk={props.onDismiss}
      onCancel={props.onDismiss}
    >
      <>
        <Paragraph>
          Your security fingerprint is:
        </Paragraph>
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: 15 }}>
          <PrettyFingerprint publicKey={inviteMgr.pubkey} />
        </View>
      </>
    </ConfirmationDialog>
  );
}

interface PropsType {
  navigation: any;
}

export default function Drawer(props: PropsType) {
  const [showFingerprint, setShowFingerprint] = React.useState(false);
  const [showLogout, setShowLogout] = React.useState(false);
  const navigation = props.navigation as DrawerNavigationProp<RootStackParamList, keyof RootStackParamList>;
  const etebase = useCredentials();
  const loggedIn = !!etebase;
  const syncCount = useSelector((state: StoreState) => state.syncCount);

  return (
    <>
      <ScrollView style={{ flex: 1 }}>
        <SafeAreaView style={{ backgroundColor: "#424242" }}>
          <View style={{ height: StatusBar.currentHeight }} />
          <Container style={{ backgroundColor: "transparent" }}>
            <Image
              style={{ width: 48, height: 48, marginBottom: 15 }}
              source={require("./images/icon.png")}
            />
            <Subheading style={{ color: "white" }}>{C.appName}</Subheading>
            {etebase &&
              <Text style={{ color: "white" }}>{etebase.user.username}</Text>
            }
          </Container>
        </SafeAreaView>
        {loggedIn && (
          <>
            <DrawerItem
              label="Notes"
              to="/"
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate("Home");
              }}
              icon="note-multiple"
            />
            <Divider />
          </>
        )}
        <>
          {menuItems.map((menuItem) => (
            <DrawerItem
              key={menuItem.title}
              label={menuItem.title}
              to={menuItem.link}
              onPress={() => {
                navigation.closeDrawer();
                navigation.navigate(menuItem.path);
              }}
              icon={menuItem.icon}
            />
          ))}
          {loggedIn && (
            <>
              <DrawerItem
                label="Show Fingerprint"
                onPress={() => {
                  setShowFingerprint(true);
                }}
                icon="fingerprint"
              />
              <DrawerItem
                label="Invitations"
                to="/invitations"
                onPress={() => {
                  navigation.closeDrawer();
                  navigation.navigate("Invitations");
                }}
                icon="email-outline"
              />
              <DrawerItem
                label="Logout"
                onPress={() => setShowLogout(true)}
                disabled={syncCount > 0}
                icon="exit-to-app"
              />
            </>
          )}
        </>
        <Divider />
        <PaperDrawer.Section title="External links">
          {externalMenuItems.map((menuItem) => (
            <DrawerItem
              key={menuItem.title}
              label={menuItem.title}
              to={menuItem.link}
              onPress={() => { Linking.openURL(menuItem.link) }}
              icon={menuItem.icon}
            />
          ))}
        </PaperDrawer.Section>
      </ScrollView>

      <FingerprintDialog visible={showFingerprint} onDismiss={() => setShowFingerprint(false)} />
      <LogoutDialog
        visible={showLogout}
        onDismiss={(loggedOut) => {
          if (loggedOut) {
            navigation.closeDrawer();
          }
          setShowLogout(false);
        }}
      />
    </>
  );
}

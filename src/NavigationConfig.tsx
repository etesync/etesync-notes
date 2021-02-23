
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Signup: undefined;
  CollectionCreate: undefined;
  Collection: { colUid: string };
  CollectionEdit: { colUid: string };
  CollectionChangelog: { colUid: string };
  CollectionMembers: { colUid: string };
  NoteCreate: {
    colUid: string;
    itemUid?: undefined;
  } | undefined;
  NoteEdit: {
    colUid: string;
    itemUid: string;
  };
  NoteProps: {
    colUid: string;
    itemUid: string;
  };
  NoteMove: {
    colUid: string;
    itemUid: string;
  };
  Invitations: undefined;
  Settings: undefined;
  Password: undefined;
  About: undefined;
  DebugLogs: undefined;
  AccountWizard: undefined;
  "404": undefined;
};

export type DefaultNavigationProp = StackNavigationProp<RootStackParamList, keyof RootStackParamList>;

type RootStackScreens = {
  [route in keyof RootStackParamList]: string;
};

const rootStackScreens: RootStackScreens = {
  Home: "",
  Login: "login",
  Signup: "signup",
  CollectionCreate: "new-notebook",
  Collection: "notebook/:colUid",
  CollectionEdit: "notebook/:colUid/edit",
  CollectionChangelog: "notebook/:colUid/manage",
  CollectionMembers: "notebook/:colUid/members",
  NoteCreate: "new-note",
  NoteEdit: "notebook/:colUid/note/:itemUid",
  NoteProps: "notebook/:colUid/note/:itemUid/properties",
  NoteMove: "notebook/:colUid/note/:itemUid/move",
  Invitations: "invitations",
  Settings: "settings",
  About: "settings/about",
  Password: "settings/password",
  DebugLogs: "settings/logs",
  AccountWizard: "account-wizard",
  "404": "*",
};

export const linking = {
  prefixes: ["https://notes.etesync.com", "com.etesync.notes://"],
  config: {
    screens: {
      Root: {
        path: "",
        screens: rootStackScreens,
      },
    },
  },
};

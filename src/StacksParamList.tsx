
import { StackNavigationProp } from "@react-navigation/stack";

export type MainStackParamList = {
  Home: { colUid: string } | undefined;
  CollectionCreate: undefined;
  CollectionEdit: { colUid: string };
  CollectionChangelog: { colUid: string };
  CollectionMembers: { colUid: string };
  NoteCreate: {
    colUid: string;
    itemUid?: undefined;
  } | undefined;
  NoteProps: {
    colUid: string;
    itemUid: string;
  };
  NoteEdit: {
    colUid: string;
    itemUid: string;
  };
  Invitations: undefined;
};

export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  AccountWizard: undefined;
  Settings: undefined;
  About: undefined;
  DebugLogs: undefined;
  "404": undefined;
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList, keyof RootStackParamList>;

export type MainNavigationProp = StackNavigationProp<MainStackParamList, keyof MainStackParamList>;
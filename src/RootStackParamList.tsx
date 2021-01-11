
import { StackNavigationProp } from "@react-navigation/stack";

export type RootStackParamList = {
  Home: { colUid: string };
  Login: undefined;
  Signup: undefined;
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
  Settings: undefined;
  About: undefined;
  DebugLogs: undefined;
  AccountWizard: undefined;
  "404": undefined;
};

export type DefaultNavigationProp = StackNavigationProp<RootStackParamList, keyof RootStackParamList>;

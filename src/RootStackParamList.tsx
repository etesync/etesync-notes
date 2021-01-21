
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

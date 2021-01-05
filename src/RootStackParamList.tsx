
export type RootStackParamList = {
  Home: { colUid: string };
  Login: undefined;
  Signup: undefined;
  CollectionCreate: undefined;
  CollectionEdit: { colUid: string };
  CollectionChangelog: { colUid: string };
  CollectionMembers: { colUid: string };
  NoteEdit: {
    colUid: string;
    itemUid: string;
  };
  Invitations: undefined;
  Settings: undefined;
  About: undefined;
  DebugLogs: undefined;
  AccountWizard: undefined;
  "404": {
    title?: string;
    message?: string;
    help?: string;
  };
};

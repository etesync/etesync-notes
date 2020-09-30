import * as localforage from "localforage";
import { AsyncStorage } from "react-native";
(localforage as any).getAllKeys = localforage.keys;

export default AsyncStorage ?? localforage;

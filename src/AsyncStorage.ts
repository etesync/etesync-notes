import * as localforage from "localforage";
import AsyncStorage from "@react-native-community/async-storage";
(localforage as any).getAllKeys = localforage.keys;

export default AsyncStorage ?? localforage;

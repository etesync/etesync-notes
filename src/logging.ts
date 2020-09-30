// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import AsyncStorage from "./AsyncStorage";

export enum LogLevel {
  Off = 0,
  Critical,
  Warning,
  Info,
  Debug,
}

let logLevel = (__DEV__) ? LogLevel.Debug : LogLevel.Off;

export function setLogLevel(level: LogLevel) {
  if (!__DEV__) {
    logLevel = level;
  }
}

function shouldLog(messageLevel: LogLevel) {
  return messageLevel <= logLevel;
}

function logPrint(messageLevel: LogLevel, message: any) {
  if (!shouldLog(messageLevel)) {
    return;
  }

  switch (messageLevel) {
    case LogLevel.Critical:
    case LogLevel.Warning:
      console.warn(message);
      break;
    default:
      console.log(message);
  }
}

const logPrefix = "__logging_";

function logToBuffer(messageLevel: LogLevel, message: any) {
  if (!shouldLog(messageLevel)) {
    return;
  }

  AsyncStorage.setItem(`${logPrefix}${new Date().toISOString()}`, `[${LogLevel[messageLevel].substr(0, 1)}] ${message}`);
}

async function getLogKeys() {
  const keys = await AsyncStorage.getAllKeys();
  return keys.filter((key) => key.startsWith(logPrefix));
}

export async function getLogs() {
  const wantedKeys = await getLogKeys();
  if (wantedKeys.length === 0) {
    return [];
  }

  const wantedItems = await AsyncStorage.multiGet(wantedKeys);
  return wantedItems.sort(([a], [b]) => {
    return a.localeCompare(b);
  }).map(([_key, value]) => value);
}

export async function clearLogs() {
  const wantedKeys = await getLogKeys();
  if (wantedKeys.length === 0) {
    return;
  }
  await AsyncStorage.multiRemove(wantedKeys);
}

const logHandler = (__DEV__) ? logPrint : logToBuffer;

class Logger {
  public debug(message: string) {
    logHandler(LogLevel.Debug, message);
  }

  public info(message: string) {
    logHandler(LogLevel.Info, message);
  }

  public warn(message: string) {
    logHandler(LogLevel.Warning, message);
  }

  public critical(message: string) {
    logHandler(LogLevel.Critical, message);
  }
}

export const logger = new Logger();

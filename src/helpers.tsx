// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import * as React from "react";
import { AppState, AppStateStatus, Platform, useWindowDimensions } from "react-native";
import { NavigationState, PartialState } from "@react-navigation/native";
import * as Etebase from "etebase";

import { logger } from "./logging";

export const defaultColor = "#8BC34A";

export interface NoteMetadata extends Etebase.ItemMetadata {
  name: string;
  mtime: number;
}

export function* arrayToChunkIterator<T>(arr: T[], size: number) {
  for (let i = 0 ; i < arr.length ; i += size) {
    yield arr.slice(i, i + size);
  }
}

export function isPromise(x: any): x is Promise<any> {
  return x && typeof x.then === "function";
}

export function isDefined<T>(x: T | undefined): x is T {
  return x !== undefined;
}

export function startTask<T = any>(func: () => Promise<T> | T, delay = 0): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        try {
          const ret = func();
          if (isPromise(ret)) {
            ret.then(resolve)
              .catch(reject);
          } else {
            resolve(ret);
          }
        } catch (e) {
          reject(e);
        }
      },
      delay);
  });
}

function isFunction(f: any): f is Function { // eslint-disable-line @typescript-eslint/ban-types
  return f instanceof Function;
}

export function useIsMounted() {
  const isMounted = React.useRef(false);
  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
}

type PromiseParam = Promise<any> | (() => Promise<any>) | undefined;

export function usePromiseMemo<T>(promise: Promise<T> | undefined | null, deps: React.DependencyList, initial: T | undefined = undefined): T | undefined {
  const [val, setVal] = React.useState<T>((promise as any)._returnedValue ?? initial);
  React.useEffect(() => {
    let cancel = false;
    if (promise === undefined || promise === null) {
      return undefined;
    }
    promise.then((val) => {
      (promise as any)._returnedValue = val;
      if (!cancel) {
        setVal(val);
      }
    });
    return () => {
      cancel = true;
    };
  }, [...deps, promise]);
  return val;
}

export function useLoading(): [boolean, Error | undefined, (promise: PromiseParam) => void] {
  const isMounted = useIsMounted();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error>();

  function setPromise(inPromise: PromiseParam) {
    setLoading(true);
    setError(undefined);

    startTask(() => {
      const promise = (isFunction(inPromise) ? inPromise() : inPromise);

      if (isPromise(promise)) {
        promise.catch((e) => {
          if (isMounted.current) {
            setError(e);
          }
        }).finally(() => {
          if (isMounted.current) {
            setLoading(false);
          }
        });
      } else {
        setLoading(false);
      }
    });
  }

  return [loading, error, setPromise];
}

export function useAppStateCb(cb: (foreground: boolean) => void) {
  const state = React.useRef(AppState.currentState);
  const [appState, setAppState] = React.useState(state.current);

  function onChange(newState: AppStateStatus) {
    console.log(state.current, newState);
    if (newState === "active") {
      logger.debug("App switched to foreground");
      cb(true);
    } else if (state.current === "active") {
      logger.debug("App switched to background");
      cb(false);
    }
    setAppState(newState);
  }

  React.useEffect(() => {
    AppState.addEventListener("change", onChange);

    return () => {
      AppState.removeEventListener("change", onChange);
    };
  }, [cb]);

  return appState;
}

export const PASSWORD_MIN_LENGTH = 8;

export function enforcePasswordRules(password: string): string | undefined {

  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Passwourds should be at least ${PASSWORD_MIN_LENGTH} digits long.`;
  }
  return undefined;
}

export declare type FontFamilyKey = "regular" | "monospace" | "serif";
 
export const fontFamilies = Platform.select({
  web: {
    regular: 'Roboto, "Helvetica Neue", Helvetica, Arial, sans-serif',
    monospace: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
    serif: '"Times New Roman", Georgia, serif',
  },
  ios: {
    regular: "System",
    monospace: "Courier",
    serif: "Times New Roman",
  },
  default: {
    regular: "sans-serif",
    monospace: "monospace",
    serif: "serif",
  },
});

// These are taken from https://material.io/design/layout/responsive-layout-grid.html#breakpoints
const deviceBreakpoints = {
  tabletPortrait: 600,
  tabletLandscape: 960,
};

export function useDeviceBreakpoint(device: keyof typeof deviceBreakpoints) {
  const { width } = useWindowDimensions();
  const [breakpoint, setBreakpoint] = React.useState(false);

  React.useEffect(() => {
    (width < deviceBreakpoints[device]) ? setBreakpoint(false) : setBreakpoint(true);
  }, [width, device]);

  return breakpoint;
}

export function getActiveRoute(state: NavigationState | Omit<PartialState<NavigationState>, "stale">): { name: string, params?: any } {
  const route = (typeof state.index === "number") ? state.routes[state.index] : state.routes[state.routes.length - 1];

  if (route.state) {
    return getActiveRoute(route.state);
  }

  return route;
}

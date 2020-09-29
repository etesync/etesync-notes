// SPDX-FileCopyrightText: © 2019 EteSync Authors
// SPDX-License-Identifier: GPL-3.0-only

import { createStore, applyMiddleware } from "redux";
import { persistStore } from "redux-persist";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";
import { useDispatch } from "react-redux";
import { ActionMeta } from "redux-actions";

import promiseMiddleware from "./promise-middleware";

import reducers from "./construct";

// Workaround babel limitation
export * from "./reducers";
export * from "./construct";

const middleware = [
  thunkMiddleware,
  promiseMiddleware,
];

if (__DEV__) {
  const ignoreActions = [
    "persist/PERSIST",
    "persist/REHYDRATE",
  ];

  const predicate = (_: any, action: { type: string }) => {
    return !ignoreActions.includes(action.type);
  };

  const logger = {
    log: (msg: string) => {
      if (msg[0] === "#") {
        console.log(msg);
      }
    },
  };

  middleware.push(createLogger({
    predicate,
    logger,
    stateTransformer: () => "state",
    actionTransformer: ({ type, error, payload }) => ({ type, error, payload: (payload !== undefined) }),
    titleFormatter: (action: { type: string, error: any, payload: boolean }, time: string, took: number) => {
      let prefix = "->";
      if (action.error) {
        prefix = "xx";
      } else if (action.payload) {
        prefix = "==";
      }
      return `# ${prefix} ${action.type} @ ${time} (in ${took.toFixed(2)} ms)`;
    },
    colors: {
      title: false,
      prevState: false,
      action: false,
      nextState: false,
      error: false,
    },
  }));
}

// FIXME: Hack, we don't actually return a promise when one is not passed.
export function asyncDispatch<T, V>(action: ActionMeta<Promise<T> | T, V>): Promise<ActionMeta<T, V>> {
  return store.dispatch(action) as any;
}

export function useAsyncDispatch() {
  const dispatch = useDispatch();
  return function (action: any): any {
    return dispatch(action) as any;
  } as typeof asyncDispatch;
}

export const store = createStore(
  reducers,
  applyMiddleware(...middleware)
);

export const persistor = persistStore(store, { manualPersist: true } as any);

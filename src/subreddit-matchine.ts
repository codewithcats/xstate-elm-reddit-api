import { assign, createMachine } from "xstate";
import { sendEvent } from "./actor-registry";
import type { MachineEvent } from "./events";

interface Context {
  posts: Post[];
  subreddit: string;
}

interface Post {
  title: string;
  permalink: string;
}

export const services = {
  fetchSubreddit: async (context: Context) => {
    const { subreddit } = context;

    const response = await fetch(`https://www.reddit.com/r/${subreddit}.json`);
    const json = await response.json();
    return json.data.children.map((child: any) => child.data);
  },
};

type Services = typeof services;

export const subredditMachine = (services: Services) => (subreddit: string) =>
  createMachine(
    {
      tsTypes: {} as import("./subreddit-matchine.typegen").Typegen0,
      id: "subreddit",
      schema: {
        context: {} as Context,
        services: {} as { fetchSubreddit: { data: Post[] } },
        events: {} as MachineEvent,
      },
      context: {
        posts: [],
        subreddit,
      },
      states: {
        idle: {},
        loading: {
          invoke: {
            id: "fetch-subreddit",
            src: "fetchSubreddit",
            onDone: {
              target: "loaded",
              actions: ["updatePosts", "notifyLoaded"],
            },
            onError: "failed",
          },
        },
        loaded: {},
        failed: {},
      },
      initial: "idle",
      on: {
        SUBREDDIT_UPDATED: {
          target: ".loading",
          actions: "updateSubreddit",
          cond: "isSubredditValid",
        },
        "SEARCH_BOX.SEARCH_CLICKED": {
          target: ".loading",
          actions: "updateSubredditWithSerchTerm",
        },
      },
    },
    {
      services,
      actions: {
        updatePosts: assign((context, event) => {
          return {
            ...context,
            posts: event.data,
          };
        }),
        updateSubreddit: assign((context, event) => {
          return {
            ...context,
            subreddit: event.subreddit,
          };
        }),
        updateSubredditWithSerchTerm: assign((context, event) => {
          return {
            ...context,
            subreddit: event.searchTerm,
          };
        }),
        notifyLoaded: () => {
          sendEvent({ type: "SUBREDDIT.LOADED" });
        },
      },
      guards: {
        isSubredditValid: (_, event) => {
          return event.subreddit.length > 0;
        },
      },
    }
  );

export const createSubredditMachine = subredditMachine(services);

import { assign, createMachine } from "xstate";

export type Context = {
  subreddit: string;
  posts: any;
  subredditOptions: string[];
};
type SelectEvent = { type: "SELECT"; name: string };

export const machineServices = {
  fetchSubreddit: async (context: Context) => {
    const { subreddit } = context;

    return fetch(`https://www.reddit.com/r/${subreddit}.json`)
      .then((response) => response.json())
      .then((json) => json.data.children.map((child) => child.data));
  },
};

export const redditMachine = (services: typeof machineServices) =>
  createMachine(
    {
      id: "reddit",
      tsTypes: {} as import("./reddit-machine.typegen").Typegen0,
      schema: {
        context: {} as Context,
        events: {} as SelectEvent,
        services: {} as {
          fetchSubreddit: { data: any };
        },
      },
      context: {
        subreddit: null,
        posts: null,
        subredditOptions: ["elm", "react", "angular"],
      },
      states: {
        idle: {},
        selected: {
          initial: "loading",
          states: {
            loading: {
              invoke: {
                id: "fetch-subreddit",
                src: "fetchSubreddit",
                onDone: {
                  target: "loaded",
                  actions: "updatePosts",
                },
                onError: "failed",
              },
            },
            loaded: {},
            failed: {},
          },
        },
      },
      initial: "idle",
      on: {
        SELECT: {
          target: ".selected",
          actions: "updateSubreddit",
        },
      },
    },
    {
      services,
      actions: {
        updateSubreddit: assign((context, event) => ({
          ...context,
          subreddit: event.name,
        })),
        updatePosts: assign((context, event) => ({
          ...context,
          posts: event.data,
        })),
      },
    }
  );

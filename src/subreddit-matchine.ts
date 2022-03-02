import { assign, createMachine } from "xstate";

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
        events: {} as { type: "SUBREDDIT_UPDATED"; subreddit: string },
      },
      context: {
        posts: [],
        subreddit,
      },
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
      initial: "loading",
      on: {
        SUBREDDIT_UPDATED: {
          target: ".loading",
          actions: "updateSubreddit",
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
      },
    }
  );

export const createSubredditMachine = subredditMachine(services);

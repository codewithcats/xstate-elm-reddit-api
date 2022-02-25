import { createMachine, assign } from "xstate";

type Context = { subreddit: string; posts: any };
type SelectEvent = { type: "SELECT"; name: string };

const redditMachine = createMachine(
  {
    id: "reddit",
    tsTypes: {} as import("./index.typegen").Typegen0,
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
        actions: "updateName",
      },
    },
  },
  {
    services: {
      fetchSubreddit: async (context) => {
        const { subreddit } = context;

        return fetch(`https://www.reddit.com/r/${subreddit}.json`)
          .then((response) => response.json())
          .then((json) => json.data.children.map((child) => child.data));
      },
    },
    actions: {
      updateName: (_, event) => event.name,
      updatePosts: (_, event) => event.data,
    },
  }
);

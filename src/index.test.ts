import { interpret } from "xstate";
import { redditMachine, Context } from "./index";

describe("load subreddit", () => {
  test("load posts from selected subreddit", (done) => {
    const services = {
      fetchSubreddit: async (_: Context) => [],
    };
    // @ts-ignore
    const reddit = interpret(redditMachine(services))
      .onTransition((state) => {
        if (state.matches({ selected: "loaded" })) {
          console.log("state", state.context);
          try {
            expect(state.context.posts).not.toBeNull();
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();

    reddit.send("SELECT", { name: "elm" });
  });
});

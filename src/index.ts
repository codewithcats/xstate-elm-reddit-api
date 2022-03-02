import { interpret } from "xstate";
import { createRedditMachine } from "./reddit-machine";
import { createSubredditMachine } from "./subreddit-matchine";
// @ts-ignore
import { Elm } from "./Main.elm";

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

// @ts-ignore
const machine = interpret(createRedditMachine(createSubredditMachine));
machine.onTransition((state) => {
  console.log(
    "state",
    state.value,
    state.context.subredditMachine?.state.value,
    state.context.subredditMachine?.state.context
  );
  elm.ports.stateChanged.send(state);
});

elm.ports.machineEvent.subscribe((event) => {
  console.log("machine event", event);
  machine.send(event);
});

machine.start();

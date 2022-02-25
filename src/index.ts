import { interpret } from "xstate";
import { machine as redditMachine } from "./reddit-machine";
// @ts-ignore
import { Elm } from "./Main.elm";

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

// @ts-ignore
const machine = interpret(redditMachine);
machine.onTransition((state) => {
  console.log("state", state.value, state.context);
  elm.ports.stateChanged.send({ state: state.value, context: state.context });
});

elm.ports.machineEvent.subscribe((event) => {
  console.log("machine event", event);
  machine.send(event);
});

machine.start();

import Links from "./Links.svelte";
import Portrait from "./Portrait.svelte";

let containers = [Portrait, Links];

function generateComponent(component, target, props) {
  props.cfg.anchor != null
    ? new component({
        target: target,
        props: props,
        anchor: document.querySelector("#" + props.cfg.anchor),
      })
    : Object.keys(props.cfg).length === 0
    ? new component({
        target: target,
      })
    : new component({
        target: target,
        props: props,
      });
}

containers.forEach((c) => {
  let target = document.querySelector("#svelte-" + c["name"].toLowerCase());
  if (target) {
    let cfg = target.dataset.cfg ? JSON.parse(target.dataset.cfg) : {};
    generateComponent(c, target, {
      cfg,
    });
  }
});

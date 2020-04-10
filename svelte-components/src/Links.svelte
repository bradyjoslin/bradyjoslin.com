<script>
  import { github, twitter, linkedin, rss } from "svelte-awesome/icons";
  import Icon from "svelte-awesome";
  export let cfg;

  let default_data = [
    { name: "github", url: "https://github.com/bradyjoslin" },
    { name: "twitter", url: "https://twitter.com/bradyj" },
    { name: "linkedin", url: "https://linkedin.com/in/bradyjoslin" },
    { name: "rss", url: "../rss.xml" }
  ];

  let links = cfg.links.length == 0 ? default_data : cfg.links;

  links.forEach(l => {
    [github, twitter, linkedin, rss].forEach(o => {
      if (l.name == Object.getOwnPropertyNames(o)[0]) {
        l.name = o;
      }
    });
  });
</script>

<style>
  a {
    margin: 0.25rem;
    text-decoration: none;
    color: #34495e;
  }
  a:hover {
    /* opacity: 0.38; */
    border-bottom: 2px solid #c05b4d;
  }
  div {
    /* padding-top: 1rem; */
    text-align: center;
  }
</style>

<div class="links">
  {#each links as { name, url }}
    <a
      rel={Object.getOwnPropertyNames(name)}
      href={url}
      title={Object.getOwnPropertyNames(name)}>
      <Icon data={name} scale="2" />
    </a>
  {/each}
</div>

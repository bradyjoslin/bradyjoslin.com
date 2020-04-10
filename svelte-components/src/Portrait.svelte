<script>
  export let cfg;
  let src = cfg.image_url;
</script>

<style>
  img {
    border-radius: 50%;
    width: 100%;
    min-width: 46px;
    min-height: 46px;
    /* max-width: 250px;
    max-height: 250px; */
    max-width: 150px;
    max-height: 150px;
    border: 1px solid #34495e;
    padding: 0px;
    margin: 0px;
  }
  div {
    text-align: center;
  }
</style>

<div>
  <img {src} alt="Portrait" />
</div>

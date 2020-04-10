#! /bin/bash   
set -m
zola serve & (cd svelte-components && exec npm run dev) && fg
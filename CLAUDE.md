# Hades compendium

We're building a compendium for the video game Hades. This is an early version that only focuses on boons.

The projects uses deno.

## Data source

We will use the Hades wiki at https://hades.fandom.com/wiki/Boons - the boons can be found on each god's subpage, e.g. https://hades.fandom.com/wiki/Zeus/Boons_(Hades).

The data is processed in these steps:
- `mise scrape` to download the relevant .html files and store them in ./boons/
- `mise seed-db` to parse the HTML tables into a sqlite datase stored in ./boons.db
- `mise dump-json` to dump the sqlite table into a JSON file that can be read by the vue.js frotend.

## Running the server

```
mise server
```

will make the server accessible at <http://localhost:5173/>.

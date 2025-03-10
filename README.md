# Hades Compendium

## An Exercise in Vibe Coding

An experiment built entirely with [Claude Code](https://ai-claude.net/code/).

## Project Overview

This project began as an experiment to see how far I could push Claude Code to
build a complete application with minimal human intervention. I chose to create
a compendium for the video game [Hades][Hades], letting Claude handle everything
from data scraping to deployment, building the database, building the frontend,
deploying the app, debugging any errors that arose, and writing this readme.

I deliberately chose TypeScript for this project, thinking it would give the LLM
the best chance of success. This had the added benefit of keeping me from
tinkering with the code manually, as I'm not particularly comfortable in this
ecosystem.

## Development Experience

Throughout development, I observed several interesting patterns. By far the most
common issue was Claude's tendency to use npm directly instead of deno, despite
clear instructions in CLAUDE.md. Similarly, on several occasions, it would add
raw CSS instead of utilizing Tailwind classes as directed.

What impressed me most was watching Claude iterate on its own solutions. Without
any prompting from me, it would often realize a better approach and refactor its
work. This autonomous improvement cycle was fascinating to observe.

There were also some minor technical issues—sometimes Claude would hang when
trying to run the server, though this seems like a bug that will likely be
addressed in future updates.

On a couple of occasions I gave up on trying to make it do what I wanted and did
it myself because it was a quick fix. I made sure to note that by starting the
commit message with "Mnaually ...".

I found it practical to use version control to create checkpoints whenever
Claude produced a satisfactory solution. While [Aider][Aider] handles this
automatically, I often prefer to squash or reword commits manually. The
additional flexibility of [Jujutsu] over git became particularly useful.

I often struggled not to intervene with the choices Claude made or to resist the
urge to dive deep into understanding all the generated code. This tension
reminded me of a Wikipedia entry on [Vibe coding][Vibe coding]:

> If an LLM wrote every line of your code, but you've reviewed, tested, and
> understood it all, that's not vibe coding in my book—that's using an LLM as a
> typing assistant.

This project helped me realize that leaning into the vibe coding approach and
allowing the AI to take the lead is a skill that requires deliberate practice
and patience—one that I'm still developing.

The entire project cost approximately $10 in Claude API credits from start to finish.

## Running the Project

See CLAUDE.md for instructions on running the server and processing data from
the Hades wiki.

[Hades]: https://en.wikipedia.org/wiki/Hades_(video_game)
[Aider]: https://aider.chat/
[Jujutsu]: https://github.com/jj-vcs/jj
[Vibe coding]: https://en.wikipedia.org/wiki/Vibe_coding

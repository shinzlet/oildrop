# oildrop (still in alpha)
**Browser extensions have access to all of your data.** So you should be very picky when choosing which ones you'll install.

There are plenty of well-made, fully featured userscript managers that
already exist. However, the number of features they offer mean that they are too
big for a single end-user to easily audit (>> 10k sloc, typically). This means
you have to trust that no malicious code has been slipped into them.

Oildrop takes the alternative approach - it is designed to provide only the
most essential features, while keeping a small, clean codebase. The core goal
of Oildrop is that anyone who is slightly familiar with Javascript can read all
of its code in less than ten minutes.

## Project status
- [x] Working prototype
- [x] CSS Injection
- [x] Javascript Injection
- [x] Sort scripts
- [ ] Clean, modern design
- [ ] Dark / Light UI Toggle
- [ ] Import / Export userscripts

## Appearance
Oildrop isn't pretty, yet. I do plan to do a full overhaul of all the styling, and I'm
even considering bringing a real designer on board (good software is as pretty as it
is free, and Oildrop is GPLv3, after all).

## Compatibility
Currently, Oildrop does not implement the `GM_` functions that are part of the
GreaseMonkey API, nor does it use a metadata block. Although this is not very limiting for any new userscripts you write or port, it will likely break
large GreaseMonkey userscripts.

Because Oildrop's primary purpose is to help privacy-cautious users only run code
they trust, fixing this is not a very high priority for me. I'm totally open to
discussing this, however!
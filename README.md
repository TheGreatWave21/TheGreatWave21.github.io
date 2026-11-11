# Personal Website

This repository contains my personal static website, hosted with GitHub Pages.
The home page is a display-system style interface: a slate frame with a
sidebar menu that switches panels (Home, About, Projects, Contact) and
launches Barcona Systems, Flow and GitHub. It scales to fit any screen.

## Sections

- Home (`#home`): greeting, quote, quick access
- About (`#about`): about, focus areas, currently exploring
- Projects (`#projects`): selected work
- Contact (`#contact`): GitHub, LinkedIn

## Editing

- All text and links are plain HTML in the `<section>` elements of `index.html`.
- `script.js` only adds behaviour (panel switching, clock, boot screen, easter eggs).
- Colours and fonts are the variables at the top of `style.css`.
- Font: Antonio (SIL Open Font License, `assets/fonts/OFL.txt`), self-hosted.
- `/barcona-systems/` and `/flow/` are separate project-page repos.

## Built with

- HTML
- CSS
- JS (vanilla, no build step)
- GitHub Pages

# reverselikes

Browse a Tumblr blog's likes from oldest to newest, with infinite scroll.
Live at <https://tumblrlikes.ggo.blue>.

The rail on the right is a timeline of every like, oldest at the top: hover or
drag to preview a date, click or release to jump there. With it focused, the
arrow keys move a month, Page Up/Down a year, and Home/End go to either end.

Built with React 19, Vite and TypeScript; the list is virtualized with
`@tanstack/react-virtual`.

## Setup

```sh
npm install
cp .env.example .env   # then set VITE_TUMBLR_API_KEY
npm run dev
```

`VITE_TUMBLR_API_KEY` is a Tumblr OAuth consumer key. It is bundled into the
static site, so it is visible to anyone who loads the page; that's inherent to
calling the Tumblr API from the browser.

The blog to browse is the `BLOG` constant in `src/App.tsx`.

## Deploy

```sh
npm run deploy
```

This builds into `dist/` and pushes it to the `gh-pages` branch, which GitHub
Pages serves. The custom domain comes from `public/CNAME`.

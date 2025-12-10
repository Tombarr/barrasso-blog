# [Barrasso.me](https://barrasso.me)

[Barrasso.me](https://barrasso.me) is my personal portfolio website and blog. It's a [Hugo](https://gohugo.io) static site hosted on Cloudflare Pages. It's based on Karthick Gopal's [Henry theme](https://github.com/kaushikgopal/henry-hugo).

## Dev Environment

This project includes a DevContainer setup with Hugo, Typos, and uses the Henry theme. DevContainers require Docker, otherwise you can install Hugo locally and build directly on your machine.

### Local Server

```bash
hugo server --bind 0.0.0.0 --disableFastRender --noHTTPCache
```

Run local development server with live reload. The site will be available at `http://localhost:1313`.

### Building

```bash
hugo --minify --gc--cleanDestinationDir --environment production
```

This builds the website, including all HTML, CSS, and JavaScript, in the default `public/` directory.

## Legal

The content of this website is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). External images are sourced primarily from the public domain and are the property of their respective owners. Best effort is made to provide links and citations where possible. Code samples are provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

For detailed licensing information, including what license applies to which files and contribution guidelines, see [LICENSES](./LICENSE).

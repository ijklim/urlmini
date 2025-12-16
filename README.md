# URL Shortener

A simple URL Shortener web application built with Node.js and Express.

## Getting Started

To start the server locally:

```sh
pnpm install   # install dependencies (only needed once)
pnpm start     # start the server
```

By default, the server will run at:

```
http://localhost:3000
```

Visit this address in your browser. The home page will show you how to use the URL shortener, including example links for creating and using short URLs with your current domain and port.

## Environment variables

You can configure runtime behavior with environment variables. Example values are provided in `.env.example`.

- `PORT` — TCP port the server listens on
- `NODE_ENV` — runtime environment. Common values:
	- `development` — local development, shows debug info and stack traces
	- `production`  — production runtime, hide detailed errors
	- `test`        — automated test runs

Do not commit a real `.env` containing secrets; keep `.env` in `.gitignore`.

## Live Demo

[https://urlmini.glitch.me](https://urlmini.glitch.me)
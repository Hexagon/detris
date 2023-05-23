# detris

WIP server side Tetris implementation written in Deno TypeScript using Deno KV and a 
lazy HTML5 client.

# Development setup

Checkout this repo

```bash
cd <your workspace path>
git clone https://github.com/Hexagon/detris.git
cd detris
```

Start using Deno, `--unstable` is required because Kv is not stabilized yet

```bash
deno run -A --unstable main.ts
```

Game will now be available at

http://127.0.0.1:8080

## Available environment variables

| Variable    | Default |
| ----------- | ------- |
| DETRIS_PORT | 8080    |

# detris

detris is a work-in-progress server-side Tetris implementation written in Deno
TypeScript. It utilizes Deno KV for storage and includes a basic HTML5 client
for gameplay. This client is lazy, which means all calculations are made
server-side.

Live at [https://tetris.56k.guru](https://tetris.56k.guru)

To set up the development environment, follow the steps below:

1. Clone this repository to your desired workspace:

```bash
cd <your workspace path>
git clone https://github.com/Hexagon/detris.git
cd detris
```

2. Start the server using Deno. The --unstable flag is required as Deno KV is
   not yet stabilized:

```bash
deno run -A --unstable main.ts
```

The game will now be accessible at:

http://127.0.0.1:8080

## Available Environment Variables

| Variable    | Default |
| ----------- | ------- |
| DETRIS_PORT | 8080    |
| DETRIS_PERSIST_PATH | <default kv location> |

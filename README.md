# detris

detris is a feature-rich, server-side implementation of Tetris written in Deno TypeScript. This project showcases the capabilities of Deno and Deno KV, providing a demonstration of a fully functional application without relying on frameworks or dependencies. 

Live at [https://tetris.56k.guru](https://tetris.56k.guru)

## Features

- **Server-side** stateless Tetris implementation in Deno TypeScript
- **Multiple game modes** including Single Player, Co-op, and PvP
- **Intelligent AI** opponent for multiplayer practice
- **Highscore** tracking and leaderboards
- **Lightweight**, lazy HTML5 client for gameplay
- **Deno KV** utilized for data persistence
- **Pure Deno** / Deno KV / Deno STD application without frameworks or dependencies.

## Getting Started

To set up the development environment, follow the steps below:

1. Clone this repository to your desired workspace:

## Getting Started

To set up the development environment, follow the steps below:

1. Clone this repository to your desired workspace:

```bash
cd <your workspace path>
git clone https://github.com/Hexagon/detris.git
cd detris
```

2. Start the server using Deno. The `--unstable` flag is required as Deno KV is
   not yet stabilized:

```bash
deno run -A --unstable main.ts
```

The game will now be accessible at:

http://127.0.0.1:8080

## Available Environment Variables

| Variable            | Default               |
| ------------------- | --------------------- |
| DETRIS_PORT         | 8080                  |
| DETRIS_PERSIST_PATH | <default kv location> |

# Contributing to detris

Below is a brief guide on how to contribute to Detris, all contributions/collaborations/discussions are welcome.

## Contribution Guide

1. **Fork the Repository**: Start by forking the official detris repository.

2. **Clone the Forked Repository**: Clone the forked repository to your local machine. Replace `your-username` with your GitHub username.

    ```bash
    git clone https://github.com/your-username/detris.git
    cd detris
    ```

3. **Create a New Branch**: Create a new branch for your changes. Try to name the branch in a way that describes the changes you are making.

    ```bash
    git checkout -b branch-name
    ```

4. **Make Your Changes**: Make the changes you want to contribute.

5. **Commit Your Changes**: Commit your changes. Try to write a descriptive commit message.

    ```bash
    git commit -m "Add this feature"
    ```

6. **Push Your Changes**: Push your changes to your forked repository.

    ```bash
    git push origin branch-name
    ```

7. **Open a Pull Request**: Go to this detris repository and open a pull request from your forked repository to the `main` branch of hexagon/detris.


8. Success! Once your pull request has been submitted, it will be reviewed and accepted as soon as possible.
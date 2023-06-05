# detris

detris is a feature-rich, server-side implementation of Tetris written in Deno
TypeScript. This project showcases the capabilities of Deno and Deno KV,
providing a demonstration of a fully functional application without relying on
frameworks or dependencies.

Live at [https://tetris.56k.guru](https://tetris.56k.guru)

## Features

- **Server-side** stateless Tetris implementation in Deno TypeScript
- **Multiple game modes** including Single Player, Co-op, and PvP
- **"Intelligent" AI** opponent for multiplayer practice
- **Highscore** tracking and leaderboards
- **Lightweight**, lazy HTML5 client for gameplay
- **Deno KV** utilized for data persistence
- **Pure Deno** / Deno KV / Deno STD application without frameworks or
  dependencies. Uses all default settings for type checks, formatting and linting.

## Game Mechanics and Scoring

### Tetrominoes and Movement

Tetrominoes are generated in a queue and are held in an array, where index 0 is
the currently dropping tetromino, and index 1-3 is the upcoming queue.

During gameplay, players can manipulate the current tetromino in different ways:

- **Move horizontally:** Shift the tetromino left or right.
- **Rotate:** Rotate the tetromino 90 degrees clockwise or counter-clockwise.
- **Soft drop:** Increase the speed at which the tetromino falls.
- **Hard drop:** Instantly drop and freeze the tetromino to the bottom of the
  grid.

Detris also support automatic kicks. These are predefined maneuvers enabling a
tetromino to adjust its position or rotation in confined spaces. Without kicks,
these movements would be impossible due to collision with walls, other blocks,
or actions from an opponent.

- Wall Kick: If a tetromino gets outside of the game grid while rotating, it
  will automatically shift one space away from the obstruction and rotate.

- Floor Kick: If a tetromino is rotated near the bottom of the grid, it might
  shift upwards to accommodate its shape and prevent it from getting stuck. This
  could also happen if a garbage row is added in Battle Mode, or if two players
  try to drop a tetromino at the same place in Co-Op.

### Scoring

Detris rewards players for both controlling tetrominoes and clearing lines:

- **Dropping tetrominoes:** Players earn 2 points for each grid cell the
  tetromino traverses during a hard drop. This score is then multiplied by the
  current level number plus one.

- **Clearing lines:** When players clear lines, they earn a base score,
  depending on the number of lines cleared at once:

- Single: 40 points
- Double: 160 points
- Triple: 480 points
- Tetris (4 lines): 1280 points

These base scores are also multiplied by the current level number plus one.

### Levels and Speed

As players clear more lines, the game's speed increases. The requirement for
progressing to the next level is clearing five more lines than the previous
level. The time between tetromino drops decreases by 25 ms with each new level,
down to a minimum of 100 ms. This system introduces an increasing challenge as
the game progresses, rewarding quick decision-making and advanced planning.

In Co-Op and Battle Mode, you can play with an AI bot that, similar to human
players, struggles more as the game's level increases. As the speed and
complexity of the game escalate, the AI is increasingly challenged, leading to
more potential missteps and exciting gameplay.

### Single Player Mode

In Single Player Mode, players aim to score as many points as possible before
the blocks reach the top of the playfield. The falling speed of the blocks
increases as the game progresses, testing players' skills as they aim for a high
score.

### Co-op Mode

In the Co-op Mode, two players (or one player and the AI) will be able to work
together on the same playfield, combining their efforts for a higher score.
Communication and synchronization will be key to success in this mode.

### Battle Mode

Battle Mode introduces competitive play, where two players face off to see who
can survive the other. In this mode, clearing multiple lines at once sends
'garbage' lines to the opponent's grid, adding an extra layer of strategy to the
game. Clearing 3 rows sends 1 row, clearing 4 rows, sends 2 rows. The game ends
when one player's stack of blocks reaches the top of the playfield, and the
winners (and only the winners) score is recorded on the Highscore.

## Local development

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

### Available Environment Variables

| Variable            | Default               |
| ------------------- | --------------------- |
| DETRIS_PORT         | 8080                  |
| DETRIS_PERSIST_PATH | <default kv location> |

## Contributing to detris

Below is a brief guide on how to contribute to Detris, all
contributions/collaborations/discussions are welcome.

1. **Fork the Repository**: Start by forking the official detris repository.

2. **Clone the Forked Repository**: Clone the forked repository to your local
   machine. Replace `your-username` with your GitHub username.

   ```bash
   git clone https://github.com/your-username/detris.git
   cd detris
   ```

3. **Create a New Branch**: Create a new branch for your changes. Try to name
   the branch in a way that describes the changes you are making.

   ```bash
   git checkout -b branch-name
   ```

4. **Make Your Changes**: Make the changes you want to contribute.

5. **Commit Your Changes**: Commit your changes. Try to write a descriptive
   commit message.

   ```bash
   git commit -m "Add this feature"
   ```

6. **Push Your Changes**: Push your changes to your forked repository.

   ```bash
   git push origin branch-name
   ```

7. **Open a Pull Request**: Go to this detris repository and open a pull request
   from your forked repository to the `main` branch of hexagon/detris.

8. Success! Once your pull request has been submitted, it will be reviewed and
   accepted as soon as possible.

# Quiz Game

A browser-based, multiplayer quiz game. Currently needs a better name than 'Quiz Game'. Built using node.js, socket.io and express.

## Install

For production:

```
npm install --production
```

For testing:

```
npm install
```

## Run

```
npm start
```

and navigate to `http://localhost:3000` in a browser.

## Testing

Test suite built on mocha, chai and istanbul. To run tests:

```
npm test
```

To view the coverage report (on OS X):

```
npm run report
```

On another OS (or if that doesn't work), open `coverage/lcov-report/index.html` in a browser.

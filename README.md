# SotA Chess

*SotA Chess* is a chess game where almost any move the AI makes is valid.
<br>
Who needs rules anyway? 😏

### Why?

The current *"state of the art"* in the AI scene is AIs that, sometime, make mistakes that go against a defined set of rules.
<br>
In some contexts, we can't afford to allow the AI to break those rules. These include a game of chess, for example.

Sometimes these mistakes are pretty funny tho, hence why this project was created.

### Build & Run Instructions

Currently the game is in its prototype phase, it is missing the pawn promotion feature and the AI doesn't know when its king is in check, resulting in the game becoming unplayable the moment you check the AI's king.

If you want to run the game anyway, here are the steps

* Run `npm ci` in the *root* directory
* Build the project by running `npm run build`
* Set the `OPENAI_API_KEY` environment variable.
* Start the server by running `node server.js` from `/dist`

By default, the **UI** is accessible at `http://localhost:3000/`

**Settings** can be tweaked by editing `settings.json` within `/dist`. The settings file path can be specified by setting the `SETTINGS_PATH` environment variable.
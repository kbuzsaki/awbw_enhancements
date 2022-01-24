# AWBW Enhancements

"AWBW Enhancements" is a browser extension that adds some extra functionality to
[Advance Wars By Web](https://awbw.amarriner.com).

You can install it for Chrome and Microsoft Edge (and other Chromium-based browsers) 
[here](https://chrome.google.com/webstore/detail/awbw-helper/cnkhdcnafdfffpkbbbeghbdjkabhbkfi)
and for Firefox [here](https://addons.mozilla.org/en-US/firefox/addon/awbw-enhancements/).

Its current functionality includes:

1. Configurable keyboard shortcuts for replays.
2. Several quality of life improvements to the move planner ("Moveplanner Plus"), including:
    1. Movement range previews for the selected unit.
    2. Savestate "quick save" snapshots that let you snapshot and restore states without having to download a full savestate file.
    3. Automatic tracking of unit count, unit value, income, and funds in per-player panels, like on the game screen. This includes automatically deducting funds for unit builds and simulating income for future turns.
    4. Configurable opacity for the "action menu" and "build menu".
    5. Configurable keyboard shortcuts for toggling the damage calculator.
3. Fixes for certain bugs in the vanilla move planner. These include:
    1. The bug where the most recently moved unit sometimes displays as unmoved in the move planner.
    2. The bug where already-moved units sometimes do not unwait with the "Unwait All" button.
    3. The bug where the damage calculator cannot select units that were built on the move planner page.
    4. The visual bug where capture icons are displayed for infantry that have already finished capturing.
    5. The visual bug where black boat sprites break when a savestate is uploaded.

Please feel free to report bugs or request new features via a github issue or by contacting me (saltor#4306) in the AWBW discord :)

Here's an example of what the moveplanner looks like with AWBW Enhancements enabled:
![screenshot of moveplanner plus](docs/images/demo_screenshot_2.png)

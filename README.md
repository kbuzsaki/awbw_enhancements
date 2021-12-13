# AWBW Helper

"AWBW Helper" is a browser extension that adds some extra functionality to
[Advance Wars By Web](https://awbw.amarriner.com). It currently only supports Chrome.

Its current functionality includes:

1. Configurable keyboard shortcuts for replays.
2. Several quality of life improvements to the move planner ("Moveplanner Plus"), including:
    1. Automatic tracking of unit count, unit value, income, and funds in per-player panels, like on the game screen. This includes automatically deducting funds for unit builds and simulating income for future turns.
    2. Movement range previews for the selected unit.
    3. Savestate "quick save" snapshots that let you snapshot and restore states without having to download a full savestate file.
    4. Configurable opacity for the "action menu" and "build menu".
    5. Configurable keyboard shortcuts for toggling the damage calculator.
3. Fixes for certain bugs in the vanilla move planner. These include:
    1. The bug where the most recently moved unit sometimes displays as unmoved in the move planner.
    2. The bug where already-moved units sometimes do not unwait with the "Unwait All" button.
    3. The bug where the damage calculator cannot select units that were built on the move planner page.
    4. The visual bug where capture icons are displayed for infantry that have already finished capturing.
    5. The visual bug where black boat sprites break when a savestate is uploaded.

Feel free to request additonal functionality via a github issue or by contacting me (saltor) in the AWBW discord :)

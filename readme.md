## Rocket Ninja

A 2D platformer with a focus on enjoyable movement.  


## Play

https://rocket-ninja.netlify.app/


## Run locally

1. Download or clone the repo
2. Open a terminal and navigate to the root of the repo
3. Install npm
4. Install project dependencies with `npm install`
5. Start the dev server (with hot-reload) with `npm run dev`, OR
5. Compile a production release with `npm run build`


## TODO
- Should dash be always available, unlocked at a certain point, or refilled by pickup?
- Player should not be able to infinitely jump up wall
- Mobile support
  - All items should be responsive
  - Game control overlay
- Full screen
- Side doors
- Allow falling off map (sky-based maps)


## TODO: Future
- Easier maps
- Coyote timer for walljump
- Knockback
  - Use it to reach new areas?
- New player design / story
  - Increase player size
- Better colours
- Impact particles when jump & land
- Gibs on death
- Each tile should be a quarter of the current size
- Obstacles / enemies
  - Fast rocket
  - Block that falls
  - Block that moves
  - Enemy that walks and switches direction when hit wall
  - Enemy that can walk upside down, sideways etc
  - Bosses with smart AI
- Improve menu
  - Buttons should be rounded
  - Swipe or paginate to see more levels
    - https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-gridtable/
- Record best times
- Sounds:
  - Music
  - Hit ground
  - Laser
- Create accounts
  - Save progress to API
  - Save preferences
- Settings section
  - Controls
  - After completing level, move to next or return to menu?
  - After death, restart level or return to menu?
  - Music & SFX volume
- Persist health/time after changing map?
- Door color should match key color
- Release an executable
- Responsive music
- Allow multiple doors on one map
- Abilities / actions
  - Rocket
  - Shield (reflect?)
  - Stealth
  - Grenade
  - Grappling hook
  - EMP
  - Button to temporarily turn off turrets
  - Connect chain of lights / electricity to unlock new areas
  - Cannon (get inside it and fire yourself)
- Objectives
  - Destroy 3 bosses
- Animations:
  - Death
- Each map should have its own starting health
- Other fonts to try:
  - https://fonts.google.com/specimen/Gloria+Hallelujah
  - https://fonts.google.com/specimen/Annie+Use+Your+Telescope
  - https://fonts.google.com/specimen/Londrina+Shadow
- Store user control preferences
- System to collect feedback
- Controller support https://blog.khutchins.com/posts/phaser-3-inputs-2/

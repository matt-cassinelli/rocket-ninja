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


## Design notes

I've tried to use OOP, although sometimes objects need access to the global state.  
Where possible, complex code has been seperated into its own classes/files/methods for cohesion.


## TODO
- Dash / double-jump
  - Shorter normal jump
- Fast rocket
- Be more forgiving - player intention matters more than mechanical skill
  - Coyote timer
  - Smaller spikes
  - Level 3 and 4 are too hard for beginners
- Better colours
- Player should not be able to infinitely jump up wall


## TODO: Future
- Block that falls
- Block that moves
- Enemy that walks and switches direction when hit wall
- Enemy that can walk upside down, sideways etc
- Mobile
  - All items should be responsive
  - Game control overlay
- Improve menu
  - Buttons should be rounded
  - Swipe or paginate to see more levels
    - https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-gridtable/
- Record best times
- Sounds:
  - Wallslide
  - Music
  - Enter door
  - Hit ground
- Create accounts
  - Save progress to API
- Settings section
  - After completing level, move to next or return to menu?
  - After death, restart level or return to menu?
- Migrate to Matter Physics
- Timer instead of health?
- Sounds
- Music
- Persist health/time after changing map?
- Sloped surfaces
- Full screen
- Knockback
  - Use knockback to reach areas
- Side doors
- Door color should match key color
- Release an executable
- Responsive music
- Bosses / AI
- Allow multiple doors on one map
- Raycaster seems to sensitive
- Items:
  - Rocket
  - Shield
  - Grenade
  - Grappling hook
  - EMP
- Animations:
  - Falling
  - Wallslide
  - Waiting
  - Death
- Wall slide should be faster
- Wall jump seems hard for beginners
- Allow falling off map (sky-based maps)
- Each map should have its own starting health
- Other fonts to try:
  - https://fonts.google.com/specimen/Gloria+Hallelujah
  - https://fonts.google.com/specimen/Annie+Use+Your+Telescope
  - https://fonts.google.com/specimen/Londrina+Shadow

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
- Menu / level select
  - Store progress (disable levels not reached yet)
  - Return to menu button (& ESC)
  - After complete level, move to next or return to menu? Or configure in settings?
  - After death, restart level or return to menu? Or configure in settings?
  - Buttons should be rounded
  - Make responsive to device size
  - Swipe / paginate to see more levels
    - https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-gridtable/
- Store best times
- Sounds:
  - Wallslide
  - Music
  - Enter door
  - Hit ground
- After death, should start back at same level.
- Level 3 and 4 are too hard for beginners
- Better colours
- Animations:
  - Falling
  - Death
- Player should not be able to infinitely jump up wall
- Wall slide should be faster
- Wall jump seems hard for beginners
- Allow falling off map (sky-based maps)



## TODO: Future
- Create accounts
  - Save level progress to API
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

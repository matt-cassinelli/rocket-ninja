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
- Take damage if fall hard
- Persist health/time after changing map
- Player should not be able to infinitely jump up wall
- Sounds
- Music
- Falling animation
- Wall slide should be faster
- Wall jump seems hard for beginners


## TODO: Future
- Sloped surfaces
- Knockback
  - Use knockback to reach areas
- When turret sees player, it moves and plays sound
- Animation on death
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
- Win screen
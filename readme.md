## Rocket Ninja

A 2D platformer with a focus on enjoyable movement.

Dodge rockets and reach the door before your time runs out!


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

I've tried to use OOP, although some of Phaser 3's methods are not the cleanest to work with.

Where possible, complex code has been seperated into its own classes/files/methods in order to improve readability.

To wrap your head around Phaser-specific things such as *Scenes* I would recommend reading their documentation.


## TODO
- Spikes
- Keep player's health after changing level
- Improve maps
- Player should not be able to hold jump
- Win screen
- Sounds
- Music
- Falling animation
- Take damage if fall hard


## TODO: Future
- Sloped surfaces
- Weapons:
  - Rocket
  - Shield
  - Grenade
  - Grappling hook
  - EMP
- Knockback
- Use knockback to reach areas
- When turret sees player, it moves and plays sound
- Animation on death
- Side doors
- Door color should match key color
- Release an executable
- Responsive music
- Bosses / AI

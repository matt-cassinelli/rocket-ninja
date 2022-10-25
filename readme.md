## Rocket Ninja

A 2D platformer with a focus on enjoyable movement.

Dodge rockets and reach the door before your time runs out!


## Play

Option 1: https://rocket-ninja.netlify.app/

Option 2: (executable coming soon)


## Run locally

1. Download or clone the repo
2. Open a terminal and navigate to the root of the repo
3. Install npm
4. Install project dependencies with `npm install`
5. Start the dev server (with hot-reload) with `npm run start`, OR
5. Compile a production release with `npm run build`


## Design notes

I've tried to use OOP, although some of Phaser 3's methods are not the cleanest to work with.

Where possible, complex code has been seperated into its own classes/files/methods in order to improve readability.

To wrap your head around Phaser-specific things such as *Scenes* I would recommend reading their documentation.

When the code is built, the "parcel-plugin-static-files-copy" script copies files from `./static` into `./dist`.
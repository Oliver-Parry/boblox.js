<h4 align="center">A Node.js module for interacting with the Roblox API.</h4>

<p align="center">
  <a href="#about">About</a> •
  <a href="#prerequisites">Requirements</a> •
  <a href="#installation">Installation</a> •
  <a href="#documentation">Docs</a> •
  <a href="">Examples</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## About

Boblox.js is a JavaScript module for interacting with the Roblox API and is designed for usage with Node.js.
It was made and is maintained as a passion project to make it easier to use the API.

Boblox.js allows you to do things you would normally do on the Roblox website through Node.js.
You can use boblox.js along with HttpService to create scripts that interact with the website.
This creates limitless possibilities of how you could use this module, some being connecting Discord with Roblox, or a Roblox game with the website.
If you're looking for more information on how to create something like this, feel free to read over our files.

## Requirements

- [**node.js**](https://nodejs.org/en/download/current/)

## Installation

With node.js installed simply run: 
```bash
# Run this to install boblox.js globally so you can use it anywhere.
$ npm install boblox.js -g
```
    
### Getting your cookie (Google Chrome):
1. Open any Roblox page and login
2. (Windows) -> Press `F12` on your keyboard
   (Mac) -> Press `fn + F12` on your keyboard
3. Click `Application`
4. Find `.ROBLOSECURITY`. Copy its contents, which will start with: `_|WARNING:-DO`
5. Put this full token, *including* the warning when starting noblox.js in the `mainCookie` or `requestCookie` parameters
    
### Example
```js
const bobloxJS = require('boblox.js');
const boblox = new bobloxJS({
    'mainCookie': 'COOKIE_HERE', // Used for non web scraping or repetitive tasks (You can customise which cookie is used for which methods)
    'requestCookie': 'COOKIE_HERE' // Used for repetitive GET requests
});

(async () => {
    await boblox.init() // Login and do a few other important actions before starting
})()
```
> Note: `requestCookie` will be set to `mainCookie` if not provided.

## Common issues
### CSRF
Roblox often changes the methods of obtaining CSRF tokens to combat malicious uses of their API.
Unfortunately, boblox.js may be down at times as CSRF tokens are vital to the module and Roblox doesn't always notify developers about changes to it.


### Cookie expiration
Roblox authentication cookies expire every time you sign in or out of your account.
To get around this, I advise using a bot account you sign into on an alternate browser.
With some projects this will not be possible for people, so just be aware that your cookies may reset.

## Credits

* [Oli](https://github.com/Oliver-Parry) - I did it all ¯\\_(ツ)_/¯

## License

MIT

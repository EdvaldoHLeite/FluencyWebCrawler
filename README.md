## Description
Web crawler to download material grade files (pdf, audio) from the english course by Fluency Academy.

## Puppeteer lib
It was used the puppeteer (browser headless) for cromium and puppeteer-core (on personal web browser). Using only puppeteer is just for running the commands without visualization is happening. And puppeteer-core is just to see all web page interaction.

The script use the puppeteer-core to visualize all interaction and the same time configurated to open in the personal browser, this is important to do login only a first time.

## How to use

### Open personal browser on remotely mode
##### It is important that browser is opened remotely to be accessed by the puppeteer-core. Then run the command below

*"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222*

***Obs.: the file path between comma is the path to Google Chrome***

### For node starting

*npm install*

*npm start*





/* const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const os = require('os'); */
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import os from 'os';

// limit on number of simultaneously downloads
// const pLimit = require('p-limit');
import pLimit from 'p-limit';
const limit = pLimit(1);


//*********************************************************** WAIT !!!!!!!!!!!!!!!!!!!!!!!!!!!  */
// open remotely the google chrome 
// before this close all chrome tabs
// "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222
//*********************************************************** WAIT !!!!!!!!!!!!!!!!!!!!!!!!!!!  */


(async () => {
	// Launch the browser
	// puppeteer-core usa connect ao inves de launch
	const browser = await puppeteer.connect({
		// usando protocolo ipv6 ao inves do ipv4 com localhost
		browserURL: 'http://127.0.0.1:9222',
		// executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Replace with your Chrome path
		headless: false, // Disable headless mode so you can see the browser
		slowMo: 50
	});
	const page = await browser.newPage();
	/*
	// login
	// Navigate to the website
	await page.goto('https://corporate.fluencyacademy.io/login'); // Replace with the target site

	await page.type('input[id="member_email"]', 'email@email.com');
	await page.type('input[id="member_password"]', 'password');
	await page.click('input[name="commit"]');	
	*/

	/* library
	await page.goto('https://corporate.fluencyacademy.io/library');
	
	// Get the current URL
	const currentUrl = page.url();
	// Verify if the current URL is the expected one
	if (currentUrl === 'https://corporate.fluencyacademy.io/library') {
		console.log('correct page');
	} else {
		console.log('wrong page');
	}
	
	// click on japanese course
	await page.click(
		'a[href="https://corporate.fluencyacademy.io/products/japones"]'
	);
	*/

	// const initial_page = "https://corporate.fluencyacademy.io/products/japones/categories/2148198641/posts/2150027457";
	const initial_page = "https://corporate.fluencyacademy.io/products/japones/categories/2148198759/posts/2152207663";
	let currentPage = initial_page;
	let currentPageSubTitle = "";
	const final_page_title = "FTD #24";

	const downloadLinkFromPage = async () => {
		// Wait for the page to load
		await page.waitForSelector('a.link'); // Wait for the download links to appear

		// search for html <a> elements and with class link
		const downloadLinks = await page.$$eval('a.link', links =>
			links.map((link) => {
				// link with pdf, aula and 1x in its names
				if (
					link.href &&
					(link.href.slice(link.href.length - 3, link.href.length) === "pdf" ||
						link.href.slice(link.href.length - 8, link.href.length) === "aula-mp3" ||
						link.href.slice(link.href.length - 6, link.href.length) === "1x-mp3" ||
						link.href.slice(link.href.length - 3, link.href.length) === "zip"
					))
					return link.href;
			}
			)
		); // Adjust selector

		let uniqueLinks = [];
		downloadLinks.map((link) => {
			if (link && !uniqueLinks.includes(link))
				uniqueLinks.push(link);
		});

		// name of unit to perform the search
		let className = "sub-title";
		const unit = await page.evaluate((className) => {
			const hElementTitle = document.querySelector(`h1.${className}, h2.${className}, h3.${className}, h4.${className}, h5.${className}, h6.${className}`);
			return [hElementTitle ? hElementTitle.textContent.trim() : null, hElementTitle.textContent];
		}, className);

		currentPageSubTitle = unit[1];
		const folder = path.join(os.homedir(), "Downloads", "fluency-download", unit[0].replaceAll(" ", "-"));

		if (!fs.existsSync(folder)) {
			// Create the folder if it does not exist
			fs.mkdirSync(folder, { recursive: true });
		}

		async function recursiveDownloadFile(links) {
			// Set download behavior to save files to a specific directory
			const downloadPath = path.resolve(folder);
			await page._client().send('Page.setDownloadBehavior', {
				behavior: 'allow',
				downloadPath: downloadPath
			});

			const link = links[0];
			const remainingLinks = links.slice(1, links.length - 1);

			const continueAfterCrash = async (downloadLink) => {
				// const isDownloadCompleted = await checkDownloadComplete(filePath);
				if (links.length > 1) {
					setTimeout(() => {
						if (downloadLink) {
							downloadLink.finally(() => {
								recursiveDownloadFile(remainingLinks);
							});
						} else {
							recursiveDownloadFile(remainingLinks);
						}
					}, 30000);
				}
			}

			try {
				const downloadLink = await page.goto(link);
				continueAfterCrash(downloadLink);
			} catch {
				continueAfterCrash();
			}
		}
		recursiveDownloadFile(uniqueLinks);
	}

	// run through each page to waiting for the completed downloads
	async function gotoPageRecursiveDownload () {
		if (currentPageSubTitle.trim() !== final_page_title.trim()) {
			await page.goto(currentPage);
			const completedDownloads = await downloadLinkFromPage();

			// it certainly on current page
			// await page.goto(currentPage);
			await page.waitForSelector('a.next_btn'); // Wait for the download links to appear
			const nextPage = await page.$$eval('a.next_btn', links => links.map((link) => link.href));
			// await page.goto(nextPage[0]);
			currentPage = nextPage[0];

			completedDownloads.finally(() => {
				gotoPageRecursiveDownload();
			});
		}
	}
	gotoPageRecursiveDownload();

	/* while (currentPageSubTitle.trim() !== final_page_title.trim()) {
		await page.goto(currentPage);
		await downloadLinkFromPage();

		// it certainly on current page
		// await page.goto(currentPage);
		await page.waitForSelector('a.next_btn'); // Wait for the download links to appear
		const nextPage = await page.$$eval('a.next_btn', links => links.map((link) => link.href));
		// await page.goto(nextPage[0]);
		currentPage = nextPage[0];
	} */

	// Close the browser
	// await browser.close();
})();
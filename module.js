const axios = require("axios").default;
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

class robloxAPI {
    // Constructor
    constructor({mainCookie = undefined, requestCookie = mainCookie, maxSpending = 20000, maxPercentage = 67.5}) {
        if (typeof(mainCookie) !== 'string') return TypeError("Invalid cookie provided for mainCookie");

        this.mainCookie = mainCookie;
        this.requestCookie = requestCookie;
        this.maxSpending = maxSpending;
        this.maxPercentage = maxPercentage;

        this.axios = axios;
        this.cheerio = cheerio;
        this.puppeteer = puppeteer;
    }

    async init() {
        this.mainCookieUserInfo = await this.getCurrentUser(this.mainCookie);
        this.requestCookieUserInfo = await this.getCurrentUser(this.requestCookie);

        this.browser = await puppeteer.launch({'args': ['--no-sandbox']});
        this.page = (await this.browser.pages())[0];
    }

    /**
     * @returns {Promise<string>} x-csrf-token
     */
    async getXCSRFToken(cookie = this.mainCookie) {
        try {
            await this.axios.request({
                'method': 'POST',
                'url': 'https://auth.roblox.com/',
                'headers': {
                    'Cookie': `.ROBLOSECURITY=${cookie};` 
                }
            });
        } catch (err) {
            return err['response']['headers']['x-csrf-token'];
        };
    }

    /**
     * @returns {Promise<{IsAnyBuildersClubMember: boolean, IsPremium: boolean, RobuxBalance: number, ThumbnailUrl: string, UserID: number, UserName: string}>} User info
    */
    async getCurrentUser(cookie = this.mainCookie) {
        const response = await this.axios.request({
            'method': 'GET',
            'url': 'https://www.roblox.com/mobileapi/userinfo',
            'headers': {
                'Cookie': `.ROBLOSECURITY=${cookie};` 
            }
        });

        if (response.status == 200) {
            return response['data'];
        } else {
            return Error("getCurrentUser request failed.")
        }
    }

    /**
     * @returns {Promise<number>} Amount of robux
     */
    async getRobuxAmount(cookie = this.mainCookie) {
        const response = await this.axios.request({
            'method': 'GET',
            'url': `https://economy.roblox.com/v1/users/${(this.mainCookie === cookie ? this.mainCookieUserInfo : this.requestCookieUserInfo).UserID}/currency`,
            'headers': {
                'Cookie': `.ROBLOSECURITY=${cookie};` 
            }
        });

        if (response.status == 200) {
            return response['data']['robux'];
        } else {
            return Error("getRobuxAmount request failed.")
        }
    }

    /**
     * @returns {Promise<[{userAssetId: number, seller: {id: number, type: "User", name: string}, price: number, serialNumber: number]>}
     */
    async getResaleData(assetId, cookie = this.requestCookie) {
        const response = await this.axios.request({
            'method': 'GET',
            'url': `https://economy.roblox.com/v1/assets/${assetId}/resellers?cursor=&limit=100}/currency`,
            'headers': {
                'Cookie': `.ROBLOSECURITY=${cookie};` 
            }
        });

        if (response.status == 200) {
            return response['data']['data'];
        } else {
            return Error("getRobuxAmount request failed.")
        }
    }

    async getRecentAveragePrice(assetId, cookie = this.requestCookie) {
        const response = await this.axios.request({
            'method': 'GET',
            'url': `https://economy.roblox.com/v1/assets/${assetId}/resale-data`,
            'headers': {
                'Cookie': `.ROBLOSECURITY=${cookie};` 
            }
        });

        if (response.status == 200) {
            return response['data']['recentAveragePrice'];
        } else {
            return Error("getRobuxAmount request failed.")
        }
    }

    async buyAsset(assetId, expectedPrice, cookie = this.mainCookie) {
        const xcsrfToken = await this.getXCSRFToken(cookie);
        /*
        const html = (await this.axios.request({
            'method': 'GET',
            'url': `https://www.roblox.com/catalog/${assetId}`,
            'headers': {
                //'Cookie': `.ROBLOSECURITY=${this.requestCookie};`
            }
        }))['data'];
        console.log(html)
        const $ = this.cheerio.load(html);
        const productId = $('#item-container');
        console.log(productId);
        */

        await this.page.goto(`https://www.roblox.com/catalog/${assetId}`);
        await this.page.setCookie({
            'name': '.ROBLOSECURITY',
            'value': this.requestCookie
        })
        await this.page.reload()
        
        const price = await this.page.$eval('button.PurchaseButton', element => element.getAttribute('data-expected-price'));
        const productId = await this.page.$eval('button.PurchaseButton', element => element.getAttribute('data-product-id'));
        const sellerId = await this.page.$eval('button.PurchaseButton', element => element.getAttribute('data-expected-seller-id'));
        const userAssetId = await this.page.$eval('button.PurchaseButton', element => element.getAttribute('data-userasset-id'));

        if (price != expectedPrice && expectedPrice != undefined) return Error("Actual price was not the expected price"); 

        const response = await this.axios.request({
            'method': 'POST',
            'url': `https://economy.roblox.com/v1/purchases/products/${productId}`,
            'headers': {
                'Cookie': `.ROBLOSECURITY=${cookie}`,
                'x-csrf-token': xcsrfToken,
                'Content-Type': 'application/json; charset=utf-8'
            },
            'data': {
                "expectedCurrency": 1,
                "expectedPrice": price,
                "expectedSellerId": sellerId,
                "userAssetId": userAssetId
            }
        });

        console.log(response);
        return {
            price: price,
            assetId: assetId,
            userAssetId: userAssetId
        };
    }

    async sellAsset(assetId, userAssetId, price, cookie = this.mainCookie) {
        const xcsrfToken = await this.getXCSRFToken(cookie);
        const response = await axios.default.request({
            url: `https://www.roblox.com/asset/toggle-sale`,
            method: "POST",
            headers: {
                'Cookie': `.ROBLOSECURITY=${cookie};`,
                "x-csrf-token": xcsrfToken,
                "Content-Type": 'application/json; charset=utf-8'
            },
            data: {
                "assetId": assetId,
                "userAssetId": userAssetId,
                "price": price,
                "sell": true
            }
        });
        console.log(response);
    }
}

module.exports = robloxAPI
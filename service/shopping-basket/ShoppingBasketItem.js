export class ShoppingBasketItem {
    constructor(articleID, articleName,articleBrand, articlePrice,imageURL,articleAvailability,articleAmount,itemNumber,articleQueryParameter) {
        this.articleID = articleID;
        this.articleName = articleName;
        this.articleBrand = articleBrand;
        this.articlePrice = articlePrice;
        this.imageURL = imageURL;
        this.articleAvailability = articleAvailability;
        this.articleAmount = articleAmount;
        this.itemNumber = itemNumber;
        this.articlePriceSum = this.articlePrice * this.articleAmount;
        this.articleQueryParameter = articleQueryParameter;
    }

}

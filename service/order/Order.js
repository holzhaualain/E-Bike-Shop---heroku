import {Address} from "./Address";
import {ContactData} from "./ContactData";
import {DeliveryType} from "./DeliveryType";
import {PaymentType} from "./PaymentType";

export class Order  {
    constructor(shoppingBasket) {
        this.shoppingBasket = shoppingBasket;
        this.userID = null;
        this.orderDate = new Date();
        this.state = 'NEW';
        this.deliveryAddress = new Address();
        this.contactData = new ContactData();
        this.deliveryType = new DeliveryType();
        this.paymentType = new PaymentType();
    }
}
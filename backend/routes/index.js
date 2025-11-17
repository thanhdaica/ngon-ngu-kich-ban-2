import routerBooks from "./books.js";
import routerCategorys from "./categorys.js";
import routerUserbooks from "./userbooks.js";
import routerUsers from "./users.js";
import routerCarts from "./carts.js";
import routerOrders from "./orders.js";
import routerDashboard from "./dashboard.js";
import routerPayment from "./payments.js";
export default function router (app){
    app.use('/api/book', routerBooks);
    app.use('/api/category', routerCategorys);
    app.use('/api/userbook', routerUserbooks);
    app.use('/api/user', routerUsers);
    app.use('/api/cart', routerCarts);
    app.use('/api/order', routerOrders);
    app.use('/api/dashboard', routerDashboard);
    app.use('/api/payment', routerPayment);
}
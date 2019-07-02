# websql-shopping-compare
A complete personal HTML-JS SPA shopping helper using WebSQL.
I always wanted to write a shopping comparison app: a list of items I normally purchase at different stores with the ability to save the price per item per store so I can compare prices. My first attempt used LocalStorage but that was a failure.
This year I decided to try out WebSQL. Much better!

I am not a fan of Android App Development. Wrote this in HTML, CSS, FancyBox and Bootstrap.
I copied and pasted the directory to my phone/tablet. No need for a mobile http server, it runs in Google Chrome on the device by using file:///storage/emulated/0/shopping-compare/index.html

The user interface
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/1.jpeg)

List of stores and items you have added
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/2.jpeg)

Adding a new store
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/3.jpeg)

Adding a new item
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/4.jpeg)

Adding an item to the comparison (store+item+price)
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/5.jpeg)

Viewing how much an item costs at different stores
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/6.jpeg)

Since WebSQL data lives in the page in the browser, we use PHP to export it to cart.json
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/7.jpeg)

So in another browser, we import cart.json
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/8.jpeg)

Import progress dialog
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/9.jpeg)

About page
![Interface](https://raw.githubusercontent.com/wilwad/websql-shopping-compare/master/ui/10.jpeg)

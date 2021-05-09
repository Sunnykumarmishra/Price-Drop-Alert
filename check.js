const prompt = require('prompt-sync')();
const puppy=require("puppeteer");
//const cron =require("node-cron");

const nodemailer=require("nodemailer");



var name=prompt("what product you want ");//asking for product want to buy
var budget_price= prompt("enter your budget price ");//taking budgetprice

let x=0;
let y=0;
//let budget_price=0;
let minimun_price=0;

get_price();
var myvar1=setInterval(get_price, 20000); 
//trying to run at fix interval automatically  feel free to help
//20 sec as an example
//you cant set it on daily basis and deploy 
//on cloud to get notified about your product

async function get_price()
{
    
    price_amazon(name);//calling price_amazon function
    price_flipkart(name);//calling price_flipkart function
    com();

}
 
  async function price_flipkart(name)//fetching price from flipkart
  {
     
      let browser = await puppy.launch({
          headless: true,
          defaultViewport: false
  
      });
      let tabs=await browser.pages();
      let tab=tabs[0];
      await tab.goto(`https://www.flipkart.com/search?q=+${name}`);//url of product whose price is fetch from flipkart
      await tab.waitForSelector("._30jeq3._1_WHN1",{visible: true});
      let prices= await tab.$$("._30jeq3._1_WHN1");
      let price=prices[0];
      let rate= await tab.evaluate(function(ele){
          return ele.innerText;
      },price);
     
      rate=rate.substring(1);//removing rupee sign ₹
     
      
       y = parseFloat(rate.replace(/,/g, ''))//converting from string into float and removing comma
      
      await browser.close();
  }

async function price_amazon(name)//fetching price from amazon
{
   
    let browser = await puppy.launch({
        headless: true,
        defaultViewport: false

    });
    let tabs=await browser.pages();
    let tab=tabs[0];
    await tab.goto(`https://www.amazon.in/s?k=+${name}`);//url of product whose price is fetch from amazon
    await tab.waitForSelector(".a-price-whole",{visible: true});
    let prices= await tab.$$(".a-price-whole");
    let price=prices[0];
    let rate= await tab.evaluate(function(ele){
        return ele.innerText;
    },price);
     x = parseFloat(rate.replace(/,/g, ''))//converting from string into float and removing comma
    
     await browser.close();
 
    
}

//repeating untill price is not fetch
async function com(){
    var myvar=setInterval(alertFunc, 1000);
    function alertFunc() {
    
    if(x!=0&&y!=0)
    {
        //when both price is fetch calling function to compare price
        compare(x,y);
    }
    }
    function compare(x,y)
    {
        console.log(`amazon  = ${x}`);
        console.log(`flipkart=${y}`);
        clearInterval(myvar);//stoping set interval function
        if(x<y)
        {
            console.log("I would suggest to buy from amazon");
            minimun_price=x;
        }
        else
        {
            console.log("I would suggest to buy from flipkart");
            minimun_price=y;
        }
        
        console.log("we will notify you when product is in your budget");
        if(budget_price>=minimun_price)
        {
            clearInterval(myvar1); //to stop automation when product is in budget
            const transporter=nodemailer.createTransport({   //using email and pass to send eamil to notify
                service: 'gmail',
                auth:{
                    user:'checkernodemail@gmail.com',
                    pass:'NodeMail'
                }
            });

            var mailOption={
                from:'checkernodemail@gmail.com',//sender email
                to:'samsunnymishra@gmail.com',//reciever email
                subject:'price drop',//subject
                text: `your ${name} is under budget at ${minimun_price}`,
            };


            transporter.sendMail(mailOption,function(err,info){
                if(err)
                {
                    console.log(err);
                }
                else
                {
                    console.log('email sent');
                }
            });

        }



        // cron.schedule("* * * * * *",function(){//runing function using cronjob at 2 am daily
        //     get_price();//not working feel free to help
        // });
    }
}

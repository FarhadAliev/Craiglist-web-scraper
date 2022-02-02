const express=require('express');
const app=new express();
const bodyParser=require('body-parser');
const craigslist=require('node-craigslist');
const cors=require('cors');
const morgan=require('morgan');
const axios=require('axios');
const fetch = require('node-fetch');
const cheerio=require('cheerio');


require('dotenv').config();

const PORT=process.env.PORT || 3000;
const HOST=process.env.HOST;



app.use(bodyParser.json());
app.use(cors());
app.use(morgan('tiny'));


app.listen(PORT,HOST, async () => {
    console.log(`Server http://${HOST}:${PORT}/`);
});



 function getResults(body) {
     const $ = cheerio.load(body);
     const rows = $('li.result-row');
     const results = [];
     rows.each(async (index, element) => {
         const result = $(element);
         const title = result.find('.result-title').text();
         const price = $(result.find('.result-price').get(0)).text();
         const imageData = result.find('a.result-image').attr('data-ids');
         let images = [];
         if (imageData) {
             const parts = imageData.split(',');
             images = parts.map((id) => {
                 return `https://images.craigslist.org/${id.split(':')[1]}_300x300.jpg`;
             });
         };
         let hood=result.find('.result-hood').text();
             if(hood) {
                 hood=hood.match(/\((.*)\)/)[1];
             };
         // .result-title.hdrlnk
         let url = result.find('.result-title.hdrlnk').attr('href');
         results.push({
             title,
             price,
             images,
             hood,
             url
         })
     });
     return results;
 };


app.get('/search/:location/:search_term',(request, response) => {
    const {location, search_term} = request.params;
    const url = `https://${location}.craigslist.org/search/cta?query=${search_term}&postedToday=1`;

       fetch(url)
        .then(async docs => {
            let body = await docs.text();
            const results = getResults(body);
            response.json({
                results
            });
        }).catch((error)=>{
            console.log(error)
       })

});

app.use((request, response, next) => {
    const error = new Error('not found');
    response.status(404);
    next(error);
});

app.use((error, request, response, next) => {
    response.status(response.statusCode || 500);
    response.json({
        message: error.message
    });
});
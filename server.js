var Crawler = require("node-webcrawler");
var url = require('url');
let obj = {};
let totalPageFinished = 0;
const fs = require('fs');
var c = new Crawler({
    maxConnections : 10,
    // This will be called for each crawled page 
    callback : function (error, result, $) {
        // $ is Cheerio by default 
        //a lean implementation of core jQuery designed specifically for the server 
        if(error){
            console.log(error);
        }else{
            $('td[id*=play_]:nth-child(2)').each(function(){
                let a = $('small a:first-child',this)[0];
                
                let str = $(a).attr('href');
                let index = str.indexOf("?u=");
                str = str.substring(index + 3);
                let index2 = str.lastIndexOf('\/');
                str = str.substring(0, index2);
                let id = str;
                
                let nextTd = $(this).next();
                let title = $('>h4',nextTd).text();

                let text = $(nextTd).text();
                let genres = text.split('\n');
                let length = genres.length;
                genres = genres[length - 2];

                if(!obj[id]){
                    obj[id] = {};
                    obj[id].title = title;
                    obj[id].genres = [];
    
                    let index3 = text.lastIndexOf("Genres:");
                    text = text.substring(index3 + 8).split(' ');
                    for(let genre of text){
                        let index4 = genre.indexOf('\t');
                        if(index4 > 0){
                            genre = genre.substring(0,index4 - 1);
                        }
                        obj[id].genres.push(genre);
                    }
                }
                
            })
            
            totalPageFinished = totalPageFinished + 1;
        }
    }
});
 
// Queue just one URL, with default callback 
let urls = [];
for(let i = 1; i < 10; i++){
    c.queue('https://www.internet-radio.com/stations/classical/page' + i)
}

// let crawlFn = setTimeout(function (){
//     if(totalPageFinished < 9){
//         console.log("retry in 1 s");
//         crawlFn();
//     }else{

        
//     }
// },1000)

function crawling() {
    if(totalPageFinished < 9 ) {//we want it to match
        console.log('crawling is in progress');
        setTimeout(crawling, 1000);//wait 1000 millisecnds then recheck
        return;
    }else{
        let content = JSON.stringify(obj, null, 4);  
        console.log("total channel:" + Object.keys(obj).length)
        console.log("total page crawled:" + totalPageFinished);
        fs.writeFileSync('./data.json', content , 'utf-8'); 
        console.log("finished")
    }
}

crawling();



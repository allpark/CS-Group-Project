### READ ME FILE FOR PROGRAMMING PROJECT
## Week 5 (reading week):
     Allan and I agreed to make our final project an extension of the data visualisation case study. During this week, we started planning what our extensions would be. We came up with the idea to focus on real estate and more precisely, visualise the price of houses in the UK relative to their square footage. Our first thought was to create a graph with the y axis displaying the price of property and the x axis displaying the square footage of these properties. We found a website provided by the British government *1 which allowed us to download the data of house transactions, however I found a problem with this option. There were too many things to account for in this data: whether these houses were detached, semi-detached, terraced or a flat. There were other options such as whether these houses were new or old, whether these were freehold or leasehold properties, and whether the transaction method was ‘standard’ or ‘additional’. One of the most confusing things about this data option was that, if you wanted to have a data set displaying a total of 100 transactions, it wouldn’t show the price of 100 houses which has been bought over they years, but rather show around 60 houses which had the data of several transactions. What this means is that there would be one house which had been bought in 1999, then sold in 2005 and resold again in 2013.
     Our plan had been to collect housing prices for London, Cape Town and New York, however, after encountering these difficulties, we chose to abandon this project and find a data set which wasn’t so finnicky.

     We ended up agreeing to work on GDPs instead. I found a data set *2 which displayed the GDP of England from 1995 to 2019. And downloaded the data. 

## Week 6
     This week, Allan and I continued brainstorming ideas for our project. We considered compiling the data of economic information such as the interest rate, unemployment rate and population of multiple countries such as the US, England and China. This week, I was the driver and at this point, there was no video available for the extension project on the data visualisation information. Without the video, I worked through the original case study and tried to build around the old material in order to visualise the data set we had. However, this sadly didn’t bring any winnings. After my tries and failures, Allan and I switched roles and I started working on this READ ME file whilst he had a go at plotting the data on a line graph. 

## Week 7 
     During the week 7 lab, Edward notified us that the data visualisation project page had been updated to include a video of a compulsory extension on food consumption in the UK. Somehow there was some confusion with this task as there had not been any previous information provided regarding the video and compulsory tasks, however, I managed to complete the assignment that day. After this work had been completed, we agreed to focus on the sea level visualisation and left the GDP visualisation for a later date to consider whether we wanted to continue working on it or move onto more interesting projects. Allan and I decided to move onto other projects instead of completing the GDP visualisation because we noticed that it would end up being very similar to the compulsory extensions on food in the UK.

## Week 8
     Allan made a lot of progress with his project of visualising sea level rises. We agreed that I would do some research into tree maps to see if we could visualise energy consumption/other economic data with this kind of visualisation.

     Tree maps provide a hierarchal view of your data and makes it easy to spot patterns, such as which items are a store’s best sellers. The tree branches are represented with triangles and each sub-branch is shown as a smaller rectangle within another. A video which provided a good foundation for our understanding of tree maps was the video *3.
     Allan and I thought about visualising countries and their individual GDP data, which we realised may be a little finnicky, as if we did this, we would only be able to show GDPs for a single year at a time (without the graph becoming too cluttered). In hindsight, what we could have done was instead of showing GDPs, show the average annual GDP growth rate of countries. Another possibility would have been to show this growth rate for each year by providing multiple graphs (which could be selected by a drop-down button on the side of the screen).

     Although I understood the principles of tree maps and had a clear plan for what to do in order to program a tree map, I found it difficult to apply these ideas to the extension projects we had been provided in the case study. I compiled a data set of the green-house gas emissions (CO2 and CH4) and population levels of countries across the globe with the help of websites such as worldometer *4 and globalcarbonatlas *5.The intention of this data set was to construct a tree map similar to the photo referenced here *6. I was planning to assign certain countries such as China and Indonesia into their own arrays (in this case an array called Asia), which would then take the total emissions from the countries within Asia and display this data on the graph. 

     Allan and I then switched roles after I found difficulties in getting the ball rolling with the programming task. 
 
## Week 9 (now a reading week)
     In this week’s work, Allan and I took a look at the work he had done with the tree map and sea level projects and looked for any errors such as typos or bugs. Allan sent me a copy of his files and I ran the code on my laptop. We found that my computer displayed some issues that his hadn’t. A few issues were highlighted; The tree map visualisation wasn’t loading and the sea level visualisation wasn’t displaying the increase in sea levels properly, so when you changed the date on the slider, instead of seeing the sea mass of the earth clearly increase, instead I saw a change in the saturation of all of the globe. So, when I moved the time frame further into the future, the whole map provided would become more and more blue, instead of certain points of interest with an altitude close to the sea level. 

     The specific issues that Allan ran into whilst programming our visualisations were things like converting data values into the same units. For example, when comparing emissions, the of different countries in our tree map visualisation, some data values were in Megawatt hours and others were in Terawatt hours. What Allan did to solve this was convert the values in Megawatt hours into Terawatt hours. 
     One important thing that Allan did in order to successfully program our project was that he had to improve the modularity of the extensions we had been provided from the original case studies. He looked at existing code, highlighted what could be put into functions in order to make the program more readable and furthermore, easier to work with.
     For the tree mapping visualisation, Allan did a lot of research on how to implement the data into the program. He looked at different papers, such as *7 and methods for implementing tree mapping and made himself familiar with hierarchal data sets by taking a look at different examples online.


## Links:
     *1
          https://landregistry.data.gov.uk/app/ppd/?et%5B%5D=lrcommon%3Afreehold&et%5B%5D=lrcommon%3Aleasehold&limit=100&nb%5B%5D=true&nb%5B%5D=false&ptype%5B%5D=lrcommon%3Adetached&ptype%5B%5D=lrcommon%3Asemi-detached&ptype%5B%5D=lrcommon%3Aterraced&ptype%5B%5D=lrcommon%3Aflat-maisonette&tc%5B%5D=ppd%3AstandardPricePaidTransaction&town=London
     *2
          https://www.ons.gov.uk/economy/grossdomesticproductgdp/timeseries/ybha/pn2?referrer=search&searchTerm=ybha
     *3
          https://www.youtube.com/watch?v=QOVV71EbgBA
     *4
          https://www.worldometers.info/world-population/population-by-country/
     *5
          http://www.globalcarbonatlas.org/en/CO2-emissions
     *6
          https://www.google.com/search?tbs=sbi:AMhZZiuhEBpHeEo22N1Vs06eUd1vQD1Cgafoul_1GXE0GLIEac0xAOy3thcGpzVAnaJWOHy1NoMQlAq0kUojfw0FIpI30eK2PvyGG0NfWNpffnHypLb24G2e_1o6p-Y08-_18wNqmUM478EWbEWvItR6xe2vebymXMWvO6lZQytg2JM_1y9pd68-jA2c_1bqbjrJS350SPbyqZlb0XaAlnBI7NEFkHesBAnv37whcJ50PMP_1ykMAQhUZqLGFMNoLz-0KG-EezbPAmbu7OA7hhzkQ9Or-uL2-RmSPNl8mnPgqOo4QepALZ39C9rFNgjgHYKeCg4cWM0QaOeXfzP8ldfLQCCl9q-TGZIH5Zbg
     *7 
          https://link.springer.com/chapter/10.1007/978-3-7091-6783-0_4

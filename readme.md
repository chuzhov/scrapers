# The back-end part of the Scraper project:

It scraps customer-defined data and sends it to the front-end app. Since the
scraping operation could take a significant amount of time, all communications
between the server and front-end run through socket connections.

Even if the front-end app disconnects, the server saves data until the front-end
app reconnects.

The front-end app saves scraped data to an XLSX file locally on the user's disk.

Upcoming changes:

1. [ ] Useing TypeScript;
2. [x] Useing some DB to store data;
3. [ ]Comparing scrapped data versions to highlight changes;

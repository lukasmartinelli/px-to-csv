# Convert PC-Axis to CSV

Convert PC-Axis files to CSV files. This will store all the dimensions inside the PC-Axis cube
as a flat row. [What the heck is a PC-Axis file?](https://exversiondata.wordpress.com/2014/06/17/obscure-data-formats-px-files/)

## Run yourself

First install the required dependencies. You need a new Node version (`> 4.7`).

``bash
npm install
``

Now download a PC Axis file from your statistical data provider.

``bash
wget https://www.pxweb.bfs.admin.ch/DownloadFile.aspx?file=px-x-0102020000_402
``

Invoke the `index.js` file with the PX file and specify the output CSV file.

``bash
node index.js -i myfile.px -o myfile.csv
```

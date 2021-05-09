const fs = require("fs")
const pdf = require("pdf-parse")
let quotes = []

const normalise = (data) => {
    let formatted = []
    let chunk = ""
    for(let r = 0; r < data.length; r++) {
        if(!chunk) chunk = data[r]
        if((data[r+1] && data[r+1][0] != "\"") && (data[r+1] && data[r+1][0] != "”")) chunk += " " + data[r+1]
        else {
            formatted.push(chunk)
            chunk = ""
        }
    }
    return formatted
}

/**
 * 
 * @param {String} data 
 */
const formatQuotes = (data) => {
    let formatted = []
    const qArray = normalise(data.split("\n"))
    
    for(quote in qArray) {
        const q = qArray[quote]
        const fQuote = q.match(/("|”)(.+)("|”) (.+) (\w+\/\w+\/\w+)/)
        fQuote != null ? formatted.push(
            {
                quote: fQuote[2],
                author: fQuote[4].toLocaleLowerCase().replace("-",""),
                date: fQuote[5]
            }
        ) : null
    }

    return formatted
}

const rawData = fs.readFileSync("./quotes.pdf")
pdf(rawData).then(d => {
    fs.writeFileSync("./raw.txt",d.text.split("\n").join("\n\n"))
    console.log(`Läste ${d.numpages} sidor av quotes`)
    console.time("Tolkar quotes")
    const quotes = formatQuotes(d.text)
    console.timeEnd("Tolkar quotes")
    const { birthtime } = fs.statSync("./quotes.pdf")
    quotes.push({ fileCreated: birthtime, lastUpdated: new Date().toISOString() })
    fs.writeFileSync("./quotes.json",JSON.stringify(quotes, null, 2)) 
})
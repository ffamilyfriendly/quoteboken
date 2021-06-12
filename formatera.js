const fs = require("fs")
const pdf = require("pdf-parse")
const bl = require("./bl.json")
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
        if(fQuote && bl.includes(fQuote[2])) {

        }
        fQuote != null ? formatted.push(
            {
                quote: bl.includes(fQuote[2]) ? "denna quote är censurerad" : fQuote[2],
                author: fQuote[4].toLocaleLowerCase().replace("-",""),
                date: fQuote[5],
                ärFörHemsk: bl.includes(fQuote[2])
            }
        ) : null
    }

    return formatted
}


const concatenateRetardation = () => {
    return new Promise( async (resolve,reject) => {
        let data = { birthtime: "", data: "" }
        let files = fs.readdirSync("./")
        files = files.filter(f => f.endsWith(".pdf"))
        data.birthtime = fs.statSync(files[0]).birthtime

        console.log("kombinerar quoteböcker")
        for(let i = 0; i < files.length; i++) {
            console.log(`   ${files[i]}`)
            const inf = await pdf(fs.readFileSync(files[i]))
            console.log(`       sidor: ${inf.numpages}\n       skapad: ${fs.statSync(files[0]).birthtime}\n`)
            data.data += inf.text + "\n"
        }

        return resolve(data)
    })
}

const handleQuotes = async () => {
    const data = await concatenateRetardation()
    console.time("Tolkar quotes")
    const quotes = formatQuotes(data.data)
    console.timeEnd("Tolkar quotes")
    quotes.push({ fileCreated: data.birthtime, lastUpdated: new Date().toISOString() })
    fs.writeFileSync("./quotes.json",JSON.stringify(quotes, null, 2)) 
}

handleQuotes()
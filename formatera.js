const fs = require("fs")
const pdf = require("pdf-parse")
const bl = require("./bl.json")
const context = require("./context.json")
let quotes = []

const normalise = (data) => {
    let formatted = []
    let chunk = ""

    

    for(let r = 0; r < data.length; r++) {
        if(!chunk) chunk = data[r]
        if( (data[r+1] && data[r+1][0] != "\"") ) chunk += " " + data[r+1]
        else {
            formatted.push(chunk)
            chunk = ""
        }
    }
    return formatted
}

const secretVal = (s) => {
    let rv = 0;
    for(let char of s)
        rv += char.charCodeAt()
    return rv
}

const encrypt = (str) => {
    const secret = secretVal("secret")
    let rv = ""
    for(let char of str)
        rv += String.fromCharCode(char.charCodeAt() + secret)
    return rv
}

const decrypt = (str) => {
    const secret = secretVal("secret")
    let rv = ""
    for(let char of str)
        rv += String.fromCharCode(char.charCodeAt() - secret)
    return rv
}

/**
 * 
 * @param {String} data 
 */
const formatQuotes = (data, encr) => {
    let formatted = []
    const qArray = normalise(data.split("\n"))
    
    for(quote in qArray) {
        const q = qArray[quote]
        const fQuote = q.match(/("|”)(.+)("|”) (.+) (\w+\/\w+\/\w+)/)
        fQuote != null ? formatted.push(
            {
                id: quote,
                quote: bl.includes(fQuote[2]) ? encr ? encrypt("denna quote är censurerad") : "denna quote är censurerad" : encr ? encrypt(fQuote[2]) : fQuote[2],
                author: fQuote[4].toLocaleLowerCase().replace("-",""),
                date: fQuote[5],
                ärFörHemsk: bl.includes(fQuote[2]),
                context: context[quote] || null
            }
        ) : null
    }

    return formatted
}


const concatenateQuotes = () => {
    return new Promise( async (resolve,reject) => {
        let data = { birthtime: "", data: "" }
        let files = fs.readdirSync("./")
        files = files.filter(f => f.endsWith(".pdf"))
        data.birthtime = fs.statSync(files[0]).birthtime

        console.log("kombinerar quoteböcker")
        for(let i = 0; i < files.length; i++) {
            console.log(`   ${files[i]}`)
            const inf = await pdf(fs.readFileSync(files[i]))
            console.log(`       sidor: ${inf.numpages}\n       skapad: ${fs.statSync(files[i]).birthtime}\n`)
            data.data += inf.text + "\n"
        }

        console.log("🎉 formatering klar 🎉")

        return resolve(data)
    })
}

const handleQuotes = async () => {
    const data = await concatenateQuotes()
    console.time("Tolkar quotes")
    const reg = /”|“/gm
    const quotes = formatQuotes(data.data.replaceAll(reg, "\""), process.argv[2] ? true : false)
    console.timeEnd("Tolkar quotes")
    quotes.push({ fileCreated: data.birthtime, lastUpdated: new Date().toISOString(), encrypted: process.argv[2] ? true : false })
    const jsonData = JSON.stringify(quotes, 0, 2)
    fs.writeFileSync("./quotes.json", jsonData) 
}

handleQuotes()
let personer = {}
let quotes
let partyMode = false

const getNrWords = (person) => {
    const bengt = quotes.filter(q => q.author == person)
    const ord = {}
    for(quote in bengt) {
        const _ord = bengt[quote].quote.split(" ")
        for(let i = 0; i < _ord.length; i++) {
            if(!ord[_ord[i].toLowerCase()]) ord[_ord[i].toLowerCase()] = 0
            ord[_ord[i].toLowerCase()]++
        }
    }
    const oKeys = Object.keys(ord)
    oKeys.sort((a,b) => ord[b] - ord[a])
    const rObj = []
    for(let i = 0; i < 20; i++) {
        rObj.push({ord:oKeys[i], anv:ord[oKeys[i]]})
    }

    rObj.total = oKeys.length

    return rObj
}

const getFavWords = (p) => {
    const ord = getNrWords(p)
    let returnHTML = `<ol>`

    for(let i = 0; i < ord.length; i++) {
        if(!ord[i].ord) break
        returnHTML += `<li><b>${ord[i].ord}</b> som används ${ord[i].anv} gånger (${((ord[i].anv / ord.total) * 100).toFixed(2)}%)</li>`
    }

    returnHTML += `</ol>`

    return returnHTML
}

const randomHex = () => {
    let hexCode = "0123456789ABCDEF";
    let Color = "#";
    for (let i = 0; i < 6; i++)
         Color += hexCode[Math.floor(Math.random() * 16)];
    return Color
}

const toggleMode = () => {
    partyMode = !partyMode
    alert(`festläge är nu ${partyMode ? "på" : "av"}`)

    document.getElementById("person").classList = partyMode ? "party" : ""
}

const doGraph = () => {

    const handleClick = (ev,ae) => {
        var label = Object.keys(personer)[ae[0].index]
        location.href = `#${label}`
        console.log(label)
    }

    let ctx = document.getElementById("QPP").getContext("2d")
    let ch = new Chart(ctx, {
        type:"pie",
        data: {
            labels: Object.keys(personer),
            datasets: [{
                label:"# quotes",
                data: Object.keys(personer).map(o => personer[o]),
                backgroundColor: Object.keys(personer).map(o => randomHex())
            }],
        },
        options:{
            onClick: handleClick
        }
    })

    console.log(personer)
}

document.onscroll = (ev) => {
    yeetModal()
    const topbtn = document.getElementById("top_btn")
    const searchThing = document.getElementById("top_search")
    if(document.getElementById("QPP").getBoundingClientRect().y < window.scrollY) {
        topbtn.classList.add("scrolled")
        searchThing.classList.add("scrolled")
    } else { topbtn.classList = ""; searchThing.classList = "" }
}

const searchThing = (el) => {
    const sq = el.value.toLowerCase()
    const fl = quotes.filter(q => { return q.quote && (q.quote.includes(sq) || q.author.includes(sq)) })
    //scrollToTop(document.getElementById(fl[0].i).scrollIntoView())
    if(!fl[0]) return alert("fan ingen aning vad du babblar om")
    const theElem = document.getElementById(fl[0].i)
    theElem.scrollIntoView({
        behavior: "smooth",
        block: "center"
    })
    
    theElem.classList.add("targeted")
    setTimeout(() => theElem.classList.remove("targeted"), 1000 * 10)
}

const displayQuote = (q) => {
    console.log(q)
    document.querySelector("#modal button").style.display = "inherit"
    document.getElementById("modal").style.maxHeight = "100vh"
    document.getElementById("quote").innerText = q.quote
    document.getElementById("person").innerText = q.author[0].toLocaleUpperCase() + q.author.substr(1)
    document.getElementById("datum").innerText = q.date
    window.scrollTo(0,0)

    if(partyMode) document.getElementById("sContainer").style.display = "block"
}

const yeetModal = () => {
    document.querySelector("#modal button").style.display = "none"
    document.getElementById("sContainer").style.display = "none"
    document.getElementById("modal").style.maxHeight = "0"
    document.querySelector(".party")?.classList.remove("doShow")
}

const doShowQuote = () => {
    document.querySelector(".party").classList.add("doShow")
    document.getElementById("sContainer").style.display = "none"
}

const getRand = (p) => {
    let quote
    if(p) {
        let tList = quotes.filter(q => q.author == p)
        quote = tList[Math.floor(Math.random() * tList.length)]
    } else {
        quote = quotes[Math.floor(Math.random() * quotes.length)]
    }

    if(quote.ärFörHemsk && partyMode) {
        quote.quote = "CENSURERAD QUOTE - alla dricker!"
        quote.date = `denna shot till ära av ${quote.author}`
        quote.author = `?`
    } else if(quote.ärFörHemsk) {
        quote.quote = "Sorry, denna quote är för hemsk och har blivit censurerad"
        quote.author = "Kinesiska staten"
        quote.date = "04/06/1989"
    }

    displayQuote(quote)
}

const scrollToTop = (pos) => {
    window.scrollTo({
        top: pos || 0,
        left: 0,
        behavior: 'smooth'
      });
}

const formatText = (d) => {
    const dagar = ["söndagen", "måndagen", "tisdagen", "onsdagen", "torsdagen", "fredagen🍺", "lördagen"]
    const månader = ["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"]
    const getDayInText = (day) => {
        day = day - 1
        const first = [ "första", "andra", "tredje", "fjärde", "femte", "sjätte", "sjunde", "åttonde", "nionde" ]
        let res = ""

        if(day > 20) {
            const prefix = ["tjugo","trettio","fyrtio","femtio","sextio","sjuttio","åttio","nittio"]
            res += prefix[Math.floor(day / 10) - 2]
        }

        if(8 < day && day < 20) {
            const weirdfucks = ["tionde", "elfte", "tolfte", "trettonde", "fjortonde", "femtonde", "sextonde", "sjuttonde", "artonde", "nitonde", "tjugonde"]
            res = weirdfucks[day - 9]
        } else {
            res += first[day % 10]
        }

        return res
    } 
    const dejt = new Date(d)

    return `${dagar[dejt.getDay()]} den ${getDayInText(dejt.getDate())} ${månader[dejt.getMonth()]} ${dejt.getFullYear()}`
}

const doData = async () => {

    quotes = await (await fetch(`./quotes.json?t=${Date.now()}`)).json()
    const parent = document.getElementById("QBP")
    quotes.forEach(( q, index ) => {
        quotes[index].i = index
        // Detta är metadata och sista quoten, tolka ej som quote! 
        if(q.fileCreated) {
            const metaBox = document.getElementById("metabox")
            metaBox.innerHTML = `
                <ul>
                    <li><b>quotefilen skapad: </b> ${formatText(q.fileCreated)} </li>
                    <li><b>quotefilen tolkad: </b> ${formatText(q.lastUpdated)} </li>
                </ul>
            `
            return
        }

        if(!personer[q.author]) {
            personer[q.author] = quotes.filter(qq => qq.author == q.author).length
            parent.innerHTML += `<h3 id="${q.author}">${q.author} (${personer[q.author]} stycken motsvarande ${((personer[q.author]/quotes.length) * 100).toFixed(1)}%)</h3> <ul class="quoteList" id="${q.author}_lista"></ul> <h4>${q.author}'s favoritord</h4> ${getFavWords(q.author)} `
            if(personer[q.author] > 1) document.getElementById("buttonZone").innerHTML += `<button onclick='getRand("${q.author}")'>slumpmässig av ${q.author}</button>`
        }
        if(q.ärFörHemsk) return
        document.getElementById(`${q.author}_lista`).innerHTML += `<li id="${index}"><p>${q.quote}</p><small>${q.date}</small></li>`
    })
    doGraph()
}

const test = async () => {
    const quotes = await (await fetch("./quotes.json")).json()
    console.log(quotes)
}
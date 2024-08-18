
let selectedCanteen = 0;
let selectedDate = '';
let canteens = [];
const weekdays = [ "Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

/**
 * update menu html
 * @param data
 */
function showMenu(data) {
    let html = '';
    if (data.length === 0) {
        html += '<article class="card">' +
            '<p class="keine-angebote">Leider keine Angebote an diesem Tag.</p></article>';
    }
    data.forEach(function (spld) {

        html += '<article class="card">' +
            '<header><h2>' + spld.category + '</h2></header>' +
            '<img src="' + spld.image + '" alt="Foto des Angebots" class="splimg">' +
            '<p>' + spld.name + '<br><strong>';
        if (spld.prices.Studierende !== undefined) {
            html += '<span>Stud.: ' + formatPrice(spld.prices.Studierende) + ' € </span>';
        }
        if (spld.prices.Bedienstete !== undefined) {
            html += '<span>Bed.: ' + formatPrice(spld.prices.Bedienstete) + ' €</span>';
        }
        html += '</strong></p></article>';
    });
    document.getElementById('speiseplan').innerHTML = html;
    document.getElementById('spltitle').innerText =
            'Speiseplan ' + canteens[selectedCanteen] + ' vom ' + formatDate(selectedDate);
}

/**
 * Fetch menu data of given canteen and day from API
 */
function fetchMenu(mensaid, datum) {
    if (mensaid === 0) {
        document.getElementById('modalMensaAuswahl').checked = true;
    } else {

        if (datum === 'heute') {
            selectedDate = new Date().toISOString().substring(0,10);
            datum = selectedDate;
        } else if (datum === 'morgen') {
            let mdate = new Date();
            mdate.setDate(mdate.getDate() + 1);
            selectedDate = mdate.toISOString().substring(0,10);
            datum = selectedDate;
        }

        fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/' +
            mensaid + '/days/' + datum + '/meals')
            .then((response) => response.json())
            .then((data) => { showMenu(data); });
    }
}

/**
 * Fetch all available canteens from API
 */
function fetchCanteens() {
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens')
        .then((response) => response.json())
        .then((data) => {
            let html = '<option value="0">Bitte wähle eine Mensa!</option>';
            data.forEach((mensa) => {
                html += '<option value="' + mensa.id + '">' +
                    mensa.name + '</option>';
                canteens[mensa.id] = mensa.name;
            });
            document.getElementById('mensenselect').innerHTML = html;
        });
}

/**
 * Fetch all possible days of given canteen from API
 * @param mid
 */
function fetchAvailableDates(mid) {
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/'+ mid +'/days')
        .then((response) => response.json())
        .then((data) => {
            let html = '';
            data.forEach((day) => {
                html += '<option value="' + day.date + '">' +
                    formatDate(day.date) + '</option>';
            });
            document.getElementById('datumselect').innerHTML = html;
        });
}

/**
 * returns price of meal in German format
 * @param price
 * @returns {string}
 */
function formatPrice(price) {
    price = "" + price;
    let rs;
    let p = price.split(".");
    if (p.length === 1) {
        rs = p[0]+',00';
    } else {
        if (p[1].length === 1) {
            rs = p[0] + ',' + p[1] + '0';
        } else {
            rs = p[0] + ',' + p[1];
        }
    }
    return rs;
}

/**
 * returns date in German format
 * @param date
 * @returns {string}
 */
function formatDate(date) {
    let td = new Date(Date.parse(date));
    return weekdays[td.getDay()] + ', ' + td.getUTCDate() + '.' +
        (td.getUTCMonth() +1) + '.' + td.getUTCFullYear();
}

//Event handlers
document.getElementById('heute').addEventListener('click', () => { fetchMenu(selectedCanteen,'heute')});
document.getElementById('morgen').addEventListener('click', () => { fetchMenu(selectedCanteen, 'morgen')});

document.getElementById('savemensa').addEventListener('click', () => {
    let sel = document.getElementById('mensenselect');
    if (sel.value > 0) {
        selectedCanteen = sel.value;
        let expire = new Date(Date.now() + (1000 * 60 * 60 * 24 * 30 * 6));
        document.cookie = 'mensaid=' + selectedCanteen + ';path=/;SameSite=Lax;expires=' + expire.toUTCString();
        document.getElementById('spltitle').innerText = 'Speiseplan ' + sel.options[sel.selectedIndex].text;
        fetchMenu(selectedCanteen, selectedDate);
        document.getElementById('modalMensaAuswahl').checked = false;
    }
});

document.getElementById('savedatum').addEventListener('click', () => {
    let sel = document.getElementById('datumselect');
    if (sel.value !== '') {
        selectedDate = sel.value;
        fetchMenu(selectedCanteen, selectedDate);
        document.getElementById('modalDatumAuswahl').checked = false;
    }
});

//Escape closes Modals
window.addEventListener("keydown", (event) => {
    if (event.key === 'Escape') {
        let mods = document.querySelectorAll('.modal > [type=checkbox]');
        [].forEach.call(mods, function(mod){ mod.checked = false; });
    }
}, true);

//page loaded
addEventListener('DOMContentLoaded', () => {
    const cookieId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('mensaid='))
        ?.split('=')[1];
    if (cookieId !== undefined) {
        selectedCanteen = cookieId;
    }
    selectedDate = new Date().toISOString().substring(0,10);
    fetchCanteens();
    fetchAvailableDates(selectedCanteen);
    fetchMenu(selectedCanteen, selectedDate);
});

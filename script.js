
let mensaId = 0;
let spl = [];
spl['heute'] = [];
spl['morgen'] = [];

const mensaModal = new bootstrap.Modal('#mensaSelectModal', {
  keyboard: false
});

function formatPrice(price) {
    price = "" + price;
    let rs = "";
    let p = price.split(".");
    if (p.length == 1) {
        rs = p[0]+',00';
    } else {
        if (p[1].length == 1) {
            rs = p[0] + ',' + p[1] + '0';
        } else {
            rs = p[0] + ',' + p[1];
        }
    }
    return rs;
}

function setData(data, tag) {
    spl[tag] = data;
    if (tag === 'heute') {
        showSpeiseplan('heute');
    }
}

//Speiseplan anzeigen
function showSpeiseplan(tag) {
    let html = '';
    if (spl[tag].length == 0) {
        html += '<article class="card">' +
            '<p class="keine-angebote">Leider keine Angebote an diesem Tag.</p></article>';
    }
    spl[tag].forEach(function (spld) {

        html += '<div class="card">' +
            //'<header><h2>' + spld.category + '</h2></header>' +
            '<img src="' + spld.image + '" alt="Foto des Angebots" class="card-img-top">' +
            '<div class="card-body"><p class="card-text">' + spld.name + '<br><strong>';
        if (spld.prices.Studierende !== undefined) {
            html += '<span>Stud.: ' + formatPrice(spld.prices.Studierende) + ' € </span>';
        }
        if (spld.prices.Bedienstete !== undefined) {
            html += '<span>Bed.: ' + formatPrice(spld.prices.Bedienstete) + ' €</span>';
        }
        html += '</strong></p></div></div>';
    });
    document.getElementById('speiseplan').innerHTML = html;
}

//Speiseplan einer Mensa von heute und morgen abfragen
function fetchData(mensaid) {
	let tag = new Date();
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/' +
        mensaid + '/days/' + tag.toISOString().substr(0, 10) + '/meals')
        .then((response) => response.json())
        .then((data) => setData(data, 'heute'));

    tag.setDate(tag.getDate() + 1)
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/' +
        mensaid + '/days/' + tag.toISOString().substr(0, 10) + '/meals')
        .then((response) => response.json())
        .then((data) => setData(data, 'morgen'));
}

//Mensen abfragen
function fetchMensen(mId) {
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens')
        .then((response) => response.json())
        .then((data) => {
            let html = '<option value="0">Bitte wähle eine Mensa!</option>';
            data.forEach((mensa) => {
                if (mId == mensa.id) {
                    document.getElementById('spltitle').innerText =
                        'Speiseplan ' + mensa.name;
                }
                html += '<option value="' + mensa.id + '">' +
                    mensa.name + '</option>';
            });
            document.getElementById('mensenselect').innerHTML = html;
        });
}

//Speiseplan Buttons
document.getElementById('heute').addEventListener('click', (event) => {showSpeiseplan('heute')});
document.getElementById('morgen').addEventListener('click', (event) => {showSpeiseplan('morgen')});
document.getElementById('showMensaModal').addEventListener('click', (event) => {mensaModal.show()});

//Mensa gewählt
document.getElementById('savemensa').addEventListener('click', (event) => {
    let sel = document.getElementById('mensenselect');
    if (sel.value > 0) {
        mensaId = sel.value;
        let expire = new Date(Date.now() + (1000 * 60 * 60 * 24 * 30 * 6));
        document.cookie = 'mensaid=' + mensaId + ';path=/;SameSite=Lax;expires=' + expire.toUTCString();
        document.getElementById('spltitle').innerText = 'Speiseplan ' + sel.options[sel.selectedIndex].text;
        fetchData(mensaId);
   		mensaModal.hide();
    }
});

//Wenn Seite geladen, gehts los
addEventListener('DOMContentLoaded', (event) => {

    const cookieId = document.cookie
        .split('; ')
        .find((row) => row.startsWith('mensaid='))
        ?.split('=')[1];
    if (cookieId !== undefined) {
        mensaId = cookieId;
    }
    fetchMensen(mensaId);

    if (mensaId == 0) {
        document.getElementById('modalMensaAuswahl').checked = true;
    } else {
        fetchData(mensaId);
    }

});

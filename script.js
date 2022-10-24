
let spl = [];
spl['heute'] = [];
spl['morgen'] = [];

function setData(data, tag)
{
    spl[tag] = data;
    if (tag === 'heute') {
        showSpeiseplan('heute');
    }
}

function showSpeiseplan(tag)
{
    let html = '';
    if (spl[tag].length == 0) {
        html += '<article class="card">' +
            '<p class="keine-angebote">Leider keine Angebote an diesem Tag.</p></article>';
    }
    spl[tag].forEach(function (spld) {
        html += '<article class="card">' +
            '<header><h2>' + spld.category + '</h2></header>' +
            '<p>' + spld.name + '<br><strong>';
        if (spld.prices.Studierende !== undefined) {
            html += '<span>Studierende: ' + spld.prices.Studierende + ' € </span>';
        }
        if (spld.prices.Bedienstete !== undefined) {
            html += '<span>Bedienstete: ' + spld.prices.Bedienstete + ' €</span>';
        }
        html += '</strong></p></article>';
    });
    document.getElementById('speiseplan').innerHTML = html;
}

let tag = new Date();
fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/6/days/' +
    tag.toISOString().substr(0,10) + '/meals')
    .then((response) => response.json())
    .then((data) => setData(data, 'heute'));

tag.setDate(tag.getDate() + 1)
fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens/6/days/' +
    tag.toISOString().substr(0,10) + '/meals')
    .then((response) => response.json())
    .then((data) => setData(data, 'morgen'));

document.getElementById('heute').addEventListener('click', (event) => {showSpeiseplan('heute')});
document.getElementById('morgen').addEventListener('click', (event) => {showSpeiseplan('morgen')});

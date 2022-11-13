
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

function fetchMensen() {
    fetch('https://api.studentenwerk-dresden.de/openmensa/v2/canteens')
        .then((response) => response.json())
        .then((data) => {
            let html = '<option value="0">Bitte wähle eine Mensa!</option>';
            data.forEach((mensa) => {
                html += '<option value="' + mensa.id + '">' + mensa.name + '</option>';
            });
            document.getElementById('mensenselect').innerHTML = html;
        });
}
document.getElementById('heute').addEventListener('click', (event) => {showSpeiseplan('heute')});
document.getElementById('morgen').addEventListener('click', (event) => {showSpeiseplan('morgen')});

document.getElementById('savemensa').addEventListener('click', (event) => {
    document.getElementById('modal_1').checked = false;
    let sel = document.getElementById('mensenselect');
    document.getElementById('spltitle').innerText = 'Speiseplan ' + sel.options[sel.selectedIndex].text;
    fetchData(sel.value);
});

document.onkeydown = function(e){
    if (e.keyCode == 27) {
        var mods = document.querySelectorAll('.modal > [type=checkbox]');
        [].forEach.call(mods, function(mod){ mod.checked = false; });
    }
}

addEventListener('DOMContentLoaded', (event) => {
    fetchMensen()
});
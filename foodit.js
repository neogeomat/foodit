let $countrySelect = $('#countrySelect');

let $citiesList = {};
$citiesList['Germany'] = ["Erlangen","Hildesheim","Chemnitz","Dresden","Hamburg","Köln","Bremen","Herne","Leipzig","Kiel","Dortmund","Lübeck","Würzburg","Moers","Bonn","Heilbronn","Essen","Frankfurt am Main","Siegen","Neuss","Bergisch Gladbach","Braunschweig","Recklinghausen","Pinneberg","Wolfsburg","Trier","Reutlingen","Magdeburg","Salzgitter","Bottrop","Wiesbaden","Bielefeld","Erfurt","Aachen","Pforzheim","Krefeld","Gelsenkirchen","Duisburg","Osnabrück","Heidelberg","Mannheim",
"Mönchengladbach","Remscheid","Offenbach am Main","Solingen","Darmstadt","Jena","Wuppertal","Freiburg im Breisgau","Kaiserslautern","Kleve","Bochum","Koblenz","Berlin","Hagen","Paderborn","Mainz","Karlsruhe","Regensburg","Ludwigshafen am Rhein","Düsseldorf","Münster","Oldenburg","Gütersloh","Bremerhaven","Saarbrücken","Augsburg","Nürnberg","Mülheim an der Ruhr","Kassel","Fürth","Oberhausen","Cottbus - Chóśebuz","Hannover","Leverkusen","Halle (Saale)","Stuttgart","Göttingen","Hanau","Rostock","Potsdam","Ulm","München","Hamm","Ingolstadt","Neumünster"];

let $overpassUrl = 'https://overpass-api.de/api/interpreter?data=';
$countrySelect.change(function() {
    let $country = $countrySelect.val();
    let $citiesSelect = $('#citySelect');
    switch ($country) {
        case 'Germany':
            $citiesSelect.empty();
            $citiesList['Germany'].forEach(function(city) {
                $citiesSelect.append(`<option value="${city}">${city}</option>`);
            });
            break;
        case 'France':
            $citiesSelect.empty();
            $citiesList['France'].forEach(function(city) {
                $citiesSelect.append(`<option value="${city}">${city}</option>`);
            });
            break;
    }
});

let $citySelect = $('#citySelect');
$citySelect.change(function() {
    let $city = $citySelect.val();
    let $suburbSelect = $('#suburbSelect');
    let query = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(node[place="suburb"](area););out;`;
    let url = $overpassUrl + query;
    $.get(url, function(data) {
        console.log(data);
        data = data.split("\n");
        data.forEach(function(item) {
            item = item.split("@");
            $suburbSelect.append(`<option value="${item[0]}">${item[0]}</option>`);
        });
    });
});

let $suburbSelect = $('#suburbSelect');
$suburbSelect.change(function() {
    let $city = $citySelect.val();
    let $suburb = $suburbSelect.val();
    let $postcodeSelect = $('#postcodeSelect');
    let query = `[out:csv(name,::lat,::lon;false;'@')];area[name="${$city}"];(node[postal_code](area););out;`;
    let url = $overpassUrl + query;
    $.get(url, function(data) {
        console.log(data);
        data = data.split("\n");
        data.forEach(function(item) {
            item = item.split("@");
            $postcodeSelect.append(`<option value="${item[0]}">${item[0]}</option>`);
        });
    });
});

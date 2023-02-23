// Download "JPG feed" from the shared read-only Google Drive folder
//
// Refefences :
//   https://developers.google.com/drive/api/v3/reference/files/list?apix=true#try-it
//   https://medium.com/google-cloud/gapi-the-google-apis-client-library-for-browser-javascript-5896b12dbbd5
//   https://bretcameron.medium.com/how-to-use-the-google-drive-api-with-javascript-57a6cc9e5262
//
// + iframe is not supported byt gapi.drive (can't insert a drive UI with a simple iframe)

// Script is loaded after these DOM elements, cf index.html
var domtof = document.getElementById("photo:feed");
var domdbg = document.getElementById('photo:debug');
var domfly = document.getElementById('photo:autoFlyTo');

let tof = {};
tof.nextPageToken = '';


//-------------------------------------------------------
// GAPI connexion stuff, auth mode is API key (restricted, no upload/modify permitted) 
//
// ! Does not work if loaded with file://url protocol (gapi.client.init won't return)
//   so this page needs a HTTP server
//
// TODO: switch to ServiceAccount to see if there is a better allowed bandwidth  

// https://console.cloud.google.com/apis/credentials
const API_KEY = 'AIzaSyA1IFKmTOXEHiA5w9QHRNOR64pLTk2ZCSw';

function gapiLoaded() {
    console.log('gapi.load');
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    console.log('gapi.client.init');
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
    });
    console.log('gapi.client.init-ed');
    domdbg.innerHTML = 'initClient feeds';
    //  feedDrive();     No auto load, to spare GAPI usage
}

//------------------------------------------------------
// feed public JPG from google drive
// link them to the divmap via their geoloc


// GoogleDrive JPG file to HTML presentation in the divphoto
//
var numPhoto = 0;
function fileAdd(gf) {
    let n = ++numPhoto;
    let o = '';
    let t = '';
    try {
        const lat = gf.imageMediaMetadata.location.latitude;
        const lon = gf.imageMediaMetadata.location.longitude;
//      const tooltip = `'<img src="${gf.thumbnailLink}"><br><center>${gf.imageMediaMetadata.time}</center>'`;
        const tooltip = `'${gf.imageMediaMetadata.time}'`;
        o = ` onmouseover="flyToIf(this,${lat.toFixed(6)},${lon.toFixed(6)},${n})"`;
        t = `<br><center><button disabled="yes">${gf.imageMediaMetadata.time}</button></center>`;
    } catch { };
    r = '<hr>'
        + `<a href="${gf.webViewLink}" target="_blank" onmouseout="this.firstChild.firstChild.style.borderStyle='none';"${o}>`
        +   `<figure id="photo${n}">`
        +     `<img src="${gf.thumbnailLink}" alt="${gf.name}">`
        +     `<figcaption>${t}</figcaption>`
        +   '</figure>'
        + '</a>';
    return r;
}

// Center the map here
// ! Il semble etre un bug de passer un DOM Element a bindTooltip(), qui devient
//   alors partage et quand le tooltip est ferme, les deux Element sont clos
//   => Il faut le dupliquer
function flyToIf(img, lat, lon, ref) {
    console.log(`flyTo lat,lon=${lat},${lon} enabled=${domfly.checked} ref=${ref}`);
    if (domfly.checked) {
        if (typeof(ref) == 'number')
            ref = document.getElementById(`photo${ref}`).cloneNode(true);
        img.firstChild.firstChild.style.borderStyle = 'solid';  // 'ridge'
        mapFlyTo(lat, lon, ref);
    }
}

// Get next page of files
//
// TODO: if nextPageToken is '' and tof already filled then it's done and we shall not
//       load a copy
//       or else keep tof.files[], sort them, add map markers relations, link with IG feed 

async function feedDrive() {
    const who = 'feedDrive';
    console.log(`${who}: start`);

    //   https://developers.google.com/drive/api/v3/reference/files/list
    const fileSelection =
    {
        q: "'1O_tzaI6HPBCR9AlqRbQqzw4JqzZoqfOv' in parents",
        corpora: "user",
        trashed: false,
        pageSize: 4,
        pageToken: tof.nextPageToken,
        fields: 'nextPageToken,files(name,thumbnailLink,webViewLink,imageMediaMetadata)',
        orderBy: 'createdTime desc'  // Most recent first
    };

    let response;
    console.log('calling gapi.client.drive');
    try {
        response = await gapi.client.drive.files.list(fileSelection);
    } catch (err) {
        console.log(`Error: ${err}`);
        domdbg.innerText = err;
        return;
    }
    // Token for the next page
    tof.nextPageToken = response.result.nextPageToken;
    console.log(`${who} nextToken ${tof.nextPageToken}`);
    // Gotten files[]
    const files = response.result.files;
    if (!files || files.length == 0) {
        domdbg.innerText = 'No files found.';
        return;
    }
    console.log(`${who} got files[${files.length}]`);
    // console.log(JSON.stringify(files[0]));  // ... or use browser debugger (firefox=CTRL-SHIFT-K, breakpoint, ...)
    // Populate the HTML list
    domtof.innerHTML += files.reduce(
        (str, file) => `${str}${fileAdd(file)}`, '');
}


// User update request
function photoUpdate() {
    console.log('photoUpdate');
    feedDrive().catch(function handle(e) { domdbg.innerText = `catch1=${e}`; });
}


function main() {
    // To get the user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(loadMap, showError);
    } else {
        alert('The browser does NOT support geolocation.');
    };

    function loadMap(position) {
        // Map initial view
        const myMap = L.map('map').setView([position.coords.latitude, position.coords.longitude], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            minZoom: '12',
        }).addTo(myMap);

        // The markers are gonna be added in the addEventListener
        let group = L.layerGroup([]).addTo(myMap);

        // User's marker
        const userIcon = L.icon({
            iconUrl: './assets/userMarker.png',
            iconSize: [40,35],
            iconAnchor: [20, 13],
        });
        const marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: userIcon});
        marker.addTo(myMap).bindPopup('<p1><b>You are here</b></p1>').openPopup();


        // This will return the array of coordenates and names from the 5 stores
        async function places(business, userLatitude, userLongitude) {            
            let content = {};
            let stores = [];
            let names = [];

            let response = await fetch(`https://api.foursquare.com/v3/places/search?query=${business}&ll=${userLatitude}%2C${userLongitude}&limit=5`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: 'fsq3Ov+7egkgfOkAKVgs19WOkB8krz/nVTbVEA27oRNp52g='
                }
            }).then(obj => obj.json());

            // Manipulating a regular object (content.data), it's easier than manipulating an object from a Promise (response)
            content.data = response;
            locals = content.data.results;
            console.log(locals);
            
            for (let i = 0; i < locals.length; i++) {
                stores.push([locals[i].geocodes.main.latitude, locals[i].geocodes.main.longitude]);
                names.push(locals[i].name);
            };
            
            return [stores, names];
        };
        
        /* Making the buttom show the stores depending on the selection */
        let selection = document.getElementById('businesses');
        let buttom = document.getElementById('bttn');
        let opt; // This represents the "value" selected (HTML tag property)
        
        function getSelection(select) {
            let selectedOption;
            for (let i = 0; i < select.options.length; i++) {
                if (select.options[i].selected) {
                    selectedOption = select.options[i];
                }
            }
            return selectedOption;
        };
        
        // I had to make the callback async in order to get a regular array, and not another promise
        buttom.addEventListener('click', async function() {
            opt = getSelection(selection);
            let info = await places(opt.value, position.coords.latitude, position.coords.longitude);

            for (let i = 0; i < info.length - 1; i++) {
                for (let j = 0; j < info[i].length; j++) {
                    L.marker(info[i][j]).bindPopup(`${info[i + 1][j]}`).addTo(group);
                }
            };
        });
    };
    
    function showError(error) {
        if (error.PERMISSION_DENIED) {
            alert('The user has denied the request for geolocation.');
        }
    };
};

main();
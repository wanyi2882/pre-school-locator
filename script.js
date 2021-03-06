//Set coordinates of Draggable Marker
let currentCoordinates = []

//Search button function which shows the map page
document.querySelector("#page-one-search-btn").addEventListener('click', async function () {

    //User keys in a 6 digit postal code

    let searchTerms = document.querySelector("#page-one-postal-code").value;

    let isnum = /^\d+$/.test(searchTerms)

    if (searchTerms.length !== 6 || isnum == false) {
        //If user does not key in a 6 digit postal code
        alert("Please enter a 6 digit postal code")
    } else {
        //User enters 6 digit postal code
        let allPages = document.querySelectorAll('.page');
        for (let p of allPages) {
            p.classList.remove('show-page');
            p.classList.add('hidden-page');
        }

        //Show page two
        document.querySelector('#page-two').classList.add('show-page');

        //Search by postal code
        let response = await axios.get("https://geocode.xyz/" + searchTerms + "?json=1");
        let currentLat = response.data.latt;
        let currentLng = response.data.longt;
        currentCoordinates = [currentLat, currentLng];
        map.flyTo(currentCoordinates, 17);

        //Add location to the page 3 comparison page
        document.querySelector("#distance-compare-header").innerHTML = `
        Distance from ${response.data.standard.addresst} Singapore ${response.data.standard.postal}`

        //Set leaflet lat and lng of the drag marker
        let searchResultsCurrentCoordinates = L.latLng(currentCoordinates);

        //Popup for first search coordinates
        let popup = L.popup();
        popup.setLatLng(currentCoordinates);
        popup.setContent(`YOU ARE HERE! <br> YOU CAN DRAG ME ON THE MAP!`);
        popup.openOn(map);



        // Drag Marker
        let markerIcon = L.icon({
            iconUrl: '../images/parent-child-marker.jpeg',
            iconSize: [38, 38]
        })

        let marker = new L.marker(currentCoordinates, {
            draggable: 'true',
            icon: markerIcon
        });

        //Marker on Dragend event
        marker.on('dragend', async function (event) {

            //Clear existing markers in layer
            distance100ClusterLayer.clearLayers();
            distance500ClusterLayer.clearLayers();
            distance1000ClusterLayer.clearLayers();

            //Set new lat and lng when drag marker is dragged to a new position
            let marker = event.target;
            position = marker.getLatLng();
            currentCoordinates = [position.lat, position.lng];

            //Reverse geocode to get draggable marker address and postal code
            let response = await axios.get("https://geocode.xyz/" + currentCoordinates + "?json=1");

            //update location to the page 3 comparison page
            document.querySelector("#distance-compare-header").innerHTML = `
            Distance from ${response.data.staddress} Singapore ${response.data.postal}`

            marker.setLatLng(new L.LatLng(position.lat, position.lng), {
                draggable: 'true'
            });

            map.panTo(new L.LatLng(position.lat, position.lng))
            searchResultsCurrentCoordinates = new L.latLng(position.lat, position.lng);

            let searchResults = await merge();

            for (let x of searchResults) {

                //popup content
                let popupDiv = document.createElement("div");
                popupDiv.innerHTML = `<h6> ${x.centreName} </h6> <br> 
                ADDRESS: ${x.address} <br>
                SPARK CERTIFIED: ${x.sparkCertified} <br> 
                CONTACT US @ ${x.contact} <br>
                EMAIL ADDRESS: ${x.email} <br>
                WEBSITE: ${x.website}`

                let compareButton = document.createElement("button")
                compareButton.className = "add-to-compare-btn"
                compareButton.innerHTML = "Add to Compare"

                L.DomEvent.on(compareButton, 'click', () => {
                    if (choosenCentres.length < 1) {
                        choosenCentres.push(x.centreName);
                        choosenCentresCodes.push(x.centreCode);

                        document.querySelector("#preview-item-one").style.display = "block";

                        document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
                    } else if (choosenCentres.length < 2) {
                        choosenCentres.push(x.centreName);
                        choosenCentresCodes.push(x.centreCode);

                        document.querySelector("#preview-item-one").style.display = "block";

                        document.querySelector("#preview-item-two").style.display = "block";

                        document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
                        document.querySelector("#preview-item-two-name").innerHTML = choosenCentres[1];
                    } else {
                        alert("You can only add a max of 2 centres")
                    }
                })

                let popupContent = document.createElement("div")
                popupContent.appendChild(popupDiv)
                popupContent.appendChild(compareButton)


                let popupOptions = {
                    'minWidth': '0',
                    'maxWidth': '200',
                    'className': 'custom-popup'
                }

                //Distance markers
                if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.1) {
                    let markerIcon = L.icon({
                        iconUrl: '../images/100m-icon.png',
                        iconSize: [180, 180]
                    })

                    let marker = L.marker(x.latlng, {
                        icon: markerIcon
                    });
                    marker.addTo(distance100ClusterLayer).bindPopup(popupContent, popupOptions);

                } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.5) {
                    let markerIcon = L.icon({
                        iconUrl: '../images/500m-icon.png',
                        iconSize: [180, 180]
                    })

                    let marker = L.marker(x.latlng, {
                        icon: markerIcon
                    });
                    marker.addTo(distance500ClusterLayer).bindPopup(popupContent, popupOptions);

                } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 1) {
                    let markerIcon = L.icon({
                        iconUrl: '../images/1km-icon.png',
                        iconSize: [180, 180]
                    })

                    let marker = L.marker(x.latlng, {
                        icon: markerIcon
                    });
                    marker.addTo(distance1000ClusterLayer).bindPopup(popupContent, popupOptions);
                }

            }

        });
        map.addLayer(marker);

        //Call merge function

        let searchResults = await merge();

        for (let x of searchResults) {

            //popup content
            let popupDiv = document.createElement("div");
            popupDiv.innerHTML = `<h6> ${x.centreName} </h6> <br> 
            ADDRESS: ${x.address} <br>
            SPARK CERTIFIED: ${x.sparkCertified} <br> 
            CONTACT US @ ${x.contact} <br>
            EMAIL ADDRESS: ${x.email} <br>
            WEBSITE: ${x.website}`

            let compareButton = document.createElement("button")
            compareButton.className = "add-to-compare-btn"
            compareButton.innerHTML = "Add to Compare"

            L.DomEvent.on(compareButton, 'click', () => {
                if (choosenCentres.length < 1) {
                    choosenCentres.push(x.centreName);
                    choosenCentresCodes.push(x.centreCode);

                    document.querySelector("#preview-item-one").style.display = "block";

                    document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
                } else if (choosenCentres.length < 2) {
                    choosenCentres.push(x.centreName);
                    choosenCentresCodes.push(x.centreCode);

                    document.querySelector("#preview-item-one").style.display = "block";

                    document.querySelector("#preview-item-two").style.display = "block";

                    document.querySelector("#preview-item-one-name").innerHTML = choosenCentres[0];
                    document.querySelector("#preview-item-two-name").innerHTML = choosenCentres[1];
                } else {
                    alert("You can only add a max of 2 centres")
                }
            })

            let popupContent = document.createElement("div")
            popupContent.appendChild(popupDiv)
            popupContent.appendChild(compareButton)


            let popupOptions = {
                // 'minWidth': '0',
                // 'maxWidth': '250',
                'className': 'custom-popup'
            }

            //Add all Markers
            let allMarkerIcon = L.icon({
                iconUrl: '../images/main-01-icon.png',
                iconSize: [150, 150]
            })

            let allMarkers = L.marker(x.latlng, {
                icon: allMarkerIcon
            });

            allMarkers.addTo(baseClustersGroup).bindPopup(popupContent, popupOptions);

            //Distance markers
            if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.1) {
                let markerIcon = L.icon({
                    iconUrl: '../images/100m-icon.png',
                    iconSize: [180, 180]
                })

                let marker = L.marker(x.latlng, {
                    icon: markerIcon
                });
                marker.addTo(distance100ClusterLayer).bindPopup(popupContent, popupOptions);
            } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 0.5) {
                let markerIcon = L.icon({
                    iconUrl: '../images/500m-icon.png',
                    iconSize: [180, 180]
                })

                let marker = L.marker(x.latlng, {
                    icon: markerIcon
                });
                marker.addTo(distance500ClusterLayer).bindPopup(popupContent, popupOptions);
            } else if (searchResultsCurrentCoordinates.distanceTo(x.latlng) / 1000 < 1) {
                let markerIcon = L.icon({
                    iconUrl: '../images/1km-icon.png',
                    iconSize: [180, 180]
                })

                let marker = L.marker(x.latlng, {
                    icon: markerIcon
                });
                marker.addTo(distance1000ClusterLayer).bindPopup(popupContent, popupOptions);
            }

            //Spark Markers
            if (x.sparkCertified == "Yes") {
                let sparkIcon = L.icon({
                    iconUrl: '../images/spark-logo.jpeg',
                    iconSize: [35, 35]
                })

                L.marker(x.latlng, {
                    icon: sparkIcon
                }).addTo(sparkGroup).bindPopup(popupContent, popupOptions);
            }
        }

    }
})

//Create map layers and clusters
let sparkGroup = L.layerGroup();
let baseClustersGroup = L.markerClusterGroup();
let distance100ClusterLayer = L.markerClusterGroup();
let distance500ClusterLayer = L.markerClusterGroup();
let distance1000ClusterLayer = L.markerClusterGroup();

baseClustersGroup.addTo(map);

//create map controls
let baseLayers = {
    'All Centres': baseClustersGroup,
    'SPARK Certified': sparkGroup
}

let overlayLayer = {
    'Within 100m': distance100ClusterLayer,
    'From 100m - 500m': distance500ClusterLayer,
    'From 500m - 1Km': distance1000ClusterLayer
}

L.control.layers(baseLayers, overlayLayer).addTo(map)

//Buttons for layer control

document.querySelector("#filter-all-markers-btn").addEventListener("click", function () {
    if (map.hasLayer(baseClustersGroup)) {
        map.removeLayer(baseClustersGroup);
    } else {
        map.removeLayer(sparkGroup);
        map.addLayer(baseClustersGroup);
    }
})

document.querySelector("#filter-spark-layer-btn").addEventListener("click", function () {
    if (map.hasLayer(sparkGroup)) {
        map.removeLayer(sparkGroup);
    } else {
        map.addLayer(sparkGroup);
        map.removeLayer(baseClustersGroup);
    }
})

document.querySelector("#filter-within-100m-layer-btn").addEventListener("click", function () {
    if (map.hasLayer(distance100ClusterLayer)) {
        map.removeLayer(distance100ClusterLayer);
    } else {
        map.addLayer(distance100ClusterLayer);
        map.removeLayer(baseClustersGroup)
    }
})

document.querySelector("#filter-within-500m-layer-btn").addEventListener("click", function () {
    if (map.hasLayer(distance500ClusterLayer)) {
        map.removeLayer(distance500ClusterLayer);
    } else {
        map.addLayer(distance500ClusterLayer);
        map.removeLayer(baseClustersGroup)
    }
})

document.querySelector("#filter-within-1km-layer-btn").addEventListener("click", function () {
    if (map.hasLayer(distance1000ClusterLayer)) {
        map.removeLayer(distance1000ClusterLayer);
    } else {
        map.addLayer(distance1000ClusterLayer);
        map.removeLayer(baseClustersGroup)
    }
})

let choosenCentres = []
let choosenCentresCodes = []

//preview div remove buttons
document.querySelector("#remove-btn-one").addEventListener("click", function () {
    for (let i = 0; i < choosenCentres.length; i++) {
        if (choosenCentres[i] == document.querySelector("#preview-item-one-name").innerHTML) {
            document.querySelector("#preview-item-one").style.display = "none"
            document.querySelector("#preview-item-one-name").innerHTML = "";
            choosenCentres.splice(i, 1);
            choosenCentresCodes.splice(i, 1)


        }
    }
})

document.querySelector("#remove-btn-two").addEventListener("click", function () {
    for (let i = 0; i < choosenCentres.length; i++) {
        if (choosenCentres[i] == document.querySelector("#preview-item-two-name").innerHTML) {
            document.querySelector("#preview-item-two").style.display = "none"
            document.querySelector("#preview-item-two-name").innerHTML = "";
            choosenCentres.splice(i, 1);
            choosenCentresCodes.splice(i, 1)
        }
    }
})

//show comparision page when click on #compare-btn
document.querySelector("#compare-btn").addEventListener("click", async function () {

    if (choosenCentres.length < 2) {
        alert("Please add 2 centres for comparision")

    } else if (choosenCentres.length = 2) {
        let allPages = document.querySelectorAll('.page');
        for (let p of allPages) {
            p.classList.remove('show-page');
            p.classList.add('hidden-page');
        }

        //Show comparision page
        document.querySelector('#page-three').classList.add('show-page');

        //Comparison Page Table Function

        //Call merge function
        let compareTable = await merge();

        for (let i = 0; i < choosenCentresCodes.length; i++) {
            for (let x of compareTable) {
                if (choosenCentresCodes[i] == x.centreCode) {

                    //Centre name
                    document.querySelectorAll(".name-compare")[i].innerHTML = `${x.centreName} <br> ${x.address}`

                    //Spark certification
                    if (x.sparkCertified == "Yes") {
                        document.querySelectorAll(".spark-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".spark-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Distance
                    let searchTerms = document.querySelector("#page-one-postal-code").value;
                    document.querySelectorAll(".distance-compare")[i].innerHTML = `${(L.latLng(currentCoordinates).distanceTo(x.latlng)).toFixed(0)} Metres`

                    //Operating Hours
                    if (x.weekdayHours == "na") {
                        document.querySelectorAll(".weekday-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on their weekday operating hours`
                    } else {
                        document.querySelectorAll(".weekday-compare")[i].innerHTML = x.weekdayHours
                    }

                    //Saturday Operating Hours
                    if (x.saturdayHours == "na") {
                        document.querySelectorAll(".saturday-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on their Saturday operating hours`
                    } else {
                        document.querySelectorAll(".saturday-compare")[i].innerHTML = x.saturdayHours
                    }

                    //Infant Vacancy
                    if (x.infantVacancy == "na") {
                        document.querySelectorAll(".infant-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".infant-compare")[i].innerHTML = x.infantVacancy
                    }

                    //Playgroup Vacancy
                    if (x.playGroupVacancy == "na") {
                        document.querySelectorAll(".playgroup-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".playgroup-compare")[i].innerHTML = x.playGroupVacancy
                    }

                    //Pre-Nursery Vacancy
                    if (x.n1Vacancy == "na") {
                        document.querySelectorAll(".n1-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".n1-compare")[i].innerHTML = x.n1Vacancy
                    }

                    //Nursery Vacancy
                    if (x.n2Vacancy == "na") {
                        document.querySelectorAll(".n2-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".n2-compare")[i].innerHTML = x.n2Vacancy
                    }

                    //Kindergarden One Vacancy
                    if (x.k1Vacancy == "na") {
                        document.querySelectorAll(".k1-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".k1-compare")[i].innerHTML = x.k1Vacancy
                    }

                    //Kindergarden Two Vacancy
                    if (x.k2Vacancy == "na") {
                        document.querySelectorAll(".k2-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on vacancy`
                    } else {
                        document.querySelectorAll(".k2-compare")[i].innerHTML = x.k2Vacancy
                    }

                    //Halal
                    if (x.foodOffered.includes("with Certification from MUIS")) {
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else if (x.foodOffered.includes("without Certification from MUIS but from Halal Sources")) {
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `No Pork No Lard (without Certification from MUIS but from Halal Sources)`
                    } else if (x.foodOffered.includes("from Non-Halal Sources")) {
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `No Pork No Lard (from Non-Halal Sources)`
                    } else {
                        document.querySelectorAll(".halal-compare")[i].innerHTML = `Please contact the centre at ${x.contact} for more information on dietary offered`
                    }

                    //Vegeterian
                    if (x.foodOffered.includes("Vegetarian")) {
                        document.querySelectorAll(".vegeterian-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".vegeterian-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Beef
                    if (x.foodOffered.includes("with Beef")) {
                        document.querySelectorAll(".beef-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".beef-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Chinese
                    if (x.secondLanguages.includes("Chinese")) {
                        document.querySelectorAll(".chinese-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".chinese-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Malay
                    if (x.secondLanguages.includes("Malay")) {
                        document.querySelectorAll(".malay-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".malay-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                    //Tamil
                    if (x.secondLanguages.includes("Tamil")) {
                        document.querySelectorAll(".tamil-compare")[i].innerHTML = `<i class="far fa-check-circle"></i>`
                    } else {
                        document.querySelectorAll(".tamil-compare")[i].innerHTML = `<i class="far fa-times-circle"></i>`
                    }

                }
            }
        }
    }
})

//Click Home Button on page two to return to landing page
document.querySelector("#page-two-home-btn").addEventListener("click", function () {
    let allPages = document.querySelectorAll('.page');
    for (let p of allPages) {
        p.classList.remove('show-page');
        p.classList.add('hidden-page');
    }

    //show landing page
    document.querySelector("#page-one").classList.add("show-page");

    //Empty the values
    document.querySelector("#page-one-postal-code").value = "";

    document.querySelector("#preview-item-one").style.display = "none"
    document.querySelector("#preview-item-one-name").innerHTML = "";

    document.querySelector("#preview-item-two").style.display = "none"
    document.querySelector("#preview-item-two-name").innerHTML = "";
    choosenCentres = [];
    choosenCentresCodes = [];

    //Empty layers
    sparkGroup.clearLayers();
    baseClustersGroup.clearLayers();
    distance100ClusterLayer.clearLayers();
    distance500ClusterLayer.clearLayers();
    distance1000ClusterLayer.clearLayers();

    //Close existing popups
    map.closePopup();

})

//Return to map page from comparison page when click on the close button
document.querySelector("#page-three-close-btn").addEventListener("click", function () {
    let allPages = document.querySelectorAll('.page');
    for (let p of allPages) {
        p.classList.remove('show-page');
        p.classList.add('hidden-page');
    }

    // only show map page
    document.querySelector('#page-two').classList.add('show-page');
    map.closePopup();
})
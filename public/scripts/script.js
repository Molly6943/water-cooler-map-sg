import { initMap } from "./map.js";
import { find } from "./data.js";

document.addEventListener("DOMContentLoaded", async function () {
  // create the map
  const map = initMap();

  // all the markers for the search will be inside here
  const searchResultLayer = L.layerGroup();
  searchResultLayer.addTo(map);

  const markerCluster = L.markerClusterGroup();


  // Variable to store the currently highlighted marker
  let highlightedMarker = null;
  // Variable to store the previously validated status
  let previousStatus = null;

  // Function to init data
  async function setupData() {
    const results = await find();
    displaySearchResults(results);
  }
  setupData();

  function displaySearchResults(results) {
    for (const record of results) {
      addMarkerToMap(map, record);
    }
  }

  // Function to get customized marker icon
  function getIcon(verified) {
    let primaryIcon = null
    if (verified) {
      primaryIcon = {
        iconUrl: './images/water-green.png',
        iconSize: [26, 26], // size of the icon
        className: 'primary-marker'
      };
    } else {
      primaryIcon = {
        iconUrl: './images/water-red.png',
        iconSize: [26, 26], // size of the icon
        className: 'primary-marker'
      };
    }
    return primaryIcon
  }

  // Function to add marker to the map
  function addMarkerToMap(map, record) {
    const lat = record.latitude;
    const lng = record.longitude;
    const coordinate = [lat, lng];
    const primaryIcon = getIcon(record.verified)

    const marker = L.marker(coordinate, { icon: L.icon(primaryIcon) }).addTo(searchResultLayer).on('click', function () {
      if (highlightedMarker) {
        unhighlightMarker(highlightedMarker);
      }
      highlightedMarker = highlightMarker(record);
      previousStatus = record.verified;

      updatePopupContent(record)
    });

    // marker.addEventListener("click", function () {
    //   map.flyTo(coordinate, 16);
    // });
    return marker;
  }

  // Function to update popup content based on the selected result
  function updatePopupContent(record) {
    const popupContainer = document.getElementById('popup-container')
    popupContainer.style.left = '0';
    document.getElementById('close-popup-btn').addEventListener('click', function () {
      // Slide out the popup to the left
      document.getElementById('popup-container').style.left = '-350px';
    });
    const popupContent = document.getElementById('popup-content');
    // Clear previous content
    popupContent.innerHTML = '';
    const element = document.createElement('div');
    element.style.marginTop = "60px"
    element.innerHTML = `
    ${record.image ? `<img class="img-thumbnail" src=${record.image} />` : ''}
    <h5 class="mt-3">${record.name}</h5>
    <div class="description">
      <span class="label">Postcode</span>
      <span class="value">${record.postcode}</span>
    </div>
    <div class="description">
      <span class="label">Level</span>
      <span class="value">${record.level}</span>
    </div>
    <div class="description">
      <span class="label">Description</span>
      <span class="value">${record.description}</span>
    </div>
    <div class="description">
      <span class="label">Temperature</span>
      <span class="value">${record.temperature || 'N/A'}</span>
    </div>
    <div class="description">
      <span class="label">Latitude</span>
      <span class="value">${record.latitude}</span>
    </div>
    <div class="description">
      <span class="label">Longitude</span>
      <span class="value">${record.longitude}</span>
    </div>
    <div class="description">
      <span class="label">Source</span>
      <span class="value">${record.source}</span>
    </div>
    <div class="description">
      <span class="label">VerifiedBy</span>
      <span class="value">${record.verifiedBy || 'N/A'}</span>
    </div>
    <div class="description">
      <span class="label">Operator</span>
      <span class="value">${record.operator}</span>
    </div>
    <button class="btn btn-primary">Go There</button>
    `;
    const button = element.querySelector("button");
    button.addEventListener("click", function () {
      window.location.href = `https://www.google.com/maps/dir/Current+Location/${record.latitude},${record.longitude}`;
    })

    popupContent.appendChild(element);
  };

  const searchBox = document.querySelector('#search-box');
  const search = document.querySelector('#search');
  searchBox.addEventListener('input', async function () {
    const query = searchBox.value.trim();
    if (query.length > 0) {
      // Make API request
      const results = await searchAPI(query);
      // Update search results in the UI
      searchBox.style.borderRadius = '16px 16px 0 0';
      search.style.borderRadius = '16px 16px 0 0';
      updateSearchResults(results);
    } else {
      searchBox.style.borderRadius = '16px';
      search.style.borderRadius = '16px';
      // Clear search results if the search box is empty
      updateSearchResults([]);
    }
  });

  // Function to make API request and update search results
  async function searchAPI(query) {
    const apiUrl = `/api/points/search?keywords=${query}`;
    try {
      const response = await axios.get(apiUrl);
      return response.data
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  // Function to update search results in the UI
  function updateSearchResults(results) {
    const searchResultsList = document.querySelector('#search-results');
    searchResultsList.innerHTML = '';

    results.forEach(result => {
      const listItem = document.createElement('li');
      listItem.textContent = result.name;
      listItem.addEventListener('click', function () {
        // Remove highlight from the previously highlighted marker
        if (highlightedMarker) {
          unhighlightMarker(highlightedMarker);
        }

        // Fly to the location on the map
        map.flyTo([result.latitude, result.longitude], 16);

        // Highlight the corresponding marker
        highlightedMarker = highlightMarker(result);
        previousStatus = result.verified;

        // You can also update the popup content here if needed
        updatePopupContent(result);
        searchResultsList.innerHTML = '';
        // Handle the border radius
        document.querySelector('#search-box').style.borderRadius = '16px';
        document.querySelector('#search').style.borderRadius = '16px';
      });
      searchResultsList.appendChild(listItem);
    });
  }

  // Function to highlight the marker on the map
  function highlightMarker(result) {
    let marker = null;

    // Iterate over markers on the map and find the matching one
    searchResultLayer.eachLayer(layer => {
      const markerLatLng = layer.getLatLng();
      const resultLatLng = L.latLng(result.latitude, result.longitude);
      const primaryIcon = getIcon(result.verified)
      const highlightIcon = Object.assign(primaryIcon, {
        className: 'highlight-marker'
      })
      if (markerLatLng.equals(resultLatLng)) {
        // Highlight the marker (change icon, popup, etc.)
        layer.setIcon(L.icon(highlightIcon));
        marker = layer;
      }
    });
    return marker;
  }

  // Function to unhighlight the marker on the map
  function unhighlightMarker(marker) {
    // Unhighlight the marker (restore original icon, close popup, etc.)
    const primaryIcon = getIcon(previousStatus)
    marker.setIcon(L.icon(primaryIcon));
  }
  const nearme = document.querySelector('#nearme');
  nearme.addEventListener('click', function () {
    // get user's position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, handleError, { enableHighAccuracy: true });
    } else {
      console.error("Geolocation is not supported by this browser.")
    }

    function showPosition(position) {
      // set map based on user's position
      const latLng = [position.coords.latitude, position.coords.longitude]
      if (position) {

        map.setView(latLng, 15);
        markerCluster.addLayer(L.marker(latLng));
        map.addLayer(markerCluster);
      } else {
        alert('cannot get your location')
      }
    }

    function handleError() {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.error("User denied the request for geolocation.");
          break;
        case error.POSITION_UNAVAILABLE:
          console.error("Location information is unavailable.");
          break;
        case error.TIMEOUT:
          console.error("The request to get user location timed out.");
          break;
        case error.UNKNOWN_ERROR:
          console.error("An unknown error occurred.");
          break;
      }
    }

  })
});
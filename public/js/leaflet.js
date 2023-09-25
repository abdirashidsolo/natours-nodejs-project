/* eslint-disable */

export const displayMap = (locations) => {
  // ----------------------------------------------
  // Create the map and attach it to the #map
  // ----------------------------------------------

  const coords = [2.023777, 45.328363];
  const map = L.map('map', { zoomControl: false });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // L.marker(coords)
  //   .addTo(map)
  //   .bindPopup(
  //     L.popup({ autoClose: false, closeOnEscapeKey: false }).setContent(
  //       'This is map pop for testing purpose'
  //     )
  //   )
  //   .openPopup();

  let points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);

    L.marker([loc.coordinates[1], loc.coordinates[0]])
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        className: 'mapPopup',
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);
  map.scrollWheelZoom.disable();
};

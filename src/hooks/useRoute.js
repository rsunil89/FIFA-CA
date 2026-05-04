export function addRouteStop(routeStops, item) {
  if (routeStops.find(s => s.id === item.id)) {
    return { success: false, error: 'This location is already in your route.' };
  }
  if (routeStops.length >= 8) {
    return { success: false, error: 'Maximum of 8 stops allowed.' };
  }
  return { success: true, routeStops: [...routeStops, item] };
}

export function removeRouteStop(routeStops, index) {
  const updated = [...routeStops];
  updated.splice(index, 1);
  return updated;
}

export function calculateRoute(directionsService, routeRenderer, routeStops) {
  if (routeStops.length < 2) {
    routeRenderer.setDirections({ routes: [] });
    return null;
  }

  const waypoints = routeStops.slice(1, -1).map(stop => ({
    location: new google.maps.LatLng(stop.lat, stop.lng),
    stopover: true
  }));

  const request = {
    origin: new google.maps.LatLng(routeStops[0].lat, routeStops[0].lng),
    destination: new google.maps.LatLng(routeStops[routeStops.length - 1].lat, routeStops[routeStops.length - 1].lng),
    waypoints: waypoints,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        routeRenderer.setDirections(result);
        const route = result.routes[0];
        let totalDistance = 0;
        let totalDuration = 0;

        route.legs.forEach(leg => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;
        });

        resolve({
          distance: (totalDistance / 1000).toFixed(0),
          duration: {
            hours: Math.floor(totalDuration / 3600),
            minutes: Math.floor((totalDuration % 3600) / 60)
          }
        });
      } else {
        reject(new Error('Could not calculate route'));
      }
    });
  });
}

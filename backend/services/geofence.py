from math import radians, sin, cos, sqrt, atan2
from data.zones import zones

def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))

    return R * c


def check_geofence(lat, lng):

    alerts = []

    for zone in zones:

        distance = calculate_distance(
            lat, lng,
            zone["lat"], zone["lng"]
        )

        if distance <= zone["radius"]:

            alerts.append({
                "zone": zone["name"],
                "risk": zone["risk"],
                "type": zone["type"]
            })

    return alerts
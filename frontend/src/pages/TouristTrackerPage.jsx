import React, { useState } from "react";

const backendURL =
"http://192.168.0.105:5173/real-tourists";

export default function TouristTrackerPage() {

const [deviceId, setDeviceId] =
useState("");

const [tracking, setTracking] =
useState(false);


const handleStart = async () => {

if (!deviceId) {

alert("Enter device ID");

return;

}

const res = await fetch(
`${backendURL}/start-tracking`,
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
device_id: deviceId
})
}
);


if (!res.ok) {

alert("Invalid device ID");

return;

}


navigator.geolocation.watchPosition(

async (position) => {

await fetch(
`${backendURL}/update-location`,
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
device_id: deviceId,
lat: position.coords.latitude,
lng: position.coords.longitude
})
}
);

},

(error) => {

alert(
"Location permission required"
);

},

{
enableHighAccuracy: true,
maximumAge: 0,
timeout: 5000
}

);


setTracking(true);

};


return (

<div>

<h2>Tourist Device Tracking</h2>

{!tracking ? (

<>

<input
placeholder="Enter Device ID"
value={deviceId}
onChange={(e) =>
setDeviceId(e.target.value)
}
/>

<button
onClick={handleStart}
>

Start Tracking

</button>

</>

) : (

<h3>

Tracking Started Successfully 📍

</h3>

)}

</div>

);

}
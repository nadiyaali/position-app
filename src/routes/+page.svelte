<!-- <script> tag includes JavaScript code -->
<!-- TO DO
1.To find cropstop near watched position create a buffer and check what cropstops are within the buffer,
Current method is too slow for large number of cropstops
2. A marker is being placed at the start position. Fix that
3. Fix opacity of yellow and black color on farms, map below is difficult to view
4. Store claimed farms in a file
5. Refresh map on Start Game button
-->

<script>
    import farmerPic from '$lib/assets/farmer3.png'
    import { onMount } from 'svelte'
    import Geolocation from 'svelte-geolocation'
    import {
        Control,
        ControlButton,
        ControlGroup,
        DefaultMarker,
        FillExtrusionLayer,
        FillLayer,
        GeoJSON,
        hoverStateFilter,
        LineLayer,
        MapEvents,
        MapLibre,
        Marker,
        MarkerLayer,
        Popup,
    } from 'svelte-maplibre' // DoNotChange

    /**
     * You can put functions you need for multiple components in a js file in
     * the lib folder, export them in lib/index.js and then import them like this
     */
    import { getCropStopPrize, getDistance, getMapBounds, getUHI } from '$lib'

    let zoom = 14

    /**
     * Declare variables
     * let decalres an immutable variable
     * const declares a constant
     *
     * Note the format of markers
     */

    // let markers = [
    //     {
    //         lngLat: {
    //             lng: 144.9638347277324,
    //             lat: -37.80967960080751,
    //         },
    //         label: 'Marker 1',
    //         name: 'This is a marker',
    //     },
    //     {
    //         lngLat: {
    //             lng: 144.96318039790924,
    //             lat: -37.808357984258315,
    //         },
    //         label: 'Marker 2',
    //         name: 'This is a marker',
    //     },
    //     {
    //         lngLat: {
    //             lng: 144.96280297287632,
    //             lat: -37.80668719932231,
    //         },
    //         label: 'Marker 3',
    //         name: 'This is a marker',
    //     },
    //     {
    //         lngLat: {
    //             lng: 145.043532,
    //             lat: -37.734484,
    //         },
    //         label: '❀',
    //         name: 'This is a marker',
    //     },

    //     {
    //         lngLat: {
    //             lng: 145.04415478657265,
    //             lat: -37.73438068666923,
    //         },
    //         label: '❀',
    //         name: 'This is a marker',
    //     },
    // ]
    let markers = [
        {
            lngLat: {
                lng: 144.9638347277324,
                lat: -37.80967960080751,
            },
            label: 'Marker 1',
            name: 'This is a marker',
        },
    ]
    const markersCropStops = [
        {
            lngLat: {
                lng: 144.9638347277324,
                lat: -37.80967960080751,
            },
            label: 'Marker 1',
            name: 'This is a marker',
        },
        {
            lngLat: {
                lng: 144.96318039790924,
                lat: -37.808357984258315,
            },
            label: 'Marker 2',
            name: 'This is a marker',
        },
        {
            lngLat: {
                lng: 144.965058,
                lat: -37.807303,
            },
            label: 'Marker 3',
            name: 'This is a marker',
        },
        {
            lngLat: {
                lng: 145.043532,
                lat: -37.734484,
            },
            label: '❀',
            name: 'This is a marker',
        },

        {
            lngLat: {
                lng: 145.04415478657265,
                lat: -37.73438068666923,
            },
            label: '❀',
            name: 'This is a marker',
        },
    ]

    // Extent of the map
    // let bounds = getMapBounds(markers)
    let bounds
    /**
     * Declaring a function
     *
     * Functions declared in <script> can only be used in this component
     */

    function addMarker(e, label, name) {
        markers = [
            ...markers,
            {
                lngLat: e.detail.lngLat,
                label,
                name,
            },
        ]
    }

    // Geolocation API related
    const options = {
        enableHighAccuracy: true,
        timeout: Infinity, // milliseconds
        maximumAge: 0, // milliseconds, 0 disables cached positions
    }
    let getPosition = false
    let success = false
    let error = ''
    let position = {}
    let coords = []
    /**
     * $: indicates a reactive statement, meaning that this block of code is
     * executed whenever the variable used as the condition changes its value
     *
     * In this case: whenever success is set to true, a Position object
     * has been successfully obtained. Immediately update the relevant variables
     */
    $: if (success || error) {
    // reset the flag
        // getPosition = false
    }

    $: if (success) {
    // coords = [position.coords.longitude, position.coords.latitude]
        // markers = [
        //     ...markers,
        //     {
        //         lngLat: { lng: coords[0], lat: coords[1] },
        //         label: 'Current',
        //         name: 'This is the current position',
        //     },
        // ]
    }

    // Watch a position using Geolocation API if you need continuous updates
    let watchPosition = false
    let watchedPosition = {}
    let watchedMarker = {}

    let elapsed = 0
    // 300000 is 5 minutes
    const duration = 50000
    let last_time

    /**
     * Trigger an action when getting close to a marker
     */
    let mapCenter
    let count = 0 // number of markers found
    let cropStopPrize = ''
    $: if (watchedPosition.coords) { // this block is triggered when watchedPosition is updated
        // The tracked position in marker format
        watchedMarker = {
            lngLat: {
                lng: watchedPosition.coords.longitude,
                lat: watchedPosition.coords.latitude,
            },
        }
        // coords = [watchedPosition.coords.longitude, watchedPosition.coords.latitude]
        coords = ['Longitude : ', watchedPosition.coords.longitude, 'Latitude : ', watchedPosition.coords.latitude, 'Accuracy : ', watchedPosition.coords.accuracy, 'm', 'Speed : ', watchedPosition.coords.speed]
        mapCenter = [watchedPosition.coords.longitude, watchedPosition.coords.latitude]

        zoom = 18

        // Whenever the watched position is updated, check if it is within 10 meters of any marker
        markersCropStops.forEach((marker) => {
            const distance = getDistance([watchedMarker, marker])

            const threshold = 10

            if (distance <= threshold) {
                if (count === 0) {
                    count += 1
                    cropStopPrize = getCropStopPrize()
                    last_time = window.performance.now()
                }
                else {
                    const time = window.performance.now()
                    elapsed += Math.min(time - last_time)
                    if (elapsed > duration) {
                        count += 1
                        cropStopPrize = getCropStopPrize()
                        elapsed = 0
                        last_time = window.performance.now()
                    }
                }
            }
        })
    }

    /**
     * Variables can be initialised without a value and populated later
     * WARNING: this can lead to errors if the variable is used before being
     * assigned a value
     */

    // const showGeoJSON = true
    let geojsonData
    let geojsonDataPoints
    /**
     * onMount is executed immediately after the component is mounted, it can be
     * used to load large datasets or to execute code required after the page
     * has been loaded
     *
     * async/await indicate an asynchronous function (i.e., program is paused
     * when a line marked with await starts and resumes when it is resolved)
     *
     * Asset files (e.g., data files, images) can be put in static folder
     *
     * Another way to load data files is to use a URL to the file hosted
     * on a remote server. Try this by replacing 'melbourne.geojson' with
     * 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/melbourne.geojson'
     */
    onMount(async () => {
        // const response = await fetch('sa1.geojson')
        // geojsonData = await response.json()

        // const response2 = await fetch('trafficlight.geojson')
        // geojsonDataPoints = await response2.json()
        try {
            // const response1 = await fetch('urban_heat_2018.geojson')
            // const response1 = await fetch('sa1melbourne.geojson')
            const response1 = await fetch('polygon.geojson')
            // const response1 = await fetch('footpaths.geojson')

            if (!response1.ok) { throw new Error('Failed to fetch urban_heat_2018.geojson') }
            geojsonData = await response1.json()
            console.log(geojsonData)
            console.log('Polygons data loaded')
        }
        catch (err) {
            console.log('ERROR')
            console.log(err.message)
        }
        try {
            const response2 = await fetch('points.geojson')
            if (!response2.ok) { throw new Error('Failed to fetch points.geojson') }
            geojsonDataPoints = await response2.json()
            console.log(geojsonDataPoints)
            console.log('Points data loaded')
        }

        catch (err) {
            console.log(err.message)
        }
        // Load data and center the map
        mapCenter = [144.97, -37.81]
    })

</script>

<!-- Everything after <script> will be HTML for rendering -->

<!-- This section demonstrates how to get the current user location -->
<div class="flex flex-col h-[calc(100vh-80px)] w-full">
    <!-- grid, grid-cols-#, col-span-#, md:xxxx are some Tailwind utilities you can use for responsive design -->
    <div class="grid grid-cols-3 gap-4">
        <div class="col-span-1 md:col-span-1">
            <div class="card card-compact bg-base-100 shadow-md text-center">
                <figure>
                    <img
                        class="w-48"
                        src={farmerPic}
                        alt="Game logo" />
                </figure>
                <div class="card-body">
                    <p>Help us fight climate change. Plant trees and make your city green</p>
                    <div class="card-actions justify-center">
                        <button
                            class="btn btn-accent"
                            on:click={() => {
                                watchPosition = false
                                watchedPosition = {}
                                watchedMarker = {}
                                // This will start reactive code
                                getPosition = true
                                watchPosition = true
                            }}
                        >
                            Start Game
                        </button>

                    </div>
                </div>

                <!-- <h1 class="font-bold w-28">Make City Green</h1>
            <img
                class="w-28"
                alt="The game logo"
                src={farmerPic} />
            <button
                class="btn btn-neutral"
                on:click={() => {
                    watchPosition = false
                    watchedPosition = {}
                    watchedMarker = {}
                    // This will start reactive code
                    getPosition = true
                    watchPosition = true
                }}
            >
                Start Game
            </button> -->

                <Geolocation
                    getPosition={watchPosition}
                    options={options}
                    watch={true}
                    on:position={(e) => {
                        watchedPosition = e.detail
                    }}
                />
                <!-- <p class="break-words text-left">Coordinates: {coords}</p>
            <p class="break-words text-left">watchedPosition: {JSON.stringify(watchedPosition)}</p> -->
                <!-- <p class="break-words text-left">Current Position Longitude:{watchedPosition.coords.longitude}
                Latitude:{watchedPosition.coords.latitude}
            </p> -->

            </div>
        </div>
        <div class="col-span-1 md:col-span-1 text-center">
            <div class="card card-compact bg-base-100 shadow-md">
                <div class="card-body justify-center">
                    <h2 class="card-title justify-center">Your Location</h2>
                    <div></div>
                    <!-- <h1 class="font-bold">Location</h1> -->

                    <!-- on:click declares what to do when the button is clicked -->
                    <!-- In the HTML part, {} tells the framework to treat what's inside as code (variables or functions), instead of as strings -->
                    <!-- () => {} is an arrow function, almost equivalent to function foo() {} -->
                    <!-- <button
                class="btn btn-neutral"
                on:click={() => { getPosition = true }}
            >
                Get geolocation
            </button> -->

                    <!-- <Geolocation> tag is used to access the Geolocation API -->
                    <!-- {getPosition} is equivalent to getPosition={getPosition} -->
                    <!-- bind:variable associates the parameter with the variable with the same name declared in <script> reactively -->
                    <!-- let:variable creates a variable for use from the component's return -->
                    <Geolocation
                        {getPosition}
                        {watchPosition}
                        options={options}
                        bind:position
                        let:loading
                        bind:success
                        bind:error
                        let:notSupported
                    >
                        <!-- If-else block syntax -->
                        {#if notSupported}
                            Your browser does not support the Geolocation API.
                        {:else}
                            {#if loading}
                                <!-- Loading... -->
                                <div class="justify-center">
                                    <span class="loading loading-ring loading-lg"></span>
                                </div>
                            {/if}
                            {#if success}
                                Success!
                            {/if}
                            {#if error}
                                <!-- An error occurred. Error code {error.code}: {error.message}. -->
                                {#if error.code === error.PERMISSION_DENIED}
                                    <p>Permission denied. GPS might not be available.</p>
                                {:else if error.code === error.POSITION_UNAVAILABLE}
                                    <p>Position unavailable. GPS might not be available.</p>
                                {:else if error.code === error.TIMEOUT}
                                    <p>Request timed out. GPS might not be available.</p>
                                {:else if error.code === error.UNKNOWN_ERROR}
                                    <p>Unknown error occurred. GPS capability unclear.</p>
                                {/if}
                            {/if}
                        {/if}
                    </Geolocation>

                    <!-- <p class="break-words text-left">Coordinates:</p> -->
                    <!-- Objects cannot be directly rendered, use JSON.stringify() to convert it to a string -->
                    <!-- <p class="break-words text-left">Position: {JSON.stringify(position, null, 4)}</p> -->
                    <p class="break-words text-left">{#each coords as item, i (i)}
                        {item}
                    {/each}</p>
                </div>
            </div>
        </div>

        <!-- This section demonstrates how to get automatically updated user location -->

        <!-- <div class="col-span-4 md:col-span-1 text-center">
            <h1 class="font-bold">Toggle Melbourne Suburbs</h1>

            <button
                class="btn btn-neutral"
                on:click={() => { showGeoJSON = !showGeoJSON }}
            >
                Toggle
            </button>
        </div> -->

        <div class="col-span-1 md:col-span-1 text-center">
            <div class="card card-compact bg-base-100 shadow-md">
                <div class="card-body justify-center">
                    <h2 class="card-title justify-center">Found {count} Crop Stop</h2>
                    <!-- The count will go up by one each time you are within 10 meters of a marker. -->
                    {cropStopPrize}
                </div>
            </div>
        </div>
    </div>

    <!-- This section demonstrates how to make a web map using MapLibre -->
    <!-- More basemap options -->
    <!-- "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" -->
    <!-- "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" -->
    <!-- "https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
     EtFDKqqHq3Xwv4EiseJp -->
    <MapLibre
        class="map flex-grow min-h-[600px]"
        standardControls
        style="https://api.maptiler.com/maps/streets-v2/style.json?key=EtFDKqqHq3Xwv4EiseJp"
        bind:bounds
        bind:zoom={zoom}
        bind:center={mapCenter}
        pitch={45}
        let:map
    >
        <!-- Custom control buttons -->
        <Control class="flex flex-col gap-y-2">
            <ControlGroup>
                <ControlButton
                    on:click={() => {
                        bounds = getMapBounds(markers)
                    }}
                >
                    Fit
                </ControlButton>
                <ControlButton
                    on:click={() => {
                        map.flyTo({
                            center: watchedMarker.lngLat,
                            zoom: 18,
                        })
                    }}
                >
                    Go
                </ControlButton>
            </ControlGroup>
        </Control>

        <!-- A map event to add a marker when clicked -->
        <MapEvents on:click={event => addMarker(event, '', 'Your Tree')} />
        <!-- <MapEvents on:click={event => addMarkerFarm(event, 'Farm Claimed', 'This is your farm')} /> -->

        <!-- This is how GeoJSON datasets are rendered -->
        <!-- promoteId must be a unique ID field in properties of each feature -->
        <GeoJSON
            id="geojsonData"
            data={geojsonData}
            promoteId="FID"
        >
            <FillLayer
                paint={{
                    'fill-color': hoverStateFilter('black', 'yellow'),
                    'fill-opacity': 0.1,
                }}
                beforeLayerType="building"
                manageHoverState
            >
                <Popup
                    openOn="hover"
                    let:data
                >
                    {@const props = data?.properties}
                    {#if props}
                        <div class="flex flex-col gap-2">
                            <h3><b>{props.SA2_NAME21} UHI: </b>{getUHI()} </h3>
                        </div>
                    {/if}
                </Popup>
            </FillLayer>
            <LineLayer
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{ 'line-color': 'purple', 'line-width': 3 }}
                beforeLayerType="building"
            />
        </GeoJSON>

        <!-- Displaying markers, this is reactive -->
        <!-- For-each loop syntax -->
        <!-- markers is an object, lngLat, label, name are the fields in the object -->
        <!-- i is the index, () indicates the unique ID for each item, duplicate IDs will lead to errors -->
        {#each markers as { lngLat, label, name }, i (i)}
            <Marker
                {lngLat}
                class="grid h-14 w-14 place-items-center
                    focus:outline-2 focus:outline-black"
            >
                <!-- <span>
                    {label}
                </span> -->
                <!-- <div class="rounded-full bg-orange-200 p-1">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                    ><path
                        fill="currentColor"
                        d="M14 11.5A2.5 2.5 0 0 0 16.5 9A2.5 2.5 0 0 0 14 6.5A2.5 2.5 0 0 0 11.5 9a2.5 2.5 0 0 0 2.5 2.5M14 2c3.86 0 7 3.13 7 7c0 5.25-7 13-7 13S7 14.25 7 9a7 7 0 0 1 7-7M5 9c0 4.5 5.08 10.66 6 11.81L10 22S3 14.25 3 9c0-3.17 2.11-5.85 5-6.71C6.16 3.94 5 6.33 5 9Z"
                    /></svg
                    >
                </div> -->
                <div>
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"><g
                        id="SVGRepo_bgCarrier"
                        stroke-width="0"></g><g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path
                        d="M4 4C4 1.79086 5.79086 0 8 0C9.86384 0 11.4299 1.27477 11.874 3H12C14.2091 3 16 4.79086 16 7C16 9.20914 14.2091 11 12 11H9V14H11V16H5V14H7V11H3.5C1.567 11 0 9.433 0 7.5C0 5.567 1.567 4 3.5 4H4Z"
                        fill="#069C56"></path> </g></svg>
                </div>
                <Popup
                    openOn="hover"
                    offset={[0, -0]}>
                    <div class="text-sm">{name}</div>
                </Popup>
            </Marker>
        {/each}

        {#each markersCropStops as { lngLat, label, name }, i (i)}
            <Marker
                {lngLat}
                class="rounded-full bg-orange-200 p-1 shadow"
            >
                <div class="text-lg font-bold">🍀
                </div>
                <Popup
                    openOn="hover"
                    offset={[0, -0]}>
                    <div class="text-lg font-bold">{name}</div>
                </Popup>
            </Marker>
        {/each}
        <!-- <GeoJSON
            id="geojsonDataPoints"
            data={geojsonDataPoints}
            promoteId="council_re"
        >
            <FillLayer
                paint={{
                    'fill-color': hoverStateFilter('green', 'yellow'),
                    'fill-opacity': 0.8,
                }}
                beforeLayerType="place"
                manageHoverState
            >
                <Popup
                    openOn="hover"
                    let:data
                >
                    {@const props = data?.properties}
                    {#if props}
                        <div class="flex flex-col gap-2">
                            <p>{props.council_re}</p>
                            <p>Click to claim farm</p>
                            {props.council_re}
                        </div>5
                    {/if}
                </Popup>
            </FillLayer>
            <LineLayer
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{ 'line-color': 'purple', 'line-width': 3 }}
                beforeLayerType="place"
            />
        </GeoJSON> -->
        <GeoJSON
            id="geojsonDataPoints"
            data={geojsonDataPoints}
            promoteId="OBJECTID">
            <MarkerLayer
                interactive
                let:feature>
                <div class="rounded-full bg-orange-200 p-1 shadow">
                    <div class="text-lg font-bold">🍀</div>
                </div>
                <Popup openOn="hover">
                    <b>Crop Stop: </b>{feature.properties.SITE_NAME}
                </Popup>
            </MarkerLayer>
        </GeoJSON>
        <!-- Display the watched position as a marker -->
        {#if watchedMarker.lngLat}
            <!-- <DefaultMarker lngLat={watchedMarker.lngLat}>
                <Popup offset={[0, -10]}>
                    <div class="text-lg font-bold">You</div>
                </Popup>
            </DefaultMarker> -->
            <Marker
                lngLat={watchedMarker.lngLat}
                class="grid h-8 w-8 place-items-center"
            >
                <div>
                    <svg
                        fill="#000000"
                        height="100px"
                        width="100px"
                        version="1.1"
                        id="Capa_1"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="0 0 493.949 493.949"
                        xml:space="preserve"><g
                        id="SVGRepo_bgCarrier"
                        stroke-width="0"></g><g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M155.207,386.008c-8.936,10.841-9.838,24.83-2.032,31.266c7.805,6.422,24.293,4.713,30.295-7.979 c13.435-28.436,31.543-26.933,23.731-33.362C199.395,369.513,164.128,375.166,155.207,386.008z"></path> <path d="M125.363,350.226c10.059-5.591,11.925-21.431,4.167-35.396c-7.758-13.957-46.046-27.542-56.104-21.967 c-10.06,5.591,10.508,7.631,19.689,42.21C97.211,350.51,115.304,355.809,125.363,350.226z"></path> <path d="M162.6,463.204c-1.547,0-2.984,0.392-4.374,0.871c-0.111-6.813-4.011-11.09-9.444-13.283 c-0.018-6.332-4.805-11.845-10.657-12.329c-3.397-66.546,18.013-142.314,20.616-151.241c-0.014-0.006-0.031-0.009-0.046-0.015 c-38.66,108.909-34.369,144.998-34.764,144.998c-6.847,0-12.399,5.78-12.399,12.905c0,1.74,0.348,3.399,0.957,4.919 c-5.044,0.996-9.252,4.008-11.411,8.374c-1.953-1.733-4.318-2.918-7.005-2.918c-6.019,0-10.827,5.234-11.238,11.815 c-3.188-3.725-7.852-6.255-13.31-6.255c-9.598,0-17.38,7.363-17.38,16.448c0,9.094,7.782,16.456,17.38,16.456 c0,0,71.359,0,95.146,0c7.168,0,12.653-7.648,12.653-15.372C177.325,470.083,170.731,463.204,162.6,463.204z"></path> <path d="M440.605,302.882l-34.753-106.873l4.032-19.414c1.06-5.124,0.056-10.359-2.815-14.724 c-2.823-4.317-7.346-7.394-12.399-8.438l-11.49-2.388c-7.378-1.51-14.78,1.727-19.279,7.386h-57.828 c-4.548-5.083-11.444-7.997-18.45-6.579l-11.482,2.388c-5.061,1.044-9.585,4.12-12.407,8.43c-2.871,4.373-3.875,9.608-2.815,14.74 l3.929,18.919l-34.659,106.553c-4.151,12.755,2.823,26.467,15.586,30.611c6.781,2.212,13.793,1.199,19.536-2.085 c1.563,8.619,7.677,15.593,15.757,18.478V470.77c0,12.535,10.153,22.688,22.686,22.688c12.527,0,22.68-10.152,22.68-22.68V351.38 h17.928v119.39c0,12.535,10.153,22.688,22.685,22.688c12.536,0,22.689-10.152,22.689-22.688V349.885 c8.135-2.905,14.262-9.959,15.774-18.656c3.64,2.094,7.693,3.466,11.989,3.466c2.491,0,5.029-0.388,7.521-1.202 C437.774,329.349,444.757,315.637,440.605,302.882z M276.78,174.128c-0.182-0.894-0.008-1.803,0.491-2.578 c0.49-0.735,1.273-1.265,2.15-1.447l12.194-2.467c1.589,0,2.981,1.139,3.306,2.712l6.768,32.597h-9.125 c-3.328,0-6.478,0.684-9.436,1.765L276.78,174.128z M389.735,327.072c0,4.483-3.622,8.113-8.105,8.113h-92.458 c-4.483,0-8.104-3.63-8.104-8.113v-96.435c0-6.351,5.147-11.497,11.497-11.497h85.673c6.348,0,11.497,5.146,11.497,11.497V327.072z M387.515,204.661c-2.914-1.045-6.008-1.716-9.277-1.716h-9.293l6.935-33.403c0.324-1.565,1.724-2.926,4.009-2.633l11.498,2.388 c0.87,0.182,1.653,0.712,2.143,1.455c0.498,0.767,0.672,1.677,0.49,2.563L387.515,204.661z"></path> <path d="M303.753,230.368c-5.701,0-10.328,4.618-10.328,10.327c0,5.702,4.627,10.328,10.328,10.328 c5.71,0,10.328-4.626,10.328-10.328C314.081,234.986,309.463,230.368,303.753,230.368z"></path> <path d="M367.046,229.562c-5.708,0-10.328,4.618-10.328,10.328c0,5.702,4.619,10.327,10.328,10.327 c5.702,0,10.328-4.625,10.328-10.327C377.374,234.18,372.748,229.562,367.046,229.562z"></path> <path d="M286.764,87.857c-0.37,2.437-0.748,4.875-0.748,7.416c0,27.273,22.111,49.375,49.383,49.375 c27.275,0,49.386-22.102,49.386-49.375c0-2.541-0.378-4.979-0.748-7.416c-14.815,3.242-31.745,4.917-48.637,4.917 C318.509,92.773,301.578,91.099,286.764,87.857z"></path> <path d="M335.4,76.578c51.843,0,78.571-14.771,78.571-21.074c0-4.642-14.614-13.839-42.966-18.381 C364.171,18.383,350.879,0,335.399,0c-15.479,0-28.772,18.383-35.605,37.124c-28.351,4.543-42.965,13.739-42.965,18.381 C256.829,61.807,283.557,76.578,335.4,76.578z"></path> </g> </g></svg>
                </div>

                <Popup
                    openOn="hover"
                    offset={[0, -10]}>
                    <div class="text-sm font-bold">{name}</div>
                </Popup>
            </Marker>

        {/if}
        <FillExtrusionLayer
            source="maptiler_planet"
            sourceLayer="building"
            beforeLayerType={l => l.type === 'symbol' && !!l.paint?.['text-color']}
            minzoom={14}
            paint={{
                // Show lower buildings in green, higher in red.
                'fill-extrusion-color': [
                    'interpolate',
                    ['linear'],
                    ['get', 'render_height'],
                    0,
                    '#d4d4d4',
                    70,
                    '#29849f',
                ],

                // use an 'interpolate' expression to add a smooth transition effect to the
// buildings as the user zooms in
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    0,
                    14.05,
                    ['get', 'render_height'],
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    14,
                    0,
                    14.05,
                    ['get', 'render_min_height'],
                ],
                'fill-extrusion-opacity': 0.9,
            }}
        />
    </MapLibre>
</div>

<!-- Optionally, you can have a <style> tag for CSS at the end, but with TailwindCSS it is usually not necessary -->

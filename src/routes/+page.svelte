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
    import farmerPic from '$lib/assets/farmer1.jpg'
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
    import { getCropStopPrize, getDistance, getMapBounds } from '$lib'

    let zoom = 14

    /**
     * Declare variables
     * let decalres an immutable variable
     * const declares a constant
     *
     * Note the format of markers
     */

    let markers = [
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
                lng: 144.96280297287632,
                lat: -37.80668719932231,
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
    const coords = []

    /**
     * $: indicates a reactive statement, meaning that this block of code is
     * executed whenever the variable used as the condition changes its value
     *
     * In this case: whenever success is set to true, a Position object
     * has been successfully obtained. Immediately update the relevant variables
     */
    $: if (success || error) {
        // reset the flag
        getPosition = false
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

        mapCenter = [watchedPosition.coords.longitude, watchedPosition.coords.latitude]

        zoom = 18

        // Whenever the watched position is updated, check if it is within 10 meters of any marker
        markers.forEach((marker) => {
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
    <div class="grid grid-cols-3">
        <div class="col-span-5 sm:col-span-1 text-left">
            <h1 class="font-bold w-28">Make City Green</h1>
            <img
                class="w-28"
                alt="The game logo"
                src={farmerPic} />

            <!-- </div>
        <div class="col-span-4 md:col-span-1 text-left"> -->
            <!-- <h1 class="font-bold">Automatically updated position when moving</h1> -->

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
            </button>

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
        <div class="col-span-5 sm:col-span-1 text-center">
            <h1 class="font-bold">Location</h1>

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
                        Loading...
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

            <p class="break-words text-left">Coordinates: {coords}</p>
            <!-- Objects cannot be directly rendered, use JSON.stringify() to convert it to a string -->
            <p class="break-words text-left">Position: {JSON.stringify(position)}</p>

            <!-- <div class="text-center font-medium text-red-500">Note that in some browsers, you cannot repeatedly request the current location. If you need to continuously update the location, use the watch option below.</div> -->
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

        <div class="col-span-5 sm:col-span-1 text-center">
            <h1 class="font-bold">Found {count} Crop Stop</h1>

            <!-- The count will go up by one each time you are within 10 meters of a marker. -->
            {cropStopPrize}
        </div>
    </div>

    <!-- This section demonstrates how to make a web map using MapLibre -->
    <!-- More basemap options -->
    <!-- "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" -->
    <!-- "https://tiles.basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" -->
    <!-- "https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
     EtFDKqqHq3Xwv4EiseJp -->
    <MapLibre
        class="map flex-grow min-h-[500px]"
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
            promoteId="MBCODE_16"
        >
            <FillLayer
                paint={{
                    'fill-color': hoverStateFilter('black', 'yellow'),
                    'fill-opacity': 0.1,
                }}
                beforeLayerType="buildings"
                manageHoverState
            >
                <!-- <Popup
                    openOn="hover"
                    let:data
                >
                    {@const props = data?.properties}
                    {#if props}
                        <div class="flex flex-col gap-2">
                            <p>{props.SA2_NAME16}</p>
                        </div>
                    {/if}
                </Popup> -->
            </FillLayer>
            <LineLayer
                layout={{ 'line-cap': 'round', 'line-join': 'round' }}
                paint={{ 'line-color': 'purple', 'line-width': 3 }}
                beforeLayerType="buildings"
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
                        width="36"
                        height="36"
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
                    <div class="text-sm font-bold">🍀</div>
                </div>
                <Popup openOn="hover">
                    {feature.properties.SITE_NAME}
                </Popup>
            </MarkerLayer>
        </GeoJSON>
        <!-- Display the watched position as a marker -->
        {#if watchedMarker.lngLat}
            <DefaultMarker lngLat={watchedMarker.lngLat}>
                <Popup offset={[0, -10]}>
                    <div class="text-lg font-bold">You</div>
                </Popup>
            </DefaultMarker>
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

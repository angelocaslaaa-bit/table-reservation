// ==========================================
// TABLE RESERVATION SYSTEM
// Array + Linear Search
// ==========================================


// ==========================================
// RATES
// ==========================================

const RATE = {
    Billiard: 150,
    KTV: 300
};


// ==========================================
// ARRAYS
// ==========================================

// Array of available facilities
let facilities = [
    {
        id: "B1",
        name: "Billiard Table 1",
        type: "Billiard"
    },
    {
        id: "B2",
        name: "Billiard Table 2",
        type: "Billiard"
    },
    {
        id: "B3",
        name: "Billiard Table 3",
        type: "Billiard"
    },
    {
        id: "K1",
        name: "KTV Room 1",
        type: "KTV"
    }
];


// Array where reservations will be stored
let reservations = [];

let nextReservationId = 1;


// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Set today's date automatically
    document.getElementById("resDate").value =
        new Date().toISOString().split("T")[0];

    // Show Billiard Tables 1-3 by default
    populateFacilitySelect();

    // Change facility numbers when type changes
    document
        .getElementById("resFacilityType")
        .addEventListener("change", populateFacilitySelect);

});


// ==========================================
// FACILITY SELECT
// ==========================================

function populateFacilitySelect() {

    const facilityType =
        document.getElementById("resFacilityType").value;

    const facilitySelect =
        document.getElementById("resFacilitySelect");

    facilitySelect.innerHTML = "";


    // Go through facilities array
    for (let i = 0; i < facilities.length; i++) {

        if (facilities[i].type === facilityType) {

            const option = document.createElement("option");

            option.value = facilities[i].id;
            option.textContent = facilities[i].name;

            facilitySelect.appendChild(option);
        }
    }
}


// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Convert time to minutes
function timeToMinutes(time) {

    const parts = time.split(":");

    const hour = Number(parts[0]);
    const minute = Number(parts[1]);

    return (hour * 60) + minute;
}


// Convert minutes to readable duration
function minutesToHM(minutes) {

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    let result = "";

    if (hours > 0) {

        result += hours + " hour";

        if (hours > 1) {
            result += "s";
        }
    }

    if (mins > 0) {

        if (result !== "") {
            result += " ";
        }

        result += mins + " minute";

        if (mins > 1) {
            result += "s";
        }
    }

    return result;
}


// Calculate ending time
function computeEndTime(startTime, duration) {

    const startMinutes = timeToMinutes(startTime);

    const endMinutes = startMinutes + duration;

    const hours =
        Math.floor(endMinutes / 60) % 24;

    const minutes =
        endMinutes % 60;

    return String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0");
}


// Calculate price
function computePrice(type, duration) {

    return Math.round(
        (duration / 60) * RATE[type]
    );
}


// ==========================================
// CHECK TIME OVERLAP
// ==========================================

function isOverlapping(
    newStart,
    newEnd,
    oldStart,
    oldEnd
) {

    return newStart < oldEnd &&
           oldStart < newEnd;
}


// ==========================================
// CHECK RESERVATION CONFLICT
// ==========================================

function checkReservationConflict(
    facilityId,
    date,
    startTime,
    endTime
) {

    const newStart =
        timeToMinutes(startTime);

    const newEnd =
        timeToMinutes(endTime);


    // Search every reservation
    for (let i = 0; i < reservations.length; i++) {

        const reservation = reservations[i];

        if (
            reservation.facilityId === facilityId &&
            reservation.date === date &&
            reservation.status === "Reserved"
        ) {

            const oldStart =
                timeToMinutes(
                    reservation.scheduledStart
                );

            const oldEnd =
                timeToMinutes(
                    reservation.scheduledEnd
                );


            if (
                isOverlapping(
                    newStart,
                    newEnd,
                    oldStart,
                    oldEnd
                )
            ) {

                return reservation;
            }
        }
    }

    return null;
}


// ==========================================
// CREATE RESERVATION
// ==========================================

function handleCreateReservation() {

    const customer =
        document
            .getElementById("resCustomer")
            .value
            .trim();

    const contact =
        document
            .getElementById("resContact")
            .value
            .trim();

    const facilityType =
        document
            .getElementById("resFacilityType")
            .value;

    const facilityId =
        document
            .getElementById("resFacilitySelect")
            .value;

    const date =
        document
            .getElementById("resDate")
            .value;

    const startTime =
        document
            .getElementById("resStartTime")
            .value;

    const duration =
        Number(
            document
                .getElementById("resDurationSelect")
                .value
        );


    // Validation
    if (
        customer === "" ||
        facilityId === "" ||
        date === "" ||
        startTime === ""
    ) {

        showMessage(
            "resMsg",
            "Please fill in all required fields."
        );

        return;
    }


    // Find facility
    let selectedFacility = null;

    for (let i = 0; i < facilities.length; i++) {

        if (facilities[i].id === facilityId) {

            selectedFacility = facilities[i];

            break;
        }
    }


    // Calculate end time
    const endTime =
        computeEndTime(
            startTime,
            duration
        );


    // Check for schedule conflict
    const conflict =
        checkReservationConflict(
            facilityId,
            date,
            startTime,
            endTime
        );


    if (conflict !== null) {

        showMessage(
            "resMsg",
            "Reservation conflict! " +
            selectedFacility.name +
            " is already reserved from " +
            conflict.scheduledStart +
            " to " +
            conflict.scheduledEnd +
            "."
        );

        return;
    }


    // Calculate price
    const price =
        computePrice(
            facilityType,
            duration
        );


    // Generate reservation ID
    const reservationId =
        "RES" +
        String(nextReservationId)
            .padStart(3, "0");


    // Reservation object
    const newReservation = {

        id: reservationId,

        customerName: customer,

        contact: contact,

        facilityId: facilityId,

        facilityName:
            selectedFacility.name,

        facilityType:
            facilityType,

        date: date,

        scheduledStart:
            startTime,

        scheduledEnd:
            endTime,

        durationMinutes:
            duration,

        price: price,

        status: "Reserved"
    };


    // Add reservation to ARRAY
    reservations.push(newReservation);

    nextReservationId++;


    showMessage(
        "resMsg",
        reservationId +
        " successfully created for " +
        customer +
        ". Price: ₱" +
        price
    );


    // Clear inputs
    document
        .getElementById("resCustomer")
        .value = "";

    document
        .getElementById("resContact")
        .value = "";

    document
        .getElementById("resStartTime")
        .value = "";


    // Update table
    renderReservations();
}


// ==========================================
// LINEAR SEARCH
// ==========================================

function linearSearchReservation(query) {

    query =
        query
            .trim()
            .toLowerCase();


    // LINEAR SEARCH
    // Check reservation one by one
    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        const reservation =
            reservations[i];


        if (
            reservation.id
                .toLowerCase() === query ||

            reservation.customerName
                .toLowerCase()
                .includes(query)
        ) {

            return reservation;
        }
    }


    return null;
}


// ==========================================
// HANDLE SEARCH
// ==========================================

function handleReservationSearch() {

    const query =
        document
            .getElementById("resSearchInput")
            .value;


    if (query.trim() === "") {

        showMessage(
            "resSearchMsg",
            "Please enter customer name or reservation ID."
        );

        return;
    }


    const found =
        linearSearchReservation(query);


    if (found !== null) {

        showMessage(
            "resSearchMsg",

            "Found: " +
            found.id +
            " | " +
            found.customerName +
            " | " +
            found.facilityName +
            " | " +
            found.date +
            " | " +
            found.scheduledStart +
            "-" +
            found.scheduledEnd +
            " | ₱" +
            found.price +
            " | " +
            found.status
        );

    } else {

        showMessage(
            "resSearchMsg",
            "No reservation found."
        );
    }
}


// ==========================================
// START RESERVATION
// ==========================================

function handleStartReservation(reservationId) {

    // Search reservation
    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        if (
            reservations[i].id ===
            reservationId
        ) {

            reservations[i].status =
                "Started";

            showMessage(
                "resMsg",
                reservations[i].id +
                " session started."
            );

            break;
        }
    }


    renderReservations();
}


// ==========================================
// CANCEL RESERVATION
// ==========================================

function handleCancelReservation(reservationId) {

    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        if (
            reservations[i].id ===
            reservationId
        ) {

            reservations[i].status =
                "Cancelled";

            showMessage(
                "resMsg",
                reservations[i].id +
                " reservation cancelled."
            );

            break;
        }
    }


    renderReservations();
}


// ==========================================
// DISPLAY RESERVATIONS
// ==========================================

function renderReservations() {

    const tableBody =
        document.getElementById(
            "reservationsBody"
        );


    tableBody.innerHTML = "";


    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        const reservation =
            reservations[i];


        // Do not show cancelled reservations
        if (
            reservation.status ===
            "Cancelled"
        ) {

            continue;
        }


        const row =
            document.createElement("tr");


        row.innerHTML =

            "<td>" +
            reservation.id +
            "</td>" +

            "<td>" +
            reservation.customerName +
            "</td>" +

            "<td>" +
            reservation.facilityName +
            "</td>" +

            "<td>" +
            reservation.date +
            "</td>" +

            "<td>" +
            reservation.scheduledStart +
            "</td>" +

            "<td>" +
            reservation.scheduledEnd +
            "</td>" +

            "<td>" +
            minutesToHM(
                reservation.durationMinutes
            ) +
            "</td>" +

            "<td>₱" +
            reservation.price +
            "</td>" +

            "<td>" +
            reservation.status +
            "</td>" +

            "<td>" +

            (
                reservation.status ===
                "Reserved"

                ?

                "<button onclick=\"handleStartReservation('" +
                reservation.id +
                "')\">Start Session</button>"

                :

                ""
            ) +

            "<button onclick=\"handleCancelReservation('" +
            reservation.id +
            "')\">Cancel</button>" +

            "</td>";


        tableBody.appendChild(row);
    }
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(elementId, message) {

    document
        .getElementById(elementId)
        .textContent = message;
}

// ==========================================
// TABLE RESERVATION SYSTEM
// Uses ARRAY + LINEAR SEARCH
// ==========================================


// ==========================================
// RATES
// ==========================================

const RATE = {
    Billiard: 150,
    KTV: 300
};


// ==========================================
// FACILITIES ARRAY
// ==========================================

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


// ==========================================
// RESERVATIONS ARRAY
// ==========================================

let reservations = [];

let nextReservationId = 1;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Automatically show today's date
    document.getElementById("resDate").value =
        new Date().toISOString().split("T")[0];

    // Automatically show Billiard Table 1-3
    populateFacilitySelect();

    // Display reservation table
    renderReservations();
});


// ==========================================
// DISPLAY FACILITIES
// ==========================================

function populateFacilitySelect() {

    let facilityType =
        document.getElementById("resFacilityType").value;

    let facilitySelect =
        document.getElementById("resFacilitySelect");

    // Clear old options
    facilitySelect.innerHTML = "";


    // Search facilities array
    for (let i = 0; i < facilities.length; i++) {

        if (facilities[i].type === facilityType) {

            let option =
                document.createElement("option");

            option.value =
                facilities[i].id;

            option.textContent =
                facilities[i].name;

            facilitySelect.appendChild(option);
        }
    }
}


// ==========================================
// CONVERT TIME TO MINUTES
// ==========================================

function timeToMinutes(time) {

    let parts = time.split(":");

    let hour =
        parseInt(parts[0]);

    let minute =
        parseInt(parts[1]);

    return (hour * 60) + minute;
}


// ==========================================
// COMPUTE END TIME
// ==========================================

function computeEndTime(startTime, duration) {

    let startMinutes =
        timeToMinutes(startTime);

    let endMinutes =
        startMinutes + duration;

    let hour =
        Math.floor(endMinutes / 60) % 24;

    let minute =
        endMinutes % 60;

    return (
        String(hour).padStart(2, "0") +
        ":" +
        String(minute).padStart(2, "0")
    );
}


// ==========================================
// CONVERT MINUTES TO HOURS/MINUTES
// ==========================================

function minutesToHM(minutes) {

    let hours =
        Math.floor(minutes / 60);

    let remainingMinutes =
        minutes % 60;

    let text = "";


    if (hours > 0) {

        text += hours + " hour";

        if (hours > 1) {
            text += "s";
        }
    }


    if (remainingMinutes > 0) {

        if (text !== "") {
            text += " ";
        }

        text +=
            remainingMinutes + " minute";

        if (remainingMinutes > 1) {
            text += "s";
        }
    }


    return text;
}


// ==========================================
// COMPUTE PRICE
// ==========================================

function computePrice(type, duration) {

    let hourlyRate =
        RATE[type];

    let price =
        (duration / 60) * hourlyRate;

    return Math.round(price);
}


// ==========================================
// CHECK TIME OVERLAP
// ==========================================

function isOverlapping(
    newStart,
    newEnd,
    existingStart,
    existingEnd
) {

    return (
        newStart < existingEnd &&
        existingStart < newEnd
    );
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

    let newStart =
        timeToMinutes(startTime);

    let newEnd =
        timeToMinutes(endTime);


    // Check reservations one by one
    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        let current =
            reservations[i];


        if (
            current.facilityId === facilityId &&
            current.date === date &&
            current.status !== "Cancelled"
        ) {

            let existingStart =
                timeToMinutes(
                    current.scheduledStart
                );

            let existingEnd =
                timeToMinutes(
                    current.scheduledEnd
                );


            if (
                isOverlapping(
                    newStart,
                    newEnd,
                    existingStart,
                    existingEnd
                )
            ) {

                return current;
            }
        }
    }


    return null;
}


// ==========================================
// FIND FACILITY
// ==========================================

function findFacility(facilityId) {

    for (
        let i = 0;
        i < facilities.length;
        i++
    ) {

        if (
            facilities[i].id ===
            facilityId
        ) {

            return facilities[i];
        }
    }


    return null;
}


// ==========================================
// CREATE RESERVATION
// ==========================================

function handleCreateReservation() {

    let customer =
        document
            .getElementById("resCustomer")
            .value
            .trim();


    let contact =
        document
            .getElementById("resContact")
            .value
            .trim();


    let facilityType =
        document
            .getElementById("resFacilityType")
            .value;


    let facilityId =
        document
            .getElementById("resFacilitySelect")
            .value;


    let date =
        document
            .getElementById("resDate")
            .value;


    let startTime =
        document
            .getElementById("resStartTime")
            .value;


    let duration =
        parseInt(
            document
                .getElementById("resDurationSelect")
                .value
        );


    // Check required fields
    if (
        customer === "" ||
        facilityId === "" ||
        date === "" ||
        startTime === ""
    ) {

        document.getElementById(
            "resMsg"
        ).textContent =
            "Please complete all required fields.";

        return;
    }


    // Find selected facility
    let facility =
        findFacility(facilityId);


    if (facility === null) {

        document.getElementById(
            "resMsg"
        ).textContent =
            "Facility not found.";

        return;
    }


    // Calculate ending time
    let endTime =
        computeEndTime(
            startTime,
            duration
        );


    // Check conflict
    let conflict =
        checkReservationConflict(
            facilityId,
            date,
            startTime,
            endTime
        );


    if (conflict !== null) {

        document.getElementById(
            "resMsg"
        ).textContent =
            "Cannot create reservation. " +
            facility.name +
            " is already reserved from " +
            conflict.scheduledStart +
            " to " +
            conflict.scheduledEnd +
            ".";

        return;
    }


    // Calculate price
    let price =
        computePrice(
            facilityType,
            duration
        );


    // Generate reservation ID
    let reservationId =
        "RES" +
        String(nextReservationId)
            .padStart(3, "0");


    // Create reservation object
    let newReservation = {

        id: reservationId,

        customerName: customer,

        contact: contact,

        facilityId: facilityId,

        facilityName: facility.name,

        facilityType: facilityType,

        date: date,

        scheduledStart: startTime,

        scheduledEnd: endTime,

        durationMinutes: duration,

        price: price,

        status: "Reserved"
    };


    // =====================================
    // ADD RESERVATION TO ARRAY
    // =====================================

    reservations.push(newReservation);


    // Next ID
    nextReservationId++;


    // Success message
    document.getElementById(
        "resMsg"
    ).textContent =
        reservationId +
        " successfully created for " +
        customer +
        ".";


    // =====================================
    // UPDATE TABLE
    // =====================================

    renderReservations();


    // Clear some fields
    document.getElementById(
        "resCustomer"
    ).value = "";

    document.getElementById(
        "resContact"
    ).value = "";

    document.getElementById(
        "resStartTime"
    ).value = "";
}


// ==========================================
// LINEAR SEARCH RESERVATION
// ==========================================

function linearSearchReservation(query) {

    query =
        query
            .trim()
            .toLowerCase();


    // LINEAR SEARCH
    // Check each reservation one by one
    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        let current =
            reservations[i];


        if (
            current.id
                .toLowerCase() === query ||

            current.customerName
                .toLowerCase()
                .includes(query)
        ) {

            return current;
        }
    }


    return null;
}


// ==========================================
// SEARCH BUTTON
// ==========================================

function handleReservationSearch() {

    let query =
        document
            .getElementById("resSearchInput")
            .value;


    if (query.trim() === "") {

        document.getElementById(
            "resSearchMsg"
        ).textContent =
            "Enter customer name or reservation ID.";

        return;
    }


    let found =
        linearSearchReservation(query);


    if (found !== null) {

        document.getElementById(
            "resSearchMsg"
        ).textContent =

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
            " - " +
            found.scheduledEnd +
            " | ₱" +
            found.price +
            " | " +
            found.status;

    } else {

        document.getElementById(
            "resSearchMsg"
        ).textContent =
            "No reservation found.";
    }
}


// ==========================================
// START SESSION
// ==========================================

function handleStartReservation(
    reservationId
) {

    // Linear search
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

            document.getElementById(
                "resMsg"
            ).textContent =
                reservationId +
                " session started.";

            break;
        }
    }


    renderReservations();
}


// ==========================================
// CANCEL RESERVATION
// ==========================================

function handleCancelReservation(
    reservationId
) {

    // Linear search
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

            document.getElementById(
                "resMsg"
            ).textContent =
                reservationId +
                " has been cancelled.";

            break;
        }
    }


    renderReservations();
}


// ==========================================
// DISPLAY RESERVATIONS IN TABLE
// ==========================================

function renderReservations() {

    let tableBody =
        document.getElementById(
            "reservationsBody"
        );


    // Clear table first
    tableBody.innerHTML = "";


    // Check every reservation
    for (
        let i = 0;
        i < reservations.length;
        i++
    ) {

        let current =
            reservations[i];


        // Create table row
        let row =
            document.createElement("tr");


        // ID
        let idCell =
            document.createElement("td");

        idCell.textContent =
            current.id;


        // Customer
        let customerCell =
            document.createElement("td");

        customerCell.textContent =
            current.customerName;


        // Contact
        let contactCell =
            document.createElement("td");

        contactCell.textContent =
            current.contact || "N/A";


        // Facility
        let facilityCell =
            document.createElement("td");

        facilityCell.textContent =
            current.facilityName;


        // Date
        let dateCell =
            document.createElement("td");

        dateCell.textContent =
            current.date;


        // Start
        let startCell =
            document.createElement("td");

        startCell.textContent =
            current.scheduledStart;


        // End
        let endCell =
            document.createElement("td");

        endCell.textContent =
            current.scheduledEnd;


        // Duration
        let durationCell =
            document.createElement("td");

        durationCell.textContent =
            minutesToHM(
                current.durationMinutes
            );


        // Price
        let priceCell =
            document.createElement("td");

        priceCell.textContent =
            "₱" + current.price;


        // Status
        let statusCell =
            document.createElement("td");

        statusCell.textContent =
            current.status;


        // Action
        let actionCell =
            document.createElement("td");


        // Start button
        if (
            current.status === "Reserved"
        ) {

            let startButton =
                document.createElement(
                    "button"
                );

            startButton.textContent =
                "Start";

            startButton.onclick =
                function () {

                    handleStartReservation(
                        current.id
                    );
                };


            actionCell.appendChild(
                startButton
            );
        }


        // Cancel button
        if (
            current.status !==
            "Cancelled"
        ) {

            let cancelButton =
                document.createElement(
                    "button"
                );

            cancelButton.textContent =
                "Cancel";

            cancelButton.onclick =
                function () {

                    handleCancelReservation(
                        current.id
                    );
                };


            actionCell.appendChild(
                cancelButton
            );
        }


        // Add cells to row
        row.appendChild(idCell);

        row.appendChild(customerCell);

        row.appendChild(contactCell);

        row.appendChild(facilityCell);

        row.appendChild(dateCell);

        row.appendChild(startCell);

        row.appendChild(endCell);

        row.appendChild(durationCell);

        row.appendChild(priceCell);

        row.appendChild(statusCell);

        row.appendChild(actionCell);


        // Add row to table
        tableBody.appendChild(row);
    }
}

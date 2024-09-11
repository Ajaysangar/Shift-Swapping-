document.addEventListener('DOMContentLoaded', function() {
    var buttonsModal = document.getElementById('buttonsModal');
    var tempModal = document.getElementById('tempModal');
    var shiftModal = document.getElementById('shiftModal');
    var fetchAccountsBtn = document.getElementById('fetchAccountsBtn');
    var swapShiftsBtn = document.getElementById('swapShiftsBtn');
    var swapTempsBtn = document.getElementById('swapTempsBtn');
    var closeButtons = document.querySelectorAll('.close');
    var tempData = [];
    var shiftData = [];
    var tempshiftData = [];
    var selectedRecordId = null;
    var selectedShiftIds = [];
    var currentPage = 1;
    var recordsPerPage = 10;
    const rowsPerPage = 10;
    const itemsPerPage = 10;
    let maxSelections = 2;

    function closeModals() {
        if (buttonsModal) buttonsModal.style.display = "none";
        if (tempModal) tempModal.style.display = "none";
        if (shiftModal) shiftModal.style.display = "none";

        // Clear temporary data and reset state
        tempData = [];
        shiftData = [];
        tempshiftData = [];
        selectedRecordId = null;
        selectedShiftIds = [];
        currentPage = 1;

        // Clear search boxes
        if (document.getElementById('searchBox')) {
            document.getElementById('searchBox').value = '';
        }
        if (document.getElementById('searchBoxShift')) {
            document.getElementById('searchBoxShift').value = '';
        }
       

        // Clear and reset any table data
        if (document.getElementById('tempshiftContainer')) {
            document.getElementById('tempshiftContainer').innerHTML = '';
        }
        if (document.getElementById('shiftContainer')) {
            document.getElementById('shiftContainer').innerHTML = '';
        }
        if (document.getElementById('tempcontainer')) {
            document.getElementById('tempcontainer').innerHTML = '';
        }
        
        // Remove event listeners if needed
        document.querySelectorAll('.shift-checkbox').forEach(checkbox => {
            checkbox.removeEventListener('change', handleShiftSelection);
        });

        // Hide any submit buttons
        toggleSubmitButtonVisibility();
        toggleSubmitShiftButtonVisibility();
    }

    function setupCloseButtons() {
        closeButtons.forEach(function(button) {
            button.onclick = function() {
                closeModals();
            }
        });
    }

    setupCloseButtons();

    window.onclick = function(event) {
        if (event.target === buttonsModal || event.target === tempModal || event.target === shiftModal ) {
            closeModals();
        }
    }

    if (fetchAccountsBtn) {
        fetchAccountsBtn.addEventListener('click', function() {
            buttonsModal.style.display = "block"; // Show the buttons modal
        });
    }
   
///////////////////////////
// Declare a variable to hold the selected shift ID
let selectedShiftID = '';

if (swapTempsBtn) {
    swapTempsBtn.addEventListener('click', function () {
        console.log("Swap Temp Shifts button clicked");
        buttonsModal.style.display = "none"; // Hide the buttons modal
        tempModal.style.display = "block"; // Show the temp modal
    
        // Fetch all records from Shift_Schedule
        ZOHO.CRM.API.getAllRecords({
            Entity: "Shift_Schedule",
            sort_order: "asc",
            per_page: 200
        }).then(function (response) {
            console.log("API response received:", response);
    
            // Check if response.data is valid
            if (response.data && response.data.length > 0) {
                tempshiftData = response.data.map(shift => ({
                    id: shift.id || '',
                    Name: shift.Name || '',
                    Start_Date_and_Work_Start_Time: shift.Start_Date_and_Work_Start_Time || '',
                    End_Date_and_Work_End_Time: shift.End_Date_and_Work_End_Time || '',
                    Days_in_the_Week: shift.Days_in_the_Week || '',
                    Schedule_For_Temp: shift.Schedule_For_Temp || {} // Ensure it's an object
                }));
    
                // Ensure tempshiftData is not undefined
                if (tempshiftData && tempshiftData.length > 0) {
                    console.log("Temp Shifts data processed:", tempshiftData);
                    displayshiftTempPage(currentPage); // Call the function to display shift data
                } else {
                    console.error("Processed temp shift data is empty or undefined");
                }
            } else {
                console.log("No temp shift data found");
            }
        }).catch(function (error) {
            console.error("Error fetching temp shift data:", error);
        });
    });
}
////////////////////////

if (nextButtontemp) {
    nextButtontemp.addEventListener('click', async function() {
        buttonsModal.style.display = "none";
        tempModal.style.display = "block";

        let allTemps = []; // Declare allTemps outside the try block to make it accessible globally

        try {
            // Fetch all temp records from the "Leads" module
            const allTempsResponse = await ZOHO.CRM.API.getAllRecords({
                Entity: "Leads", // The module/entity name where temp data is stored
                sort_order: "asc", // Sort the data in ascending order
                per_page: 200 // Number of records per page (adjust as needed)
            });

            // Extract Temp Name and Temp ID from the response
            allTemps = allTempsResponse.data.map(temp => ({
                id: temp.id, // Temp ID
                First_Name: temp.First_Name || 'Unknown', // Ensure first name is included
                Last_Name: temp.Last_Name || '' // Ensure last name is included
            }));

            // Log the fetched temp data
            console.log("Fetched Temp Data:", allTemps);

            // Display the temp data on the page
            //displayTempdataPage(1, allTemps); // Display the first page of temp data

        } catch (error) {
            // Handle any errors that occur during the API call
            console.error("Error fetching temp data:", error);
        }

        try {
            // Fetch the details of the specific shift using the Shift ID
            const shiftID = '6336174000001396001'; // Provided Shift ID
            const shiftResponse = await ZOHO.CRM.API.getRecord({
                Entity: "Shift_Schedule",
                RecordID: shiftID
            });

            const providedShift = shiftResponse.data[0];
            const providedShiftStartDate = moment(providedShift['Start_Date_and_Work_Start_Time']);
            const providedShiftEndDate = moment(providedShift['End_Date_and_Work_End_Time']);
            const providedShiftDays = providedShift['Days_in_the_Week'].map(day => day.toLowerCase());
            const providedShiftStartTime = moment(providedShift['Start_Date_and_Work_Start_Time']).format('HH:mm');
            const providedShiftEndTime = moment(providedShift['End_Date_and_Work_End_Time']).format('HH:mm');
            const providedTempID = providedShift['Schedule_For_Temp']; // Fetch Temp ID of the provided shift

            // Log the details of the provided shift along with Temp ID
            console.log("Shift provided:", {
                id: shiftID,
                Start_Date_and_Work_Start_Time: providedShiftStartDate.format('YYYY-MM-DD'),
                End_Date_and_Work_End_Time: providedShiftEndDate.format('YYYY-MM-DD'),
                Days_in_the_Week: providedShiftDays,
                Start_Time: providedShiftStartTime,
                End_Time: providedShiftEndTime,
                Temp_ID: providedTempID // Log Temp ID
            });

            // Pagination logic (fetch all shifts in chunks of 200)
            let page = 1;
            let allShifts = [];
            let moreRecords = true;

            while (moreRecords) {
                const allShiftsResponse = await ZOHO.CRM.API.getAllRecords({
                    Entity: "Shift_Schedule",
                    sort_order: "asc",
                    page: page,
                    per_page: 200
                });

                allShifts = allShifts.concat(allShiftsResponse.data);
                moreRecords = allShiftsResponse.info.more_records;
                page++;
            }

            // Filter out the provided shift from all shifts
            const filteredShifts = allShifts.filter(shift => shift.id !== shiftID);

            // List working dates and times
            function getWorkingDatesAndTimes(startDate, endDate, startTime, endTime, workingDays) {
                let workingDates = [];
                let currentDay = moment(startDate);
                while (currentDay.isSameOrBefore(endDate)) {
                    if (isWorkingDay(currentDay, workingDays)) {
                        workingDates.push({
                            date: currentDay.format('YYYY-MM-DD'),
                            startTime: startTime,
                            endTime: endTime
                        });
                    }
                    currentDay.add(1, 'days');
                }
                return workingDates;
            }

            // Function to check if a date is a working day based on the Days_in_the_Week value
            function isWorkingDay(date, workingDays) {
                const dayOfWeek = date.format('dddd').toLowerCase();
                if (workingDays.includes('daily')) return true;
                if (workingDays.includes('weekend')) return !['saturday', 'sunday'].includes(dayOfWeek);
                return workingDays.includes(dayOfWeek) ||
                    (workingDays.includes('weekdays') && ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayOfWeek));
            }

            let providedShiftWorkingDates = getWorkingDatesAndTimes(providedShiftStartDate, providedShiftEndDate, providedShiftStartTime, providedShiftEndTime, providedShiftDays);
            console.log("Working Dates and Times for Provided Shift:", providedShiftWorkingDates);

            // Function to check if two shifts overlap based on working dates and times (AND condition for both)
            function doShiftsOverlap(shift1WorkingDates, shift2WorkingDates) {
                return shift1WorkingDates.some(shift1Date =>
                    shift2WorkingDates.some(shift2Date => {
                        // Check if dates match and if times overlap (AND condition)
                        return shift1Date.date === shift2Date.date &&
                            moment(shift1Date.startTime, 'HH:mm').isBefore(moment(shift2Date.endTime, 'HH:mm')) &&
                            moment(shift1Date.endTime, 'HH:mm').isAfter(moment(shift2Date.startTime, 'HH:mm'));
                    })
                );
            }

            // Filter shifts that need to be checked and overlap with the provided shift
            const overlappingShifts = filteredShifts.filter(shift => {
                const shiftStart = moment(shift['Start_Date_and_Work_Start_Time']);
                const shiftEnd = moment(shift['End_Date_and_Work_End_Time']);
                const shiftDays = shift['Days_in_the_Week'].map(day => day.toLowerCase());
                const shiftStartTime = moment(shift['Start_Date_and_Work_Start_Time']).format('HH:mm');
                const shiftEndTime = moment(shift['End_Date_and_Work_End_Time']).format('HH:mm');
                const checkingTempID = shift['Schedule_For_Temp']; // Fetch Temp ID of the checking shift

                const shiftWorkingDates = getWorkingDatesAndTimes(shiftStart, shiftEnd, shiftStartTime, shiftEndTime, shiftDays);

                // Check if there are overlapping working dates and times
                const overlap = doShiftsOverlap(providedShiftWorkingDates, shiftWorkingDates);

                // Log shift details including Temp ID and working dates
                console.log("Checking shift:", {
                    id: shift.id,
                    startDate: shiftStart.format('YYYY-MM-DD'),
                    endDate: shiftEnd.format('YYYY-MM-DD'),
                    workingDays: shiftDays,
                    Start_Time: shiftStartTime,
                    End_Time: shiftEndTime,
                    Temp_ID: checkingTempID, // Log Temp ID for checking shift
                    Working_Dates_and_Times: shiftWorkingDates,
                    overlap: overlap
                });

                return overlap;
            });

            // Log shifts that overlap with the provided shift, including Temp IDs
            console.log("Overlapping Shifts:");
            overlappingShifts.forEach(shift => {
                const shiftStart = moment(shift['Start_Date_and_Work_Start_Time']);
                const shiftEnd = moment(shift['End_Date_and_Work_End_Time']);
                const shiftDays = shift['Days_in_the_Week'].map(day => day.toLowerCase());
                const shiftStartTime = moment(shift['Start_Date_and_Work_Start_Time']).format('HH:mm');
                const shiftEndTime = moment(shift['End_Date_and_Work_End_Time']).format('HH:mm');
                const checkingTempID = shift['Schedule_For_Temp'];

                console.log("Overlapping Shift:", {
                    id: shift.id,
                    Start_Date_and_Work_Start_Time: shiftStart.format('YYYY-MM-DD'),
                    End_Date_and_Work_End_Time: shiftEnd.format('YYYY-MM-DD'),
                    Days_in_the_Week: shiftDays,
                    Start_Time: shiftStartTime,
                    End_Time: shiftEndTime,
                    Temp_ID: checkingTempID // Log Temp ID
                });
            });

            // Filter temp list based on overlapping shifts and provided shift Temp ID
            function getFilteredTempList(allTemps, overlappingTempIDs, providedTempID) {
                const overlappingTempIDSet = new Set(overlappingTempIDs.map(shift => shift['Schedule_For_Temp']));
                console.log("Overlapping Temp ID Set:", overlappingTempIDSet);

                // Filter out temps that are in overlapping Temp IDs or the provided shift Temp ID
                const filteredTemps = allTemps.filter(temp => {
                    const isExcluded = overlappingTempIDSet.has(temp.id) || temp.id === providedTempID;
                    if (isExcluded) {
                        console.log(`Excluded Temp ID: ${temp.id}`);
                    }
                    return !isExcluded;
                });

                console.log("Filtered Temp List:", filteredTemps);
                return filteredTemps;
            }

            const finalTempList = getFilteredTempList(allTemps, overlappingShifts, providedTempID);
            updateTempDisplay(finalTempList); // Update the temp data display on the page

        } catch (error) {
            console.error("Error fetching shift details:", error);
        }
    });
}
            

    
    /////////////////////////////////

    // Search function for seaching temp alone page 

   


    // Search function for Swap temps button

    if (document.getElementById('searchBoxShifttemp')) {
        document.getElementById('searchBoxShifttemp').addEventListener('input', function(event) {
            const searchQuery = event.target.value.toLowerCase();
            const filteredData = tempshiftData.filter(shift => 
                (shift.Name).toLowerCase().includes(searchQuery)
            );
            displayShiftPage(1, filteredData); // Reset to the first page of filtered results
        });
    }
    if (document.getElementById('searchBoxTemptemp')) {
        document.getElementById('searchBoxTemptemp').addEventListener('input', function(event) {
            const searchQuery = event.target.value.toLowerCase();
            const filteredData = tempshiftData.filter(shift => 
                (shift.Schedule_For_Temp && shift.Schedule_For_Temp.name ? shift.Schedule_For_Temp.name : '').toLowerCase().includes(searchQuery)
            );
            displayShiftPage(1, filteredData); // Reset to the first page of filtered results
        });
    }
    

    if (swapShiftsBtn) {
        swapShiftsBtn.addEventListener('click', function() {
            console.log("Swap Shifts button clicked");
            buttonsModal.style.display = "none"; // Hide the buttons modal
            shiftModal.style.display = "block"; // Show the shift modal

            ZOHO.CRM.API.getAllRecords({
                Entity: "Shift_Schedule",
                sort_order: "asc",
                per_page: 200
            }).then(function(response) {
                console.log("API response received:", response);

                if (response.data && response.data.length > 0) {
                    shiftData = response.data.map(shift => ({
                        id: shift.id || '',
                        Name: shift.Name || '',
                        Start_Date_and_Work_Start_Time: shift.Start_Date_and_Work_Start_Time || '',
                        End_Date_and_Work_End_Time: shift.End_Date_and_Work_End_Time || '',
                        Days_in_the_Week: shift.Days_in_the_Week || '',
                        Schedule_For_Temp: shift.Schedule_For_Temp || {} // Ensure it's an object
                    }));
                    console.log("Shifts data processed:", shiftData);

                    displayShiftPage(currentPage);
                } else {
                    console.log("No shift data found");
                }
            }).catch(function(error) {
                console.error("Error fetching shift data:", error);
            });
        });
    } else {
        console.error("Swap Shifts button not found");
    }

    if (document.getElementById('prevPageBtn')) {
        document.getElementById('prevPageBtn').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayshiftTempPage(currentPage);
            }
        });
    } else {
        console.error("Previous Page button for temp not found");
    }

    if (document.getElementById('nextPageBtn')) {
        document.getElementById('nextPageBtn').addEventListener('click', function() {
            if (currentPage * recordsPerPage < tempData.length) {
                currentPage++;
                displayshiftTempPage(currentPage);
            }
        });
    } else {
        console.error("Next Page button for temp not found");
    }

    if (document.getElementById('prevShiftPageBtn')) {
        document.getElementById('prevShiftPageBtn').addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayShiftPage(currentPage);
            }
        });
    } else {
        console.error("Previous Page button for shift not found");
    }

    // Function to display the success message modal
    function showSuccessModal(message) {
        var successModal = document.getElementById('successModal');
        var successMessage = document.getElementById('successMessage');

        if (successMessage) {
            successMessage.textContent = message;
        }

        if (successModal) {
            successModal.style.display = "block";
        }
    }

    // Update the code where you handle the successful shift swap
    if (document.getElementById('submitShiftBtn')) {
        document.getElementById('submitShiftBtn').addEventListener('click', function() {
            if (selectedShiftIds.length === 2) {
                // Get the selected shifts
                const selectedShifts = shiftData.filter(shift => selectedShiftIds.includes(shift.id));
                
                if (selectedShifts.length === 2) {
                    const [shift1, shift2] = selectedShifts;

                    // Log both Shift ID and Schedule_For_Temp.id for each selected shift
                    console.log(`Shifts to swap:`);
                    console.log(`Shift 1 ID: ${shift1.id}, Temp ID: ${shift1.Schedule_For_Temp ? shift1.Schedule_For_Temp.id : 'N/A'}`);
                    console.log(`Shift 2 ID: ${shift2.id}, Temp ID: ${shift2.Schedule_For_Temp ? shift2.Schedule_For_Temp.id : 'N/A'}`);

                    // Perform swap
                    const tempId1 = shift1.Schedule_For_Temp ? shift1.Schedule_For_Temp.id : null;
                    const tempId2 = shift2.Schedule_For_Temp ? shift2.Schedule_For_Temp.id : null;
                    tempname1 = shift1.Schedule_For_Temp ? shift1.Schedule_For_Temp.First_Name : null;
                    tempname2 = shift2.Schedule_For_Temp ? shift2.Schedule_For_Temp.Last_Name : null;

                    if (tempId1 === null || tempId2 === null) {
                        showSuccessModal("Both selected shifts must have associated temps.");
                        return;
                    }
                    
                   
                    // Prepare data for updating
                    const updates = [
                        { id: shift1.id, Schedule_For_Temp: { id: tempId2 } },
                        { id: shift2.id, Schedule_For_Temp: { id: tempId1 } }
                    ];

                    // Log the data being sent to API
                    console.log("Data to be updated:", updates);

                    Promise.all(updates.map(update => {
                        console.log("Updating shift:", update); // Log each update
                        return ZOHO.CRM.API.updateRecord({
                            Entity: "Shift_Schedule",
                            RecordID: update.id,
                            APIData: update
                        }).then(response => {
                            console.log(`Update response for Shift ID ${update.id}: `, response);
                            return response; // Return the response to handle success
                        }).catch(error => {
                            console.error(`Error updating Shift ID ${update.id}:`, error);
                            if (error && error.data) {
                                console.error("Detailed error data:", error.data);
                            }
                            throw error; // Throw error to handle in Promise.all
                        });
                    }))
                    .then(responses => {
                        console.log("All updates successful:", responses);
                        showSuccessModal( ` Shifts Swapped Successfully.${tempname2}, ${tempname2}` );
                        closeModals();
                    })
                    .catch(function(error) {
                        console.error("Error updating shifts:", error);
                        if (error && error.data) {
                            console.error("Detailed error data:", error.data);
                        }
                        showSuccessModal("Failed to update shifts. Please try again.");
                    });
                } else {
                    showSuccessModal("Please select exactly two shifts for swapping.");
                }
            } else {
                showSuccessModal("Please select exactly two shifts.");
            }
        });
    } else {
        console.error("Submit button for shift not found");
    }

    // Add an event listener to close the success modal
    document.querySelector('#successModal .close').addEventListener('click', function() {
        document.getElementById('successModal').style.display = 'none';
    });

    // Search fucntion for Swap Shifts

    if (document.getElementById('searchBoxShift')) {
        document.getElementById('searchBoxShift').addEventListener('input', function(event) {
            const searchQuery = event.target.value.toLowerCase();
            const filteredData = shiftData.filter(shift => 
                (shift.Name).toLowerCase().includes(searchQuery)
            );
            displayShiftPage(1, filteredData); // Reset to the first page of filtered results
        });
    }
    if (document.getElementById('searchBoxTemp')) {
        document.getElementById('searchBoxTemp').addEventListener('input', function(event) {
            const searchQuery = event.target.value.toLowerCase();
            const filteredData = shiftData.filter(shift => 
                (shift.Schedule_For_Temp && shift.Schedule_For_Temp.name ? shift.Schedule_For_Temp.name : '').toLowerCase().includes(searchQuery)
            );
            displayShiftPage(1, filteredData); // Reset to the first page of filtered results
        });
    }
 

    ////////////////////////////////
    // Function to display shift data -  Swap Temp shift

    function displayshiftTempPage(page, data = tempshiftData) {
        const container = document.getElementById('tempshiftContainer');
        const nextButtontemp = document.getElementById('nextButtontemp');
        
        if (!container) {
            console.error("Temp Shift container element not found");
            return;
        }
        
        container.innerHTML = ''; // Clear existing options
        console.log("Temp Shift container cleared");
        
        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pagedData = data.slice(start, end);
        
        pagedData.forEach((shift, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shift.Name}</td>
                <td>${shift.Schedule_For_Temp ? shift.Schedule_For_Temp.name : 'N/A'}</td>
                <td>${shift.Start_Date_and_Work_Start_Time}</td>
                <td>${shift.End_Date_and_Work_End_Time}</td>
                <td>${shift.Days_in_the_Week}</td>
                <td>
                    <input type="radio" name="shift" value="${shift.id}" class="shift-radio" />
                </td>
            `;
            
            container.appendChild(row);
        });
        
        // Add event listener to handle radio button selection
        document.querySelectorAll('.shift-radio').forEach(radio => {
            radio.addEventListener('change', handleRadioSelection);
        });
        
        
        console.log("Temp Shift data populated");
    }
    
    function handleRadioSelection(event) {
        const selectedRadio = document.querySelector('.shift-radio:checked');
        const nextButtontemp = document.getElementById('nextButtontemp');
        
        if (nextButtontemp) {
            if (selectedRadio) {
                nextButtontemp.style.display = 'block'; // Show "Next" button if exactly one radio button is selected
            } else {
                nextButtontemp.style.display = 'none'; // Hide "Next" button if no radio button is selected
            }
        }
    }

//////////////////////////

// Global variables
let allTemps = [];

let providedTempID = null; // Initialize providedTempID as null

// Function to fetch temp data
function fetchTempData() {
    return new Promise((resolve) => {
        allTemps = [
            
            // Add more records as needed
        ];
        resolve(allTemps);
    });
}

// Function to filter temp data
function getFilteredTempList(allTemps, providedTempID) {
    return allTemps.filter(temp => temp.id !== providedTempID);
}

// Function to update the display with paginated data
function updateTempDisplay(tempData) {
    const start = (currentPage - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedData = tempData.slice(start, end);

    const tempContainer = document.getElementById("tempcontainer");
    tempContainer.innerHTML = ""; // Clear existing rows

    // Create header row
    const headerRow = document.createElement("tr");
    const nameHeader = document.createElement("th");
    nameHeader.innerText = "Name";
    const selectHeader = document.createElement("th");
    selectHeader.innerText = "Select";
    headerRow.appendChild(nameHeader);
    headerRow.appendChild(selectHeader);
    tempContainer.appendChild(headerRow);

    // Add temp data rows
    paginatedData.forEach(temp => {
        const row = document.createElement("tr");

        const tempNameCell = document.createElement("td");
        tempNameCell.innerText = `${temp.First_Name || "N/A"} ${temp.Last_Name || ""}`.trim();
        row.appendChild(tempNameCell);

        const selectCell = document.createElement("td");
        const radioBtn = document.createElement("input");
        radioBtn.type = "radio";
        radioBtn.name = "selectTemp";
        radioBtn.value = temp.id || "";

        // Show submit button when a temp is selected
        radioBtn.addEventListener("change", function() {
            document.getElementById("submitTempSelection").style.display = "block";
            providedTempID = parseInt(radioBtn.value, 10); // Set the providedTempID when a radio button is selected
        });

        selectCell.appendChild(radioBtn);
        row.appendChild(selectCell);

        tempContainer.appendChild(row);
    });
}

// Function to handle pagination
function handlePagination() {
    const finalTempList = getFilteredTempList(allTemps, providedTempID);
    if (finalTempList.length === 0) {
        document.getElementById("tempcontainer").innerHTML = "<tr><td colspan='2'>No data available</td></tr>";
        document.getElementById("prevButton").disabled = true;
        document.getElementById("nextButton").disabled = true;
        return;
    }

    document.getElementById("prevButton").disabled = currentPage === 1;
    document.getElementById("nextButton").disabled = (currentPage * recordsPerPage) >= finalTempList.length;

    updateTempDisplay(finalTempList);
}

// Event listeners for pagination buttons
document.getElementById("prevButton")?.addEventListener("click", function() {
    if (currentPage > 1) {
        currentPage--;
        handlePagination();
    }
});

document.getElementById("nextButton")?.addEventListener("click", function() {
    const finalTempList = getFilteredTempList(allTemps, providedTempID);
    if ((currentPage * recordsPerPage) < finalTempList.length) {
        currentPage++;
        handlePagination();
    }
});

// Function to open the temp selection modal
function openTempSelectionModal() {
    fetchTempData().then(() => {
        const finalTempList = getFilteredTempList(allTemps, providedTempID);
        handlePagination(); // Ensure pagination and data display are updated
        
        var tempModal = document.getElementById("tempSelectionPage");
        if (tempModal) {
            tempModal.style.display = "block";
            document.body.style.overflow = "hidden"; // Prevent scrolling
            console.log("Modal is now visible");
        } else {
            console.error("Modal with ID 'tempSelectionPage' not found.");
        }
    });
}

// Function to close any open modals
function closeCurrentModal() {
    var currentModal = document.querySelector(".modal");
    if (currentModal) {
        currentModal.style.display = "none";
    }
}

// Event listener to open the modal
document.getElementById("nextButtontemp")?.addEventListener("click", function() {
    openTempSelectionModal(); // Fetch data and open modal
});









    



    

    ///////////////////////////////////////////

    // Fucntion to display shift for Swap Shifts 

    function displayShiftPage(page, data = shiftData) {
        const container = document.getElementById('shiftContainer');
        if (!container) {
            console.error("Shift container element not found");
            return;
        }

        container.innerHTML = ''; // Clear existing options
        console.log("Shift container cleared");

        const start = (page - 1) * recordsPerPage;
        const end = start + recordsPerPage;
        const pagedData = data.slice(start, end);

        pagedData.forEach(shift => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${shift.Name}</td>
                <td>${shift.Schedule_For_Temp ? shift.Schedule_For_Temp.name : 'N/A'}</td>
                <td>${shift.Start_Date_and_Work_Start_Time}</td>
                <td>${shift.End_Date_and_Work_End_Time}</td>
                <td>${shift.Days_in_the_Week}</td>
                <td>
                    <input type="checkbox" name="shift" value="${shift.id}" class="shift-checkbox" />
                </td>
            `;

            container.appendChild(row);
        });

        document.querySelectorAll('.shift-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', handleShiftSelection);
        });

        console.log("Shift data populated");
    }

    function handleShiftSelection(event) {
        const checkbox = event.target;
        const shiftId = checkbox.value;

        if (checkbox.checked) {
            if (selectedShiftIds.length >= maxSelections) {
                checkbox.checked = false;
                alert('You can only select up to two shifts.');
            } else {
                selectedShiftIds.push(shiftId);
            }
        } else {
            selectedShiftIds = selectedShiftIds.filter(id => id !== shiftId);
        }

        toggleSubmitShiftButtonVisibility();
    }
   

    function toggleSubmitButtonVisibility() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.style.display = selectedRecordId ? 'block' : 'none';
    }

    function toggleSubmitShiftButtonVisibility() {
        const submitShiftBtn = document.getElementById('submitShiftBtn');
        submitShiftBtn.style.display = selectedShiftIds.length === maxSelections ? 'block' : 'none';
    }

    ZOHO.embeddedApp.init().then(function() {
        console.log("Zoho Embedded App SDK initialization completed");
    }).catch(function(error) {
        console.error("Zoho Embedded App SDK initialization error:", error);
    });
});


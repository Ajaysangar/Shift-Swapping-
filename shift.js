document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // Get modal elements
    var modal = document.getElementById('myModal');
    var span = document.getElementsByClassName('close')[0];

    ZOHO.embeddedApp.on("PageLoad", function(data) {
        console.log("Page loaded, Zoho Embedded App SDK initialized");

        document.getElementById('fetchAccountsBtn').addEventListener('click', function() {
            console.log("Fetch temp button clicked");

            ZOHO.CRM.API.getAllRecords({
                Entity: "Leads",
                sort_order: "asc",
                per_page: 200
            }).then(function(response) {
                console.log("API response received:", response);

                if (response.data && response.data.length > 0) {
                    const temp = response.data.map(temp => ({
                        id: temp.id,
                        First_Name: temp.First_Name
                    }));
                    console.log("Temps data processed:", temp);

                    populateRadioButtons(temp);
                } else {
                    console.log("No temp data found");
                }
            }).catch(function(error) {
                console.error("Error fetching temp data:", error);
            });

            // Display the modal
            modal.style.display = "block";
        });

        // Close the modal when the user clicks on <span> (x)
        span.onclick = function() {
            modal.style.display = "none";
        }

        // Close the modal when the user clicks anywhere outside of the modal
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    });

    function populateRadioButtons(temp) {
        const container = document.getElementById('accountRadioContainer');
        if (!container) {
            console.error("Radio container element not found");
            return;
        }
        
        container.innerHTML = ''; // Clear existing options
        console.log("Radio container cleared");

        temp.forEach(temp => {
            const label = document.createElement('label');
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'account';
            radio.value = temp.id;
            label.appendChild(radio);
            label.appendChild(document.createTextNode(temp.First_Name + " " + temp.id));
            container.appendChild(label);
            container.appendChild(document.createElement('br')); // For better spacing
        });
        console.log("Radio buttons populated with temp");
    }

    // Initialize the Zoho Embedded App SDK and add a callback for initialization success
    ZOHO.embeddedApp.init().then(function() {
        console.log("Zoho Embedded App SDK initialization completed");
    }).catch(function(error) {
        console.error("Zoho Embedded App SDK initialization error:", error);
    });
});

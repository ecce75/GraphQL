import {progressOverTime, auditRatioGraph} from "./svg.js";



const username = document.getElementById('username');
const password = document.getElementById('password');


async function getTokenFromEndPoint(event) {
        event.preventDefault();


        const credentials = btoa(username.value + ':' + password.value);

        fetch('https://01.kood.tech/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + credentials,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value,
                password: password.value
            })
        })
            .then(response => response.json())
            .then(async data => {
                if (data) {
                    // Save the JWT in local storage or handle as needed
                    localStorage.setItem('jwt', data);
                    // Redirect to profile page or another page as needed
                    await getDataFromGraphql(data);

                } else {
                    username.value = '';
                    password.value = '';
                    alert('Invalid username or password');
                }
            })
            .catch(error => {
                console.error('Error during login:', error);
            });
}

async function getDataFromGraphql(token) {
    console.log("Fetching data from graphql api")
    let results = await fetch('https://01.kood.tech/api/graphql-engine/v1/graphql', {
        method: 'POST',

        headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            query: `{
            user{ 
              createdAt
              id
              attrs
              auditRatio
              totalUp
              totalDown
              transactions(order_by: { createdAt: desc }) {
                id
                type
                amount
                createdAt
                path
              }
            }
          }`
        })
    })
    if (results.ok) {
        const userData = await results.json();
        console.log('User data: ', userData);
        // Process the retrieved data and populate the UI
        displayUserData(userData);
    } else {
        console.error('Failed to fetch user data');
        // Handle error fetching user data
    }
};


function displayUserData(userData) {
    const container = document.querySelector('.main-container')
    // Extract the first user's data
    const user = userData.data.user[0];
    const createdAt = new Date(user.createdAt).toLocaleDateString('en-GB')

    // Total xp
    let totalXP = 0;
    const excludedPaths = ["/johvi/div-01/piscine-js/", "/johvi/piscine-go"];
    user.transactions.forEach(transaction => {
        if (transaction.type === 'xp' && !excludedPaths.some(exPath => transaction.path.startsWith(exPath))) {
            totalXP += transaction.amount;
        }
    });
     // Additional code for the log-out button
    const header = document.querySelector('.main-header');
    const logoutButton = '<button id="logout-button" style="float: right; margin-right: 20px;">Log Out</button>';
    header.insertAdjacentHTML('beforeend', logoutButton);

    // Add event listener for the logout button if needed
    document.getElementById('logout-button').addEventListener('click', () => {
        // Log out logic here
        location.reload();
    });
    // Create a string to hold HTML content with styled divs
    const userDetails = `
        <div class="user-info">
            <h1>User Information</h1>
            <div class="user-detail"><strong>Name:</strong> ${user.attrs.firstName} ${user.attrs.lastName}</div>
            <div class="user-detail"><strong>Email:</strong> ${user.attrs.email}</div>
            <div class="user-detail"><strong>Profile Created:</strong> ${createdAt}</div>
            <div class="user-detail"><strong>Nationality:</strong> ${user.attrs.nationality}</div>
            <div class="user-detail"><strong>City:</strong> ${user.attrs.addressCity}</div>
            <div class="user-detail"><strong>Total XP:</strong> ${formatXP(totalXP)}</div>
        </div>
        <div class="graphs-container">
        <div id="audits-graph"></div>
        <div id="chart-container"></div>
        </div>
    `;
    // Set the innerHTML of the body (or a specific container) to the new HTML content
    container.innerHTML = userDetails;

    auditRatioGraph(user);
    progressOverTime(prepareData(user.transactions));

}

function prepareData(transactions) {
    const excludedPaths = ["/johvi/div-01/piscine-js/", "/johvi/piscine-go"];
    let cumulativeXP = 0;
    return transactions
        .filter(transaction => transaction.type === 'xp' && !excludedPaths.some(exPath => transaction.path.startsWith(exPath)))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(transaction => {
            cumulativeXP += transaction.amount;
            return { ...transaction, cumulativeXP };
        });
}


document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    if(form) {
        form.addEventListener('submit', getTokenFromEndPoint);
    }
});

export function formatXP(xp) {
    if (xp >= 1e6) {
        return (xp / 1e6).toFixed(2) + ' MB';
    } else if (xp >= 1000) {
        return (xp / 1000).toFixed(2) + ' kB';
    } else {
        return xp + ' XP';
    }
}

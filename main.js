//Maps for Site
const manufacturers = new Map();
const entries = new Map();
const standings = new Map();
const media = new Map();
//
window.onload = function () {
  let searchBar = document.querySelector("#searchBar");
  searchBar.addEventListener("keyup", FilterRecords);

  let poolStandingsBtn = document.querySelector("#poolStandings");
  poolStandingsBtn.addEventListener("click", DisplayEntries);

  let driverStandingsBtn = document.querySelector("#driverStandings");
  driverStandingsBtn.addEventListener("click", DisplayStandings);

  Promise.all([
    AJAXCall("JSON/manufacturers.json", GetManufacturers),
    AJAXCall("JSON/nascarStandings.json", GetStandings),
    AJAXCall("JSON/entriesList.json", GetEntries),
    AJAXCall("JSON/driverImages.json", GetMedia)
  ])
    .then(function () {
      DisplayEntries(entries); // all AJAX calls are complete, so display the standings
    })
    .catch(function (error) {
      console.error(error); // handle any errors that occurred during the AJAX calls
    });
};

function DisplayEntries() {
  let table = document.querySelector("#table")
  table.classList.remove("table-bordered");
  table.classList.remove("border-dark");
  let tableHead = document.querySelector("#tableHeader");
  let tableBody = document.querySelector("#tableBody");
  let title = document.querySelector("#title");
  title.innerHTML = "2023 NASCAR Pool Standings";
  let headHtml = "";
  let bodyHtml = "";

  headHtml += "<tr class=''>";
  headHtml += "<th class='sortable'>Position</th>";
  headHtml += "<th class='sortable'>Team</th>";
  headHtml += "<th class='sortable'>Points</th>";
  headHtml += "<th></th>";
  headHtml += "</tr>";

  tableHead.innerHTML = headHtml;

  let sortedEntries = Array.from(entries.entries()).sort(
    (a, b) => b[1].points - a[1].points
  );
  
  for (let i = 0; i < sortedEntries.length; i++) {
    let record = sortedEntries[i][1];
    bodyHtml += "<tr class='accordion-header hover' data-bs-toggle='collapse' data-bs-target='#record" + i + "'>";
    bodyHtml += "<th class='Position'>" + (i + 1) + "</th>";
    bodyHtml += "<th class='teamNames'>" + record.title + "</th>";
    bodyHtml += "<td class='points'>" + record.points + "</td>";
    bodyHtml += "<td class='accordion-button collapsed p-2 m-0'  data-bs-toggle='collapse' data-bs-target='#record" + i + "'></td>";
    bodyHtml += "</tr>";
    bodyHtml += "<tr id='record" + i + "' class='accordion-content collapse bg-white'>";
    bodyHtml += "<td class='accordion-body' colspan='4'>";
    bodyHtml += DisplayEntryDrivers(record);
    bodyHtml += "</td></tr>";
  }

  tableBody.innerHTML = bodyHtml;
}

function DisplayEntryDrivers(entry) {
  let drivers = [];
  let html = "";

  for (let i = 0; i < 9; i++) {
    let driver = standings.get(entry.car[i]);
    drivers.push(driver);
  } 

  html += "<div class='container'><div class='row'>";
  
  for (let i = 0; i < 9; i++) {    
    let driverMedia = media.get(drivers[i].car);
    if (i == 0 || i == 3 || i == 6) {
      html += "<div class='col-lg-4 col-md-6'><ul class='list-group'>";
    }

    html += "<li class='list-group-item fw-bold bg-white'>";
    html += driverMedia.carNumberImage + "   " + drivers[i].driver + " - " + drivers[i].stats.points;
    html += "</li>";

    if (i == 2 || i == 5 || i == 8) {
      html += "</ul></div>";
    }
  }
  html += "</div></div>";
  return html;
}

function DisplayStandings() {
  let table = document.querySelector("#table")
  table.classList.add("table-bordered");
  table.classList.add("border-dark");
  let tableHead = document.querySelector("#tableHeader");
  let tableBody = document.querySelector("#tableBody");
  let title = document.querySelector("#title");
  title.innerHTML = "2023 NASCAR Driver Standings";
  let headHtml = "";
  let bodyHtml = "";

  headHtml += "<tr class=''>";
  headHtml += "<th class=''>Pos</th>";
  headHtml += "<th class=''>Car</th>";
  headHtml += "<th class=''>Driver</th>";
  headHtml += "<th class='d-none d-md-table-cell'>Manufacturer</th>";
  headHtml += "<th class=''>Points</th>";
  headHtml += "<th class='d-none d-md-table-cell'>Starts</th>";
  headHtml += "<th class=''>Wins</th>";
  headHtml += "<th class=''>Top 5</th>";
  headHtml += "<th class='d-none d-md-table-cell'>Top 10</th>";
  headHtml += "<th class='d-none d-md-table-cell'>DNFs</th>";
  headHtml += "<th class='d-none d-md-table-cell'>Stage Wins</th>";
  headHtml += "</tr>";

  tableHead.innerHTML = headHtml;
  let i = 1;

  for (let [key, value] of standings) {
    if (value.rank != "-") {
      let record = value;
      let stats = value.stats;
      bodyHtml += "<tr class=''>";
      bodyHtml += "<td class=''>" + (i) + "</td>";
      bodyHtml +=
        "<th class='' colspan='2'>" +
        record.car +
        " " +
        record.driver +
        "</th>";
      bodyHtml += "<th class='col d-none d-md-table-cell'>" + manufacturers.get(stats.mfr) + "</th>";
      //correct points injured drivers
      if (record.car == 9) {
        points = stats.points - 112;
        bodyHtml += "<td class=''>" + points + "</td>";
      } else if (record.car == 48) {
        points = stats.points - 46;
        bodyHtml += "<td class=''>" + points + "</td>";
      } else {
        bodyHtml += "<td class=''>" + stats.points + "</td>";
      }

      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.starts + "</td>";
      bodyHtml += "<td class=''>" + stats.wins + "</td>";
      bodyHtml += "<td class=''>" + stats.top5 + "</td>";
      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.top10 + "</td>";
      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.dnfs + "</td>";
      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.stageWins + "</td>";
      bodyHtml += "</tr>";
      i++;
    }
  }

  tableBody.innerHTML = bodyHtml;
}

function GetStandings(responseText) {
  let json_data = JSON.parse(responseText);
  let standingsData = json_data;
  standingsData.forEach((Object) =>
    standings.set(parseInt(Object.car), Object)
  );
}

function GetEntries(responseText) {
  let json_data = JSON.parse(responseText);
  let entryData = json_data.entries;
  entryData.forEach((Object) => entries.set(Object.title, Object));

  for (let [key, value] of entries) {
    let points = 0;
    for (let i = 0; i < 9; i++) {
      let driver = standings.get(value.car[i]);
      driverPoints = driver.stats.points;
      points = points + parseInt(driverPoints);
    }
    value.points = points;
  }
}

function GetManufacturers(responseText) {
  let json_data = JSON.parse(responseText);
  let mfrData = json_data.manufacturer;
  mfrData.forEach((Object) => manufacturers.set(Object.mfr, Object.data));
}

function GetMedia(responseText) {
  let mediaData = JSON.parse(responseText);
  mediaData.forEach((Object) => media.set(Object.car, Object));
}

function AJAXCall(url, callback) {
  return new Promise(function (resolve, reject) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (
        xmlhttp.readyState === XMLHttpRequest.DONE &&
        xmlhttp.status === 200
      ) {
        callback(xmlhttp.responseText);
        resolve(); // resolve the Promise when AJAX call is complete
      }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
  });
}

function sortBy(column) {
  let columnName = "." + column.toLowerCase();
  let rows = Array.from(tableBody.querySelectorAll("tr"));
  rows.shift(); // remove the table header row from the array

  rows.sort(function (a, b) {
    let aPoints = parseInt(a.querySelector(columnName).textContent);
    let bPoints = parseInt(b.querySelector(columnName).textContent);
    return bPoints - aPoints;
  });

  tableBody.innerHTML = "";

  rows.forEach(function (row) {
    tableBody.appendChild(row);
  });
}

function addSort() {
  let pointsHeader = document.querySelectorAll(".sortable");
  pointsHeader.forEach((element) => {
    let x = element.innerHTML;
    element.addEventListener("click", function () {
      sortBy(x);
    });
  });
}

function FilterRecords() {
  let searchBar = document.querySelector("#searchBar");
  let resultsTable = document.querySelector("#tableBody");
  let records = resultsTable.getElementsByTagName("tr");
  let filter = searchBar.value.toUpperCase();

  for (let i = 0; i < records.length; i++) {
    let cols = records[i].getElementsByTagName("th");
    for (let j = 0; j < cols.length; j++) {
      let txtValue = cols[j].textContent || cols[j].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        records[i].style.display = "";
        break;
      } else {
        records[i].style.display = "none";
      }
    }
  }
}

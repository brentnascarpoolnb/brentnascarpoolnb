//Maps for Site
const manufacturers = new Map();
const entries = new Map();
const standings = new Map();
const media = new Map();

//bracket object
const bracket = [
  { group: ["22", "9", "5", "11"] },
  { group: ["8", "4", "19", "12"] },
  { group: ["1", "20", "24", "45"] },
  { group: ["14", "48", "3", "99"] },
  { group: ["2", "10", "43", "6"] },
  { group: ["17", "23", "47", "16"] },
  { group: ["21", "54", "42"] },
  { group: ["31", "34", "41"] },
  { group: ["7", "38", "77"] },
];

// On load function
window.onload = function () {
  let searchBar = document.querySelector("#searchBar");
  searchBar.addEventListener("keyup", FilterRecords);

  let poolStandingsBtn = document.querySelector("#poolStandings");
  poolStandingsBtn.addEventListener("click", DisplayEntries);

  let driverStandingsBtn = document.querySelector("#driverStandings");
  driverStandingsBtn.addEventListener("click", DisplayStandings);

  let poolGroupsBtn = document.querySelector("#poolGroups");
  poolGroupsBtn.addEventListener("click", DisplayBracket);

  Promise.all([
    AJAXCall("JSON/manufacturers.json", GetManufacturers),
    AJAXCall("JSON/nascarStandings.json", GetStandings),
    AJAXCall("JSON/entriesList.json", GetEntries),
    AJAXCall("JSON/driverImages.json", GetMedia),
  ])
    .then(function () {
      DisplayEntries(entries); // all AJAX calls are complete, so display the standings
    })
    .catch(function (error) {
      console.error(error); // handle any errors that occurred during the AJAX calls
    });
};

function FillModal() {
  //get data
  let driverNum = this.getAttribute("id");
  let driver = standings.get(parseInt(driverNum));
  let driverMedia = media.get(driverNum);
  let driverName = driver.driver.split(" ");

  //get fields
  let modalLabel = document.querySelector("#modalLabel");
  let modalDriverImg = document.querySelector("#modalDriverImg");
  let modalNumber = document.querySelector("#modalNumber");
  let raceWinsModal = document.querySelector("#raceWinsModal");
  let firstName = document.querySelector("#firstName");
  let lastName = document.querySelector("#lastName");
  let modalMFR = document.querySelector("#modalMfr");
  let modalWins = document.querySelector("#modalWins");
  let modalTop5 = document.querySelector("#modalTop5");
  let modalPoints = document.querySelector("#modalPoints");

  //fill fields
  modalLabel.innerHTML = driver.car + " - " + driver.driver;
  modalDriverImg.innerHTML = driverMedia.driverImage;
  modalNumber.src = driverMedia.carNumberImage.src;
  modalNumber.alt = driverMedia.carNumberImage.alt;
  let mfr = manufacturers.get(driver.stats.mfr);
  modalWins.innerHTML = driver.stats.wins;
  modalTop5.innerHTML = driver.stats.top5;
  modalPoints.innerHTML = driver.stats.points;

  //logic for winner decals
  if (driver.stats.wins > 0) {
    html = "";
    for (let i = 0; i < driver.stats.wins; i++) {
      html +=
        "<img class='' src='images/winnerLogo.png' alt='Nascar race winner logo'/>";
    }
    raceWinsModal.innerHTML = html;
  } else {
    raceWinsModal.innerHTML = "";
  }

  //logic for name field
  firstName.innerHTML = driverName[0];
  lastName.innerHTML = driverName[1];
  if (driverName.length >= 3)
    lastName.innerHTML = driverName[1] + " " + driverName[2];

  modalMFR.innerHTML =
    "<img class='mfrLogoModal' src='" + mfr.src + "' alt='" + mfr.alt + "'/>";
}

function AddModalEvents() {
  const carInstances = document.querySelectorAll(".carInstance");
  carInstances.forEach((elm) => {
    elm.addEventListener("click", FillModal);
  });
}

function DisplayEntries() {
  let table = document.querySelector("#table");
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
    bodyHtml +=
      "<tr class='accordion-header hover' data-bs-toggle='collapse' data-bs-target='#record" +
      i +
      "'>";
    bodyHtml += "<th class='Position'>" + (i + 1) + "</th>";
    bodyHtml += "<th class='teamNames'>" + record.title + "</th>";
    bodyHtml += "<td class='points'>" + record.points + "</td>";
    bodyHtml +=
      "<td class='accordion-button collapsed p-2 m-0'  data-bs-toggle='collapse' data-bs-target='#record" +
      i +
      "'></td>";
    bodyHtml += "</tr>";
    bodyHtml +=
      "<tr id='record" + i + "' class='accordion-content collapse bg-white'>";
    bodyHtml += "<td class='accordion-body' colspan='4'>";
    bodyHtml += DisplayEntryDrivers(record);
    bodyHtml += "</td></tr>";
  }

  tableBody.innerHTML = bodyHtml;
  AddModalEvents();
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

    html +=
      "<li id ='" +
      drivers[i].car +
      "'class='list-group-item fw-bold bg-white carInstance hover'" +
      " data-bs-toggle='modal' data-bs-target='#driverModal'>";
    let img =
      "<img class='driverNum' src='" +
      driverMedia.carNumberImage.src +
      "' alt='" +
      driverMedia.carNumberImage.alt +
      "'/>";
    html += img + "   " + drivers[i].driver + " - " + drivers[i].stats.points;
    html += "</li>";

    if (i == 2 || i == 5 || i == 8) {
      html += "</ul></div>";
    }
  }
  html += "</div></div>";
  return html;
}

function DisplayStandings() {
  let table = document.querySelector("#table");
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
      bodyHtml +=
        "<tr id='" +
        record.car +
        "'class='carInstance hover'  data-bs-toggle='modal' data-bs-target='#driverModal'>";
      bodyHtml += "<td class=''>" + i + "</td>";
      bodyHtml +=
        "<th class='' colspan='2'>" +
        record.car +
        " " +
        record.driver +
        "</th>";
      let mfr = manufacturers.get(stats.mfr);
      let mfrImg =
        "<img class='mfrLogoModal' src='" +
        mfr.src +
        "' alt='" +
        mfr.alt +
        "'/>";
      bodyHtml += "<th class='col d-none d-md-table-cell'>" + mfrImg + "</th>";
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

      bodyHtml +=
        "<td class='d-none d-md-table-cell'>" + stats.starts + "</td>";
      bodyHtml += "<td class=''>" + stats.wins + "</td>";
      bodyHtml += "<td class=''>" + stats.top5 + "</td>";
      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.top10 + "</td>";
      bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.dnfs + "</td>";
      bodyHtml +=
        "<td class='d-none d-md-table-cell'>" + stats.stageWins + "</td>";
      bodyHtml += "</tr>";
      i++;
    }
  }

  tableBody.innerHTML = bodyHtml;
  AddModalEvents();
}

function DisplayBracket() {
  let htmlArray = BuildGroupTables();
  let table = document.querySelector("#table");
  table.classList.add("table-bordered");
  table.classList.add("border-dark");
  let tableHead = document.querySelector("#tableHeader");
  let tableBody = document.querySelector("#tableBody");
  let title = document.querySelector("#title");
  title.innerHTML = "2023 NASCAR Pool Bracket";
  let headHtml = "";
  let bodyHtml = "";

  headHtml += "<tr class=''>";
  headHtml += "<th class=''>2023 Bracket</th>";
  headHtml += "</tr>";
  tableHead.innerHTML = headHtml;

  bodyHtml += "<tr class=''>";
  bodyHtml += "<td class=''>";
  bodyHtml += "<div class='container'><div class='row row-cols-lg-3 row-cols-md-1'>";

  for (let i = 0; i < 9; i++) {
    bodyHtml += "<div class='col'>";
    bodyHtml += htmlArray[i];
    bodyHtml += "</div>";
  };

  bodyHtml += "</td></tr></div></div>";

  tableBody.innerHTML = bodyHtml;
}

function BuildGroupTables () {
  let htmlArray = [];
  let i = 1;

  bracket.forEach((Object) => {
    let group = Object.group;
    let html = "";
    html += "<table class='table table-sm'>";
    html += "<tr class='bg-black fw-bold text-white'><th class='' colspan='3'>Group " + i +"</th></tr>";
    html += "<tr class=''>";
    html += "<th class=''>Number</th>";
    html += "<th class=''>Driver</th>";
    html += "<th class=''>Points</th>";
    html += "</tr>";
    group.forEach((carNum) => {
      let driver = standings.get(parseInt(carNum));
      let driverMedia = media.get(driver.car);
      let img =
      "<img class='driverNum' src='" +
      driverMedia.carNumberImage.src +
      "' alt='" +
      driverMedia.carNumberImage.alt +
      "'/>";
      html += "<tr class=''>";
      html += "<td class=''>" + img + "</td>";
      html += "<td class=''>" + driver.driver + "</td>";
      html += "<td class=''>" + driver.stats.points + "</td>";
      html += "</tr>";
    });
    html += "</table>";
    htmlArray.push(html);
    i++;
  });
  return htmlArray;
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

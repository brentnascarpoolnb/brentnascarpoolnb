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
  AJAXCall("JSON/nascarStandings.json", GetStandings)
])
  .then(function () {
    return Promise.all([
      AJAXCall("JSON/entriesList.json", GetEntries),
      AJAXCall("JSON/driverImages.json", GetMedia)
    ]);
  })
  .then(function () {
    DisplayEntries(entries); // All AJAX calls are complete, so display the standings
  })
  .catch(function (error) {
    console.error(error); // Handle any errors that occurred during the AJAX calls
  });
};

function FillModal() {
  //get data
  let driverNum = this.getAttribute("id");
  let { driver, driverMedia } = GetDriver(driverNum);
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
  let mfr = getMfr(driver);
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
  //Build Table Header
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

  //Fill Table
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
  let drivers = []; //array for drivers
  let html = "";

  for (let i = 0; i < 9; i++) {
    let driver = GetDriver(entry.car[i]);
    drivers.push(driver);
  }

  html += "<div class='container'><div class='row'>";

  for (let i = 0; i < 9; i++) {
    if (i == 0 || i == 3 || i == 6) {
      html += "<div class='col-lg-4 col-md-6'><ul class='list-group'>";
    }

    html +=
      "<li id ='" +
      drivers[i].driver.car +
      "'class='list-group-item fw-bold bg-white carInstance hover'" +
      " data-bs-toggle='modal' data-bs-target='#driverModal'>";
    let img =
      "<img class='driverNum' src='" +
      drivers[i].driverMedia.carNumberImage.src +
      "' alt='" +
      drivers[i].driverMedia.carNumberImage.alt +
      "'/>";
    html +=
      img +
      "   " +
      drivers[i].driver.driver +
      " - " +
      drivers[i].driver.stats.points;
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

  //Fill Table
  RemovePoints();
  let sortedStandings = Array.from(standings.entries()).sort(
    (a, b) => b[1].stats.points - a[1].stats.points
  );

  sortedStandings.forEach((entry, index) => {
    let [carNumber, record] = entry;
    let stats = record.stats;
    let points = stats.points;
    let mfr = getMfr(record);

    bodyHtml +=
      "<tr id='" +
      carNumber +
      "' class='carInstance hover' data-bs-toggle='modal' data-bs-target='#driverModal'>";
    bodyHtml += "<td class=''>" + (index + 1) + "</td>";
    bodyHtml +=
      "<th class='' colspan='2'>" + carNumber + " " + record.driver + "</th>";
    let mfrImg =
      "<img class='mfrLogoModal' src='" + mfr.src + "' alt='" + mfr.alt + "'/>";
    bodyHtml += "<th class='col d-none d-md-table-cell'>" + mfrImg + "</th>";
    bodyHtml += "<td class=''>" + points + "</td>";
    bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.starts + "</td>";
    bodyHtml += "<td class=''>" + stats.wins + "</td>";
    bodyHtml += "<td class=''>" + stats.top5 + "</td>";
    bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.top10 + "</td>";
    bodyHtml += "<td class='d-none d-md-table-cell'>" + stats.dnfs + "</td>";
    bodyHtml +=
      "<td class='d-none d-md-table-cell'>" + stats.stageWins + "</td>";
    bodyHtml += "</tr>";
  });

  tableBody.innerHTML = bodyHtml;
  AddModalEvents();
  
  AddPoints();
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
  bodyHtml +=
    "<div class='container'><div class='row row-cols-lg-3 row-cols-md-1'>";

  for (let i = 0; i < 9; i++) {
    bodyHtml += "<div class='col'>";
    bodyHtml += htmlArray[i];
    bodyHtml += "</div>";
  }

  bodyHtml += "</td></tr></div></div>";

  tableBody.innerHTML = bodyHtml;
}

function BuildGroupTables() {
  let htmlArray = [];
  let i = 1;

  bracket.forEach((Object) => {
    let group = Object.group;
    let html = "";
    html += "<table class='table table-sm'>";
    html +=
      "<tr class='bg-black fw-bold text-white'><th class='' colspan='3'>Group " +
      i +
      "</th></tr>";
    html += "<tr class=''>";
    html += "<th class=''>Number</th>";
    html += "<th class=''>Driver</th>";
    html += "<th class=''>Points</th>";
    html += "</tr>";
    group.forEach((carNum) => {
      //get data
      let { driver, driverMedia } = GetDriver(carNum);

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

function AddPoints () {
  // Correct points for specific car numbers
  let elliot = standings.get(9);
  elliot.stats.points += 112;
  standings.set(9, elliot);

  let bowman = standings.get(48);
  bowman.stats.points += 46;
  standings.set(48, bowman);

  let gregson = standings.get(42);
  gregson.stats.points += 14;
  standings.set(42, gregson);
}

function RemovePoints () {
  // Correct points for specific car numbers
  let elliot = standings.get(9);
  elliot.stats.points -= 112;
  standings.set(9, elliot);

  let bowman = standings.get(48);
  bowman.stats.points -= 46;
  standings.set(48, bowman);

  let gregson = standings.get(42);
  gregson.stats.points -= 11;
  standings.set(42, gregson);
}

function GetDriver(driverNum) {
  let num = parseInt(driverNum);
  let driver, driverMedia;

  try {
    driver = standings.get(num);
  } catch (error) {
    console.error("Error occurred while getting driver:", error);
    driver = {
      car: "000",
      driver: "Nascar Driver",
      stats: {
        mfr: 0,
        points: 0,
        starts: 0,
        wins: 0,
        top5: 0,
        top10: 0,
        dnfs: 0,
        stageWins: 0,
      },
      rank: "999",
    };
  }

  try {
    driverMedia = media.get(num);
  } catch (error) {
    console.error("Error occurred while getting driver media:", error);
    driverMedia = {
      car: "000",
      driver: "Nascar Driver",
      driverImage:
        "<img class='driverPicture' src='images/driverImgs/default.png' alt='A silhouette of a race car driver'/>",
      carNumberImage: {
        src: "images/driverNums/1.png",
        alt: "1",
      },
    };
  }

  return { driver, driverMedia };
}

function getMfr(driver) {
  let mfr;
  try {
    mfr = manufacturers.get(driver.stats.mfr);
  } catch (error) {
    console.error("Error occurred while getting driver:", error);
    mfr = {
      mfr: 0,
      data: {
        src: "images/mfr/chevy.png",
        alt: "The Chevrolet Logo",
      },
    };
  }
  return mfr;
}

function GetStandings(responseText) {
  let json_data = JSON.parse(responseText);
  let standingsData = json_data;
  standingsData.forEach((object) => {
    // Convert stats to integers
    object.stats.mfr = parseInt(object.stats.mfr);
    object.stats.points = parseInt(object.stats.points);
    object.stats.starts = parseInt(object.stats.starts);
    object.stats.wins = parseInt(object.stats.wins);
    object.stats.top5 = parseInt(object.stats.top5);
    object.stats.top10 = parseInt(object.stats.top10);
    object.stats.dnfs = parseInt(object.stats.dnfs);
    object.stats.stageWins = parseInt(object.stats.stageWins);

    standings.set(parseInt(object.car), object);
  });
}

function GetEntries(responseText) {
  let json_data = JSON.parse(responseText);
  let entryData = json_data.entries;
  entryData.forEach((Object) => entries.set(Object.title, Object));

  for (let [key, value] of entries) {
    let points = 0;
    for (let i = 0; i < 9; i++) {
      let driver = standings.get(parseInt(value.car[i]));
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
  mediaData.forEach((Object) => media.set(parseInt(Object.car), Object));
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

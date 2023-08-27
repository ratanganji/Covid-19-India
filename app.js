const express = require("express");

const app = express();

const sqlite3 = require("sqlite3");

const { open } = require("sqlite");

let db = null;

app.use(express.json());

const path = require("path");

const dbPath = path.join(__dirname, "covid19India.db");

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const convertingDBObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const getAllStates = `
    SELECT * 
    FROM state
    ORDER BY state_id;`;

  const stateList = await db.all(getAllStates);
  response.send(
    stateList.map((state) => {
      return convertingDBObjectToResponseObject(state);
    })
  );
});

const convertingDBObjectToResponseObject2 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getAllStates = `
    SELECT * 
    FROM state
    WHERE state_id = ${stateId};`;

  const stateDetails = await db.get(getAllStates);
  response.send(convertingDBObjectToResponseObject2(stateDetails));
});

app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const dbResponse2 = `
INSERT INTO district
(district_name, state_id, cases, cured, active, deaths)
VALUES (
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
);`;

  const insertedDistrictDetails = await db.run(dbResponse2);

  response.send("District Successfully Added");
});

const convertingDBObjectToResponseObject3 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictDetails = `
    SELECT * 
    FROM district
    WHERE district_id = ${districtId};`;

  const districtDetails = await db.get(getDistrictDetails);
  response.send(convertingDBObjectToResponseObject3(districtDetails));
});

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;

  const deleteDistrictDetails = `
DELETE FROM district
WHERE district_id = ${districtId};`;

  const deletedDistrictDetails = await db.run(deleteDistrictDetails);

  response.send("District Removed");
});

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;

  const dbResponse3 = `
UPDATE district
SET 
 
   district_name = '${districtName}',
   state_id = ${stateId},
  cases =  ${cases},
   cured = ${cured},
   active =  ${active},
   deaths = ${deaths}
   WHERE district_id = ${districtId};`;

  const updatedDistrictDetails = await db.run(dbResponse3);

  response.send("District Details Updated");
});

const convertingDBObjectToResponseObject4 = (dbObject) => {
  return {
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStateReport = `
    SELECT
    SUM(cases) as totalCases,
    SUM(cured) as totalCured,
    SUM(active) as totalActive,
    SUM(deaths) as totalDeaths 
    FROM district
    WHERE state_id = ${stateId};`;

  const stateDetails = await db.get(getStateReport);
  response.send(stateDetails);
});

app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateReport = `
    SELECT state_name 
    FROM state JOIN district
    ON state.state_id = district.state_id
    WHERE district.district_id = ${districtId};`;

  const stateDetails = await db.get(getStateReport);
  response.send({ stateName: stateDetails.state_name });
});
module.exports = app;

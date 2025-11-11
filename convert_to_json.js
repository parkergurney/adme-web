import fs from "fs";
import path from "path";
import csv from "csvtojson";

const inputPath = path.resolve("./app/data/permeability.csv");
const outputPath = path.resolve("./app/data/permeability.json");

const run = async () => {
  try {
    const jsonArray = await csv().fromFile(inputPath);

    // Filter out metadata rows like RESULT_TYPE and RESULT_DESCR
    const filtered = jsonArray.filter(row => 
      row.PUBCHEM_SID && row.PUBCHEM_SID.trim() !== "" && row.PUBCHEM_SID !== "PUBCHEM_SID"
    );

    // Optional cleanup: only keep key columns
    const cleaned = filtered.map(row => ({
      PUBCHEM_SID: row.PUBCHEM_SID || null,
      PUBCHEM_CID: row.PUBCHEM_CID || null,
      SMILES_ISO:
        row.SMILES ||
        row.SMILES_ISO ||
        row.PUBCHEM_EXT_DATASOURCE_SMILES ||
        "",
      PUBCHEM_ACTIVITY_OUTCOME:
        row.PUBCHEM_ACTIVITY_OUTCOME || row.Activity_Outcome || null,
      Permeability:
        row.Permeability ||
        row["Permeability (High/Low)"] ||
        row.Phenotype ||
        null,
    }));

    fs.writeFileSync(outputPath, JSON.stringify(cleaned, null, 2));
    console.log(`✅ Saved ${cleaned.length} valid entries to app/data/permeability.json`);
  } catch (err) {
    console.error("❌ Error converting CSV to JSON:", err.message);
  }
};

run();

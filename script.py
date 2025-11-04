from rdkit import Chem
from rdkit.Chem import DataStructs
from rdkit.Chem import rdFingerprintGenerator
import pandas as pd
import argparse
import json

def get_similarity(smiles_a, smiles_b):
	mol = Chem.MolFromSmiles(smiles_a)
	mol_b = Chem.MolFromSmiles(smiles_b)
	gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
	fp = gen.GetFingerprint(mol)
	fp_b = gen.GetFingerprint(mol_b)
	return DataStructs.TanimotoSimilarity(fp, fp_b)

def top5_similar(smiles_query, csv_path="/Users/parkergurney/Development/adme-web/permeability.csv"):
	
	query_mol = Chem.MolFromSmiles(smiles_query)
	if query_mol is None:
		raise ValueError("Invalid query SMILES")

	df = pd.read_csv(csv_path)
	if "SMILES_ISO" not in df.columns:
		raise ValueError("CSV must contain a 'SMILES_ISO' column")

	gen = rdFingerprintGenerator.GetMorganGenerator(radius=2, fpSize=2048)
	query_fp = gen.GetFingerprint(query_mol)

	results = []
	for idx, row in df.iterrows():
		smiles = row.get("SMILES_ISO")
		if not isinstance(smiles, str) or not smiles:
			continue
		mol = Chem.MolFromSmiles(smiles)
		if mol is None:
			continue
		fp = gen.GetFingerprint(mol)
		sim = DataStructs.TanimotoSimilarity(query_fp, fp)
		results.append({
			"index": idx,
			"SMILES_ISO": smiles,
			"similarity": float(sim),
			"PUBCHEM_SID": row.get("PUBCHEM_SID"),
			"PUBCHEM_CID": row.get("PUBCHEM_CID"),
			"Permeability": row.get("Permeability"),
			"Outcome": row.get("PUBCHEM_ACTIVITY_OUTCOME")
		})

	# Sort and take top 5
	results.sort(key=lambda r: r["similarity"], reverse=True)
	return results[:5]

def main():
	parser = argparse.ArgumentParser(description="Compute top-5 similar molecules from CSV")
	parser.add_argument("--smiles", required=True, help="Query SMILES string")
	parser.add_argument("--csv", dest="csv_path", default="/Users/parkergurney/Development/adme-web/permeability.csv", help="Path to CSV containing SMILES_ISO column")
	args = parser.parse_args()

	try:
		results = top5_similar(args.smiles, args.csv_path)
		print(json.dumps({"results": results}))
	except Exception as e:
		print(json.dumps({"error": str(e)}))
		raise

if __name__ == "__main__":
	main()
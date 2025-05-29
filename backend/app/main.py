from fastapi import FastAPI, HTTPException
from rdkit import Chem
from rdkit.Chem import Descriptors
import requests

app = FastAPI()


@app.post("/compound/")
async def create_compound(smiles: str):
    # Валидация SMILES
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise HTTPException(status_code=400, detail="Invalid SMILES")

    # Расчет свойств через RDKit
    props = {
        "molecular_weight": Descriptors.MolWt(mol),
        "logp": Descriptors.MolLogP(mol),
        "formula": Chem.rdMolDescriptors.CalcMolFormula(mol)
    }

    return {"smiles": smiles, **props}


@app.get("/search-pubchem/")
async def search_pubchem(name: str):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/InChIKey,CanonicalSMILES,MolecularFormula/JSON"
    response = requests.get(url)

    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Compound not found")

    return response.json()
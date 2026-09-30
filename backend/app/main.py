from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from rdkit import Chem
from rdkit.Chem import Descriptors, rdMolDescriptors
import requests

from database import engine, get_db
import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Organic Chemicals DB")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/compound/")
async def get_compound(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise HTTPException(status_code=400, detail="Invalid SMILES")

    return {
        "smiles": smiles,
        "formula": rdMolDescriptors.CalcMolFormula(mol),
        "molecular_weight": round(Descriptors.MolWt(mol), 3),
        "logp": round(Descriptors.MolLogP(mol), 3),
        "hbd": rdMolDescriptors.CalcNumHBD(mol),
        "hba": rdMolDescriptors.CalcNumHBA(mol),
        "tpsa": round(rdMolDescriptors.CalcTPSA(mol), 2),
    }


@app.get("/search-pubchem/")
async def search_pubchem(name: str):
    url = f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/{name}/property/InChIKey,CanonicalSMILES,MolecularFormula,MolecularWeight,IUPACName/JSON"
    response = requests.get(url, timeout=8)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Compound not found in PubChem")
    props = response.json().get("PropertyTable", {}).get("Properties", [{}])[0]
    return {
        "smiles": props.get("CanonicalSMILES", ""),
        "formula": props.get("MolecularFormula", ""),
        "molecular_weight": props.get("MolecularWeight"),
        "name": props.get("IUPACName", name),
        "inchi_key": props.get("InChIKey", ""),
    }


@app.post("/compounds/save")
async def save_compound(name: str, smiles: str, db: Session = Depends(get_db)):
    mol = Chem.MolFromSmiles(smiles)
    if not mol:
        raise HTTPException(status_code=400, detail="Invalid SMILES")

    compound = models.Compound(
        name=name,
        smiles=smiles,
        molecular_formula=rdMolDescriptors.CalcMolFormula(mol),
        molecular_weight=round(Descriptors.MolWt(mol), 3),
        logp=round(Descriptors.MolLogP(mol), 3),
    )
    db.add(compound)
    db.commit()
    db.refresh(compound)
    return compound


@app.get("/compounds/")
async def list_compounds(db: Session = Depends(get_db)):
    return db.query(models.Compound).all()


@app.delete("/compounds/{compound_id}")
async def delete_compound(compound_id: int, db: Session = Depends(get_db)):
    compound = db.query(models.Compound).filter(models.Compound.id == compound_id).first()
    if not compound:
        raise HTTPException(status_code=404, detail="Compound not found")
    db.delete(compound)
    db.commit()
    return {"ok": True}

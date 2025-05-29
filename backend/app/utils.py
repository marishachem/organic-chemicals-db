from rdkit import Chem
from rdkit.Chem import Draw

def mol_to_image(smiles: str, size=(300, 300)):
    mol = Chem.MolFromSmiles(smiles)
    img = Draw.MolToImage(mol, size=size)
    return img
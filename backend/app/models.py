from sqlalchemy import Column, Integer, String, Float
from database import Base


class Compound(Base):
    __tablename__ = "compounds"

    id = Column(Integer, primary_key=True)
    name = Column(String(200))
    smiles = Column(String(500))
    molecular_formula = Column(String(100))
    molecular_weight = Column(Float)
    logp = Column(Float)
    # Добавьте другие свойства по необходимости
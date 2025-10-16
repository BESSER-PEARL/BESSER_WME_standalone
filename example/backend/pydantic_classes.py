from datetime import datetime, date
from typing import List, Optional, Union, Set
from enum import Enum
from pydantic import BaseModel


############################################
# Enumerations are defined here
############################################

############################################
# Classes are defined here
############################################
class MeasureCreate(BaseModel):
    value: int
    day: date


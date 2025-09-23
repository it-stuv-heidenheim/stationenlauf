from datetime import datetime
from typing import Tuple
from pydantic import BaseModel, Field


class Location(BaseModel):
    latitude: float = Field(default=0)
    longitude: float = Field(default=0)

    def to_point(self) -> (float,float):
        return self.latitude, self.longitude


class Station(BaseModel):
    uuid: str | None = Field(default=None, description="The unique identifier of the Station")
    description: str | None = Field(default=None,
                                    description="The Description of the station. Example: DHBW Würfel – Marienstraße 20")
    location: Location = Field(default=Location(), description="The Locationdata of the Station (Latitude, Longitude)")

class Task(BaseModel):
    uuid: str | None = Field(default="0")
    label: str = Field(default="")
    code: str = Field(default="")
    station_uuid: str = Field()




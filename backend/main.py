from fastapi import FastAPI, Body, HTTPException
from typing import Annotated
from models import Station, Task
from fastapi.middleware.cors import CORSMiddleware

from db import DbConnector

db = DbConnector()
app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )


    ##Get URLS

@app.get("/stations/get/all", tags=["Station"])
async def get_all_stations() -> list[Station]:
    return db.get_all_stations()

@app.get("/station/get/{uuid}", tags=["Station"])
async def get_one_station(uuid:str) -> Station:
    return db.get_station(uuid)

@app.post("/station/post/newStation", tags=["Station"], status_code=201)
async def post_new_station(station: Annotated[Station, Body()]) -> str:
    return db.create_new_station(station=station)

@app.put("/station/put/updateStation", tags=["Station"], status_code=201)
async def update_station(station: Annotated[Station,Body()]) -> Station:
    return db.update_station(station)

@app.delete("/station/delete/{uuid}", tags=["Station"])
async  def delete_station(uuid: str) -> str:
    db.delete_station(uuid)
    return "success"

@app.get("/task/get/all", tags=["Task"])
async def get_all_tasks() -> list[Task]:
    return db.get_all_tasks()

@app.get("task/get/{uuid}", tags=["Task"])
async def get_one_task(uuid) -> Task:
    return db.get_task(uuid)

@app.get("/task/get/byStation/{station_uuid}", tags=["Task"])
async def get_tasks_by_station(station_uuid:str) -> list[Task]:
    return db.get_tasks_by_station(station_uuid)

@app.post("/task/post/newTask", tags=["Task"])
async def create_task(task: Annotated[Task, Body()]) -> str:
    return db.create_task(task=task)

@app.put("/task/put/updateTask", tags=["Task"], status_code=201)
async def update_station(task: Annotated[Task,Body()]) -> Task:
    return db.update_task(task)

@app.delete("/task/delete/{uuid}", tags=["Task"])
def delete_task(uuid:str) -> str:
    db.delete_task(uuid)
    return "success"


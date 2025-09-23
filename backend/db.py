import ast
import os

import psycopg2
from configparser import ConfigParser

from fastapi import HTTPException

from models import Station, Task


def load_config(filename='database.ini'):
    section = 'postgresql' if os.environ.get('Stage') == 'Production' else 'postgresql-dev'
    parser = ConfigParser()
    parser.read(filename)
    # get section, default to postgresql
    config = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            config[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))
    return config


class DbConnector:
    def __init__(self):
        self.conn = None
        try:
            params = load_config()
            self.conn = psycopg2.connect(**params)
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)

        self.create_table()

    def create_table(self):
        create_table_query = """
        CREATE TABLE IF NOT EXISTS Station (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            location point NOT NULL,
            description TEXT
        );
        
        CREATE TABLE IF NOT EXISTS Task (
            id uuid primary key default gen_random_uuid(),
            label text NOT NULL,
            codePlain varchar(4) NOT NULL,
            station_id uuid NOT NULL,
            FOREIGN KEY(station_id) REFERENCES station(id) ON DELETE CASCADE 
        );
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(create_table_query)
                self.conn.commit()
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)

    def __del__(self):
        if self.conn is not None:
            self.conn.close()
            print('Database connection closed.')

    #Station Methods

    def get_all_stations(self):
        select_query = """
        SELECT id, location, description FROM Station
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query)
                response = cursor.fetchall()
                stations = []
                for row in response:
                    station = Station()
                    station.uuid = row[0]
                    station.location.latitude = ast.literal_eval(row[1])[0]
                    station.location.longitude = ast.literal_eval(row[1])[1]
                    station.description = row[2]

                    stations.append(station)
                print(stations)
                return stations
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def get_station_uuids(self) -> list[str]:
        select_query = """
            SELECT id FROM station;
            """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query)
                response = cursor.fetchall()
                ids = []
                for row in response:
                    ids.append(row[0])
                return ids
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            return []

    def get_station(self, uuid:str):
        if not uuid in self.get_station_uuids():
            raise HTTPException(status_code=404, detail="Station not found")

        select_query = """
            SELECT id, description, location 
            FROM station
            where id=%s;
            """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query, vars=(uuid,))
                response = cursor.fetchone()
                station = Station()
                station.uuid = response[0]
                station.description = response[1]
                station.location.latitude = ast.literal_eval(response[2])[0]
                station.location.longitude = ast.literal_eval(response[2])[1]
            return station
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def create_new_station(self, station):
        insert_query = """
        INSERT INTO station (description, location) VALUES (%s, %s) RETURNING id;
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(insert_query, (station.description, str(station.location.to_point())))
                self.conn.commit()
                return cursor.fetchone()[0]
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def update_station(self, station):
        if not station.uuid in self.get_station_uuids():
            raise HTTPException(status_code=404, detail="Station not found")

        update_query = """
        update station
        set description = %s, location = %s
        where id = %s
        """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(update_query, (station.description, str(station.location), station.uuid,))
            self.conn.commit()
            return station
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def delete_station(self, uuid):
        delete_query = """
            delete FROM station where id=%s
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(delete_query, (uuid,))
            self.conn.commit()
            return
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    #Task Methods

    def get_task_uuids(self) -> list[str]:
        select_query = """
            SELECT id FROM task;
            """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query)
                response = cursor.fetchall()
                ids = []
                for row in response:
                    ids.append(row[0])
                return ids
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            return []

    def get_tasks_by_station(self, station_uuid) -> list[Task]:
        if not station_uuid in self.get_station_uuids():
            raise HTTPException(status_code=404, detail="Station not found")

        tasks: list[Task] = []
        select_query="""
            select id, label, codeplain
            From task
            WHERE station_id=%s
        """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query, (station_uuid, ))
                response = cursor.fetchall()
                for row in response:
                    task = Task(station_uuid=station_uuid)
                    task.uuid=row[0]
                    task.label=row[1]
                    task.code=row[2]
                    task.station_uuid=station_uuid
                    tasks.append(task)
            return tasks
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def get_task(self, uuid) -> Task:
        if uuid not in self.get_task_uuids():
            raise HTTPException(status_code=404, detail="Task not found")

        select_query = """
        select label, codeplain, station_id 
        From task
        where id = %s
        """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query, (uuid, ))
            response = cursor.fetchone()

            task = Task(uuid=uuid,
                        label=response[0],
                        code=response[1],
                        station_uuid=response[2])
            return task
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def create_task(self, task):
        if not task.station_uuid in self.get_station_uuids():
            raise HTTPException(status_code=404, detail="Station not found")

        insert_query = """
                INSERT INTO task (label, codeplain, station_id) VALUES (%s, %s, %s) RETURNING id;
                """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(insert_query, (task.label, task.code, task.station_uuid))
                self.conn.commit()
                return cursor.fetchone()[0]
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def get_all_tasks(self):
        select_query = """
        SELECT id, label, codeplain, station_id FROM task
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(select_query)
                response = cursor.fetchall()
                tasks = []
                for row in response:
                    task = Task(
                        uuid=row[0],
                        label=row[1],
                        code=row[2],
                        station_uuid=row[3]
                    )
                    tasks.append(task)
                print(tasks)
                return tasks
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def delete_task(self, uuid):
        delete_query = """
            delete FROM task where id=%s
        """
        try:
            with self.conn.cursor() as cursor:
                cursor.execute(delete_query, (uuid,))
            self.conn.commit()
            return
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

    def update_task(self, task):
        if not task.uuid in self.get_task_uuids():
            raise HTTPException(status_code=404, detail="Task not found")
        if not task.station_uuid in self.get_station_uuids():
            raise HTTPException(status_code=404, detail="New Station not found")

        update_query = """
        update task
        set label = %s, codeplain = %s, station_id = %s
        where id = %s
        """

        try:
            with self.conn.cursor() as cursor:
                cursor.execute(update_query, (task.label, task.code, task.station_uuid, task.uuid,))
            self.conn.commit()
            return task
        except (Exception, psycopg2.DatabaseError) as error:
            print(error)
            raise HTTPException(status_code=500)

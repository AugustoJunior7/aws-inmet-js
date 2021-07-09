CREATE OR REPLACE STREAM "DESTINATION_SQL_STREAM" (
    "name" varchar(255), 
    "temperature_max" REAL,
    "temperature_min" REAL,
    "humidity_max" INTEGER,
    "humidity_min" INTEGER,
    "rain" REAL,
    "measurement_date" varchar(255)
);


CREATE OR REPLACE PUMP "Output_Pump" AS INSERT INTO "DESTINATION_SQL_STREAM" SELECT STREAM 
    "name",
    "temperature_max",
    "temperature_min",
    "humidity_max",
    "humidity_min",
    "rain",
    "measurement_date"
    FROM "SOURCE_SQL_STREAM_001";

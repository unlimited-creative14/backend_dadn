CREATE TABLE temp_history (
    devid int,
    recv_time datetime,
    temp_value float
);

CREATE TABLE qtyt (
    id int,
    warning_level int,
    temp_from float,
    temp_to float,
    time_from time
);

CREATE TABLE users(
    id int,CREATE TABLE temp_history (
        devid int,
        recv_time datetime,
        temp_value float
    );
    
    CREATE TABLE qtyt (
        id int,
        warning_level int,
        temp_from float,
        temp_to float,
        time_from time
    );
    
    CREATE TABLE users(
        id int,
        name string
    );
    CREATE TABLE patient(
        id int,
        name string,
        cmnd int,
        address string,
        room_number int,
        phone_number string,
        status string
    );
    -- name string
);
-- CREATE TABLE patient(
--     id int,
--     name string,
--     cmnd int,
--     address string,
--     room_number int,
--     phone_number string,
--     status string
-- );
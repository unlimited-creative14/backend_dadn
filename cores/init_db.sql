-- Data table
CREATE TABLE device (
    dev_id int IDENTITY PRIMARY KEY,
    feed_in varchar(1000),
    feed_out VARCHAR(1000)
);

CREATE TABLE patient (
    pat_id int identity primary KEY,
    first_name VARCHAR(200),
	last_name VARCHAR(200),
	email VARCHAR(200),
	phone VARCHAR(200),
	created_on date,
	modified_on date,
    dev_id int, -- 1:1 to patient
    CONSTRAINT fk_dev_id
    FOREIGN KEY (dev_id) REFERENCES device(dev_id)
);

CREATE TABLE treatment (
    treatment_id int identity PRIMARY KEY,
    treatment_name VARCHAR(40),
    treatment_time datetime,
    treatment_desc varchar(1000),

    pat_id int,
    CONSTRAINT fk_pat_id1 -- M:1 to patient
    FOREIGN KEY (pat_id) REFERENCES patient(pat_id),
);

CREATE TABLE temp_history (
    recv_time datetime,
    temp_value float,
    
    pat_id int,
    CONSTRAINT fk_pat_id2
    FOREIGN KEY (pat_id) REFERENCES patient(pat_id),
    PRIMARY KEY(pat_id, recv_time)
);

CREATE TABLE qtyt (
    warning_level int PRIMARY KEY, -- use this field to check light color
    temp_from float,
    temp_to float,
    duration int
);
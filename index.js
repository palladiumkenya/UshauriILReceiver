const express = require("express");
const moment = require("moment");
const db = require("./dbconnection.js"); //reference of dbconnection.js
//let stringify = require('json-stringify-safe');

var bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(express.json());
//app.use(express.urlencoded());
app.post("/hl7_message", (req, res) => {

    let obj1 = req;
    jsonObj = obj1.body;

    console.log(jsonObj);

    var DATE_TODAY = moment(new Date()).format("YYYY-MM-DD");

    var message_type = jsonObj.MESSAGE_HEADER.MESSAGE_TYPE;
    var SENDING_APPLICATION = jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;
    var MESSAGE_DATETIME = jsonObj.MESSAGE_HEADER.MESSAGE_DATETIME;
    let response;

    //only post KENYAEMR and ADT appointments and clients

    if (SENDING_APPLICATION === 'KENYAEMR' || SENDING_APPLICATION === 'ADT') {

        if (message_type == "ADT^A04") {            
            var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
            var CCC_NUMBER;
            var FIRST_NAME;
            var MIDDLE_NAME;
            var LAST_NAME;
            var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
            var SEX;
            var PHONE_NUMBER;
            var MARITAL_STATUS;
            var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.SENDING_APPLICATION;
            var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
            var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
            var SENDING_FACILITY;
            var GROUP_ID;

            var result = get_json(jsonObj);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;
                var value = result[i].value;

                if (key == "FIRST_NAME") {
                    FIRST_NAME = result[i].value;
                } else if (key == "MIDDLE_NAME") {
                    MIDDLE_NAME = result[i].value;
                } else if (key == "LAST_NAME") {
                    LAST_NAME = result[i].value;
                } else if (key == "DATE_OF_BIRTH") {
                    var DoB = DATE_OF_BIRTH;

                    var year = DoB.substring(0, 4);
                    var month = DoB.substring(4, 6);
                    var day = DoB.substring(6, 8);

                    var today = DATE_TODAY;

                    var new_date = year + "-" + month + "-" + day;
                    var date_diff = moment(today).diff(
                        moment(new_date).format("YYYY-MM-DD"),
                        "days"
                    );

                    if (date_diff >= 5475 && date_diff <= 6935) {
                        GROUP_ID = "2";
                    }
                    if (date_diff >= 7300) {
                        GROUP_ID = "1";
                    }
                    if (date_diff <= 5110) {
                        GROUP_ID = "6";
                    }
                } else if (key == "SEX") {
                    if (result[i].value == "F") {
                        SEX = "1";
                    } else {
                        SEX = "2";
                    }
                } else if (key == "PHONE_NUMBER") {
                    PHONE_NUMBER = result[i].value;
                } else if (key == "MARITAL_STATUS") {
                    if (result[i].value === "") {
                        MARITAL_STATUS = "1";
                    }
                    if (result[i].value == "D") {
                        MARITAL_STATUS = "3";
                    } else if (result[i].value == "M") {
                        MARITAL_STATUS = "2";
                    } else if (result[i].value == "S") {
                        MARITAL_STATUS = "1";
                    } else if (result[i].value == "W") {
                        MARITAL_STATUS = "4";
                    } else if (result[i].value == "C") {
                        MARITAL_STATUS = "5";
                    }
                }
                if (key == "SENDING_FACILITY") {
                    SENDING_FACILITY = result[i].value;
                }
                if (key == "ID") {
                    if (result[i + 1].value == "CCC_NUMBER") {
                        CCC_NUMBER = result[i].value;
                    }
                }
            }

            var enroll_year = ENROLLMENT_DATE.substring(0, 4);
            var enroll_month = ENROLLMENT_DATE.substring(4, 6);
            var enroll_day = ENROLLMENT_DATE.substring(6, 8);
            var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;

            if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                response = `Invalid CCC Number: ${CCC_NUMBER}`;
                console.log(response);
                return;
            }

            db.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                    return;
                } else {

                    var gateway_sql =
                        "Insert into tbl_client (f_name,m_name,l_name,dob,clinic_number,mfl_code,gender,marital,phone_no,GODS_NUMBER,group_id, SENDING_APPLICATION, PATIENT_SOURCE, enrollment_date, client_type) VALUES ('" +
                        FIRST_NAME +
                        "', '" +
                        MIDDLE_NAME +
                        "','" +
                        LAST_NAME +
                        "','" +
                        new_date +
                        "','" +
                        CCC_NUMBER +
                        "','" +
                        SENDING_FACILITY +
                        "','" +
                        SEX +
                        "','" +
                        MARITAL_STATUS +
                        "','" +
                        PHONE_NUMBER +
                        "','" +
                        GODS_NUMBER +
                        "','" +
                        parseInt(GROUP_ID) +
                        "','" +
                        SENDING_APPLICATION +
                        "','" +
                        PATIENT_SOURCE +
                        "','" +
                        new_enroll_date +
                        "','" +
                        PATIENT_TYPE +
                        "')";

                    // Use the connection
                    connection.query(gateway_sql, function(error, results, fields) {
                        // And done with the connection.
                        if (error) {

                            console.log(error);

                        } else {

                            console.log(results);
                            connection.release();

                        }
                        // Don't use the connection here, it has been returned to the pool.
                    });
                }
            });
        } else if (message_type == "ADT^A08") {

            var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
            var CCC_NUMBER;
            var FIRST_NAME;
            var MIDDLE_NAME;
            var LAST_NAME;
            var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
            var SEX;
            var PHONE_NUMBER;
            var MARITAL_STATUS;
            var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
            var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
            var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
            var SENDING_FACILITY;
            var GROUP_ID;
            var FIRST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
            var LAST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
            var MIDDLE_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
            var TOD_DATE = moment().format("YYYY-MM-DD");

            var result = get_json(jsonObj);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;                
                var value = result[i].value;

                if (key == "FIRST_NAME") {
                    // FIRST_NAME = result[20].value;
                } else if (key == "MIDDLE_NAME") {
                    // MIDDLE_NAME = result[21].value;
                } else if (key == "LAST_NAME") {
                    // LAST_NAME = result[22].value;
                } else if (key == "DATE_OF_BIRTH") {
                    var DoB = DATE_OF_BIRTH;

                    var year = DoB.substring(0, 4);
                    var month = DoB.substring(4, 6);
                    var day = DoB.substring(6, 8);

                    var today = DATE_TODAY;

                    var new_date = year + "-" + month + "-" + day;
                    var date_diff = moment(today).diff(
                        moment(new_date).format("YYYY-MM-DD"),
                        "days"
                    );

                    if (date_diff >= 5475 && date_diff <= 6935) {
                        GROUP_ID = "2";
                    }
                    if (date_diff >= 7300) {
                        GROUP_ID = "1";
                    }
                    if (date_diff <= 5110) {
                        GROUP_ID = "6";
                    }
                } else if (key == "SEX") {
                    if (result[i].value == "F") {
                        SEX = "1";
                    } else {
                        SEX = "2";
                    }
                } else if (key == "PHONE_NUMBER") {
                    PHONE_NUMBER = result[i].value;
                } else if (key == "MARITAL_STATUS") {
                    if (result[i].value === "") {
                        // do stuff
                        MARITAL_STATUS = "1";
                    }
                    if (result[i].value == "D") {
                        MARITAL_STATUS = "3";
                    } else if (result[i].value == "M") {
                        MARITAL_STATUS = "2";
                    } else if (result[i].value == "S") {
                        MARITAL_STATUS = "1";
                    } else if (result[i].value == "W") {
                        MARITAL_STATUS = "4";
                    } else if (result[i].value == "C") {
                        MARITAL_STATUS = "5";
                    }
                }
                if (key == "SENDING_FACILITY") {
                    SENDING_FACILITY = result[i].value;
                }
                if (key == "ID") {
                    if (result[i + 1].value == "CCC_NUMBER") {
                        CCC_NUMBER = result[i].value;
                    }
                }
            }

            var enroll_year = ENROLLMENT_DATE.substring(0, 4);
            var enroll_month = ENROLLMENT_DATE.substring(4, 6);
            var enroll_day = ENROLLMENT_DATE.substring(6, 8);
            var new_enroll_date = enroll_year + "-" + enroll_month + "-" + enroll_day;

            if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                console.log("Invalid CCC NUMBER");
                return;
            }

            db.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                } else {

                    console.log("NDANI");

                    var update_sql =
                        "update tbl_client SET f_name='" +
                        FIRST_NAME +
                        "',m_name='" +
                        MIDDLE_NAME +
                        "',l_name='" +
                        LAST_NAME +
                        "',dob='" +
                        DATE_OF_BIRTH +
                        "',mfl_code='" +
                        SENDING_FACILITY +
                        "',gender='" +
                        SEX +
                        "',marital='" +
                        MARITAL_STATUS +
                        "',phone_no='" +
                        PHONE_NUMBER +
                        "',group_id='" +
                        GROUP_ID +
                        "',partner_id='(SELECT  partner_id FROM tbl_partner_facility WHERE mfl_code ="+ SENDING_FACILITY 
                        +")' WHERE clinic_number='" +
                        CCC_NUMBER +
                        "' WHERE updated_at='" +
                         TOD_DATE+
                        "'";

                    // Use the connection
                    connection.query(update_sql, function(error, results, fields) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(results);
                            // And done with the connection.
                            connection.release();
                        }

                        // Don't use the connection here, it has been returned to the pool.
                    });
                }
            });
        } else if (message_type == "SIU^S12") {
            var GODS_NUMBER = jsonObj.PATIENT_IDENTIFICATION.EXTERNAL_PATIENT_ID.ID;
            var SENDING_FACILITY;

            var CCC_NUMBER;
            var APPOINTMENT_REASON;
            var APPOINTMENT_TYPE;
            var APPOINTMENT_DATE;
            var APPOINTMENT_PLACING_ENTITY;
            var APPOINTMENT_LOCATION;
            var ACTION_CODE;
            var APPOINTMENT_NOTE;
            var APPOINTMENT_HONORED;

            var result = get_json(jsonObj);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;
                var key_value = result[i].value;

                if (key == "SENDING_FACILITY") {
                    SENDING_FACILITY = result[i].value;
                } else if (key == "GODS_NUMBER") {
                    //GODS_NUMBER = result[20].value;
                } else if (key == "APPOINTMENT_REASON") {
                    APPOINTMENT_REASON = result[i].value;
                } else if (key == "APPOINTMENT_TYPE") {
                    APPOINTMENT_TYPE = result[i].value;
                } else if (key == "APPOINTMENT_LOCATION") {
                    APPOINTMENT_LOCATION = result[i].value;
                } else if (key == "APPINTMENT_HONORED") {
                    APPINTMENT_HONORED = result[i].value;
                } else if (key == "APPOINTMENT_NOTE") {
                    APPOINTMENT_NOTE = result[i].value;
                } else if (key == "ACTION_CODE") {
                    ACTION_CODE = result[i].value;
                } else if (key == "APPOINTMENT_PLACING_ENTITY") {
                    APPOINTMENT_PLACING_ENTITY = result[i].value;
                } else if (key == "APPOINTMENT_DATE") {
                    APPOINTMENT_DATE = result[i].value;
                    APPOINTMENT_DATE = APPOINTMENT_DATE;

                    var year = APPOINTMENT_DATE.substring(0, 4);
                    var month = APPOINTMENT_DATE.substring(4, 6);
                    var day = APPOINTMENT_DATE.substring(6, 8);

                    var app_date = year + "-" + month + "-" + day;

                    var current_date = moment(new Date());
                    var today = current_date.format("YYYY-MM-DD");

                    var BirthDate = moment(app_date);
                    APPOINTMENT_DATE = BirthDate.format("YYYY-MM-DD");
                }
                
                if (key == "ID") {
                    if (result[i + 1].value == "CCC_NUMBER") {
                        CCC_NUMBER = result[i].value;
                    }
               }
            }

            if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                console.log("Invalid CCC NUMBER");
            }

            if (!APPOINTMENT_TYPE) {
                APPOINTMENT_TYPE = 2;
            }
            
            db.getConnection(function(err, connection) {
                if (err) {
                    console.log(err)
                } else {

                    var get_client_sql =
                        "Select * from tbl_client where clinic_number='" +
                        CCC_NUMBER +
                        "'  LIMIT 1";


                    if (APPOINTMENT_LOCATION == "PHARMACY" || APPOINTMENT_REASON == "REGIMEN REFILL") {
                        APPOINTMENT_TYPE = 1;
                    } else {
                        APPOINTMENT_TYPE = 2;
                    }

                    // Use the connection
                    connection.query(get_client_sql, function(error, results, fields) {
                        // And done with the connection.
                        console.log(error, results.length)
                        // Handle error after the release.
                        if (error) {
                            //throw error;
                            console.log(error)
                        } else {
                        
                            for (var res in results) {
                                var client_id = results[res].id;
                                var APP_STATUS = "Booked";
                                var ACTIVE_APP = "1";
                                var SENDING_APPLICATION =
                                    jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;
                                if (ACTION_CODE == "A") {
                                    //Add new Appointment

                                        var appointment_sql =
                                            "Insert into tbl_appointment (client_id,appntmnt_date,app_type_1,APPOINTMENT_REASON,app_status,db_source,active_app,APPOINTMENT_LOCATION,reason) VALUES ('" +
                                            client_id +
                                            "', '" +
                                            APPOINTMENT_DATE +
                                            "','" +
                                            APPOINTMENT_TYPE +
                                            "','" +
                                            APPOINTMENT_REASON +
                                            "','" +
                                            APP_STATUS +
                                            "','" +
                                            SENDING_APPLICATION +
                                            "','" +
                                            ACTIVE_APP +
                                            "','" +
                                            APPOINTMENT_LOCATION +
                                            "','" +
                                            APPOINTMENT_NOTE +
                                            "')";
                                    }

                            if (ACTION_CODE == "D") {
                                //Delete an Appointment
                            }
                            if (ACTION_CODE == "U") {
                                //Update an Appointment
                                var appointment_sql =
                                    "Update  tbl_appointment SET appntmnt_date='" +
                                    APPOINTMENT_DATE +
                                    "' , app_type_1='" +
                                    APPOINTMENT_TYPE +
                                    "',reason='" +
                                    APPOINTMENT_NOTE +
                                    "',expln_app='" +
                                    APPOINTMENT_REASON +
                                    "'  (client_id,appntmnt_date,app_type_1,APPOINTMENT_REASON,app_status,db_source,active_app,reason) VALUES ('" +
                                    client_id +
                                    "', '" +
                                    APPOINTMENT_DATE +
                                    "','" +
                                    APPOINTMENT_TYPE +
                                    "','" +
                                    APPOINTMENT_REASON +
                                    "','" +
                                    APP_STATUS +
                                    "','" +
                                    SENDING_APPLICATION +
                                    "','" +
                                    ACTIVE_APP +
                                    "','" +
                                    APPOINTMENT_NOTE +
                                    "')";
                            }

                            // Use the connection
                            console.log(appointment_sql);
                            connection.query(appointment_sql, function(
                                error,
                                results,
                                fields
                            ) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log(results);
                                }
                                // And done with the connection.
                                connection.release();

                                // Don't use the connection here, it has been returned to the pool.
                            });
                        }
                        } 

                        // Don't use the connection here, it has been returned to the pool.
                    });
                }
            });
        }

        console.log(true);
        res.send(true);

    } else {

        console.log("IQCare Message, skip")
    }


});

app.listen(1440, () => {
    console.log("Ushauri IL listening on port 1440");
});

//convert json object to key value pairs
function get_json(jsonObj) {
    var output = [];

    for (var x in jsonObj) {
        if (typeof jsonObj[x] === "object") {
            output = output.concat(get_json(jsonObj[x]));
        } else {
            output.push({
                key: x,
                value: jsonObj[x],
            });
        }
    }

    return output;
}


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
            var FIRST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
            var MIDDLE_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
            var LAST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
            var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
            var SEX;
            var PHONE_NUMBER;
            var MARITAL_STATUS;
            var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.SENDING_APPLICATION;
            var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
            var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
            var SENDING_FACILITY;
            var GROUP_ID;
            var COUNTY = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.COUNTY;
            var SUB_COUNTY = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.SUB_COUNTY;
            var WARD = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.WARD;
            var VILLAGE = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.VILLAGE;

            var result = get_json(jsonObj);

            console.log(result);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;
                var value = result[i].value;
                
                if (key == "DATE_OF_BIRTH") {
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
                    } else if (result[i].value == "1") {
                        MARITAL_STATUS = "1";
                    } else if (result[i].value == "2") {
                        MARITAL_STATUS = "2";
                    } else if (result[i].value == "3") {
                        MARITAL_STATUS = "3";
                    } else if (result[i].value == "4") {
                        MARITAL_STATUS = "4";
                    } else if (result[i].value == "5") {
                        MARITAL_STATUS = "5";
                    } else {
                        MARITAL_STATUS = "1";
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
                console.log("ndani 2");

            db.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                    return;
                } else {
                    var gateway_sql =
                        "Insert into tbl_client (f_name,m_name,l_name,dob,clinic_number,mfl_code,gender,marital,phone_no,GODS_NUMBER,group_id, SENDING_APPLICATION, PATIENT_SOURCE, enrollment_date, client_type, locator_county, locator_sub_county, locator_ward, locator_village, partner_id) VALUES ('" +
                        FIRST_NAME +
                        "', '" +MIDDLE_NAME +
                        "','" +LAST_NAME +
                        "','" +new_date +
                        "','" +CCC_NUMBER +
                        "','" +SENDING_FACILITY +
                        "','" +SEX +
                        "','" +MARITAL_STATUS +
                        "','" +PHONE_NUMBER +
                        "','" +GODS_NUMBER +
                        "','" +parseInt(GROUP_ID) +
                        "','" +SENDING_APPLICATION +
                        "','" +PATIENT_SOURCE +
                        "','" +new_enroll_date +
                        "','" +PATIENT_TYPE +
                        "','" +COUNTY +
                        "','" +SUB_COUNTY +
                        "','" +WARD +
                        "','" +VILLAGE +
                        "',(SELECT  partner_id FROM tbl_partner_facility WHERE mfl_code ='"+ SENDING_FACILITY +"'))";

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
            var FIRST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.FIRST_NAME;
            var MIDDLE_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.MIDDLE_NAME;
            var LAST_NAME = jsonObj.PATIENT_IDENTIFICATION.PATIENT_NAME.LAST_NAME;
            var DATE_OF_BIRTH = jsonObj.PATIENT_IDENTIFICATION.DATE_OF_BIRTH;
            var SEX;
            var PHONE_NUMBER;
            var MARITAL_STATUS;
            var PATIENT_SOURCE = jsonObj.PATIENT_VISIT.PATIENT_SOURCE;
            var ENROLLMENT_DATE = jsonObj.PATIENT_VISIT.HIV_CARE_ENROLLMENT_DATE;
            var PATIENT_TYPE = jsonObj.PATIENT_VISIT.PATIENT_TYPE;
            var SENDING_FACILITY;
            var GROUP_ID;
            var COUNTY = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.COUNTY;
            var SUB_COUNTY = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.SUB_COUNTY;
            var WARD = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.WARD;
            var VILLAGE = jsonObj.PATIENT_IDENTIFICATION.PATIENT_ADDRESS.PHYSICAL_ADDRESS.VILLAGE;
            var DEATH_DATE = jsonObj.PATIENT_IDENTIFICATION.DEATH_DATE;
            var DEATH_INDICATOR = jsonObj.PATIENT_IDENTIFICATION.DEATH_INDICATOR;
            var TOD_DATE = moment().format("YYYY-MM-DD");

            var result = get_json(jsonObj);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;                
                var value = result[i].value;
                
                if (key == "DATE_OF_BIRTH") {
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
                    } else if (result[i].value == "1") {
                        MARITAL_STATUS = "1";
                    } else if (result[i].value == "2") {
                        MARITAL_STATUS = "2";
                    } else if (result[i].value == "3") {
                        MARITAL_STATUS = "3";
                    } else if (result[i].value == "4") {
                        MARITAL_STATUS = "4";
                    } else if (result[i].value == "5") {
                        MARITAL_STATUS = "5";
                    } else {
                        MARITAL_STATUS = "1";
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

            var death_year = DEATH_DATE.substring(0, 4);
            var death_month = DEATH_DATE.substring(4, 6);
            var death_day = DEATH_DATE.substring(6, 8);
            var new_death_date = death_year + "-" + death_month + "-" + death_day;

            if (CCC_NUMBER.length != 10 || isNaN(CCC_NUMBER)) {
                console.log("Invalid CCC NUMBER");
                return;
            }

            if (DEATH_DATE !== "" && DEATH_INDICATOR === "Y") {
                DEATH_INDICATOR = "Deceased";
            } else if (DEATH_INDICATOR === "N") {
                DEATH_INDICATOR = "Active";
            }

            db.getConnection(function(err, connection) {
                if (err) {
                    console.log(err);
                } else {

                    var update_sql =
                        "update tbl_client SET f_name='" +
                        FIRST_NAME +
                        "',m_name='" +MIDDLE_NAME +
                        "',l_name='" +LAST_NAME +
                        "',dob='" +DATE_OF_BIRTH +
                        "',mfl_code='" +SENDING_FACILITY +
                        "',gender='" +SEX +
                        "',marital='" +MARITAL_STATUS +
                        "',phone_no='" +PHONE_NUMBER +
                        "',group_id='" +GROUP_ID +
                        "',client_type='" +PATIENT_TYPE +
                        "',locator_county='" +COUNTY +
                        "',locator_sub_county='" +SUB_COUNTY + 
                        "',locator_ward='" +WARD +
                        "',locator_village='" +VILLAGE + 
                        "',date_deceased='" +new_death_date + 
                        "',status='" +DEATH_INDICATOR + 
                        "',partner_id=(SELECT  partner_id FROM tbl_partner_facility WHERE mfl_code =' "+ SENDING_FACILITY 
                        +"') WHERE clinic_number='" +
                        CCC_NUMBER +
                        "' ";

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
            var PLACER_APPOINTMENT_NUMBER; 

            var APPOINTMENT_LOCATION;
            //var ACTION_CODE;
            var APPOINTMENT_NOTE;
            var APPOINTMENT_HONORED;

            var result = get_json(jsonObj);

            for (var i = 0; i < result.length; i++) {
                var key = result[i].key;
                var key_value = result[i].value;


                if (key == "SENDING_FACILITY") {
                    SENDING_FACILITY = result[i].value;
                }else if(key == "NUMBER") {
                    PLACER_APPOINTMENT_NUMBER = result[i].value;
                }else if (key == "GODS_NUMBER") {
                    //GODS_NUMBER = result[20].value;
                } else if (key == "APPOINTMENT_REASON") {
                    APPOINTMENT_REASON = result[i].value;
                } else if (key == "APPOINTMENT_TYPE") {
                    APPOINTMENT_TYPE = result[i].value;
                } else if (key == "APPOINTMENT_LOCATION") {
                    APPOINTMENT_LOCATION = result[i].value;
                } else if (key == "APPINTMENT_HONORED") {
                    APPOINTMENT_HONORED = result[i].value;
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
                APPOINTMENT_TYPE = 1;
            }
            
            db.getConnection(function(err, connection) {
                if (err) {
                    console.log("im here",err)
                } else {

                    var get_client_sql =
                        "Select * from tbl_client where clinic_number='" +
                        CCC_NUMBER +
                        "'  LIMIT 1";

                    // search for placer appointment number (ENTITY NUMBER in db)    
                    var get_placer_appointment_number =
                        "Select * from tbl_appointment where ENTITY_NUMBER='" +
                        PLACER_APPOINTMENT_NUMBER +
                        "' ";
                    
                    console.log(get_placer_appointment_number);    

                    if (APPOINTMENT_LOCATION == "PHARMACY" || APPOINTMENT_REASON == "REGIMEN REFILL") {
                        APPOINTMENT_TYPE = 1;
                    } else {
                        APPOINTMENT_TYPE = 2;
                    }

                    // Use the connection
                    connection.query(get_client_sql, function(error, results, fields) {
                        // Handle error after the release.
                        if (error) {
                            //throw error;
                            console.log("im here 0", error, results.length)
                        } else {

                            connection.query(get_placer_appointment_number, function(error, results, fields) {

                                if(error) {
                                    console.log("im here 1", error)
                                } else if(results.length == 0) {

                                    console.log(results)
                                    
                                    //new appointment
                                    for (var res in results) {
                                        var client_id = results[res].id;
                                        var APP_STATUS = "Booked";
                                        var ACTIVE_APP = "1";
                                        var SENDING_APPLICATION = jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;
        
                                            //Add new Appointment
        
                                            var appointment_sql =
                                            "Insert into tbl_appointment (client_id,appntmnt_date,app_type_1,APPOINTMENT_REASON,app_status,db_source,active_app,APPOINTMENT_LOCATION,reason, ENTITY_NUMBER) VALUES ('" +
                                            client_id +
                                            "', '" +APPOINTMENT_DATE +
                                            "','" +APPOINTMENT_TYPE +
                                            "','" +APPOINTMENT_REASON +
                                            "','" +APP_STATUS +
                                            "','" +SENDING_APPLICATION +
                                            "','" +ACTIVE_APP +
                                            "','" +APPOINTMENT_LOCATION +
                                            "','" +APPOINTMENT_NOTE +
                                            "','" +PLACER_APPOINTMENT_NUMBER +
                                            "')";
        
                                        // Use the connection
                                        console.log(appointment_sql);
                                        connection.query(appointment_sql, function(
                                            error,
                                            results,
                                            fields
                                        ) {
                                            if (error) {
                                                console.log("im here 2", error);
                                            } else {
                                                console.log(results);
                                            }
                                            // And done with the connection.
                                            connection.release();
        
                                            // Don't use the connection here, it has been returned to the pool.
                                        });
                                    }

                                } else if(results.length == 1) {

                                    //update appointment
                                    for (var res in results) {
                                        var client_id = results[res].id;
                                        var APP_STATUS = "Booked";
                                        var ACTIVE_APP = "1";
                                        var SENDING_APPLICATION = jsonObj.MESSAGE_HEADER.SENDING_APPLICATION;

                                        //Update an Appointment where client id and appointment placer number match
                                        var appointment_sql =
                                        "Update  tbl_appointment SET appntmnt_date='" +
                                        APPOINTMENT_DATE +
                                        "' , app_type_1='" +APPOINTMENT_TYPE +
                                        "',reason='" +APPOINTMENT_NOTE +
                                        "',expln_app='" +APPOINTMENT_REASON +
                                        "',client_id ='"+client_id +
                                        "' ,APPOINTMENT_LOCATION ='"+APPOINTMENT_LOCATION +
                                        "',APPOINTMENT_REASON='"+APPOINTMENT_REASON+
                                        "',app_status='"+APP_STATUS+
                                        "',db_source='"+SENDING_APPLICATION+
                                        "',active_app='"+ACTIVE_APP+
                                        "',reason='"+APPOINTMENT_NOTE+
                                        "' WHERE client_id = '"+client_id+"' AND ENTITY_NUMBER = '"+PLACER_APPOINTMENT_NUMBER+"' ";

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
                                                let update_app_status = "UPDATE tbl_appointment set active_app = 0 where client_id = '"+client_id+"' AND ENTITY_NUMBER <> '"+PLACER_APPOINTMENT_NUMBER+"'";
                                                
                                                connection.query(update_app_status, function(err_up, res_up, fields_up) {
                                                    if (error) {
                                                        console.log(err_up);
                                                    } else {
                                                        console.log(res_up);
                                                    }
                                                    connection.release();
                                                });
                                            }
                                            // And done with the connection.
                                            connection.release();
        
                                            // Don't use the connection here, it has been returned to the pool.
                                        });
                                    }

                                }
                                
                            })
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

app.post("/hl7_sync_client", (req, res) => {

    var client = req.body;

    console.log(client);

    db.getConnection(function(err, connection) {
        if (err) { console.log("im here",err);
        } else { 
            
            let partner = connection.query('SELECT partner_id FROM tbl_partner_facility WHERE mfl_code', client.mfl_code, function (err,data) {
                if(err) { console.log(err)}
            });

            let partner_id = partner[0];

            let cl = {
                f_name: client.f_name,
                m_name: client.m_name,
                l_name: client.l_name,
                dob: client.dob,
                clinic_number: client.clinic_number,
                mfl_code: client.mfl_code,
                gender: client.gender,
                marital: client.marital,
                phone_no: client.phone_no,
                GODS_NUMBER: client.GODS_NUMBER,
                group_id: client.group_id,
                SENDING_APPLICATION: client.SENDING_APPLICATION,
                PATIENT_SOURCE: client.PATIENT_SOURCE,
                db_source: client.db_source,
                enrollment_date: client.enrollment_date,
                client_type: client.client_type,
                file_no: client.file_no,
                locator_county: client.locator_county,
                locator_sub_county: client.locator_sub_county,
                locator_ward: client.locator_ward,
                locator_village: client.locator_village,
                partner_id: partner_id
            }
    
            //if message code is ADT^A04 add new client else update client
            if(client.message_type === "ADT^A04") {
                connection.query('INSERT INTO tbl_client SET ?', cl, function (err, data) {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        console.log(data);
                        res.send(data)
    
                    }
                });
    
            } else if(client.message_type === "ADT^A08") {
     
                let clinic_number = client.clinic_number;
    
                connection.query('UPDATE tbl_client SET ? WHERE clinic_number = ?', cl, clinic_number, function (err, data) {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        console.log(data);
                        res.send(data);
    
                    }
                });
            }
        
        }


    });    

});

app.post("/hl7_sync_appointment", (req, res) => {

    db.getConnection(function(err, connection) {
        if (err) { console.log("im here",err);
        } else { 

            var appointment = req.body;
            console.log(appointment);


            let client_id = connection.query('SELECT id FROM tbl_client WHERE clinic_number', appointment.CCC_NUMBER, function (err,data) {
                if(err) { console.log(err)}
                console.log(data);
            });

            let placer_number = connection.query('SELECT ENTITY_NUMBER FROM tbl_appointment WHERE ENTITY_NUMBER ', appointment.placer_appointment_number, function (err,data) {
                if(err) { console.log(err)}
                console.log(data);
            })

            let appt = {
                appntmnt_date: appointment.appntmnt_date,
                app_type_1: appointment.app_type_1,
                APPOINTMENT_REASON: appointment.APPOINTMENT_REASON,
                app_status: appointment.app_status,
                active_app: appointment.active_app,
                APPOINTMENT_LOCATION: appointment.APPOINTMENT_LOCATION,
                db_source: appointment.db_source,
                reason: appointment.reason,
                ENTITY_NUMBER: appointment.placer_appointment_number,
                client_id: client_id
            }
            
            //update if placer number already exsists
            if(placer_number.length == 0) {

                console.log("in in empty placer")

                connection.query('INSERT INTO tbl_appointment SET ?', appt, function (err, data) {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        console.log(data);
                        res.send(data);

                    }
                });

            } else {

                console.log("in in present placer")

                //update latest appointment where client_id and placer number match

                connection.query('UPDATE tbl_appointment SET ? WHERE client_id ? AND ENTITY_NUMBER ? ORDER BY appntmnt_date DESC LIMIT 1 ', appt, client_id, placer_number, function (err, data) {
                    if (err) {
                        return console.error(err.message);
                    } else {
                        console.log(data);
                        res.send(data);

                    }
                });

            }

        }    

    });

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

